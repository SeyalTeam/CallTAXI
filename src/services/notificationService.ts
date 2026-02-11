import admin from 'firebase-admin'

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      })
      console.log('Firebase Admin initialized successfully')
    } else {
       console.warn('Firebase Admin credentials not found. Notifications will be disabled.')
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
  }
}

export const sendNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: any,
) => {
  if (!admin.apps.length) return

  const message = {
    notification: {
      title,
      body,
    },
    data: data || {},
    tokens: tokens.filter((t) => !!t),
  }

  try {
    const response = await admin.messaging().sendEachForMulticast(message)
    console.log(`Successfully sent ${response.successCount} messages`)
    
    if (response.failureCount > 0) {
      const failedTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx])
        }
      })
      console.log('Failure tokens:', failedTokens)
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}
