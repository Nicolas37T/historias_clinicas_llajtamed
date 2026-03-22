'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { HistoriaClinica } from '@/lib/types'
import { 
  User, 
  ClipboardList, 
  History as HistoryIcon, 
  Activity, 
  Stethoscope,
  LogOut,
  Save,
  CheckCircle2,
  Clock,
  HeartPulse,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'

const TABS_ORDER = ['personales', 'motivo', 'antecedentes', 'examen', 'diagnostico']

export default function HistoriaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personales')
  const [history, setHistory] = useState<Partial<HistoriaClinica>>({
    nombre_completo: '',
    motivo_consulta: '',
    estado: 'pendiente'
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('historias_clinicas')
        .select('*')
        .eq('student_id', user.id)
        .single()

      if (data) {
        setHistory(data)
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setHistory(prev => ({ ...prev, nombre_completo: profile.full_name }))
        }
      }
      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const submission = {
      ...history,
      student_id: user.id,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('historias_clinicas')
      .upsert(submission)

    if (error) {
      alert('Error al guardar: ' + error.message)
    } else {
      alert('Historia clínica guardada correctamente.')
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const nextTab = () => {
    const currentIndex = TABS_ORDER.indexOf(activeTab)
    if (currentIndex < TABS_ORDER.length - 1) {
      setActiveTab(TABS_ORDER[currentIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevTab = () => {
    const currentIndex = TABS_ORDER.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(TABS_ORDER[currentIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#002D5B]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-white tracking-[0.2em] uppercase animate-pulse">Cargando Sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-32">
      {/* Brand Header */}
      <div className="w-full bg-[#002D5B] text-white shadow-2xl sticky top-0 z-50 overflow-hidden">
        <div className="h-1.5 w-full brand-gradient opacity-80" />
        <div className="container mx-auto py-5 px-6 max-w-7xl flex justify-between items-center relative">
          <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[200%] bg-amber-500/10 blur-[60px] rounded-full rotate-45 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
              <ClipboardList className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">
                Llajta<span className="brand-gradient-text">Med</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-60 font-black mt-1">Clinical History Core</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            {history.estado === 'revisado' ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-5 py-2 rounded-full text-[11px] font-black shadow-lg shadow-green-900/40">
                <CheckCircle2 className="w-4 h-4 mr-2" /> REVISADO
              </Badge>
            ) : (
              <Badge className="brand-gradient text-white border-0 px-5 py-2 rounded-full text-[11px] font-black shadow-lg shadow-red-900/40 animate-pulse">
                <Clock className="w-4 h-4 mr-2" /> PENDIENTE
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/60 hover:text-white hover:bg-white/10 font-black transition-all gap-2 text-xs uppercase tracking-widest">
              <LogOut className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-12 px-6 max-w-7xl animate-in">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-3">
              <HeartPulse className="w-3.5 h-3.5 shadow-sm" /> Módulo Estudiante
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Registro de Historia Clínica</h2>
            <p className="text-slate-500 font-medium text-lg mt-2">Bienvenido, {history.nombre_completo}. Por favor completa todos los campos para la revisión docente.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-10">
          <TabsList className="flex flex-wrap md:flex-nowrap gap-3 bg-white/50 backdrop-blur-md h-auto p-2 border border-slate-200/60 rounded-[1.5rem] shadow-sm overflow-x-auto no-scrollbar">
            <TabItem value="personales" icon={<User />} label="Personales" />
            <TabItem value="motivo" icon={<Activity />} label="Motivo" />
            <TabItem value="antecedentes" icon={<HistoryIcon />} label="Antecedentes" />
            <TabItem value="examen" icon={<Stethoscope />} label="Examen Físico" />
            <TabItem value="diagnostico" icon={<CheckCircle2 />} label="Diagnóstico" />
          </TabsList>

          <Card className="border-0 shadow-2xl shadow-blue-900/10 bg-white rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 md:p-14">
              {/* Personales */}
              <TabsContent value="personales" className="mt-0 space-y-10 animate-in">
                <SectionHeader icon={<User />} title="Datos del Paciente" subtitle="Información sociodemográfica básica." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FormItem label="Nombre Completo" icon={<User />}>
                    <Input 
                      value={history.nombre_completo || ''} 
                      onChange={e => setHistory({...history, nombre_completo: e.target.value})}
                      placeholder="Ej. Juan Pérez"
                      className="h-14 border-slate-300 bg-white focus:ring-primary/20 transition-all rounded-2xl font-bold text-slate-700"
                    />
                  </FormItem>
                  <FormItem label="Cédula de Identidad">
                    <Input 
                      value={history.cedula || ''} 
                      onChange={e => setHistory({...history, cedula: e.target.value})}
                      className="h-14 border-slate-300 bg-white font-bold rounded-2xl px-6"
                    />
                  </FormItem>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormItem label="Nacimiento">
                      <Input 
                        type="date" 
                        value={history.fecha_nacimiento || ''} 
                        onChange={e => setHistory({...history, fecha_nacimiento: e.target.value})}
                        className="h-14 border-slate-300 rounded-2xl bg-white"
                      />
                    </FormItem>
                    <FormItem label="Edad">
                      <Input 
                        type="number" 
                        value={history.edad || ''} 
                        onChange={e => setHistory({...history, edad: parseInt(e.target.value)})}
                        className="h-14 border-slate-300 rounded-2xl bg-white text-center font-black"
                      />
                    </FormItem>
                  </div>
                  <FormItem label="Sexo">
                    <Select 
                      value={history.sexo || ''} 
                      onValueChange={v => setHistory({...history, sexo: v as any})}
                    >
                      <SelectTrigger className="h-14 border-slate-300 bg-white rounded-2xl font-bold text-slate-700">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                        <SelectItem value="masculino" className="font-bold">Masculino</SelectItem>
                        <SelectItem value="femenino" className="font-bold">Femenino</SelectItem>
                        <SelectItem value="otro" className="font-bold">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                  <FormItem label="Teléfono">
                    <Input 
                      value={history.telefono || ''} 
                      onChange={e => setHistory({...history, telefono: e.target.value})}
                      className="h-14 border-slate-300 rounded-2xl bg-white font-bold"
                    />
                  </FormItem>
                  <FormItem label="Dirección">
                    <Input 
                      value={history.direccion || ''} 
                      onChange={e => setHistory({...history, direccion: e.target.value})}
                      className="h-14 border-slate-300 rounded-2xl bg-white font-bold"
                    />
                  </FormItem>
                </div>
                <div className="pt-10 flex justify-end">
                  <Button onClick={nextTab} className="h-14 px-8 rounded-2xl bg-[#002D5B] text-white font-black text-lg gap-2 hover:bg-[#002D5B]/90 shadow-lg shadow-blue-900/20">
                    Siguiente <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </TabsContent>

              {/* Motivo */}
              <TabsContent value="motivo" className="mt-0 space-y-10 animate-in">
                <SectionHeader icon={<Activity />} title="Cuadro Clínico" subtitle="Evaluación del síntoma principal." />
                <div className="space-y-8">
                  <FormItem label="Motivo de Consulta">
                    <Textarea 
                      value={history.motivo_consulta || ''} 
                      onChange={e => setHistory({...history, motivo_consulta: e.target.value})}
                      rows={4}
                      className="border-slate-300 bg-white focus:ring-primary/20 rounded-[2rem] p-6 font-bold text-slate-800 leading-relaxed shadow-sm"
                      placeholder="Describa el motivo principal..."
                    />
                  </FormItem>
                  <FormItem label="Historia de la Enfermedad Actual">
                    <Textarea 
                      value={history.enfermedad_actual || ''} 
                      onChange={e => setHistory({...history, enfermedad_actual: e.target.value})}
                      rows={6}
                      className="border-slate-300 bg-white focus:ring-primary/20 rounded-[2rem] p-6 leading-relaxed"
                    />
                  </FormItem>
                </div>
                <div className="pt-10 flex justify-between">
                  <Button onClick={prevTab} variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 font-bold text-lg gap-2">
                    <ArrowLeft className="w-5 h-5" /> Anterior
                  </Button>
                  <Button onClick={nextTab} className="h-14 px-8 rounded-2xl bg-[#002D5B] text-white font-black text-lg gap-2 hover:bg-[#002D5B]/90 shadow-lg shadow-blue-900/20">
                    Siguiente <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </TabsContent>

              {/* Antecedentes */}
              <TabsContent value="antecedentes" className="mt-0 space-y-10 animate-in">
                <SectionHeader icon={<HistoryIcon />} title="Antecedentes" subtitle="Antepasados y condiciones previas." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FormItem label="Antecedentes Personales">
                    <Textarea 
                      value={history.antecedentes_personales || ''} 
                      onChange={e => setHistory({...history, antecedentes_personales: e.target.value})}
                      className="border-slate-300 bg-white rounded-[2rem] min-h-[160px] p-6"
                    />
                  </FormItem>
                  <FormItem label="Antecedentes Familiares">
                    <Textarea 
                      value={history.antecedentes_familiares || ''} 
                      onChange={e => setHistory({...history, antecedentes_familiares: e.target.value})}
                      className="border-slate-300 bg-white rounded-[2rem] min-h-[160px] p-6"
                    />
                  </FormItem>
                  <FormItem label="Alergias">
                    <Input 
                      value={history.alergias || ''} 
                      onChange={e => setHistory({...history, alergias: e.target.value})}
                      className="h-14 border-red-300 bg-white rounded-2xl font-black text-red-600 focus:ring-red-500/10"
                    />
                  </FormItem>
                  <FormItem label="Medicamentos Actuales">
                    <Input 
                      value={history.medicamentos_actuales || ''} 
                      onChange={e => setHistory({...history, medicamentos_actuales: e.target.value})}
                      className="h-14 border-blue-300 bg-white rounded-2xl font-black text-[#002D5B] focus:ring-blue-500/10"
                    />
                  </FormItem>
                </div>
                <div className="pt-10 flex justify-between">
                  <Button onClick={prevTab} variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 font-bold text-lg gap-2">
                    <ArrowLeft className="w-5 h-5" /> Anterior
                  </Button>
                  <Button onClick={nextTab} className="h-14 px-8 rounded-2xl bg-[#002D5B] text-white font-black text-lg gap-2 hover:bg-[#002D5B]/90 shadow-lg shadow-blue-900/20">
                    Siguiente <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </TabsContent>

              {/* Examen */}
              <TabsContent value="examen" className="mt-0 space-y-10 animate-in">
                <SectionHeader icon={<HeartPulse />} title="Examen Físico" subtitle="Signos vitales y hallazgos." />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <VitalSignItem label="Peso (kg)" value={history.peso} onChange={v => setHistory({...history, peso: v})} step="0.1" />
                  <VitalSignItem label="Talla (m)" value={history.talla} onChange={v => setHistory({...history, talla: v})} step="0.01" />
                  <VitalSignItem label="P. Arterial" value={history.tension_arterial} isString onChange={v => setHistory({...history, tension_arterial: v as string})} placeholder="120/80" />
                  <VitalSignItem label="F.C. (lpm)" value={history.frecuencia_cardiaca} onChange={v => setHistory({...history, frecuencia_cardiaca: v})} />
                  <VitalSignItem label="Temp. (°C)" value={history.temperatura} onChange={v => setHistory({...history, temperatura: v})} step="0.1" />
                </div>
                <div className="pt-10 flex justify-between">
                  <Button onClick={prevTab} variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 font-bold text-lg gap-2">
                    <ArrowLeft className="w-5 h-5" /> Anterior
                  </Button>
                  <Button onClick={nextTab} className="h-14 px-8 rounded-2xl bg-[#002D5B] text-white font-black text-lg gap-2 hover:bg-[#002D5B]/90 shadow-lg shadow-blue-900/20">
                    Siguiente <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </TabsContent>

              {/* Diagnostico */}
              <TabsContent value="diagnostico" className="mt-0 space-y-10 animate-in">
                <SectionHeader icon={<CheckCircle2 />} title="Diagnóstico / Plan" subtitle="Conclusión y seguimiento médico." />
                <div className="space-y-10">
                  <FormItem label="Diagnóstico Presuntivo">
                    <Textarea 
                      value={history.diagnostico_presuntivo || ''} 
                      onChange={e => setHistory({...history, diagnostico_presuntivo: e.target.value})}
                      rows={4}
                      className="border-[#002D5B]/40 bg-[#002D5B]/5 rounded-[2rem] p-8 font-black text-[#002D5B] text-xl tracking-tight leading-relaxed shadow-inner"
                    />
                  </FormItem>
                  <FormItem label="Plan de Tratamiento">
                    <Textarea 
                      value={history.plan_tratamiento || ''} 
                      onChange={e => setHistory({...history, plan_tratamiento: e.target.value})}
                      rows={5}
                      className="border-slate-300 bg-white rounded-[2rem] p-6 leading-relaxed"
                    />
                  </FormItem>
                </div>
                <div className="pt-10 flex justify-start gap-4">
                  <Button onClick={prevTab} variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 font-bold text-lg gap-2">
                    <ArrowLeft className="w-5 h-5" /> Anterior
                  </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Card>

          {/* Floating Action Button */}
          <div className="fixed bottom-10 left-0 right-0 z-40 px-6 flex justify-center pointer-events-none">
            <Button 
              size="lg" 
              onClick={handleSave} 
              disabled={saving}
              className="pointer-events-auto h-16 px-16 rounded-full font-black text-xl shadow-2xl shadow-red-900/30 hover:scale-105 active:scale-95 transition-all gap-3 brand-gradient border-0 text-white"
            >
              {saving ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-6 h-6 drop-shadow-md" />
              )}
              {saving ? 'Guardando...' : 'Guardar Información'}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

function TabItem({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex-1 min-w-[140px] md:min-w-0 py-4 font-black rounded-2xl transition-all gap-2.5 data-[state=active]:bg-[#002D5B] data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-900/20 data-[state=inactive]:text-slate-500 hover:bg-white hover:text-[#002D5B] border border-transparent"
    >
      <div className="group-data-[state=active]:text-amber-400 transition-colors">
        {icon}
      </div>
      <span className="md:inline uppercase text-[10px] tracking-widest">{label}</span>
    </TabsTrigger>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-6 pb-8 border-b border-slate-200">
      <div className="bg-[#002D5B] text-amber-400 p-4 rounded-2xl shadow-lg shadow-blue-900/10">
        {icon}
      </div>
      <div>
        <h3 className="text-2xl font-black text-[#002D5B] tracking-tight">{title}</h3>
        <p className="text-base text-slate-400 font-semibold">{subtitle}</p>
      </div>
    </div>
  )
}

function FormItem({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 ml-1">
        {icon} {label}
      </Label>
      {children}
    </div>
  )
}

function VitalSignItem({ label, value, onChange, isString, step, placeholder }: { label: string; value: any; onChange: (v: any) => void; isString?: boolean; step?: string; placeholder?: string }) {
  return (
    <div className="space-y-3">
      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 text-center block">{label}</Label>
      <div className="relative group">
        <Input 
          type={isString ? "text" : "number"}
          step={step}
          placeholder={placeholder}
          value={value || ''} 
          onChange={e => onChange(isString ? e.target.value : parseFloat(e.target.value))}
          className="h-16 border-slate-300 bg-white shadow-sm text-center font-black text-2xl focus:ring-[#002D5B]/10 rounded-2xl transition-all"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1 brand-gradient scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 rounded-b-2xl" />
      </div>
    </div>
  )
}
