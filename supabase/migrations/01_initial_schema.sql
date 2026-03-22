-- 1. Tabla de Perfiles (Extiende Auth.Users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  carnet text unique,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz default now()
);

-- 2. Tabla de Historias Clínicas
create table public.historias_clinicas (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Datos personales
  nombre_completo text not null,
  fecha_nacimiento date,
  edad int,
  sexo text check (sexo in ('masculino', 'femenino', 'otro')),
  cedula text,
  telefono text,
  direccion text,
  
  -- Motivo de consulta
  motivo_consulta text not null,
  enfermedad_actual text,
  
  -- Antecedentes
  antecedentes_personales text,
  antecedentes_familiares text,
  alergias text,
  medicamentos_actuales text,
  
  -- Examen físico
  peso numeric,
  talla numeric,
  tension_arterial text,
  frecuencia_cardiaca int,
  temperatura numeric,
  
  -- Diagnóstico e impresión
  diagnostico_presuntivo text,
  plan_tratamiento text,
  observaciones text,
  
  -- Metadatos
  estado text default 'pendiente' check (estado in ('pendiente', 'revisado')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.profiles enable row level security;
alter table public.historias_clinicas enable row level security;

-- Políticas para Profiles
create policy "Perfiles visibles por todos" on public.profiles
  for select using (true);

create policy "Perfiles editables por el dueño" on public.profiles
  for update using (auth.uid() = id);

-- Políticas para Historias Clínicas
create policy "Estudiantes ven su propia historia"
  on public.historias_clinicas for select
  using (auth.uid() = student_id);

create policy "Estudiantes crean su propia historia"
  on public.historias_clinicas for insert
  with check (auth.uid() = student_id);

create policy "Estudiantes editan su propia historia"
  on public.historias_clinicas for update
  using (auth.uid() = student_id);

create policy "Admins ven todas las historias"
  on public.historias_clinicas for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Función y Trigger para crear perfil al registrarse
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, carnet, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Nuevo Estudiante'),
    new.raw_user_meta_data->>'carnet',
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
