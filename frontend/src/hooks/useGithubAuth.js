import { handleGithubLogin } from '../services/auth/githubAuth';

export function useGithubAuth() {
  return {
    handleGithubLogin,
    // TODO:
    // Add GitHub Authentication state and callbacks later.
  };
}
