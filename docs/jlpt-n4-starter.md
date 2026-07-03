# Bloque inicial JLPT N4

Este documento propone el primer bloque de kanji N4 para KanjiFlow. La idea es crecer en tandas revisables, no cargar cientos de tarjetas de golpe.

Importante: este bloque es una lista curricular interna de KanjiFlow. Debe revisarse antes de publicarse y no debe añadirse a `datos.csv` hasta que `KanjiStrokeOrders.woff` incluya los glifos de orden de trazos correspondientes.

## Criterios

- Mantener IDs continuos después de los 80 kanji N5 actuales.
- Cada kanji debe tener ejemplo completo en `js/kanji-examples.js`.
- Cada tarjeta debe tener traducción en todos los idiomas activos.
- Cada kanji debe quedar cubierto por una lección en `js/core.js`.
- La validación `npm run validate:content` debe pasar antes de publicar.
- La fuente reducida `KanjiStrokeOrders.woff` debe contener todos los kanji publicados.

## Tanda N4-1 propuesta

| id_jlpt | kanji | significado base | onyomi | kunyomi | nota |
| --- | --- | --- | --- | --- | --- |
| 81 | 会 | reunión, encontrarse | カイ、エ | あ-う | Muy frecuente en palabras sociales. |
| 82 | 同 | mismo, igual | ドウ | おな-じ | Útil para 同じ, 同時. |
| 83 | 事 | cosa, asunto | ジ、ズ | こと | Base para vocabulario cotidiano. |
| 84 | 自 | uno mismo | ジ、シ | みずか-ら | Base de 自分, 自転車. |
| 85 | 社 | empresa, santuario | シャ | やしろ | Base de 会社, 社員. |
| 86 | 発 | salida, emisión | ハツ、ホツ | - | Frecuente en 出発, 発音. |
| 87 | 者 | persona | シャ | もの | Sufijo común: 学者, 医者. |
| 88 | 地 | tierra, lugar | チ、ジ | - | Base de 地図, 地下. |
| 89 | 業 | trabajo, industria | ギョウ、ゴウ | わざ | Base de 授業, 卒業. |
| 90 | 方 | dirección, forma, persona | ホウ | かた | Muy común en preguntas y modales. |
| 91 | 新 | nuevo | シン | あたら-しい、あら-た、にい | Ya existe en el WOFF actual. |
| 92 | 場 | lugar | ジョウ | ば | Base de 場所, 会場. |
| 93 | 員 | miembro, empleado | イン | - | Base de 社員, 店員. |
| 94 | 立 | levantarse, estar de pie | リツ、リュウ | た-つ、た-てる | Verbo esencial. |
| 95 | 開 | abrir | カイ | ひら-く、あ-く、あ-ける | Base de 開ける, 開始. |
| 96 | 手 | mano | シュ | て、た | Ya existe en el WOFF actual. |
| 97 | 力 | fuerza | リョク、リキ | ちから | Base de 能力, 力. |
| 98 | 問 | pregunta, problema | モン | と-う、と-い | Base de 問題, 質問. |
| 99 | 代 | generación, sustitución | ダイ、タイ | か-わる、よ、しろ | Base de 時代, 代わり. |
| 100 | 明 | claro, brillante | メイ、ミョウ | あか-るい、あ-ける | Base de 明日, 説明. |

## Estado de fuente

Validación preliminar contra `KanjiStrokeOrders.woff` actual:

- Presentes: 新, 手.
- Pendientes de agregar a la fuente reducida: 会, 同, 事, 自, 社, 発, 者, 地, 業, 方, 場, 員, 立, 開, 力, 問, 代, 明.

Antes de cargar esta tanda en la app, hay que regenerar `KanjiStrokeOrders.woff` desde `KanjiStrokeOrders.ttf` incluyendo:

- todos los kana y kanji ya publicados;
- los 20 kanji de esta tanda N4-1;
- cualquier símbolo japonés que use la interfaz o los ejemplos.

## Checklist para publicar N4-1

1. Regenerar `KanjiStrokeOrders.woff`.
2. Agregar las 20 filas en `datos.csv`.
3. Agregar 20 ejemplos en `js/kanji-examples.js`.
4. Crear lección N4-1 en `js/core.js`.
5. Agregar textos de lección y tarjetas en `locales/es.json`, `locales/en.json` y `locales/de.json`.
6. Agregar filtro visible N4 en Estudio.
7. Actualizar conteos de pruebas.
8. Ejecutar `npm run validate:content` y `npm test`.
