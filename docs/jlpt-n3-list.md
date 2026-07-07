# Lista candidata JLPT N3

Lista completa de kanji N3 tomada de [JLPT Sensei](https://jlptsensei.com/jlpt-n3-kanji-list/) (fuente ya usada como referencia canónica para N4 en este proyecto), extraída programáticamente el 2026-07-06 con Playwright headless porque la tabla del sitio pagina por JavaScript.

**Esto es una LISTA candidata, no contenido listo para publicar.** Antes de agregarla a `datos.csv` falta, por cada kanji: traducir el significado al español (aquí está en inglés, tal cual lo entrega la fuente), revisar/ajustar la lectura `romaji` principal (se tomó automáticamente la primera lectura on'yomi, pero el proyecto a veces prioriza la kun'yomi cuando es más natural — ver el caso de 事=koto en N4), escribir el ejemplo contextualizado en `js/kanji-examples.js`, traducir a los 5 idiomas activos, asignar una lección en `js/core.js`, regenerar `KanjiStrokeOrders.woff`, y generar sus datos KanjiVG (ampliando el filtro en `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs` y `tools/validate-content.mjs`).

## Alcance

- 361 kanji, id_jlpt continuo de 251 a 611 (después de los 250 kanji N5+N4 ya publicados).
- Se excluyeron 9 kanji que la lista de JLPT Sensei marca como N3 pero que este proyecto ya tiene publicados como N4: 市, 都, 速, 返, 薬, 遅, 遠, 寝, 耳 (evita IDs duplicados; `itemId()` es `kanji_<caracter>` sin importar el nivel).
- Igual que con N4, conviene publicarlos en tandas revisables (ver `docs/jlpt-n4-2.md` a `jlpt-n4-final.md` como precedente), no de una sola vez.

## Lista completa (borrador)

| id_jlpt | kanji | romaji (candidato) | onyomi | kunyomi | meaning (EN, pendiente traducir) |
| --- | --- | --- | --- | --- | --- |
| 251 | 政 | sei | セイ | まつりごと | politics, government |
| 252 | 議 | gi | ギ | - | deliberation, consultation, debate |
| 253 | 民 | min | ミン | たみ | people, nation, subjects |
| 254 | 連 | ren | レン | つら(なる)、つ(れる) | take along, lead, join, connect |
| 255 | 対 | tai | タイ、ツイ | - | opposite, even, equal, versus, anti-, compare |
| 256 | 部 | bu | ブ | - | section, bureau, dept, class, copy, part, portion |
| 257 | 合 | gou | ゴウ、ガッ、カッ | あ(う)、あい | fit, suit, join, 0.1 |
| 258 | 内 | nai | ナイ | うち | inside, within, between, among, house, home |
| 259 | 相 | sou | ソウ、ショウ | あい | inter-, mutual, together, each other, minister of state |
| 260 | 定 | tei | テイ、ジョウ | さだ(める) | determine, fix, establish, decide |
| 261 | 回 | kai | カイ | まわ(す) | -times, round, revolve, counter |
| 262 | 選 | sen | セン | えら(ぶ) | elect, select, choose, prefer |
| 263 | 米 | bei | ベイ、マイ、メエトル | こめ | rice, USA, meter |
| 264 | 実 | jitsu | ジツ | み、みの(る) | reality, truth |
| 265 | 関 | kan | カン | せき、かか(わる) | connection, barrier, gateway, involve, concerning |
| 266 | 決 | ketsu | ケツ | き(める) | decide, fix, agree upon, appoint |
| 267 | 全 | zen | ゼン | まった(く)、すべ(て) | whole, entire, all, complete, fulfill |
| 268 | 表 | hyou | ヒョウ | おもて、あらわ(す) | surface, table, chart, diagram |
| 269 | 戦 | sen | セン | いくさ、たたか(う) | war, battle, match |
| 270 | 経 | kei | ケイ | へ(る)、た(つ) | longitude, pass thru, expire, warp |
| 271 | 最 | sai | サイ | もっと(も) | utmost, most, extreme |
| 272 | 現 | gen | ゲン | あらわ(れる)、うつ(つ) | present, existing, actual |
| 273 | 調 | chou | チョウ | しら(べる)、ととの(う) | tune, tone, meter, prepare, investigate |
| 274 | 化 | ka | カ、ケ | ば(ける)、ふ(ける) | change, take the form of, influence, enchant, delude, -ization |
| 275 | 当 | tou | トウ | あ(たる) | hit, right, appropriate |
| 276 | 約 | yaku | ヤク | つづ(まる) | promise, approximately, shrink |
| 277 | 首 | shu | シュ | くび | neck |
| 278 | 法 | hou | ホウ | のり | method, law, rule, principle, model, system |
| 279 | 性 | sei | セイ、ショウ | - | sex, gender, nature |
| 280 | 的 | teki | テキ | - | mark, target, object, adjective ending |
| 281 | 要 | you | ヨウ | い(る)、かなめ | need, main point, essence, pivot |
| 282 | 制 | sei | セイ | - | system, law, rule |
| 283 | 治 | ji | ジ、チ | おさ(める)、なお(る) | reign, cure, heal |
| 284 | 務 | mu | ム | つと(める) | task, duties |
| 285 | 成 | sei | セイ、ジョウ | な(る) | turn into, become, get, grow, elapse |
| 286 | 期 | ki | キ、ゴ | - | period, time, date, term |
| 287 | 取 | shu | シュ | と(る) | take, fetch |
| 288 | 和 | wa | ワ、オ | やわ(らぐ)、なご(む) | harmony, Japanese style, peace |
| 289 | 機 | ki | キ | はた | machine, airplane, opportunity |
| 290 | 平 | hei | ヘイ、ビョウ | たい(ら)、ひら | even, flat, peace |
| 291 | 加 | ka | カ | くわ(える) | add, addition, increase, join |
| 292 | 受 | ju | ジュ | う(ける) | accept, undergo, answer (phone), take |
| 293 | 続 | zoku | ゾク | つづ(く) | continue, series, sequel |
| 294 | 進 | shin | シン | すす(む) | advance, proceed |
| 295 | 数 | suu | スウ | かず、かぞ(える) | number, strength, fate, law, figures |
| 296 | 記 | ki | キ | しる(す) | scribe, account, narrative |
| 297 | 初 | sho | ショ | はじ(め)、はつ | first time, beginning |
| 298 | 指 | shi | シ | ゆび、さ(す) | finger, point to, indicate |
| 299 | 権 | ken | ケン | - | authority, power, rights |
| 300 | 支 | shi | シ | ささ(える) | branch, support, sustain |
| 301 | 産 | san | サン | う(む)、む(す) | products, bear, give birth |
| 302 | 点 | ten | テン | つ(ける) | spot, point, mark |
| 303 | 報 | hou | ホウ | むく(いる) | report, news, reward |
| 304 | 済 | sai | サイ、セイ | す(む) | settle, relieve, finish |
| 305 | 活 | katsu | カツ | - | living |
| 306 | 原 | gen | ゲン | はら | original, primitive, field |
| 307 | 共 | kyou | キョウ | とも | together, both, neither |
| 308 | 得 | toku | トク | え(る) | gain, get, find, earn, acquire, can, may, able to, profit |
| 309 | 解 | kai | カイ、ゲ | と(く)、ほど(く) | unravel, explanation |
| 310 | 交 | kou | コウ | まじ(わる)、ま(ぜる)、か(わす) | mingle, mixing, association, coming & going |
| 311 | 資 | shi | シ | - | assets, resources, capital, funds, data, be conducive to |
| 312 | 予 | yo | ヨ、シャ | あらかじ(め) | beforehand, previous, myself, I |
| 313 | 向 | kou | コウ | む(く)、むか(い) | facing, beyond |
| 314 | 際 | sai | サイ | きわ | occasion, time |
| 315 | 勝 | shou | ショウ | か(つ)、まさ(る) | victory, win |
| 316 | 面 | men | メン | おも、おもて、つら | mask, face, features, surface |
| 317 | 告 | koku | コク | つ(げる) | revelation, inform |
| 318 | 反 | han | ハン | そ(る) | anti- |
| 319 | 判 | han | ハン | - | judgement, signature |
| 320 | 認 | nin | ニン | みと(める)、したた(める) | acknowledge, witness, recognize |
| 321 | 参 | san | サン | まい(る) | going, coming, participate |
| 322 | 利 | ri | リ | き(く) | profit, advantage, benefit |
| 323 | 組 | so | ソ | く(む)、くみ | association, assemble, unite |
| 324 | 信 | shin | シン | - | faith, truth, trust |
| 325 | 在 | zai | ザイ | あ(る) | exist, outskirts |
| 326 | 件 | ken | ケン | くだん | affair, case, matter |
| 327 | 側 | soku | ソク | がわ、そば | side, lean, oppose |
| 328 | 任 | nin | ニン | まか(せる) | responsibility, duty |
| 329 | 引 | in | イン | ひ(く) | pull, tug, jerk |
| 330 | 求 | kyuu | キュウ | もと(める) | request, want, demand |
| 331 | 所 | sho | ショ | ところ | place, extent |
| 332 | 次 | ji | ジ、シ | つ(ぐ)、つぎ | next, order |
| 333 | 昨 | saku | サク | - | yesterday, previous |
| 334 | 論 | ron | ロン | あげつら(う) | argument, discourse |
| 335 | 官 | kan | カン | - | bureaucrat, the government, organ |
| 336 | 増 | zou | ゾウ | ま(す)、ふ(える) | increase, add |
| 337 | 係 | kei | ケイ | かか(る)、かかり | person in charge, connection |
| 338 | 感 | kan | カン | - | emotion, feeling, sensation |
| 339 | 情 | jou | ジョウ、セイ | なさ(け) | feelings, emotion, passion |
| 340 | 投 | tou | トウ | な(げる) | throw, discard |
| 341 | 示 | ji | ジ、シ | しめ(す) | show, indicate, display |
| 342 | 変 | hen | ヘン | か(わる) | unusual, change, strange |
| 343 | 打 | da | ダ | う(つ)、ぶ(つ) | strike, hit, knock |
| 344 | 直 | choku | チョク、ジキ | ただ(ちに)、す(ぐ) | straightaway, honesty, frankness, fix, repair |
| 345 | 両 | ryou | リョウ | - | both |
| 346 | 式 | shiki | シキ | - | style, ceremony |
| 347 | 確 | kaku | カク | たし(か) | assurance, firm, confirm |
| 348 | 果 | ka | カ | は(たす) | fruit, reward, carry out, achieve, complete |
| 349 | 容 | you | ヨウ | - | contain, form |
| 350 | 必 | hitsu | ヒツ | かなら(ず) | invariably, certain, inevitable |
| 351 | 演 | en | エン | - | performance, act, play, render, stage |
| 352 | 歳 | sai | サイ、セイ | - | age, year-end |
| 353 | 争 | sou | ソウ | あらそ(う) | contend, dispute, argue |
| 354 | 談 | dan | ダン | - | discuss, talk |
| 355 | 能 | nou | ノウ | あた(う) | ability, talent, skill, capacity |
| 356 | 位 | i | イ | くらい、ぐらい | rank, grade, about |
| 357 | 置 | chi | チ | お(く) | placement, put, set, deposit, leave behind |
| 358 | 流 | ryuu | リュウ、ル | なが(れる) | current, flow |
| 359 | 格 | kaku | カク、コウ、キャク | - | status, rank, capacity |
| 360 | 疑 | gi | ギ | うたが(う) | doubt, distrust |
| 361 | 過 | ka | カ | す(ぎる)、よぎ(る) | overdo, exceed, go beyond |
| 362 | 局 | kyoku | キョク | - | bureau, board, office |
| 363 | 放 | hou | ホウ | はな(す)、ほう(る) | set free, release |
| 364 | 常 | jou | ジョウ | つね | usual, ordinary, normal |
| 365 | 状 | jou | ジョウ | - | conditions, form, appearance |
| 366 | 球 | kyuu | キュウ | たま | ball, sphere |
| 367 | 職 | shoku | ショク | - | post, employment, work |
| 368 | 与 | yo | ヨ | あた(える)、あずか(る) | give, award |
| 369 | 供 | kyou | キョウ、ク、クウ | そな(える)、とも | submit, offer, present, accompany |
| 370 | 役 | yaku | ヤク、エキ | - | duty, service, role |
| 371 | 構 | kou | コウ | かま(う) | posture, build, pretend |
| 372 | 割 | katsu | カツ | わ(る)、わり | proportion, divide, cut, separate |
| 373 | 身 | shin | シン | み | somebody, person |
| 374 | 費 | hi | ヒ | つい(やす) | expense, consume |
| 375 | 付 | fu | フ | つ(ける) | adhere, attach, refer to, append |
| 376 | 由 | yu | ユ、ユウ | よし、よ(る) | wherefore, a reason |
| 377 | 説 | setsu | セツ、ゼイ | と(く) | opinion, theory, explanation |
| 378 | 難 | nan | ナン | かた(い)、むずか(しい)、にく(い) | difficult, trouble, accident |
| 379 | 優 | yuu | ユウ、ウ | やさ(しい)、すぐ(れる) | tenderness, kind, actor |
| 380 | 夫 | fu | フ、フウ | おっと | husband, man |
| 381 | 収 | shuu | シュウ | おさ(める) | income, obtain, reap, pay, supply, store |
| 382 | 断 | dan | ダン | た(つ)、ことわ(る) | severance, decline, refuse, apologize |
| 383 | 石 | seki | セキ、シャク、コク | いし | stone |
| 384 | 違 | i | イ | ちが(う)、たが(う) | difference, differ |
| 385 | 消 | shou | ショウ | き(える)、け(す) | extinguish, turn off |
| 386 | 神 | shin | シン、ジン | かみ | gods, mind, soul |
| 387 | 番 | ban | バン | つが(い) | turn, number in a series |
| 388 | 規 | ki | キ | - | standard, measure |
| 389 | 術 | jutsu | ジュツ | すべ | art, technique, skill, means, trick |
| 390 | 備 | bi | ビ | そな(える) | equip, provision, preparation |
| 391 | 宅 | taku | タク | - | home, house, residence |
| 392 | 害 | gai | ガイ | - | harm, injury |
| 393 | 配 | hai | ハイ | くば(る) | distribute, spouse |
| 394 | 警 | kei | ケイ | - | admonish, commandment |
| 395 | 育 | iku | イク | そだ(つ)、はぐく(む) | bring up, grow up, raise |
| 396 | 席 | seki | セキ | むしろ | seat |
| 397 | 訪 | hou | ホウ | おとず(れる)、たず(ねる) | call on, visit |
| 398 | 乗 | jou | ジョウ、ショウ | の(る) | ride |
| 399 | 残 | zan | ザン | のこ(る) | remainder, balance |
| 400 | 想 | sou | ソウ、ソ | おも(う) | concept, think, idea |
| 401 | 声 | sei | セイ、ショウ | こえ | voice |
| 402 | 助 | jo | ジョ | たす(ける) | help, rescue, assist |
| 403 | 労 | rou | ロウ | ろう(する)、いたわ(る)、ねぎら(う) | labor, thank for |
| 404 | 例 | rei | レイ | たと(えば) | example |
| 405 | 然 | zen | ゼン、ネン | しか、さ | sort of thing, if so |
| 406 | 限 | gen | ゲン | かぎ(る) | limit, restrict |
| 407 | 追 | tsui | ツイ | お(う) | chase, drive away |
| 408 | 商 | shou | ショウ | あきな(う) | deal; selling; merchant |
| 409 | 葉 | you | ヨウ | は | leaf, plane, needle, blade, counter for flat things |
| 410 | 伝 | den | デン | つた(わる) | transmit, go along, walk along, follow, report, communicate, legend, tradition |
| 411 | 働 | dou | ドウ | はたら(く) | work |
| 412 | 形 | kei | ケイ、ギョウ | かた、かたち、なり | shape, form, style |
| 413 | 景 | kei | ケイ、ケ | - | scenery, view |
| 414 | 落 | raku | ラク | お(ちる) | fall, drop |
| 415 | 好 | kou | コウ | この(む)、す(く) | fond, pleasing, like something |
| 416 | 退 | tai | タイ | しりぞ(く)、ひ(く)、の(ける)、ど(く) | retreat, withdraw, retire, resign, repel, expel, reject |
| 417 | 頭 | tou | トウ、ズ、ト | あたま、かしら | head |
| 418 | 負 | fu | フ | ま(ける)、お(う) | defeat, negative, minus, assume a responsibility |
| 419 | 渡 | to | ト | わた(る) | transit, ferry, cross |
| 420 | 失 | shitsu | シツ | うしな(う)、う(せる) | lose, error, fault, disadvantage, loss |
| 421 | 差 | sa | サ | さ(す) | distinction, difference, variation |
| 422 | 末 | matsu | マツ | すえ | end, close, tip |
| 423 | 守 | shu | シュ、ス | まも(る)、もり | guard, protect, obey |
| 424 | 若 | jaku | ジャク | わか(い)、も(し) | young |
| 425 | 種 | shu | シュ | たね、-ぐさ | species, kind, class, seed |
| 426 | 美 | bi | ビ、ミ | うつく(しい) | beauty, beautiful |
| 427 | 命 | mei | メイ、ミョウ | いのち | fate, command |
| 428 | 福 | fuku | フク | - | blessing, fortune, luck, wealth |
| 429 | 望 | bou | ボウ | のぞ(む)、もち | ambition, full moon, hope, desire, aspire to, expect |
| 430 | 非 | hi | ヒ | あら(ず) | un-, mistake, negative |
| 431 | 観 | kan | カン | み(る) | outlook, appearance, condition |
| 432 | 察 | satsu | サツ | - | guess, presume, judge |
| 433 | 段 | dan | ダン | - | grade, steps, stairs |
| 434 | 横 | ou | オウ | よこ | sideways, side |
| 435 | 深 | shin | シン | ふか(い) | deep, heighten |
| 436 | 申 | shin | シン | もう(す)、さる | have the honor to |
| 437 | 様 | you | ヨウ | さま、さん | manner, situation, polite suffix |
| 438 | 財 | zai | ザイ、サイ、ゾク | - | property, money, wealth, assets |
| 439 | 港 | kou | コウ | みなと | harbor, port |
| 440 | 識 | shiki | シキ | し(る) | know |
| 441 | 呼 | ko | コ | よ(ぶ) | call, invite |
| 442 | 達 | tatsu | タツ、ダ | たち | accomplished, reach, arrive, attain |
| 443 | 良 | ryou | リョウ | よ(い)、い(い) | good |
| 444 | 阪 | han | ハン | さか | heights, slope |
| 445 | 候 | kou | コウ | そうろう | climate, season, weather |
| 446 | 程 | tei | テイ | ほど | extent, degree |
| 447 | 満 | man | マン | み(ちる) | full, fullness, enough, satisfy |
| 448 | 敗 | hai | ハイ | やぶ(れる) | failure, defeat |
| 449 | 値 | chi | チ | ね、あたい | price, cost, value |
| 450 | 突 | totsu | トツ、カ | つ(く) | stab, protruding, thrust |
| 451 | 光 | kou | コウ | ひか(る)、ひかり | ray, light |
| 452 | 路 | ro | ロ、ル | みち | path, route, road |
| 453 | 科 | ka | カ | - | department, course, section |
| 454 | 積 | seki | セキ | つ(む) | volume, contents, pile up, stack |
| 455 | 他 | ta | タ | ほか | other, another |
| 456 | 処 | sho | ショ | - | dispose, manage, deal with |
| 457 | 太 | tai | タイ、タ | ふと(い) | plump, thick, big around |
| 458 | 客 | kyaku | キャク、カク | - | guest, visitor, customer |
| 459 | 否 | hi | ヒ | いな、いや | negate, no, decline |
| 460 | 師 | shi | シ | - | expert, teacher, master |
| 461 | 登 | tou | トウ、ト | のぼ(る)、あ(がる) | ascend, climb up |
| 462 | 易 | eki | エキ、イ | やさ(しい)、やす(い) | easy, ready to, simple |
| 463 | 存 | son | ソン、ゾン | - | exist, be aware of |
| 464 | 飛 | hi | ヒ | と(ぶ) | fly |
| 465 | 殺 | satsu | サツ、サイ | ころ(す) | kill, murder |
| 466 | 号 | gou | ゴウ | - | number, item |
| 467 | 単 | tan | タン | ひとえ | simple, single |
| 468 | 座 | za | ザ | すわ(る) | squat, seat, sit |
| 469 | 破 | ha | ハ | やぶ(る) | rip, tear, break |
| 470 | 除 | jo | ジョ、ジ | のぞ(く) | exclude, remove |
| 471 | 完 | kan | カン | - | perfect, completion |
| 472 | 降 | kou | コウ、ゴ | お(りる)、ふ(る) | descend, precipitate, fall, surrender |
| 473 | 責 | seki | セキ | せ(める) | blame, condemn |
| 474 | 捕 | ho | ホ | と(らえる)、つか(まえる) | catch, capture |
| 475 | 危 | ki | キ | あぶ(ない)、あや(うい) | dangerous, fear, uneasy |
| 476 | 給 | kyuu | キュウ | たま(う)、たも(う) | salary, wage, gift |
| 477 | 苦 | ku | ク | くる(しい)、にが(い) | suffering, bitter |
| 478 | 迎 | gei | ゲイ | むか(える) | welcome, meet, greet |
| 479 | 園 | en | エン | その | park, garden, yard |
| 480 | 具 | gu | グ | そな(える)、つぶさ(に) | tool, utensil |
| 481 | 辞 | ji | ジ | や(める) | resign, word, term |
| 482 | 因 | in | イン | よ(る)、ちな(む) | cause, factor, depend on |
| 483 | 馬 | ba | バ | うま | horse |
| 484 | 愛 | ai | アイ | いと(しい)、まな | love, affection |
| 485 | 富 | fu | フ、フウ | と(む)、とみ | wealth, enrich, abundant |
| 486 | 彼 | hi | ヒ | かれ、かの | he, him |
| 487 | 未 | mi | ミ、ビ | いま(だ)、ま(だ) | un-, not yet |
| 488 | 舞 | bu | ブ | ま(う)、まい | dance, circle |
| 489 | 亡 | bou | ボウ、モウ | な(くなる) | deceased, dying |
| 490 | 冷 | rei | レイ | つめ(たい)、ひ(える)、さ(める) | cool, cold, chill |
| 491 | 適 | teki | テキ | かな(う) | suitable, occasional, rare |
| 492 | 婦 | fu | フ | よめ | lady, woman, wife |
| 493 | 寄 | ki | キ | よ(る) | draw near, gather |
| 494 | 込 | ko | - | こ(む) | crowded, mixture |
| 495 | 顔 | gan | ガン | かお | face, expression |
| 496 | 類 | rui | ルイ | たぐ(い) | sort, kind, variety, class, genus |
| 497 | 余 | yo | ヨ | あま(る) | too much, surplus |
| 498 | 王 | ou | オウ | - | king, rule |
| 499 | 妻 | sai | サイ | つま | wife, spouse |
| 500 | 背 | hai | ハイ | せ、せい | stature, height, back |
| 501 | 熱 | netsu | ネツ | あつ(い) | heat, fever, passion |
| 502 | 宿 | shuku | シュク | やど | inn, lodging |
| 503 | 険 | ken | ケン | けわ(しい) | precipitous, inaccessible place |
| 504 | 頼 | rai | ライ | たの(む)、たよ(る) | trust, request |
| 505 | 覚 | kaku | カク | おぼ(える)、さ(ます) | memorize, learn, remember, awake |
| 506 | 船 | sen | セン | ふね、ふな | ship, boat |
| 507 | 途 | to | ト | みち | route, way, road |
| 508 | 許 | kyo | キョ | ゆる(す) | permit, approve |
| 509 | 抜 | batsu | バツ | ぬ(く) | slip out, extract, pull out, remove |
| 510 | 便 | ben | ベン、ビン | たよ(り) | convenience, facility |
| 511 | 留 | ryuu | リュウ、ル | と(まる)、とど(める) | detain, fasten, halt, stop |
| 512 | 罪 | zai | ザイ | つみ | guilt, sin, crime |
| 513 | 努 | do | ド | つと(める) | toil, diligent, as much as possible |
| 514 | 精 | sei | セイ、ショウ | しら(げる) | refined, ghost, fairy, energy |
| 515 | 散 | san | サン | ち(る)、ばら(ける) | scatter, disperse |
| 516 | 静 | sei | セイ、ジョウ | しず(か) | quiet |
| 517 | 婚 | kon | コン | - | marriage |
| 518 | 喜 | ki | キ | よろこ(ぶ) | rejoice, take pleasure in |
| 519 | 浮 | fu | フ | う(かぶ) | float, rise to surface |
| 520 | 絶 | zetsu | ゼツ | た(える) | discontinue, unparalleled |
| 521 | 幸 | kou | コウ | さいわ(い)、さち、しあわ(せ) | happiness, blessing, fortune |
| 522 | 押 | ou | オウ | お(す) | push |
| 523 | 倒 | tou | トウ | たお(れる) | overthrow, fall, collapse |
| 524 | 等 | tou | トウ | ひと(しい)、など | etc., and so forth |
| 525 | 老 | rou | ロウ | お(いる)、ふ(ける) | old |
| 526 | 曲 | kyoku | キョク | ま(がる) | bend, music, melody |
| 527 | 払 | hara | - | はら(う) | pay |
| 528 | 庭 | tei | テイ | にわ | courtyard, garden, yard |
| 529 | 徒 | to | ト | いたずら、あだ | on foot, junior, vanity, futility, uselessness |
| 530 | 勤 | kin | キン、ゴン | つと(める) | diligence, employed, serve |
| 531 | 居 | kyo | キョ、コ | い(る)、お(る) | reside, to be, exist |
| 532 | 雑 | zatsu | ザツ、ゾウ | まじ(る) | miscellaneous |
| 533 | 招 | shou | ショウ | まね(く) | invite, summon, engage |
| 534 | 困 | kon | コン | こま(る) | quandary, become distressed |
| 535 | 欠 | ketsu | ケツ、ケン | か(ける) | lack, gap |
| 536 | 更 | kou | コウ | さら(に)、ふ(ける) | renew, renovate, again |
| 537 | 刻 | koku | コク | きざ(む) | engrave, cut fine, chop |
| 538 | 賛 | san | サン | - | approve, praise |
| 539 | 抱 | hou | ホウ | だ(く)、いだ(く)、かか(える) | embrace, hug |
| 540 | 犯 | han | ハン | おか(す) | crime, sin, offense |
| 541 | 恐 | kyou | キョウ | おそ(れる)、こわ(い) | fear, dread |
| 542 | 息 | musu | ムス、ソク | いき | breath, son, interest (on money) |
| 543 | 戻 | rei | レイ | もど(る) | re-, return, revert |
| 544 | 願 | gan | ガン | ねが(う) | petition, request, wish |
| 545 | 絵 | kai | カイ、エ | - | picture, drawing |
| 546 | 越 | etsu | エツ | こ(す) | surpass, cross over, move to, exceed |
| 547 | 欲 | yoku | ヨク | ほ(しい) | longing, greed, passion |
| 548 | 痛 | tsuu | ツウ | いた(い) | pain, hurt, damage, bruise |
| 549 | 笑 | shou | ショウ | わら(う)、え(む) | laugh |
| 550 | 互 | go | ゴ | たが(い)、かたみ(に) | mutually, reciprocally, together |
| 551 | 束 | soku | ソク | たば、つか | bundle, manage |
| 552 | 似 | ji | ジ、ね | に(る) | becoming, resemble, imitate |
| 553 | 列 | retsu | レツ、レ | - | file, row, column |
| 554 | 探 | tan | タン | さぐ(る)、さが(す) | search, look for |
| 555 | 逃 | tou | トウ | に(げる)、のが(す) | escape, flee |
| 556 | 遊 | yuu | ユウ | あそ(ぶ) | play |
| 557 | 迷 | mei | メイ | まよ(う) | astray, be perplexed, in doubt, lost |
| 558 | 夢 | mu | ム | ゆめ | dream, vision |
| 559 | 君 | kun | クン | きみ | you, male name suffix |
| 560 | 閉 | hei | ヘイ | と(じる)、し(める) | closed, shut |
| 561 | 緒 | sho | ショ | お | beginning, end, cord, strap |
| 562 | 折 | setsu | セツ、シャク | お(る)、おり | fold, break, fracture |
| 563 | 草 | sou | ソウ | くさ | grass, weeds, herbs |
| 564 | 暮 | bo | ボ | く(らす) | evening, livelihood |
| 565 | 酒 | shu | シュ | さけ、さか- | sake, alcohol |
| 566 | 悲 | hi | ヒ | かな(しい) | grieve, sad |
| 567 | 晴 | sei | セイ | は(れる) | clear up |
| 568 | 掛 | kei | ケイ | か(ける) | hang, suspend |
| 569 | 到 | tou | トウ | いた(る) | arrival, proceed, reach |
| 570 | 暗 | an | アン | くら(い) | darkness, disappear, shade, informal |
| 571 | 盗 | tou | トウ | ぬす(む) | steal, rob |
| 572 | 吸 | kyuu | キュウ | す(う) | suck, inhale |
| 573 | 陽 | you | ヨウ | ひ | sunshine, positive |
| 574 | 御 | gyo | ギョ、ゴ | おん、お | honorable |
| 575 | 歯 | shi | シ | は | tooth, cog |
| 576 | 忘 | bou | ボウ | わす(れる) | forget |
| 577 | 雪 | setsu | セツ | ゆき | snow |
| 578 | 吹 | sui | スイ | ふ(く) | blow, breathe, puff |
| 579 | 娘 | jou | ジョウ | むすめ、こ | daughter, girl |
| 580 | 誤 | go | ゴ | あやま(る) | mistake |
| 581 | 洗 | sen | セン | あら(う) | wash |
| 582 | 慣 | kan | カン | な(れる) | accustomed, get used to |
| 583 | 礼 | rei | レイ、ライ | - | salute, bow, ceremony, thanks |
| 584 | 窓 | sou | ソウ | まど | window, pane |
| 585 | 昔 | seki | セキ、シャク | むかし | once upon a time, old times |
| 586 | 貧 | hin | ヒン、ビン | まず(しい) | poverty, poor |
| 587 | 怒 | do | ド | いか(る)、おこ(る) | angry, be offended |
| 588 | 泳 | ei | エイ | およ(ぐ) | swim |
| 589 | 祖 | so | ソ | - | ancestor, pioneer, founder |
| 590 | 杯 | hai | ハイ | さかずき | glass, cup |
| 591 | 疲 | hi | ヒ | つか(れる) | exhausted, tire |
| 592 | 皆 | kai | カイ | みな、みんな | all, everyone, everybody |
| 593 | 鳴 | mei | メイ | な(く)、な(る) | chirp, cry, bark |
| 594 | 腹 | fuku | フク | はら | abdomen, belly, stomach |
| 595 | 煙 | en | エン | けむ(る)、けむり | smoke |
| 596 | 眠 | min | ミン | ねむ(る) | sleep |
| 597 | 怖 | fu | フ | こわ(い)、お(じる) | dreadful, fearful |
| 598 | 頂 | chou | チョウ | いただ(く) | receive, top, summit, peak |
| 599 | 箱 | sou | ソウ | はこ | box, chest |
| 600 | 晩 | ban | バン | - | nightfall, night |
| 601 | 寒 | kan | カン | さむ(い) | cold |
| 602 | 髪 | hatsu | ハツ | かみ | hair (on the head) |
| 603 | 忙 | bou | ボウ、モウ | いそが(しい) | busy, occupied |
| 604 | 才 | sai | サイ | - | genius, years old |
| 605 | 靴 | ka | カ | くつ | shoes |
| 606 | 恥 | chi | チ | はじ、は(ずかしい) | shame, dishonor |
| 607 | 偶 | guu | グウ | たま | accidentally, even number |
| 608 | 偉 | i | イ | えら(い) | admirable, greatness |
| 609 | 猫 | byou | ビョウ | ねこ | cat |
| 610 | 幾 | ki | キ | いく(つ) | how many, how much, some |
| 611 | 誰 | sui | スイ | だれ | who, someone, somebody |

## Checklist para publicar (por tanda)

1. Traducir `significado` y `meaning` al español para el bloque a publicar.
2. Revisar el `romaji` principal caso por caso (no confiar ciegamente en la primera lectura on'yomi).
3. Agregar filas al bloque en `datos.csv` con `categoria=N3`.
4. Escribir ejemplo contextualizado por kanji en `js/kanji-examples.js`.
5. Traducir a `locales/{es,en,de,fr,pt}.json` (`cards.kanji_X`).
6. Crear/ampliar lección(es) N3 en `js/core.js` y sus textos en los 5 idiomas.
7. Agregar `N3` a `SUPPORTED_KANJI_LEVELS` en `tools/validate-content.mjs` (si no está ya) y al filtro de `tools/fetch-kanjivg.mjs`/`tools/build-kanjivg-data.mjs`.
8. Regenerar `KanjiStrokeOrders.woff` (`npm run build:stroke-font`) y los datos KanjiVG (`npm run fetch:kanjivg && npm run build:kanjivg`).
9. `npm run validate:content && npm test` en verde antes de publicar la tanda.
