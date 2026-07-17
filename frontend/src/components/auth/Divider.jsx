import React from 'react';

const Divider = ({ label = 'OR' }) => {
  return (
    <div className="auth-divider" role="separator" aria-label={label}>
      <span>{label}</span>
    </div>
  );
};

export default Divider;
