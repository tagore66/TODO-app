# ⏰ TODO App (Full Stack)

A high-performance, full-stack TODO application built for security and efficiency. This project integrates modern authentication flows, secure payment gateways, and containerized deployment.

---

## 🚀 Live Demo
[https://todo-app-1-0o8y.onrender.com](https://todo-app-1-0o8y.onrender.com)

---

## 🔥 Key Features

### 🔐 Advanced Security
*   **Mandatory MFA**: Every account is secured with TOTP-based Multi-Factor Authentication. Setup is required immediately upon registration or first login.
*   **Signup Validation**: Robust client and server-side validation to ensure data integrity.
*   **Google OAuth 2.0**: Seamless social login integration.
*   **ChaCha20 Encryption**: Sensitive data (tasks and MFA secrets) is encrypted at rest using the ChaCha20-Poly1305 algorithm for maximum privacy.
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
| **Auth/Security** | Passport.js, Speakeasy (TOTP), JWT, BcryptJS, ChaCha20-Poly1305 |
| **Payments** | Razorpay SDK |
| **DevOps** | Docker, Kubernetes (Minikube), Nginx (Reverse Proxy), Render |

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
   ENCRYPTION_KEY=your_32_byte_hex_key
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

### Kubernetes (Microservices)
The application can also be deployed as separate microservices (Frontend & Backend) on a Kubernetes cluster:
1. **Apply Configuration**: `kubectl apply -f k8s/config.yaml`
2. **Deploy Backend**: `kubectl apply -f k8s/backend.yaml`
3. **Deploy Frontend**: `kubectl apply -f k8s/frontend.yaml`
4. **Access App**: `minikube service todo-frontend-service`

---

## 📁 Project Structure
```
TODO-app/
│
├── public/          # Frontend static files (HTML, CSS, JS)
├── server/          # Backend API, Routes & Database Logic
├── k8s/             # Kubernetes Manifests (Deployments, Services, ConfigMap)
├── Dockerfile.backend  # Multi-stage build for API service
├── Dockerfile.frontend # Nginx build for frontend service
├── Dockerfile       # Monolithic build for PaaS (Render)
├── nginx.conf       # Nginx configuration for K8s reverse proxy
├── .env             # Local development environment variables
└── README.md
```

---

## 🙌 Author
**Tagore Bharadwaj**  
B.Tech Student @ VIT-AP  

Built as a demonstration of production-grade full-stack features, including secure payment integration and mandatory multi-factor authentication.
