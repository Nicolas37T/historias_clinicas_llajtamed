export type Role = 'student' | 'admin'

export interface Profile {
  id: string
  full_name: string
  carnet: string | null
  role: Role
  created_at: string
}

export interface HistoriaClinica {
  id: string
  student_id: string
  // Datos personales
  nombre_completo: string
  fecha_nacimiento: string | null
  edad: number | null
  sexo: 'masculino' | 'femenino' | 'otro' | null
  cedula: string | null
  telefono: string | null
  direccion: string | null
  // Motivo de consulta
  motivo_consulta: string
  enfermedad_actual: string | null
  // Antecedentes
  antecedentes_personales: string | null
  antecedentes_familiares: string | null
  alergias: string | null
  medicamentos_actuales: string | null
  // Examen físico
  peso: number | null
  talla: number | null
  tension_arterial: string | null
  frecuencia_cardiaca: number | null
  temperatura: number | null
  // Diagnóstico
  diagnostico_presuntivo: string | null
  plan_tratamiento: string | null
  observaciones: string | null
  // Metadatos
  estado: 'pendiente' | 'revisado'
  created_at: string
  updated_at: string
  // Joins
  profiles?: Profile
}
