'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { UserPlus, ArrowLeft, Mail, Lock, User, IdCard, ShieldCheck, ClipboardPlus } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [carnet, setCarnet] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          carnet: carnet,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/login?message=Registro exitoso. Ahora puedes iniciar sesión.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      {/* Brand Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#002D5B] rounded-full blur-[180px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] brand-gradient rounded-full blur-[150px] opacity-10 pointer-events-none" />

      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in">
        <CardHeader className="space-y-6 text-center pt-12 pb-8 px-10 group">
          <div className="mx-auto w-16 h-16 bg-[#002D5B] rounded-2xl flex items-center justify-center text-amber-400 relative overflow-hidden transition-transform duration-500 group-hover:rotate-12">
            <div className="absolute inset-0 brand-gradient opacity-20" />
            <UserPlus className="w-8 h-8 relative z-10" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tight text-[#002D5B]">Registro Estudiantil</CardTitle>
            <CardDescription className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
              Únete a la Red LlajtaMed
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-12 pb-10">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {error && (
              <div className="col-span-full bg-red-50 p-4 rounded-2xl text-red-600 text-xs font-bold border border-red-100 flex items-center gap-3 animate-in shadow-sm">
                {error}
              </div>
            )}
            
            <FormItem label="Nombre Completo" icon={<User className="w-3.5 h-3.5" />}>
              <Input
                placeholder="Ej. Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white h-14 rounded-2xl border-slate-200 focus:ring-[#002D5B]/10 font-bold text-slate-700 shadow-inner"
              />
            </FormItem>

            <FormItem label="Carnet de Identidad" icon={<IdCard className="w-3.5 h-3.5" />}>
              <Input
                placeholder="1234567 LP"
                value={carnet}
                onChange={(e) => setCarnet(e.target.value)}
                required
                className="bg-white h-14 rounded-2xl border-slate-200 focus:ring-[#002D5B]/10 font-bold text-slate-700 shadow-inner"
              />
            </FormItem>

            <FormItem label="Email Universitario" icon={<Mail className="w-3.5 h-3.5" />}>
              <Input
                type="email"
                placeholder="estudiante@u.edu.bo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white h-14 rounded-2xl border-slate-200 focus:ring-[#002D5B]/10 font-bold text-slate-700 shadow-inner"
              />
            </FormItem>

            <FormItem label="Contraseña" icon={<Lock className="w-3.5 h-3.5" />}>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white h-14 rounded-2xl border-slate-200 focus:ring-[#002D5B]/10 shadow-inner"
              />
            </FormItem>

            <Button
              type="submit"
              className="col-span-full mt-6 font-black shadow-2xl shadow-red-900/20 hover:shadow-red-900/30 transition-all h-16 rounded-[1.5rem] text-xl brand-gradient border-0 text-white gap-3 hover:scale-[1.01] active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShieldCheck className="w-6 h-6 drop-shadow-md" />
              )}
              {loading ? 'Procesando...' : 'Crear mi Cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-8 text-center bg-[#002D5B]/5 py-10 px-10 border-t border-slate-100">
          <p className="text-sm text-slate-500 font-bold">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-[#002D5B] font-black hover:underline underline-offset-4 flex items-center justify-center gap-1.5 mt-2 transition-all hover:scale-105">
              <ArrowLeft className="w-5 h-5 text-amber-500" /> Volver al Inicio
            </Link>
          </p>
          <div className="w-full flex items-center justify-center gap-2">
             <ClipboardPlus className="w-4 h-4 text-slate-300" />
             <p className="text-[9px] uppercase tracking-[0.4em] text-slate-300 font-black">
               Clinical History Platform
             </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function FormItem({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-1.5">
        {icon} {label}
      </Label>
      {children}
    </div>
  )
}
