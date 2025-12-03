import { createClient } from "@supabase/supabase-js";

// Cliente para el FRONTEND (Usa la Anon Key)
// Este se usará para el Login, cargar deseos, etc.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cliente para el BACKEND (Usa la Service Role Key)
// ⚠️ PELIGRO: Este cliente tiene permisos de "Super Admin".
// Solo úsalo en las API Routes (Server Side) para el sorteo.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
