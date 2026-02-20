#!/usr/bin/env node
/**
 * Diagnose Firebase/Firestore connectivity.
 * Run: node scripts/check-firebase.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const path = require('path');
const fs = require('fs');

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(__dirname, '../src/config/serviceAccountKey.json');

console.log('\n--- Firebase diagnostic ---');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID || '(from JSON)');
console.log('Key file:', keyPath);
console.log('Key exists:', fs.existsSync(keyPath));

if (!fs.existsSync(keyPath)) {
    console.log('\n❌ Service account file not found. Add FIREBASE_SERVICE_ACCOUNT_PATH to .env');
    process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
console.log('JSON valid:', !!sa.private_key && !!sa.client_email);
console.log('Project in JSON:', sa.project_id);

process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(keyPath);
process.env.FIRESTORE_PREFER_REST = 'true';

const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();
db.settings({ preferRest: true });

db.collection('complaints').limit(1).get()
    .then((snap) => {
        console.log('\n✅ Firestore connected! Found', snap.size, 'documents.');
        process.exit(0);
    })
    .catch((err) => {
        console.log('\n❌ Firestore connection failed:', err.message);
        if (err.code === 16 || err.message.includes('UNAUTHENTICATED')) {
            console.log('\nFix:');
            console.log('1. Enable Cloud Firestore API:');
            console.log('   https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=' + sa.project_id);
            console.log('2. Create Firestore DB (Native mode): Firebase Console → Firestore Database → Create');
            console.log('3. Ensure service account has "Cloud Datastore User" role in IAM');
        }
        process.exit(1);
    });
