// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// ---- INICIO DE LA PRUEBA ----
// Vamos a poner las claves directamente aquí para ver si el problema es el archivo .env

const supabaseUrl = "https://jrwetwcqpwqmzvqsmuiu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyd2V0d2NxcHdxbXp2cXNtdWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjU2OTMsImV4cCI6MjA3NjIwMTY5M30.kOPeWBTJv1jcbQ7OgEIWSlj2ZRKXU0r5VaSazMT_nGM";

// ---- FIN DE LA PRUEBA ----

// Esta línea comprueba si las variables están llegando. Si no, lanza un error.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("¡Las claves de Supabase no están definidas aquí mismo en el código!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);