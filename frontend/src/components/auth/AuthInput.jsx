import React from 'react';
import AuthIcon from './AuthIcon';

const AuthInput = ({
  id,
  label,
  icon = 'email',
  error,
  rightSlot,
  className = '',
  ...inputProps
}) => {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className={`auth-field ${className}`.trim()}>
      <label className="auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-field__control">
        <AuthIcon name={icon} className="auth-field__icon" />
        <input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...inputProps} />
        {rightSlot}
      </div>
      {error && (
        <p className="auth-field__error" id={describedBy}>
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
