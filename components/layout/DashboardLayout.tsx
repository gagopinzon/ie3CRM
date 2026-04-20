'use client';

import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0 lg:ml-64 overflow-y-auto overscroll-y-contain pt-14 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pt-0">
        <div className="mx-auto w-full max-w-content px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-7 xl:px-10 xl:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
