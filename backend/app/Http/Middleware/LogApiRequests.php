<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogApiRequests
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        if ($request->is('api/*') && config('app.debug')) {
            Log::info('API Request', [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
                'user' => $request->user()?->cedula,
                'status' => $response->status()
            ]);
        }
        
        return $response;
    }
}
