"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const hasProcessed = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      // Get session_id from URL hash
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        // No session_id - check for Supabase code (legacy fallback)
        const params = new URLSearchParams(window.location.search);
        if (params.get("code")) {
          // Let the route.ts handle Supabase OAuth
          return;
        }
        setError("Sessão inválida. Por favor, tente novamente.");
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        // Exchange session_id for user data
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const response = await fetch(`${backendUrl}/api/auth/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error("Falha na autenticação");
        }

        const userData = await response.json();

        // Store user info in localStorage for the app
        localStorage.setItem("user_id", userData.user_id);
        localStorage.setItem("user_email", userData.email);
        localStorage.setItem("user_name", userData.name);
        localStorage.setItem("company_id", userData.user_id); // Use user_id as company_id

        // Redirect to dashboard
        window.location.href = "/";
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Erro ao processar login");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    };

    processCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-muted-foreground text-sm">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-foreground font-medium">Autenticando...</p>
        <p className="text-muted-foreground text-sm">Aguarde um momento</p>
      </div>
    </div>
  );
}
