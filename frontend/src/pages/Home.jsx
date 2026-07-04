import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [ chats, setChats ] = useState([]);
  const [ activeChatId, setActiveChatId ] = useState(null);
  const [ input, setInput ] = useState('');
  const [ isSending, setIsSending ] = useState(false);
  const [ sidebarOpen, setSidebarOpen ] = useState(false);
  const [ socket, setSocket ] = useState(null);

  const [ messages, setMessages ] = useState([
    // {
    //   type: 'user',
    //   content: 'Hello, how can I help you today?'
    // },
    // {
    //   type: 'ai',
    //   content: 'Hi there! I need assistance with my account.'
    // }
  ]);

  const handleNewChat = async () => {
    try {
      let title = window.prompt('Enter a title for the new chat:', '');
      if (title) title = title.trim();
      if (!title) return;

      const response = await axios.post('http://localhost:3000/api/chat', {
        title
      }, {
        withCredentials: true
      });

      setChats(prevChats => [response.data.chat, ...prevChats]);
      setActiveChatId(response.data.chat._id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) {
        navigate('/login');
        return;
      }

      console.error('Failed to create chat:', error);
      alert(error?.response?.data?.message || 'Could not create chat. Please try again.');
    }
  }

  useEffect(() => {
    let mounted = true;

    axios.get('http://localhost:3000/api/chat', { withCredentials: true })
      .then(response => {
        if (!mounted) {
          return;
        }

        const loadedChats = response.data.chats.reverse();
        setChats(loadedChats);

        if (loadedChats.length > 0) {
          setActiveChatId(loadedChats[0]._id);
          getMessages(loadedChats[0]._id);
        }
      })
      .catch(error => {
        console.error('Failed to load chats:', error);
      });

    const tempSocket = io('http://localhost:3000', {
      withCredentials: true,
    });

    tempSocket.on('ai-response', (messagePayload) => {
      console.log('Received AI response:', messagePayload);

      setMessages((prevMessages) => [ ...prevMessages, {
        type: 'ai',
        content: messagePayload.content
      } ]);

      setIsSending(false);
    });

    tempSocket.on('ai-error', (errorPayload) => {
      console.error('AI error:', errorPayload);
      setMessages((prevMessages) => [ ...prevMessages, {
        type: 'ai',
        content: errorPayload.message || 'AI response failed'
      } ]);
      setIsSending(false);
    });

    setSocket(tempSocket);

    return () => {
      mounted = false;
      tempSocket.disconnect();
    };

  }, []);

  const sendMessage = async () => {

    const trimmed = input.trim();
    console.log('Sending message:', trimmed);
    if (!trimmed || !activeChatId || isSending || !socket) return;

    setIsSending(true);

    try {
      const response = await axios.post('http://localhost:3000/api/chat/messages', {
        chatId: activeChatId,
        content: trimmed
      }, {
        withCredentials: true
      });

      const savedMessage = response.data.chatMessage;

      setMessages(prevMessages => [ ...prevMessages, {
        type: 'user',
        content: savedMessage.content
      } ]);
      setInput('');

      socket.emit('ai-message', {
        chat: activeChatId,
        content: trimmed
      });
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) {
        navigate('/login');
        setIsSending(false);
        return;
      }

      console.error('Failed to save message:', error);
      alert(error?.response?.data?.message || 'Could not save message. Please try again.');
      setIsSending(false);
    }

    // try {
    //   const reply = await fakeAIReply(trimmed);
    //   dispatch(addAIMessage(activeChatId, reply));
    // } catch {
    //   dispatch(addAIMessage(activeChatId, 'Error fetching AI response.', true));
    // } finally {
    //   dispatch(sendingFinished());
    // }
  }

  const getMessages = async (chatId) => {

   const response = await axios.get(`http://localhost:3000/api/chat/messages/${chatId}`, { withCredentials: true })

   console.log('Fetched messages:', response.data.messages);

   setMessages(response.data.messages.map(m => ({
     type: m.role === 'user' ? 'user' : 'ai',
     content: m.content
   })));

  }


return (
  <div className="chat-layout minimal">
    <ChatMobileBar
      onToggleSidebar={() => setSidebarOpen(o => !o)}
      onNewChat={handleNewChat}
    />
    <ChatSidebar
      chats={chats}
      activeChatId={activeChatId}
      onSelectChat={(id) => {
        setActiveChatId(id);
        setSidebarOpen(false);
        getMessages(id);
      }}
      onNewChat={handleNewChat}
      open={sidebarOpen}
    />
    <main className="chat-main" role="main">
      {messages.length === 0 && (
        <div className="chat-welcome" aria-hidden="true">
          <div className="chip">Early Preview</div>
          <h1>ChatGPT Clone</h1>
          <p>Ask anything. Paste text, brainstorm ideas, or get quick explanations. Your chats stay in the sidebar so you can pick up where you left off.</p>
        </div>
      )}
      <ChatMessages messages={messages} isSending={isSending} />
      {
        activeChatId &&
        <ChatComposer
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          isSending={isSending}
        />}
    </main>
    {sidebarOpen && (
      <button
        className="sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  </div>
);
};

export default Home;