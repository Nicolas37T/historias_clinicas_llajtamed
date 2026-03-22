'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LogIn, UserPlus, Info, AlertTriangle, ShieldCheck } from 'lucide-react'

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
      setError('Credenciales inválidas. Verifica tu correo y contraseña.')
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
    <Card className="w-full max-w-md shadow-2xl border-0 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in">
      <CardHeader className="space-y-4 text-center pt-10 pb-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2 shadow-inner">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-4xl font-black tracking-tight text-slate-900 leading-none">Bienvenido</CardTitle>
          <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest pt-1">
            Plataforma LlajtaMed
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleLogin} className="space-y-6">
          {message && (
            <div className="bg-primary/5 p-4 rounded-2xl text-primary text-xs font-bold border border-primary/10 flex items-center gap-3 animate-in">
              <Info className="w-5 h-5 shrink-0" /> {message}
            </div>
          )}
          {error && (
            <div className="bg-destructive/5 p-4 rounded-2xl text-destructive text-xs font-bold border border-destructive/10 flex items-center gap-3 animate-in">
              <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
            </div>
          )}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50 focus:bg-white border-slate-100 transition-all h-12 rounded-xl font-medium"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="password" dangerouslySetInnerHTML={{ __html: 'Contraseña' }} className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50 focus:bg-white border-slate-100 transition-all h-12 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-black shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all h-14 rounded-2xl text-lg bg-primary hover:bg-primary/90 gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? 'Verificando...' : 'Entrar al Sistema'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-6 text-center bg-slate-50/50 py-8 px-8 border-t border-slate-100">
        <p className="text-sm text-slate-600 font-medium">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/register" className="text-primary font-black hover:underline underline-offset-4 flex items-center justify-center gap-1.5 mt-1 transition-all hover:gap-2">
            Regístrate aquí <UserPlus className="w-4 h-4" />
          </Link>
        </p>
        <div className="w-full">
          <p className="text-[9px] uppercase tracking-[0.2em] text-slate-300 font-black">
            Clinical History Engine v1.0
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Suspense fallback={<div className="animate-pulse font-black text-primary tracking-widest uppercase">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
