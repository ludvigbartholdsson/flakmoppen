import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../supabase/types';

const supabaseUrl = 'https://mglbwgdcjfwkxeuzqndh.supabase.co';
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbGJ3Z2RjamZ3a3hldXpxbmRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTE2NzMxOSwiZXhwIjoyMDM2NzQzMzE5fQ.lP1oiOJqcbyFs6gmqR5HgU_Hee3GypqtGQnodQgg7WA';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
