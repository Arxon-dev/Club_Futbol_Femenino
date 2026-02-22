const admin = require('firebase-admin');

// We will initialize this through environment variables or a local JSON file.
// Check if the GOOGLE_APPLICATION_CREDENTIALS path is set or if we pass the raw JSON string.

let isFirebaseInitialized = false;

try {
  // If FIREBASE_SERVICE_ACCOUNT is provided (e.g., in Railway as a stringified JSON), use it
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseInitialized = true;
    console.log('Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT string');
  } 
  // Otherwise, fallback to the standard GOOGLE_APPLICATION_CREDENTIALS file path if provided
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp();
    isFirebaseInitialized = true;
    console.log('Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS');
  }
  else {
    console.warn('⚠️ Firebase Admin NOT initialized. Missing FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

module.exports = {
  admin,
  isFirebaseInitialized
};
