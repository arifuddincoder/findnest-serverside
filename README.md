# FindNest — Roommate Finder Web Application (Server)

## 🌐 Live Links
- **Client Website:** [https://b11a10-findnest.web.app/](https://b11a10-findnest.web.app/)
- **Server API:** [https://b11a10-findnest-server.vercel.app/](https://b11a10-findnest-server.vercel.app/)

---

## 📁 GitHub Repositories
- **Client:** [FindNest Client](https://github.com/arif128551/findnest_client)
- **Server:** [FindNest Server](https://github.com/arif128551/findnest_serverside)

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
📧 xossarif@gmail.com  
🎓 Assignment Project for Programming Hero - Assignment 10