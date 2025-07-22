import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4 relative">
      {/* Logo en la esquina superior izquierda */}
      <img
        src="https://res.cloudinary.com/dbufrzoda/image/upload/v1750457354/Captura_de_pantalla_2025-06-20_170819_wzmyli.png"
        alt="Logo Empresa"
        className="absolute top-6 left-6 w-40 h-auto object-contain z-20"
        style={{ maxWidth: '160px' }}
      />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">MachineryReports</h1>
            <p className="text-slate-600 mt-2">Technical Inspection System</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};