# FindNest — Roommate Finder Web Application (Server)

## 🌐 Live Links
- **Client Website:** [https://b11a10-findnest.web.app/](https://b11a10-findnest.web.app/)
- **Server API:** [https://b11a10-findnest-server.vercel.app/](https://b11a10-findnest-server.vercel.app/)


## 🧪 How to Run Locally

To run the project locally on your machine, follow these steps carefully:

### 🚀 1. Clone & Run the Client

```bash
git clone https://github.com/arifuddincoder/findnest_client.git
cd findnest_client
npm install
npm run dev
```

### 🛠️ 2. Clone & Run the Server

```bash
git clone https://github.com/arifuddincoder/findnest_serverside.git
cd findnest_serverside
npm install
npm run dev
```

✅ **Note:** The client will not function properly unless the server is running.  
So make sure the server is started **before** using the client.

---

### 🔐 3. Setup `.env` Files

Create a `.env` file in both the client and server directories.

For **client**:
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For **server**:
```
PORT=5000
DB_USER=your_mongo_user
DB_PASS=your_mongo_pass
FB_SERVICE_KEY=base64_encoded_service_account_json
```

If there are `.env.example` files, copy them as `.env` and fill in the correct values.

---

Now you're all set!  
- Server should run at `http://localhost:5000`  
- Client should run at `http://localhost:5173`

---

---

## 📁 GitHub Repositories
- **Client:** [FindNest Client](https://github.com/arifuddincoder/findnest_client)
- **Server:** [FindNest Server](https://github.com/arifuddincoder/findnest_serverside)

---

## ⚙️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** Firebase Admin SDK
- **Environment Config:** dotenv
- **Deployment:** Vercel

---

## 📦 Installed Packages

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "firebase-admin": "^13.4.0",
    "mongodb": "^6.16.0"
  }
}
```

---

## 📂 Project Structure

```
b11a10-findnest_server/
├── .vercel/
├── .vscode/
├── node_modules/
├── .env
├── .gitignore
├── b11a10-findnest-firebase-adminsdk-fbsvc-*.json
├── index.js
├── package.json
├── package-lock.json
└── vercel.json
```

---

## 🔐 Environment Variables (.env)

```
DB_USER=yourMongoUser
DB_PASS=yourMongoPass
```

---

## 📡 API Endpoints

### 🟢 Public:
- `GET /api/roommates` — Get all listings
- `GET /api/roommates/available` — Get available listings (limit 6)
- `GET /api/roommates/:id` — Get single listing by ID

### 🔒 Protected (with Firebase Token):
- `GET /api/my-roommates` — Get listings of logged-in user
- `POST /api/roommates` — Create new listing
- `PUT /api/my-roommates/:id` — Update listing (only by owner)
- `DELETE /api/my-roommates/:id` — Delete listing (only by owner)
- `PATCH /api/roommates/:id/like` — Like a listing (not own)

> 🔐 All protected routes require Firebase ID Token in Authorization header:  
> `Authorization: Bearer <token>`

---

## 🛡️ Security Notes

- Only listing owners can update/delete their own posts.
- A user **cannot like their own listing**.
- Liking another listing increments the like count and reveals contact info to the user.

---

## 🚀 Deployment
- **Platform:** Vercel
- Includes custom `vercel.json` for configuration

---

## 👨‍💻 Developer Info
**Md Arif Uddin**  
📧 arifuddincoder@gmail.com  
🎓 Assignment Project for Programming Hero - Assignment 10
