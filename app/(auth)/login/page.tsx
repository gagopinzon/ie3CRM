'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import NextImage from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
      {/* Panel izquierdo con diseño tecnológico */}
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
        
        {/* Líneas de conexión animadas */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
              </linearGradient>
            </defs>
            <path
              d="M0,200 Q100,100 200,200 T400,200 L400,400 L0,400 Z"
              fill="url(#lineGradient)"
              className="opacity-30"
            />
            <path
              d="M0,300 Q150,150 300,300 T400,300 L400,400 L0,400 Z"
              fill="url(#lineGradient)"
              className="opacity-20"
            />
            {/* Líneas de conexión */}
            <line x1="50" y1="50" x2="350" y2="350" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="100" y1="100" x2="300" y2="300" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
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
            <h2 className="text-5xl font-bold leading-tight tracking-tighter">
              RÁPIDO
            </h2>
            <h2 className="text-5xl font-bold leading-tight tracking-tighter text-gray-300">
              SEGURO
            </h2>
            <h2 className="text-5xl font-bold leading-tight tracking-tighter text-gray-400">
              EFICIENTE
            </h2>
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <NextImage
                src="/logo.svg"
                alt="IE3 Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
              <div>
                <h2 className="text-3xl font-bold text-black tracking-tight">INICIAR SESIÓN</h2>
                <p className="text-gray-600 text-sm">Ingeniería Especializada en Eficiencia Energética</p>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-sm">
                {error}
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

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all pr-12 text-black placeholder-gray-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-black border-2 border-gray-400 rounded focus:ring-black focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-700 font-medium">Mantenerme conectado</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-black hover:text-gray-700 font-semibold transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 uppercase tracking-wide text-sm"
            >
              {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
            </button>

            <div className="text-center text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="text-black hover:text-gray-700 font-semibold transition-colors"
              >
                REGISTRATE
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
