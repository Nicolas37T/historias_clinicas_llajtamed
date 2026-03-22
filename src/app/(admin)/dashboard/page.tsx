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
  Calendar,
  ClipboardCheck,
  Zap
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
    <div className="min-h-screen bg-slate-50/70 pb-24">
      {/* Admin Header (Branded Navy) */}
      <div className="w-full bg-[#002D5B] text-white shadow-2xl sticky top-0 z-50 overflow-hidden">
        <div className="h-1.5 w-full brand-gradient opacity-80" />
        <div className="container mx-auto py-5 px-6 max-w-7xl flex justify-between items-center relative">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/20">
              <LayoutDashboard className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">
                 Admin<span className="brand-gradient-text italic ml-1">Core</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-60 font-black mt-1">LlajtaMed Clinical OS</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/60 hover:text-white hover:bg-white/10 font-black transition-all gap-2 text-xs uppercase tracking-widest">
            <LogOut className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto mt-12 px-6 max-w-7xl animate-in">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#002D5B]/5 border border-[#002D5B]/10 text-[#002D5B] text-[10px] font-black uppercase tracking-widest mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Panel de Control Real-time
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Gestión Universitaria</h2>
            <p className="text-slate-500 font-medium text-lg mt-1 italic">Revisión y validación de historias clínicas LlajtaMed.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#002D5B] transition-colors" />
              <Input 
                placeholder="Buscar por nombre o carnet..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-12 h-14 border-slate-200 bg-white shadow-sm focus:ring-[#002D5B]/10 rounded-2xl font-bold text-slate-700"
              />
            </div>
            <div className="w-full sm:w-56">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'todos')}>
                <SelectTrigger className="h-14 border-slate-200 bg-white shadow-sm rounded-2xl font-black text-[#002D5B]">
                  <div className="flex items-center gap-3">
                    <Filter className="w-4.5 h-4.5 text-amber-500" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                  <SelectItem value="todos" className="font-black">TODOS</SelectItem>
                  <SelectItem value="pendiente" className="text-amber-500 font-black">PENDIENTES</SelectItem>
                  <SelectItem value="revisado" className="text-green-600 font-black">REVISADOS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Branded Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <StatCard 
            title="Total Recibidos" 
            value={histories.length} 
            icon={<Users className="w-7 h-7" />} 
            color="navy"
          />
          <StatCard 
            title="Historias Pendientes" 
            value={histories.filter(h => h.estado === 'pendiente').length} 
            icon={<Clock className="w-7 h-7" />} 
            color="amber"
          />
          <StatCard 
            title="Revisiones Listas" 
            value={histories.filter(h => h.estado === 'revisado').length} 
            icon={<ClipboardCheck className="w-7 h-7" />} 
            color="green"
          />
        </div>

        {/* Table/List - High End Styling */}
        <div className="bg-white rounded-[2.5rem] border-0 shadow-2xl shadow-blue-900/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#002D5B]/[0.02] border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Estudiante</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Identificación</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Envío</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Estado Actual</th>
                  <th className="px-10 py-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="px-10 py-24 text-center font-black text-slate-300 animate-pulse tracking-[0.4em] uppercase">Sincronizando con Servidor LlajtaMed...</td></tr>
                ) : filteredHistories.length === 0 ? (
                  <tr><td colSpan={5} className="px-10 py-24 text-center text-slate-400 font-black text-lg">No se encontraron registros activos.</td></tr>
                ) : (
                  filteredHistories.map(h => (
                    <tr key={h.id} className="hover:bg-[#002D5B]/[0.03] transition-all duration-300 group">
                      <td className="px-10 py-7">
                        <div className="font-black text-[#002D5B] text-xl tracking-tight mb-0.5 group-hover:translate-x-1 transition-transform">{h.nombre_completo}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[250px]">{h.motivo_consulta || 'N/A'}</div>
                      </td>
                      <td className="px-10 py-7">
                        <Badge variant="outline" className="font-black text-[#002D5B] border-[#002D5B]/20 px-4 py-1 rounded-xl bg-white shadow-sm">
                          {h.profiles?.carnet || '-'}
                        </Badge>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3 text-slate-500 font-black text-sm uppercase tracking-tighter">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          {new Date(h.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        {h.estado === 'revisado' ? (
                          <div className="flex items-center gap-2.5 text-green-600 font-black text-[11px] uppercase tracking-widest bg-green-50 w-fit px-4 py-1.5 rounded-full border border-green-100">
                            <CheckCircle2 className="w-4 h-4" /> REVISADO
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-amber-600 font-black text-[11px] uppercase tracking-widest bg-amber-50 w-fit px-4 py-1.5 rounded-full border border-amber-100">
                            <Clock className="w-4 h-4" /> PENDIENTE
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-7 text-right">
                        <Link href={`/dashboard/${h.id}`}>
                          <Button variant="outline" size="sm" className="rounded-2xl font-black text-xs px-8 h-11 border-2 border-[#002D5B] text-[#002D5B] hover:bg-[#002D5B] hover:text-white transition-all shadow-xl shadow-transparent hover:shadow-blue-900/20 group-hover:scale-105 active:scale-95 uppercase tracking-widest">
                            Auditar <ArrowUpRight className="ml-2 w-4 h-4" />
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

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: 'navy' | 'amber' | 'green' }) {
  const colorStyles = {
    navy: 'text-white bg-[#002D5B] shadow-blue-900/10 border-blue-900/20',
    amber: 'text-white brand-gradient shadow-red-900/10 border-amber-500/20',
    green: 'text-green-600 bg-white shadow-green-900/5 border-green-100',
  }

  return (
    <Card className={`border-2 shadow-2xl transition-all duration-500 rounded-[2.5rem] group hover:scale-[1.03] active:scale-100 flex flex-col justify-center min-h-[160px] ${colorStyles[color]}`}>
      <CardContent className="p-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{title}</p>
          <div className="text-5xl font-black tracking-tighter leading-none">{value}</div>
        </div>
        <div className={`p-5 rounded-3xl bg-white/20 backdrop-blur-md transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[15deg] shadow-lg`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
