# BrainStack-AI

**Context-Aware AI Chat System with Long-Term Memory**

![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-black)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black)
![Status](https://img.shields.io/badge/Status-Under%20Development-yellow)

BrainStack-AI is a **full-stack AI chat application** that remembers conversations using **vector memory** and generates **context-aware responses**.
It simulates a **persistent intelligent assistant** similar to modern AI platforms.

---

## Project Status

This project is **actively under development**.

Completed:

* Authentication system
* Real-time chat
* Vector memory integration
* Context-aware AI responses
* React frontend with theme toggle

In progress:

* UI polish
* Deployment
* Advanced features

---

## Key Features

* AI-powered chat assistant
* Long-term memory using vector embeddings
* Context-aware responses
* Real-time messaging with Socket.io
* Secure JWT authentication
* React-based modern UI
* Dark/Light theme toggle
* Scalable backend architecture

---

## Tech Stack

### Frontend

* React
* Vite
* Axios
* Socket.io Client
* Custom CSS

### Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* Socket.io

### AI & Memory

* Gemini embeddings
* Pinecone vector database
* Context retrieval system

---

## System Architecture

```
User
 ↓
React Frontend
 ↓
Socket.io / REST API
 ↓
Node.js + Express Backend
 ↓
Message Processing
 ↓
Gemini Embeddings
 ↓
Pinecone Vector Storage
 ↓
Context Retrieval
 ↓
AI Response
 ↓
User
```

---

## Project Structure

```
BrainStack-AI/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── app.js
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── chat/
│   │   │       
│   │   │       
│   │   │       
│   │   │       
│   │   │       
│   │   │
│   │   ├── pages/
│   │   │   
│   │   │   
│   │   │   
│   │   │
│   │   ├── styles/
│   │   ├── App.jsx
│   │   ├── AppRoutes.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .postman/
├── README.md
└── .gitignore
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/thakare18/BrainStack-AI.git
cd BrainStack-AI
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file inside `backend`:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
GEMINI_API_KEY=your_api_key
PINECONE_API_KEY=your_api_key
```

Start backend:

```bash
npm start
```

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## How the AI Memory Works

1. User sends a message.
2. Message stored in MongoDB.
3. Converted into vector embeddings.
4. Stored in Pinecone.
5. Relevant memories retrieved on new queries.
6. AI generates context-aware response.


## API Testing

Postman collection available in:

```
.postman/
```

Endpoints include:

* Register
* Login
* Create Chat
* Send Message
* Get Messages

---
**Prathamesh Vinayak Thakare**


