'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

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
    <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-primary">Bienvenido</CardTitle>
        <CardDescription className="text-sm font-medium">
          Ingresa tus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-5">
          {message && (
            <div className="bg-blue-50 p-3 rounded-md text-blue-700 text-sm font-medium border border-blue-100 flex items-center gap-2">
              <span className="shrink-0">ℹ️</span> {message}
            </div>
          )}
          {error && (
            <div className="bg-destructive/15 p-3 rounded-md text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50 focus:bg-white transition-all h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50 focus:bg-white transition-all h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-bold shadow-sm hover:shadow-md transition-all h-11 text-base bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center">
        <p className="text-sm text-balance text-muted-foreground">
          ¿Eres estudiante y no tienes cuenta?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
            Regístrate aquí
          </Link>
        </p>
        <div className="pt-4 border-t border-muted w-full">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
            Sistema LlajtaMed © 2026
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={<div className="animate-pulse font-bold text-primary">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
