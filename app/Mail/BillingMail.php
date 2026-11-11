<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Correos de la tienda: una plantilla Markdown por aviso (resources/views/emails/*).
 * Se envían en el momento (billing no tiene cola de trabajos en marcha) y un fallo nunca rompe el pago o el pedido.
 */
class BillingMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $subjectLine, public string $template, public array $data = [], public ?string $key = null)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->subjectLine);
    }

    /** Clave para que el Worker de correo no descarte avisos legítimos que se parezcan. */
    public function headers(): Headers
    {
        return new Headers(text: $this->key ? ['X-Idempotency-Key' => $this->key] : []);
    }

    public function content(): Content
    {
        return new Content(markdown: 'emails.'.$this->template, with: $this->data);
    }

    /** Envía sin lanzar excepciones: se apunta en el log y la operación sigue. */
    public static function deliver(string|array|null $to, string $subject, string $template, array $data = [], ?string $key = null): void
    {
        $to = array_values(array_filter((array) $to));
        if (! $to) {
            return;
        }

        try {
            Mail::to($to)->send(new self($subject, $template, $data, $key));
        } catch (\Throwable $e) {
            Log::warning("Correo «{$template}» no enviado: ".$e->getMessage());
        }
    }

    public static function money(float $amount): string
    {
        return number_format($amount, 2, ',', '.').' €';
    }
}
