# ⏰✌️TODO App (Full Stack)

A simple and clean full-stack TODO application built to manage daily tasks efficiently.
This project demonstrates backend integration, authentication, and real-time task handling.

---

##  Live Demo:

https://todo-app-dcf7.onrender.com

---

##  Features

* Add, edit, and delete tasks
* Mark tasks as completed
* Persistent storage using MongoDB
* Google authentication (OAuth 2.0)
* Clean and responsive UI
* Secure session handling

---

## 🛠️ Tech Stack

**Frontend**

* HTML
* CSS
* JavaScript

**Backend**

* Node.js
* Express.js

**Database**

* MongoDB (Atlas)

**Authentication**

* Google OAuth 2.0

---

## ⚙️ Installation & Setup

1. Clone the repository

```
git clone https://github.com/your-username/TODO-app.git
cd TODO-app
```

2. Install dependencies

```
npm install
```

3. Create a `.env` file in the root directory and add:

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
SESSION_SECRET=your_session_secret
CALLBACK_URL=http://localhost:5000/auth/google/callback
CLIENT_URL=http://localhost:5000
```

4. Run the server

```
node server/server.js
```

5. Open in browser:

```
http://localhost:5000
```

---

## 📁(FOLDERS/files) Project Structure

```
TODO-app/
│
├── public/        # Frontend files
├── server/        # Backend logic
├── .env           # Environment variables (not pushed)
├── package.json
└── README.md
```

---

##  Environment Variables

Make sure you never expose your `.env` file publicly.
Use environment variables for all sensitive data like API keys and database credentials.

---

## Future Improvements

* Add due dates & reminders
* Task categories / tags
* Dark mode
* Mobile app version

---

## 🙌 Author

**Tagore Bharadwaj**
B.Tech Student @ VIT-AP

---

##  Note

This project was built as part of learning full-stack development and deployment, including real-world concepts like authentication, environment configuration, and cloud hosting.

---
