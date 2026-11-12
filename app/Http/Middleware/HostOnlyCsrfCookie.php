<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * La cookie XSRF-TOKEN de la tienda solo para su propio dominio (store.cinammon.net).
 *
 * La sesión se comparte en .cinammon.net y Laravel usaba ese mismo dominio para XSRF-TOKEN, así que la cookie
 * llegaba también al panel, que tiene otra con el mismo nombre: el panel leía la de la tienda y respondía
 * "419 Page Expired" (por ejemplo al crear un servidor desde Amigos). Además se borra la antigua de .cinammon.net.
 */
class HostOnlyCsrfCookie extends ValidateCsrfToken
{
    protected function addCookieToResponse($request, $response)
    {
        $response = parent::addCookieToResponse($request, $response);
        $config = config('session');
        if (! empty($config['domain']) && isset($response->headers)) {
            // Borra la antigua compartida (mismo nombre, dominio .cinammon.net)
            $response->headers->setCookie(new Cookie('XSRF-TOKEN', '', 1, $config['path'], $config['domain'], $config['secure'], false, false, $config['same_site'] ?? null));
        }

        return $response;
    }

    protected function newCookie($request, $config)
    {
        $config['domain'] = null;

        return parent::newCookie($request, $config);
    }
}
