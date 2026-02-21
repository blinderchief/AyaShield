"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createBrowserClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

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
