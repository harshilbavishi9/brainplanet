import * as admin from 'firebase-admin';
import * as path from 'path';

export function initFirebase() {
  try {
    const serviceAccountPath = path.join(__dirname, '..', '..', 'firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
    console.log('Firebase initialized successfully');
  } catch (e) {
    console.warn('Firebase initialization skipped/failed (Check firebase-service-account.json):', e.message);
  }
}
