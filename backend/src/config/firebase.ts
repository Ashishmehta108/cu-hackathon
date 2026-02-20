import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
    // Uses Application Default Credentials (ADC) in CI/prod.
    // For local dev, set GOOGLE_APPLICATION_CREDENTIALS env var pointing to
    // your serviceAccountKey.json file, OR pass credentials explicitly below.
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
    } else {
        // Fall back to Application Default Credentials
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
    }
}

export const db = admin.firestore();
export default admin;
