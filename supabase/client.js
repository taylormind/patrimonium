/**
 * Patrono — Supabase Client (UMD / vanilla JS)
 * Expõe o cliente como window._supabase para uso em app.js
 *
 * Carregado APÓS o CDN do Supabase JS (index.html garante a ordem):
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
 *   <script src="./supabase/client.js"></script>
 */

const SUPABASE_URL      = 'https://fqxsbckzidbqlvwuyimt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHNiY2t6aWRicWx2d3V5aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk5OTQsImV4cCI6MjA5NTUwNTk5NH0.c37lOg78zsPBARgHiq_7C3uw2uyCLbfdB3u-p4e-JgA';

window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  }
});
