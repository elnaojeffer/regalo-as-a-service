import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Match } from "../interface/adminInterface";

interface AdminDataReturn {
  currentAdminEmail: string;
  matches: Match[];
  fetching: boolean;
  fetchMatches: () => Promise<void>;
  checkAdminAccess: () => Promise<boolean>;
}

export function useAdminData(): AdminDataReturn {
  const router = useRouter();
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [fetching, setFetching] = useState(true);

  const checkAdminAccess = async (): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        router.replace("/");
        return false;
      }

      // Traer configuración del admin
      const { data: configData } = await supabase
        .from("config")
        .select("*")
        .eq("key", "admin_email")
        .maybeSingle();

      const adminEmail = configData?.value || "";
      setCurrentAdminEmail(adminEmail);

      if (user.email !== adminEmail) {
        alert("❌ Acceso denegado. No eres el admin configurado.");
        router.replace("/dashboard");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verificando acceso:", error);
      router.replace("/");
      return false;
    }
  };

  const fetchMatches = async () => {
    setFetching(true);
    const { data } = await supabase.from("matches").select(`
      id, created_at,
      santa:santa_id ( full_name ),
      recipient:recipient_id ( full_name )
    `);
    if (data) setMatches(data as unknown as Match[]);
    setFetching(false);
  };

  useEffect(() => {
    const init = async () => {
      const hasAccess = await checkAdminAccess();
      if (hasAccess) {
        await fetchMatches();
      }
    };
    init();
  }, [router]);

  return {
    currentAdminEmail,
    matches,
    fetching,
    fetchMatches,
    checkAdminAccess,
  };
}
