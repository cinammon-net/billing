<?php

namespace App\Http\Controllers;

use App\Models\MailArchive;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Correos que ha enviado la tienda, para «Mis correos» del panel (token compartido X-Billing-Token).
 * El panel ya ha comprobado quién es la persona; aquí solo se filtra por su correo
 * (y por los buzones del equipo si el panel dice que es Owner o Admin).
 */
class PanelMailController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorizePanel($request);

        return response()->json(['mails' => $this->query($request)->latest('sent_at')->limit(200)
            ->get(['uuid', 'to', 'subject', 'view', 'sent_at'])]);
    }

    public function show(Request $request): JsonResponse
    {
        $this->authorizePanel($request);
        $mail = $this->query($request)->where('uuid', (string) $request->input('uuid'))->first();
        abort_unless($mail, 404);
        try {
            $html = $mail->html();
        } catch (\Throwable $e) {
            report($e);
            abort(410, 'Este correo ya no se puede mostrar.');
        }

        return response()->json(['subject' => $mail->subject, 'sent_at' => $mail->sent_at, 'html' => $html]);
    }

    private function query(Request $request)
    {
        $emails = collect((array) $request->input('emails'))->map(fn ($e) => mb_strtolower(trim((string) $e)))->filter()->values();
        abort_if($emails->isEmpty(), 422);

        return MailArchive::query()->whereIn('to', $emails);
    }

    private function authorizePanel(Request $request): void
    {
        $token = (string) config('billing.panel_token');
        abort_if($token === '' || ! hash_equals($token, (string) $request->header('X-Billing-Token')), 401);
    }
}
