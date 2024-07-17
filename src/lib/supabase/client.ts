// This is for client-side supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mglbwgdcjfwkxeuzqndh.supabase.co';
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbGJ3Z2RjamZ3a3hldXpxbmRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExNjczMTksImV4cCI6MjAzNjc0MzMxOX0.WZAIRpbxWtwXQP7J0QsO7FX1qT2X6lJ73Lds8idjG2c';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);
