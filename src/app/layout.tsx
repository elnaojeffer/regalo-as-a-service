// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import MUIProvider from './mui-provider'; // Importa el componente que creamos arriba

export const metadata: Metadata = {
  title: 'Te voy a cambiar el nombre',
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