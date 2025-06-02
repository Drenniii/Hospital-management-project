import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';
import ApiService from '../../service/ApiService';
import './Chat.css';

// Custom modal styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1050,
};

const modalContentStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 5px 15px rgba(0,0,0,.5)",
};

// New Chat Panel Component
function NewChatPanel({ show, onClose, availableUsers, selectedUser, onUserSelect, onStartChat }) {
  if (!show) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h4>Start New Chat</h4>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select User</Form.Label>
            {availableUsers.length > 0 ? (
              <Form.Control
                as="select"
                value={selectedUser?.id || ''}
                onChange={(e) => {
                  const user = availableUsers.find(u => u.id === parseInt(e.target.value));
                  onUserSelect(user);
                }}
              >
                <option value="">Select a user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstname} {user.lastname} {user.role === 'THERAPIST' ? '(Therapist)' : user.role === 'NUTRICIST' ? '(Nutritionist)' : ''}
                  </option>
                ))}
              </Form.Control>
            ) : (
              <p className="text-muted">No available users found</p>
            )}
          </Form.Group>
        </Form>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onStartChat} disabled={!selectedUser}>
            Start Chat
          </Button>
        </div>
      </div>
    </div>
  );
}

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewChatPanel, setShowNewChatPanel] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await ApiService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    loadChatRooms();
    const interval = setInterval(loadChatRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChatRoom) {
      loadMessages(activeChatRoom.id);
      const interval = setInterval(() => loadMessages(activeChatRoom.id), 3000);
      return () => clearInterval(interval);
    }
  }, [activeChatRoom]);

  const loadAvailableUsers = async () => {
    try {
      let users = [];
      if (userRole === 'USER') {
        const therapists = await ApiService.getAllTherapists();
        const nutritionists = await ApiService.getAllNutritionists();
        users = [...therapists, ...nutritionists];
      } else if (userRole === 'THERAPIST' || userRole === 'NUTRICIST') {
        const patients = await ApiService.getUsersByRole('USER');
        users = patients;
      }
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading available users:', error);
      setAvailableUsers([]);
    }
  };

  const handleStartNewChat = async () => {
    if (!selectedUser || !currentUser) return;
    
    try {
      const chatRoomData = {
        userId: userRole === 'USER' ? currentUser.id : selectedUser.id,
        professionalId: userRole === 'USER' ? selectedUser.id : currentUser.id
      };

      const newChatRoom = await ApiService.createChatRoom(chatRoomData);
      
      if (newChatRoom) {
        await loadChatRooms();
        setActiveChatRoom(newChatRoom);
        setShowNewChatPanel(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('Failed to create chat room. Please try again.');
    }
  };

  const loadChatRooms = async () => {
    try {
      const rooms = await ApiService.getChatRooms();
      setChatRooms(Array.isArray(rooms) ? rooms : []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setChatRooms([]);
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId) => {
    try {
      const messages = await ApiService.getChatMessages(chatRoomId);
      setMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatRoom || !currentUser) return;

    try {
      const messageData = {
        senderId: currentUser.id,
        receiverId: userRole === 'USER' ? activeChatRoom.professional.id : activeChatRoom.user.id,
        content: newMessage
      };

      await ApiService.sendMessage(messageData);
      setNewMessage('');
      await loadMessages(activeChatRoom.id);
      
      // Use setTimeout to ensure the message is rendered before scrolling
      setTimeout(() => {
        const messagesArea = document.querySelector('.messages-area');
        if (messagesArea) {
          messagesArea.scrollTop = messagesArea.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleClearMessages = async () => {
    if (!activeChatRoom) return;
    
    try {
      await ApiService.clearChatMessages(activeChatRoom.id);
      await loadMessages(activeChatRoom.id);
    } catch (error) {
      console.error('Error clearing messages:', error);
      alert('Failed to clear messages. Please try again.');
    }
  };

  if (loading) {
    return <div className="chat-loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <Card className="chat-card">
        <div className="chat-layout">
          {/* Chat Rooms List */}
          <div className="chat-rooms">
            <div className="chat-rooms-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Conversations</h5>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => {
                  loadAvailableUsers();
                  setShowNewChatPanel(true);
                }}
              >
                New Chat
              </Button>
            </div>
            <ListGroup>
              {chatRooms.map((room) => (
                <ListGroup.Item
                  key={room.id}
                  active={activeChatRoom?.id === room.id}
                  onClick={() => setActiveChatRoom(room)}
                  className="chat-room-item"
                >
                  <div className="chat-room-info">
                    <span className="chat-room-name">
                      {userRole === 'USER' 
                        ? `${room.professional.firstname} ${room.professional.lastname}`
                        : `${room.user.firstname} ${room.user.lastname}`}
                    </span>
                    {room.unreadCount > 0 && (
                      <span className="unread-badge">{room.unreadCount}</span>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          {/* Messages Area */}
          <div className="chat-messages-container">
            {activeChatRoom ? (
              <>
                <div className="chat-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5>
                      {userRole === 'USER'
                        ? `${activeChatRoom.professional.firstname} ${activeChatRoom.professional.lastname}`
                        : `${activeChatRoom.user.firstname} ${activeChatRoom.user.lastname}`}
                    </h5>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
                          handleClearMessages();
                        }
                      }}
                    >
                      Clear Messages
                    </Button>
                  </div>
                </div>
                
                <div className="messages-area">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${
                        message.sender.id === currentUser.id ? 'sent' : 'received'
                      }`}
                    >
                      <div className="message-content">
                        <p>{message.content}</p>
                        <span className="message-time">
                          {formatTimestamp(message.sentAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <Form onSubmit={handleSendMessage} className="message-input-form">
                  <Form.Group className="message-input-group">
                    <Form.Control
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="message-input"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </Form.Group>
                </Form>
              </>
            ) : (
              <div className="no-chat-selected">
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* New Chat Panel */}
      <NewChatPanel
        show={showNewChatPanel}
        onClose={() => setShowNewChatPanel(false)}
        availableUsers={availableUsers}
        selectedUser={selectedUser}
        onUserSelect={setSelectedUser}
        onStartChat={handleStartNewChat}
      />
    </div>
  );
};

export default Chat; 