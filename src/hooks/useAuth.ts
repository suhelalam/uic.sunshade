/**
 * React hook for Firebase Authentication state.
 * Returns current user, loading state, and auth functions.
 */

import * as React from "react";
import { auth, signInWithGoogle, signOutUser, isUicEmail } from "@/lib/firebase";
import type { User } from "firebase/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isUicUser: boolean;
};

export function useAuth(): AuthState {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = React.useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const handleSignOut = React.useCallback(async () => {
    await signOutUser();
  }, []);

  return {
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isUicUser: isUicEmail(user?.email),
  };
}
