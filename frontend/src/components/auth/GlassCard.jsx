import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <section className={`auth-glass-card ${className}`.trim()} {...props}>
      <div className="auth-glass-card__shine" aria-hidden="true" />
      <div className="auth-glass-card__mirror" aria-hidden="true" />
      {children}
    </section>
  );
};

export default GlassCard;
