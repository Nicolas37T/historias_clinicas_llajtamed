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
  Clock
} from 'lucide-react'

export default function HistoriaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-primary animate-pulse">Cargando Historial...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Premium */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-50 glass">
        <div className="container mx-auto py-4 px-4 max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">LlajtaMed</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-heading">Historia Clínica Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {history.estado === 'revisado' ? (
              <Badge className="bg-green-500 text-white border-0 px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-green-200 animate-in">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> REVISADO
              </Badge>
            ) : (
              <Badge className="bg-amber-500 text-white border-0 px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-amber-200 animate-in">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> PENDIENTE
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-destructive hover:bg-destructive/5 font-bold transition-all gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 px-4 max-w-5xl animate-in">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Registro de Paciente</h2>
          <p className="text-slate-500 font-medium">Completa la información detallada para la evaluación docente.</p>
        </div>

        <Tabs defaultValue="personales" className="flex flex-col space-y-8">
          <TabsList className="flex flex-wrap md:flex-nowrap gap-2 bg-transparent h-auto p-0 border-0">
            <TabItem value="personales" icon={<User className="w-4 h-4" />} label="Personales" />
            <TabItem value="motivo" icon={<Activity className="w-4 h-4" />} label="Motivo" />
            <TabItem value="antecedentes" icon={<HistoryIcon className="w-4 h-4" />} label="Antecedentes" />
            <TabItem value="examen" icon={<Stethoscope className="w-4 h-4" />} label="Examen Físico" />
            <TabItem value="diagnostico" icon={<CheckCircle2 className="w-4 h-4" />} label="Diagnóstico" />
          </TabsList>

          <Card className="border-0 shadow-2xl shadow-slate-200/60 bg-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <TabsContent value="personales" className="mt-0 space-y-8 animate-in">
                <SectionHeader icon={<User />} title="Información Personal" subtitle="Datos básicos y de contacto del paciente." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormItem label="Nombre Completo" icon={<User className="w-3.5 h-3.5" />}>
                    <Input 
                      value={history.nombre_completo || ''} 
                      onChange={e => setHistory({...history, nombre_completo: e.target.value})}
                      placeholder="Ej. Juan Pérez"
                      className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-xl font-medium"
                    />
                  </FormItem>
                  <FormItem label="Cédula de Identidad">
                    <Input 
                      value={history.cedula || ''} 
                      onChange={e => setHistory({...history, cedula: e.target.value})}
                      className="h-12 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl"
                    />
                  </FormItem>
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem label="Nacimiento">
                      <Input 
                        type="date" 
                        value={history.fecha_nacimiento || ''} 
                        onChange={e => setHistory({...history, fecha_nacimiento: e.target.value})}
                        className="h-12 border-slate-200 bg-slate-50/50 rounded-xl"
                      />
                    </FormItem>
                    <FormItem label="Edad">
                      <Input 
                        type="number" 
                        value={history.edad || ''} 
                        onChange={e => setHistory({...history, edad: parseInt(e.target.value)})}
                        className="h-12 border-slate-200 bg-slate-50/50 rounded-xl"
                      />
                    </FormItem>
                  </div>
                  <FormItem label="Sexo">
                    <Select 
                      value={history.sexo || ''} 
                      onValueChange={v => setHistory({...history, sexo: v as any})}
                    >
                      <SelectTrigger className="h-12 border-slate-200 bg-slate-50/50 rounded-xl">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                  <FormItem label="Teléfono de Contacto">
                    <Input 
                      value={history.telefono || ''} 
                      onChange={e => setHistory({...history, telefono: e.target.value})}
                      className="h-12 border-slate-200 bg-slate-50/50 rounded-xl"
                    />
                  </FormItem>
                  <FormItem label="Dirección de Domicilio">
                    <Input 
                      value={history.direccion || ''} 
                      onChange={e => setHistory({...history, direccion: e.target.value})}
                      className="h-12 border-slate-200 bg-slate-50/50 rounded-xl"
                    />
                  </FormItem>
                </div>
              </TabsContent>

              <TabsContent value="motivo" className="mt-0 space-y-8 animate-in">
                <SectionHeader icon={<Activity />} title="Cuadro Clínico" subtitle="Detalles del motivo de la consulta." />
                <div className="space-y-6">
                  <FormItem label="Motivo de Consulta Principal">
                    <Textarea 
                      value={history.motivo_consulta || ''} 
                      onChange={e => setHistory({...history, motivo_consulta: e.target.value})}
                      rows={4}
                      className="border-slate-200 bg-slate-50/50 focus:bg-white rounded-2xl resize-none font-medium p-4 leading-relaxed"
                      placeholder="Describa el motivo principal..."
                    />
                  </FormItem>
                  <FormItem label="Historia de la Enfermedad Actual">
                    <Textarea 
                      value={history.enfermedad_actual || ''} 
                      onChange={e => setHistory({...history, enfermedad_actual: e.target.value})}
                      rows={6}
                      className="border-slate-200 bg-slate-50/50 focus:bg-white rounded-2xl resize-none p-4 leading-relaxed"
                    />
                  </FormItem>
                </div>
              </TabsContent>

              <TabsContent value="antecedentes" className="mt-0 space-y-8 animate-in">
                <SectionHeader icon={<HistoryIcon />} title="Historia Médica" subtitle="Antecedentes relevantes del paciente." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormItem label="Antecedentes Personales">
                    <Textarea 
                      value={history.antecedentes_personales || ''} 
                      onChange={e => setHistory({...history, antecedentes_personales: e.target.value})}
                      className="border-slate-200 bg-slate-50/50 rounded-2xl min-h-[120px]"
                    />
                  </FormItem>
                  <FormItem label="Antecedentes Familiares">
                    <Textarea 
                      value={history.antecedentes_familiares || ''} 
                      onChange={e => setHistory({...history, antecedentes_familiares: e.target.value})}
                      className="border-slate-200 bg-slate-50/50 rounded-2xl min-h-[120px]"
                    />
                  </FormItem>
                  <FormItem label="Alergias Conocidas">
                    <Input 
                      value={history.alergias || ''} 
                      onChange={e => setHistory({...history, alergias: e.target.value})}
                      className="h-12 border-slate-200 bg-slate-50/50 rounded-xl font-bold text-destructive"
                      placeholder="Ej. Penicilina, látex..."
                    />
                  </FormItem>
                  <FormItem label="Medicamentos de Uso Actual">
                    <Input 
                      value={history.medicamentos_actuales || ''} 
                      onChange={e => setHistory({...history, medicamentos_actuales: e.target.value})}
                      className="h-12 border-slate-200 bg-slate-50/50 rounded-xl font-bold text-primary"
                    />
                  </FormItem>
                </div>
              </TabsContent>

              <TabsContent value="examen" className="mt-0 space-y-8 animate-in">
                <SectionHeader icon={<Stethoscope />} title="Signos Vitales" subtitle="Valores obtenidos en el examen físico inicial." />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <VitalSignItem label="Peso (kg)" value={history.peso} onChange={v => setHistory({...history, peso: v})} step="0.1" />
                  <VitalSignItem label="Talla (m)" value={history.talla} onChange={v => setHistory({...history, talla: v})} step="0.01" />
                  <VitalSignItem label="P. Arterial" value={history.tension_arterial} isString onChange={v => setHistory({...history, tension_arterial: v as string})} placeholder="120/80" />
                  <VitalSignItem label="F.C. (lpm)" value={history.frecuencia_cardiaca} onChange={v => setHistory({...history, frecuencia_cardiaca: v})} />
                  <VitalSignItem label="Temp. (°C)" value={history.temperatura} onChange={v => setHistory({...history, temperatura: v})} step="0.1" />
                </div>
              </TabsContent>

              <TabsContent value="diagnostico" className="mt-0 space-y-8 animate-in">
                <SectionHeader icon={<CheckCircle2 />} title="Diagnóstico y Plan" subtitle="Conclusión médica y pasos a seguir." />
                <div className="space-y-8">
                  <FormItem label="Diagnóstico Presuntivo">
                    <Textarea 
                      value={history.diagnostico_presuntivo || ''} 
                      onChange={e => setHistory({...history, diagnostico_presuntivo: e.target.value})}
                      rows={4}
                      className="border-slate-200 bg-slate-50/50 rounded-2xl p-4 font-bold text-indigo-950"
                    />
                  </FormItem>
                  <FormItem label="Plan de Tratamiento">
                    <Textarea 
                      value={history.plan_tratamiento || ''} 
                      onChange={e => setHistory({...history, plan_tratamiento: e.target.value})}
                      rows={4}
                      className="border-slate-200 bg-slate-50/50 rounded-2xl p-4"
                    />
                  </FormItem>
                  <FormItem label="Observaciones Finales">
                    <Textarea 
                      value={history.observaciones || ''} 
                      onChange={e => setHistory({...history, observaciones: e.target.value})}
                      className="border-slate-200 bg-slate-50/50 rounded-2xl"
                    />
                  </FormItem>
                </div>
              </TabsContent>
            </CardContent>
          </Card>

          {/* Botón Flotante de Guardado */}
          <div className="fixed bottom-8 left-0 right-0 z-40 px-4 md:px-0 flex justify-center pointer-events-none">
            <Button 
              size="lg" 
              onClick={handleSave} 
              disabled={saving}
              className="pointer-events-auto h-14 px-12 rounded-full font-black text-lg shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all gap-2 bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
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
      className="flex-1 min-w-[120px] md:min-w-0 py-3 font-bold rounded-2xl transition-all gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 border-2 border-transparent hover:bg-white hover:border-slate-100"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </TabsTrigger>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
      <div className="bg-primary/5 p-3 rounded-2xl text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
  )
}

function FormItem({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ml-1">
        {icon} {label}
      </Label>
      {children}
    </div>
  )
}

function VitalSignItem({ label, value, onChange, isString, step, placeholder }: { label: string; value: any; onChange: (v: any) => void; isString?: boolean; step?: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center block">{label}</Label>
      <Input 
        type={isString ? "text" : "number"}
        step={step}
        placeholder={placeholder}
        value={value || ''} 
        onChange={e => onChange(isString ? e.target.value : parseFloat(e.target.value))}
        className="h-12 border-slate-200 bg-white shadow-inner text-center font-black text-lg focus:ring-primary/20 rounded-xl"
      />
    </div>
  )
}
