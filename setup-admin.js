const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://scntraseebzhxbzfetjf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_secret_key_here'
);

async function main() {
  console.log('Creating admin user...');
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@sigmant.com',
    password: 'admin',
    email_confirm: true,
  });
  
  if (error) {
    if (error.message.includes('already registered')) {
        console.log('Admin already exists in Supabase. Proceeding to update password...');
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existingAdmin = usersData.users.find(u => u.email === 'admin@sigmant.com');
        if (existingAdmin) {
            await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, { password: 'admin' });
            // Ensure Prisma has it
            const prismaUser = await prisma.usuario.findUnique({ where: { correo: 'admin@sigmant.com' } });
            if (!prismaUser) {
                await prisma.usuario.create({
                    data: {
                      id: existingAdmin.id,
                      nombre_completo: 'Administrador Principal',
                      correo: 'admin@sigmant.com',
                      rol: 'administrador',
                      estado: 'activo'
                    }
                  });
            }
            console.log('Admin reset successfully!');
        }
        return;
    }
    console.log(error);
    return;
  }
  
  await prisma.usuario.create({
    data: {
      id: data.user.id,
      nombre_completo: 'Administrador Principal',
      correo: 'admin@sigmant.com',
      rol: 'administrador',
      estado: 'activo'
    }
  });
  console.log('Admin created successfully!');
}
main().finally(() => prisma.$disconnect());
