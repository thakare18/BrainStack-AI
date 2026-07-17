import { handleGoogleLogin } from '../services/auth/googleAuth';

export function useGoogleAuth() {
  return {
    handleGoogleLogin,
    // TODO:
    // Add Google Authentication state and callbacks later.
  };
}
