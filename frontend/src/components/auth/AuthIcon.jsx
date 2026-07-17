import React from 'react';

const iconPaths = {
  brain: (
    <>
      <path d="M9 3.5a4 4 0 0 0-4 4v.2A4.8 4.8 0 0 0 3.5 11a4.7 4.7 0 0 0 2 3.85V16a4 4 0 0 0 4 4h5a4 4 0 0 0 4-4v-1.15a4.7 4.7 0 0 0 2-3.85 4.8 4.8 0 0 0-1.5-3.3v-.2a4 4 0 0 0-4-4" />
      <path d="M9 3.5V20" />
      <path d="M15 3.5V20" />
      <path d="M9 8h6" />
      <path d="M9 13h6" />
    </>
  ),
  email: (
    <>
      <path d="M4.5 6.5h15v11h-15z" />
      <path d="m5 7 7 6 7-6" />
    </>
  ),
  user: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  lock: (
    <>
      <path d="M6.5 10.5h11v9h-11z" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </>
  ),
  eyeOff: (
    <>
      <path d="m4 4 16 16" />
      <path d="M10.7 5.2A9.8 9.8 0 0 1 12 5c6 0 9.5 7 9.5 7a16.8 16.8 0 0 1-2.6 3.35" />
      <path d="M6.2 7.25C3.75 9.05 2.5 12 2.5 12s3.5 7 9.5 7a9.3 9.3 0 0 0 4.05-.95" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 17 8 4 8-4" />
    </>
  ),
  message: (
    <>
      <path d="M4.5 5.5h15v10h-8l-4.5 4v-4H4.5z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </>
  ),
  search: (
    <>
      <path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" />
      <path d="m15.5 15.5 4 4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6v5.4c0 4.2-2.7 7.4-7 9.1-4.3-1.7-7-4.9-7-9.1V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

const AuthIcon = ({ name, size = 20, className = '', strokeWidth = 1.8 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name] || iconPaths.layers}
    </svg>
  );
};

export default AuthIcon;
