import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vfcskgmphudiznbdbcgr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmY3NrZ21waHVkaXpuYmRiY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMzAxMTcsImV4cCI6MjA2MDkwNjExN30.rz-yM2H17zjG3eRT6MKNKrvJiEN-Tfw7btba2TlDLGI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
