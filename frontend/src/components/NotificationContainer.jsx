import { useNotifications } from '../context/NotificationContext';

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="notification-stack">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <div className="actions-row" style={{ justifyContent: 'space-between' }}>
            <strong>{notification.type.toUpperCase()}</strong>
            <button className="btn btn-ghost" type="button" onClick={() => removeNotification(notification.id)}>
              ×
            </button>
          </div>
          <div>{notification.message}</div>
        </div>
      ))}
    </div>
  );
}

export default NotificationContainer;


