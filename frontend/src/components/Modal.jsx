import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import '../css/tables-modals.css';

/**
 * Professional ELITE Modal Component
 * Refined for the premium design system.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer = null,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  icon: Icon = null
}) => {
  useEffect(() => {
    if (!isOpen) return;

    if (closeOnEsc) {
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, closeOnEsc, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = 'auto'; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay fade-in"
      onClick={closeOnBackdrop ? onClose : undefined}
      style={{
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        zIndex: 1000
      }}
    >
      <div
        className={`modal-content modal-${size} scale-in`}
        onClick={(e) => e.stopPropagation()}
        style={{
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.6)',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'var(--bg-darkest)'
        }}
      >
        {title && (
          <div className="modal-header" style={{
            background: 'linear-gradient(135deg, rgba(53, 110, 216, 0.08), rgba(255, 255, 255, 0.03))',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '1.5rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {Icon && (
                <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(53, 110, 216, 0.3)'
                }}>
                  <Icon size={20} />
                </div>
              )}
              <h2 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '0.5px'
              }}>{title}</h2>
            </div>
            {showCloseButton && (
              <button
                className="btn-icon-close"
                onClick={onClose}
                aria-label="Cerrar"
                style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}

        <div className="modal-body" style={{ padding: '2.5rem' }}>
          {children}
        </div>

        {footer && (
          <div className="modal-footer" style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '1.5rem 2.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
