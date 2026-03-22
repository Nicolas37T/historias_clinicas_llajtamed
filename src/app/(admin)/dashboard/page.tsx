'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HistoriaClinica } from '@/lib/types'
import Link from 'next/link'

export default function AdminDashboard() {
  const [histories, setHistories] = useState<HistoriaClinica[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadHistories() {
      const { data, error } = await supabase
        .from('historias_clinicas')
        .select('*, profiles(full_name, carnet)')
        .order('created_at', { ascending: false })

      if (data) setHistories(data as any)
      setLoading(false)
    }
    loadHistories()
  }, [supabase])

  const filteredHistories = histories.filter(h => {
    const matchesSearch = h.nombre_completo.toLowerCase().includes(search.toLowerCase()) || 
                         h.profiles?.carnet?.includes(search)
    const matchesStatus = statusFilter === 'todos' || h.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Panel Administrador</h1>
          <p className="text-muted-foreground font-medium">Revisión de Historias Clínicas LlajtaMed</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="font-bold border-2 hover:bg-destructive hover:text-white transition-all">
          Cerrar Sesión
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Total Recibidos</CardDescription>
            <CardTitle className="text-4xl font-black text-slate-800">{histories.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Pendientes</CardDescription>
            <CardTitle className="text-4xl font-black text-amber-500">
              {histories.filter(h => h.estado === 'pendiente').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Revisados</CardDescription>
            <CardTitle className="text-4xl font-black text-green-500">
              {histories.filter(h => h.estado === 'revisado').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex-1">
          <Input 
            placeholder="Buscar por nombre o carnet..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-slate-200 focus:ring-primary/20 h-11 text-base"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'todos')}>
            <SelectTrigger className="h-11 border-slate-200 font-bold">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendiente">Pendientes</SelectItem>
              <SelectItem value="revisado">Revisados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Estudiante</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Carnet</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Fecha Envío</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center font-bold text-slate-400 animate-pulse">Cargando datos...</td></tr>
              ) : filteredHistories.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">No se encontraron historias clínicas.</td></tr>
              ) : (
                filteredHistories.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{h.nombre_completo}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{h.profiles?.carnet || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {h.estado === 'revisado' ? (
                        <Badge className="bg-green-100 text-green-600 border-green-200 hover:bg-green-100 px-2 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-wider">Revisado</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-100 px-2 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-wider">Pendiente</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/${h.id}`}>
                        <Button variant="link" className="text-primary font-bold hover:no-underline group-hover:translate-x-1 transition-transform p-0">
                          Ver Detalle →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
