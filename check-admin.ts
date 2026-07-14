import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  console.log('Supabase Auth Users:');
  data.users.forEach(u => {
    console.log(`- ${u.email} (ID: ${u.id})`);
  });
}

main();
