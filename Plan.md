# Roadmap del Proyecto: Amigo Secreto TI
Antes de codificar, definamos el flujo de trabajo para tenerlo listo antes del viernes.

1. Base de Datos (Supabase)
[ ] Crear Proyecto en Supabase.

[ ] Tabla profiles: Extensión de auth para guardar nombres y sede (UIO/GYE).

[ ] Tabla wishes: id, user_id, description, image_url (opcional).

[ ] Tabla matches: santa_id, recipient_id (Solo lectura para admins).

[ ] Storage: Bucket público para subir fotos de los regalos (opcional).

[ ] RLS Policies: Asegurar que nadie borre los deseos de otro.

2. Backend (Next.js API Routes + Supabase Admin)
[ ] Auth: Configurar Supabase Auth (Email/Password).

[ ] API /api/sorteo:

Obtener usuarios.

Ejecutar algoritmo de Derangement (nadie se regala a sí mismo).

Insertar pares en matches.

Disparar emails usando Resend.

3. Frontend (Next.js + Tailwind)
[ ] Login/Register UI: Pantalla de entrada.

[ ] Dashboard (Home):

Navbar (Salir, Perfil).

Grid de participantes y sus deseos.

Modal/Formulario para "Agregar mi deseo".

[ ] Admin Panel: Botón de pánico para ejecutar el sorteo.

🎨 Especificación Técnica: Frontend
Aquí tienes el detalle para la construcción del Front.

Markdown

# 🎄 Frontend Spec: Amigo Secreto WebApp

## 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (Theme: Holiday - Red/Green/White)
- **Icons:** Lucide React
- **State/Data:** Supabase Client Component Hooks
- **Hosting:** Vercel

## 📂 Estructura de Directorios Sugerida
```text
/app
 ├── layout.tsx         # Global layout (Font setup, Toaster provider)
 ├── page.tsx           # Landing + Login/Register Form
 ├── /dashboard
 │    ├── page.tsx      # Main View (Lista de deseos + Input)
 │    ├── loading.tsx   # Skeleton loader
 │    └── layout.tsx    # Protected Route Wrapper (Check session)
 ├── /admin
 │    └── page.tsx      # Panel de control (Botón Sorteo)
/components
 ├── ui/                # Botones, Inputs, Cards (Tailwind components)
 ├── WishCard.tsx       # Componente para mostrar el deseo de un usuario
 ├── AddWishForm.tsx    # Formulario para agregar deseos
 ├── NavBar.tsx         # Navegación y Logout
/lib
 ├── supabase.ts        # Cliente de Supabase
 └── utils.ts           # Helpers
🧩 Detalle de Vistas (Pages)
1. Login / Landing (app/page.tsx)
Objetivo: Permitir registro e ingreso.

Diseño: Centrado, fondo festivo (gradiente rojo/verde sutil).

Lógica:

Toggle entre "Iniciar Sesión" y "Registrarse".

Inputs: Email, Password.

Si es Registro: Input adicional Nombre Completo y Select Sede (Quito/Guayaquil).

Al éxito -> router.push('/dashboard').

2. Dashboard Principal (app/dashboard/page.tsx)
Objetivo: Ver deseos de compañeros y registrar los propios.

Sección Superior (Header):

Saludo: "Hola, {user.name} 👋".

Botón CTA: "🎅 Agregar Deseo" (Abre Modal).

Sección Central (Grid):

Tabla o Grid de Cards.

Renderiza componentes <WishCard />.

Filtro opcional: Ver solo Quito / Ver solo Guayaquil / Ver Todos.

Data Fetching:

useEffect para traer supabase.from('wishes').select('*, profiles(full_name, city)').

3. Componente: WishCard (components/WishCard.tsx)
Props: { name, city, wishes[], avatarUrl? } Visual:

Borde redondeado, sombra suave.

Badge para la ciudad (Ej: 🏔️ UIO, 🏖️ GYE).

Lista numerada de deseos (1, 2, 3).

Si el usuario logueado es el dueño de la tarjeta -> Mostrar botón "Editar/Borrar".

4. Admin Panel (app/admin/page.tsx)
Objetivo: Ejecutar el sorteo.

Seguridad: Verificar en useEffect si user.email === 'admin@tuempresa.com'. Si no, redirigir a dashboard.

UI:

Contador de inscritos totales.

Botón Grande Rojo: "REALIZAR SORTEO Y ENVIAR CORREOS".

Tabla de Logs: Muestra si el sorteo ya se hizo (query a tabla matches).

Muestra lista de resultados (Quién regala a Quién) por si los correos fallan.

🎨 Guía de Estilos (Tailwind Classes)
Para mantener el espíritu navideño sin ser "hortera":

Primary Color: bg-red-600 (Pantone Christmas Red) hover: bg-red-700

Secondary: text-green-700 (Forest Green)

Background: bg-slate-50 (Nieve sucia / Blanco hueso)

Cards: bg-white shadow-lg rounded-xl border border-slate-100

📦 Dependencias Necesarias
Ejecutar en terminal:

Bash

npx create-next-app@latest amigo-secreto --typescript --tailwind --eslint
cd amigo-secreto
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs lucide-react canvas-confetti
(Nota: canvas-confetti es vital para cuando se registren o envíen el sorteo 🎉)


---

### ¿Cómo seguimos?
Ya tienes el Front definido. El siguiente paso lógico es configurar la **Base de Datos en Supabase** para que coincida con lo que el Frontend va a consultar.

¿Te paso el script SQL para crear las tablas en Supabase de una sola vez?