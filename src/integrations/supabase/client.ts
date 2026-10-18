import { createClient } from '@supabase/supabase-js';
import { initializePasswordRecovery } from '../../lib/passwordRecovery';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (
  !SUPABASE_URL ||
  !SUPABASE_PUBLISHABLE_KEY
) {
  throw new Error(
    'Supabase env ausente. Confira VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
  );
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

initializePasswordRecovery(supabase);
