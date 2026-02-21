"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient();
      
      // Get the code from URL (Supabase PKCE flow)
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        setStatus("error");
        setMessage(errorDescription || "Authentication failed");
        return;
      }

      if (code) {
        try {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            setStatus("error");
            setMessage(exchangeError.message);
            return;
          }

          setStatus("success");
          setMessage("Email confirmed successfully!");
          
          // Redirect to dashboard after short delay
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } catch (err) {
          setStatus("error");
          setMessage("Failed to verify email. Please try again.");
        }
      } else {
        // No code, might be a hash-based redirect (for password reset, etc.)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setStatus("error");
          setMessage(sessionError.message);
          return;
        }

        if (session) {
          setStatus("success");
          setMessage("Authenticated successfully!");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          setStatus("error");
          setMessage("No authentication code found.");
        }
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="animate-in text-center">
      {status === "loading" && (
        <>
          <Loader2 className="w-12 h-12 animate-spin text-text-secondary mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Verifying...</h1>
          <p className="text-text-secondary">Please wait while we confirm your email.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Success!</h1>
          <p className="text-text-secondary mb-6">{message}</p>
          <p className="text-sm text-text-muted">Redirecting to dashboard...</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-danger" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Verification Failed</h1>
          <p className="text-text-secondary mb-6">{message}</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-text-primary text-white font-medium hover:bg-primary-light transition-colors"
          >
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
}
