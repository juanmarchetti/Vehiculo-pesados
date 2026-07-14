'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Truck, Headphones } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [credentials, setCredentials] = useState({ usuario: '', contrasena: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.usuario,
      password: credentials.contrasena,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Use window.location.href to force a full hard reload so middleware triggers cleanly
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface-container-low)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: 420,
        padding: '2.5rem 2rem',
        borderRadius: 16,
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64,
            background: 'var(--primary-container)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '0.875rem',
            boxShadow: '0 4px 16px rgba(255,122,26,0.3)',
          }}>
            <Truck size={32} color="#fff" />
          </div>
          <div className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--on-surface)', textAlign: 'center' }}>
            PORTAL DE GESTIÓN
          </div>
          <div className="label-caps" style={{ color: 'var(--on-surface-variant)', marginTop: '0.125rem' }}>
            TRANSNUPERSA S.A.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {errorMsg && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--error-container)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.875rem', borderLeft: '4px solid var(--error)' }}>
              {errorMsg}
            </div>
          )}
          {/* Usuario */}
          <div style={{ marginBottom: '1.125rem' }}>
            <label htmlFor="usuario" className="form-label">Usuario o Correo</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }}
              />
              <input
                id="usuario"
                type="text"
                className="form-input"
                placeholder="Ingrese su credencial"
                style={{ paddingLeft: '2.25rem' }}
                value={credentials.usuario}
                onChange={(e) => setCredentials(p => ({ ...p, usuario: e.target.value }))}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label htmlFor="contrasena" className="form-label" style={{ margin: 0 }}>Contraseña</label>
              <button type="button" style={{ fontSize: '0.8rem', color: 'var(--tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}>
                ¿Olvidó su contraseña?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }}
              />
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: '2.25rem', paddingRight: '2.75rem' }}
                value={credentials.contrasena}
                onChange={(e) => setCredentials(p => ({ ...p, contrasena: e.target.value }))}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 0, display: 'flex' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--primary-container)', cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
              Mantener sesión iniciada
            </label>
          </div>

          {/* Submit */}
          <button
            id="btn-acceder"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.875rem',
              fontSize: '0.875rem',
              borderRadius: 8,
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Verificando...
              </>
            ) : (
              <>ACCEDER AL PORTAL →</>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0 1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--surface-container-high)' }} />
        </div>

        {/* Support */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
          <Headphones size={15} />
          <span>Soporte Técnico: <strong className="technical-data" style={{ color: 'var(--on-surface)' }}>0800-SIGMANT</strong></span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
