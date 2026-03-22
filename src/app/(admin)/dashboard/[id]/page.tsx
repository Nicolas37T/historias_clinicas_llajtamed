'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HistoriaClinica } from '@/lib/types'
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  User, 
  Clipboard, 
  History as HistoryIcon, 
  Activity, 
  Stethoscope,
  HeartPulse,
  Save,
  ChevronRight
} from 'lucide-react'

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [history, setHistory] = useState<HistoriaClinica | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadHistory() {
      const { data, error } = await supabase
        .from('historias_clinicas')
        .select('*, profiles(full_name, carnet)')
        .eq('id', id)
        .single()

      if (data) setHistory(data as any)
      setLoading(false)
    }
    loadHistory()
  }, [id, supabase])

  const toggleStatus = async () => {
    if (!history) return
    setUpdating(true)
    const newStatus = history.estado === 'pendiente' ? 'revisado' : 'pendiente'
    
    const { error } = await supabase
      .from('historias_clinicas')
      .update({ estado: newStatus })
      .eq('id', id)

    if (!error) {
      setHistory({ ...history, estado: newStatus })
    }
    setUpdating(false)
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-xl shadow-primary/20"></div>
    </div>
  )
  
  if (!history) return <div className="p-10 text-center font-bold text-slate-400">Historia no encontrada.</div>

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Detail Header */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-50 glass">
        <div className="container mx-auto py-4 px-4 max-w-5xl flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold gap-2 text-slate-500 hover:text-primary transition-all">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Volver</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">{history.nombre_completo}</h1>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">Carnet: {history.profiles?.carnet || '-'}</p>
            </div>
            <div className="h-10 w-px bg-slate-100 hidden sm:block mx-2" />
            {history.estado === 'revisado' ? (
              <Badge className="bg-green-500 text-white border-0 px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-green-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> REVISADO
              </Badge>
            ) : (
              <Badge className="bg-amber-500 text-white border-0 px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-amber-200">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> PENDIENTE
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-10 px-4 max-w-5xl animate-in">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Main Content */}
          <div className="flex-1 space-y-8 w-full">
            <Section title="Información Personal" icon={<User />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                <InfoItem label="Nombre Completo" value={history.nombre_completo} />
                <InfoItem label="C.I." value={history.cedula} />
                <InfoItem label="Fecha Nacimiento" value={history.fecha_nacimiento} />
                <InfoItem label="Edad" value={history.edad?.toString()} />
                <InfoItem label="Sexo" value={history.sexo} className="capitalize" />
                <InfoItem label="Teléfono" value={history.telefono} />
                <InfoItem label="Dirección" value={history.direccion} fullWidth />
              </div>
            </Section>

            <Section title="Motivo de Consulta y Enfermedad Actual" icon={<Clipboard />}>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Motivo de Consulta</h4>
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 font-bold text-slate-800 leading-relaxed shadow-inner">
                    {history.motivo_consulta || 'Sin información.'}
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Historia de la Enfermedad Actual</h4>
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed shadow-inner whitespace-pre-wrap">
                    {history.enfermedad_actual || 'Sin información.'}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Antecedentes" icon={<HistoryIcon />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-2">
                    <User className="w-3 h-3" /> Personales
                  </h4>
                  <p className="text-sm font-medium text-indigo-900 leading-relaxed">{history.antecedentes_personales || '-'}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Familiares
                  </h4>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{history.antecedentes_familiares || '-'}</p>
                </div>
                <div className="col-span-full grid grid-cols-2 gap-6">
                  <div className="p-4 bg-destructive/[0.03] rounded-2xl border border-destructive/10">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-destructive mb-1">Alergias</h4>
                    <p className="font-black text-destructive tracking-tight">{history.alergias || 'Ninguna conocida'}</p>
                  </div>
                  <div className="p-4 bg-primary/[0.03] rounded-2xl border border-primary/10">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary mb-1">Medicamentos</h4>
                    <p className="font-black text-primary tracking-tight">{history.medicamentos_actuales || 'Ninguno'}</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Examen Físico (Signos Vitales)" icon={<HeartPulse />}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <VitalBox label="Peso" value={history.peso} unit="kg" />
                <VitalBox label="Talla" value={history.talla} unit="m" />
                <VitalBox label="P. Arterial" value={history.tension_arterial} />
                <VitalBox label="F.C." value={history.frecuencia_cardiaca} unit="lpm" />
                <VitalBox label="Temp" value={history.temperatura} unit="°C" />
              </div>
            </Section>

            <Section title="Diagnóstico y Plan" icon={<CheckCircle2 />}>
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Diagnóstico Presuntivo</h4>
                  <p className="text-xl font-black text-indigo-100 tracking-tight leading-relaxed">{history.diagnostico_presuntivo || 'Pendiente de evaluación.'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan de Tratamiento</h4>
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-medium text-slate-600 leading-relaxed min-h-[100px]">
                      {history.plan_tratamiento || '-'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Observaciones</h4>
                    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-medium text-slate-600 leading-relaxed min-h-[100px]">
                      {history.observaciones || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Admin Sidebar Action */}
          <div className="w-full md:w-80 sticky top-28 space-y-6">
            <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden group">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pt-8 pb-6 text-center">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800">Acción Docente</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <p className="text-sm text-center text-slate-500 font-medium leading-relaxed">
                  Cambia el estado de la historia una vez finalizada la revisión detallada.
                </p>
                <Button 
                  onClick={toggleStatus} 
                  disabled={updating}
                  className={`w-full h-14 rounded-2xl font-black text-base shadow-xl transition-all group-active:scale-95 ${
                    history.estado === 'pendiente' 
                      ? 'bg-green-500 hover:bg-green-600 shadow-green-200' 
                      : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                  }`}
                >
                  {updating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {history.estado === 'pendiente' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Clock className="w-5 h-5 mr-2" />}
                      {history.estado === 'pendiente' ? 'MARCAR REVISADO' : 'MARCAR PENDIENTE'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 text-center">Ayuda Docente</p>
              <p className="text-xs text-center text-primary/70 font-semibold leading-relaxed">
                Revisa los signos vitales y el diagnóstico presuntivo para validar el progreso clínico del estudiante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
      <CardHeader className="flex flex-row items-center gap-4 py-8 px-8 border-b border-slate-50">
        <div className="bg-primary/10 p-3 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
          {icon}
        </div>
        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight tracking-normal">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        {children}
      </CardContent>
    </Card>
  )
}

function InfoItem({ label, value, fullWidth, className }: { label: string; value: string | null | undefined; fullWidth?: boolean; className?: string }) {
  return (
    <div className={`space-y-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{label}</span>
      <div className={`text-base font-bold text-slate-800 bg-slate-50/50 p-2.5 px-4 rounded-xl border border-slate-100 ${className}`}>
        {value || '-'}
      </div>
    </div>
  )
}

function VitalBox({ label, value, unit }: { label: string; value: any; unit?: string }) {
  return (
    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-center group hover:bg-slate-50 transition-colors">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-black text-primary tracking-tighter">
        {value || '-'} <span className="text-xs text-slate-300 ml-0.5">{unit}</span>
      </p>
    </div>
  )
}
