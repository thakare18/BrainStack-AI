# 🧠 BrainStack-AI

> An intelligent AI-powered chat application with context-aware conversations using Google Gemini AI and vector embeddings

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)
- [Developer](#-developer)

---

## 🌟 Overview

**BrainStack-AI** is a full-stack, production-ready AI chat application that leverages Google's Gemini 2.0 Flash model to provide intelligent, context-aware conversations. The application features real-time messaging with Socket.io, vector-based semantic search using Pinecone, and a modern React frontend with an intuitive user interface.

### 🎯 What Makes This Project Stand Out?

- **Advanced AI Integration**: Implements Google Gemini AI with custom system instructions for personalized responses
- **Vector Embeddings**: Uses Pinecone for semantic search and context-aware conversations
- **Real-time Communication**: WebSocket implementation for instant message delivery
- **Full Authentication System**: Secure JWT-based authentication with bcrypt password hashing
- **RESTful API Design**: Well-structured backend with MVC architecture
- **Modern Frontend**: Responsive React application with React Router and custom styling
- **Production-Ready**: Complete with error handling, CORS configuration, and environment management

---

## ✨ Key Features

### 🤖 AI-Powered Features
- **Context-Aware Conversations**: Maintains conversation history and context across sessions
- **Intelligent Responses**: Powered by Google Gemini 2.0 Flash model with custom persona (Aurora)
- **Vector Embeddings**: Semantic search capabilities using 768-dimensional embeddings
- **Real-time Streaming**: Instant AI responses via WebSocket connections

### 👤 User Management
- **Secure Authentication**: JWT token-based authentication with HTTP-only cookies
- **User Registration & Login**: Complete auth flow with password encryption
- **Session Management**: Persistent user sessions across page reloads
- **Protected Routes**: Middleware-based route protection

### 💬 Chat Features
- **Multiple Chat Sessions**: Create and manage multiple conversation threads
- **Message History**: Persistent storage of all conversations in MongoDB
- **Real-time Updates**: Instant message delivery and status updates
- **Chat Organization**: Sidebar navigation with chat history
- **Theme Toggle**: Light/Dark mode support

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Markdown Support**: Rich text formatting in messages
- **Loading States**: Visual feedback for all async operations

---

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB with Mongoose ODM
- **AI/ML**: Google Generative AI (Gemini 2.0 Flash)
- **Vector Database**: Pinecone
- **Real-time**: Socket.io
- **Authentication**: JWT + bcryptjs
- **Security**: CORS, cookie-parser

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Routing**: React Router DOM 7.x
- **HTTP Client**: Axios
- **Styling**: Custom CSS with modern features
- **Linting**: ESLint with React plugins

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **API Testing**: Postman collections included
- **Environment Management**: dotenv

---

## 🏗 Architecture

### System Design

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │◄───────►│  Express Backend │◄───────►│    MongoDB      │
│   (Port 5173)   │         │   (Port 3000)    │         │    Database     │
│                 │         │                  │         │                 │
└────────┬────────┘         └────────┬─────────┘         └─────────────────┘
         │                           │
         │                           │
         │ HTTP/REST                 │ HTTP API Calls
         │ WebSocket                 │
         │                           │
         │                           ▼
         │                  ┌─────────────────┐
         │                  │                 │
         └─────────────────►│  Google Gemini  │
           Socket.io        │      AI API     │
                           │                 │
                           └─────────────────┘
                                    │
                                    │
                                    ▼
                           ┌─────────────────┐
                           │                 │
                           │   Pinecone      │
                           │  Vector Store   │
                           │                 │
                           └─────────────────┘
```

### Key Components

**Backend Services**:
- `ai.service.js`: Handles Google Gemini AI interactions and embeddings
- `vector.service.js`: Manages Pinecone vector operations
- `socket.server.js`: WebSocket connection management

**Controllers**:
- `auth.controller.js`: User authentication logic
- `chat.controller.js`: Chat and message operations

**Models**:
- `user.model.js`: User schema with authentication fields
- `chat.model.js`: Chat session schema
- `message.model.js`: Message schema with roles (user/model/system)

**Frontend Components**:
- `ChatSidebar`: Navigation and chat history
- `ChatMessages`: Message display with role-based styling
- `ChatComposer`: Message input interface
- `ThemeToggle`: Dark/light mode switcher

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google AI API Key
- Pinecone API Key (optional, for vector features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/thakare18/BrainStack-AI.git
cd BrainStack-AI
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment variables**

Create a `.env` file in the `backend` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/brainstack-ai
# or use MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brainstack-ai

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Pinecone (optional)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
```

4. **Start the application**

```bash
# Terminal 1: Start backend server
cd backend
node server.js
# Server runs on http://localhost:3000

# Terminal 2: Start frontend dev server
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

5. **Access the application**

Open your browser and navigate to `http://localhost:5173`

### API Testing with Postman

The project includes Postman collections in the `/postman` directory for easy API testing.

---

## 📁 Project Structure

```
BrainStack-AI/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   └── chat.controller.js
│   │   ├── db/              # Database connection
│   │   ├── middlewares/     # Auth and validation
│   │   ├── models/          # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── chat.model.js
│   │   │   └── message.model.js
│   │   ├── routes/          # API routes
│   │   │   ├── auth.routes.js
│   │   │   └── chat.routes.js
│   │   ├── services/        # Business logic
│   │   │   ├── ai.service.js
│   │   │   └── vector.service.js
│   │   ├── sockets/         # WebSocket handlers
│   │   └── app.js          # Express app setup
│   ├── server.js           # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── chat/      # Chat UI components
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── styles/        # Global styles
│   │   ├── App.jsx        # Main app component
│   │   ├── AppRoutes.jsx  # Route configuration
│   │   └── main.jsx       # App entry point
│   ├── public/            # Static assets
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── postman/              # API testing collections
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # User login
POST   /api/auth/logout      # User logout
GET    /api/auth/me          # Get current user
```

### Chat
```
POST   /api/chat/new         # Create new chat
GET    /api/chat/all         # Get all user chats
GET    /api/chat/:chatId     # Get specific chat
POST   /api/chat/:chatId     # Send message in chat
```

### WebSocket Events
```
connection                   # Client connects
message                      # Send/receive messages
disconnect                   # Client disconnects
```

---

## 📸 Screenshots

> 📝 **Note**: Screenshots will be added soon to showcase the application's user interface and features. Check back later for visual demonstrations of the chat interface, authentication pages, and theme toggle functionality.

---

## 🔮 Future Enhancements

- [ ] **File Uploads**: Add support for image and document uploads
- [ ] **Voice Input**: Integrate speech-to-text for voice messages
- [ ] **Message Reactions**: Add emoji reactions to messages
- [ ] **Shared Chats**: Collaborate with other users in shared conversations
- [ ] **Export Conversations**: Download chat history as PDF/TXT
- [ ] **Advanced Search**: Search through conversation history
- [ ] **Custom AI Personas**: Allow users to create custom AI personalities
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Mobile App**: React Native version for iOS/Android
- [ ] **Analytics Dashboard**: Usage statistics and insights

---

## 👨‍💻 Developer

> 👤 **Developer Information**: Please customize this section with your personal information

**[Your Name]**  
Full Stack Developer | AI Enthusiast

- 🌐 Portfolio: [Add your portfolio link]
- 💼 LinkedIn: [Add your LinkedIn profile]
- 🐙 GitHub: [@thakare18](https://github.com/thakare18)
- 📧 Email: [Add your email address]

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Google Generative AI for the Gemini API
- Pinecone for vector database services
- Socket.io for real-time communication
- MongoDB for database solutions
- React and Vite teams for excellent frontend tools

---

## 📝 Notes for Recruiters

This project demonstrates proficiency in:

✅ **Full-Stack Development**: End-to-end application development with modern technologies  
✅ **AI/ML Integration**: Practical implementation of LLMs and vector embeddings  
✅ **API Design**: RESTful architecture with proper authentication and authorization  
✅ **Real-time Systems**: WebSocket implementation for live communication  
✅ **Database Design**: NoSQL schema design with MongoDB and Mongoose  
✅ **Frontend Engineering**: Modern React with hooks, routing, and state management  
✅ **Security Best Practices**: JWT authentication, password hashing, CORS configuration  
✅ **Code Organization**: Clean architecture with separation of concerns  
✅ **Version Control**: Git workflow and collaboration practices  

**Ready for deployment** with environment-based configuration and production-ready code structure.

---

<div align="center">

**⭐ If you find this project interesting, please consider giving it a star! ⭐**

Made with ❤️ and ☕

</div>
