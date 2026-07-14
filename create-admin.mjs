import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://scntraseebzhxbzfetjf.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_secret_key_here';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('Creando usuario administrador...');
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@transnupersa.com',
    password: 'AdminPassword123!',
    email_confirm: true, // Confirmado automáticamente
    user_metadata: { nombre: 'Administrador Principal' }
  });

  if (error) {
    console.error('Error creando usuario en Supabase Auth:', error.message);
    process.exit(1);
  }

  console.log('Usuario creado exitosamente en Auth:', data.user.id);

  process.exit(0);
}

createAdminUser();
