import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { config } from '@/lib/config';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;


const firebaseConfig = {
  apiKey: "AIzaSyBEXL6PeI1drRKDEyTB_UC2g9NM1zha9GY",
  authDomain: "hackathon-project-591a3.firebaseapp.com",
  projectId: "hackathon-project-591a3",
  storageBucket: "hackathon-project-591a3.firebasestorage.app",
  messagingSenderId: "901082569113",
  appId: "1:901082569113:web:3dfe8e22097365cd251b08"
};


// Initialize Firebase only if not already initialized
if (!getApps().length && config.firebase.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else if (getApps().length > 0) {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export { app, db, auth, storage };
export type { FirebaseApp, Firestore, Auth, FirebaseStorage };
