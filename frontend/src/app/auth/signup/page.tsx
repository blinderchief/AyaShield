"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createBrowserClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check if email confirmation is required
    // If session exists, user can proceed directly (email confirmation disabled)
    // If no session but user exists, confirmation email was sent
    if (data?.session) {
      router.push("/dashboard");
    } else if (data?.user) {
      setConfirmationSent(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
    
    setLoading(false);
  };

  // Show confirmation sent message
  if (confirmationSent) {
    return (
      <div className="animate-in text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-2xl font-semibold mb-3">Check your email</h1>
        <p className="text-text-secondary mb-6 max-w-sm mx-auto">
          We sent a confirmation link to <span className="font-medium text-text-primary">{email}</span>. 
          Click the link to activate your account.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => setConfirmationSent(false)}
            className="text-sm text-text-secondary hover:text-text-primary underline underline-offset-2"
          >
            Use a different email
          </button>
        </div>
        <div className="mt-8 p-4 rounded-lg bg-surface border border-border">
          <p className="text-xs text-text-muted">
            Didn&apos;t receive the email? Check your spam folder or wait a few minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <h1 className="text-2xl font-semibold mb-2">Create your account</h1>
      <p className="text-text-secondary mb-8">
        Start protecting your transactions in seconds
      </p>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text-primary/10 focus:border-text-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text-primary/10 focus:border-text-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-white border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text-primary/10 focus:border-text-primary transition-all"
            />
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            At least 8 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-text-primary text-white font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Create Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-text-secondary text-sm">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-text-primary underline underline-offset-2 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
