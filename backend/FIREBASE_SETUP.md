# Firebase Admin SDK Setup

If you get `UNAUTHENTICATED` when testing Firebase, follow these steps **in order**:

## Step 1: Enable Cloud Firestore API (required)

1. Open: **https://console.cloud.google.com/apis/library/firestore.googleapis.com**
2. Select project: `hackathon-project-591a3`
3. Click **ENABLE**

## Step 2: Create Firestore Database (Native mode)

1. Open [Firebase Console](https://console.firebase.google.com/) → your project
2. **Build** → **Firestore Database** → **Create database**
3. Choose **Start in production mode**
4. Choose **Native mode** (NOT Datastore mode)
5. Pick a region (e.g. `asia-south1` for India)
6. Click **Enable**

## Step 3: Grant Service Account Permissions

1. [Google Cloud IAM](https://console.cloud.google.com/iam-admin/iam)
2. Find `firebase-adminsdk-fbsvc@hackathon-project-591a3.iam.gserviceaccount.com`
3. Click pencil (Edit) → **Add another role** → **Cloud Datastore User**
4. Save

## Step 4: Run diagnostic

```bash
cd backend
node scripts/check-firebase.js
```

## Verify service account file

- Path: `backend/src/config/serviceAccountKey.json`
- Download: Firebase Console → Project Settings → Service Accounts → **Generate new private key**
- Must contain: `type: "service_account"`, `private_key`, `client_email`, `project_id`
