# Lista candidata JLPT N2

Lista completa de kanji N2 tomada de [JLPT Sensei](https://jlptsensei.com/jlpt-n2-kanji-list/) (fuente ya usada como referencia canónica para N4 en este proyecto), extraída programáticamente el 2026-07-06 con Playwright headless porque la tabla del sitio pagina por JavaScript.

**Esto es una LISTA candidata, no contenido listo para publicar.** Antes de agregarla a `datos.csv` falta, por cada kanji: traducir el significado al español (aquí está en inglés, tal cual lo entrega la fuente), revisar/ajustar la lectura `romaji` principal (se tomó automáticamente la primera lectura on'yomi, pero el proyecto a veces prioriza la kun'yomi cuando es más natural — ver el caso de 事=koto en N4), escribir el ejemplo contextualizado en `js/kanji-examples.js`, traducir a los 5 idiomas activos, asignar una lección en `js/core.js`, regenerar `KanjiStrokeOrders.woff`, y generar sus datos KanjiVG (ampliando el filtro en `tools/fetch-kanjivg.mjs`, `tools/build-kanjivg-data.mjs` y `tools/validate-content.mjs`).

## Alcance

- 370 kanji, id_jlpt continuo de 612 a 981 (después de los 250 kanji N5+N4 ya publicados).
- Se excluyeron 4 kanji que la lista de JLPT Sensei marca como N2 pero que este proyecto ya tiene publicados como N4: 区, 県, 村, 門.
- Igual que con N4, conviene publicarlos en tandas revisables (ver `docs/jlpt-n4-2.md` a `jlpt-n4-final.md` como precedente), no de una sola vez.

## Lista completa (borrador)

| id_jlpt | kanji | romaji (candidato) | onyomi | kunyomi | meaning (EN, pendiente traducir) |
| --- | --- | --- | --- | --- | --- |
| 612 | 党 | tou | トウ | なかま、むら | party, faction, clique |
| 613 | 協 | kyou | キョウ | - | co-, cooperation |
| 614 | 総 | sou | ソウ | すべ(て)、ふさ | general, whole, all |
| 615 | 領 | ryou | リョウ | えり | jurisdiction, dominion |
| 616 | 設 | setsu | セツ | もう(ける) | establishment, provision |
| 617 | 保 | ho | ホ、ホウ | たも(つ) | protect, guarantee, keep |
| 618 | 改 | kai | カイ | あらた(める) | reformation, change, modify |
| 619 | 第 | dai | ダイ | - | No., number |
| 620 | 結 | ketsu | ケツ | むす(ぶ)、ゆ(う) | tie, bind, contract |
| 621 | 派 | ha | ハ | - | faction, group, party |
| 622 | 府 | fu | フ | - | borough, urban prefecture, govt office |
| 623 | 査 | sa | サ | - | investigate |
| 624 | 委 | i | イ | ゆだ(ねる) | committee, entrust to |
| 625 | 軍 | gun | グン | いくさ | army, force, troops |
| 626 | 案 | an | アン | つくえ | plan, suggestion, draft |
| 627 | 策 | saku | サク | - | scheme, plan, policy |
| 628 | 団 | dan | ダン、トン | かたまり、まる(い) | group, association |
| 629 | 各 | kaku | カク | おのおの | each; every; either |
| 630 | 島 | tou | トウ | しま | island |
| 631 | 革 | kaku | カク | かわ | leather; skin; reform; become serious |
| 632 | 勢 | sei | セイ | いきお(い) | forces; energy; military strength |
| 633 | 減 | gen | ゲン | へ(る) | dwindle; decrease; reduce |
| 634 | 再 | sai | サイ、サ | ふたた(び) | again, twice, second time |
| 635 | 税 | zei | ゼイ | - | tax; duty |
| 636 | 営 | ei | エイ | いとな(む) | occupation; camp; perform; build; conduct (business) |
| 637 | 比 | hi | ヒ | くら(べる) | compare; race; ratio |
| 638 | 防 | bou | ボウ | ふせ(ぐ) | ward off; defend; protect; resist |
| 639 | 補 | ho | ホ | おぎな(う) | supplement; supply; offset; compensate |
| 640 | 境 | kyou | キョウ | さかい | boundary, border, region |
| 641 | 導 | dou | ドウ | みちび(く) | guidance; leading; conduct; usher |
| 642 | 副 | fuku | フク | - | vice-; assistant; aide; duplicate; copy |
| 643 | 算 | san | サン | そろ | calculate; divining; number; probability |
| 644 | 輸 | yu | ユ、シュ | - | transport, send, be inferior |
| 645 | 述 | jutsu | ジュツ | の(べる) | mention; state; speak |
| 646 | 線 | sen | セン | すじ | line; track |
| 647 | 農 | nou | ノウ | - | agriculture; farmers |
| 648 | 州 | shuu | シュウ | す | state; province |
| 649 | 武 | bu | ブ、ム | たけ(し) | warrior; military; chivalry; arms |
| 650 | 象 | shou | ショウ、ゾウ | かたど(る) | elephant; pattern after; image; shape |
| 651 | 域 | iki | イキ | - | range; region; limits; stage; level |
| 652 | 額 | gaku | ガク | ひたい | forehead; tablet; framed picture; sum; amount; volume |
| 653 | 欧 | ou | オウ | うた(う)、は(く) | Europe |
| 654 | 担 | tan | タン | かつ(ぐ)、にな(う) | shouldering; carry; raise; bear |
| 655 | 準 | jun | ジュン | じゅん(じる)、なぞら(える) | semi-; correspond to; imitate |
| 656 | 賞 | shou | ショウ | ほ(める) | prize; reward; praise |
| 657 | 辺 | hen | ヘン | あた(り)、ほと(り) | environs; boundary; border; vicinity |
| 658 | 造 | zou | ゾウ | つく(る) | create; make; structure; physique |
| 659 | 被 | hi | ヒ | こうむ(る)、かぶ(る) | incur; cover; shelter; wear; put on |
| 660 | 技 | gi | ギ | わざ | skill; art; craft; ability; vocation; arts |
| 661 | 低 | tei | テイ | ひく(い) | lower; short; humble |
| 662 | 復 | fuku | フク | また | restore, return to, revert |
| 663 | 移 | i | イ | うつ(る) | shift, move, change |
| 664 | 個 | ko | コ | - | individual; counter for articles |
| 665 | 課 | ka | カ | - | chapter, lesson, section, department |
| 666 | 脳 | nou | ノウ | のうずる | brain; memory |
| 667 | 極 | kyoku | キョク、ゴク | きわ(める) | poles; settlement; conclusion; end |
| 668 | 含 | gan | ガン | ふく(む) | contain; include |
| 669 | 蔵 | zou | ゾウ | くら | storehouse; hide; own; have; possess |
| 670 | 量 | ryou | リョウ | はか(る) | quantity; measure; weight; amount |
| 671 | 型 | kei | ケイ | かた | type; model |
| 672 | 況 | kyou | キョウ | まし(て) | condition; situation |
| 673 | 針 | shin | シン | はり | needle; pin; staple; stinger |
| 674 | 専 | sen | セン | もっぱ(ら) | specialty; exclusive; mainly; solely |
| 675 | 谷 | koku | コク | たに、きわ(まる) | valley |
| 676 | 史 | shi | シ | - | history; chronicle |
| 677 | 階 | kai | カイ | きざはし | stair; counter for building story |
| 678 | 管 | kan | カン | くだ | pipe; tube; wind instrument; control; jurisdiction |
| 679 | 兵 | hei | ヘイ、ヒョウ | つわもの | soldier; private; troops; army |
| 680 | 接 | setsu | セツ | つ(ぐ) | touch; contact; adjoin; piece together |
| 681 | 細 | sai | サイ | ほそ(い)、こま(かい) | slender; narrow; detailed; precise |
| 682 | 効 | kou | コウ | き(く) | merit; efficacy; efficiency; benefit |
| 683 | 丸 | gan | ガン | まる、まる(い) | round; full (month); perfection |
| 684 | 湾 | wan | ワン | いりえ | gulf; bay; inlet |
| 685 | 録 | roku | ロク | と(る) | record |
| 686 | 省 | sei | セイ、ショウ | かえり(みる)、はぶ(く) | focus; government ministry; conserve |
| 687 | 旧 | kyuu | キュウ | ふる(い)、もと | old times; old things; former; ex- |
| 688 | 橋 | kyou | キョウ | はし | bridge |
| 689 | 岸 | gan | ガン | きし | beach |
| 690 | 周 | shuu | シュウ | まわ(り) | circumference; circuit; lap |
| 691 | 材 | zai | ザイ | - | lumber, log, timber, wood |
| 692 | 戸 | ko | コ | と | door; counter for houses |
| 693 | 央 | ou | オウ | - | center; middle |
| 694 | 券 | ken | ケン | - | ticket |
| 695 | 編 | hen | ヘン | あ(む) | compilation; knit; braid; twist; editing |
| 696 | 捜 | sou | ソウ | さが(す) | search; look for; locate |
| 697 | 竹 | chiku | チク | たけ | bamboo |
| 698 | 超 | chou | チョウ | こ(える) | transcend; super-; ultra- |
| 699 | 並 | hei | ヘイ | な(み)、なみ、なら(べる) | row, and, besides |
| 700 | 療 | ryou | リョウ | - | heal; cure |
| 701 | 採 | sai | サイ | と(る) | pick; take; fetch; take up |
| 702 | 森 | shin | シン | もり | forest, woods |
| 703 | 競 | kyou | キョウ、ケイ | きそ(う)、せ(る) | compete with; bid; contest; race |
| 704 | 介 | kai | カイ | - | jammed in; shellfish; mediate |
| 705 | 根 | kon | コン | ね | root; radical |
| 706 | 販 | han | ハン | - | marketing, sell, trade |
| 707 | 歴 | reki | レキ | - | curriculum; continuation; passage of time |
| 708 | 将 | shou | ショウ | まさ(に)、はた | leader; commander; general; admiral |
| 709 | 幅 | fuku | フク | はば | hanging scroll; width |
| 710 | 般 | han | ハン | - | carrier; carry; all; general; sort; kind |
| 711 | 貿 | bou | ボウ | - | trade; exchange |
| 712 | 講 | kou | コウ | - | lecture; club; association |
| 713 | 林 | rin | リン | はやし | grove; forest |
| 714 | 装 | sou | ソウ、ショウ | よそお(う) | attire; dress; pretend; disguise |
| 715 | 諸 | sho | ショ | もろ | various; many; several; together |
| 716 | 劇 | geki | ゲキ | - | drama; play |
| 717 | 河 | ka | カ | かわ | river |
| 718 | 航 | kou | コウ | - | navigate; sail; cruise; fly |
| 719 | 鉄 | tetsu | テツ | くろがね | iron |
| 720 | 児 | ji | ジ | こ | newborn babe; child |
| 721 | 禁 | kin | キン | - | prohibition; ban; forbid |
| 722 | 印 | in | イン | しるし | stamp; seal; mark; symbol; trademark |
| 723 | 逆 | gyaku | ギャク | さか(らう) | inverted; reverse; opposite |
| 724 | 換 | kan | カン | か(える) | interchange; period; change; convert; replace; renew |
| 725 | 久 | kyuu | キュウ、ク | ひさ(しい) | long time; old story |
| 726 | 短 | tan | タン | みじか(い) | short; fault; defect; weak point |
| 727 | 油 | yu | ユ | あぶら | oil; fat |
| 728 | 暴 | bou | ボウ、バク | あば(く) | outburst; force; violence |
| 729 | 輪 | rin | リン | わ | wheel; ring; circle; link; loop; counter for wheels and flowers |
| 730 | 占 | sen | セン | し(める)、うらな(う) | fortune-telling; divining; forecasting |
| 731 | 植 | shoku | ショク | う(える) | plant |
| 732 | 清 | sei | セイ | きよ(い) | pure; purify; cleanse |
| 733 | 倍 | bai | バイ | - | double; twice; times; fold |
| 734 | 均 | kin | キン | なら(す) | level; average |
| 735 | 億 | oku | オク | - | hundred million; 10**8 |
| 736 | 圧 | atsu | アツ | お(す) | pressure; push; overwhelm; oppress |
| 737 | 芸 | gei | ゲイ | う(える)、のり、わざ | technique; art; craft; performance; acting |
| 738 | 署 | sho | ショ | - | signature; govt office; police station |
| 739 | 伸 | shin | シン | の(びる) | expand; stretch; extend |
| 740 | 停 | tei | テイ | と(める) | halt; stopping |
| 741 | 爆 | baku | バク | は(ぜる) | bomb; burst open |
| 742 | 陸 | riku | リク、ロク | おか | land; six |
| 743 | 玉 | gyoku | ギョク | たま | jewel; ball |
| 744 | 波 | ha | ハ | なみ | waves; billows |
| 745 | 帯 | tai | タイ | お(びる) | sash; belt; obi; zone; region |
| 746 | 延 | en | エン | の(びる) | prolong; stretching |
| 747 | 羽 | u | ウ | は、わ、はね | feathers; counter for birds, rabbits |
| 748 | 固 | ko | コ | かた(める) | harden; set; clot; curdle |
| 749 | 則 | soku | ソク | のっと(る) | rule; follow; based on |
| 750 | 乱 | ran | ラン | みだ(れる) | riot; war; disorder; disturb |
| 751 | 普 | fu | フ | あまね(く) | universal; generally |
| 752 | 測 | soku | ソク | はか(る) | fathom; plan; scheme; measure |
| 753 | 豊 | hou | ホウ、ブ | ゆた(か)、とよ | bountiful; excellent; rich |
| 754 | 厚 | kou | コウ | あつ(い) | thick; heavy; rich |
| 755 | 齢 | rei | レイ | よわい、とし | age |
| 756 | 囲 | i | イ | かこ(む) | surround; enclosure; preserve; keep |
| 757 | 卒 | sotsu | ソツ | そっ(する) | graduate; soldier; private; die |
| 758 | 略 | ryaku | リャク | ほぼ | abbreviation; omission; outline; shorten |
| 759 | 承 | shou | ショウ | うけたまわ(る) | hear; listen to; be informed; receive |
| 760 | 順 | jun | ジュン | - | obey; order; turn; occasion |
| 761 | 岩 | gan | ガン | いわ | boulder; rock; cliff |
| 762 | 練 | ren | レン | ね(る) | practice, gloss, train, drill, polish, refine |
| 763 | 軽 | kei | ケイ | かる(い) | lightly; trifling; unimportant |
| 764 | 了 | ryou | リョウ | - | complete; finish |
| 765 | 庁 | chou | チョウ | やくしょ | government office |
| 766 | 城 | jou | ジョウ、セイ | しろ | castle |
| 767 | 患 | kan | カン | わずら(う) | afflicted; disease; suffer from; be ill |
| 768 | 層 | sou | ソウ | - | stratum; social class; layer; story; floor |
| 769 | 版 | han | ハン | - | printing block; edition; impression; label |
| 770 | 令 | rei | レイ | - | orders; command; decree |
| 771 | 角 | kaku | カク | かど、つの | angle; corner; square |
| 772 | 絡 | raku | ラク | から(む) | entwine; coil around; get caught in |
| 773 | 損 | son | ソン | そこ(なう) | damage; loss; disadvantage; hurt; injure |
| 774 | 募 | bo | ボ | つの(る) | recruit; campaign |
| 775 | 裏 | ri | リ | うら | back; reverse; inside; rear |
| 776 | 仏 | butsu | ブツ | ほとけ | Buddha, the dead, France |
| 777 | 績 | seki | セキ | - | exploits; achievements |
| 778 | 築 | chiku | チク | きず(く) | fabricate; build; construct |
| 779 | 貨 | ka | カ | たから | freight; goods; property |
| 780 | 混 | kon | コン | ま(じる) | mix; blend; confuse |
| 781 | 昇 | shou | ショウ | のぼ(る) | rise up |
| 782 | 池 | chi | チ | いけ | pond; pool; reservoir |
| 783 | 血 | ketsu | ケツ | ち | blood |
| 784 | 温 | on | オン | あたた(かい)、ぬく | warm |
| 785 | 季 | ki | キ | - | seasons |
| 786 | 星 | sei | セイ | ほし | star |
| 787 | 永 | ei | エイ | なが(い) | eternity; long; lengthy |
| 788 | 著 | cho | チョ、チャク | あらわ(す)、いちじる(しい) | renowned; publish; write |
| 789 | 誌 | shi | シ | - | document; records |
| 790 | 庫 | ko | コ、ク | くら | warehouse; storehouse |
| 791 | 刊 | kan | カン | - | publish; carve; engrave |
| 792 | 像 | zou | ゾウ | - | statue; picture; image; figure |
| 793 | 香 | kou | コウ、キョウ | かお(り) | incense; smell; perfume |
| 794 | 坂 | han | ハン | さか | slope; incline; hill |
| 795 | 底 | tei | テイ | そこ | bottom; sole; depth; bottom price |
| 796 | 布 | fu | フ | ぬの、し(く) | linen; cloth; spread; distribute |
| 797 | 寺 | ji | ジ | てら | Buddhist temple |
| 798 | 宇 | u | ウ | - | eaves; roof; house; heaven |
| 799 | 巨 | kyo | キョ | - | gigantic; big; large; great |
| 800 | 震 | shin | シン | ふる(う) | quake; shake; tremble; quiver |
| 801 | 希 | ki | キ | まれ、こいねが(う) | hope; beg; request; pray |
| 802 | 触 | shoku | ショク | ふ(れる)、さわ(る) | contact; touch; feel; hit; proclaim; announce |
| 803 | 依 | i | イ、エ | よ(る) | reliant; depend on; consequently; therefore; due to |
| 804 | 籍 | seki | セキ | - | enroll; register; membership |
| 805 | 汚 | o | オ | よご(す)、きたな(い)、けが(す) | dirty; pollute; disgrace; defile |
| 806 | 枚 | mai | マイ、バイ | - | sheet of...; counter for flat thin objects |
| 807 | 複 | fuku | フク | - | duplicate; double; compound; multiple |
| 808 | 郵 | yuu | ユウ | - | mail; stagecoach stop |
| 809 | 仲 | chuu | チュウ | なか | go-between; relationship |
| 810 | 栄 | ei | エイ | さか(える) | flourish; prosperity; honor |
| 811 | 札 | satsu | サツ | ふだ | ticket; paper money; banknote; note |
| 812 | 板 | han | ハン、バン | いた | plank; board; plate; stage |
| 813 | 骨 | kotsu | コツ | ほね | skeleton; bone; remains; frame |
| 814 | 傾 | kei | ケイ | かたむ(く) | lean; incline; tilt; trend; bias |
| 815 | 届 | kai | カイ | とど(ける) | deliver; reach; arrive; report |
| 816 | 巻 | kan | カン | ま(く)、まき | scroll; volume; book; part; roll up; wind up; coil; counter for texts (or book scrolls) |
| 817 | 燃 | nen | ネン | も(える) | burn; blaze; glow |
| 818 | 跡 | seki | セキ | あと | tracks; mark; print; impression |
| 819 | 包 | hou | ホウ | つつ(む)、くる(む) | wrap; pack up; cover; conceal |
| 820 | 駐 | chuu | チュウ | - | stop-over; reside in; resident |
| 821 | 弱 | jaku | ジャク | よわ(い) | weak; frail |
| 822 | 紹 | shou | ショウ | - | introduce; inherit; help |
| 823 | 雇 | ko | コ | やと(う) | employ; hire |
| 824 | 替 | tai | タイ | か(わる) | exchange, spare, substitute |
| 825 | 預 | yo | ヨ | あず(ける) | deposit; custody; leave with; entrust to |
| 826 | 焼 | shou | ショウ | や(く) | bake; burning |
| 827 | 簡 | kan | カン | ふだ、えら(ぶ) | simplicity; brevity |
| 828 | 章 | shou | ショウ | - | badge; chapter; composition; poem |
| 829 | 臓 | zou | ゾウ | はらわた | entrails; viscera; bowels |
| 830 | 律 | ritsu | リツ、リチ | - | rhythm; law; regulation; control |
| 831 | 贈 | zou | ゾウ | おく(る) | presents; send; give to; award to |
| 832 | 照 | shou | ショウ | て(る) | illuminate; shine; compare |
| 833 | 薄 | haku | ハク | うす(い) | dilute; thin; weak (tea) |
| 834 | 群 | gun | グン | む(れる)、むら(がる) | flock; group; crowd; herd |
| 835 | 秒 | byou | ビョウ | - | second |
| 836 | 奥 | ou | オウ | おく | heart; interior |
| 837 | 詰 | kitsu | キツ | つ(める) | packed; close; rebuke; blame |
| 838 | 双 | sou | ソウ | ふた | pair; set; comparison; counter for pairs |
| 839 | 刺 | shi | シ | さ(す)、さし、とげ | thorn, pierce, stab, prick, sting |
| 840 | 純 | jun | ジュン | - | genuine; purity; innocence |
| 841 | 翌 | yoku | ヨク | - | the following; next |
| 842 | 快 | kai | カイ | こころよ(い) | cheerful; pleasant; agreeable; comfortable |
| 843 | 片 | hen | ヘン | かた | one-sided; piece |
| 844 | 敬 | kei | ケイ | うやま(う) | awe; respect; honor; revere |
| 845 | 悩 | nou | ノウ | なや(む) | trouble; worry; in pain; distress; illness |
| 846 | 泉 | sen | セン | いずみ | spring; fountain |
| 847 | 皮 | hi | ヒ | かわ | skin; hide; leather |
| 848 | 漁 | gyo | ギョ、リョウ | あさ(る) | fishing; fishery |
| 849 | 荒 | kou | コウ | あら(い)、あ(れる) | rough; wild |
| 850 | 貯 | cho | チョ | た(める) | savings; store |
| 851 | 硬 | kou | コウ | かた(い) | stiff; hard |
| 852 | 埋 | mai | マイ | う(める) | bury; be filled up; embedded |
| 853 | 柱 | chuu | チュウ | はしら | pillar; post; cylinder; support |
| 854 | 祭 | sai | サイ | まつり | ritual; offer prayers; celebrate |
| 855 | 袋 | tai | タイ | ふくろ | sack; bag; pouch |
| 856 | 筆 | hitsu | ヒツ | ふで | writing brush; writing; painting brush; handwriting |
| 857 | 訓 | kun | クン | よ(む)、くん(ずる) | instruction, explanation, read |
| 858 | 浴 | yoku | ヨク | あ(びる) | bathe; be favored with; bask in |
| 859 | 童 | dou | ドウ | わらべ | juvenile; child |
| 860 | 宝 | hou | ホウ | たから | treasure; wealth; valuables |
| 861 | 封 | fuu | フウ、ホウ | - | seal; closing |
| 862 | 胸 | kyou | キョウ | むね | bosom; breast; chest; heart; feelings |
| 863 | 砂 | sa | サ、シャ | すな | sand |
| 864 | 塩 | en | エン | しお | salt |
| 865 | 賢 | ken | ケン | かしこ(い) | intelligent; wise; wisdom; cleverness |
| 866 | 腕 | wan | ワン | うで | arm; ability; talent |
| 867 | 兆 | chou | チョウ | きざ(す) | trillion; sign; omen; symptoms |
| 868 | 床 | shou | ショウ | とこ、ゆか | bed; counter for beds; floor; padding; tatami |
| 869 | 毛 | mou | モウ | け | fur; hair; feather |
| 870 | 緑 | ryoku | リョク、ロク | みどり | green |
| 871 | 尊 | son | ソン | とうと(い) | revered; valuable; precious; noble |
| 872 | 祝 | shuku | シュク | いわ(う) | celebrate; congratulate |
| 873 | 柔 | juu | ジュウ、ニュウ | やわ(らかい) | tender; weakness; gentleness; softness |
| 874 | 殿 | den | デン | との、どの | Mr.; hall; mansion; palace; temple; lord |
| 875 | 濃 | nou | ノウ | こ(い) | concentrated; thick; dark; undiluted |
| 876 | 液 | eki | エキ | - | fluid; liquid; juice; sap; secretion |
| 877 | 衣 | i | イ、エ | ころも、きぬ | garment; clothes; dressing |
| 878 | 肩 | ken | ケン | かた | shoulder |
| 879 | 零 | rei | レイ | ぜろ | zero; spill; overflow; nothing |
| 880 | 幼 | you | ヨウ | おさな(い) | infancy; childhood |
| 881 | 荷 | ka | カ | に | baggage; load; cargo; freight |
| 882 | 泊 | haku | ハク | と(まる) | overnight stay |
| 883 | 黄 | kou | コウ、オウ | き | yellow |
| 884 | 甘 | kan | カン | あま(い) | sweet; coax; pamper; sugary |
| 885 | 臣 | shin | シン、ジン | - | retainer; subject |
| 886 | 浅 | sen | セン | あさ(い) | shallow; superficial; frivolous |
| 887 | 掃 | sou | ソウ | は(く) | sweep; brush |
| 888 | 雲 | un | ウン | くも | cloud |
| 889 | 掘 | kutsu | クツ | ほ(る) | dig; delve; excavate |
| 890 | 捨 | sha | シャ | す(てる) | discard; throw away; abandon |
| 891 | 軟 | nan | ナン | やわ(らかい) | soft |
| 892 | 沈 | chin | チン、ジン | しず(む) | sink; be submerged; subside; be depressed |
| 893 | 凍 | tou | トウ | こお(る)、こご(える) | frozen; refrigerate |
| 894 | 乳 | nyuu | ニュウ | ちち、ち | milk, breasts |
| 895 | 恋 | ren | レン | こい(しい) | romance; in love; yearn for; miss |
| 896 | 紅 | kou | コウ、ク | べに、くれない | crimson; deep red |
| 897 | 郊 | kou | コウ | - | outskirts, suburbs, rural area |
| 898 | 腰 | you | ヨウ | こし | loins; hips; waist |
| 899 | 炭 | tan | タン | すみ | charcoal; coal |
| 900 | 踊 | you | ヨウ | おど(る) | jump; dance; leap; skip |
| 901 | 冊 | satsu | サツ | ふみ | counter for books; volume |
| 902 | 勇 | yuu | ユウ | いさ(む) | courage; cheer up; bravery; heroism |
| 903 | 械 | kai | カイ | かせ | contraption; machine; instrument |
| 904 | 菜 | sai | サイ | な | vegetable; side dish; greens |
| 905 | 珍 | chin | チン | めずら(しい) | rare; curious; strange |
| 906 | 卵 | ran | ラン | たまご | egg |
| 907 | 湖 | ko | コ | みずうみ | lake |
| 908 | 喫 | kitsu | キツ | の(む) | consume, eat, drink, smoke, receive |
| 909 | 干 | kan | カン | ほ(す)、ひ(る) | dry; parch |
| 910 | 虫 | chuu | チュウ、キ | むし | insect; bug |
| 911 | 刷 | satsu | サツ | す(る)、は(く) | printing; print; brush |
| 912 | 湯 | tou | トウ | ゆ | hot water; bath; hot spring |
| 913 | 溶 | you | ヨウ | と(ける) | melt; dissolve; thaw |
| 914 | 鉱 | kou | コウ | あらがね | mineral; ore |
| 915 | 涙 | rui | ルイ | なみだ | tears; sympathy |
| 916 | 匹 | hitsu | ヒツ | ひき | counter for small animals |
| 917 | 孫 | son | ソン | まご | grandchild; descendants |
| 918 | 鋭 | ei | エイ | するど(い) | pointed; sharpness; edge; weapon; sharp; violent |
| 919 | 枝 | shi | シ | えだ | bough; branch; twig; limb; counter for branches |
| 920 | 塗 | to | ト | ぬ(る)、ぬ(り) | paint; smear; coating |
| 921 | 軒 | ken | ケン | のき | flats; counter for houses |
| 922 | 毒 | doku | ドク | - | poison; germ; harm |
| 923 | 叫 | kyou | キョウ | さけ(ぶ) | shout; exclaim; yell |
| 924 | 拝 | hai | ハイ | おが(む) | worship; adore; pray to |
| 925 | 氷 | hyou | ヒョウ | こおり、ひ | ice; hail; freeze |
| 926 | 乾 | kan | カン | かわ(く) | drought; dry; drink up; heaven |
| 927 | 棒 | bou | ボウ | - | rod; stick; cane; pole |
| 928 | 祈 | ki | キ | いの(る) | pray; wish |
| 929 | 拾 | shuu | シュウ | ひろ(う) | pick up; gather; find |
| 930 | 粉 | fun | フン | こ、こな | flour; powder; dust |
| 931 | 糸 | shi | シ | いと | thread |
| 932 | 綿 | men | メン | わた | cotton |
| 933 | 汗 | kan | カン | あせ | sweat; perspire |
| 934 | 銅 | dou | ドウ | あかがね | copper |
| 935 | 湿 | shitsu | シツ | しめ(る) | damp; wet; moist |
| 936 | 瓶 | bin | ビン | かめ、へい | bottle; jar; jug; urn |
| 937 | 咲 | shou | ショウ | さ(く) | blossom; bloom |
| 938 | 召 | shou | ショウ | め(す) | call; send for; wear; buy, to eat, to drink |
| 939 | 缶 | kan | カン | かま | tin can; container |
| 940 | 隻 | seki | セキ | - | vessels; counter for ships; fish; one of a pair |
| 941 | 脂 | shi | シ | あぶら | fat; grease; lard |
| 942 | 蒸 | jou | ジョウ、セイ | む(す) | steam; heat; foment |
| 943 | 肌 | ki | キ | はだ | texture; skin; body; grain |
| 944 | 耕 | kou | コウ | たがや(す) | till; plow; cultivate |
| 945 | 鈍 | don | ドン | にぶ(い)、なまく(ら) | dull; slow; foolish; blunt |
| 946 | 泥 | dei | デイ | どろ | mud; adhere to; be attached to |
| 947 | 隅 | guu | グウ | すみ | corner; nook |
| 948 | 灯 | tou | トウ | ひ、とも(す) | lamp; a light; counter for lights |
| 949 | 辛 | shin | シン | から(い)、つら(い) | spicy; hot |
| 950 | 磨 | ma | マ | みが(く) | grind; polish; improve; brush (teeth) |
| 951 | 麦 | baku | バク | むぎ | barley; wheat |
| 952 | 姓 | sei | セイ、ショウ | - | surname |
| 953 | 筒 | tou | トウ | つつ | cylinder; pipe; tube |
| 954 | 鼻 | bi | ビ | はな | nose; snout |
| 955 | 粒 | ryuu | リュウ | つぶ | grains; drop; counter for tiny particles |
| 956 | 詞 | shi | シ | ことば | part of speech; words |
| 957 | 胃 | i | イ | - | stomach; crop |
| 958 | 畳 | jou | ジョウ、チョウ | たたみ | tatami mat; fold |
| 959 | 机 | ki | キ | つくえ | desk; table |
| 960 | 膚 | fu | フ | はだ | skin; body; texture |
| 961 | 濯 | taku | タク | すす(ぐ) | laundry; wash; rinse |
| 962 | 塔 | tou | トウ | - | pagoda; tower; steeple |
| 963 | 沸 | futsu | フツ | わ(く) | seethe; boil; ferment |
| 964 | 灰 | kai | カイ | はい | ashes; cremate |
| 965 | 菓 | ka | カ | - | candy; cakes; fruit |
| 966 | 帽 | bou | ボウ | ずきん、おお(う) | cap; headgear |
| 967 | 枯 | ko | コ | か(れる) | wither; die; dry up; be seasoned |
| 968 | 涼 | ryou | リョウ | すず(しい) | refreshing; nice and cool |
| 969 | 舟 | shuu | シュウ | ふね | boat; ship |
| 970 | 貝 | bai | バイ | かい | shellfish |
| 971 | 符 | fu | フ | - | token; sign; mark |
| 972 | 憎 | zou | ゾウ | にく(む) | hate; detest |
| 973 | 皿 | bei | ベイ | さら、ざら | dish; a helping; plate |
| 974 | 肯 | kou | コウ | がえんじ(る) | agreement; consent; comply with |
| 975 | 燥 | sou | ソウ | はしゃ(ぐ) | parch; dry up |
| 976 | 畜 | chiku | チク | - | livestock; domestic fowl and animals |
| 977 | 坊 | bou | ボウ、ボッ | - | boy, priest |
| 978 | 挟 | kyou | キョウ | はさ(む) | pinch; between |
| 979 | 曇 | don | ドン | くも(る) | cloudy weather |
| 980 | 滴 | teki | テキ | しずく、したた(る) | drip; drop |
| 981 | 伺 | shi | シ | うかが(う) | visit; ask; inquire; question |

## Checklist para publicar (por tanda)

1. Traducir `significado` y `meaning` al español para el bloque a publicar.
2. Revisar el `romaji` principal caso por caso (no confiar ciegamente en la primera lectura on'yomi).
3. Agregar filas al bloque en `datos.csv` con `categoria=N2`.
4. Escribir ejemplo contextualizado por kanji en `js/kanji-examples.js`.
5. Traducir a `locales/{es,en,de,fr,pt}.json` (`cards.kanji_X`).
6. Crear/ampliar lección(es) N2 en `js/core.js` y sus textos en los 5 idiomas.
7. Agregar `N2` a `SUPPORTED_KANJI_LEVELS` en `tools/validate-content.mjs` (si no está ya) y al filtro de `tools/fetch-kanjivg.mjs`/`tools/build-kanjivg-data.mjs`.
8. Regenerar `KanjiStrokeOrders.woff` (`npm run build:stroke-font`) y los datos KanjiVG (`npm run fetch:kanjivg && npm run build:kanjivg`).
9. `npm run validate:content && npm test` en verde antes de publicar la tanda.
