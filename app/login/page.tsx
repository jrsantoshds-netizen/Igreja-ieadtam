'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Lock, LogIn, Users } from 'lucide-react';
import Image from 'next/image';

export default function Login() {
  const { loginWithGoogle, user, profile, loading } = useAuth();
  const [congregacao, setCongregacao] = useState('Sede');
  const [error, setError] = useState('');

  if (loading || (user && profile)) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0d2a21]"><div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const handleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle(congregacao.trim());
    } catch (err: any) {
      console.error(err);
      setError('Falha ao autenticar: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1e17] via-[#0f2e24] to-[#14352a] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-[#0a1e17] rounded-full flex items-center justify-center mb-4 border-4 border-[#c8862a] shadow-lg overflow-hidden relative">
            <Lock size={32} className="text-[#c8862a]" />
          </div>
          <h1 className="font-serif text-[24px] font-bold text-[#0a1e17]">IEADTAM</h1>
          <p className="text-[14px] text-gray-500">Sistema da Escola Dominical</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-5 text-center border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <Users size={16} className="text-[#0a1e17]" /> Sua Congregação
            </label>
            <p className="text-[12.5px] text-gray-500 mb-3 leading-relaxed">
              Primeiro acesso? Insira o nome da sua congregação. Seus alunos e inscrições serão vinculados a ela.
            </p>
            <input 
              type="text" 
              value={congregacao} 
              onChange={e => setCongregacao(e.target.value)} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-[15px] focus:outline-none focus:border-[#c8862a] focus:ring-1 focus:ring-[#c8862a] transition-all"
              placeholder="Ex: Sede, Filial Betel..."
            />
          </div>

          <button 
            onClick={handleLogin}
            className="w-full mt-4 bg-[#0a1e17] hover:bg-[#12362b] text-white py-3.5 rounded-lg text-[15px] font-bold tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(10,30,23,0.3)] hover:shadow-[0_6px_20px_rgba(10,30,23,0.4)]"
          >
            <LogIn size={18} /> Entrar com Google
          </button>
        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-5">
          <p className="text-[11px] text-gray-400 uppercase tracking-widest">Presença Eterna do Espírito Santo</p>
        </div>
      </div>
    </div>
  );
}
