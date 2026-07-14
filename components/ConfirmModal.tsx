import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDanger = false }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(28, 32, 35, 0.6)', backdropFilter: 'blur(3px)'
    }}>
      <div className="card fade-in" style={{ 
        width: '100%', maxWidth: '420px', 
        background: 'var(--surface-container-lowest)', 
        borderRadius: '12px', padding: '1.5rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--surface-container-high)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: isDanger ? 'var(--error-container)' : 'var(--primary-fixed-dim)', 
              color: isDanger ? 'var(--error)' : 'var(--primary-container)', 
              padding: '0.5rem', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="headline-md" style={{ fontSize: '1.25rem', color: 'var(--on-surface)', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button onClick={onCancel} className="btn-ghost" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: '0.25rem', borderRadius: '4px' }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className={isDanger ? "btn btn-danger" : "btn btn-primary"}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
