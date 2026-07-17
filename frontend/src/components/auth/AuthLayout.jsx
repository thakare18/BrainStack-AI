import React from 'react';
import AnimatedBackground from './AnimatedBackground';
import BrandPanel from './BrandPanel';
import '../../styles/auth.css';

const AuthLayout = ({ children }) => {
  return (
    <main className="auth-shell">
      <AnimatedBackground />
      <div className="auth-shell__inner">
        <BrandPanel />
        <div className="auth-shell__card-wrap">{children}</div>
      </div>
    </main>
  );
};

export default AuthLayout;
