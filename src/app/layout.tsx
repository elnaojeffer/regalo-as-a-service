// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import MUIProvider from './mui-provider'; // Importa el componente que creamos arriba

export const metadata: Metadata = {
  title: 'Santa Deploy 🎅',
  description: 'Conectando UIO & GYE',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <MUIProvider>
          {children}
        </MUIProvider>
      </body>
    </html>
  );
}