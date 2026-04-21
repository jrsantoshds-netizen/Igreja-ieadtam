'use client';

export default function Modal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center backdrop-blur-[4px] animate-in fade-in duration-200"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-[var(--color-card)] rounded-[14px] p-7 max-w-[420px] w-[92%] shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-[19px] text-[var(--color-primary)] mb-[7px]">{title}</h3>
        <p className="text-[var(--color-muted)] text-[14px] mb-5">{message}</p>
        <div className="flex gap-2.5 justify-end">
          <button 
            type="button" 
            className="px-5 py-2.5 bg-transparent border-2 border-[var(--color-border)] text-[var(--color-fg)] rounded-lg text-[13.5px] font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            className="px-5 py-2.5 bg-[var(--color-danger)] text-white rounded-lg text-[13.5px] font-semibold hover:bg-[#9c2f24] transition-colors"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
