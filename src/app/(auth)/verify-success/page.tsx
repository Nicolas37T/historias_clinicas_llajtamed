'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, ClipboardPlus, ShieldCheck } from 'lucide-react'

export default function VerifySuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      {/* Brand Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#002D5B] rounded-full blur-[180px] opacity-20 pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] brand-gradient rounded-full blur-[150px] opacity-10 pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-in text-center p-8">
        <CardHeader className="space-y-6 pt-6 group">
          <div className="mx-auto w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 relative overflow-hidden transition-transform duration-500 group-hover:scale-110 shadow-inner border border-green-100">
            <CheckCircle2 className="w-12 h-12 drop-shadow-sm animate-bounce" />
          </div>
          <div className="space-y-2">
             <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Cuenta Verificada</span>
             </div>
            <CardTitle className="text-4xl font-black tracking-tight text-[#002D5B]">
              ¡Registro <span className="brand-gradient-text text-green-500">Exitoso</span>!
            </CardTitle>
            <CardDescription className="text-sm font-bold text-slate-500 max-w-[280px] mx-auto leading-relaxed">
              Tu cuenta ha sido activada correctamente. Ahora puedes acceder a todas las funciones de LlajtaMed.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center gap-2">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Redirigiendo en</p>
             <span className="text-4xl font-black text-[#002D5B]">{countdown}</span>
             <p className="text-[10px] font-black text-slate-300 uppercase">segundos</p>
          </div>

          <Button
            onClick={() => router.push('/login')}
            className="w-full font-black shadow-2xl shadow-red-900/20 hover:shadow-red-900/30 transition-all h-16 rounded-[1.5rem] text-xl brand-gradient border-0 text-white gap-3 hover:scale-[1.02] active:scale-95"
          >
            Ir al Login <ArrowRight className="w-6 h-6" />
          </Button>

          <div className="pt-4 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <ClipboardPlus className="w-4 h-4 text-[#002D5B] opacity-20" />
                <div className="h-[1px] w-12 bg-slate-200" />
                <ShieldCheck className="w-4 h-4 text-[#002D5B] opacity-20" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-slate-300 font-black">
                Security Verified by LlajtaMed
              </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
