import { useEffect, useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import defaultPfp from "../assets/deault_pfp.png";
import "./NotificationPanel.css";

export default function NotificationPanel({
  isOpen,
  onClose,
  userId,
  onNotificationClick,
}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `http://localhost/SociaTech/backend/auth/fetchNotifications.php?user_id=${userId}`
      );
      const data = await res.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/markNotificationRead.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            notification_id: notificationId,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(
        "http://localhost/SociaTech/backend/auth/markNotificationRead.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    console.log("Notification clicked:", notif);

    // Mark as read if unread
    if (!notif.is_read) {
      await markAsRead(notif.notification_id);
    }

    // Close the notification panel first
    onClose();

    // Navigate to the post
    if (notif.post_id && onNotificationClick) {
      setTimeout(() => {
        onNotificationClick(notif.post_id);
      }, 100);
    } else {
      console.warn("Missing post_id or onNotificationClick handler", {
        post_id: notif.post_id,
        hasHandler: !!onNotificationClick,
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "comment":
        return "💬";
      case "upvote":
        return "👍";
      case "downvote":
        return "👎";
      case "reply":
        return "↩️";
      case "follow":
        return "👤";
      default:
        return "🔔";
    }
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 604800)}w ago`;
  };

  // Group notifications by time period
  const groupNotifications = () => {
    const now = new Date();
    const newNotifs = [];
    const todayNotifs = [];
    const olderNotifs = [];

    notifications.forEach((notif) => {
      const notifDate = new Date(notif.created_at);
      const diffHours = (now - notifDate) / (1000 * 60 * 60);

      if (!notif.is_read && diffHours < 24) {
        newNotifs.push(notif);
      } else if (diffHours < 24) {
        todayNotifs.push(notif);
      } else {
        olderNotifs.push(notif);
      }
    });

    return { newNotifs, todayNotifs, olderNotifs };
  };

  if (!isOpen) return null;

  const { newNotifs, todayNotifs, olderNotifs } = groupNotifications();

  return (
    <div className="notification_overlay" onClick={onClose}>
      <div className="notification_panel" onClick={(e) => e.stopPropagation()}>
        <div className="notification_panel_header">
          <div className="notification_title_section">
            <h2>Notifications</h2>
          </div>
          <div className="notification_actions">
            <button className="close_notification_btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="notification_list">
          {loading ? (
            <div className="notification_loading">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="notification_empty">
              <Bell size={48} strokeWidth={1} />
              <p>No notifications yet</p>
              <span>When you get notifications, they'll show up here</span>
            </div>
          ) : (
            <>
              {/* New Notifications */}
              {newNotifs.length > 0 && (
                <>
                  <div className="notification_section_header">
                    <span className="notification_section_title">New</span>
                  </div>
                  {newNotifs.map((notif) => (
                    <div
                      key={notif.notification_id}
                      className={`notification_item ${
                        notif.is_read ? "" : "unread"
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notification_icon">
                        <img
                          src={notif.actor_profile_image || defaultPfp}
                          alt="user"
                          className="notification_avatar"
                        />
                      </div>

                      <div className="notification_content">
                        <p className="notification_message">
                          <strong>{notif.actor_username}</strong>{" "}
                          {notif.message}
                        </p>
                        <span className="notification_time">
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Today Notifications */}
              {todayNotifs.length > 0 && (
                <>
                  <div className="notification_section_header">
                    <Bell size={16} />
                    <span className="notification_section_title">Today</span>
                  </div>
                  {todayNotifs.map((notif) => (
                    <div
                      key={notif.notification_id}
                      className={`notification_item ${
                        notif.is_read ? "" : "unread"
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notification_icon">
                        <img
                          src={notif.actor_profile_image || defaultPfp}
                          alt="user"
                          className="notification_avatar"
                        />
                      </div>

                      <div className="notification_content">
                        <p className="notification_message">
                          <strong>{notif.actor_username}</strong>{" "}
                          {notif.message}
                        </p>
                        <span className="notification_time">
                          {timeAgo(notif.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Older Notifications */}
              {olderNotifs.length > 0 &&
                olderNotifs.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className={`notification_item ${
                      notif.is_read ? "" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notification_icon">
                      <img
                        src={notif.actor_profile_image || defaultPfp}
                        alt="user"
                        className="notification_avatar"
                      />
                    </div>

                    <div className="notification_content">
                      <p className="notification_message">
                        <strong>{notif.actor_username}</strong> {notif.message}
                      </p>
                      <span className="notification_time">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}