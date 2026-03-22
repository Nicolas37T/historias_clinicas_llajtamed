'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HistoriaClinica } from '@/lib/types'
import Link from 'next/link'

export default function DetailPage() {
  const { id } = useParams()
  const [history, setHistory] = useState<HistoriaClinica | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadDetail() {
      const { data } = await supabase
        .from('historias_clinicas')
        .select('*, profiles(*)')
        .eq('id', id)
        .single()
      
      if (data) setHistory(data)
      setLoading(false)
    }
    loadDetail()
  }, [id, supabase])

  const toggleStatus = async () => {
    if (!history) return
    setUpdating(true)
    const newStatus = history.estado === 'pendiente' ? 'revisado' : 'pendiente'
    
    const { error } = await supabase
      .from('historias_clinicas')
      .update({ estado: newStatus })
      .eq('id', history.id)

    if (!error) {
      setHistory({ ...history, estado: newStatus as any })
    }
    setUpdating(false)
  }

  if (loading) return <div className="flex h-screen items-center justify-center animate-pulse font-bold">Cargando detalle...</div>
  if (!history) return <div className="p-10 text-center font-bold text-destructive">Historia no encontrada.</div>

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-slate-100">
              ←
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{history.nombre_completo}</h1>
            <p className="text-sm text-muted-foreground font-semibold">Carnet: {history.profiles?.carnet}</p>
          </div>
        </div>
        <Button 
          onClick={toggleStatus} 
          disabled={updating}
          variant={history.estado === 'pendiente' ? 'default' : 'outline'}
          className={`font-bold h-12 px-6 transition-all ${history.estado === 'pendiente' ? 'shadow-lg shadow-blue-200' : 'border-2'}`}
        >
          {updating ? 'Actualizando...' : history.estado === 'pendiente' ? 'Marcar como Revisado' : 'Revertir a Pendiente'}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Sección: Datos Personales */}
        <section className="bg-white rounded-3xl border shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b">
            <h2 className="text-lg font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span> Datos Personales
            </h2>
          </div>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoItem label="Edad" value={history.edad?.toString()} />
            <InfoItem label="Sexo" value={history.sexo} />
            <InfoItem label="Teléfono" value={history.telefono} />
            <InfoItem label="Cédula" value={history.cedula} />
            <div className="md:col-span-2">
              <InfoItem label="Dirección" value={history.direccion} />
            </div>
          </CardContent>
        </section>

        {/* Sección: Motivo y Enfermedad */}
        <section className="bg-white rounded-3xl border shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b">
            <h2 className="text-lg font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-6 bg-amber-500 rounded-full"></span> Cuadro Clínico
            </h2>
          </div>
          <CardContent className="p-8 space-y-8">
            <InfoItem label="Motivo de Consulta" value={history.motivo_consulta} block />
            <InfoItem label="Enfermedad Actual" value={history.enfermedad_actual} block />
          </CardContent>
        </section>

        {/* Sección: Antecedentes */}
        <section className="bg-white rounded-3xl border shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b">
            <h2 className="text-lg font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-6 bg-purple-500 rounded-full"></span> Antecedentes
            </h2>
          </div>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoItem label="Personales" value={history.antecedentes_personales} block />
            <InfoItem label="Familiares" value={history.antecedentes_familiares} block />
            <InfoItem label="Alergias" value={history.alergias} />
            <InfoItem label="Medicamentos" value={history.medicamentos_actuales} />
          </CardContent>
        </section>

        {/* Sección: Examen Físico */}
        <section className="bg-white rounded-3xl border shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b">
            <h2 className="text-lg font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span> Signos Vitales
            </h2>
          </div>
          <CardContent className="p-8 grid grid-cols-2 md:grid-cols-5 gap-6">
            <InfoItem label="Peso" value={`${history.peso} kg`} />
            <InfoItem label="Talla" value={`${history.talla} m`} />
            <InfoItem label="Presión" value={history.tension_arterial} />
            <InfoItem label="Frec. C." value={`${history.frecuencia_cardiaca} lpm`} />
            <InfoItem label="Temp." value={`${history.temperatura} °C`} />
          </CardContent>
        </section>

        {/* Sección: Diagnóstico */}
        <section className="bg-white rounded-3xl border shadow-xl shadow-slate-200/30 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b">
            <h2 className="text-lg font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-600 rounded-full"></span> Impresión Diagnóstica
            </h2>
          </div>
          <CardContent className="p-8 space-y-8">
            <InfoItem label="Diagnóstico Presuntivo" value={history.diagnostico_presuntivo} block />
            <InfoItem label="Plan de Tratamiento" value={history.plan_tratamiento} block />
            <InfoItem label="Observaciones" value={history.observaciones} block />
          </CardContent>
        </section>
      </div>
      <div className="h-20"></div>
    </div>
  )
}

function InfoItem({ label, value, block }: { label: string; value?: string | null; block?: boolean }) {
  return (
    <div className={block ? 'space-y-2' : ''}>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`text-slate-800 font-bold ${block ? 'text-base leading-relaxed whitespace-pre-wrap' : 'text-lg'}`}>
        {value || <span className="text-slate-300 font-medium">---</span>}
      </p>
    </div>
  )
}
