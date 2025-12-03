import { createClient } from "@supabase/supabase-js";

// Cliente ADMIN con permisos totales (SOLO SERVER-SIDE)
// Si esta variable no existe (ej: en el browser), lanzará error, pero como
// este archivo solo lo importaremos en la API, todo estará bien.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
