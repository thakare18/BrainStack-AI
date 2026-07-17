import React from 'react';

const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.46h6.47a5.53 5.53 0 0 1-2.4 3.63v2.96h3.88c2.27-2.09 3.57-5.17 3.57-8.69Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-2.96c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.05A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.27 14.33A7.2 7.2 0 0 1 4.9 12c0-.81.13-1.6.37-2.33V6.62H1.26A12 12 0 0 0 0 12c0 1.94.46 3.78 1.26 5.38l4.01-3.05Z" />
    <path fill="#EA4335" d="M12 4.71c1.76 0 3.34.61 4.59 1.79l3.44-3.44A11.54 11.54 0 0 0 12 0 12 12 0 0 0 1.26 6.62l4.01 3.05C6.22 6.82 8.87 4.71 12 4.71Z" />
  </svg>
);

const GithubIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5A12 12 0 0 0 8.2 23.9c.6.11.82-.26.82-.58v-2.1c-3.34.72-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.07 1.84 2.82 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.43c1.02 0 2.04.14 3 .41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.1.82 2.22v4.17c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
  </svg>
);

const providerIcons = {
  google: <GoogleIcon />,
  github: <GithubIcon />,
};

const SocialButton = ({ provider, children, onClick }) => {
  return (
    <button className="auth-social-button" type="button" onClick={onClick}>
      <span className="auth-social-button__icon">{providerIcons[provider]}</span>
      <span>{children}</span>
    </button>
  );
};

export default SocialButton;
