# DESIGN LANGUAGE — Dominó Latino

> **Una sola frase:** *Una sobremesa cálida de dominó donde siempre hay buena compañía.*

---

## 1. Género y Posicionamiento
- **Género principal — Atmosphere (*Un lugar al que entras*):** dos ambientes curados de primer nivel, intercambiables en un toque desde Ajustes o la Pausa de mesa:
  1. **`Noche de Club` (predeterminado):** velada nocturna habanera en petróleo profundo (`#0B1D26`), madera de caoba lacada, tarjeta de bienvenida en marfil crema (`#FBF5E6`), latón cepillado y paño esmeralda.
  2. **`Día Brisa`:** terraza soleada caribeña en lino travertino (`#F6F1E7`), superficies limpias de porcelana blanca, acentos jade marino (`#1BA8A0`) y acción principal en coral terracota (`#F05A43`).
- **Género secundario — Social Companionship (*Presencia humana sin toxicidad*):** tanto en partidas rápidas como en salas online, la mesa está habitada por personajes humanos carismáticos renderizados en nuestro sistema vectorial 2.5D (*Don Mateo*, *Camila* — tu compañera en 2v2 —, *Tío Rafa* y *Valeria*), con 6 gestos cálidos de sobremesa y un círculo de hasta 20 **Compañeros de Mesa**.

## 2. Tipografía Redondeada y Táctil
- **Display & Números Protagonistas (`Fredoka`):** títulos, marcadores, metas de puntos y botones primarios con curvas esculpidas y personalidad cálida de juego clásico moderno.
- **UI & Lectura Tabular (`Nunito`):** controles, etiquetas, fichas de club y conteos (`tabular-nums`) con máxima legibilidad en pantallas pequeñas.

## 3. El Objeto Firma (*One Material Nobody Owns*)
- **La ficha táctil de porcelana marfil con clavija central de latón** sobre madera de caoba y paño aterciopelado.
- **Permanencia material absoluta:** las fichas en tu atril nunca mutan a gris oscuro cuando no es tu turno ni cuando no encajan; conservan siempre el set equipado (Marfil Clásico, Ébano Imperial, Jade, Coral o Noche de Oro) y expresan estado mediante elevación física y atenuación suave.

## 4. Sistema Visual Unificado (Cero Slop)
1. **Unificación 100 % de modales y cierres:** los 8 modales y pantallas de resumen consumen los tokens semánticos de `usePalette()` (`modalBg`, `modalCardBg`, `modalCardLip`, `winnerCardBg`), sin superficies azul marino heredadas ni alertas nativas intrusivas.
2. **Vestidor de Identidad Creativa (`AvatarStudioModal`):** 6 macro-secciones claras (`Looks`, `Rostro`, `Pelo`, `Expresión`, `Ropa`, `Extras`), **Looks Temáticos** a 1 toque (Clásico Habana, Rock & Roll, Capitán Pirata, Noche Real, Carnaval, Gala de Club), cámara automática de primer plano (`camera="face"`) al editar rasgos faciales y gafas, trazos Bézier limpios y recorte inteligente de peinados bajo sombreros.
3. **Flujo de partida respetuoso:** reparto escalonado al iniciar mano, cajón deslizable del Pozo (`BoneyardDrawer`), burbujas tácticas breves (`1,85 s`) que no tapan el tablero, y cierre de partida celebratorio con desglose de Fichas de Club y XP sin cuenta regresiva forzada.

## 5. Momentos Firma (*Signature Moments*)
1. **Cierre de mano (`¡Dominó!` / `¡Tranca!`):** pausa escénica de ~0,95 s sobre la mesa real antes del resumen, diferenciando sonido/háptica cuando gana tu equipo frente al rival.
2. **Reacciones de sobremesa:** 6 frases breves (*"¡Hola!"*, *"¡Buena jugada!"*, *"¡Uff!"*, *"¡Trancado!"*, *"¡Bien, compa!"*, *"¡Buen juego!"*) en globo flotante absoluto sin desplazar el tablero.
3. **Golpe de ficha:** sonido seco de porcelana sobre caoba + háptica diferenciada para ficha normal vs. doble.
