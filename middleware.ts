import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/callback', '/meta-webhook']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Se for rota pública, apenas atualizar sessão e permitir acesso
  if (isPublicRoute) {
    return await updateSession(request)
  }

  // TEMPORÁRIO: Permitir acesso sem autenticação para desenvolvimento
  // TODO: Remover após corrigir autenticação
  const bypassAuth = request.nextUrl.searchParams.get('bypass') === 'dev'
  if (bypassAuth || request.nextUrl.pathname === '/') {
    return await updateSession(request)
  }

  // Atualizar sessão Supabase
  const supabaseResponse = await updateSession(request)

  // Para rotas privadas, verificar se está autenticado
  const supabase = (await import('@/lib/supabase/server')).createClient
  const client = await supabase()
  
  try {
    const { data: { user } } = await client.auth.getUser()

    // Se não estiver autenticado, redirecionar para login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Erro no middleware:', error)
    // Em caso de erro, permitir acesso (para evitar loops)
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     * - meta-webhook (webhook for Meta/WhatsApp)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|meta-webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
