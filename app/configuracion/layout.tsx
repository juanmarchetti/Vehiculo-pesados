import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export default async function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const perfil = await prisma.usuario.findUnique({
    where: { id: user.id }
  });

  if (perfil?.rol !== 'administrador') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
        <h1 className="headline-lg" style={{ color: 'var(--error)' }}>Acceso Denegado</h1>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: '1rem', marginBottom: '2rem' }}>
          Solo los administradores pueden acceder a esta sección.
        </p>
        <a href="/dashboard" className="btn btn-primary">Volver al Dashboard</a>
      </div>
    );
  }

  return <>{children}</>;
}
