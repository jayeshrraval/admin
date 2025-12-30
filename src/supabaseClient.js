import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ukwqvttvgguatatrzgzm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd3F2dHR2Z2d1YXRhdHJ6Z3ptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjEyOTk4NSwiZXhwIjoyMDgxNzA1OTg1fQ.qfMRJZmb_E07BldyYS8uSJXik7eHKBdtoECD6PXgUdQ'

export const supabase = createClient(supabaseUrl, supabaseKey)