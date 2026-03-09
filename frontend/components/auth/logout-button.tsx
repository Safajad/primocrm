"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Logout from Supabase
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Logout from Emergent Auth
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      }).catch(() => {}); // Ignore errors
      
      // Clear localStorage
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('company_id');
      
      // Redirect to landing
      window.location.href = "/landing";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      title="Sair"
      data-testid="logout-btn"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5" />
      )}
      <span>Sair</span>
    </button>
  );
}
