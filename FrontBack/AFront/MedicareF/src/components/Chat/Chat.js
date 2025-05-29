import React, { useState, useEffect, useRef } from 'react';
import { Card, ListGroup, Button, Form } from 'react-bootstrap';
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatRooms = async () => {
    try {
      const rooms = await ApiService.getChatRooms();
      setChatRooms(rooms);
      setLoading(false);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId) => {
    try {
      const messages = await ApiService.getChatMessages(chatRoomId);
      setMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const users = userRole === 'USER' 
        ? await ApiService.getAllProfessionals()
        : await ApiService.getAllUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatRoom) return;

    try {
      await ApiService.sendMessage({
        chatRoomId: activeChatRoom.id,
        content: newMessage
      });
      setNewMessage('');
      loadMessages(activeChatRoom.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateChatRoom = async () => {
    if (!selectedUser) return;

    try {
      const newRoom = await ApiService.createChatRoom({
        otherUserId: selectedUser.id
      });
      setChatRooms([...chatRooms, newRoom]);
      setActiveChatRoom(newRoom);
      setShowNewChatPanel(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const formatName = (user) => {
    return `${user.firstname} ${user.lastname}`;
  };

  if (loading) {
    return <div className="chat-loading">Loading chat...</div>;
  }

  return (
    <div className="chat-container">
      <Card className="chat-card">
        <div className="chat-layout">
          {/* Chat Rooms List */}
          <div className="chat-rooms">
            <div className="chat-rooms-header">
              <div className="d-flex justify-content-between align-items-center">
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
            </div>
            <ListGroup className="chat-rooms-list">
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
                        ? formatName(room.professional)
                        : formatName(room.user)}
                    </span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {activeChatRoom ? (
              <>
                <div className="messages-header">
                  <h5 className="mb-0">
                    {userRole === 'USER'
                      ? formatName(activeChatRoom.professional)
                      : formatName(activeChatRoom.user)}
                  </h5>
                </div>
                <div className="messages-container">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${
                        message.sender.id === currentUser?.id ? 'sent' : 'received'
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <Form onSubmit={handleSendMessage} className="message-input-container">
                  <Form.Control
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <Button type="submit" variant="primary">
                    Send
                  </Button>
                </Form>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                Select a conversation or start a new one
              </div>
            )}
          </div>

          {/* New Chat Panel */}
          {showNewChatPanel && (
            <div className="new-chat-panel">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">New Chat</h5>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowNewChatPanel(false)}
                >
                  Close
                </Button>
              </div>
              <div className="user-list">
                <ListGroup>
                  {availableUsers.map((user) => (
                    <ListGroup.Item
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`user-item ${
                        selectedUser?.id === user.id ? 'selected' : ''
                      }`}
                    >
                      {formatName(user)}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
              <Button
                variant="primary"
                onClick={handleCreateChatRoom}
                disabled={!selectedUser}
              >
                Start Chat
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Chat; 