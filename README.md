# ⏰ TODO App (Full Stack)

A high-performance, full-stack TODO application built for security and efficiency. This project integrates modern authentication flows, secure payment gateways, and containerized deployment.

---

## 🚀 Live Demo
[https://todo-app-dcf7.onrender.com](https://todo-app-dcf7.onrender.com)

---

## 🔥 Key Features

### 🔐 Advanced Security
*   **Mandatory MFA**: Every account is secured with TOTP-based Multi-Factor Authentication. Setup is required immediately upon registration or first login.
*   **Signup Validation**: Robust client and server-side validation to ensure data integrity.
*   **Google OAuth 2.0**: Seamless social login integration.
*   **Secure Session Handling**: JWT-based authentication with temporary token states for MFA flows.

### 💳 Premium Subscriptions
*   **Razorpay Integration**: Native support for Weekly, Monthly, and Yearly subscription plans.
*   **Unlocked Limits**: Pro users enjoy unlimited task creation and an ad-free interface.

### ⚡ Performance & UX
*   **Real-time Task Management**: Add, edit, delete, and toggle tasks instantly.
*   **Deadline Tracking**: Visual badges for upcoming and overdue tasks.
*   **Glassmorphism UI**: Modern, responsive design with smooth animations.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Glassmorphism), JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose) |
| **Auth/Security** | Passport.js, Speakeasy (TOTP), JWT, BcryptJS |
| **Payments** | Razorpay SDK |
| **DevOps** | Docker, Render |

---

## ⚙️ Setup & Installation

### Local Development
1. **Clone & Install**
   ```bash
   git clone https://github.com/tagore66/TODO-app.git
   cd TODO-app
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file in the root:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   CALLBACK_URL=http://localhost:5000/auth/google/callback
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_secret
   ```

3. **Run**
   ```bash
   node server/server.js
   ```

### Docker Deployment
The app is fully containerized. To run using Docker:
```bash
docker build -t todo-app .
docker run -p 5000:5000 --env-file .env todo-app
```

---

## 📁 Project Structure
```
TODO-app/
│
├── public/          # Glassmorphism UI & Logic
├── server/          # Express API & Auth Routes
├── models/          # Mongoose Schemas (User, Todo)
├── Dockerfile       # Container Configuration
├── .env             # Externalized Secrets
└── README.md
```

---

## 🙌 Author
**Tagore Bharadwaj**  
B.Tech Student @ VIT-AP  

Built as a demonstration of production-grade full-stack features, including secure payment integration and mandatory multi-factor authentication.
