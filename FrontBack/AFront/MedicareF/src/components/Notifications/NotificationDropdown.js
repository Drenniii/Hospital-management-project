import React, { useState, useEffect } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import ApiService from '../../service/ApiService';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notificationsData, count] = await Promise.all([
        ApiService.getUserNotifications(),
        ApiService.getUnreadNotificationsCount()
      ]);
      setNotifications(notificationsData);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await ApiService.markNotificationAsRead(notificationId);
      // Update notifications list and count
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Dropdown align="end" className="notification-dropdown">
      <Dropdown.Toggle variant="link" id="notification-dropdown" className="notification-toggle">
        <i className="nc-icon nc-bell-55"></i>
        {unreadCount > 0 && (
          <Badge bg="danger" className="notification-badge">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-menu">
        <div className="notification-header">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <span className="text-muted">{unreadCount} unread</span>
          )}
        </div>
        <div className="notification-body">
          {loading ? (
            <div className="text-center p-3">
              <i className="nc-icon nc-settings-gear-65 spin"></i>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-3 text-muted">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <Dropdown.Item 
                key={notification.id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {notification.type === 'APPOINTMENT_BOOKED' && (
                    <i className="nc-icon nc-calendar-60 text-primary"></i>
                  )}
                </div>
                <div className="notification-content">
                  <p className="notification-text">{notification.message}</p>
                  <small className="notification-time">
                    {formatTimeAgo(notification.createdAt)}
                  </small>
                </div>
              </Dropdown.Item>
            ))
          )}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown; 