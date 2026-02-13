import React from 'react';

const Logo = ({ size = 'md', className = '', showText = false, variant = 'dark' }) => {
  const sizes = {
    sm: { img: '32px', text: '1rem' },
    md: { img: '40px', text: '1.25rem' },
    lg: { img: '60px', text: '1.5rem' },
    xl: { img: '80px', text: '2rem' }
  };

  const currentSize = sizes[size];
  const isDark = variant === 'dark';

  // Fondo oscuro -> logo-ueb.png (blanco)
  // Fondo blanco -> logo-blue.png (azul)
  const logoUrl = isDark ? "/img/logo-ueb.png" : "/img/logo-blue.png";

  return (
    <div className={`flex items-center ${showText ? 'gap-2' : ''} ${className}`}>
      <img
        src={logoUrl}
        alt="Logo UEB"
        style={{
          width: 'auto',
          height: 'auto',
          borderRadius: '8px',
          objectFit: 'contain',
          maxWidth: size === 'sm' ? '120px' : '180px',
          maxHeight: size === 'sm' ? '40px' : '80px'
        }}
      />
      {showText && (
        <div style={{
          fontSize: currentSize.text,
          fontWeight: 'bold',
          color: isDark ? '#fff' : '#356ed8'
        }}>
          UEB
        </div>
      )}
    </div>
  );
};

export default Logo;