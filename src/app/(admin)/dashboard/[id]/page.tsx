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
  Users,
  Clipboard, 
  History as HistoryIcon, 
  Activity, 
  Stethoscope,
  HeartPulse,
  Save,
  ChevronRight,
  ShieldAlert,
  FileText
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
    <div className="flex h-screen items-center justify-center bg-[#002D5B]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-white tracking-[0.2em] uppercase animate-pulse">Abriendo Expediente...</p>
      </div>
    </div>
  )
  
  if (!history) return <div className="p-10 text-center font-bold text-slate-400">Historia no encontrada.</div>

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      {/* Detail Header (Branded Navy) */}
      <div className="w-full bg-[#002D5B] text-white shadow-2xl sticky top-0 z-50 overflow-hidden">
        <div className="h-1.5 w-full brand-gradient opacity-80" />
        <div className="container mx-auto py-5 px-6 max-w-5xl flex justify-between items-center relative">
          <Button variant="ghost" onClick={() => router.back()} className="font-black gap-3 text-white/60 hover:text-white hover:bg-white/10 transition-all uppercase text-xs tracking-widest">
            <ArrowLeft className="w-5 h-5 text-amber-400" /> <span className="hidden sm:inline">Volver</span>
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <h1 className="text-sm font-black text-white tracking-widest leading-none uppercase">{history.nombre_completo}</h1>
              <p className="text-[9px] uppercase font-bold text-white/40 tracking-[0.3em] mt-1.5 italic">Expediente LlajtaMed No. {id.slice(0, 8)}</p>
            </div>
            <div className="h-10 w-px bg-white/10 hidden sm:block mx-2" />
            {history.estado === 'revisado' ? (
              <Badge className="bg-green-500 text-white border-0 px-5 py-2 rounded-full text-[10px] font-black shadow-lg shadow-green-900/40">
                <CheckCircle2 className="w-4 h-4 mr-2" /> REVISADO
              </Badge>
            ) : (
              <Badge className="brand-gradient text-white border-0 px-5 py-2 rounded-full text-[10px] font-black shadow-lg shadow-red-900/40 animate-pulse">
                <Clock className="w-4 h-4 mr-2" /> PENDIENTE
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-12 px-6 max-w-5xl animate-in">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Main Content - Clinical Report Style */}
          <div className="flex-1 space-y-10 w-full">
            <Section title="Evaluación Sociodemográfica" icon={<User />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-10">
                <InfoItem label="Nombre Completo" value={history.nombre_completo} />
                <InfoItem label="Cédula de Identidad" value={history.cedula} />
                <InfoItem label="Fecha de Nacimiento" value={history.fecha_nacimiento} />
                <InfoItem label="Edad Biológica" value={history.edad?.toString() + ' años'} />
                <InfoItem label="Identidad de Género" value={history.sexo} className="capitalize" />
                <InfoItem label="Contacto Telefónico" value={history.telefono} />
                <InfoItem label="Dirección Residencial" value={history.direccion} fullWidth />
              </div>
            </Section>

            <Section title="Motivo de Ingreso y Evolución" icon={<FileText />}>
              <div className="space-y-10">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002D5B] mb-3 ml-1 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Motivo Principal de Consulta
                  </h4>
                  <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-200 font-bold text-[#002D5B] text-lg leading-relaxed shadow-inner italic">
                    {history.motivo_consulta || 'N/A'}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Historia Cronológica de la Enfermedad Actual</h4>
                  <div className="p-8 bg-white rounded-[2rem] border border-slate-100 text-slate-600 font-medium leading-[1.8] shadow-sm whitespace-pre-wrap">
                    {history.enfermedad_actual || 'Sin registros médicos detallados.'}
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Módulo de Antecedentes" icon={<HistoryIcon />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-[#002D5B]/[0.02] rounded-[2rem] border border-[#002D5B]/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002D5B] mb-4 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Personales Patológicos
                  </h4>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{history.antecedentes_personales || '-'}</p>
                </div>
                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Antecedentes Familiares
                  </h4>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">{history.antecedentes_familiares || '-'}</p>
                </div>
                <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-1.5">Alergias Detectadas</h4>
                    <p className="font-black text-red-700 text-lg tracking-tight uppercase">{history.alergias || 'Ninguna'}</p>
                  </div>
                  <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002D5B] mb-1.5">Farmacología Actual</h4>
                    <p className="font-black text-[#002D5B] text-lg tracking-tight uppercase">{history.medicamentos_actuales || 'Ninguno'}</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Monitorización de Signos Vitales" icon={<HeartPulse />}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <VitalBox label="Peso" value={history.peso} unit="kg" color="amber" />
                <VitalBox label="Talla" value={history.talla} unit="m" color="amber" />
                <VitalBox label="P. Arterial" value={history.tension_arterial} color="red" />
                <VitalBox label="F.C." value={history.frecuencia_cardiaca} unit="lpm" color="red" />
                <VitalBox label="Temperatura" value={history.temperatura} unit="°C" color="red" />
              </div>
            </Section>

            <Section title="Diagnóstico Presuntivo y Planificación" icon={<CheckCircle2 />}>
              <div className="space-y-10">
                <div className="relative group overflow-hidden rounded-[2.5rem]">
                   <div className="absolute inset-0 brand-gradient opacity-10 group-hover:opacity-20 transition-opacity" />
                   <div className="relative p-10 bg-[#002D5B] text-white shadow-2xl shadow-blue-900/40">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 mb-4 ml-1">Análisis Clínico / Diagnóstico PPS</h4>
                    <p className="text-3xl font-black text-white tracking-tight leading-snug">{history.diagnostico_presuntivo || 'Pendiente de evaluación profesional.'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002D5B] ml-2 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Plan de Tratamiento
                    </h4>
                    <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-base font-bold text-slate-700 leading-relaxed min-h-[160px]">
                      {history.plan_tratamiento || '-'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Observaciones Clínicas</h4>
                    <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] shadow-inner text-base font-medium text-slate-500 leading-relaxed min-h-[160px]">
                      {history.observaciones || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Branded Sidebar - Admin Control */}
          <div className="w-full lg:w-96 sticky top-28 space-y-10">
            <Card className="border-0 shadow-2xl shadow-blue-900/10 bg-white rounded-[2.5rem] overflow-hidden group">
              <CardHeader className="bg-[#002D5B]/[0.02] border-b border-slate-50 pt-10 pb-8 text-center px-10">
                <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-[#002D5B]">Validación Docente</CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <p className="text-sm text-center text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                  Autorización de Expedientes Clínicos
                </p>
                <Button 
                  onClick={toggleStatus} 
                  disabled={updating}
                  className={`w-full h-16 rounded-[1.75rem] font-black text-lg shadow-2xl transition-all active:scale-95 border-0 ${
                    history.estado === 'pendiente' 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20' 
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-red-900/20'
                  }`}
                >
                  {updating ? (
                    <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {history.estado === 'pendiente' ? <CheckCircle2 className="w-6 h-6 mr-3" /> : <Clock className="w-6 h-6 mr-3" />}
                      {history.estado === 'pendiente' ? 'APROBAR REVISIÓN' : 'REABRIR CASO'}
                    </>
                  )}
                </Button>
                <div className="text-center">
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                    Auditado por LlajtaMed OS
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-[#002D5B] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 brand-gradient opacity-10 group-hover:opacity-20 transition-opacity" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 mb-4 text-center relative z-10">Inteligencia Clínica</p>
              <p className="text-xs text-center text-white/70 font-bold leading-[1.8] relative z-10 italic">
                "La precisión en la historia clínica es el primer paso hacia la excelencia médica."
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
    <Card className="border-0 shadow-2xl shadow-blue-900/10 bg-white rounded-[3rem] overflow-hidden group hover:shadow-blue-900/20 transition-all duration-700">
      <CardHeader className="flex flex-row items-center gap-6 py-10 px-10 border-b border-slate-50">
        <div className="bg-[#002D5B] text-amber-400 p-4 rounded-2xl shadow-xl shadow-blue-900/10 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <div>
          <CardTitle className="text-3xl font-black text-[#002D5B] tracking-tight">{title}</CardTitle>
          <div className="h-1 w-12 brand-gradient rounded-full mt-1 group-hover:w-24 transition-all duration-700" />
        </div>
      </CardHeader>
      <CardContent className="p-12">
        {children}
      </CardContent>
    </Card>
  )
}

function InfoItem({ label, value, fullWidth, className }: { label: string; value: string | null | undefined; fullWidth?: boolean; className?: string }) {
  return (
    <div className={`space-y-2 ${fullWidth ? 'col-span-full' : ''}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">{label}</span>
      <div className={`text-base font-black text-[#002D5B] bg-slate-50/70 p-4 px-6 rounded-2xl border border-slate-100 group-hover:border-[#002D5B]/10 transition-colors ${className}`}>
        {value || '-'}
      </div>
    </div>
  )
}

function VitalBox({ label, value, unit, color }: { label: string; value: any; unit?: string; color: 'amber' | 'red' }) {
  const colorClass = color === 'amber' ? 'text-amber-500' : 'text-red-500'
  
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-center group/vital hover:shadow-md transition-all">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 truncate">{label}</p>
      <div className={`text-2xl font-black tracking-tighter ${colorClass} group-hover/vital:scale-110 transition-transform`}>
        {value || '-'} <span className="text-xs text-slate-300 ml-0.5">{unit}</span>
      </div>
    </div>
  )
}

function Zap({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
