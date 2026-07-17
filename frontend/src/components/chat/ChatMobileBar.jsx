import React from 'react';
import './ChatMobileBar.css';
import './ChatLayout.css';

const ChatMobileBar = ({ onToggleSidebar, onNewChat }) => (
  <header className="chat-mobile-bar">
    <button className="chat-icon-btn" onClick={onToggleSidebar} aria-label="Toggle chat history">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    </button>
    <h1 className="chat-app-title">BrainStack</h1>
    <button className="chat-icon-btn" onClick={onNewChat} aria-label="New chat">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </button>
  </header>
);

export default ChatMobileBar;
