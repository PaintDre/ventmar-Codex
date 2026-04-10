import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export const FORMULARIOS_STORAGE_BUCKET = "formularios";
export const FUTURE_VENTAS_IMAGE_PATH = "ventas-semanales";

export function hasSupabaseCredentials() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan las credenciales publicas de Supabase.");
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);

  return supabaseInstance;
}
