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
  Upload
} from 'lucide-react';
import Image from 'next/image';

const defaultFallbackLogo = "https://z-cdn-media.chatglm.cn/files/03a5ef41-f7b6-4ed2-a240-4d9c1dc4793b.png?auth_key=1876650640-c3016c3123344dec99c7e0febd679e91-0-d7db01960d2dc11a359a1b2e2f825106";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo');
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Redimensiona a imagem usando o Canvas para não estourar o limite do LocalStorage
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Exporta em PNG de alta qualidade para renderizar bem no PDF transparente
          const base64Str = canvas.toDataURL('image/png');

          try {
            localStorage.setItem('app_logo', base64Str);
            setCustomLogo(base64Str);
          } catch (err) {
            console.error("Imagem muito grande para salvar no localStorage.", err);
            alert("Erro ao salvar: a imagem ainda está muito pesada.");
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { label: 'Principal', type: 'header' },
    { label: 'Painel', href: '/', icon: PieChart },
    { label: 'Cadastros', type: 'header' },
    { label: 'Alunos', href: '/alunos', icon: GraduationCap },
    { label: 'Turmas', href: '/turmas', icon: Users },
    { label: 'Lições', href: '/licoes', icon: BookOpen },
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
          <label className="w-20 h-20 mx-auto mb-2.5 rounded-full overflow-hidden border-4 border-[rgba(200,134,42,0.5)] shadow-[0_0_20px_rgba(200,134,42,0.15)] relative cursor-pointer block transition-transform group-hover:scale-105" title="Alterar Logo">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleLogoUpload}
            />
            {/* O overlay de upload aparece ao passar o mouse (desktop) ou fica indicativo */}
            <div className="absolute inset-0 bg-black/40 z-10 hidden group-hover:flex items-center justify-center transition-opacity">
              <Upload size={20} className="text-white opacity-80" />
            </div>
            <Image 
              src={customLogo || defaultFallbackLogo}
              alt="IEADTAM Logo" 
              fill 
              className="object-contain" 
              unoptimized
            />
          </label>
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
        
        <div className="py-[14px] px-[22px] border-t border-white/10 text-[10px] text-white/30 text-center">
          igreja.db &middot; v1.0
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
