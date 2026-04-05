# Smart User Engagement Dashboard

A full-stack SaaS-style dashboard for managing user engagement, analytics, and activities. Built with React (Vite) on the frontend and Node.js (Express) on the backend.

![Login Page](./screenshot_login.png)
![Dashboard](./screenshot_dashboard.png)

## 🚀 Features

- **User Authentication**: Secure Login & Signup with JWT.
- **Role-Based Access**: Specialized dashboards for Admin and User roles.
- **Real-time Analytics**: Dynamic charts using Recharts.
- **Activity Tracking**: Monitor user actions and engagement.
- **Responsive Design**: Modern UI with Framer Motion and Lucide icons.
- **User Management**: Admin can add, edit, and delete users.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Framer Motion, Lucide-React, Recharts, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, BcryptJS, Nodemailer.
- **Database**: MongoDB.

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/Mizoram196/smart-user-engagement-dashboard.git
cd smart-user-engagement-dashboard
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

## ⚙️ Configuration

Create a `.env` file in both the root directory and the `backend` directory.

### Root `.env` (Frontend)
```env
VITE_API_URL=http://localhost:5000
```

### Backend `.env`
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🏃 Running the Application

### 1. Start the Backend
```bash
cd backend
npm start
```

### 2. Start the Frontend
Open a new terminal in the root folder:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## ✨ Visual Experience

The Smart User Engagement Dashboard is designed with a **premium SaaS aesthetic**:
- **Modern UI**: Clean, white/dark themed interface with glassmorphism elements.
- **Micro-interactions**: Smooth hover effects and page transitions powered by Framer Motion.
- **Data Visualization**: Interactive and colorful charts using Recharts for immediate insights.
- **Responsive Layout**: Works flawlessly on Mobile, Tablet, and Desktop.

## 📖 How to Use

### 1. Getting Started
- **Sign Up**: Create a new account. You will receive a verification email (in development, check your local mail interceptor if configured).
- **Verify**: Click the link in your email to activate your account.
- **Login**: Use your credentials to enter the dashboard.

### 2. Admin Features (Control Center)
- **Home**: View total active users and high-level engagement metrics.
- **User List**: Manage all registered users. You can add new ones or edit/delete existing records.
- **Analytics**: Deep dive into trends and activity logs across the entire platform.

### 3. User Features (Personal Workspace)
- **Personal Stats**: See your own engagement score and recent activities.
- **Activity Log**: Keep track of what you've done on the platform.
- **Settings**: Update your profile information.

## 🌐 Deployment

For detailed instructions on how to deploy this application to production, please refer to the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

Quick Summary:
- **Database**: MongoDB Atlas
- **Backend**: Render / Heroku
- **Frontend**: Vercel / Netlify

## 📄 License
MIT License
