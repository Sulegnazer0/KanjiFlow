# Cierre JLPT N4

Este documento registra el cierre de cobertura N4 en KanjiFlow usando como referencia práctica la lista de JLPT Sensei:

https://jlptsensei.com/jlpt-n4-kanji-list/

Nota importante: el JLPT no publica una lista oficial cerrada de kanji. Para mantener el proyecto consistente, KanjiFlow toma esta referencia como lista canónica interna para N4.

## Criterio de carga

- No duplicar kanji que ya existen como N5 en la app.
- Mantener IDs continuos después del bloque N4-5.
- Agregar ejemplos, traducciones, lección, trazos y pruebas antes de publicar.
- Cerrar los faltantes reales de la referencia, no volver a crear tarjetas para kanji ya dominables desde N5.

## Kanji N4 finales agregados

| id_jlpt | kanji | significado base | foco |
|---:|---|---|---|
| 201 | 楽 | Divertido / música | Música y disfrute |
| 202 | 質 | Calidad / pregunta | Preguntas y calidad |
| 203 | 試 | Probar / examen | Exámenes y pruebas |
| 204 | 族 | Familia / tribu | Familia |
| 205 | 早 | Temprano / rápido | Tiempo y velocidad |
| 206 | 映 | Reflejar / proyectar | Cine e imagen |
| 207 | 親 | Padre / cercano | Familia y cercanía |
| 208 | 験 | Prueba / efecto | Experiencia y exámenes |
| 209 | 英 | Inglés / excelente | Idiomas |
| 210 | 仕 | Servir / hacer | Trabajo |
| 211 | 去 | Irse / pasado | Tiempo pasado |
| 212 | 味 | Sabor / sentido | Comida y significado |
| 213 | 写 | Copiar / fotografiar | Fotos y copia |
| 214 | 字 | Carácter / letra | Escritura |
| 215 | 答 | Respuesta | Preguntas y respuestas |
| 216 | 夜 | Noche | Tiempo diario |
| 217 | 音 | Sonido | Audio y percepción |
| 218 | 注 | Verter / atención | Cuidado e indicación |
| 219 | 帰 | Regresar | Movimiento |
| 220 | 歌 | Canción | Música y voz |
| 221 | 悪 | Malo | Valoración |
| 222 | 図 | Mapa / dibujo | Mapas e imagen |
| 223 | 風 | Viento / estilo | Clima |
| 224 | 紙 | Papel | Escritura |
| 225 | 黒 | Negro | Colores |
| 226 | 花 | Flor | Naturaleza |
| 227 | 春 | Primavera | Estaciones |
| 228 | 赤 | Rojo | Colores |
| 229 | 青 | Azul / verde | Colores |
| 230 | 館 | Edificio / sala | Lugares públicos |
| 231 | 色 | Color | Colores |
| 232 | 秋 | Otoño | Estaciones |
| 233 | 夏 | Verano | Estaciones |
| 234 | 習 | Aprender | Estudio |
| 235 | 夕 | Tarde / atardecer | Tiempo diario |
| 236 | 肉 | Carne | Comida |
| 237 | 鳥 | Pájaro | Animales |
| 238 | 飯 | Comida / arroz | Comida |
| 239 | 勉 | Esfuerzo | Estudio |
| 240 | 冬 | Invierno | Estaciones |
| 241 | 昼 | Mediodía / día | Tiempo diario |
| 242 | 茶 | Té | Bebidas |
| 243 | 弟 | Hermano menor | Familia |
| 244 | 牛 | Vaca | Animales |
| 245 | 魚 | Pez / pescado | Animales y comida |
| 246 | 兄 | Hermano mayor | Familia |
| 247 | 犬 | Perro | Animales |
| 248 | 妹 | Hermana menor | Familia |
| 249 | 姉 | Hermana mayor | Familia |
| 250 | 漢 | Chino / kanji | Escritura japonesa |

## Kanji de la referencia ya cubiertos en N5

Estos kanji aparecen en la referencia N4 usada, pero KanjiFlow ya los enseña como parte del bloque N5. No se duplican para conservar progreso limpio por `cardId`:

新, 手, 目, 多, 安, 口, 少, 足, 古, 買, 飲.

## Estado

- Lección `kanji-n4-final` agregada en `js/core.js`.
- 50 tarjetas agregadas en `datos.csv`.
- 50 ejemplos agregados en `js/kanji-examples.js`.
- Traducciones ES/EN/DE/FR/PT agregadas.
- Versión de app actualizada a `0.8.11`.
- Pruebas esperadas: 463 tarjetas, 250 kanji y 250 ejemplos.
