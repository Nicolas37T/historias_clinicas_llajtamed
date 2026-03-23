'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LogIn, UserPlus, Info, AlertTriangle, ShieldCheck, ClipboardPlus } from 'lucide-react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message === 'Invalid login credentials' 
        ? 'Credenciales inválidas. Verifica tu correo y contraseña.' 
        : loginError.message)
      setLoading(false)
      return
    }

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/historia')
      }
      
      router.refresh()
    }
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in">
      <CardHeader className="space-y-6 text-center pt-12 pb-8 px-8 group">
        <div className="mx-auto w-20 h-20 bg-[#002D5B] rounded-[1.75rem] flex items-center justify-center text-amber-400 relative overflow-hidden transition-transform duration-500 group-hover:scale-110">
          <div className="absolute inset-0 brand-gradient opacity-20 pointer-events-none" />
          <ClipboardPlus className="w-10 h-10 relative z-10 drop-shadow-lg" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-4xl font-black tracking-tight text-[#002D5B] leading-none">
            Llajta<span className="brand-gradient-text">Med</span>
          </CardTitle>
          <CardDescription className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] pt-1">
            Plataforma Clínica Digital
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-10 pb-10">
        <form onSubmit={handleLogin} className="space-y-6">
          {message && (
            <div className="bg-blue-50/50 p-4 rounded-2xl text-[#002D5B] text-xs font-bold border border-blue-100 flex items-center gap-3 animate-in shadow-sm">
              <Info className="w-5 h-5 shrink-0 text-amber-500" /> {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50/50 p-4 rounded-2xl text-red-600 text-xs font-bold border border-red-100 flex items-center gap-3 animate-in shadow-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white h-14 rounded-2xl border-slate-200 focus:ring-[#002D5B]/10 font-bold text-slate-700 shadow-inner px-6"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" dangerouslySetInnerHTML={{ __html: 'Contraseña' }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white h-14 rounded-2xl border-slate-200 focus:ring-[#002D5B]/10 shadow-inner px-6"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-black shadow-2xl shadow-red-900/20 hover:shadow-red-900/30 transition-all h-16 rounded-[1.5rem] text-xl brand-gradient border-0 text-white gap-3 hover:scale-[1.02] active:scale-95"
            disabled={loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <LogIn className="w-6 h-6 drop-shadow-md" />
            )}
            {loading ? 'Verificando...' : 'Entrar al Sistema'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-7 text-center bg-[#002D5B]/5 py-10 px-10 border-t border-slate-100">
        <p className="text-sm text-slate-500 font-bold">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/register" className="text-[#002D5B] font-black hover:underline underline-offset-4 flex items-center justify-center gap-1.5 mt-2 transition-all hover:scale-105">
            Regístrate aquí <UserPlus className="w-5 h-5 text-amber-500" />
          </Link>
        </p>
        <div className="w-full">
          <p className="text-[9px] uppercase tracking-[0.4em] text-slate-300 font-black flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Security Verified by LlajtaMed
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      {/* Brand Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#002D5B] rounded-full blur-[180px] opacity-20 pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] brand-gradient rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <Suspense fallback={<div className="animate-pulse font-black text-[#002D5B] tracking-[0.5em] uppercase text-2xl">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
