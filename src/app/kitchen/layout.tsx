import { ReactNode } from 'react';

export default function KitchenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen font-sans" style={{ background: '#f5f0e8' }}>
      {children}
    </div>
  );
}
