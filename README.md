<p align="center">
  <pre align="center">
<font color="#ff007f"><b>╔═╗╦╔╗╔╔═╗╔╦╗╔╦╗╔═╗╔╗╔  ╔╗ ╦╦  ╦  ╦╔╗╔╔═╗</b></font>
<font color="#a855f7"><b>║  ║║║║╠═╣║║║║║║║ ║║║║  ╠╩╗║║  ║  ║║║║║ ╦</b></font>
<font color="#00f7ff"><b>╚═╝╩╝╚╝╩ ╩╩ ╩╩ ╩╚═╝╝╚╝  ╚═╝╩╩═╝╩═╝╩╝╚╝╚═╝</b></font>
  </pre>
  <p align="center">
    <b><code>// SYNTHWAVE CLIENT PORTAL & AUTOMATED REVENUE REPUTATION ENGINE //</code></b>
  </p>
  <p align="center">
    <a href="https://github.com/cinammon-net/billing"><img src="https://img.shields.io/badge/COMMERCE-LARAVEL%2011-ff007f?style=for-the-badge&logo=laravel&labelColor=050814" alt="Laravel 11" /></a>
    <a href="https://github.com/cinammon-net/billing"><img src="https://img.shields.io/badge/PORTAL-REACT%20%2B%20INERTIA-00f7ff?style=for-the-badge&logo=react&labelColor=050814" alt="React Inertia" /></a>
    <a href="https://github.com/cinammon-net/billing"><img src="https://img.shields.io/badge/SECURITY-TOTP%202FA%20ACTIVE-a855f7?style=for-the-badge&logo=authy&labelColor=050814" alt="2FA Active" /></a>
    <a href="https://github.com/cinammon-net/panel"><img src="https://img.shields.io/badge/PROVISIONING-INSTANT%20DISPATCH-10b981?style=for-the-badge&logo=lightning&labelColor=050814" alt="Instant Provisioning" /></a>
  </p>
</p>

---

## ⚡ // 01. VISUAL INTERFACE & CLIENT PORTAL

<div align="center">
  <p><b>💳 CLIENT BILLING DASHBOARD & ACTIVE SUBSCRIPTIONS</b></p>
  <img src="./docs/assets/billing-dashboard.png" alt="Cinammon Billing Dashboard" width="100%" style="border-radius: 12px; border: 1px solid rgba(255, 0, 127, 0.4); box-shadow: 0 0 25px rgba(255, 0, 127, 0.2);" />
  <p><i>Interfaz reactiva de usuario: administración de pedidos en tiempo real, desglose de facturas y accesos directos al panel.</i></p>
</div>

<br />

<div align="center">
  <table width="100%">
    <tr>
      <td width="50%" align="center">
        <b>🛒 PLANS & HARDWARE MATRIX</b><br /><br />
        <img src="./docs/assets/client-services.png" alt="Hardware Plans" width="100%" style="border-radius: 8px; border: 1px solid rgba(0, 247, 255, 0.4);" /><br />
        <sub>Catálogo categorizado por juegos, bases de datos y bots con aprovisionamiento instantáneo.</sub>
      </td>
      <td width="50%" align="center">
        <b>⛏️ MINECRAFT & GAME TIERS</b><br /><br />
        <img src="./docs/assets/store-minecraft.png" alt="Minecraft Hosting Plans" width="100%" style="border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.4);" /><br />
        <sub>Planes con asignación garantizada de RAM DDR5, Ryzen 9 vCPU y almacenamiento NVMe Gen4.</sub>
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <br /><b>🔐 CYBER IDENTITY & 2FA FORTIFY</b><br /><br />
        <img src="./docs/assets/cyber-security.png" alt="Cyber Security" width="100%" style="border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.4);" /><br />
        <sub>Seguridad de doble factor (TOTP), control de sesiones activas y facturación cifrada.</sub>
      </td>
      <td width="50%" align="center">
        <br /><b>🔑 SEAMLESS SSO AUTHENTICATION</b><br /><br />
        <img src="./docs/assets/billing-dashboard.png" alt="Seamless SSO" width="100%" style="border-radius: 8px; border: 1px solid rgba(255, 0, 127, 0.4);" /><br />
        <sub>Traspaso de sesión firmado criptográficamente por HMAC SHA-256 desde el panel a facturación.</sub>
      </td>
    </tr>
  </table>
</div>

---

