'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { UserPlus, ArrowLeft, Mail, Lock, User, IdCard, ShieldCheck } from 'lucide-react'

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
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in">
        <CardHeader className="space-y-4 text-center pt-10 pb-6 px-8">
          <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2 shadow-inner">
            <UserPlus className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tight text-slate-900 leading-none">Registro Estudiantil</CardTitle>
            <CardDescription className="text-sm font-bold text-muted-foreground uppercase tracking-widest pt-1">
              Únetea la Red LlajtaMed
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-8">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {error && (
              <div className="col-span-full bg-destructive/5 p-4 rounded-2xl text-destructive text-xs font-bold border border-destructive/10 animate-in">
                {error}
              </div>
            )}
            
            <FormItem label="Nombre Completo" icon={<User className="w-3.5 h-3.5" />}>
              <Input
                placeholder="Ej. Juan Pérez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white/50 h-12 rounded-xl border-slate-100 font-medium"
              />
            </FormItem>

            <FormItem label="Carnet de Identidad" icon={<IdCard className="w-3.5 h-3.5" />}>
              <Input
                placeholder="1234567 LP"
                value={carnet}
                onChange={(e) => setCarnet(e.target.value)}
                required
                className="bg-white/50 h-12 rounded-xl border-slate-100 font-medium"
              />
            </FormItem>

            <FormItem label="Email Universitario" icon={<Mail className="w-3.5 h-3.5" />}>
              <Input
                type="email"
                placeholder="estudiante@u.edu.bo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 h-12 rounded-xl border-slate-100 font-medium"
              />
            </FormItem>

            <FormItem label="Contraseña" icon={<Lock className="w-3.5 h-3.5" />}>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50 h-12 rounded-xl border-slate-100"
              />
            </FormItem>

            <Button
              type="submit"
              className="col-span-full mt-4 font-black shadow-xl shadow-primary/20 transition-all h-14 rounded-2xl text-lg bg-primary hover:bg-primary/90 gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
              {loading ? 'Procesando...' : 'Crear mi Cuenta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 text-center bg-slate-50/50 py-8 px-8 border-t border-slate-100">
          <p className="text-sm text-slate-600 font-medium">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-primary font-black hover:underline underline-offset-4 flex items-center justify-center gap-1.5 mt-1 transition-all hover:gap-1">
              <ArrowLeft className="w-4 h-4" /> Iniciar Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

function FormItem({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 ml-1 flex items-center gap-1.5">
        {icon} {label}
      </Label>
      {children}
    </div>
  )
}
