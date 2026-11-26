# Security & Hardening Checklist — Dominó Latino

Este documento resume los controles de seguridad implementados (alineados con **OWASP API/Mobile Top 10**, **CIS**, **NIST 800-63B**, **SOC 2 Privacy** y **Apple App Store 5.1.1(v)**) y el checklist obligatorio antes de desplegar a producción.

---

## 1. Controles ya implementados

### Base de datos y Economía (Supabase Postgres)
- **RLS habilitado en el 100 % de las tablas** de `public` (`profiles`, `user_progress`, `match_history`, `chip_ledger`, `analytics_events`, `game_rooms`, `room_players`, `room_player_hands`, `room_states`, `api_rate_limits`).
- **Tablas cerradas solo a servidor (`service_role`):** `public.room_states` (manos ocultas y pozo del servidor) y `public.api_rate_limits` tienen `REVOKE ALL FROM public, anon, authenticated`.
- **Escritura directa bloqueada en economía:** `INSERT`, `UPDATE` y `DELETE` sobre `user_progress` y `chip_ledger` están revocados para `anon` y `authenticated`.
- **Operaciones atómicas contra race conditions (`FOR UPDATE`):** `srv_adjust_club_chips`, `srv_claim_daily_reward` (con validación de fecha ±36 h), `srv_free_refill`, `srv_unlock_or_equip_theme` y `srv_check_rate_limit`.
- **Anti-chip-dumping:** las salas privadas tienen constraint de base de datos `private_rooms_zero_buy_in` (`buy_in = 0`).
- **Constraints de payload:** límites de longitud/tamaño en `analytics_events`, `match_history` y `profiles`.

### Edge Functions autoritativas (`domino-account` & `domino-online`)
- `verify_jwt: true` + verificación explícita `userClient.auth.getUser()` en cada solicitud (nunca se confía en headers del cliente ni en `user_metadata` para autorización).
- **Rate-limiting por usuario y acción** en Postgres (`srv_check_rate_limit`).
- **Validación estricta de entradas:** UUIDs, códigos de sala de 6 caracteres, IDs de ficha `[0-6]-[0-6]`, lados `left|right|start` e índices del pozo.
- **CSPRNG (`crypto.getRandomValues`)** para barajado de fichas y códigos de sala.
- **Escrow atómico con reembolso compensatorio** al iniciar partidas públicas con fichas de club.
- **Timeout de turno en servidor (`claim_timeout` tras 25 s)** y limpieza automática de salas abandonadas (>30 min).

### Cliente móvil (iOS / Android / Expo Go)
- **Sesión cifrada en hardware:** `src/lib/supabase.ts` usa `expo-secure-store` (Keychain iOS / Keystore Android, `AFTER_FIRST_UNLOCK`) con chunking automático (1800 chars) para JWTs > 2048 bytes y migración desde sesiones previas.
- **OAuth PKCE estricto:** `src/lib/auth.ts` valida que la URL de inicio pertenezca al origen de `EXPO_PUBLIC_SUPABASE_URL`, valida la URL de callback contra `redirectTo` y rechaza tokens implícitos en la URL.
- **Android backup desactivado:** `android.allowBackup = false` en `app.json`.
- **Eliminación de cuenta in-app:** `AccountCard.tsx` + `domino-account` (`action: 'delete_account'`) borra permanentemente el usuario en `auth.users` con cascada.
- **Reseñas y feedback 100 % compliant (Apple HIG 5.6.1 / Google Play In-App Review):** `src/lib/storeReview.ts` dispara `expo-store-review` directamente en momentos de victoria ("Peak Joy", cooldown 60 días, máx. 2/año) sin *review gating*. El buzón `FeedbackModal.tsx` → `public.app_feedback` (RLS solo `INSERT`, 5–500 chars) está siempre disponible e independiente.
- **Kill Switch remoto y versión mínima:** `public.app_config` (solo lectura pública, editable solo desde servidor/Dashboard) permite apagar el multiplayer (`online_enabled = false`), mostrar avisos (`maintenance_banner`) o exigir actualización (`min_supported_version`) sin esperar revisión de las tiendas.
- **ErrorBoundary global y registro de crashes:** `GlobalErrorBoundary.tsx` envuelve el árbol raíz y registra fallos en `public.app_error_logs` (RLS solo `INSERT`, con throttling anti-flood); listo para complementarse con Sentry al generar builds nativos EAS.
- **Secretos fuera del cliente:** `.env*.local` ignorado en `.gitignore`; solo `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` entra al bundle.

---

## 2. Checklist obligatorio antes de salir a Producción

### Supabase Dashboard (Auth & API)
- [ ] **URL Configuration → Redirect URLs:** listar **solo URLs exactas** (`dominolatino://auth/callback`, tu dominio exacto de producción). **Nunca usar wildcards amplios (`*` o `https://**`)**.
- [ ] **Providers:** habilitar únicamente **Google** y **Apple**; desactivar **Email/Password** si no se usará (si se activa en el futuro, encender **Leaked Password Protection** y verificación de correo obligatoria).
- [ ] **Storage:** si se agregan buckets (p. ej., avatares), crearlos privados o con políticas RLS estrictas por carpeta `auth.uid()::text`.
- [ ] **CORS en Edge Functions:** reemplazar `Access-Control-Allow-Origin: '*'` por tu dominio web exacto de producción en `domino-online` y `domino-account` cuando publiques la versión Web.
- [ ] **Advisors:** revisar `Security Advisor` y `Performance Advisor` tras cada nueva migración.

### Despliegue Web (si publicas `expo export --platform web`)
- [ ] **Bloquear `/.git`:** usar plataformas gestionadas (Vercel, Cloudflare Pages, Netlify) o denegar explícitamente `/.git` en Nginx/Caddy.
- [ ] **Excluir source maps públicos:** no subir ni servir archivos `*.js.map` en el servidor web público.
- [ ] **Headers HTTP de seguridad** en el hosting Web:
  ```text
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```
- [ ] **Dominios y DNS:** eliminar cualquier registro `CNAME` huérfano al retirar entornos o subdominios temporales (anti-subdomain takeover).

### Monetización futura (IAP)
- [ ] Cuando se habiliten compras in-app cosméticas/VIP (Apple StoreKit / Google Play Billing / RevenueCat), **validar siempre los recibos en servidor vía webhook firmado**; nunca otorgar beneficios confiando en el cliente.
