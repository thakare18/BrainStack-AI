import React, { useState } from 'react';
import AuthIcon from './AuthIcon';
import AuthInput from './AuthInput';

const PasswordInput = ({ id, label, autoComplete, error, ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <AuthInput
      id={id}
      label={label}
      icon="lock"
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      error={error}
      rightSlot={
        <button
          className="auth-field__action"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <AuthIcon name={visible ? 'eyeOff' : 'eye'} size={19} />
        </button>
      }
      {...props}
    />
  );
};

export default PasswordInput;
