# DESIGN LANGUAGE — Dominó Latino

> **Una sola frase:** *Una sobremesa cálida de dominó donde siempre hay buena compañía.*

---

## 1. Género y Posicionamiento
- **Género principal — Atmosphere (*Un lugar al que entras*):** al abrir la app entras a una mesa nocturna serena de madera, paño petróleo/esmeralda y luz cálida de lámpara — nunca a un casino ruidoso ni a un arcade infantil.
- **Género secundario — Social Companionship (*Presencia humana sin toxicidad*):** un público central busca compañía real a través del juego. Cada jugador luce su propio avatar 2.5D ilustrado, puede saludar y reaccionar con 6 gestos cálidos de sobremesa (sin chat libre tóxico), y puede guardar un círculo íntimo de hasta 20 **Compañeros de Mesa**.

## 2. El Objeto Firma (*One Material Nobody Owns*)
- **La ficha táctil de porcelana marfil** sobre madera de caoba y paño aterciopelado.
- Aparece como emblema vivo en la pantalla de Inicio (en el estilo de fichas equipado por el jugador), en la mesa de juego y en el cierre de cada mano, acompañada de sonido físico real de madera/porcelana y háptica sutil.

## 3. Sistema Visual Unificado (Regla de los 50 ms)
Se elimina la mezcla previa de estilos (arcade 3D brillante + avatar 2.5D + mesa nocturna). Todas las pantallas comparten una misma familia cromática y de materiales:

| Rol | Token / Color | Uso |
|---|---|---|
| **Habitación nocturna (60 %)** | `#071419` → `#0B2027` → `#061116` | Fondo unificado de Home, Lobby, Sala de Espera y Mesa |
| **Superficies de cristal ahumado (30 %)** | `rgba(14, 32, 40, 0.80)` + borde `rgba(245, 214, 138, 0.18)` | Tarjetas, modales, controles y HUD |
| **Luz de sobremesa / Latón (Acento cálido)** | `#F5C451` / `#FCE39C` | Selección activa, medallón de fichas, brillo de victoria |
| **Acción principal (10 %)** | `#27D188` → `#128554` | CTA único protagonista por pantalla ("Jugar ahora", "Sentarme ya") |
| **Porcelana marfil** | `#FFFDF9` → `#EFE7D6` | Fichas jugables y encabezados editoriales |

### Reglas estrictas de interfaz
1. **Un solo trabajo por pantalla:** sin banners promocionales ni pop-ups al abrir.
2. **Avatares 2.5D en todas partes:** tanto en Inicio como en salas Online, mesas y resúmenes — jamás mezclar renders 3D ajenos con el sistema ilustrado 2.5D.
3. **Color con significado:** verde = tu turno / acción positiva, dorado = atención o premio, ámbar = pasar o últimos 7 s, coral = urgencia final (`<= 5 s`) o salida.

## 4. Momentos Firma (*Signature Moments*)
1. **Cierre de mano (`¡Dominó!` / `¡Tranca!`):** pausa escénica de ~0,95 s sobre la mesa real antes del resumen, con halo dorado cálido, banner limpio, avatar ganador y sonido celebratorio.
2. **Reacciones de sobremesa:** 6 frases breves (*"¡Hola!"*, *"¡Buena jugada!"*, *"¡Uff!"*, *"¡Trancado!"*, *"¡Bien, compa!"*, *"¡Buen juego!"*) en globo flotante sobre el avatar durante 2,6 s con tono cálido.
3. **Golpe de ficha:** sonido seco de porcelana sobre caoba + háptica diferenciada para ficha normal vs. doble.

## 5. Voz y Copy (Anfitrión Cálido, Nunca Servidor)
- **Saludo contextual por hora:** *"Buenos días"*, *"Buenas tardes"*, *"Buenas noches"* + invitación serena (*"La mesa está servida"*).
- **Estados vacíos y esperas:** nunca mensajes fríos de base de datos. En vez de *"No hay mesas esperando ahora"*, decir *"La mesa está lista para ti — abre una o siéntate al instante"*.
- **Errores:** claros, breves y humanos; siempre ofrecer una salida tranquila sin culpar al jugador.
- **Compañía en modo solitario:** los Bots (en especial tu `Compa` en 2v2) comentan con sobriedad en jugadas clave (dobles, trancas, cierres), sin saturar la pantalla.
