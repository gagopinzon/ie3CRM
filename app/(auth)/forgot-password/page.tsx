'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NextImage from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // TODO: Implementar recuperación de contraseña
    setTimeout(() => {
      setMessage('Si el email existe, recibirás instrucciones para restablecer tu contraseña.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Patrón de grid tecnológico */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
              </linearGradient>
            </defs>
            <path
              d="M0,200 Q100,100 200,200 T400,200 L400,400 L0,400 Z"
              fill="url(#lineGradient2)"
              className="opacity-30"
            />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <NextImage
                src="/logo.svg"
                alt="IE3 Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <h1 className="text-3xl font-bold tracking-tight">IE<span className="text-gray-400">3</span></h1>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight tracking-tighter">RECUPERA</h2>
            <h2 className="text-5xl font-bold leading-tight tracking-tighter text-gray-300">TU ACCESO</h2>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-black mb-8 font-semibold transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Volver al login
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2 tracking-tight">¿OLVIDASTE TU CONTRASEÑA?</h2>
            <p className="text-gray-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 text-sm">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-2 uppercase tracking-wide">
                Dirección de correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all text-black placeholder-gray-400"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 uppercase tracking-wide text-sm"
            >
              {loading ? 'ENVIANDO...' : 'ENVIAR INSTRUCCIONES'}
            </button>

            <div className="text-center text-sm text-gray-600">
              ¿Recordaste tu contraseña?{' '}
              <Link href="/login" className="text-black hover:text-gray-700 font-semibold transition-colors">
                INICIAR SESIÓN
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
