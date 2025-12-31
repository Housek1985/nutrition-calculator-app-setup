import { createClient } from '@supabase/supabase-js';

// Neposredno vstavljene vrednosti za Supabase URL in Anon Key
// OPOMBA: Za boljše prakse in lažje upravljanje konfiguracije v različnih okoljih
// je priporočljivo uporabiti .env datoteke.
const supabaseUrl = "https://htzciqaaghvnjefhtafj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0emNpcWFhZ2h2bmplZmh0YWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTk0ODQsImV4cCI6MjA4MDkzNTQ4NH0.FXbSuwjzarwcIq9LsRBgFYSyZO5RNbBgQIwz_ogT-Jc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);