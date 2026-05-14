import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const Toast = ({ show, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-md shadow-lg animate-fade-in-up">
      <CheckCircle2 size={20} />
      <span className="font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
          &times;
        </button>
      )}
    </div>
  );
};

export default Toast;
