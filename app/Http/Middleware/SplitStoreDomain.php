<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Reparte la aplicación entre dos dominios cuando BILLING_STORE_HOST está definido:
 * la tienda vive en el dominio store y el área de clientes/facturación en el principal.
 * Redirige cada petición al dominio que le corresponde, así todos los enlaces
 * relativos siguen funcionando sin tocar el frontend.
 */
class SplitStoreDomain
{
    /** Prefijos de ruta que pertenecen a la tienda. */
    private const STORE_PATHS = ['/', '/store', '/api/plans'];

    public function handle(Request $request, Closure $next)
    {
        $storeHost = (string) config('billing.store_host');

        if ($storeHost === '' || ! in_array($request->method(), ['GET', 'HEAD'], true)) {
            return $next($request);
        }

        $path = '/' . ltrim($request->path(), '/');
        $isStorePath = $path === '/' || $path === '/api/plans'
            || $path === '/store' || str_starts_with($path, '/store/');

        $billingHost = (string) parse_url((string) config('app.url'), PHP_URL_HOST);

        if ($request->getHost() === $storeHost) {
            // En el dominio de la tienda solo se sirve la tienda; el resto va al principal.
            if (! $isStorePath && $billingHost !== '') {
                return redirect()->away('https://' . $billingHost . $request->getRequestUri());
            }
        } elseif ($path === '/') {
            // La raíz del dominio principal pasa a ser el área de clientes.
            return redirect('/dashboard');
        } elseif ($path === '/store' || str_starts_with($path, '/store/')) {
            // En el dominio principal, la tienda redirige a su dominio propio.
            return redirect()->away('https://' . $storeHost . $request->getRequestUri());
        }

        return $next($request);
    }
}
