import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://greqhsslyyanbumotlzo.supabase.co'
const supabaseKey = 'sb_publishable_0mwT_YxyH3n8Wsa0hEFHeg_wnYrkcqu'

export const supabase = createClient(supabaseUrl, supabaseKey)
