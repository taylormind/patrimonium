// supabase/client.js — PATRONO
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL  = 'https://fqxsbckzidbqlvwuyimt.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeHNiY2t6aWRicWx2d3V5aW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5Mjk5OTQsImV4cCI6MjA5NTUwNTk5NH0.c37lOg78zsPBARgHiq_7C3uw2uyCLbfdB3u-p4e-JgA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
