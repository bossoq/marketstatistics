import { createClient } from "https://deno.land/x/supabase@1.1.0/mod.ts"

const env = Deno.env.toObject()

const supabaseUrl: string = env.SUPABASEURL
const supabaseApiKey: string = env.SUPABASEAPI

export const supabase = createClient(supabaseUrl, supabaseApiKey)
