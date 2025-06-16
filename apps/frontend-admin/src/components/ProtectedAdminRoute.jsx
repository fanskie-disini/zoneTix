// src/components/ProtectedAdminRoute.jsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";

export default function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!profile?.is_admin) {
          router.push("/");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  if (loading) {
    return <LoadingState />;
  }

  if (!isAdmin) {
    return null; // Redirect will happen in useEffect
  }

  return children;
}