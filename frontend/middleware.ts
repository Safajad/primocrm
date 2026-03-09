import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/callback', '/meta-webhook', '/landing']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Se for rota pública, apenas atualizar sessão e permitir acesso
  if (isPublicRoute) {
    return await updateSession(request)
  }

  // Bypass para desenvolvimento - verificar PRIMEIRO
  const bypassAuth = request.nextUrl.searchParams.get('bypass') === 'dev'
  if (bypassAuth) {
    return await updateSession(request)
  }

  // Check for Emergent Auth session cookie
  const sessionToken = request.cookies.get('session_token')?.value
  
  if (sessionToken) {
    // User has Emergent Auth session - allow access
    return await updateSession(request)
  }

  // Landing page redirect - redirecionar raiz para landing se não autenticado
  if (request.nextUrl.pathname === '/') {
    // Check if user has Supabase session
    try {
      const supabase = (await import('@/lib/supabase/server')).createClient
      const client = await supabase()
      const { data: { user } } = await client.auth.getUser()
      
      // Se não tiver usuário, vai para landing
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/landing'
        return NextResponse.redirect(url)
      }
    } catch {
      // Em caso de erro, vai para landing
      const url = request.nextUrl.clone()
      url.pathname = '/landing'
      return NextResponse.redirect(url)
    }
    
    // Se tem usuário, vai para o app
    return await updateSession(request)
  }

  // Atualizar sessão Supabase
  const supabaseResponse = await updateSession(request)

  // Para rotas privadas, verificar se está autenticado
  const supabase = (await import('@/lib/supabase/server')).createClient
  const client = await supabase()
  
  try {
    const { data: { user } } = await client.auth.getUser()

    // Se não estiver autenticado, redirecionar para landing
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/landing'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Erro no middleware:', error)
    // Em caso de erro, redirecionar para landing
    const url = request.nextUrl.clone()
    url.pathname = '/landing'
    return NextResponse.redirect(url)
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
