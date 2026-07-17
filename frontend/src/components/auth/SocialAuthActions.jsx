import React from 'react';
import { SOCIAL_AUTH_PROVIDERS } from '../../constants/socialAuth';
import { useGithubAuth } from '../../hooks/useGithubAuth';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import Divider from './Divider';
import SocialButton from './SocialButton';

const SocialAuthActions = () => {
  const { handleGoogleLogin } = useGoogleAuth();
  const { handleGithubLogin } = useGithubAuth();

  const handlers = {
    google: handleGoogleLogin,
    github: handleGithubLogin,
  };

  return (
    <>
      <Divider />
      <div className="auth-social-stack" aria-label="Social sign in options">
        {SOCIAL_AUTH_PROVIDERS.map((provider) => (
          <SocialButton key={provider.id} provider={provider.id} onClick={handlers[provider.id]}>
            {provider.label}
          </SocialButton>
        ))}
      </div>
    </>
  );
};

export default SocialAuthActions;
