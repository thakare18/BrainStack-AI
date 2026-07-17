import React from 'react';
import AuthIcon from './AuthIcon';

const AuthCardHeader = ({ heading, subtitle }) => {
  return (
    <header className="auth-card-header">
      <div className="auth-card-logo" aria-label="BrainStack">
        <span className="auth-card-logo__mark">
          <AuthIcon name="brain" size={22} />
        </span>
        <span>BrainStack</span>
      </div>
      <h1>{heading}</h1>
      <p>{subtitle}</p>
    </header>
  );
};

export default AuthCardHeader;
