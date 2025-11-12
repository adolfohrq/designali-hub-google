import React from 'react';
import { XIcon } from './Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideHeader?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', hideHeader = false }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl'
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} relative transition-all duration-300 ${isOpen ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform -translate-y-10 scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        {!hideHeader && title && (
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-brand-dark">{title}</h2>
            <button
              onClick={onClose}
              className="text-brand-gray hover:text-brand-dark transition-colors p-1 hover:bg-gray-100 rounded-lg"
              aria-label="Close modal"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        <div className={`${hideHeader ? 'p-0' : 'p-6'} max-h-[80vh] overflow-y-auto`}>
          {hideHeader && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white/80 rounded-full backdrop-blur-sm"
              aria-label="Close modal"
            >
              <XIcon className="w-6 h-6" />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;