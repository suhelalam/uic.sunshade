# Fix Firebase Storage CORS (localhost uploads)

**If you see:**  
`Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy`  

**Then:** the Storage bucket has no CORS config (or the preflight failed). You must set CORS once with Google Cloud’s `gsutil`. The app cannot fix this from code.

---

## One-time fix (required for image uploads)

1. **Install Google Cloud SDK** (includes `gsutil`):  
   https://cloud.google.com/sdk/docs/install

2. **Sign in and set project:**
   ```bash
   gcloud auth login
   gcloud config set project sunshade-cb8bb
   ```

3. **From your project root** (where `storage-cors.json` lives), run:
   ```bash
   gsutil cors set storage-cors.json gs://sunshade-cb8bb.appspot.com
   ```

4. **Verify** (optional):
   ```bash
   gsutil cors get gs://sunshade-cb8bb.appspot.com
   ```
   You should see your CORS config printed.

5. **Retry** adding an event with a photo from `http://localhost:3000`.

---

## If it still fails

- **Storage rules** – In Firebase Console → **Storage** → **Rules**, allow writes to `events/{userId}/{fileName}` for authenticated users. You can deploy the repo’s rules:
  ```bash
  firebase deploy --only storage
  ```
- **Allow all origins (dev only)** – If you use a different port or the error persists, try:
  ```bash
  gsutil cors set storage-cors-all-origins.json gs://sunshade-cb8bb.appspot.com
  ```
  That file allows any origin; use only for local development.

## Add more origins later

Edit `storage-cors.json`: add your production URL to the `"origin"` array, then run the `gsutil cors set` command again.
