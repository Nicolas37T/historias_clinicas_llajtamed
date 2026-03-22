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
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpRight,
  LogOut,
  LayoutDashboard,
  Calendar
} from 'lucide-react'

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
    const nameMatch = h.nombre_completo.toLowerCase().includes(search.toLowerCase()) || 
                      h.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
    const carnetMatch = h.profiles?.carnet?.includes(search)
    const matchesStatus = statusFilter === 'todos' || h.estado === statusFilter
    return (nameMatch || carnetMatch) && matchesStatus
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Admin */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-50 glass">
        <div className="container mx-auto py-4 px-4 max-w-6xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Admin Panel</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-heading">Control de Historias Clínicas</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-destructive hover:bg-destructive/5 font-bold transition-all gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto mt-10 px-4 max-w-6xl animate-in">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-slate-500 font-medium">Monitoreo y revisión de envíos estudiantiles.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Buscar por nombre o carnet..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 h-12 border-slate-200 bg-white shadow-sm focus:ring-primary/20 rounded-2xl font-medium"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'todos')}>
                <SelectTrigger className="h-12 border-slate-200 bg-white shadow-sm rounded-2xl font-bold">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                  <SelectItem value="todos" className="font-bold">Todos</SelectItem>
                  <SelectItem value="pendiente" className="text-amber-500 font-bold">Pendientes</SelectItem>
                  <SelectItem value="revisado" className="text-green-500 font-bold">Revisados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Total Recibidos" 
            value={histories.length} 
            icon={<Users className="w-6 h-6" />} 
            color="primary"
          />
          <StatCard 
            title="Pendientes" 
            value={histories.filter(h => h.estado === 'pendiente').length} 
            icon={<Clock className="w-6 h-6" />} 
            color="amber"
          />
          <StatCard 
            title="Revisados" 
            value={histories.filter(h => h.estado === 'revisado').length} 
            icon={<CheckCircle2 className="w-6 h-6" />} 
            color="green"
          />
        </div>

        {/* Table/List */}
        <div className="bg-white rounded-[2rem] border-0 shadow-2xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estudiante</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Carnet</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fecha</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estado</th>
                  <th className="px-8 py-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-slate-300 animate-pulse tracking-widest truncate uppercase">Cargando datos del servidor...</td></tr>
                ) : filteredHistories.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">No se encontraron resultados para "{search}"</td></tr>
                ) : (
                  filteredHistories.map(h => (
                    <tr key={h.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-900 text-lg tracking-tight">{h.nombre_completo}</div>
                        <div className="text-xs font-semibold text-slate-400 truncate max-w-[200px]">{h.motivo_consulta || 'Sin motivo definido'}</div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="outline" className="font-black text-slate-500 border-slate-200 px-3 py-1 rounded-lg bg-slate-50/50">
                          {h.profiles?.carnet || '-'}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                          <Calendar className="w-4 h-4 text-slate-300" />
                          {new Date(h.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {h.estado === 'revisado' ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-black text-xs uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" /> REVISADO
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs uppercase tracking-wider">
                            <Clock className="w-4 h-4" /> PENDIENTE
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link href={`/dashboard/${h.id}`}>
                          <Button variant="outline" size="sm" className="rounded-full font-black text-xs px-6 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all group-hover:scale-105 active:scale-95 shadow-lg shadow-transparent hover:shadow-primary/20">
                            REVISAR <ArrowUpRight className="ml-1.5 w-3.5 h-3.5" />
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
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: 'primary' | 'amber' | 'green' }) {
  const colorStyles = {
    primary: 'text-primary bg-primary/10 shadow-primary/5',
    amber: 'text-amber-500 bg-amber-500/10 shadow-amber-500/5',
    green: 'text-green-500 bg-green-500/10 shadow-green-500/5',
  }

  return (
    <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all">
      <CardContent className="p-8 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
          <div className="text-4xl font-black text-slate-900 tracking-tighter">{value}</div>
        </div>
        <div className={`p-4 rounded-2xl ${colorStyles[color]} transition-transform duration-500 group-hover:rotate-12`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
