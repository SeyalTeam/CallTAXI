import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from pypdf import PdfReader

DATA_PATH = Path("public/tamil_nadu_locations.json")
PDF_DIR = Path("data/tirunelveli_pdfs")
BOUNDARY_PATH = Path("data/geoBoundaries-IND-ADM2_simplified.geojson")

WAIT_MS = 1200

BLOCK_FILES = {
    "Ambasamudram": "ambasamudram.pdf",
    "Cheranmahadevi": "cheranmahadevi.pdf",
    "Kalakadu": "kalakadu.pdf",
    "Manur": "manur.pdf",
    "Nanguneri": "nanguneri.pdf",
    "Palayamkottai": "palayamkottai.pdf",
    "Pappakudi": "pappakudi.pdf",
    "Radhapuram": "radhapuram.pdf",
    "Valliyoor": "valliyoor.pdf",
}

EXPECTED_COUNTS = {
    "Ambasamudram": 13,
    "Cheranmahadevi": 12,
    "Kalakadu": 17,
    "Manur": 43,
    "Nanguneri": 27,
    "Palayamkottai": 30,
    "Pappakudi": 17,
    "Radhapuram": 27,
    "Valliyoor": 18,
}


def normalize_name(val: str) -> str:
    return re.sub(r"\s+", " ", val.strip().lower())


def extract_villages(pdf_path: Path, block_name: str):
    reader = PdfReader(str(pdf_path))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    villages = []
    for line in lines:
        m = re.match(r"^(\d+)\s+(.*)$", line)
        if not m:
            continue
        name = m.group(2).strip()
        for marker in ["List of Village Panchayat", "Panchayat Union", "Panchayat union"]:
            idx = name.find(marker)
            if idx != -1:
                name = name[:idx].strip()
        # remove trailing block name if it was concatenated
        if name.lower().endswith(block_name.lower()):
            name = name[: -len(block_name)].strip()
        name = re.sub(r"\s+", " ", name)
        if name:
            villages.append(name)

    # de-dupe while keeping order
    seen = set()
    result = []
    for v in villages:
        key = normalize_name(v)
        if key in seen:
            continue
        seen.add(key)
        result.append(v)
    return result


def compute_bbox(coords):
    min_x = min_y = float("inf")
    max_x = max_y = float("-inf")

    def walk(arr):
        nonlocal min_x, min_y, max_x, max_y
        if not isinstance(arr, list):
            return
        if len(arr) >= 2 and isinstance(arr[0], (int, float)) and isinstance(arr[1], (int, float)):
            x, y = arr[0], arr[1]
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
            return
        for item in arr:
            walk(item)

    walk(coords)
    return (min_x, min_y, max_x, max_y)


def point_in_ring(point, ring):
    x, y = point
    inside = False
    for i in range(len(ring)):
        j = (i - 1) % len(ring)
        xi, yi = ring[i]
        xj, yj = ring[j]
        intersect = (yi > y) != (yj > y) and x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
        if intersect:
            inside = not inside
    return inside


def point_in_polygon(point, polygon):
    if not polygon:
        return False
    if not point_in_ring(point, polygon[0]):
        return False
    for hole in polygon[1:]:
        if point_in_ring(point, hole):
            return False
    return True


def point_in_geometry(point, geometry):
    if geometry["type"] == "Polygon":
        return point_in_polygon(point, geometry["coordinates"])
    if geometry["type"] == "MultiPolygon":
        return any(point_in_polygon(point, poly) for poly in geometry["coordinates"])
    return False


def load_tirunelveli_geometry():
    if not BOUNDARY_PATH.exists():
        return None
    geo = json.loads(BOUNDARY_PATH.read_text())
    for feature in geo.get("features", []):
        props = feature.get("properties") or {}
        if props.get("shapeName", "").lower() == "tirunelveli":
            bbox = compute_bbox(feature["geometry"]["coordinates"])
            return {"geometry": feature["geometry"], "bbox": bbox}
    return None


