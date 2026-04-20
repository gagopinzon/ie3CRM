'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import NextImage from 'next/image';
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  Building2,
  FileType,
  Users,
  Shield,
  Package,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { SessionPermissions } from '@/lib/permissions';
import { hasPermission } from '@/lib/permissions';
import type { LucideIcon } from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  /** Si no se define, el ítem se muestra a cualquier usuario autenticado */
  permission?: keyof SessionPermissions;
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Proyectos', href: '/projects', icon: FolderKanban },
  { name: 'Clientes', href: '/clients', icon: Building2, permission: 'canManageClients' },
  { name: 'Inventarios', href: '/inventories', icon: Package, permission: 'canManageInventory' },
  {
    name: 'Tipos de Documentos',
    href: '/document-types',
    icon: FileType,
    permission: 'canManageDocumentTypes',
  },
  { name: 'Categorías', href: '/categories', icon: FileText, permission: 'canManageCategories' },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Usuarios', href: '/users', icon: Users, permission: 'canManageUsers' },
];

const adminNavigation = [
  { name: 'Roles', href: '/roles', icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const permissions = (session?.user as { permissions?: SessionPermissions } | undefined)?.permissions;
  const canManageUsers = hasPermission(permissions, 'canManageUsers');

  const visibleNavigation = useMemo(
    () =>
      navigation.filter(
        (item) => !item.permission || hasPermission(permissions, item.permission)
      ),
    [permissions]
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-[max(0.75rem,env(safe-area-inset-top))] left-[max(0.75rem,env(safe-area-inset-left))] z-50">
        <button
          type="button"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border border-gray-200/80 bg-white/95 p-2.5 text-gray-800 shadow-md backdrop-blur-sm hover:bg-white active:scale-[0.98] transition-[transform,box-shadow,background-color]"
        >
          {isOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <NextImage
                src="/logo.svg"
                alt="IE3 Logo"
                width={32}
                height={32}
                className="w-12 h-12 brightness-0 invert"
              />
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            {canManageUsers && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-800">
                  <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Administración
                  </p>
                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </nav>

          <div className="px-4 py-6 border-t border-gray-800">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center w-full px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
