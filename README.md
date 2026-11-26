# Dominó Latino

Aplicación móvil de dominó latino (doble-seis) construida con **Expo** y **React Native** para jugar partidas rápidas contra bots en **iPhone**, **Android** (Expo Go) y **Web**.

Sin registro, sin tutorial obligatorio, sin pantallas intermedias y sin mecánicas de apuestas: abres la app, eliges modalidad y puntaje objetivo, y estás jugando en segundos.

---

## Características principales

* **3 modalidades de juego:**
  * **1 contra 1:** 7 fichas por jugador y **pozo interactivo** de 14 fichas boca abajo (si no tienes jugada legal, recoges del pozo hasta poder jugar; si se vacía sin jugada, pasa turno automáticamente).
  * **2 contra 2:** Parejas enfrentadas (`Tú + Bot Compa` vs `Bot Oeste + Bot Este`), 28 fichas repartidas en turnos alternados.
  * **4 todos contra todos:** 4 jugadores individuales (`Tú` vs `Bot Chispa`, `Bot Tuerca` y `Bot Voltio`), 28 fichas.
* **6 puntajes objetivo:** `50`, `100` (por defecto), `150`, `200`, `250` y `300` puntos.
* **Reglas tradicionales estrictas:**
  * Baraja doble-seis (`0-0` a `6-6`) barajada aleatoriamente.
  * **Anulación automática por 4+ dobles:** si cualquier jugador recibe 4 o más dobles en el reparto inicial, se vuelve a repartir automáticamente.
  * **Salida:** obligatoria con `6-6` en la primera mano (en `1v1` sin `6-6`: doble más alto o ficha de mayor suma); en manos siguientes abre el jugador sentado a la derecha de quien abrió la mano anterior, sin importar quién ganó.
  * **Turnos en sentido horario**, imposible jugar fuera de turno o pasar teniendo jugada legal.
  * **Puntuación exacta:** en dominó y tranca se suman las fichas restantes de todos los demás jugadores (incluido el compañero en `2v2`; en `1v1` el pozo nunca puntúa). Empate exacto en el mínimo de una tranca = mano nula.
* **IA estrictamente justa (`src/engine/ai.ts`):**
  * Solo recibe información pública (`AiPublicView`: su propia mano, la cadena en mesa, historial de jugadas/pases y conteo de fichas). Nunca accede a la mano del jugador ni a las fichas del pozo.
  * Ritmo humano situacional (ajustable en Pausa: `Humano`, `Relajado`, `Rápido`).
* **Experiencia móvil y Game Feel ("Club Caribe"):**
  * Arrastre fluido en el hilo de UI (`react-native-gesture-handler` + `react-native-reanimated`) con vista previa fantasma en los extremos válidos, imantación y doble toque rápido cuando solo hay un extremo disponible.
  * Cadena serpenteante bidireccional (dobla en 90° por ambos extremos) con fichas de porcelana marfil (jugables) vs. ébano oscuro (no jugables).
  * Avatares con anillo de cuenta regresiva (`20 s`, cuenta `5-4-3-2-1` sobre el avatar), globos de acción y menú de pausa integrado.
  * Mano auto-comprimible sin scroll horizontal (vertical y horizontal) y resultados de ronda con fichas verticales debajo de cada jugador/pareja.
  * Persistencia automática con `AsyncStorage` + reto diario de 3 estrellas y racha local.

---

## Stack técnico

* **Expo SDK 58** · **React Native 0.88** · **React 19.3** · **TypeScript (strict)**
* **Expo Router** (navegación)
* **React Native Reanimated 4** + **React Native Gesture Handler 3**
* **react-native-svg** + **expo-linear-gradient** + **expo-haptics**
* **@react-native-async-storage/async-storage**
* 100 % compatible con **Expo Go** (sin necesidad de compilar módulos nativos personalizados).

---

## Estructura del proyecto

```text
├── app.json
├── scripts/
│   └── test-engine.mjs              # Suite de pruebas unitarias del motor y simulaciones
└── src/
    ├── app/
    │   ├── _layout.tsx              # GestureHandlerRootView + SafeAreaProvider + Stack
    │   └── index.tsx                # Controlador principal, turnos, timer y persistencia
    ├── components/domino/
    │   ├── AvatarIllustration.tsx   # Avatares SVG (Jugador y Bot robotito con expresiones)
    │   ├── BoardCanvas.tsx          # Mesa y cadena serpenteante bidireccional con física seca
    │   ├── BoneyardDrawer.tsx       # Bandeja lateral física del pozo (1v1)
    │   ├── DominoTile.tsx           # Fichas porcelana marfil, ébano y fantasma
    │   ├── GameTableView.tsx        # Mesa full-bleed, drag-and-drop UI-thread y atril
    │   ├── HistoryModal.tsx         # Historial cronológico de la mano
    │   ├── Icons.tsx                # Íconos vectoriales SVG
    │   ├── MatchOverView.tsx        # Overlay de fin de partida y revancha
    │   ├── PauseModal.tsx           # Menú de pausa (orden, ritmo del Bot, sonido, historial)
    │   ├── RoundSummaryView.tsx     # Overlay de resultados entre manos con fichas verticales
    │   ├── SeatAvatar.tsx           # Avatar con anillo de timer SVG y globos de acción
    │   └── SetupView.tsx            # Pantalla de inicio y configuración rápida
    ├── constants/
    │   ├── seatProfiles.ts          # Capa de presentación de jugadores y Bots
    │   └── tokens.ts                # Tokens visuales "Club Caribe"
    ├── engine/
    │   ├── ai.ts                    # IA justa basada únicamente en información pública
    │   ├── rules.ts                 # Motor puro de reglas, reparto, pozo y puntuación
    │   └── types.ts                 # Tipos TypeScript del dominio
    ├── storage/
    │   └── gameStorage.ts           # Persistencia de partida y progreso diario
    └── utils/
        └── feedback.ts              # Haptics nativos y efectos de audio opcionales
```

---

## Cómo ejecutarlo

### Requisitos
* Node.js 20+ y npm
* App **Expo Go** instalada en tu **iPhone** (App Store) o **Android** (Google Play)

### Instalación y arranque
```bash
npm install
npm start
```

Escanea el código QR (o ingresa la URL `exp://...` que aparece en consola) desde **Expo Go** con tu teléfono conectado a la misma red Wi-Fi. También puedes abrir la versión web con:

```bash
npm run web
```

---

## Pruebas y verificación

Ejecutar la suite de pruebas del motor de reglas (baraja, anulación por 4+ dobles, pozo, tranca, empate nulo, rotación de salida y partidas simuladas completas en las 3 modalidades y 6 puntajes objetivo):

```bash
node --test scripts/test-engine.mjs
```

Verificar tipos de TypeScript en todo el proyecto:

```bash
npx tsc --noEmit
```
