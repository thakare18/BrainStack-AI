import React from 'react';

const particles = Array.from({ length: 18 }, (_, index) => index + 1);

const AnimatedBackground = () => {
  return (
    <div className="auth-ambient" aria-hidden="true">
      <div className="auth-ambient__gradient" />
      <div className="auth-ambient__blob auth-ambient__blob--blue" />
      <div className="auth-ambient__blob auth-ambient__blob--purple" />
      <div className="auth-ambient__blob auth-ambient__blob--cyan" />
      <div className="auth-ambient__beam auth-ambient__beam--one" />
      <div className="auth-ambient__beam auth-ambient__beam--two" />
      <div className="auth-ambient__particles">
        {particles.map((particle) => (
          <span key={particle} className={`auth-particle auth-particle--${particle}`} />
        ))}
      </div>
      <div className="auth-ambient__noise" />
    </div>
  );
};

export default AnimatedBackground;
