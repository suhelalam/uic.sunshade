/**
 * Authentication button component.
 * Shows sign in button when logged out, user info + sign out when logged in.
 */

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";

export function AuthButton() {
  const { user, loading, signIn, signOut, isUicUser } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signIn();
    } catch (err: any) {
      if (err?.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized. Please add your domain in Firebase Console → Authentication → Settings → Authorized domains."
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-xs text-zinc-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningIn ? (
            <>
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}
        <div className="text-[10px] text-zinc-500">
          UIC email (@uic.edu) required
        </div>
      </div>
    );
  }

  if (!isUicUser) {
    return (
      <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <div className="font-medium">Non-UIC account detected</div>
        <div className="mt-1">Please sign in with a @uic.edu email</div>
        <button
          type="button"
          onClick={signOut}
          className="mt-2 text-xs font-medium text-amber-900 underline hover:no-underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-3 py-2 shadow-sm">
      <div className="flex flex-col min-w-0">
        <div className="text-xs font-medium text-zinc-900 truncate">
          {user.displayName || user.email?.split("@")[0] || "User"}
        </div>
        <div className="text-[10px] text-zinc-500 truncate">
          {user.email}
        </div>
      </div>
      <button
        type="button"
        onClick={signOut}
        className="rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
      >
        Sign out
      </button>
    </div>
  );
}
