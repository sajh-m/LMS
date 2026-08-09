import { useEffect } from 'react';
import './Toast.css';

function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}

export default Toast;