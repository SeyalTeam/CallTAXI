import requests
import json
import time
from datetime import datetime

OVERPASS_URL = "http://overpass-api.de/api/interpreter"

# Tamil Nadu relation ID in OSM is 96905
# We add 3600000000 to get the area ID
QUERY = """
[out:json][timeout:180];
area(id:3600096905)->.searchArea;
(
  node["place"~"village|hamlet"](area.searchArea);
);
out body;
"""

def generate_villages():
    print(f"[{datetime.now()}] Fetching data from Overpass API (this may take a minute)...")
    try:
        response = requests.get(OVERPASS_URL, params={'data': QUERY}, timeout=200)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    nodes = data.get('elements', [])
    print(f"[{datetime.now()}] Received {len(nodes)} locations. Processing...")

    places = []
    for node in nodes:
        tags = node.get('tags', {})
        name = tags.get('name')
        if not name:
            continue

        # Try to find district/county info
        district = tags.get('addr:district') or tags.get('is_in:county') or tags.get('is_in:district') or tags.get('county') or "Tamil Nadu"
        
        # Format similar to current TNLocation type
        place = {
            "district": district,
            "name": name,
            "display_name": f"{name}, {district}, Tamil Nadu, India",
            "lat": str(node.get('lat')),
            "lon": str(node.get('lon')),
            "raw_addr": {
                "village": name,
                "state_district": district,
                "state": "Tamil Nadu",
                "country": "India",
                "country_code": "in"
            }
        }
        # Add postcode if available
        if tags.get('addr:postcode'):
            place["raw_addr"]["postcode"] = tags.get('addr:postcode')

        places.append(place)

    # Sort by name for easier searching
    places.sort(key=lambda x: x['name'])

    output_data = {
        "meta": {
            "generatedAt": datetime.now().isoformat(),
            "count": len(places)
        },
        "places": places
    }

    output_path = "public/tamil_nadu_locations.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"[{datetime.now()}] Successfully saved {len(places)} villages to {output_path}")

if __name__ == "__main__":
    generate_villages()
