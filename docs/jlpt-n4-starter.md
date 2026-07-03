# Bloque inicial JLPT N4

Este documento registra el primer bloque de kanji N4 para KanjiFlow. La idea es crecer en tandas revisables, no cargar cientos de tarjetas de golpe.

Importante: este bloque es una lista curricular interna de KanjiFlow. Antes de pasarla a `main`, debe revisarse visualmente en navegador junto con ejemplos, traducciones, lecciones y orden de trazos.

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
| 91 | 場 | lugar | ジョウ | ば | Base de 場所, 会場. |
| 92 | 員 | miembro, empleado | イン | - | Base de 社員, 店員. |
| 93 | 立 | levantarse, estar de pie | リツ、リュウ | た-つ、た-てる | Verbo esencial. |
| 94 | 開 | abrir | カイ | ひら-く、あ-く、あ-ける | Base de 開ける, 開始. |
| 95 | 力 | fuerza | リョク、リキ | ちから | Base de 能力, 力. |
| 96 | 問 | pregunta, problema | モン | と-う、と-い | Base de 問題, 質問. |
| 97 | 代 | generación, sustitución | ダイ、タイ | か-わる、よ、しろ | Base de 時代, 代わり. |
| 98 | 明 | claro, brillante | メイ、ミョウ | あか-るい、あ-ける | Base de 明日, 説明. |
| 99 | 文 | texto, frase | ブン、モン | ふみ | Base de 作文, 文字. |
| 100 | 使 | usar | シ | つか-う | Verbo esencial para objetos y herramientas. |

## Estado de fuente

Estado en la rama `feature/jlpt-n4`:

- `KanjiStrokeOrders.woff` ya fue regenerado con los 20 kanji nuevos de la tanda N4-1.
- El archivo sigue siendo liviano: aprox. 130 KB.
- Los kanji N4-1 ya están publicados en `datos.csv`; `tools/stroke-font-extra.txt` queda reservado para próximas tandas.

Para regenerar `KanjiStrokeOrders.woff` desde `KanjiStrokeOrders.ttf`:

```powershell
python -m pip install fonttools brotli
npm run build:stroke-font
```

## Checklist para publicar N4-1

1. Regenerar `KanjiStrokeOrders.woff`. Listo en esta rama para N4-1.
2. Agregar las 20 filas en `datos.csv`. Listo.
3. Agregar 20 ejemplos en `js/kanji-examples.js`. Listo.
4. Crear lección N4-1 en `js/core.js`. Listo.
5. Agregar textos de lección y tarjetas en `locales/es.json`, `locales/en.json`, `locales/de.json`, `locales/fr.json` y `locales/pt.json`. Listo.
6. Agregar filtro visible N4 en Estudio. Listo.
7. Actualizar conteos de pruebas. Listo.
8. Ejecutar `npm run validate:content` y `npm test`.