## 🛰️ // 02. ARCHITECTURE & DISPATCH PIPELINE

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Cliente Cyber
    participant Billing as 💎 Cinammon Billing
    participant Gateway as 💳 Gateway de Pago
    participant Panel as ⚡ Cinammon Panel API
    participant Wings as 🚀 Wings Daemon

    User->>Billing: Selecciona Plan (vCPU, RAM, NVMe)
    Billing->>User: Emite Factura #INV con vencimiento
    User->>Gateway: Procesa transacción
    Gateway-->>Billing: Webhook de confirmación de pago
    Billing->>Panel: Disparar aprovisionamiento (/api/servers/create)
    Panel->>Wings: Desplegar contenedor Docker con imagen Egg
    Wings-->>Panel: Contenedor listo & Token SFTP emitido
    Billing->>User: Servicio activo & Enlace a la Cyber Consola
```

---

## 🔮 // 03. CORE MODULES

* **💎 Automated Storefront (`/store`)**: Tienda pública reactiva organizada por categorías de servidores (Minecraft, Bots, Juegos dedicados, Bases de datos) con badges de hardware Ryzen 9 y DDR5.
* **🌐 API de Catálogo (`/api/plans`)**: Endpoint JSON de alta velocidad consumido por la landing principal de Cinammon para reflejar precios y cuotas de hardware al instante.
* **🧾 Lifecycle de Facturación & Cancelación Asistida**: Estados automatizados (`active`, `pending`, `suspended`, `cancelled`, `paid`, `overdue`). Al cancelar un servicio, el daemon Wings **detiene inmediatamente** el contenedor Docker y se activa un periodo de gracia de 7 días antes de la purga permanente.
* **🔑 Seamless Single Sign-On (SSO)**: Acceso directo sin re-login. Al navegar desde el Panel a `/billing/redirect`, se emite un payload firmado criptográficamente con HMAC-SHA256 (`PANEL_API_TOKEN`) que autentica al usuario en el portal de facturación en milisegundos.
* **🔐 Ciberseguridad & 2FA**: Integración nativa con autenticación de dos factores (TOTP RFC 6238), códigos de recuperación y desconexión remota de sesiones concurrentes.
* **🌉 Seamless Panel Bridge**: Sincronización bidireccional transparente con [Cinammon Panel](https://github.com/cinammon-net/panel). El usuario adquiere el servicio y pasa directamente a administrar sus archivos y consola.

---

## 🛠️ // 04. QUICKSTART & DEPLOYMENT

### Variables de Entorno Clave (`.env`)

```env
APP_NAME="Cinammon Billing"
APP_ENV=production
APP_KEY=base64:...
APP_URL=https://billing.cinammon.net

# Conexión con el núcleo del Panel
PANEL_URL=https://panel.cinammon.net
PANEL_API_KEY=cinammon_secret_dispatch_token

# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cinammon_billing
DB_USERNAME=cinammon
DB_PASSWORD=secret_cyber_pass
```

### Comandos de Instalación

```bash
# 1. Instalar dependencias
composer install --no-dev --optimize-autoloader
npm ci

# 2. Generar clave y migrar esquema
php artisan key:generate
php artisan migrate --force

# 3. Compilar bundles frontend de producción
npm run build

# 4. Optimizar cachés
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 📡 // 05. ECOSYSTEM MATRIX

| Repositorio | Función | Stack Tecnológico |
| :--- | :--- | :--- |
| **[cinammon-net/billing](https://github.com/cinammon-net/billing)** | Portal de clientes, tienda de planes automatizada y pasarelas | Laravel 11, Inertia.js, TailwindCSS, Fortify 2FA |
| **[cinammon-net/panel](https://github.com/cinammon-net/panel)** | Orquestador principal, interfaz de administración y consola cyber | Laravel 11, React 18, Inertia.js, TailwindCSS |
| **[cinammon-net/wings](https://github.com/cinammon-net/wings)** | Daemon de alto rendimiento, comunicación WebSocket y SFTP | Golang 1.23, Docker Engine API, WebSockets |
| **[cinammon-net/eggs](https://github.com/cinammon-net/eggs)** | Catálogo de más de 129 plantillas de instalación y ejecución | Dockerfiles, Bash Scripts, JSON Blueprints |

---

<p align="center">
  <sub>Cinammon.net // Synthwave Financial Architecture // 2026</sub>
</p>
