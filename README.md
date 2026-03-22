# Historias Clínicas

Sistema web para que estudiantes llenen su historia clínica y administradores puedan revisarlas.

## Stack
- **Frontend**: Next.js 15, Tailwind CSS, ShadCN UI
- **Base de datos & Auth**: Supabase (PostgreSQL + GoTrue)
- **Deploy**: Vercel

## Setup local

1. Clonar el repositorio
2. `npm install`
3. Crear `.env.local` con las credenciales de Supabase (ver `.env.example`)
4. Ejecutar las migraciones SQL en Supabase (ver `supabase/migrations/`)
5. `npm run dev`

## Roles

- **student**: puede ver y llenar su propia historia clínica
- **admin**: puede ver todas las historias y marcarlas como revisadas
