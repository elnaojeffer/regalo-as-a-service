# 🎄 RaaS - Regalos as a Service

![Status](https://img.shields.io/badge/Status-Production-success)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20MUI-blue)

Plataforma WebApp desarrollada para gestionar el intercambio de "Amigo Secreto" de la empresa (Sedes Quito y Guayaquil). Permite registro de usuarios, gestión de listas de deseos y ejecución de un algoritmo de asignación aleatoria circular.

## 🚀 Características

* **Registro & Login:** Autenticación segura vía Email/Password.
* **Gestión de Deseos:** Los usuarios pueden agregar hasta 3 opciones de regalo.
* **Dashboard Interactivo:** Contadores regresivos para el Sorteo y el Intercambio.
* **Algoritmo Circular:** Garantiza que nadie se regale a sí mismo y soporta número impar de participantes.
* **Notificaciones:** Envío automático de correos personalizados con la asignación y los deseos del destinatario.
* **Panel de Admin:** Zona protegida para configuración de fechas y ejecución del sorteo.

## 🛠️ Tech Stack

* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), React.
* **UI Library:** [Material UI (MUI v6)](https://mui.com/).
* **Backend / DB:** [Supabase](https://supabase.com/) (PostgreSQL + Auth).
* **Emails:** [Resend](https://resend.com/).
* **Hosting:** [Vercel](https://vercel.com/).

## ⚙️ Configuración del Proyecto

### 1. Variables de Entorno
Renombra `.env.example` a `.env.local` y configura:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_secreta
RESEND_API_KEY=re_123456789