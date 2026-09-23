import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-brand-mesh flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-red/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-slate-600/10 blur-3xl"
        aria-hidden="true"
      />

      <img
        src="https://res.cloudinary.com/dbufrzoda/image/upload/v1750457354/Captura_de_pantalla_2025-06-20_170819_wzmyli.png"
        alt="Logo Empresa"
        className="absolute top-6 left-6 w-40 h-auto object-contain z-20 drop-shadow-sm"
        style={{ maxWidth: '160px' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-brand border border-slate-200/80 overflow-hidden">
          <div className="brand-accent-bar" />
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red mb-2">
                Partequipos
              </p>
              <h1 className="text-2xl font-display font-bold text-slate-900">
                MachineryReports
              </h1>
              <p className="text-slate-600 mt-2 text-sm">
                Technical Inspection System
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
