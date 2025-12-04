import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { WishItem, Assignment } from "../interfaces/DashboardInterface";

interface DashboardData {
  currentUser: any;
  wishes: WishItem[];
  myAssignment: Assignment | null;
  configAdminEmail: string;
  dateSorteo: Date;
  dateIntercambio: Date;
  loading: boolean;
  fetchWishes: () => Promise<void>;
}

const DEFAULT_SORTEO = new Date("2025-12-05T15:00:00");
const DEFAULT_INTERCAMBIO = new Date("2025-12-23T14:00:00");

export function useDashboardData(): DashboardData {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [myAssignment, setMyAssignment] = useState<Assignment | null>(null);
  const [configAdminEmail, setConfigAdminEmail] = useState("");
  const [dateSorteo, setDateSorteo] = useState<Date>(DEFAULT_SORTEO);
  const [dateIntercambio, setDateIntercambio] =
    useState<Date>(DEFAULT_INTERCAMBIO);
  const [loading, setLoading] = useState(true);

  const fetchWishes = async () => {
    const { data } = await supabase
      .from("safe_wishes")
      .select("*, profiles(full_name, sede)")
      .order("created_at", { ascending: false });
    if (data) setWishes(data as WishItem[]);
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.warn("Sesión inválida o expirada:", sessionError?.message);
          await supabase.auth.signOut();
          router.replace("/");
          return;
        }

        const user = session.user;
        setCurrentUser(user);

        // Cargar configuración
        const { data: configData } = await supabase.from("config").select("*");
        if (configData) {
          const adminCfg = configData.find((c) => c.key === "admin_email");
          const sorteoCfg = configData.find((c) => c.key === "fecha_sorteo");
          const intercambioCfg = configData.find(
            (c) => c.key === "fecha_intercambio"
          );

          if (adminCfg) setConfigAdminEmail(adminCfg.value);
          if (sorteoCfg) setDateSorteo(new Date(sorteoCfg.value));
          if (intercambioCfg)
            setDateIntercambio(new Date(intercambioCfg.value));
        }

        await fetchWishes();

        // Cargar asignación
        const { data: matchData } = await supabase
          .from("matches")
          .select(
            `recipient:recipient_id ( full_name, sede, wishes ( description ) )`
          )
          .eq("santa_id", user.id)
          .maybeSingle();

        if (matchData) setMyAssignment(matchData as unknown as Assignment);

        setLoading(false);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setLoading(false);
      }
    };

    initData();
  }, [router]);

  return {
    currentUser,
    wishes,
    myAssignment,
    configAdminEmail,
    dateSorteo,
    dateIntercambio,
    loading,
    fetchWishes,
  };
}
