# Dominó Latino

Aplicación móvil de dominó latino (doble-seis) construida con **Expo** y **React Native** para jugar partidas rápidas contra bots o mesas multijugador online en **iPhone**, **Android** (Expo Go) y **Web**.

Juego social de dominó sin dinero real: puedes empezar una partida local al instante sin registro, o iniciar sesión con **Apple / Google** para jugar mesas públicas, salas privadas con código, sincronizar tu progreso y personalizar tu avatar, mesas y fichas con **Monedas/Fichas de Club** (moneda virtual gratuita sin valor monetario ni canje).

---

## Características principales

* **3 modalidades de juego (Local y Online):**
  * **1 contra 1:** 7 fichas por jugador y **pozo interactivo** de 14 fichas boca abajo (si no tienes jugada legal, recoges del pozo hasta poder jugar; si se vacía sin jugada, pasa turno automáticamente).
  * **2 contra 2:** Parejas enfrentadas (`Tú + Compa` vs `Oeste + Este`), 28 fichas repartidas en turnos alternados.
  * **4 todos contra todos:** 4 jugadores individuales, 28 fichas.
* **6 puntajes objetivo:** `50`, `100` (por defecto), `150`, `200`, `250` y `300` puntos.
* **Reglas tradicionales estrictas (`src/engine/rules.ts`):**
  * Baraja doble-seis (`0-0` a `6-6`) barajada aleatoriamente (CSPRNG `crypto.getRandomValues` en servidor online).
  * **Anulación automática por 4+ dobles:** si cualquier jugador recibe 4 o más dobles en el reparto inicial, se vuelve a repartir automáticamente.
  * **Salida:** en la primera mano abre quien tenga el `6-6`; si nadie lo tiene (por ejemplo en `1v1` cuando queda en el pozo, o en cualquier reparto personalizado sin `6-6`), `determineFirstHandOpener` aplica en todas las modalidades el fallback al doble más alto y luego a la ficha de mayor suma. En manos siguientes abre el jugador sentado a la derecha de quien abrió la mano anterior, sin importar quién ganó.
  * **Turnos en sentido horario:** imposible jugar fuera de turno o pasar teniendo jugada legal.
  * **Puntuación exacta:** en dominó y tranca se suman las fichas restantes de todos los demás jugadores (incluido el compañero en `2v2`; en `1v1` el pozo nunca puntúa). Empate exacto en el mínimo de una tranca = mano nula (`0` pts).
* **Multijugador Online autoritativo (`supabase/functions/domino-online`):**
  * **Salas privadas (código de 6 caracteres):** siempre amistosas (`0` fichas de entrada, regla anti-chip-dumping).
  * **Salas públicas y Quick Match:** entrada opcional en Fichas de Club (`0`, `100`, `500`, `1.000`) con escrow atómico en servidor.
  * **Integridad de salones:** las mesas públicas con fichas (`buy_in > 0`) esperan exclusivamente jugadores reales; si no se llena, el anfitrión tiene el botón explícito **«Jugar gratis con Bots»** que convierte la sala a `0` fichas sin cobro. Si un jugador abandona en mitad de una partida iniciada, es sustituido automáticamente por un Bot para que la mesa termine sin bloqueos.
* **Economía social y personalización (`supabase/functions/domino-account`):**
  * **Sin dinero real ni apuestas monetarias:** las Fichas de Club se ganan jugando, con el reto diario de 3 estrellas, la recompensa diaria de 7 días y la recarga gratuita automática (cuando el saldo baja de `200`, con enfriamiento en servidor). No se venden ni se canjean por dinero.
  * **Estudio de Avatar 2.5D modular:** base femenina/masculina, 8 tonos de piel, 4 formas de rostro, 20 ojos + 6 colores de iris, 5 cejas, 5 narices, 20 bocas, 27 peinados, 10 detalles faciales, 26 atuendos, 11 gafas, 12 sombreros y 10 fondos de estudio.
  * **Boutique de Mesas y Fichas:** 5 temas de mesa y 6 estilos de fichas coleccionables.
* **IA estrictamente justa (`src/engine/ai.ts`):**
  * Solo recibe información pública (`AiPublicView`: su propia mano, la cadena en mesa, historial de jugadas/pases y conteo de fichas). Nunca accede a la mano del jugador ni a las fichas del pozo.
  * Ritmo ajustable en Pausa (`Humano`, `Relajado`, `Rápido`).

---

## Stack técnico

* **Expo SDK 58** · **React Native 0.88** · **React 19.3** · **TypeScript (strict)**
* **Expo Router** (navegación)
* **React Native Reanimated 4** + **React Native Gesture Handler 3**
* **react-native-svg** + **expo-linear-gradient** + **expo-haptics** + **expo-secure-store**
* **Supabase** (Postgres + RLS + Realtime + Auth OAuth PKCE Apple/Google + Edge Functions Deno)
* 100 % compatible con **Expo Go** (sin módulos nativos personalizados fuera del bundle de Expo Go).

---

## Estructura del proyecto

```text
├── .github/workflows/ci.yml         # CI: typecheck + pruebas del motor
├── app.json
├── scripts/
│   └── test-engine.mjs              # Suite unitaria y de simulación del motor
├── supabase/
│   ├── functions/
│   │   ├── domino-account/          # Edge Function de cuenta, economía, avatares y borrado
│   │   └── domino-online/           # Edge Function autoritativa multijugador
│   └── migrations/                  # Migraciones SQL versionadas (esquema, RLS y RPCs)
└── src/
    ├── app/                         # Expo Router (_layout.tsx, index.tsx)
    ├── components/domino/           # Mesa, fichas, avatares 2.5D, lobby, salas y modales
    ├── constants/                   # Catálogos (avatarCatalog, tableThemes, tileStyles, tokens)
    ├── context/                     # AuthContext
    ├── engine/                      # Motor puro de reglas (rules.ts), IA justa (ai.ts) y tipos
    ├── lib/                         # Supabase, auth PKCE, onlineService, analytics, remoteConfig
    ├── storage/                     # Persistencia local (gameStorage) y sincronización (syncService)
    └── utils/                       # Haptics y feedback
```

---

## Cómo ejecutarlo

### Requisitos
* Node.js 20+ y npm
* App **Expo Go** instalada en **iPhone** o **Android**
* Variables públicas de Supabase en `.env.local` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

### Instalación y arranque
```bash
npm install
npm start
```

Escanea el código QR desde **Expo Go** con tu teléfono en la misma red Wi-Fi, o abre la versión web con:

```bash
npm run web
```

---

## Pruebas y verificación

Ejecutar la suite de pruebas del motor de reglas (baraja, anulación por 4+ dobles, pozo, trancas en 1v1/2v2/4p, empates nulos, jugadas ilegales, rotación de salida y 300+ manos simuladas):

```bash
npm test
```

Verificar tipos de TypeScript en todo el proyecto:

```bash
npm run typecheck
```
