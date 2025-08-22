# MERN Assignment - Agent List Management System

A comprehensive full-stack application built with the MERN stack (MongoDB, Express.js, React with Next.js, and Node.js) for managing agents and distributing contact lists among them efficiently.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Admin Dashboard**: Complete admin interface for managing agents and lists
- **File Upload Processing**: CSV/XLSX file upload with automatic data validation
- **Smart Distribution**: Round-robin algorithm for equal distribution of list items to agents
- **Real-time Statistics**: Dashboard showing agent counts, list statistics, and batch information
- **Responsive Design**: Modern UI built with Tailwind CSS and responsive components
- **Form Validation**: Client and server-side validation using Zod schemas
- **Error Handling**: Comprehensive error handling with user-friendly notifications

## 📁 Project Structure

```
mern-assignment/
├── backend/                 # Express.js backend server
│   ├── config/
│   │   └── db.js           # MongoDB connection configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── agentController.js   # Agent CRUD operations
│   │   └── listController.js    # List upload and management
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication middleware
│   │   └── error.js        # Global error handling
│   ├── models/
│   │   ├── User.js         # User/Admin model
│   │   ├── Agent.js        # Agent model
│   │   └── ListItem.js     # List item model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── agents.js       # Agent management routes
│   │   └── lists.js        # List management routes
│   ├── uploads/            # File upload directory
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server entry point
├── frontend/               # Next.js frontend application
│   ├── public/             # Static assets
│   └── src/
│       ├── app/            # Next.js app router pages
│       │   ├── auth/       # Authentication pages
│       │   ├── dashboard/  # Dashboard and management pages
│       │   ├── globals.css # Global styles
│       │   ├── layout.tsx  # Root layout
│       │   └── page.tsx    # Home page
│       ├── components/     # Reusable React components
│       │   ├── ui/         # UI components
│       │   └── forms/      # Form components
│       ├── contexts/       # React contexts
│       │   └── AuthContext.tsx # Authentication context
│       └── services/       # API service functions
│           └── api.js      # Axios API client
├── .env.example            # Environment variables template
├── package.json            # Root package.json
└── README.md              # This file
```

## 🛠️ Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - Choose one:
  - [MongoDB Community Server](https://www.mongodb.com/try/download/community) (local installation)
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud database)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** (for cloning the repository)

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "mern assignment"
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
copy .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Backend Environment Variables
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-assignment
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Important Notes:**
- Replace `your_super_secret_jwt_key_here` with a strong, unique secret key
- For MongoDB Atlas, use your connection string: `mongodb+srv://username:password@cluster.mongodb.net/mern-assignment`
- Ensure MongoDB is running if using local installation

### 3. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Start the backend development server:

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

**Expected Output:**
```
[nodemon] starting `node server.js`
Server running in development mode on port 5000
MongoDB Connected: <your-mongodb-connection>
```

### 4. Frontend Setup

Open a new terminal, navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

**Expected Output:**
```
▲ Next.js 15.5.0
- Local:        http://localhost:3000
- Environments: .env

✓ Starting...
✓ Ready in 2.1s
```

### 5. Initial Application Setup

1. Open your browser and navigate to `http://localhost:3000`
2. You'll be redirected to the setup page (`/auth/setup`)
3. Create your admin account with:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
4. After setup, you'll be redirected to the dashboard

## 📚 Usage Guide

### Admin Dashboard

After logging in, you'll have access to:

- **Dashboard Overview**: Statistics showing total agents and lists
- **Agent Management**: Create, view, edit, and delete agents
- **List Management**: Upload CSV/XLSX files and view distribution

### Agent Management

1. Navigate to "Agents" from the dashboard
2. Click "Add New Agent" to create agents
3. Required fields: Name, Email, Country Code, Mobile, Password
4. View agent details and assigned list items

### List Upload and Distribution

1. Navigate to "Lists" from the dashboard
2. Click "Upload New List"
3. Select a CSV or XLSX file with required columns:
   - **FirstName** (required)
   - **Phone** (required)
   - **Notes** (required)
4. The system automatically distributes items equally among all agents
5. View batch details and individual assignments

## 🔧 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/setup` | Create initial admin account | No |
| POST | `/api/auth/login` | Login with credentials | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Agent Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/agents` | Get all agents | Yes (Admin) |
| POST | `/api/agents` | Create new agent | Yes (Admin) |
| GET | `/api/agents/:id` | Get specific agent | Yes (Admin) |
| PUT | `/api/agents/:id` | Update agent | Yes (Admin) |
| DELETE | `/api/agents/:id` | Delete agent | Yes (Admin) |

### List Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/lists` | Get all list batches | Yes (Admin) |
| POST | `/api/lists/upload` | Upload new list file | Yes (Admin) |
| GET | `/api/lists/:batch` | Get items by batch ID | Yes (Admin) |
| DELETE | `/api/lists/:batch` | Delete entire batch | Yes (Admin) |

## 🛠️ Technology Stack

### Backend Technologies

- **Express.js** (^4.18.2) - Web application framework
- **MongoDB** with **Mongoose** (^7.5.0) - Database and ODM
- **JWT** (^9.0.2) - Authentication tokens
- **bcryptjs** (^2.4.3) - Password hashing
- **Multer** (^1.4.5) - File upload handling
- **XLSX** (^0.18.5) - Excel file processing
- **CORS** (^2.8.5) - Cross-origin resource sharing
- **dotenv** (^16.3.1) - Environment variable management

### Frontend Technologies

- **Next.js** (15.5.0) - React framework with app router
- **React** (19.1.0) - UI library
- **TypeScript** (^5) - Type safety
- **Tailwind CSS** (^4) - Utility-first CSS framework
- **React Hook Form** (^7.62.0) - Form handling
- **Zod** (^4.0.17) - Schema validation
- **Axios** (^1.11.0) - HTTP client
- **React Toastify** (^11.0.5) - Toast notifications
- **jwt-decode** (^4.0.0) - JWT token decoding

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Backend Issues

**MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running locally or check your Atlas connection string.

**Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change the PORT in your `.env` file or kill the process using port 5000.

**JWT Secret Missing**
```
Error: JWT_SECRET is not defined
```
**Solution:** Add a JWT_SECRET to your `.env` file.

#### Frontend Issues

**API Connection Error**
```
Network Error or CORS issues
```
**Solution:** Ensure backend is running and NEXT_PUBLIC_API_URL is correct in `.env`.

**Build Errors**
```
TypeScript or ESLint errors
```
**Solution:** Run `npm run lint` to identify and fix linting issues.

### Development Commands

#### Backend Commands
```bash
cd backend
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

#### Frontend Commands
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **File Upload Security**: Restricted file types and size limits
- **Environment Variables**: Sensitive data stored in environment variables

## 📈 Performance Considerations

- **Database Indexing**: Unique indexes on email fields
- **File Processing**: Efficient CSV/XLSX parsing with XLSX library
- **Error Handling**: Comprehensive error handling to prevent crashes
- **Memory Management**: Proper cleanup of uploaded files
- **Connection Pooling**: MongoDB connection pooling for better performance

## 🚀 Deployment

### Production Build

1. **Backend Production:**
   ```bash
   cd backend
   npm start
   ```

2. **Frontend Production:**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

### Environment Variables for Production

Update your production `.env` file:
```env
PORT=5000
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
JWT_EXPIRE=30d
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly configured

---

**Happy Coding! 🎉**