def in_tirunelveli(point, geom):
    if not geom:
        return False
    min_x, min_y, max_x, max_y = geom["bbox"]
    x, y = point
    if x < min_x or x > max_x or y < min_y or y > max_y:
        return False
    return point_in_geometry(point, geom["geometry"])


def geocode(name: str):
    queries = [
        f"{name}, Tirunelveli, Tamil Nadu, India",
        f"{name}, Tamil Nadu, India",
    ]
    for q in queries:
        params = urlencode(
            {
                "q": q,
                "format": "jsonv2",
                "addressdetails": 1,
                "limit": 5,
                "countrycodes": "in",
            }
        )
        url = f"https://nominatim.openstreetmap.org/search?{params}"
        req = Request(url, headers={"User-Agent": "KaniTaxi/1.0 (admin@kanitaxi.com)"})
        try:
            with urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if data:
                    return data
        except Exception:
            continue
    return []


def pick_district(addr):
    return (
        addr.get("state_district")
        or addr.get("district")
        or addr.get("county")
        or addr.get("city_district")
        or addr.get("region")
    )


def run():
    if not DATA_PATH.exists():
        raise SystemExit(f"Missing {DATA_PATH}")
    if not PDF_DIR.exists():
        raise SystemExit(f"Missing {PDF_DIR}")

    data = json.loads(DATA_PATH.read_text())
    places = data.get("places") or []

    existing = set()
    for p in places:
        key = (normalize_name(p.get("name", "")), (p.get("district") or "").lower())
        existing.add(key)

    tirunelveli_geom = load_tirunelveli_geometry()

    all_villages = []
    for block, filename in BLOCK_FILES.items():
        pdf_path = PDF_DIR / filename
        villages = extract_villages(pdf_path, block)
        expected = EXPECTED_COUNTS.get(block)
        if expected and len(villages) != expected:
            print(f"Warning: {block} expected {expected}, found {len(villages)}")
        all_villages.extend(villages)

    # de-dupe across blocks
    unique_villages = []
    seen = set()
    for v in all_villages:
        key = normalize_name(v)
        if key in seen:
            continue
        seen.add(key)
        unique_villages.append(v)

    cache = {}
    added = 0
    unresolved = []

    for i, name in enumerate(unique_villages, 1):
        key = (normalize_name(name), "tirunelveli")
        if key in existing:
            continue

        if name in cache:
            results = cache[name]
        else:
            results = geocode(name)
            cache[name] = results
            time.sleep(WAIT_MS / 1000.0)

        if not results:
            unresolved.append(name)
            continue

        chosen = None
        for item in results:
            lat = float(item.get("lat", 0))
            lon = float(item.get("lon", 0))
            addr = item.get("address") or {}
            district = (pick_district(addr) or "").lower()
            if "tirunelveli" in district:
                chosen = item
                break
            if in_tirunelveli((lon, lat), tirunelveli_geom):
                chosen = item
                break

        if not chosen:
            unresolved.append(name)
            continue

        addr = chosen.get("address") or {}
        district = pick_district(addr) or "Tirunelveli"

        entry = {
            "district": district,
            "name": name,
            "display_name": chosen.get("display_name")
            or f"{name}, Tirunelveli, Tamil Nadu, India",
            "lat": str(chosen.get("lat")),
            "lon": str(chosen.get("lon")),
            "raw_addr": addr,
        }

        places.append(entry)
        existing.add(key)
        added += 1

        if i % 25 == 0:
            print(f"Processed {i}/{len(unique_villages)} | added {added}")

    places.sort(key=lambda x: str(x.get("name", "")).lower())
    data["places"] = places
    DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    print(f"Added {added} villages to Tirunelveli.")
    if unresolved:
        print(f"Unresolved ({len(unresolved)}): {', '.join(unresolved)}")


if __name__ == "__main__":
    run()
