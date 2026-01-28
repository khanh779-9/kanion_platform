import { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let bg = 'bg-emerald-600';
  if (type === 'error') bg = 'bg-red-600';
  if (type === 'success') bg = 'bg-emerald-600';
  if (type === 'warning') bg = 'bg-yellow-500';

  return (
    <div
      className={`fixed left-4 top-4 z-[100] min-w-[240px] max-w-xs px-4 py-3 rounded-lg shadow-lg text-white font-semibold flex items-center gap-2 ${bg}`}
      style={{ pointerEvents: 'auto' }}
      role="alert"
    >
      <span className="flex-1">{message}</span>
      <button
        className="ml-2 text-white/80 hover:text-white text-lg font-bold"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
