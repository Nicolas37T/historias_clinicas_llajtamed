'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { HistoriaClinica } from '@/lib/types'

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
        // Pre-llenar nombre si es nuevo
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
    return <div className="flex h-screen items-center justify-center font-medium animate-pulse">Cargando formulario...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Mi Historia Clínica</h1>
          <p className="text-muted-foreground font-medium mt-1">Completa todos los campos requeridos para tu revisión.</p>
        </div>
        <div className="flex items-center gap-3">
          {history.estado === 'revisado' ? (
            <Badge className="bg-green-500/10 text-green-600 border-green-200 px-3 py-1 text-sm font-bold">✅ Revisado</Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 px-3 py-1 text-sm font-bold">⏳ Pendiente</Badge>
          )}
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors font-semibold">
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personales" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-white border shadow-sm rounded-xl overflow-hidden">
          <TabsTrigger value="personales" className="py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Personales</TabsTrigger>
          <TabsTrigger value="motivo" className="py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Motivo</TabsTrigger>
          <TabsTrigger value="antecedentes" className="py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Antecedentes</TabsTrigger>
          <TabsTrigger value="examen" className="py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Examen Físico</TabsTrigger>
          <TabsTrigger value="diagnostico" className="py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg transition-all">Diagnóstico</TabsTrigger>
        </TabsList>

        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-md overflow-hidden rounded-2xl">
          <CardContent className="pt-8 px-6 md:px-10 pb-10">
            {/* Sección 1: Datos Personales */}
            <TabsContent value="personales" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Nombre Completo</Label>
                  <Input 
                    value={history.nombre_completo || ''} 
                    onChange={e => setHistory({...history, nombre_completo: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                    className="border-slate-200 focus:border-primary focus:ring-primary/20 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Cédula de Identidad</Label>
                  <Input 
                    value={history.cedula || ''} 
                    onChange={e => setHistory({...history, cedula: e.target.value})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Fecha de Nacimiento</Label>
                  <Input 
                    type="date" 
                    value={history.fecha_nacimiento || ''} 
                    onChange={e => setHistory({...history, fecha_nacimiento: e.target.value})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Edad</Label>
                  <Input 
                    type="number" 
                    value={history.edad || ''} 
                    onChange={e => setHistory({...history, edad: parseInt(e.target.value)})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Sexo</Label>
                  <Select 
                    value={history.sexo || ''} 
                    onValueChange={v => setHistory({...history, sexo: v as any})}
                  >
                    <SelectTrigger className="border-slate-200 bg-slate-50/50">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Teléfono</Label>
                  <Input 
                    value={history.telefono || ''} 
                    onChange={e => setHistory({...history, telefono: e.target.value})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Dirección</Label>
                <Input 
                  value={history.direccion || ''} 
                  onChange={e => setHistory({...history, direccion: e.target.value})}
                  className="border-slate-200 bg-slate-50/50"
                />
              </div>
            </TabsContent>

            {/* Sección 2: Motivo y Enfermedad */}
            <TabsContent value="motivo" className="space-y-6 mt-0">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Motivo de Consulta</Label>
                <Textarea 
                  value={history.motivo_consulta || ''} 
                  onChange={e => setHistory({...history, motivo_consulta: e.target.value})}
                  rows={4}
                  className="border-slate-200 bg-slate-50/50 resize-none focus:ring-primary/20"
                  placeholder="Describa el motivo principal de su visita..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Enfermedad Actual</Label>
                <Textarea 
                  value={history.enfermedad_actual || ''} 
                  onChange={e => setHistory({...history, enfermedad_actual: e.target.value})}
                  rows={4}
                  className="border-slate-200 bg-slate-50/50 resize-none focus:ring-primary/20"
                />
              </div>
            </TabsContent>

            {/* Sección 3: Antecedentes */}
            <TabsContent value="antecedentes" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Antecedentes Personales</Label>
                  <Textarea 
                    value={history.antecedentes_personales || ''} 
                    onChange={e => setHistory({...history, antecedentes_personales: e.target.value})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Antecedentes Familiares</Label>
                  <Textarea 
                    value={history.antecedentes_familiares || ''} 
                    onChange={e => setHistory({...history, antecedentes_familiares: e.target.value})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Alergias</Label>
                  <Input 
                    value={history.alergias || ''} 
                    onChange={e => setHistory({...history, alergias: e.target.value})}
                    className="border-slate-200 bg-slate-50/50"
                    placeholder="Ej. Penicilina, látex..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Medicamentos Actuales</Label>
                  <Input 
                    value={history.medicamentos_actuales || ''} 
                    onChange={e => setHistory({...history, medicamentos_actuales: e.target.value})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Sección 4: Examen Físico */}
            <TabsContent value="examen" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Peso (kg)</Label>
                  <Input 
                    type="number" step="0.1"
                    value={history.peso || ''} 
                    onChange={e => setHistory({...history, peso: parseFloat(e.target.value)})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Talla (m)</Label>
                  <Input 
                    type="number" step="0.01"
                    value={history.talla || ''} 
                    onChange={e => setHistory({...history, talla: parseFloat(e.target.value)})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Tensión Arterial</Label>
                  <Input 
                    placeholder="120/80"
                    value={history.tension_arterial || ''} 
                    onChange={e => setHistory({...history, tension_arterial: e.target.value})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Frecuencia Cardiaca (lpm)</Label>
                  <Input 
                    type="number"
                    value={history.frecuencia_cardiaca || ''} 
                    onChange={e => setHistory({...history, frecuencia_cardiaca: parseInt(e.target.value)})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Temperatura (°C)</Label>
                  <Input 
                    type="number" step="0.1"
                    value={history.temperatura || ''} 
                    onChange={e => setHistory({...history, temperatura: parseFloat(e.target.value)})}
                    className="border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Sección 5: Diagnóstico */}
            <TabsContent value="diagnostico" className="space-y-6 mt-0">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Diagnóstico Presuntivo</Label>
                <Textarea 
                  value={history.diagnostico_presuntivo || ''} 
                  onChange={e => setHistory({...history, diagnostico_presuntivo: e.target.value})}
                  rows={4}
                  className="border-slate-200 bg-slate-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Plan de Tratamiento</Label>
                <Textarea 
                  value={history.plan_tratamiento || ''} 
                  onChange={e => setHistory({...history, plan_tratamiento: e.target.value})}
                  rows={4}
                  className="border-slate-200 bg-slate-50/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Observaciones</Label>
                <Textarea 
                  value={history.observaciones || ''} 
                  onChange={e => setHistory({...history, observaciones: e.target.value})}
                  className="border-slate-200 bg-slate-50/50"
                />
              </div>
            </TabsContent>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 pb-12">
          <Button 
            size="lg" 
            onClick={handleSave} 
            disabled={saving}
            className="px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {saving ? 'Guardando...' : 'Guardar Historia Clínica'}
          </Button>
        </div>
      </Tabs>
    </div>
  )
}
