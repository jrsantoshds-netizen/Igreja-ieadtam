'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PieChart, 
  GraduationCap, 
  Users, 
  BookOpen, 
  HandCoins, 
  ClipboardCheck, 
  Menu,
  X,
  Upload,
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from './AuthProvider';

const defaultFallbackLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231a4536'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23d4af37' stroke-width='4'/%3E%3Cpath d='M35 60 Q50 30 65 60' fill='none' stroke='%23d4af37' stroke-width='4'/%3E%3Cpath d='M50 40 L50 80' stroke='%23d4af37' stroke-width='4'/%3E%3C/svg%3E";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { profile, logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { label: 'Principal', type: 'header' },
    { label: 'Painel', href: '/', icon: PieChart },
    { label: 'Cadastros', type: 'header' },
    { label: 'Alunos', href: '/alunos', icon: GraduationCap },
    { label: 'Lições', href: '/licoes', icon: BookOpen },
    { label: 'Turmas', href: '/turmas', icon: Users },
    { label: 'Financeiro', type: 'header' },
    { label: 'Dízimos / Ofertas', href: '/dizimos', icon: HandCoins },
    { label: 'Frequência', type: 'header' },
    { label: 'Chamada', href: '/chamadas', icon: ClipboardCheck },
  ];

  return (
    <>
      <button 
        className="md:hidden fixed top-3 left-3 z-[150] w-10 h-10 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center border-none shadow-md"
        onClick={toggleSidebar}
        aria-label="Abrir menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside 
        className={`w-[264px] min-h-screen fixed left-0 top-0 z-[100] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-gradient-to-br from-[#0f2e24] via-[#14352a] to-[#1a4536]`}
        style={{
           backgroundImage: `linear-gradient(175deg,#0f2e24 0%,#14352a 40%,#1a4536 100%), url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v1H0z' fill='%23ffffff' fill-opacity='0.02'/%3E%3C/svg%3E")`
        }}
        role="navigation"
      >
        <div className="pt-5 pb-4 px-4 text-center relative border-b border-white/10 group">
          <div className="w-20 h-20 mx-auto mb-2.5 rounded-full overflow-hidden border-4 border-[rgba(200,134,42,0.5)] shadow-[0_0_20px_rgba(200,134,42,0.15)] relative block transition-transform group-hover:scale-105">
            <Image 
              src="/logo.png"
              alt="IEADTAM Logo" 
              fill 
              className="object-contain bg-white" 
              unoptimized
            />
          </div>
          <h1 className="font-serif text-[17px] font-bold text-white tracking-[1px]">IEADTAM</h1>
          <p className="text-[10px] text-white/40 mt-1 tracking-[0.5px] uppercase leading-relaxed">
            Presença Eterna<br/>do Espírito Santo
          </p>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto w-full">
          {navItems.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <div key={idx} className="px-6 pt-[14px] pb-[5px] text-[10px] uppercase tracking-[1.5px] text-white/30 font-bold">
                  {item.label}
                </div>
              );
            }

            const Icon = item.icon!;
            const isActive = pathname === item.href;

            return (
              <Link 
                key={idx} 
                href={item.href!}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-6 py-3 cursor-pointer transition-all duration-200 border-l-[3px] text-[14px] outline-none ${
                   isActive 
                     ? 'bg-white/10 border-[var(--color-accent)] text-white font-semibold' 
                     : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white/90'
                }`}
              >
                <Icon size={18} className={`w-[26px] mr-3 transition-opacity ${isActive ? 'text-[var(--color-accent)] opacity-100' : 'text-[var(--color-accent)] opacity-60'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="py-4 px-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col truncate pr-2">
              <span className="text-white text-[13px] font-bold truncate">{profile?.nome || 'Usuário'}</span>
              <span className="text-white/50 text-[11px] truncate">{profile?.congregacao || '---'} {profile?.role === 'admin' ? '(Admin)' : ''}</span>
            </div>
            <button onClick={logout} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors" title="Sair">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        
        <div className="py-[10px] px-[22px] border-t border-black/20 text-[10px] text-white/30 text-center bg-black/10">
          igreja.db &middot; v2.0-cloud
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 min-h-screen md:ml-[264px] p-6 md:p-9 relative overflow-x-hidden pt-16 md:pt-9"
            style={{
               backgroundImage: 'radial-gradient(circle at calc(100% + 140px) -180px, rgba(200,134,42,0.06) 0%, transparent 70%)',
               backgroundRepeat: 'no-repeat'
            }}>
        {children}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
         <div 
           className="md:hidden fixed inset-0 z-[90] bg-black/50" 
           onClick={() => setSidebarOpen(false)} 
         />
      )}
    </>
  );
}
