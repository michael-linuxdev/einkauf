"use strict";
/* DATA (Abteilungen mit Artikeln) und SYNRAW (Synonyme) kommen aus katalog.js, das src/gen.py erzeugt. */
var KEY = "einkaufszettel.v1";
var CATS = DATA.map(function (d) { return d[0]; });
var SONST = CATS.length - 1, TK = CATS.indexOf("Tiefkühl");
var STARTERS = ["Vollmilch","Butter","Eier 10er","Brötchen","Bananen","Äpfel","Tomaten","Gurke","Kartoffeln","Zwiebeln","Toastbrot","Spaghetti","Kaffee gemahlen","Naturjoghurt 3,5 %","Mineralwasser medium","Toilettenpapier","Käse","Möhren"];

function norm(s) {
  return s.toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/* ---------- Abteilungen: Farbe und Wortregeln ----------
   Je Abteilung: Farbe und Muster. Trifft ein Muster den vereinfachten Namen, gehört ein eigener Artikel
   in diese Abteilung (guess); geprüft wird in der Reihenfolge von GUESS_ORDER. */
var META = {
  "Obst & Gemüse": ["#3d9140", [
    "getrocknet|nuss|nusse|mandel|kerne|pistazie|marone|kastanie|cashew|studentenfutter|trail|rosine|sultanine|korinthe|apfelringe|chips|gojibeeren|datteln|kandiert",
    "mohre|karotte|pastinake|wurzel|rettich|radieschen|rube|rubchen|bete|topinambur|ingwer|kurkuma|galgant|maniok|taro",
    "kartoffel|drillinge|hornchen|la ratte",
    "zwiebel|schalotte|knoblauch",
    "pilz|champignon|pfifferling|seitling|shiitake|portobello|enoki|shimeji|morchel|truffel|rohrling",
    "chili|peperoni|jalapeno|habanero",
    "tomate|paprika|kurbis|granatapfel|kaki|patisson",
    "banane",
    "zitrone|limette|orange|mandarine|clementine|grapefruit|pomelo|kumquat",
    "traube",
    "erdbeer",
    "kirsch|beere|physalis|litschi|pflaume|zwetschge|mirabelle|reneklode|sanddorn|hagebutte",
    "birne|quitte|avocado|guave",
    "mais",
    "salat|rucola|spinat|mangold|kohl|kresse|lollo|endivie|chicoree|radicchio|batavia|frisee|pak choi|wirsing|brokkoli|romanesco|sprossen|lauch|sellerie|fenchel|spargel|bohnen|schoten|erbsen|artischock|okra|zucchini|gurke|aubergine|kraut|gemuse|coleslaw|petersilie|basilikum|dill|koriander|minze|rosmarin|thymian|salbei|oregano|majoran|estragon|kerbel|liebstock|barlauch|melisse|zitronengras|suppengrun|rhabarber|blatter|romana|portulak|postelein|lowenzahn|sauerampfer|mizuna|edamame|shiso|lorbeer|borretsch|pimpinelle|waldmeister|lavendel|stielmus|sprouts"]],
  "Brot & Backwaren": ["#b5732a", [
    "croissant|hornchen|franzbrotchen",
    "donut|berliner|krapfen|bagel|simit|mutzen|quarkballchen|schmalzkuchen",
    "brotchen|semmel|schrippe|toastie|brioche|laugen|brezel|wecken|seelen|schusterjungen|knuppel|panini|vinschgauer|buns",
    "kuchen|torte|stollen|schnecke|tasche|strudel|eclair|windbeutel|plunder|ecken|amerikaner|brownie|cookie|waffel|biskuit|schecke|donauwelle|bienenstich|muffin|quiche|geback|crepe|boden|ohren|stangen|keulchen|puddingbrezel|streusel|zopf|kranz|macarons|florentiner|petit|cupcake|cake|baklava|cannoli|churros|pastel|kalter hund|bananenbrot|osterbrot|weckmann"]],
  "Milch, Käse & Eier": ["#2f7dbf", [
    "kase|gouda|edamer|emmentaler|tilsiter|maasdamer|appenzeller|gruyere|cheddar|parmesan|grana|pecorino|manchego|mozzarella|burrata|feta|halloumi|camembert|brie\\b|gorgonzola|roquefort|limburger|romadur|obazda|provolone|scamorza|taleggio|fontina|havarti|esrom|jarlsberg|paneer|ricotta|mascarpone|babybel|leerdammer|geramont|philadelphia|exquisa|bresso|almette|kiri|raclette|fondue|comte|reblochon|munster|chaumes|cambozola|bavaria blu|stilton|danablu|morbier|vacherin|old amsterdam|mimolette|quargel|weisslacker|tete de moine",
    "\\beier|eiweiss|wachtelei|vollei|eigelb",
    "tofu|tempeh|seitan|vegan|vegetarisch|falafel|hummus|gemuse|antipasti|oliven|guacamole|bratling|soja-|jackfruit|erbsenprotein|kichererbsen|baba|muhammara",
    "butter(?!milch)|margarine|schmalz|streichfett|\\brama\\b|latta|kerrygold",
    "joghurt|quark|skyr|pudding|dessert|grutze|mousse|tiramisu|panna|creme|schmand|saure sahne|sour cream|milchreis|gotterspeise|activia|actimel|fruchtzwerge|monte|almighurt|dany|leckermaulchen|tzatziki|aioli|dip|taramas|tirokafteri",
    "nudeln|tortellini|ravioli|gnocchi|spatzle|maultaschen|knodel|klosse|suppe|salat|kaiserschmarrn|(^|[^n])pasta|pesto|sushi",
    "teig|hefe|reibekuchen|pulver"]],
  "Fleisch, Wurst & Fisch": ["#bf463f", [
    "schinken|prosciutto|speck|bacon|pancetta|coppa|lardo|guanciale|pastrami",
    "burger|patties",
    "fisch|lachs|forelle|saibling|zander|karpfen|kabeljau|rotbarsch|scholle|seezunge|butt\\b|dorade|barsch|pangasius|tilapia|matjes|hering|rollmops|buckling|makrele|sprotte|aal\\b|schillerlocke|garnele|krabbe|krebs|surimi|muschel|oktopus|pulpo|hummer|kaviar|rogen|sushi|sashimi|wels|hecht|schleie|marane|felchen|stor\\b|seeteufel|seehecht|leng|rotzunge|flunder|steinbeisser|knurrhahn|rotbarbe|sardine|sardelle|anchovis|kipper|gabelbissen|gambas|langustinen|kaisergranat|calamari|sepia|austern|algen|wakame",
    "wurst|salami|wiener|knacker|krakauer|cabanossi|debreziner|landjager|beisser|mettenden|chorizo|fuet|griller|bifi|lyoner|mortadella|salsiccia|merguez|sucuk|regensburger|braunschweiger|gottinger|pinkel|stracke|feldkieker|rauchenden",
    "hahnchen|huhn|huhner|pute|ente|gans|ganse|geflugel|wachtel|chicken|kuken|fasan"]],
  "Tiefkühl": ["#2a9db3", [
    "eiswurfel|crushed",
    "pizza|flammkuchen|piccolinis|ristorante|ofenfrische|pinsa|calzone",
    "\\beis|wassereis|stieleis|kindereis|proteineis|fruchteis|milcheis|sahneeis|nuss-eis|sorbet|frozen|magnum|cornetto|langnese|movenpick|haagen|ben & jerry|nogger",
    "burger",
    "pommes|krokett|rosti|kartoffel|wedges|fries|hash browns|potatoes",
    "fisch|lachs|filet|garnele|meeres|muschel|pangasius|zander|rotbarsch|scholle|calamari|surimi|kibbelinge",
    "chicken|hahnchen|ente\\b|enten|gans\\b|ganse|pute",
    "beer|kirsch|mango|ananas|pflaume|smoothie|rhabarber|aprikose|pfirsich|banane|obst|granatapfel",
    "croissant",
    "donut|berliner|quarkballchen|churros",
    "lasagne|nudel|tortell|ravioli|maultaschen|goreng|paella|pfanne|gyoza|dim sum|wan tan|frikassee|gulasch|cannelloni|pierogi|pelmeni|wareniki|manti|spatzle|knodel|curry|bolognese|penne|spaghetti|tagliatelle|reis|sushi|suppe|eintopf|chili con|moussaka|auflauf|gratin|bao|sommerrollen",
    "brotchen|brezel|brezen|baguette|brot|ciabatta|naan",
    "kuchen|torte|strudel|windbeutel|waffel|germknodel|kaiserschmarrn|muffin|brownie|cheesecake|cake|crepes|pancakes|tiramisu|profiteroles|buchteln|dampfnudeln",
    "tk-|gemuse|spinat|vegan|veggie"]],
  "Nudeln, Reis & Konserven": ["#c2622b", [
    "ol\\b|essig|balsamico|zitronensaft|limettensaft|ketchup|mayo|remoulade|senf|sosse|sauce|dressing|sriracha|sambal|wurze|mirin|sirup|ponzu|tamari|ketjap|verjus|condimento|reiswein|jus\\b|kwas",
    "thunfisch|sardine|sardelle|makrele|hering|lachs|dorsch|muschel|krabben dose|sprotten|saupiquet|hawesta|appel",
    "glas|gurke|cornichon|pickle|oliven|kapern|eingelegt|pesto|ajvar|aufstrich|chutney|kimchi|paste|mus\\b|mark\\b|kompott|meerrettich|schattenmorellen|sauerkraut|dip|fond|tahini|harissa|letscho|silberzwiebeln|hengstenberg|sugo|salsa|creme|tapenade|antipasti|gochujang|doenjang|adschika|salca|ghee|smetana|tworog",
    "nudel|spaghetti|linguine|tagliatelle|fettuccine|pappardelle|penne|rigatoni|fusilli|spirelli|farfalle|makkaroni|tortiglioni|conchiglie|orecchiette|cannelloni|lasagne|spatzle|knopfle|tortell|ravioli|gnocchi|reis|couscous|bulgur|quinoa|hirse|polenta|griess|buchweizen|amaranth|grunkern|graupen|dinkel|weizen|suppe|eintopf|topf|terrine|risotto|gericht|curry|dal\\b|masala|barilla|buitoni|miracoli|labskaus|soljanka|borschtsch|minestrone|oryza|gulasch|bigos|zurek|becher|(^|[^n])pasta|orzo|risoni|bucatini|capellini|vermicelli|paccheri|trofie|gemelli|somen|kritharaki|paneer",
    "bruhe|bouillon|fix\\b|binder|pulver|wurfel|panko|mehl|chips|rostzwiebeln|taco|kit\\b|blatter|papier|papadam|glucks|salatkerne|wurzmischung|tute|mix\\b|flocken|tortillas|zucker|kombu|wakame|furikake|hefe"]],
  "Backen & Gewürze": ["#a37f22", [
    "kerzen",
    "sirup|dicksaft|aroma|extrakt|flussig|rosenwasser|goldsaft",
    "kuverture|schoko|kakao|nougat|marzipan|glasur|callets|cake melts",
    "konfiture|fullung|mark\\b|paste|aprikotur|gelee",
    "salz|pfeffer|paprika|chili|curry|kurkuma|kummel|koriander|kardamom|zimt|nelken|muskat|piment|anis|fenchel|senfkorner|wacholder|lorbeer|ingwer|knoblauch|zwiebel|safran|getrocknet|krauter|gewurz|masala|hanout|zatar|sumach|bockshorn|wurzmischung|vanille gemahlen|\\brub\\b|beeren|bluten|baharat|berbere|dukkah|chermoula|pumpkin|macis|tonka|galgant|amchur|asafoetida|ajowan|namak|beifuss"]],
  "Frühstück, Kaffee & Tee": ["#8a5a3c", [
    "kaffee|espresso|crema|cappuccino|latte|kakao|trinkschokolade|nescafe|jacobs|dallmayr|lavazza|senseo|nespresso|tassimo|nesquik|kaba|ovomaltine|mokka|ristretto|cold brew(?!-tee)|golden-milk",
    "tee\\b|teemischung|teekapseln|earl grey|darjeeling|sencha|matcha|chai|teekanne|heisse zitrone|kandis",
    "riegel|flapjack|fruchtschnitte",
    "flocken|musli|porridge|granola|cornflakes|cerealien|pops|kissen|ringe|flakes|kleie|frosties|smacks|krispies|oats|crunch|haferbrei|puffreis|gepufft|biscuits|weizenkeime|hafermark|chia"]],
  "Süßes & Snacks": ["#c2477d", [
    "popcorn",
    "lutscher|zuckerstange|schleckmuschel",
    "keks|cookie|waffel|biskuit|spekulatius|lebkuchen|pfeffernusse|pfefferkuchen|zimtsterne|kipferl|printen|baumkuchen|amarettini|cantuccini|shortbread|soft cake|kuchen|russisch brot|geback|milchschnitte|prinzenrolle|oreo|pick up|makronen|filinchen|knacke|hanuta|knoppers|platzchen|heidesand|hippen|engelsaugen|husarenkrapfen|spitzbuben|barentatzen|magenbrot|fruchtebrot|stollen",
    "chips|flips|salz|brezel|cracker|erdnuss|erdnusse|cashew|pistazie|mandeln|macadamia|nuss-frucht|nussmix|nachos|laugen|kichererbsen|wasabi|snack|jerky|biltong|trockenfleisch|pringles|erdnusslocken|nicnac|knabber|sticks|stangen|ringe|ballchen|studentenfutter|pekannusse|walnusse|kerne|edamame|mais geroste|party-mix|grissini|reisgeback",
    "schoko|praline|marzipan|nougat|riegel|mozartkugel|domino|advent|milka|ritter sport|kinder |duplo|toffifee|merci|ferrero|raffaello|mon cheri|lindt|after eight|snickers|\\bmars\\b|twix|bounty|milky way|kitkat|\\blion\\b|m&m|smarties|halloren|knusperflocken|bambina|minztafelchen|uberraschungsei|weinbrandbohnen|rumkugeln|krokant|ostereier|-eier"]],
  "Getränke": ["#5a6cd4", [
    "ginger ale|ginger beer|spicy ginger|tonic|bitter lemon|soda|wasser|cola(?!bier)|sirup|wild berry",
    "saft|nektar|schorle|smoothie|shot\\b|trinkpackchen|eistee|limo|brause|hohes c|granini|punica|valensina|rotbackchen|capri|drink|trinkmahlzeit",
    "bier|\\b(pils|helles|export|lager|ipa|radler|marzen|gose|kolsch|cider|stout|porter|tripel|kriek|russ)\\b|\\bale\\b|weizen(?!korn)|bock\\b|berliner weisse|malztrunk|partyfass|radeberger|wernesgruner|kostritzer|krostitzer|sternburg|freiberger|feldschlosschen|beck's|krombacher|bitburger|warsteiner|veltins|erdinger|paulaner|franziskaner|augustiner|jever|flensburger|hasseroder",
    "cocktail|mojito|caipirinha|colada|\\bgin\\b|wodka|\\brum\\b|whisk|tequila|mezcal|pisco|likor|schnaps|korn\\b|\\bbrand\\b|brand\\b|geist\\b|obstler|grappa|ouzo|raki|aquavit|amaretto|sambuca|absinth|cachaca|curacao|triple sec|maraschino|barenfang|bitter|fernet|amaro|pastis|genever|cognac|armagnac|calvados|brandy|bourbon|scotch|limoncello|jagermeister|baileys|ramazzotti|berentzen|angostura|spirituose|saurer apfel|rumtopf|kirschwasser|zwetschgenwasser|williamsbirne|doppelkorn",
    "wein|sekt|secco|prosecco|champagner|\\bcava\\b|cremant|piccolo|\\bhugo\\b|riesling|thurgau|silvaner|burgunder|chardonnay|sauvignon|pinot|traminer|dornfelder|merlot|shiraz|tempranillo|rioja|chianti|primitivo|montepulciano|bordeaux|lambrusco|sherry|wermut|aperitif|aperol|federweisser|veltliner|zweigelt|blaufrankisch|lemberger|trollinger|portugieser|regent|malbec|syrah|zinfandel|sangiovese|barolo|barbera|valpolicella|amarone|avola|rhone|beaujolais|chablis|sancerre|elbling|kerner|bacchus|scheurebe|gutedel|rivaner|muskateller|verdejo|albarino|vinho|soave|lugana|vermentino|rose\\b|weissherbst|rotling|blanc de|spatlese|auslese|kabinett|madeira|marsala|retsina|sangria|bowle|punsch|jagertee|met\\b|sake|frizzante|spumante|asti|spritz"]],
  "Drogerie & Gesundheit": ["#8a55c7", [
    "zahnburste|aufsteckburste|interdental|zahnseide|zungenreiniger|zahnholzer|munddusche",
    "rasier|bart|epilier|scherkopf|haarschneider",
    "lippenstift|lipgloss|lipliner|mascara|eyeliner|kajal|lidschatten|make-up|foundation|concealer|rouge|\\bpuder\\b|kompaktpuder|loser puder|bronzer|highlighter|primer|wimpern|augenbrauen|nagellack|kosmetik|schmink|kunstnagel|unterlack|uberlack|bb-cream|cc-cream",
    "kamm|burste|haarband|haarreif|haarspange|haarnadel|haargummi|haarklammer|scrunchie|lockenwickler|haarnetz|duttkissen|haarschere",
    "parfum|eau de|bodyspray|duftset|aftershave|korperspray",
    "sonnen|after sun|after-sun|selbstbrauner",
    "thermometer|blutdruck|pulsoximeter|waage|teststreifen|schnelltest",
    "pflaster|verband|binde\\b|mullbinde|kompresse|tape|hansaplast|wundauflage|dreiecktuch|erste-hilfe",
    "tablette|vitamin|magnesium|calcium|\\bzink|eisen|kapseln|baldrian|protein|hustensaft|tropfen|elektrolyt|bonbons|pastillen|ibuprofen|paracetamol|zapfchen|mittel\\b|probiotika|biotin|selen|jod|kalium|kieselerde|kollagen|coenzym|omega|lebertran|algenol|spirulina|chlorella|maca|ashwagandha|ginseng|melatonin|mariendistel|whey|casein|kreatin|bcaa|folsaure|heilerde|traubenzucker",
    "tucher|watte|binden|slipeinlagen|tampons|einlagen|always|pads\\b",
    "dusch|shampoo|seife|\\bdeo|spulung|haar|bad\\b|bade|schaumbad|waschlotion|waschgel|lotion|spray|serum|ol\\b|wasser|tonic|reinigung|desinfektion",
    "zahnpasta|zahncreme|zahngel|creme|cream|salbe|gel\\b|balsam|korperbutter|colgate|odol|elmex|aronal|blend-a-med|sensodyne|labello|bepanthen|lippen|vaseline|melkfett|sheabutter|hirschtalg|maske|peeling"]],
  "Haushalt & Putzen": ["#1f9783", [
    "toilettenpapier|kuchenrolle|servietten|papierhandtucher|folie|backpapier|butterbrotpapier",
    "waschmittel|weichspuler|spulmittel|klarspuler|hygienespuler|persil|ariel|\\bspee\\b|weisser riese|lenor|perwoll|pril|fairy",
    "kleiderbugel|hosenbugel|kleidersack",
    "bugel|dampfglatter",
    "mull|gelbe sacke|sacke|treteimer|kosmetikeimer",
    "eimer",
    "beutel",
    "batterie|knopfzelle|akku(?!sauger)",
    "gluhbirne|lampe|leuchtstoff|leuchtmittel|led-|lichterkette|nachtlicht|laterne|windlicht",
    "kerze|teelicht|grablicht",
    "pfanne|wok\\b",
    "kochtopf|topfset|schnellkochtopf|milchtopf|kasserolle|brater|auflaufform|dampfgar|slow cooker|fondue",
    "grill|anzund|kohle|brikett|brenn|kamin|feuer|streichholz|zundholz|gas|fackel|lampenol|raucher",
    "geschenkpapier|geschenkband|geschenktute|party|girlande|konfetti|luftschlangen|luftballon|troten|knallbonbon|papierhute|tischfeuerwerk|tortenfontane",
    "kabel|stecker|steckdose|netzteil|powerbank|usb|hdmi|ladegerat|kopfhorer|handy|display",
    "wasserkocher|wasserkessel|kanne|french press|espressokocher|karaffe|krug",
    "toaster|maschine|mixer|ruhrgerat|kocher|maker|waffeleisen|fritteuse|mikrowelle|backofen|kochplatte|automat|bereiter|sprudler|vakuumierer|allesschneider|zerkleinerer|entsafter|sauger|saugroboter|dampfreiniger|kaffeemuhle|luftbefeuchter|luftentfeuchter",
    "einmach|schraubglaser|vorratsglaser|gewurzglaser",
    "teller|besteck|gabel|loffel|messer(?!becher)|schale|schussel|tasse|becher|glaser|geschirr|tablett|platte\\b|essstabchen|schneidebrett|kochloffel|pfannenwender|schneebesen|kelle|schaber|zange|reibe|hobel|schaler|offner|korkenzieher|presse|stampfer|sieb|nudelholz|morser|muhle",
    "wasche|korb",
    "besen|handfeger|wischmopp|wischer|staubwedel|burste|kehrschaufel|schrubber|abzieher",
    "reiniger|entferner|spray|politur|pflege|entkalker|scheuer|wc-|\\bsoda\\b|seife|starke|bugelwasser|bleich|erfrischer|fleckensalz|schimmel|frosch|ajax|meister proper|domestos|\\bbref\\b|cillit|\\bviss\\b|sagrotan|vanish|febreze|silberputz|duft|schuhcreme|fleck"]],
  "Baby & Kind": ["#d7647f", [
    "windel|pants|wickel|pampers",
    "glaschen|brei|quetschie|babynahrung|alete|bebivita",
    "keks|stangen|kringel|waffel|riegel|musli",
    "malbuch|knete|kreide|farben|sticker|puzzle|zeitschrift|sammelkarten",
    "creme|lotion|shampoo|\\bol\\b|babyol|babybad|waschgel|puder|bubchen"]],
  "Tierbedarf": ["#7a8a2c", [
    "fisch|teich|aquarium"]],
  "Kleidung & Textilien": ["#56799a", [
    "socken|strumpf|strumpfe|fusslinge",
    "handschuh|faustlinge|mutze|hut\\b|cap\\b|stirnband|ohrenschutzer|schal\\b|halstuch",
    "schuh|stiefel|sandalen|flip-flops|sneaker|pantoffeln|clogs|sohlen|schnursenkel|fersenkissen",
    "tasche|rucksack|koffer|ranzen|beutel|geldborse",
    "handtuch|handtucher|duschtuch|badetuch|saunatuch|strandtuch|waschlappen|waschhandschuh|badematte|vorleger|duschmatte|tischdecke|laufer|servietten|wachstuch|teppich|vorhang|gardine|plaid|uberwurf",
    "bett|kissen|decke|laken|matratze|molton|steppbett|nasseschutz",
    "garn|nadel|naht|nah|knopf|knopfe|reissverschluss|wolle|strick|hakel|stick|stopf|fingerhut|gummi|kordel|band\\b|flicken|aufnaher|stoff|filz|vlies|watte|klett|schneider|einfadler|bugelbilder|etiketten",
    "hose|jeans|leggings|shorts|chino|rock\\b|slips|panty|hipster|unterhose",
    "jacke|mantel|weste|anzug|poncho|kittel|pullover|sweatshirt|overall"]],
  "Baumarkt & Werkzeug": ["#cf861b", [
    "fahrrad|sattel|pedale|lenker|gepacktrager|reflektor|rucklicht|bremszug|schaltzug",
    "auto|motor|scheibenwisch|scheibenenteiser|scheibenfrost|scheibenreiniger|kuhl|adblue|felgen|wischer|eiskratzer|duftbaum|enteiser|reifen|wagenheber|radkreuz|starthilfe|abschlepp|warndreieck|zundkerzen|h7|h4|sitzbezuge|kofferraum|schneeketten|bremsen|bremsflussig|getriebe|cockpit|lackstift|kratzer",
    "schloss|riegel|zylinder|turkette|turspion|tresor",
    "leuchte|strahler|lampe|led-panel",
    "schraubendreher|torx|inbus|\\bbits?\\b|bit-|bithalter",
    "schlussel(?!kasten)|zange|ratsche|schraubstock|zwinge",
    "bohr|akkuschrauber|frase|schleif|sage|multitool|elektrohobel|kompressor|heissluft|trennscheiben|schruppscheiben|facherscheiben|sauger|werkzeug-",
    "steckdose|schalter|kabel|stecker|kupplung|fassung|dimmer|klemmen|sicherung|dose\\b|melder|trafo|baldachin|aderend|schrumpf|litze",
    "hahn|armatur|dusch|brause|siphon|spulkasten|wc-|waschbecken|ventil|rohr|schlauch|stopsel|perlator|strahlregler|thermostat|boiler|erhitzer|fitting|heizkorper|haarsieb|heberglocke|druckminderer",
    "massband|bandmass|zollstock|wasserwaage|messschieber|entfernungsmesser|winkel\\b|anschlagwinkel",
    "leiter|tritt|arbeitsbock",
    "walze|roller|farbrolle|pinsel|quast",
    "farbe|lack|lasur|grund|beize|ol\\b|wachs|firnis|verdunnung|spiritus|aceton|benzin|abbeizer|kleister|putz|spachtel|zement|mortel|beton|gips|kitt|fugen|silikon|acryl|kleber|leim|harz|dicht|bitumen|schaum|abtonpaste|terpentin",
    "holz|latten|leisten|platte|brett|diele|laminat|parkett|vinyl|boden|fliesen|paneele|stab\\b|pfosten|sperrholz|hobelware|fensterbank|profil|regal|tapete|raufaser",
    "schraube|dubel|nagel|nieten|mutter|scheiben\\b|splinte|krampen|stifte|anker|haken|ose|schelle|verbinder|scharnier|winkel|federringe|gewindestangen",
    "band\\b|tape|krepp",
    "handschuhe|helm|schutz|maske|overall|stiefel"]],
  "Garten & Pflanzen": ["#5b9a2d", [
    "grill|feuer|fackel|gasflasche",
    "giess|schlauch|brause|sprenger|bewasser|regentonne|hahnanschluss",
    "spaten|schaufel|gabel|harke|rechen|hacke|stecher|kelle|kralle|schere|schneeschieber|maher|trimmer|vertikutierer|laubblaser",
    "erde\\b|dunger|kalk|sand|mulch|kompost(?!er)|samen|saat|blaukorn|mehl|spane|granulat|blahton|perlite|streu|splitt|sack|nachsaat|rasen\\b|bienenweide|grundungung",
    "blume|rose|tulpe|orchidee|strauss|stern|kranz|gesteck|geranie|petunie|stiefmutterchen|primel|veilchen|begonie|fuchsie|lavendel|chrysantheme|heide|hortensie|amaryllis|narzisse|krokus|hyazinthe|dahlie|gladiole|stauden|zwiebeln|christrose",
    "baum|strauch|strauch|hecke|bambus|palme|ficus|monstera|buchs|efeu|tanne|mistel"]],
  "Büro & Schule": ["#486ba3", [
    "drucker|toner|patrone|laminier|aktenvernichter|maus|tastatur|webcam|headset|festplatte|usb|sd-karte|rohlinge|laptop|monitor|rechner|bildschirm",
    "schere|cutter|klingen|briefoffner",
    "ordner|hefter|mappe|hulle|register|ablage|sammler|trenn|aktendeckel",
    "heft|block|buch|kalender|planer|papier|karton|pappe",
    "brief|umschlag|versand|karte\\b|karten\\b|paket|post",
    "klammer|locher|heftgerat|tacker|reisszweck|pinn|gummi|magnete|klebe|kleber|tesa|uhu|pritt|band\\b|klebefilm"]],
  "Sonstiges": ["#6f7a80", [
    "geschenk|mitbringsel|blumen",
    "paket|brief|post",
    "tasche|tute|beutel",
    "tanken|auto"]]
};
var CATCOL = [], CATRULES = [];
CATS.forEach(function (c) {
  var m = META[c] || ["#6f7a80", []];
  CATCOL.push(m[0]);
  CATRULES.push(m[1].map(function (p) { return new RegExp(p); }));
});
function ruleHit(cat, n) {
  var r = CATRULES[cat];
  for (var i = 0; i < r.length; i++) if (r[i].test(n)) return true;
  return false;
}
/* ---------- Farbige Bildzeichen (Stil E) ----------
   Je Abteilung: Regeln (erste passende gewinnt), danach das Standardzeichen.
   Ein Wert mit "#" ist eine eigene Zeichnung (Symbol x-<name> in index.html), alles andere ein Emoji-Zeichen, zu dem emoji/<Codepunkte>.svg gehört
   (Noto Emoji; nach Änderungen an der Tabelle tools/bildzeichen.py laufen lassen). */
var EMO = {
  "Obst & Gemüse": ["🥬", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["weintrauben hell|trauben hell|tafeltrauben|weintrauben kernlos", "#grapesgreen"],
    ["zucchini(?!bl)", "#zucchini"],
    ["champignons braun|portobello|pfifferling|steinpilz|austernpilz|seitling|shiitake|enoki|shimeji|morchel|rohrling|buchenpilz|pilzmischung|pilzpfanne|^pilze$", "#champignonb"],
    ["champignon", "#champignon"],
    ["rote zwiebel|zwiebeln rot", "#redonion"],
    ["paprika rot|^paprika$|bio-paprika$|spitzpaprika", "#pepperred"],
    ["paprika gelb|paprika orange", "#pepperyellow"],
    ["apfel grun", "🍏"],
    ["kaki", "#kaki"],
    ["sternfrucht|karambole", "#starfruit"],
    ["drachenfrucht|pitahaya", "#dragonfruit"],
    ["physalis", "#physalis"],
    ["litschi|rambutan|longan", "#lychee"],
    ["grapefruit|pomelo|pampelmuse|sweetie", "#grapefruit"],
    ["guave", "#guava"],
    ["haselnuss|haselnusse", "#hazelnut"],
    ["nussmischung|studentenfutter|trail-mix|^nusse$", "#nutmix"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["sprossen", "🌿"], ["himbeer", "#raspberry"], ["brombeer|maulbeer", "#blackberry"], ["stachelbeer", "#gooseberry"], ["schwarze johannisbeer|holunder|aronia", "🫐"], ["johannisbeer|jostabeer|preiselbeer|cranberr|hagebutte|sanddorn|berberitze|gojibeer", "#redberry"], ["limette(?!nbl)", "#lime"], ["pflaume(?!ntomate)|zwetschge|reneklode|mirabelle", "#plum"], ["aprikose", "#apricot"], ["granatapfel", "#pomegranate"], ["papaya", "#papaya"], ["maracuja|passionsfrucht", "#passionfruit"], ["(^|[\\s-])feige", "#fig"], ["dattel(?!tomate)", "#date"], ["rosine|sultanine|korinthe", "#raisins"], ["walnuss|walnusse|pekan", "#walnut"], ["mandel", "#almond"], ["cashew", "#cashew"], ["pistazie", "#pistachio"], ["radieschen", "#radish"], ["rettich|pastinake|petersilienwurzel|schwarzwurzel|eiszapfen", "#parsnip"], ["(^|[\\s-])bete|steckrube|kohlrube|rubchen|butterrube", "🫜"], ["ingwer|kurkuma|galgant", "🫚"], ["rotkohl", "#redcabbage"], ["weisskohl|spitzkohl|wirsing", "#cabbage"], ["kohlrabi", "#kohlrabi"], ["spargel weiss|bruchspargel|spargel violett", "#asparagusw"], ["spargel", "#asparagus"], ["fenchel", "#fennel"], ["artischocke", "#artichoke"], ["rhabarber", "#rhubarb"], ["(^|[\\s-])lauch|porree|fruhlingszwiebel", "#leek"], ["blumenkohl", "#cauliflower"], ["rosenkohl|sprouts", "#sprouts"], ["knollensellerie|sellerieknolle", "#celeriac"], ["erbse|zuckerschote|kaiserschote|edamame|grune bohnen|stangenbohnen|buschbohnen|prinzessbohnen|bohnen grun|wachsbohnen", "🫛"], ["kopfsalat|eisbergsalat|romana|feldsalat|eichblatt|pflucksalat|salatherzen|salatmix|endivie|lollo|batavia|babyleaf|salat im topf|^salat$", "🥬"],
    ["satsuma", "🍊"], ["^cranberrys$", "🫐"], ["pitahaya|cherimoya", "🥭"], ["paprika orange", "🫑"],
    ["cranberrys frisch", "🫐"], ["wurzelspinat", "🥬"], ["kaktusfeige|jackfruit", "🥭"],
    ["granny", "🍏"], ["pilz|champignon|pfifferling|seitling|shiitake|portobello|enoki|shimeji|morchel|truffel|rohrling", "🍄"], ["tomate", "🍅"],
    ["petersilie|schnittlauch|basilikum|dill|koriander|minze|rosmarin|thymian|salbei|oregano|majoran|estragon|kerbel|liebstock|barlauch|melisse|krauter|bohnenkraut|kresse|suppengrun|zitronengras|blatter|lorbeer|waldmeister|lavendel|sprossen", "🌿"],
    ["mango(?!ld)|papaya|maracuja|passionsfrucht|guave|kaki|sternfrucht|drachenfrucht|granatapfel|tamarillo", "🥭"], ["apfelringe|getrocknet|datteln|feigen|rosine|sultanine|korinthe|kandiert", "🌰"], ["apfel|\\bobst", "🍎"], ["birne|nashi|quitte", "🍐"],
    ["orange|mandarine|clementine|kumquat|grapefruit|pomelo", "🍊"], ["zitrone|limette", "🍋"], ["banane", "🍌"], ["wassermelone", "🍉"], ["melone", "🍈"],
    ["traube", "🍇"], ["erdbeer", "🍓"], ["kirsch", "🍒"], ["beere|physalis|holunder|sanddorn|hagebutte|litschi|rambutan", "🫐"],
    ["pfirsich|nektarine|aprikose|pflaume|zwetschge|mirabelle|reneklode", "🍑"],
    ["ananas", "🍍"], ["kokos", "🥥"], ["kiwi", "🥝"], ["erdnuss|erdnusse", "🥜"],
    ["nuss|nusse|mandel|pistazie|cashew|marone|kastanie|kerne|studentenfutter|trail", "🌰"],
    ["susskartoffel", "🍠"], ["kartoffel|drillinge|hornchen|la ratte", "🥔"], ["olive", "🫒"], ["avocado", "🥑"], ["aubergine", "🍆"],
    ["mohre|karotte|pastinake|wurzel|rube|rubchen|rettich|radieschen|bete", "🥕"], ["mais", "🌽"], ["chili|peperoni|jalapeno|habanero", "🌶️"], ["paprika", "🫑"],
    ["gurke|zucchini", "🥒"], ["brokkoli|blumenkohl|romanesco|rosenkohl|sprouts", "🥦"], ["knoblauch", "🧄"], ["zwiebel|schalotte|(^|[\\s-])lauch|porree", "🧅"],
    ["bohne|erbse|schote|edamame", "🫘"], ["kurbis|hokkaido|butternut|patisson", "🎃"],
    ["salat|coleslaw", "🥗"]]],
  "Brot & Backwaren": ["🍞", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["vollkornbrot(?!chen)|roggenbrot(?!chen)|schwarzbrot|pumpernickel|roggenvollkorn|kommissbrot|roggenschrot|vollkornschrot|malzbrot|malzkornbrot", "#darkbread"],
    ["teilchen|kopenhagener|datschi|osterlamm|stutenkerl", "🍰"], ["quarkini", "🍩"],
    ["pizza", "🍕"], ["reiswaffel|maiswaffel|dinkelwaffel", "🍘"],
    ["croissant|hornchen|franzbrotchen", "🥐"], ["brezel|laugen", "🥨"], ["bagel", "🥯"], ["donut|berliner(?! landbrot)|krapfen|quarkballchen|mutzen|schmalzkuchen", "🍩"],
    ["brotchen|semmel|schrippe|wecken|seelen|schusterjungen|knuppel|buns|toasties|brioche", "#bun"],
    ["baguette|ciabatta|grissini|brotsticks|stange|panini", "🥖"], ["fladenbrot|pita|naan|wrap|tortilla|lavash|yufka|durum|pide|simit|matzen", "🫓"],
    ["pfannkuchen|crepe", "🥞"], ["waffel", "🧇"], ["torte", "🎂"], ["muffin|cupcake|cake pops", "🧁"], ["quiche|zwiebelkuchen|borek", "🥧"],
    ["schnecke", "🍰"], ["cookie|macarons|florentiner|nussecken|schweineohren|amerikaner", "🍪"],
    ["kuchen|stollen|strudel|schnecke|tasche|streusel|brownie|biskuit|schecke|donauwelle|bienenstich|eclair|windbeutel|plunder|boden|zopf|kranz|baklava|cannoli|churros|pastel|kalter hund|petit|keulchen|puddingbrezel|osterbrot|weckmann", "🍰"]]],
  "Milch, Käse & Eier": ["🥛", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["haferdrink|sojadrink|mandeldrink|reisdrink|kokosdrink|dinkeldrink|erbsendrink|cashewdrink|haselnussdrink|hafer-mandel|kokos-reis|oatly|alpro", "#plantdrink"],
    ["^sahne( |$)|schlagsahne|kochsahne|konditorsahne|spruhsahne|h-sahne|bio-sahne|kaffeesahne", "#cream"],
    ["h-milch|kondensmilch", "#milkcarton"],
    ["mozzarella(?!-sticks)|burrata", "#mozzarella"],
    ["feta|hirtenkase|schafskase|salzlakenkase", "#feta"],
    ["eier \\d|eier freiland|eier bodenhaltung|eier grosse|bio-eier|eier vom hof", "#eggbox"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["falafel", "🧆"],
    ["chester|leicester|parmigiano|bufala|harzer|scheibletten|sandwichscheiben", "🧀"], ["zaziki", "#cup"], ["taboule", "🥗"], ["bratfett", "🧈"], ["soleier", "🥚"], ["lasagneblatter", "🍝"], ["flammkuchenboden|quark-ol-teig", "#bag"],
    ["ostereier", "🥚"], ["kichererbsen", "🌱"], ["ghanoush|muhammara|tirokafteri", "#cup"], ["pingui|milchschnitte", "🍫"],
    ["kase|gouda|edamer|emmentaler|tilsiter|maasdamer|appenzeller|gruyere|cheddar|parmesan|grana|pecorino|manchego|mozzarella|burrata|feta|halloumi|camembert|brie\\b|gorgonzola|roquefort|limburger|romadur|obazda|provolone|scamorza|taleggio|fontina|havarti|esrom|jarlsberg|paneer|ricotta|mascarpone|babybel|leerdammer|geramont|philadelphia|exquisa|bresso|almette|kiri|raclette|fondue|comte|reblochon|munster|chaumes|cambozola|bavaria blu|stilton|danablu|morbier|vacherin|old amsterdam|mimolette|quargel|weisslacker|tete de moine", "🧀"],
    ["\\beier|eiweiss|wachtelei|vollei|eigelb", "🥚"], ["butter(?!milch)|margarine|schmalz|streichfett|\\brama\\b|latta|kerrygold", "🧈"],
    ["tofu|tempeh|seitan|vegan|vegetarisch|falafel|bratling|soja-|jackfruit|erbsenprotein|gemuse", "🌱"],
    ["pudding|panna|brulee|mousse|tiramisu|gotterspeise|wackelpudding|grutze|dessert", "🍮"],
    ["joghurt|quark|skyr|creme|schmand|saure sahne|sour cream|milchreis|activia|fruchtzwerge|monte|almighurt|dany|leckermaulchen|tzatziki|aioli|dip|hummus|frischkase|taramas|guacamole", "#cup"],
    ["maultaschen|knodel|klosse|schupfnudeln|germknodel|dampfnudeln", "🥟"], ["nudeln|tortellini|ravioli|gnocchi|spatzle|pasta|pesto", "🍝"], ["suppe", "🍲"], ["salat", "🥗"],
    ["sushi", "🍣"], ["sandwich|wrap", "🥪"], ["oliven|antipasti", "🫒"], ["pizzateig|flammkuchenteig|teig|hefe", "#bag"], ["kaiserschmarrn|reibekuchen", "🥞"]]],
  "Fleisch, Wurst & Fisch": ["🥩", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["salami|chorizo|fuet|cabanossi|kabanos|landjager", "#salami"],
    ["schinken(?!wurst|mettwurst|speck)|prosciutto|coppa|aufschnitt|mortadella|lyoner|bresaola|pastrami", "#ham"],
    ["hackfleisch|rinderhack|putenhack|schweinemett$|zwiebelmett$|^mett$|^mett mit|thuringer mett|hackepeter|^tatar|beefsteakhack", "#mince"],
    ["(^|[^e])lachsfilet|raucherlachs|graved lachs|stremellachs|wildlachs|lachssteak|lachsseite|lachswurfel|lachstatar|lachsloin|^lachs$|bio-lachs|^lachs heissgerauchert|^lachs gerauchert|^lachs mariniert", "#salmon"],
    ["hahnchenbrust(?! aufschnitt)|putenbrust(?! aufschnitt| gerauchert)|hahnchen-innenfilet|putenschnitzel|hahnchenschnitzel|putenmedaillons|putensteaks", "#chickenbreast"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["gyros|doner|kebab", "🥙"],
    ["krainer|kabanos", "#sausage"], ["heilbutt", "🐟"], ["prawns", "🦐"],
    ["sushi|sashimi", "🍣"], ["garnele|krabbe|scampi|gambas|shrimp", "🦐"], ["krebs|hummer|langustinen|kaisergranat", "🦞"], ["muschel|auster", "🦪"], ["tintenfisch|calamari|oktopus|pulpo|sepia", "🦑"],
    ["schinken|prosciutto|coppa|lardo|guanciale|pastrami|haxe|eisbein|keule|schaufele", "🍖"], ["speck|bacon|pancetta", "🥓"], ["(^|[\\s-])burger(?!meister)|lachsburger|patties", "🍔"],
    ["fisch|lachs(?!e$)|forelle|saibling|zander|karpfen|kabeljau|rotbarsch|scholle|seezunge|butt\\b|dorade|barsch|pangasius|tilapia|matjes|hering|rollmops|buckling|makrele|sprotte|aal\\b|schillerlocke|surimi|kaviar|rogen|wels|hecht|schleie|marane|felchen|stor\\b|seeteufel|seehecht|leng|rotzunge|flunder|steinbeisser|knurrhahn|rotbarbe|sardine|sardelle|anchovis|kipper|gabelbissen|algen|wakame", "🐟"],
    ["wurst|salami|wiener|knacker|krakauer|cabanossi|debreziner|landjager|beisser|mettenden|chorizo|fuet|griller|bifi|lyoner|mortadella|salsiccia|merguez|sucuk|regensburger|braunschweiger|gottinger|pinkel|stracke|feldkieker|rauchenden|aufschnitt|leberkase|fleischkase|sulze|presskopf|saumagen", "#sausage"],
    ["hahnchen|huhn|huhner|pute|ente|gans|ganse|geflugel|wachtel|chicken|kuken|fasan", "🍗"], ["spiess(?!braten)|schaschlik|souvlaki|gyros|doner|kebab", "🍢"]]],
  "Tiefkühl": ["❄️", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["fischstabchen", "#fishfingers"],
    ["(^|[^e])lachsfilet|wildlachs|lachswurfel", "#salmon"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["^(bio-)?tk-.*himbeer", "#raspberry"], ["^(bio-)?tk-.*brombeer", "#blackberry"], ["^(bio-)?tk-.*stachelbeer", "#gooseberry"], ["^(bio-)?tk-.*(johannisbeer|preiselbeer|cranberr)", "#redberry"], ["^(bio-)?tk-.*(pflaume|zwetschge)", "#plum"], ["^(bio-)?tk-.*aprikose", "#apricot"], ["^(bio-)?tk-.*(krauter|petersilie|schnittlauch|dill|basilikum|barlauch|koriander|zitronengras|suppengrun)", "🌿"], ["^(bio-)?tk-.*knoblauch", "🧄"], ["^(bio-)?tk-.*(erbse|bohnen|zuckerschote|edamame)", "🫛"], ["^(bio-)?tk-.*mais", "🌽"], ["^(bio-)?tk-.*mohre", "🥕"], ["^(bio-)?tk-.*(spinat|grunkohl|wirsing)", "🥬"], ["^(bio-)?tk-.*kurbis", "🎃"], ["^(bio-)?tk-.*paprika", "🫑"], ["^(bio-)?tk-.*(zwiebel|schalotte)", "🧅"], ["^(bio-)?tk-.*(pilz|champignon|pfifferling)", "🍄"], ["^(bio-)?tk-.*rosenkohl", "#sprouts"], ["^(bio-)?tk-.*blumenkohl$", "#cauliflower"], ["^(bio-)?tk-.*rotkohl", "#redcabbage"], ["^(bio-)?tk-.*spitzkohl", "#cabbage"], ["^(bio-)?tk-.*kohlrabi", "#kohlrabi"], ["^(bio-)?tk-.*spargel", "#asparagus"], ["^(bio-)?tk-.*(lauch|porree)", "#leek"], ["^(bio-)?tk-.*chili", "🌶️"], ["^(bio-)?tk-.*ingwer", "🫚"], ["^(bio-)?tk-.*rote bete", "🫜"], ["^(bio-)?tk-.*avocado", "🥑"], ["falafel", "🧆"],
    ["frites|golden longs", "🍟"], ["lahmacun|\\bpide|piadina", "🍕"], ["forelle|dorade", "🐟"], ["shrimps", "🦐"], ["fleischballchen|kofte|sauerbraten|\\blamm", "🥩"], ["risotto", "🍛"], ["kohlroulade|kartoffelsuppe", "🍲"], ["blini|quarkkeulchen|reibekuchen|eierkuchen", "🥞"], ["apfeltaschen", "🍰"], ["calippo", "🍦"], ["tropenfruchte|acai|zwetschgen(?!knodel)", "🫐"],
    ["lasagne|gnocchi", "🍝"], ["sushi", "🍣"], ["minipizzen", "🍕"], ["borek|quiche", "🥧"], ["samosa", "🥟"], ["moussaka|gratin|bauernfruhstuck", "🍲"], ["krauterbutter", "🧈"], ["apfelkuchle", "🍰"], ["cranberr", "🫐"],
    ["eiswurfel|crushed", "🧊"], ["pizza|flammkuchen|piccolinis|ristorante|ofenfrische|pinsa|calzone", "🍕"],
    ["eisbecher|eisbombe|eistorte|sorbet|frozen", "🍨"], ["\\beis|wassereis|stieleis|kindereis|proteineis|fruchteis|milcheis|sahneeis|nuss-eis|magnum|cornetto|langnese|movenpick|haagen|ben & jerry|nogger", "🍦"],
    ["gyoza|dim sum|wan tan|pierogi|pelmeni|wareniki|manti|maultaschen|tortell|ravioli|knodel|klosse|bao|buchteln|dampfnudeln", "🥟"], ["burger", "🍔"], ["pommes|krokett|rosti|kartoffel|wedges|fries|hash browns|potatoes", "🍟"], ["garnele|meeresfruchte|calamari|tintenfisch", "🦐"],
    ["fisch|lachs|filet|muschel|pangasius|zander|rotbarsch|scholle|surimi|kibbelinge", "🐟"], ["chicken|hahnchen|ente\\b|enten|gans\\b|ganse|pute", "🍗"],
    ["pancake|pfannkuchen|crepes", "🥞"], ["kuchen|torte|(^|[^e])strudel|windbeutel|kaiserschmarrn|muffin|brownie|cheesecake|\\bcake|tiramisu|profiteroles", "🍰"],
    ["erdbeer", "🍓"], ["beer|kirsch|mango|ananas|pflaume|smoothie|rhabarber|aprikose|pfirsich|banane|obst|granatapfel", "🫐"],
    ["croissant", "🥐"], ["brezel|brezen|laugen", "🥨"], ["donut|berliner|quarkballchen|churros", "🍩"], ["waffel", "🧇"],
    ["burrito|quesadilla|fruhlingsrolle|sommerrolle|empanada", "🌯"],
    ["lasagne|nudel|cannelloni|spatzle|bolognese|penne|spaghetti|tagliatelle", "🍝"], ["reis|paella|goreng|curry|sushi", "🍛"], ["suppe(?!ngrun|ngemuse)|eintopf|gulasch|frikassee|chili con|rouladen|klopse", "🍲"],
    ["brotchen", "#bun"], ["baguette|brot|ciabatta|naan", "🥖"],
    ["tk-|gemuse|spinat|vegan|veggie|falafel", "🥦"], ["gyros|doner|frikadellen|kottbullar|hackballchen|cevapcici|bifteki|schnitzel|cordon|hack|pulled|wild|kaninchen|rehkeule|hirsch", "🥩"]]],
  "Nudeln, Reis & Konserven": ["🥫", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["olivenol", "#oliveoil"],
    ["essig(?!gurke)|balsamico|aceto|condimento|verjus", "#vinegar"],
    ["sojasosse|sojawurze|ketjap|tamari\\b|teriyaki", "#soysauce"],
    ["tomatenmark|paprikamark", "#tomatopaste"],
    ["thunfisch|sardine|makrele|hering(?!ssalat)|sprotten|sardellen(?!paste)|lachs dose|dorschleber|saupiquet|hawesta|appel", "#fishcan"],
    ["palmzucker", "#sugar"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["pflaume(?!nsosse)", "#plum"], ["aprikose", "#apricot"], ["preiselbeer", "#redberry"], ["stachelbeer", "#gooseberry"], ["ketchup", "#ketchup"], ["mayonnaise|mayo\\b|remoulade|miracel|salatcreme", "#mayo"], ["rotkohl", "#redcabbage"], ["spargel(?!creme|suppe)", "#asparagusw"], ["^erbsen (dose|glas|sehr fein|und)|junge erbsen|grune bohnen|brechbohnen|prinzessbohnen|bohnen grun|wachsbohnen|kaiserschoten", "🫛"], ["gluckskekse", "🥠"], ["falafel", "🧆"], ["rote bete|rote-bete", "🫜"], ["feigen", "#fig"], ["datteln", "#date"],
    ["schleifchen|eierteigwaren", "🍝"], ["ebly", "🌾"], ["miracel|vinaigrette", "#sauce"], ["tabasco", "🌶️"], ["tahin", "🫙"], ["pindjur|ljutenica", "🫑"], ["artischocke", "🫙"], ["knoblauch in", "🧄"], ["fischklosse", "🐟"],
    ["gurken", "🥒"], ["getrocknete tomaten", "🍅"], ["sossenbinder", "#bag"], ["krabbenchips", "#chips"], ["zitronensaft|limettensaft", "🍋"], ["lokum|helva|halva", "🍬"], ["crostini|taralli|sushki|prjaniki", "🍪"], ["preiselbeer", "🫙"], ["medjool", "🌰"],
    ["thunfisch|sardine|sardelle|makrele|hering|lachs|dorsch|sprotten|saupiquet|hawesta|appel|muscheln\\b|krabben(?!chips)", "🐟"], ["kapern|rotkohl|meerrettich|weinblatter|pesto", "🫙"],
    ["passiert|passata|polpa|pelati|geschalt|gehackte tomaten|stuckige tomaten|tomatenstucke|tomaten dose|dosentomaten|san-marzano", "🥫"], ["ketchup", "🍅"], ["senf", "#sauce"],
    ["olivenol", "🫒"], ["sojasosse|ketjap|tamari|ponzu|fischsosse|teriyaki|mirin|reiswein", "🍶"], ["essig|balsamico|ol\\b|verjus|condimento", "#oil"], ["honig", "🍯"],
    ["ramen|instantnudel|mie-|udon|soba|pho|glasnudel|reisnudel|wok-nudeln|chow|somen|pad-thai|yum yum|asia-snack", "🍜"],
    ["nudel|spaghetti|linguine|tagliatelle|fettuccine|pappardelle|penne|rigatoni|fusilli|spirelli|farfalle|makkaroni|tortiglioni|conchiglie|orecchiette|cannelloni|lasagne|spatzle|knopfle|tortell|ravioli|gnocchi|barilla|buitoni|miracoli|pasta|orzo|risoni|bucatini|capellini|vermicelli|paccheri|trofie|gemelli|kritharaki|maccheroni|girandole|casarecce|strozzapreti|radiatori|rotelle|ditalini|anelli|stelline|mafaldine|tagliolini", "🍝"],
    ["curry|dal\\b|masala|korma|vindaloo|tandoori|butter-chicken|palak", "🍛"], ["sushi|nori", "🍣"], ["taco", "🌮"], ["tortillas|papadam|naan|yufka", "🫓"],
    ["reis|risotto", "🍚"], ["couscous|bulgur|quinoa|hirse|polenta|griess|buchweizen|amaranth|grunkern|graupen|dinkel|weizen|gerste|roggen|emmer|einkorn|kamut|freekeh|teff|hafergrutze|tapioka|sago", "🌾"],
    ["suppe|eintopf|bruhe|bouillon|fond|topf|terrine|gulasch|soljanka|borschtsch|minestrone|labskaus|bigos|zurek|jus\\b|suppeneinlage|backerbsen", "🍲"],
    ["tomate|ketchup|passata|sugo|polpa|pelati|datterini|salca", "🍅"], ["senf|mayo|remoulade|sosse|sauce|dressing|sriracha|sambal|wurze\\b|sirup|kwas", "#sauce"],
    ["oliven|tapenade", "🫒"], ["mais", "🌽"], ["bohne|linse|kichererbse|erbse|refried|baked beans", "🫘"], ["pilz|champignon|pfifferling|truffel|shiitake|morchel", "🍄"], ["kokos", "🥥"],
    ["chili|peperoni|jalapeno|harissa|pul biber|chipotle|gochu|adschika", "🌶️"], ["paprika|ajvar|letscho", "🫑"], ["knoblauch", "🧄"], ["zwiebel", "🧅"], ["gurke|cornichon|pickle", "🥒"],
    ["kartoffel|\\brosti", "🥔"], ["knodel|klosse", "🥟"], ["ananas", "🍍"], ["pfirsich|aprikose|pflaume", "🍑"], ["kirsch|schattenmorelle", "🍒"], ["mandarine", "🍊"], ["apfel", "🍎"], ["birne", "🍐"],
    ["glas|eingelegt|pesto|aufstrich|chutney|kimchi|paste|mus\\b|mark\\b|kompott|meerrettich|sauerkraut|kraut|dip|tahini|creme|antipasti|kapern|ghee|smetana|tworog|salat(?!wurz|kerne)", "🫙"],
    ["fix\\b|binder|pulver|wurfel|panko|mehl|chips|rostzwiebeln|kit\\b|blatter|papier|glucks|kerne|wurzmischung|tute|mix\\b|flocken|zucker|hefe|fett", "#bag"]]],
  "Backen & Gewürze": ["#bag", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["backmischung", "#bag"],
    ["mandelmehl", "#almond"],
    ["kokosmehl", "🥥"],
    ["paniermehl|semmelbrosel", "#bag"],
    ["vanillezucker|vanillinzucker|backpulver|natron|trockenhefe|sahnesteif|sahnefest|tortenguss|gelatine|puddingpulver|sossenpulver|gotterspeise|paradiescreme|gelierfix|agartine|agar-agar|kaltschale|cremepulver|mousse-pulver|dessertcreme|rote-grutze-pulver|kasekuchenhilfe|pektin|einmachhilfe|zitronensaure|hirschhornsalz|pottasche", "#sachet"],
    ["^zucker$|feinster zucker|brauner zucker|zuckerhut|puderzucker|rohrzucker|hagelzucker|kandis|wurfelzucker|gelierzucker|rubenzucker|rohrohrzucker|birkenzucker|raffinade|teezucker|kluntje|muscovado|demerara|einmachzucker|invertzucker|sudzucker|bio-zucker|zuckersticks", "#sugar"],
    ["hefe", "#yeast"],
    ["mehl|griess|starke|dunst|semola", "#flour"],
    ["salz", "🧂"],
    ["pfeffer(?!minz)", "#peppermill"],
    ["getrocknet|krauter|lorbeer|oregano|basilikum|thymian|rosmarin|majoran|petersilie|dill|salbei|estragon|minze|kerbel|beifuss|schabzigerklee|bohnenkraut|liebstockel|gerebelt|schnittlauch", "#herbjar"],
    ["gewurz|curry|kurkuma|kummel|koriander|kardamom|zimt|nelken|muskat|anis|fenchel|senfkorner|wacholder|ingwer gemahlen|safran|masala|hanout|zatar|sumach|bockshorn|rub\\b|baharat|berbere|dukkah|chermoula|pumpkin|macis|tonka|galgant|amchur|asafoetida|ajowan|paprika|chili|cayenne|piment|harissa|knoblauch(pulver|granulat|flocken)|zwiebel(pulver|flocken)|vanille gemahlen|rosa beeren", "#spicejar"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["^mandel", "#almond"], ["^walnuss|^walnusse|^pekan", "#walnut"], ["^pistazie", "#pistachio"], ["^cashew", "#cashew"], ["rosinen|sultaninen|korinthen", "#raisins"],
    ["backmischung", "#bag"], ["dekorbluten|marzipanrosen", "🍬"], ["aromat", "#bag"], ["aroma", "🫙"], ["muskat", "🧂"], ["zitronengras|zitronenthymian", "🌿"], ["zitronenpfeffer|zitronensalz", "🧂"], ["formchen|tortenspitze", "🧁"], ["mokkabohnen", "🍫"],
    ["kerzen", "🕯️"], ["gotterspeise|tortenguss|gelatine", "🍮"], ["puderzucker|zitronensaure", "#bag"], ["lebensmittelfarbe|dekostifte", "🎨"], ["honig|sirup|dicksaft|goldsaft", "🍯"],
    ["kuverture|schoko|kakao|nougat|glasur|callets|cake melts", "🍫"], ["kokos", "🥥"], ["erdnuss|erdnusse", "🥜"],
    ["mandel|haselnuss|walnuss|pistazie|pekan|cashew|nuss|krokant|marzipan", "🌰"], ["zitron|orange", "🍋"], ["kirsch", "🍒"],
    ["chili|cayenne|chipotle|piment|paprika|harissa", "🌶️"], ["knoblauch", "🧄"], ["zwiebel", "🧅"],
    ["getrocknet|krauter|lorbeer|oregano|basilikum|thymian|rosmarin|majoran|petersilie|dill|salbei|estragon|minze|bluten|kerbel|beifuss|schabzigerklee|zitronengras", "🌿"],
    ["salz|pfeffer|curry|kurkuma|kummel|koriander|kardamom|zimt|nelken|muskat|anis|fenchel|senf|wacholder|ingwer|safran|gewurz|masala|hanout|zatar|sumach|bockshorn|\\brub\\b|baharat|berbere|dukkah|chermoula|pumpkin|macis|tonka|galgant|amchur|asafoetida|ajowan|namak|vanille gemahlen|beeren", "🧂"],
    ["mehl|griess|starke|kleie|dunst", "🌾"], ["streusel|perlen|zucker(blumen|herzen|augen|schrift)|dekor|nonpareilles|fondant|tortendeko|aufleger|topper", "🍬"],
    ["tortenguss|gelatine|pudding|gotterspeise|gelier|creme|mousse|kaltschale", "🍮"], ["konfiture|fullung|mark\\b|paste|aprikotur|gelee|aroma|extrakt|rosenwasser", "🫙"]]],
  "Frühstück, Kaffee & Tee": ["🫙", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["nuss-nougat|nutella|nudossi|nusspli|schokocreme|haselnusscreme", "#nutcream"],
    ["keks(?!creme)", "🍪"],
    ["kaffee|espresso|crema|cappuccino|latte\\b|nescafe|jacobs|dallmayr|lavazza|senseo|nespresso|tassimo|mokka|ristretto|cold brew(?!-tee)", "☕"],
    ["riegel|flapjack|fruchtschnitte|brotbelag", "🍫"], ["erdnussbutter|erdnussmus", "🥜"],
    ["flocken|musli|porridge|granola|cornflakes|cerealien|pops|kissen|ringe|flakes|kleie|frosties|smacks|krispies|oats|crunch|haferbrei|puffreis|gepufft|biscuits|weizenkeime|hafermark|\\bchia", "🥣"],
    ["kakao|trinkschokolade|nesquik|kaba|ovomaltine", "🍫"], ["teekanne", "🫖"], ["tee\\b|teemischung|teekapseln|earl grey|darjeeling|sencha|matcha|chai|heisse zitrone|kandis|golden-milk", "🍵"],
    ["honig", "🍯"], ["erdnuss", "🥜"],
    ["nutella|nudossi|nusspli|schoko|nougat", "🍫"],
    ["marmelade|konfiture|gelee|fruchtaufstrich|pflaumenmus|zwetschgenmus|lemon curd|mark\\b", "#jam"]]],
  "Süßes & Snacks": ["🍬", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["nussmix|nuss-frucht|studentenfutter|nussmischung|nusskernmischung", "#nutmix"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["^gummibar|^fruchtgummi|^weingummi|^gummi-|haribo", "#gummybear"], ["^cashew", "#cashew"], ["^pistazien", "#pistachio"], ["^mandeln|^rauchmandeln|gebrannte mandeln", "#almond"], ["^walnusse|^pekannusse", "#walnut"],
    ["^schokolade|schokokringel|nougatstangen|geleeringe|schoko-sticks", "🍫"], ["mini-muffins|mini-brownies", "🍪"], ["pom-bar|kracker|puffmais", "#chips"], ["nusskernmischung", "🌰"], ["butterringe", "🍪"],
    ["popcorn", "🍿"], ["lutscher|zuckerstange|schleckmuschel", "🍭"], ["salzstangen|brezel|laugen", "🥨"],
    ["keks|cookie|waffel|biskuit|spekulatius|lebkuchen|pfeffernusse|pfefferkuchen|zimtsterne|kipferl|printen|baumkuchen|amarettini|cantuccini|shortbread|soft cake|kuchen|russisch brot|geback|milchschnitte|prinzenrolle|oreo|pick up|makronen|filinchen|knacke|hanuta|knoppers|platzchen|heidesand|hippen|engelsaugen|husarenkrapfen|spitzbuben|barentatzen|magenbrot|fruchtebrot|stollen", "🍪"],
    ["erdnuss|erdnusse", "🥜"], ["cashew|pistazie|mandeln|macadamia|nussmix|nuss-frucht|studentenfutter|pekannusse|walnusse|kerne|wasabi-nusse", "🌰"],
    ["cracker|reisgeback|reis-chips", "🍘"], ["saure |fruchtgummi|weingummi|lakritz|gummibar", "🍬"], ["wasabi-erbsen|chips|flips|nachos|sticks|stangen|ringe|ballchen|knabber|party-mix|snack|pringles|erdnusslocken|nicnac|grissini|kichererbsen|edamame|mais geroste", "#chips"],
    ["jerky|biltong|trockenfleisch|salami", "🥩"],
    ["schoko|praline|marzipan|nougat|riegel|mozartkugel|domino|advent|milka|ritter sport|kinder |duplo|toffifee|merci|ferrero|raffaello|mon cheri|lindt|after eight|snickers|\\bmars\\b|twix|bounty|milky way|kitkat|\\blion\\b|m&m|smarties|halloren|knusperflocken|bambina|minztafelchen|uberraschungsei|weinbrandbohnen|rumkugeln|krokant|ostereier|-eier", "🍫"]]],
  "Getränke": ["🥤", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["mineralwasser|^wasser|tafelwasser|quellwasser|heilwasser|sodawasser|sprudel|wasser kiste|gerolsteiner|volvic|vittel|evian|apollinaris|\\bvio\\b|lichtenauer|margon|brambacher|oppacher|sportwasser|vitaminwasser|near water", "#waterbottle"],
    ["^(?!.*(sekt|sirup)).*(rose\\b|rosewein|weissherbst|rotling)", "#rosewine"],
    ["weisswein|riesling|silvaner|grauburgunder|weissburgunder|chardonnay|sauvignon blanc|pinot grigio|muller-thurgau|gewurztraminer|veltliner|scheurebe|kerner|bacchus|gutedel|rivaner|elbling|muskateller|verdejo|albarino|vinho verde|soave|lugana|vermentino|chablis|sancerre|goldriesling|gluhwein weiss|wermut weiss|kochwein weiss|lambrusco weiss|blanc de", "#whitewine"],
    ["schorle", "#spritzer"],
    ["^cola(?!bier)|coca-cola|pepsi|fritz-kola|vita cola|mezzo mix|spezi", "#cola"],
    ["limonade|\\blimo\\b|orangenlimo|zitronenlimo|fanta|sprite|brause|bionade|almdudler|krauterlimo", "#lemonade"],
    ["traubensaft weiss", "#juiceapple"],
    ["(kirsch|johannisbeer|trauben|cranberry|granatapfel|holunder|heidelbeer|aronia|preiselbeer|rote-bete|tomaten|pflaumen|erdbeer|mehrfrucht).*(saft|nektar)|rotbackchen", "#juicered"],
    ["(apfel|birnen|quitten|rhabarber|limetten|zitronen|sellerie|ingwer).*(saft|nektar)", "#juiceapple"],
    ["(orangen|multivitamin|ananas|grapefruit|mango|maracuja|pfirsich|mandarinen|bananen|karotten|sanddorn|tropic|ace-|fruhstucks|guaven|litschi).*(saft|nektar)|hohes c|valensina|granini|punica", "#juiceorange"],
    ["zwickl|karamalz|malzgetrank|cidre", "🍺"], ["federroter", "🍷"], ["sprizz", "🍹"], ["robby bubble", "🍾"], ["pfeffi|goldkrone|feigling", "🥃"],
    ["ginger ale|ginger beer|bitter lemon|wassermelone", "🥤"], ["kirschwasser|zwetschgenwasser|pastis", "🥃"], ["amarone", "🍷"],
    ["(^|[\\s-])mate", "🧉"], ["wasser|gerolsteiner|volvic|vittel|evian|apollinaris|\\bvio\\b|lichtenauer|margon|brambacher|oppacher", "💧"],
    ["saft|nektar|smoothie|trinkpackchen|shot\\b|hohes c|granini|punica|valensina|rotbackchen|capri|sirup", "🧃"],
    ["kaffee|cappuccino|latte|espresso-drink", "☕"], ["milch|kakao-drink|protein-drink|trinkmahlzeit", "🥛"],
    ["bier|\\b(pils|helles|export|lager|ipa|radler|marzen|gose|kolsch|cider|stout|porter|tripel|kriek|russ)\\b|\\bale\\b|weizen(?!korn)|bock\\b|berliner weisse|malztrunk|partyfass|radeberger|wernesgruner|kostritzer|krostitzer|sternburg|freiberger|feldschlosschen|beck's|krombacher|bitburger|warsteiner|veltins|erdinger|paulaner|franziskaner|augustiner|jever|flensburger|hasseroder", "🍺"],
    ["cocktail|mojito|caipirinha|colada|spritz|aperol|hugo|sangria|bowle|punsch|aperitif", "🍹"],
    ["sekt|secco|prosecco|champagner|\\bcava\\b|cremant|piccolo|frizzante|spumante|asti", "🍾"],
    ["\\bgin\\b|wodka|\\brum\\b|whisk|tequila|mezcal|pisco|likor|schnaps|korn\\b|brand\\b|geist\\b|obstler|grappa|ouzo|raki|aquavit|amaretto|sambuca|absinth|cachaca|curacao|triple sec|maraschino|barenfang|bitter|fernet|amaro|pastis|genever|cognac|armagnac|calvados|brandy|bourbon|scotch|limoncello|jagermeister|baileys|ramazzotti|berentzen|angostura|spirituose|saurer apfel|rumtopf|kirschwasser|zwetschgenwasser|williamsbirne", "🥃"],
    ["wein|riesling|thurgau|silvaner|burgunder|chardonnay|sauvignon|pinot|traminer|dornfelder|merlot|shiraz|tempranillo|rioja|chianti|primitivo|montepulciano|bordeaux|lambrusco|sherry|wermut|federweisser|veltliner|zweigelt|blaufrankisch|lemberger|trollinger|portugieser|regent|malbec|syrah|zinfandel|sangiovese|barolo|barbera|valpolicella|amarone|avola|rhone|beaujolais|chablis|sancerre|elbling|kerner|bacchus|scheurebe|gutedel|rivaner|muskateller|verdejo|albarino|vinho|soave|lugana|vermentino|rose\\b|weissherbst|rotling|blanc de|spatlese|auslese|kabinett|madeira|marsala|retsina|jagertee|met\\b|sake", "🍷"]]],
  "Drogerie & Gesundheit": ["🧴", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["haarfarbe|tonung|blondierung|strahnchen|henna|aufheller|ansatzpuder", "#hairdye"],
    ["haarspray|haarlack|hitzeschutz|trockenshampoo|ansatzspray|stylingspray|salzspray|fixierspray", "#hairspray"],
    ["schaumfestiger|haarschaum|lockenschaum|duschschaum|reinigungsschaum", "#mousse"],
    ["haargel|haarwachs|pomade|styling-paste|styling-creme|stylinggel|haarcreme|lockencreme|glattungscreme|haarpuder|haarkreide|haarkur|haarmaske", "#hairgel"],
    ["deo-roll|deo-stick|deo-kristall|deo fest|deo-creme|antitranspirant|blasenstick", "#deoroll"],
    ["(^|[\\s-])deo(?!-tucher)|fussdeo|bodyspray|korperspray|fussspray|rexona|thermalwasser", "#spraycan"],
    ["shampoo|(^|[^d])spulung|conditioner|head & shoulders|pantene|schauma|elvital|guhl", "#shampoo"],
    ["duschgel|duschcreme|duschol|duschbad|feste dusche|duschpeeling|duschdas|palmolive|dove|waschgel|waschlotion", "#showergel"],
    ["lippenpflege|lippenbalsam|labello|lippenol|lippenpeeling", "#lipbalm"],
    ["gesichtsmaske|tuchmaske|tonerde-maske|feuchtigkeitsmaske|peel-off|nasenstrips|pickel-patches", "#facemask"],
    ["nasenspray|halsspray|mundspray|ohrenspray|nasendusche", "#nasalspray"],
    ["hustensaft|fiebersaft|hustenloser|hustenstiller|erkaltungsgetrank|gurgellosung|franzbranntwein|erkaltungssaft|eisen saft", "#syrup"],
    ["desinfektion", "#disinfect"],
    ["serum|haarol|gesichtsol|korperol|massageol|mandelol|nachtkerzenol|haarspitzenfluid|haartonic|haarwasser|tropfen", "#dropper"],
    ["parfum|eau de|duftset|aftershave", "#perfume"],
    ["tagescreme|nachtcreme|hautcreme|allzweckcreme|gesichtscreme|augencreme|korperbutter|feuchtigkeitscreme|anti-falten|nivea creme|florena|sheabutter|vaseline|melkfett|hirschtalg|korpercreme|^creme$", "#creamjar"],
    ["handcreme|fusscreme|fussbalsam|haftcreme|venencreme|panthenol|bepanthen", "#creamtube"],
    ["salbe|schmerzgel|wundgel|brandgel|juckreiz|kortison|neurodermitis|lippenherpes-creme|fusspilzcreme|arnika-gel|aphthen|erkaltungsbalsam|muskelbalsam|aloe-vera-gel|latschenkiefer|anti-pickel", "#ointment"],
    ["heisse-zitrone-pulver|gerstengras-pulver|nasenspulsalz|inhaliersalz|wundpuder|fusspuder|haftpulver|vitamin-c-pulver|kollagenpulver|elektrolyt-pulver", "#sachet"],
    ["wachsstreifen|warmwachs|zuckerpaste", "🪒"],
    ["durex", "#condom"],
    ["always", "🩸"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["zahnpasta|zahncreme|zahngel", "#toothpaste"], ["taschentucher", "#tissues"], ["wattestabchen", "#cottonswab"], ["wattepads|wattebausche|wattebällchen|^watte", "#cottonpad"], ["fohn(?!spray)|glatteisen|lockenstab|warmluftburste", "#hairdryer"], ["kamm\\b|haarburste|rundburste|paddle|entwirrburste", "🪮"],
    ["kondom", "#condom"], ["ohrenstopsel", "#earplug"], ["inhalator|inhalierstift", "#inhaler"], ["kosmetiktucher|abschminktucher", "🧻"], ["salbe|serum", "🧴"], ["glatteisen|haarturban", "🎀"], ["binden|slipeinlagen|tampon|menstruation|perioden", "🩸"], ["trimmer", "🪒"], ["feuchtes toilettenpapier|feuchte waschlappen", "🧻"], ["leukoplast", "🩹"], ["dragees", "💊"], ["kulturtasche", "👝"], ["abdeckstift|puderpinsel", "💄"], ["handschuhe", "🧤"], ["inkontinenz|bettschutz", "🧻"], ["mundschutz|ffp2", "😷"], ["pinzette|hornhaut|bimsstein|zehentrenner", "💅"], ["duschhaube", "🚿"],
    ["zahn|aufsteckburste|interdental|mundspulung|mundwasser|munddusche|zungenreiniger|colgate|odol|elmex|aronal|blend-a-med|sensodyne|oral-b|listerine", "🪥"],
    ["rasier|bart|epilier|scherkopf|haarschneider|gillette|wilkinson", "🪒"], ["nagellack|nagel|feile|manikure|unterlack|uberlack", "💅"],
    ["lippenstift|lipgloss|lipliner|mascara|eyeliner|kajal|lidschatten|make-up|foundation|concealer|rouge|\\bpuder\\b|kompaktpuder|loser puder|bronzer|highlighter|primer|wimpern|augenbrauen|kosmetik|schmink|bb-cream|cc-cream", "💄"],
    ["spiegel", "🪞"], ["lesebrille|brille|kontaktlinse", "👓"], ["schwamm|luffa", "🧽"], ["seife", "🧼"], ["badeol|badeperlen|badebombe|badetee|badesalz|schaumbad|badezusatz|fussbad|erkaltungsbad|badekugeln", "🛁"],
    ["pflaster|verband|binde\\b|mullbinde|kompresse|tape|hansaplast|wundauflage|dreiecktuch|erste-hilfe|rettungsdecke", "🩹"], ["thermometer", "🌡️"], ["blutdruck|pulsoximeter", "🩺"], ["\\btest|schnelltest|teststreifen|ovulationstest|schwangerschaftstest", "🧪"],
    ["tablette|vitamin|magnesium|calcium|\\bzink|eisen|kapseln|baldrian|hustensaft|tropfen|elektrolyt|bonbons|pastillen|ibuprofen|paracetamol|zapfchen|mittel\\b|probiotika|biotin|selen|jod|kalium|kieselerde|kollagen|coenzym|omega|lebertran|algenol|spirulina|chlorella|maca|ashwagandha|ginseng|melatonin|mariendistel|folsaure|heilerde|traubenzucker", "💊"],
    ["taschentucher|tucher|watte|pads\\b|tempo", "🧻"], ["whey|casein|kreatin|bcaa|protein|shake|iso-pulver|energy-gel|sportriegel", "🥤"],
    ["warmflasche|warmekissen|heizkissen|kirschkernkissen|warme", "🔥"], ["kuhl|kalte|eisspray", "🧊"], ["mucke|insekt|zecke|lause", "🦟"], ["sonnen|after sun|after-sun", "☀️"],
    ["kamm|burste|haarband|haarreif|haarspange|haarnadel|haargummi|haarklammer|scrunchie|lockenwickler|haarnetz|duttkissen|haarschere|fohn|glatteisen|lockenstab", "🎀"],
    ["parfum|eau de|duftset", "🌸"], ["kulturbeutel|kosmetiktasche", "👝"], ["waage", "⚖️"]]],
  "Haushalt & Putzen": ["📦", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["zahnstocher|schaschlikspiesse|cocktailspiesse|cocktailpicker|rouladennadeln", "#skewers"],
    ["fusselrolle|fusselrasierer", "#lintroller"],
    ["fensterabzieher|duschabzieher|glaskeramik-schaber|ceranfeldschaber", "#squeegee"],
    ["aufbewahrungsbox|stapelbox|unterbettkommode|schubladeneinteiler|brotkasten|butterdose", "#storagebox"],
    ["wasserfilter", "#waterfilter"],
    ["staubsauger(?!beutel|filter|-deo)|handstaubsauger|akkusauger|saugroboter", "#vacuum"],
    ["mullbeutel|mullsacke|gelbe sacke|gelber sack|restmullsacke|schwerlastsacke|biomullbeutel|abfallsacke", "#trashbag"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["pumpel|saugglocke", "🪠"],
    ["geschirrspul|regeneriersalz|abflussfrei|urinsteinloser|glasschutz|kalkloser", "#detergent"], ["topfreiniger", "🧽"], ["fusselburste|kehrgarnitur", "🧹"], ["gelber sack", "🗑️"], ["mausekoder", "🪤"], ["lederfett", "👞"], ["kuchentucher|haushaltstucher", "🧻"],
    ["kohlenmonoxid", "🔔"], ["tischfeuerwerk", "🎉"], ["lampenol", "🔥"], ["kuhlakku", "🧊"], ["schneebesen|fleischklopfer|presse|stampfer|dosenoffner|eierschneider|nudelholz|pizzaschneider|portionierer|apfelteiler|entkerner|backpinsel|kuchenzange|trichter|wetzstahl", "🥄"], ["schuhloffel", "👞"], ["einmach|schraubglaser|vorratsglaser|gewurzglaser", "🫙"], ["spulmaschinen", "#detergent"], ["insektenspray|wespenspray", "🪰"], ["spray|glasreiniger|badreiniger|kuchenreiniger|allzweckreiniger|kalkreiniger|schimmelentferner|fleckenentferner|fettloser", "#spray"], ["spulburste|fugenburste|handburste|kleiderburste|scheuerburste", "🧹"], ["kaffeefilter|handfilter", "☕"], ["teefilter|tee-ei|teesieb", "🫖"], ["entsafter|zerkleinerer|bereiter|vakuumierer|allesschneider|luftbefeuchter|dampfglatter|wassersprudler", "🔌"],
    ["toilettenpapier|kuchenrolle|servietten|papierhandtucher|zewa|hakle", "🧻"], ["schwamm|schwamme|scheuerschwamm|schmutzradierer|stahlwolle", "🧽"],
    ["besen|handfeger|kehrschaufel|schrubber|wischmopp|wischer|staubwedel", "🧹"], ["eimer", "🪣"], ["mull|sacke", "🗑️"], ["waschekorb|waschesammler|korb", "🧺"],
    ["batterie|knopfzelle|akku(?!sauger)|powerbank", "🔋"], ["taschenlampe|stirnlampe|campinglampe", "🔦"], ["gluhbirne|lampe|leuchtstoff|leuchtmittel|led-|lichterkette|nachtlicht|laterne|windlicht", "💡"],
    ["kerze|teelicht|grablicht|duftlampe", "🕯️"], ["feuerloscher|loschdecke", "🧯"],
    ["grillzange|grillbesteck", "🍴"], ["grill|anzund|kohle|brikett|brenn|kamin|feuer|streichholz|zundholz|gaskartusche|fackel|lampenol|raucher", "🔥"],
    ["geschenk", "🎁"], ["luftballon", "🎈"], ["party|girlande|konfetti|luftschlangen|troten|knallbonbon|papierhute|tischfeuerwerk|tortenfontane", "🎉"],
    ["handy|display", "📱"], ["kopfhorer", "🎧"], ["kabel|stecker|steckdose|netzteil|usb|hdmi|ladegerat", "🔌"],
    ["pfanne|wok\\b", "🍳"], ["kochtopf|topfset|schnellkochtopf|milchtopf|kasserolle|brater|auflaufform|dampfgar|slow cooker|fondue|raclette", "🥘"],
    ["teekanne|kanne|french press|espressokocher|wasserkocher|wasserkessel", "🫖"], ["tasse|kaffeebecher|thermobecher|espressotassen", "☕"], ["essstabchen", "🥢"],
    ["weinglaser|korkenzieher|weinverschluss", "🍷"], ["sektglaser", "🥂"], ["bierglaser|flaschenoffner", "🍺"], ["glaser|karaffe|krug|trinkflasche|thermoskanne|trinkhalme|strohhalme|becher", "🥤"],
    ["einmach|schraubglaser|vorratsglaser|gewurzglaser|vorratsdosen|frischhaltedosen|gefrierdosen|behalter|lunchbox|meal-prep", "🫙"],
    ["teller|geschirr|tablett|servierplatte|untertasse", "🍽️"], ["messer|schneidebrett|schaler|hobel|reibe", "🔪"], ["loffel|kelle|schneebesen|pfannenwender|teigschaber", "🥄"], ["besteck|gabel", "🍴"],
    ["schussel|schale|sieb|salatschleuder|messbecher", "🥣"], ["eiswurfel|kuhltasche|kuhlakku|eiskugel", "🧊"], ["salz- und pfeffer|muhle|morser|gewurzregal", "🧂"],
    ["kuchenform|springform|kastenform|gugelhupf|muffinform|tarteform|backblech|ausstech|tortenring|spritzbeutel|tortenplatte|tortenhaube|backmatte", "🧁"],
    ["wecker|wanduhr|eieruhr|timer", "⏰"], ["bilderrahmen|fotoalbum", "🖼️"], ["vase", "🏺"], ["thermometer|hygrometer", "🌡️"], ["waage", "⚖️"], ["mausefalle", "🪤"],
    ["dusch|badvorleger", "🚿"], ["wc-|\\bklo|toiletten|pumpel", "🚽"], ["handschuh|topflappen", "🧤"], ["schuh", "👞"], ["kleiderbugel|hosenbugel|kleidersack|bugel|wasche|textil", "👕"], ["schere", "✂️"],
    ["insekt|fliegen|ameisen|motten|wespen|mucken|silberfisch|schaben", "🪰"], ["folie|backpapier|butterbrotpapier|bratschlauch", "#roll"], ["beutel", "#zipbag"], ["tuch\\b|tucher|lappen", "🧽"],
    ["seife", "🧼"], ["mittel|spuler|reiniger|entferner|spray|politur|pflege|entkalker|scheuer|soda|starke|bleich|erfrischer|fleck|schimmel|persil|ariel|spee|weisser riese|lenor|perwoll|pril|fairy|frosch|ajax|meister proper|domestos|bref|cillit|viss|sagrotan|vanish|febreze|tabs|duft|pods|klarspuler", "#detergent"],
    ["maschine|mixer|ruhrgerat|kocher|maker|waffeleisen|fritteuse|mikrowelle|backofen|kochplatte|automat|toaster|sauger|saugroboter|dampfreiniger", "🔌"]]],
  "Baby & Kind": ["🍼", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["schnuller", "#pacifier"],
    ["anfangsmilch|folgemilch|kindermilch|ha-nahrung|-nahrung|milchnahrung|aptamil|milupa|babynahrung|reisschleim|haferschleim", "#formula"],
    ["babywasser", "#waterbottle"],
    ["bettschutz", "#diaper"], ["fiebersaft|zapfchen|zahnungs|entschaumer|vitamin|kochsalz", "💊"], ["thermometer", "🌡️"], ["zahnburste|zahnpasta", "🪥"], ["schere", "✂️"], ["kinder-nudeln", "🍝"], ["tomatensosse|ketchup", "🍅"], ["kinderwurst", "#sausage"], ["pudding", "🍮"], ["fruchtpuree|obstmus", "🫙"], ["fruchtgummi", "🍬"], ["maisflips|zwieback", "🍪"], ["body\\b|schlafanzug|sockchen|strumpfhose|krabbelschuhe|sonnenhut|kratzhandschuhe|halstuch", "👶"], ["sonnenbrille", "🕶️"], ["rucksack|kindergartentasche", "🎒"], ["topfchen|toilettensitz", "🚽"], ["badewanne", "🛁"], ["(^|[^l])buch\\b|malblock", "📚"], ["spieluhr|mobile|greifling|rassel|stapelbecher|badeente|kuschel|schmusetuch|hupfball|wasserball|springseil|schwimm(?!windel)|wasserbomben|sand|horspiel|spiel\\b|quartett", "🧸"], ["loffel", "🍴"], ["kinderteller|geschirr", "🍽️"], ["kinderbecher|trinkbecher", "🥤"], ["wundschutzspray|salbe|pflege|sonnenmilch|bauchleinol|schwangerschaftsol", "🧴"],
    ["windel|pants|wickel|pampers", "#diaper"], ["glaschen|quetschie|alete|bebivita", "🫙"], ["brei|flocken|musli", "🥣"], ["keks|stangen|kringel|waffel|riegel", "🍪"],
    ["malbuch|kreide|farben|knete", "🖍️"], ["puzzle", "🧩"], ["sticker|sammelkarten|zeitschrift", "📰"], ["seifenblasen", "🫧"], ["sandspielzeug|spielzeug|beissring", "🧸"],
    ["creme|lotion|shampoo|babyol|babybad|waschgel|puder|bubchen|penaten|sonnencreme", "🧴"], ["feuchttucher|tucher|mullwindeln", "🧻"], ["besteck", "🍴"], ["brotdose", "🍱"], ["trinkflasche|trinklern", "🥤"],
    ["saft", "🧃"], ["tee", "🍵"], ["latzchen", "👶"]]],
  "Tierbedarf": ["🐾", [
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["papagei|sittich", "🦜"], ["eichhornchen", "🐿️"],
    ["kratzbaum|kratzbrett|kratzmatte", "🐱"], ["welpen", "🐶"], ["futterglocke|erdnussnetz|sepiaschale", "🐦"], ["mause|ratten|chinchilla|degu|knabberholz", "🐹"], ["legekorn|kuken", "🐔"], ["hufkratzer", "🐴"],
    ["pferd", "🐴"],
    ["katze|kitten|whiskas|felix|sheba|kitekat|catsan", "🐱"], ["knochen|kau|ochsenziemer|schweineohren", "🦴"], ["hund|pedigree|frolic|cesar|chappi|leckerli|trainingssnacks", "🐶"],
    ["wellensittich|kanarien|papagei|vogel|meise|kolbenhirse|streufutter|fettfutter", "🐦"], ["fisch|teich|aquarium|filterwatte", "🐟"], ["kaninchen", "🐰"],
    ["hamster|nager|meerschwein|kleintier|heu|stroh|einstreu|salzleckstein", "🐹"], ["huhner|legemehl", "🐔"], ["pferd", "🐴"], ["igel", "🦔"], ["schildkrote", "🐢"], ["zecke|floh", "🦟"]]],
  "Kleidung & Textilien": ["👕", [
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["handtuch|handtucher|duschtuch|badetuch|saunatuch|strandtuch|waschlappen|waschhandschuh", "#towel"], ["warnweste", "🦺"],
    ["slip\\b", "🩲"], ["badelatschen", "🩴"], ["huttenschuhe", "🥿"], ["schlafanzug|teppich", "👕"], ["zackenschere", "✂️"], ["einkaufskorb", "🧺"], ["stoffbeutel|jutebeutel", "🛍️"], ["uhr", "⌚"],
    ["wachstuch|tischdecke", "🍽️"], ["sockenwolle", "🧶"], ["stoffschere", "✂️"],
    ["handtuch|handtucher|duschtuch|badetuch|saunatuch|strandtuch|waschlappen|waschhandschuh|badematte|vorleger|duschmatte", "🛁"], ["strickjacke", "🧥"],
    ["socken|strumpf|strumpfe|fusslinge", "🧦"], ["handschuh|faustlinge", "🧤"], ["schal\\b|halstuch|tuch\\b", "🧣"], ["sonnenhut|strohhut|fischerhut", "👒"], ["mutze|cap\\b|stirnband|ohrenschutzer", "🧢"],
    ["gummistiefel|stiefel|wanderschuhe", "🥾"], ["sandalen|flip-flops|badeschuhe", "🩴"], ["pantoffel|clogs|hausschuhe", "🥿"], ["schuh|sneaker|sohlen|schnursenkel|fersenkissen", "👟"],
    ["rucksack|ranzen|turnbeutel", "🎒"], ["koffer|reisetasche", "🧳"], ["geldborse", "👛"], ["tasche\\b", "👜"], ["sonnenbrille", "🕶️"], ["schirm", "☂️"],
    ["bikini", "👙"], ["badeanzug", "🩱"], ["badehose|shorts|kurze hose|radlerhose|boxershorts", "🩳"], ["slips|panty|hipster|unterhose|string|bh\\b|bustier", "🩲"],
    ["bett|kissen|decke|laken|matratze|molton|steppbett|nasseschutz", "🛏️"], ["vorhang|gardine", "🪟"],
    ["gummiband|gummilitze|kordel|schragband|saumband|flicken|bugelbilder|vlies|stoff\\b|stoff meterware|filz\\b|bastelfilz|fullwatte|etiketten|garn|naht|nah|faden|fingerhut|einfadler|schneider|stopf|stick", "🧵"], ["wolle|strick|hakel|nadelspiel", "🧶"], ["nadel", "🪡"], ["knopf|knopfe|sicherheits|reissverschluss|klett|haken und", "🧷"],
    ["kleid|rock\\b|nachthemd", "👗"], ["hose|jeans|leggings|chino", "👖"], ["hemd|bluse|krawatte|fliege|einstecktuch", "👔"], ["jacke|mantel|weste|anzug|poncho|kittel|overall", "🧥"],
    ["tischdecke|laufer|servietten|wachstuch|tischset", "🍽️"]]],
  "Baumarkt & Werkzeug": ["🧰", [
    /* Alltagsartikel, Farbvarianten und aufgeteilte Sammelmotive */
    ["bohrmaschine|bohrhammer|akkuschrauber|akku-bohrschrauber", "#drill"],
    ["bohrer|senker|bohrkrone", "#drillbit"],
    ["schleifpapier|schleifvlies|schleifschwamm|schleifklotz|schleifband|schleifbrett", "#sandpaper"],
    ["schleifer|oberfrase|elektrohobel|^multitool", "#sander"],
    ["trennscheibe|schruppscheibe|facherscheibe|schleifscheiben|kreissageblatt", "#disc"],
    ["spachtelmasse|fertigspachtel|fullspachtel|feinspachtel|reparaturspachtel|flachenspachtel|moltofill|fugenfuller|gipsspachtel|fugenweiss", "#tub"],
    ["spachtel|glattkelle|maurerkelle|fugenkelle", "#spatula"],
    ["cuttermesser|teppichmesser|tapetenmesser|ersatzklingen|fugenmesser", "#cutter"],
    ["zwinge|schraubstock", "#clamp"],
    ["zange|seitenschneider", "#pliers"],
    ["feile|raspel", "#file"],
    ["abdeckfolie|malerfolie|malervlies|abdeckplane|gewebeplane|baufolie|dampfbremsfolie|abdeckpapier|abdeckvlies|dampfsperre", "#tarp"],
    ["tapete(?!n)|raufaser", "#wallpaper"],
    ["vinylboden|klick-vinyl|teppichboden|pvc-boden|laminat|parkett(?!lack|pflege)", "#flooring"],
    ["dammwolle|styropor(?!kleber)|styrodur|trittschalldammung|rohrisolierung", "#insulation"],
    ["multimeter|spannungsprufer|phasenprufer|leitungssucher", "#multimeter"],
    ["werkstattsauger|nass-trockensauger", "#vacuum"],
    ["luftpumpe|kompressor|fahrradpumpe", "#airpump"],
    ["heissklebe", "#gluegun"],
    ["overall", "🥼"],
    ["radzierblenden|lenkradbezug|kennzeichenhalter|parkscheibe|feinstaubplakette|scheibenabdeckung", "🚗"],
    ["fahrrad-multitool|trinkflaschenhalter|schutzblech|stutzrader|flickzeug", "🚲"],
    ["farbwanne|abstreifgitter|farbruhrer|flachenstreicher|teleskopstange|tapezierburste", "🖌️"],
    ["werkzeug-akku", "🔋"],
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["spruh", "🎨"], ["silikon(?!spray|entferner)|acryl|bauschaum|brunnenschaum|dichtmasse|fugenmasse|kartusche", "#cartridge"], ["pinsel", "🖌️"], ["(^|[^f])kleber|leim\\b|holzleim|kleister", "#glue"], ["wandfarbe|deckenfarbe|fassadenfarbe|abtonfarbe|lack(?!ier|stift|reiniger|politur|entferner)|lasur|grundierung|tiefengrund|haftgrund|sperrgrund|bodenfarbe|betonfarbe|volltonfarbe|latexfarbe|silikatfarbe|kalkfarbe|schimmelfarbe|isolierfarbe|tafelfarbe|rostschutzfarbe|wetterschutzfarbe|vorstreichfarbe|kreidefarbe", "#paintcan"], ["isolierband|gewebeband|malerkrepp|panzertape|klebeband|abdeckband|malerband|montageband|teflonband|kreppband|warnband|absperrband|fugenband|dichtband|dichtungsband", "#tape"], ["wasserhahn|armatur|kugelhahn", "🚰"], ["motorol|getriebeol|kettenol|kriechol", "🛢️"], ["kies|splitt|quarzsand|pflastersteine", "🪨"], ["warnweste", "🦺"],
    ["fugenkratzer", "🧰"], ["lochband|klavierband|gipskartonschrauben|porenbetondubel", "🔩"], ["hammerschlaglack", "🎨"], ["andruckroller", "🖌️"], ["gehwegplatte", "🧱"], ["schlusselrohling", "🔑"],
    ["spanplattenschrauben|holzschrauben|schlossschrauben|sicherungsmutter|schraubensicherung", "🔩"], ["schlosserhammer", "🔨"], ["heizstrahler", "🔥"], ["ventilator", "🌬️"], ["maske|gehorschutz", "⛑️"], ["tapete|tapezier|winkelschleifer|trennscheiben|schruppscheiben|facherscheiben|schleifscheiben|multitool", "🧰"], ["rostloser", "🧴"], ["sicherungsautomat", "🔌"], ["absenkautomatik", "🚽"], ["bremsflussigkeit", "🚗"],
    ["fahrrad|sattel|pedale|lenker|gepacktrager|reflektor|rucklicht|bremszug|schaltzug", "🚲"], ["reifen", "🛞"], ["motorol|getriebeol|benzin|adblue", "⛽"],
    ["auto|motor|scheibenwisch|scheibenenteiser|scheibenfrost|scheibenreiniger|kuhl|felgen|wischer|eiskratzer|duftbaum|enteiser|wagenheber|radkreuz|starthilfe|abschlepp|warndreieck|zundkerzen|h7|h4|sitzbezuge|kofferraum|schneeketten|bremsen|cockpit|lackstift|kratzer", "🚗"],
    ["schlusselkasten|schlusseltresor|schlusselanhanger", "🔑"], ["schloss|riegel|zylinder|turkette|turspion|tresor", "🔒"], ["leuchte|strahler|lampe|led-panel|fassung", "💡"], ["batterie", "🔋"],
    ["schraubendreher|torx|inbus|\\bbits?\\b|bit-|bithalter|akkuschrauber", "🪛"], ["schlussel|zange|ratsche|schraubstock|zwinge|rohr|siphon|fitting|ventil", "🔧"],
    ["sage", "🪚"], ["hammer|faustel|meissel|stechbeitel|brecheisen|nageleisen", "🔨"], ["(^|[^g])leiter|tritt(?!schall)|arbeitsbock", "🪜"],
    ["steckdose|schalter|kabel|stecker|kupplung|dimmer|klemmen|sicherung|dose\\b|melder|trafo|aderend|schrumpf|litze", "🔌"], ["magnet", "🧲"],
    ["wc-|spulkasten", "🚽"], ["badewanne", "🛁"], ["hahn|armatur|dusch|brause|perlator|strahlregler|thermostat|boiler|erhitzer|waschbecken|schlauch", "🚿"],
    ["massband|bandmass|zollstock|wasserwaage|messschieber|entfernungsmesser", "📏"], ["winkel\\b|anschlagwinkel", "📐"],
    ["walze|nahtroller|farbroller|lackierroller|malerroller|farbrolle|pinsel|quast", "🖌️"], ["farbeimer|baueimer|mortelkubel", "🪣"], ["farbe|lack|lasur|grundierung|beize|abtonpaste|spruh", "🎨"],
    ["ziegel|stein|beton|zement|mortel|putz|gips|fliesen|kies|splitt|sand|kalk|estrich", "🧱"], ["holz|latten|leisten|platte|brett|diele|laminat|parkett|sperrholz|hobelware|pfosten|paneele|stab\\b", "🪵"],
    ["fenster|rollo|plissee|jalousie|gardinen|fliegengitter", "🪟"], ["\\btur|haustur|zimmertur", "🚪"], ["ketten|stahlseil|seil|gurt|karabiner|schakel", "⛓️"], ["haken", "🪝"],
    ["schraube|dubel|nagel|nieten|mutter|scheiben\\b|splinte|krampen|stifte|anker|ose|schelle|verbinder|scharnier|winkel|federringe|gewindestangen", "🔩"],
    ["heiz|heissluft|\\blot", "🔥"], ["ventilator|klima", "🌬️"], ["helm", "⛑️"], ["handschuhe", "🧤"], ["schutzbrille", "🥽"], ["stiefel|sicherheitsschuhe|arbeitsschuhe", "🥾"],
    ["spiegel", "🪞"], ["regal|mobel|stuhl", "🪑"], ["klingel", "🔔"], ["briefkasten", "📫"], ["karre|roller", "🛒"],
    ["kleber|leim|silikon|acryl|kleister|dicht|schaum|harz|ol\\b|wachs|verdunnung|spiritus|aceton|reiniger|spray|fett|paste|pflege|politur", "🧴"], ["band\\b|tape|krepp", "🩹"]]],
  "Garten & Pflanzen": ["🪴", [
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["giesskanne", "#wateringcan"], ["spaten|schaufel|grabegabel|mistgabel", "🪏"], ["axt|beil\\b|spalt", "🪓"], ["thuja|konifere", "🌲"], ["seerose", "🪷"], ["hyazinthe|lavendel", "🪻"], ["springbrunnen", "⛲"], ["pavillon|partyzelt", "⛺"], ["rutsche", "🛝"], ["eichhornchen", "🐿️"], ["fledermaus", "🦇"], ["schmetterling", "🦋"], ["marienkafer", "🐞"],
    ["heidelbeerstrauch", "🌳"], ["sandkasten|mehltau|rasenrechen|rasenlufter", "🪴"], ["streugranulat", "❄️"], ["gasregler|gasschlauch|holzkohle|anzundholz|holzpellets|braunkohle|campingkocher|raucherbox|ollampe", "🔥"], ["lichtschlauch", "💡"], ["tagetes(?!-)|vergissmeinnicht|bellis|ranunkel|margerite|mannertreu|zauberglockchen|lieschen|erika|gerbera|lilien|schleierkraut|flieder|forsythie|clematis|schneeglockchen", "🌷"], ["kirschlorbeer|thuja|liguster|hainbuche|saulenobst|weinrebe", "🌳"], ["nordmanntanne", "🎄"], ["hangesessel|hollywoodschaukel|strandkorb|lounge|balkonset|festzeltgarnitur", "🪑"], ["futterhaus|meisenknodelhalter", "🐦"],
    ["schere", "✂️"], ["rasenmaher|rasentrimmer|rasenkante", "🪴"],
    ["grill|feuer|fackel|gasflasche", "🔥"], ["sonnenschirm|sonnensegel", "⛱️"], ["stuhl|bank|liege|tisch|hangematte", "🪑"],
    ["giess|schlauch|brause|sprenger|bewasser|regentonne|hahnanschluss|pool|planschbecken|teich", "💧"],
    ["erde\\b|dunger|kalk|sand|mulch|kompost|blaukorn|mehl|spane|granulat|blahton|perlite|sack", "#soil"],
    ["weihnachtsbaum|tannengrun|adventskranz", "🎄"], ["sonnenblume", "🌻"], ["rose", "🌹"], ["strauss|schnittblumen|gesteck|trockenblumen|kunstblumen", "💐"],
    ["blume|tulpe|orchidee|geranie|petunie|stiefmutterchen|primel|veilchen|begonie|fuchsie|lavendel|chrysantheme|heide|hortensie|amaryllis|narzisse|krokus|hyazinthe|dahlie|gladiole|stauden|christrose|weihnachtsstern", "🌷"],
    ["kaktus|sukkulent", "🌵"], ["palme", "🌴"], ["baum|strauch|hecke|bambus|ficus|buchs|efeu|mistel", "🌳"],
    ["tomate", "🍅"], ["mohre", "🥕"], ["gurke|zucchini", "🥒"], ["kurbis", "🎃"], ["paprika", "🫑"], ["chili", "🌶️"], ["erdbeer", "🍓"], ["salat|kohlrabi", "🥬"], ["bohne|erbse", "🫘"],
    ["samen|saat|nachsaat|rasen|bienenweide|grundungung|anzucht|quelltabletten", "🌱"], ["krauter|basilikum|petersilie|schnittlauch|kresse", "🌿"], ["laub", "🍂"],
    ["schneck", "🐌"], ["ameise", "🐜"], ["insektenhotel|biene", "🐝"], ["vogel|\\bnist|futtersaule", "🐦"], ["igel", "🦔"], ["katze", "🐱"],
    ["schnee|streu|winterschutz", "❄️"], ["handschuhe", "🧤"], ["schere", "✂️"], ["solar|leuchten|lichterkette", "💡"],
]],
  "Büro & Schule": ["✏️", [
    /* Motive, die das Bild genau treffen sollen (eigene Zeichnungen und passendere Noto-Grafiken) */
    ["klebeband|klebefilm|paketband|washi|kreppband|tesa", "#tape"], ["klebestift|(^|[^f])kleber\\b|uhu|pritt", "#glue"], ["taschenrechner|tischrechner", "#calculator"], ["fuller(?!patronen)", "🖋️"], ["lupe", "🔍"], ["globus", "🌍"], ["klemmbrett", "📋"], ["lesezeichen", "🔖"],
    ["kugelschreiber|fullerpatronen", "🖊️"], ["wachsmal", "🖍️"], ["heftzange", "📎"], ["holzbuchstaben", "🧩"], ["regenhulle", "🎒"], ["papierschneider", "✂️"], ["geschenk", "🎁"], ["versandkarton", "📦"],
    ["klammer|locher|heftgerat|tacker|enthefter", "📎"], ["schultute|federmappe|mappchen", "🎒"],
    ["drucker(?!papier)|toner|patrone", "🖨️"], ["maus\\b|mauspad", "🖱️"], ["tastatur", "⌨️"], ["laptop|monitor|bildschirm|webcam", "💻"], ["usb|sd-karte|festplatte|rohlinge", "💾"], ["rechner", "🧮"], ["headset", "🎧"],
    ["schere|cutter|klingen|briefoffner", "✂️"], ["geodreieck|winkelmesser|zirkel", "📐"], ["lineal|schablone", "📏"],
    ["ordner|hefter|mappe|hulle|register|ablage|sammler|trenn|aktendeckel", "📁"], ["kalender|planer", "📅"], ["heft|block|buch", "📒"], ["papier|karton|pappe", "📄"],
    ["brief|umschlag|karte\\b|karten\\b|post", "✉️"], ["paket|versand|luftpolster", "📦"], ["etiketten|anhanger", "🏷️"], ["geschenk|schleifen", "🎁"],
    ["klammer|locher|heftgerat|tacker|enthefter", "📎"], ["reisszweck|pinn|magnete", "📌"],
    ["pinsel", "🖌️"], ["farben|malkasten|tusch|aquarell|acryl|leinwand|staffelei|deckweiss", "🎨"], ["marker|wachsmal|kreide|buntstift|filzstift|fasermaler|brush", "🖍️"],
    ["kugelschreiber|fuller|fineliner|gelschreiber|tintenroller|tinte", "🖊️"], ["schultute|federmappe|mappchen", "🎒"], ["bastel|perlen|pompons|wackelaugen|moosgummi|pfeifenreiniger|glitzer", "🧩"]]],
  "Sonstiges": ["🛒", [
    ["buch", "📚"], ["zigar", "🚬"], ["sudoku|comic", "📰"], ["arzt|medikament", "💊"], ["parkticket|fahrkarte|monatskarte", "🎟️"], ["werkstatt termin|tuv|reifen", "🚗"],
    ["geschenk|mitbringsel", "🎁"], ["blumen", "💐"], ["paket", "📦"], ["brief|post", "✉️"], ["zeitung|zeitschrift|ratselheft", "📰"], ["lotto|los\\b|rubbel", "🎟️"],
    ["geld|bank|bargeld|gutschein|guthaben", "💶"], ["tanken", "⛽"], ["auto", "🚗"], ["foto|passbild", "📷"], ["schlussel", "🔑"], ["zigarette|tabak|filterhulsen", "🚬"], ["feuerzeug", "🔥"],
    ["pfand|leergut|altglas|altpapier|altkleider|entsorgen", "♻️"], ["apotheke|rezept", "💊"], ["backer", "🥖"], ["fleischer", "🥩"], ["friseur", "✂️"], ["markt", "🧺"], ["bibliothek", "📚"],
    ["tasche|tute|beutel", "🛍️"], ["schuhe", "👞"], ["uhr", "⌚"], ["reinigung", "👔"]]]
};
var EMO_DEF = [], EMO_RULES = [];
CATS.forEach(function (c) {
  var m = EMO[c] || ["🛒", []];
  EMO_DEF.push(m[0]);
  EMO_RULES.push(m[1].map(function (p) { return [new RegExp(p[0]), p[1]]; }));
});
function pictogram(cat, n) {
  var r = EMO_RULES[cat] || [];
  for (var i = 0; i < r.length; i++) if (r[i][0].test(n)) return r[i][1];
  return EMO_DEF[cat] || "🛒";
}
var GUESS_ORDER = ["Getränke","Brot & Backwaren","Tiefkühl","Süßes & Snacks","Frühstück, Kaffee & Tee","Nudeln, Reis & Konserven","Backen & Gewürze","Milch, Käse & Eier","Fleisch, Wurst & Fisch","Obst & Gemüse","Drogerie & Gesundheit","Haushalt & Putzen","Baby & Kind","Tierbedarf","Kleidung & Textilien","Baumarkt & Werkzeug","Garten & Pflanzen","Büro & Schule","Sonstiges"]
  .map(function (n) { return CATS.indexOf(n); }).filter(function (i) { return i >= 0; });
/* Abteilung für einen eigenen Artikel. Zuerst der Katalog:
   1. Steckt ein Katalogname als Wort oder Wortfolge im Namen („Omas Nudeln“, „Zahnpasta Kids“), gilt dessen Abteilung.
      Die längste Folge gewinnt, bei gleicher Länge die vordere („Chips Paprika“ sind Chips).
   2. Endet ein Wort auf einen Katalognamen („Kindershampoo“), gilt dessen Abteilung – das Grundwort steht im Deutschen hinten.
   Erst danach die Wortregeln; sie sind grob und treffen oft die falsche Abteilung. */
function guess(n) {
  var w = n.split(/[\s-]+/), k, s, j, key, hit, best;
  for (k = Math.min(4, w.length); k > 0; k--) for (s = 0; s + k <= w.length; s++) {
    key = w.slice(s, s + k).join(" ");
    hit = byNorm[key]; if (hit === undefined) hit = synBy[key];
    if (hit !== undefined) return { cat: cats[hit], icon: icons[hit] };
  }
  for (s = 0; s < w.length; s++) {
    for (j = 0, best = -1; j < norms.length; j++) {
      key = norms[j];
      if (key.length >= 4 && key.length < w[s].length && key.indexOf(" ") < 0 && w[s].slice(-key.length) === key && (best < 0 || key.length > norms[best].length)) best = j;
    }
    if (best >= 0) return { cat: cats[best], icon: icons[best] };
  }
  var frozen = /(^|[\s-])tk([\s-]|$)|tiefkuhl|gefroren|frost|(^|[\s-])eis/.test(n);
  for (var i = 0; i < GUESS_ORDER.length; i++) {
    /* die Tiefkühl-Regeln nennen fast jedes Lebensmittel; sie zählen nur, wenn der Name nach Tiefkühlware klingt */
    if (GUESS_ORDER[i] === TK && !frozen) continue;
    if (ruleHit(GUESS_ORDER[i], n)) return { cat: GUESS_ORDER[i], icon: pictogram(GUESS_ORDER[i], n) };
  }
  return null;
}

/* ---------- Katalog ---------- */
var names = [], cats = [], norms = [], staple = [], icons = [], byNorm = {};
DATA.forEach(function (d, ci) {
  d[1].split("|").forEach(function (n) {
    var st = n.charAt(n.length - 1) === "*";
    if (st) n = n.slice(0, -1);
    var k = norm(n);
    byNorm[k] = names.length;
    names.push(n); cats.push(ci); norms.push(k); staple.push(st);
    icons.push(pictogram(ci, k));
  });
});
var synNorm = [], synIdx = [], synName = [], synBy = {};
SYNRAW.split("|").forEach(function (p) {
  var a = p.split("="), i = byNorm[norm(a[1] || "")];
  if (i === undefined) return;
  synBy[norm(a[0])] = i; synNorm.push(norm(a[0])); synIdx.push(i); synName.push(a[0]);
});
function lookup(name) {
  var k = norm(name), i = byNorm[k];
  if (i === undefined) i = synBy[k];
  return i;
}
function iconOf(it) {
  var i = lookup(it.name);
  if (i !== undefined) return icons[i];
  return pictogram(it.cat, norm(it.name));
}
function catOf(name) {
  var i = lookup(name);
  if (i !== undefined) return cats[i];
  var g = guess(norm(name));
  return g ? g.cat : SONST;
}

/* ---------- Zustand ---------- */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function mk(name, note, done) {
  return { id: uid(), name: name, cat: catOf(name), note: note || "", done: !!done };
}
function seed() {
  return {
    v: 3, example: true, freq: {}, active: "l1", order: CATS.map(function (c, i) { return i; }), templates: [],
    lists: [
      { id: "l1", name: "Wocheneinkauf", items: [
        mk("Bananen"), mk("Tomaten"), mk("Brötchen", "6 Stück"), mk("Vollmilch", "2 Liter"), mk("Butter"),
        mk("Eier 10er"), mk("Gouda jung"), mk("Bratwurst"), mk("Spaghetti"), mk("Passierte Tomaten"),
        mk("Kaffee gemahlen"), mk("Vollmilchschokolade"), mk("Apfelsaft"), mk("Zahnpasta"), mk("Toilettenpapier"),
        mk("Socken"), mk("Dübel 8 mm", "20 Stück"), mk("Blumenerde"),
        mk("Gurke", "", true), mk("Zwiebeln", "", true), mk("Mineralwasser medium", "", true)
      ] },
      { id: "l2", name: "Drogerie", items: [mk("Duschgel"), mk("Taschentücher"), mk("Sonnencreme LSF 30")] }
    ]
  };
}
function validOrder(o) {
  return Array.isArray(o) && o.length === CATS.length && CATS.every(function (c, i) { return o.indexOf(i) >= 0; });
}
function load() {
  try {
    var s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.lists) && s.lists.length) {
      s.freq = s.freq || {};
      /* Reihenfolge der Abteilungen: muss jede Abteilung genau einmal enthalten, sonst gilt die Standardfolge */
      if (!validOrder(s.order)) s.order = CATS.map(function (c, i) { return i; });
      /* eine Liste kann ihre eigene Reihenfolge haben (anderer Laden) */
      s.lists.forEach(function (l) { if (l.order && !validOrder(l.order)) delete l.order; });
      s.templates = Array.isArray(s.templates) ? s.templates.filter(function (x) { return x && typeof x.name === "string" && Array.isArray(x.items); }) : [];
      if (s.theme !== "light" && s.theme !== "dark") s.theme = "auto";
      if ((s.v || 1) < 3) {
        /* Abteilungen wurden neu geschnitten: gespeicherte Artikel neu einsortieren */
        s.lists.forEach(function (l) { l.items.forEach(function (it) { it.cat = catOf(it.name); }); });
        s.v = 3;
      }
      s.lists.forEach(function (l) { l.items.forEach(function (it) { if (!(it.cat >= 0 && it.cat < CATS.length)) it.cat = SONST; }); });
      return s;
    }
  } catch (e) {}
  return null;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
var S = load() || seed();
function cur() {
  for (var i = 0; i < S.lists.length; i++) if (S.lists[i].id === S.active) return S.lists[i];
  S.active = S.lists[0].id; return S.lists[0];
}
function findItem(n) {
  var k = norm(n), it = cur().items;
  for (var i = 0; i < it.length; i++) if (norm(it[i].name) === k) return it[i];
  return null;
}

/* ---------- DOM-Helfer ---------- */
var SVGNS = "http://www.w3.org/2000/svg";
function el(tag, attrs) {
  var e = document.createElement(tag), k;
  for (k in attrs || {}) {
    if (k === "text") e.textContent = attrs[k];
    else if (k === "on") for (var ev in attrs.on) e.addEventListener(ev, attrs.on[ev]);
    else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var c = arguments[i];
    if (c == null || c === false) continue;
    e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return e;
}
function svgUse(id, cls) {
  var s = document.createElementNS(SVGNS, "svg"), u = document.createElementNS(SVGNS, "use");
  if (cls) s.setAttribute("class", cls);
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
  u.setAttribute("href", "#i-" + id); s.appendChild(u);
  return s;
}
/* Dateiname zu einem Emoji-Zeichen: Codepunkte in Hex, mit "_" verbunden, ohne Variantenwähler FE0F */
function emoFile(z) {
  var a = [];
  for (var i = 0; i < z.length; i++) {
    var c = z.codePointAt(i);
    if (c > 0xffff) i++;
    if (c !== 0xfe0f) a.push(c.toString(16));
  }
  return "emoji/" + a.join("_") + ".svg";
}
/* Bildzeichen: eigene Zeichnung ("#name"), Linien-Symbol (plus) oder Noto-Emoji-Grafik aus emoji/ */
function glyph(icon) {
  if (icon === "plus") return svgUse("plus", "ic");
  if (icon.charAt(0) === "#") {
    var s = document.createElementNS(SVGNS, "svg"), u = document.createElementNS(SVGNS, "use");
    s.setAttribute("class", "ex"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    u.setAttribute("href", "#x-" + icon.slice(1)); s.appendChild(u);
    return s;
  }
  var img = el("img", { class: "emo", src: emoFile(icon), alt: "", "aria-hidden": "true", width: "40", height: "40", decoding: "async", draggable: "false" });
  img.addEventListener("error", function () {
    if (img.parentNode) img.parentNode.replaceChild(el("span", { class: "emot", "aria-hidden": "true", text: icon }), img);
  });
  return img;
}
function badge(icon, checked) {
  return el("span", { class: "badge" + (icon === "plus" ? "" : " pic") }, glyph(icon), checked ? el("span", { class: "chk" }, svgUse("check")) : null);
}
function dotsSvg() {
  var s = document.createElementNS(SVGNS, "svg"), p = document.createElementNS(SVGNS, "path");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
  p.setAttribute("d", "M5 12h.01M12 12h.01M19 12h.01"); s.appendChild(p);
  return s;
}
var $ = function (id) { return document.getElementById(id); };
var main = $("main"), sug = $("sug"), q = $("q"), veil = $("veil"), sheet = $("sheet");
var searchOpen = false, lastId = null, sugMsg = null, toastTimer = null, toastUndo = null;

/* Rückgängig: Zustand der aktuellen Liste vor einer Änderung merken */
function snap() {
  var id = cur().id, items = JSON.stringify(cur().items), fq = JSON.stringify(S.freq);
  return function () {
    S.lists.forEach(function (l) { if (l.id === id) l.items = JSON.parse(items); });
    S.freq = JSON.parse(fq); save(); render(); if (searchOpen) renderSug();
  };
}
function hideToast() { if (toastTimer) clearTimeout(toastTimer); toastTimer = null; toastUndo = null; $("toast").hidden = true; }
function notify(text, undo) {
  if (searchOpen) { sugMsg = { text: text, undo: undo }; return; }
  hideToast();
  $("toastmsg").textContent = text; $("toastundo").hidden = !undo; toastUndo = undo || null;
  $("toast").hidden = false;
  toastTimer = setTimeout(hideToast, 4500);
}
function buzz() { try { if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(8); } catch (e) {} }

/* Ab 14 Buchstaben am Stück oder 24 Zeichen insgesamt wird der Name kleiner gesetzt */
function longName(n) {
  if (n.length > 24) return true;
  var w = n.split(/[\s-]+/);
  for (var i = 0; i < w.length; i++) if (w[i].length > 13) return true;
  return false;
}
/* Kachel: tippen = Aktion, lange drücken oder Rechtsklick = Details */
function tile(o) {
  var held = false, timer = null, x0 = 0, y0 = 0;
  var b = el("button", { class: "main", type: "button", "aria-label": o.label || null },
    badge(o.icon, o.checked),
    el("span", { class: "tname" + (longName(o.name) ? " long" : ""), text: o.name }),
    o.note ? el("span", { class: "tnote", text: o.note }) : null);
  function clear() { if (timer) { clearTimeout(timer); timer = null; } }
  if (o.onHold) {
    b.addEventListener("pointerdown", function (e) {
      held = false; clear(); x0 = e.clientX; y0 = e.clientY;
      timer = setTimeout(function () { held = true; timer = null; o.onHold(); }, 550);
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { b.addEventListener(ev, clear); });
    /* Abstand zum Startpunkt statt movementX/Y: die liefert Safari bei Berührung nicht zuverlässig */
    b.addEventListener("pointermove", function (e) { if (Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) > 10) clear(); });
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); clear(); held = true; o.onHold(); });
  }
  b.addEventListener("click", function () { if (held) { held = false; return; } o.onTap(); });
  var t = el("div", { class: "tile " + (o.cls || "") + (o.pop ? " pop" : "") }, b);
  if (o.cat != null && t.style && t.style.setProperty) t.style.setProperty("--c", CATCOL[o.cat]);
  return t;
}
function itemTile(it) {
  var t = tile({
    cls: it.done ? "done" : "", icon: iconOf(it), cat: it.cat, name: it.name, note: it.note, checked: it.done, pop: it.id === lastId,
    label: it.name + (it.note ? ", " + it.note : "") + (it.done ? ", erledigt. Zurück auf die Liste" : ". Abhaken"),
    onTap: function () {
      var u = snap(); it.done = !it.done; lastId = it.id; if (it.done) S.doneAt = Date.now(); tidy = false; buzz(); save(); render(); lastId = null;
      notify(it.name + (it.done ? " erledigt" : " wieder offen"), u);
    },
    onHold: function () { editSheet(it); }
  });
  if (!it.done) t.appendChild(el("button", { class: "dots", type: "button", "aria-label": "Details zu " + it.name,
    on: { click: function () { editSheet(it); } } }, dotsSvg()));
  return t;
}

/* ---------- Liste ---------- */
/* Liegt das letzte Abhaken länger zurück, ist der Einkauf vorbei: dann bietet die Liste an, Erledigtes zu entfernen */
var tidy = false, TIDY_AFTER = 3 * 60 * 60 * 1000;
function checkTidy() {
  tidy = !!S.doneAt && Date.now() - S.doneAt > TIDY_AFTER && cur().items.some(function (i) { return i.done; });
  return tidy;
}
function render() {
  var L = cur(), open = [], done = [];
  L.items.forEach(function (i) { (i.done ? done : open).push(i); });
  var rank = []; (L.order || S.order).forEach(function (ci, pos) { rank[ci] = pos; });
  open.sort(function (a, b) { return rank[a.cat] - rank[b.cat]; });
  var total = open.length + done.length, pct = total ? Math.round(done.length / total * 100) : 0;
  $("listname").textContent = L.name;
  var cnt = $("count"); cnt.textContent = "";
  cnt.appendChild(el("b", { text: String(open.length) })); cnt.appendChild(document.createTextNode(" offen"));
  var bar = $("trackbar"); if (bar.style) bar.style.width = pct + "%";
  $("track").setAttribute("aria-valuenow", String(pct));
  main.textContent = "";
  if (S.example) {
    main.appendChild(el("div", { class: "hint" },
      el("span", { text: "Beispiellisten zum Ausprobieren" }),
      el("button", { class: "link", type: "button", text: "Listen leeren", on: { click: function () {
        S.lists.forEach(function (l) { l.items = []; }); S.example = false; save(); render();
      } } })));
  }
  if (tidy && done.length) {
    /* Erledigtes vom letzten Einkauf: beim nächsten Öffnen einmal fragen, nichts von selbst löschen */
    main.appendChild(el("div", { class: "hint" },
      el("span", { text: done.length + (done.length === 1 ? " erledigter Artikel" : " erledigte Artikel") + " vom letzten Einkauf" }),
      el("span", { class: "acts" },
        el("button", { class: "link", type: "button", text: "Behalten", on: { click: function () { tidy = false; S.doneAt = 0; save(); render(); } } }),
        el("button", { class: "link danger", type: "button", text: "Entfernen", on: { click: function () {
          var u = snap(), n = done.length; tidy = false; S.doneAt = 0;
          L.items = L.items.filter(function (i) { return !i.done; }); save(); render();
          notify(n + (n === 1 ? " erledigter Artikel entfernt" : " erledigte Artikel entfernt"), u);
        } } }))));
  }
  if (!open.length) {
    main.appendChild(el("div", { class: "empty" },
      el("strong", { text: done.length ? "Alles erledigt" : "Die Liste ist leer" }),
      done.length ? "Erledigte Artikel kannst du unten wieder antippen." : "Tippe oben einen Artikel ein."));
  } else {
    var g = el("div", { class: "grid" });
    open.forEach(function (i) { g.appendChild(itemTile(i)); });
    main.appendChild(g);
  }
  if (done.length) {
    var open2 = S.doneOpen !== false, fold = el("button", { class: "fold", type: "button", "aria-expanded": String(open2),
      "aria-label": "Erledigt, " + done.length + (open2 ? ", einklappen" : ", ausklappen"),
      on: { click: function () { S.doneOpen = !open2; save(); render(); var f = main.querySelector && main.querySelector(".fold"); if (f) f.focus(); } } },
      el("span", { text: "Erledigt · " + done.length }), chevDown());
    main.appendChild(el("h2", {}, fold,
      el("button", { class: "link danger", type: "button", text: "Entfernen", on: { click: function () {
        var u = snap(), n = done.length;
        L.items = L.items.filter(function (i) { return !i.done; }); save(); render();
        notify(n + (n === 1 ? " erledigter Artikel entfernt" : " erledigte Artikel entfernt"), u);
      } } })));
    if (open2) {
      var g2 = el("div", { class: "grid" });
      done.forEach(function (i) { g2.appendChild(itemTile(i)); });
      main.appendChild(g2);
    }
  }
}
/* ---------- Mengen beim Eintippen: „3 Äpfel“, „Milch 2 l“, „500 g Hackfleisch“ ----------
   Steht die Eingabe so im Katalog („Eier 10er“, „Mineralwasser 1,5 l“) oder ist sie der Anfang eines Katalognamens,
   wird nichts abgetrennt. Eine nackte Zahl am Ende zählt nur als Menge, wenn der Rest ein Katalogartikel ist. */
var UNIT = "kg|g|mg|l|ml|cl|liter|stück|stk|st|pck|pkg|packung|packungen|päckchen|dose|dosen|flasche|flaschen|glas|gläser|bund|becher|tüte|tüten|kiste|kisten|kasten|beutel|netz|scheiben|paar|rolle|rollen|tafel|tafeln";
var Q_LEAD = new RegExp("^(\\d+(?:[.,]\\d+)?)\\s*(?:(x|×)\\s+|(" + UNIT + ")\\.?\\s+|\\s+)(.+)$", "i");
var Q_TAIL = new RegExp("^(.+?)\\s+(?:[x×]\\s*)?(\\d+(?:[.,]\\d+)?)\\s*(x|×|" + UNIT + ")?\\.?$", "i");
function qtyText(num, unit) {
  unit = (unit || "").toLowerCase();
  if (!unit || unit === "x" || unit === "×") return num + "×";
  if (/^(stk|st)$/.test(unit)) unit = "stück";
  if (unit === "liter") unit = "l";
  return num + " " + (unit.length > 2 ? unit.charAt(0).toUpperCase() + unit.slice(1) : unit);
}
function parseQty(raw) {
  var s = raw.trim().replace(/\s+/g, " "), none = { name: s, note: "" }, m, k = norm(s), i;
  if (!s || !/\d/.test(s) || lookup(s) !== undefined) return none;
  for (i = 0; i < norms.length; i++) if (norms[i].lastIndexOf(k, 0) === 0) return none;
  if ((m = Q_LEAD.exec(s)) && /[a-zäöüß]{2}/i.test(m[4])) return { name: m[4], note: qtyText(m[1], m[2] || m[3]) };
  if ((m = Q_TAIL.exec(s)) && /[a-zäöüß]{2}/i.test(m[1]) && (m[3] || lookup(m[1]) !== undefined)) return { name: m[1], note: qtyText(m[2], m[3]) };
  return none;
}
/* Menge schrittweise ändern. Ohne Angabe gilt 1; „2ד, „3 Packungen“ zählen in Einerschritten,
   Gramm und Milliliter in 50er- bzw. 100er-Schritten, Kilo und Liter in halben. Freitext ohne Zahl bleibt. */
function stepQty(note, dir) {
  note = (note || "").trim();
  if (!note) return dir > 0 ? "2×" : "";
  var m = /^(\d+(?:[.,]\d+)?)\s*(?:×|x(?![a-zäöü]))?\s*(.*)$/i.exec(note);
  if (!m) return note;
  var v = parseFloat(m[1].replace(",", ".")), unit = m[2].trim(), u = unit.toLowerCase(), step;
  step = /^(g|ml)\b/.test(u) ? ((dir > 0 ? v : v - 1) < 200 ? 50 : 100) : /^(kg|l|liter)\b/.test(u) ? 0.5 : 1;
  v = Math.round((v + dir * step) * 100) / 100;
  if (v <= 0) return note;
  if (!unit) return v === 1 ? "" : String(v).replace(".", ",") + "×";
  return String(v).replace(".", ",") + " " + unit;
}
function add(name, note) {
  name = name.trim().replace(/\s+/g, " ");
  if (!name) return;
  if (note === undefined) { var pq = parseQty(name); name = pq.name; note = pq.note; }
  var i = byNorm[norm(name)];
  if (i !== undefined) name = names[i]; else name = name.charAt(0).toUpperCase() + name.slice(1);
  var ex = findItem(name), msg;
  if (ex && !ex.done) {
    if (!note || ex.note === note) return { text: name + " steht schon auf der Liste", changed: false };
    ex.note = note; save(); render();
    return { text: name + ": Menge " + note, changed: true };
  }
  if (ex) { ex.done = false; if (note) ex.note = note; msg = name + " wieder auf der Liste"; }
  else { cur().items.push(mk(name, note)); msg = name + (note ? " (" + note + ")" : "") + " hinzugefügt"; }
  S.freq[name] = (S.freq[name] || 0) + 1;
  save(); render();
  return { text: msg, changed: true };
}

/* ---------- Mehrere Artikel auf einmal: eingefügte Liste, Kommas, Spracheingabe ----------
   Getrennt wird an Zeilenumbruch, Semikolon und Komma (nicht zwischen Ziffern: „3,5 %“). Aufzählungszeichen fallen weg. */
var NUMW = { ein: 1, eine: 1, einen: 1, einem: 1, zwei: 2, drei: 3, vier: 4, "fünf": 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, "zwölf": 12 };
function splitItems(text, spoken) {
  var out = [];
  text.split(/\s*(?:[;\n\r]+|,(?!\d))\s*/).forEach(function (p) {
    p = p.replace(/^\s*(?:[-–—•*·]+|\[[ xX]?\])\s*/, "").replace(/\s+/g, " ").trim();
    if (!p) return;
    if (spoken) spokenItems(p).forEach(function (x) { out.push(x); }); else out.push(p);
  });
  return out.slice(0, 200);
}
/* Gesprochenes hat keine Kommas: „Milch Butter drei Äpfel“. Von links wird jeweils der längste Katalogname genommen,
   davor eine Menge. Geht das nicht auf, bleibt der Text ganz und wird nur an „und“ getrennt. */
function spokenItems(p) {
  var tok = p.replace(/[.!?]+$/, "").split(" ").map(function (w) { var n = NUMW[w.toLowerCase()]; return n ? String(n) : w; });
  var out = [], i = 0, k, qty, name, unitRe = new RegExp("^(?:" + UNIT + ")$", "i");
  while (i < tok.length) {
    if (/^und$/i.test(tok[i])) { i++; continue; }
    qty = "";
    if (/^\d+(?:[.,]\d+)?$/.test(tok[i]) && i + 1 < tok.length) {
      qty = tok[i++];
      if (unitRe.test(tok[i]) && i + 1 < tok.length) qty += " " + tok[i++];
    }
    for (k = Math.min(5, tok.length - i), name = ""; k > 0; k--) {
      name = tok.slice(i, i + k).join(" ");
      if (lookup(name) !== undefined) break;
      name = "";
    }
    if (!name) return tok.join(" ").split(/\s+und\s+/i);
    out.push((qty ? qty + " " : "") + name); i += k;
  }
  return out;
}
function addMany(texts) {
  var u = snap(), L = cur(), n = 0;
  texts.forEach(function (t) {
    var pq = parseQty(t), name = pq.name, i = byNorm[norm(name)];
    if (!name) return;
    name = i !== undefined ? names[i] : name.charAt(0).toUpperCase() + name.slice(1);
    var ex = findItem(name);
    if (ex && !ex.done) { if (pq.note && ex.note !== pq.note) { ex.note = pq.note; n++; } return; }
    if (ex) { ex.done = false; if (pq.note) ex.note = pq.note; } else L.items.push(mk(name, pq.note));
    S.freq[name] = (S.freq[name] || 0) + 1; n++;
  });
  save(); render();
  return { n: n, undo: n ? u : null };
}
/* in der Suche: alle auf die Liste, Meldung mit Rückgängig */
function pickMany(texts) {
  var r = addMany(texts);
  buzz(); sugMsg = { text: r.n ? r.n + " Artikel hinzugefügt" : "Alles steht schon auf der Liste", undo: r.undo };
  q.value = ""; $("clearq").hidden = true; openSearch(); renderSug();
}
function several(text) {
  if (lookup(text.trim()) !== undefined) return null;
  var p = splitItems(text);
  return p.length > 1 ? p : null;
}

/* ---------- Suche ---------- */
function openSearch() {
  if (searchOpen) return;
  searchOpen = true; main.hidden = true; sug.hidden = false; $("closesearch").hidden = false; renderSug();
}
function closeSearch() {
  searchOpen = false; sugMsg = null; $("clearq").hidden = true; q.value = ""; main.hidden = false; sug.hidden = true; $("closesearch").hidden = true; q.blur();
}
function pick(name, note) {
  var u = snap(), r = add(name, note);
  if (r) { buzz(); sugMsg = { text: r.text, undo: r.changed ? u : null }; }
  q.value = ""; $("clearq").hidden = true; renderSug(); q.focus();
}
function catTile(i, via, qty) {
  var n = names[i], ex = findItem(n), on = ex && !ex.done;
  if (qty && !(on && ex.note === qty)) return tile({
    cls: on ? "on" : "", icon: icons[i], cat: cats[i], name: n, checked: on, note: qty,
    label: n + ", Menge " + qty + (on ? " setzen" : ". Hinzufügen"), onTap: function () { pick(n, qty); }
  });
  return tile({
    cls: on ? "on" : "", icon: icons[i], cat: cats[i], name: n, checked: on,
    note: on ? "steht drauf" : (via ? "für " + via : ""),
    label: n + (on ? ", steht schon auf der Liste" : ". Hinzufügen"),
    onTap: function () { if (on) q.focus(); else pick(n); }
  });
}
/* Güte eines Treffers: 0 gleich, 1 Namensanfang, 2 Wortanfang, 3 Wortende (Grundwort wie „milch“ in „Vollmilch“),
   4 irgendwo mitten im Wort. Stufe 4 steht immer hinter allen anderen, egal wie gängig der Artikel ist. */
/* ---------- Unscharfe Suche ----------
   Verglichen wird mit den Wortanfängen aller Katalognamen; erlaubt ist ein Tippfehler, ab acht Buchstaben zwei.
   Vertauschte Nachbarbuchstaben zählen als ein Fehler. */
var WORDS = null;
function wordIndex() {
  if (WORDS) return WORDS;
  var m = {}, i, j, w;
  for (i = 0; i < norms.length; i++) {
    w = norms[i].split(/[\s-]+/);
    for (j = 0; j < w.length; j++) if (w[j].length >= 4) (m[w[j]] = m[w[j]] || []).push(i);
  }
  WORDS = Object.keys(m).map(function (k) { return [k, m[k]]; });
  return WORDS;
}
function editDist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  var prev2 = null, prev = [], cur, i, j, c, low;
  for (j = 0; j <= b.length; j++) prev[j] = j;
  for (i = 1; i <= a.length; i++) {
    cur = [i]; low = i;
    for (j = 1; j <= b.length; j++) {
      c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
      if (prev2 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
      if (cur[j] < low) low = cur[j];
    }
    if (low > max) return max + 1;
    prev2 = prev; prev = cur;
  }
  return prev[b.length];
}
function fuzzyHits(nq) {
  var max = nq.length >= 8 ? 2 : 1, out = {}, W = wordIndex(), i, k, w, d, len, low, ids;
  for (i = 0; i < W.length; i++) {
    w = W[i][0];
    /* Vorfilter: der erste oder der zweite Buchstabe muss stimmen */
    if (w.charCodeAt(0) !== nq.charCodeAt(0) && w.charCodeAt(1) !== nq.charCodeAt(1)) continue;
    low = max + 1;
    for (len = nq.length - 1; len <= nq.length + 1; len++) {
      if (len > w.length || len < 3) continue;
      d = editDist(nq, w.slice(0, len), max);
      if (d < low) low = d;
    }
    if (low > max) continue;
    ids = W[i][1];
    for (k = 0; k < ids.length; k++) if (out[ids[k]] === undefined || low < out[ids[k]]) out[ids[k]] = low;
  }
  return out;
}
function matchScore(text, nq) {
  var best = -1, at = text.indexOf(nq), sc, end;
  if (at < 0) return -1;
  if (text === nq) return 0;
  for (; at >= 0; at = text.indexOf(nq, at + 1)) {
    end = at + nq.length;
    if (at === 0) sc = 1;
    else if (/[\s-]/.test(text.charAt(at - 1))) sc = 2;
    else if (nq.length >= 3 && (end === text.length || /[\s-]/.test(text.charAt(end)))) sc = 3;
    else sc = 4;
    if (best < 0 || sc < best) best = sc;
  }
  return best;
}
function renderSug() {
  sug.textContent = "";
  var pq = parseQty(q.value), raw = pq.name, qty = pq.note, nq = norm(raw), g = el("div", { class: "grid" });
  if (sugMsg) {
    var m = sugMsg;
    sug.appendChild(el("div", { class: "status", role: "status" }, el("span", { text: m.text }),
      m.undo ? el("button", { class: "link", type: "button", text: "Rückgängig", on: { click: function () { sugMsg = null; m.undo(); q.focus(); } } }) : null));
  }
  if (!nq) {
    var top = Object.keys(S.freq).filter(function (n) { return byNorm[norm(n)] !== undefined; })
      .sort(function (a, b) { return S.freq[b] - S.freq[a]; });
    STARTERS.forEach(function (n) { if (top.indexOf(n) < 0) top.push(n); });
    sug.appendChild(el("h2", {}, el("span", { text: "Oft gekauft" })));
    top.slice(0, 18).forEach(function (n) { g.appendChild(catTile(byNorm[norm(n)])); });
    sug.appendChild(g);
    return;
  }
  var best = {}, via = {}, i, sc;
  for (i = 0; i < norms.length; i++) { sc = matchScore(norms[i], nq); if (sc >= 0) best[i] = sc; }
  for (i = 0; i < synNorm.length; i++) {
    sc = matchScore(synNorm[i], nq);
    if (sc < 0 || sc > 2 || nq.length < 3) continue;
    if (best[synIdx[i]] === undefined || sc < best[synIdx[i]]) { best[synIdx[i]] = sc; via[synIdx[i]] = synName[i]; }
  }
  /* Wenig oder nichts gefunden: Tippfehler zulassen („Jogurt“, „Brokoli“). Solche Treffer stehen hinter den genauen. */
  var exact = Object.keys(best).length, fk, fz;
  if (nq.length >= 4 && exact < 8) { fz = fuzzyHits(nq); for (fk in fz) if (best[fk] === undefined) best[fk] = 5 + fz[fk]; }
  var hits = Object.keys(best).map(function (k) {
    k = Number(k);
    var s = best[k] - (staple[k] ? 2.1 : 0) - Math.min(S.freq[names[k]] || 0, 5) * 0.6 - (best[k] === 0 ? 5 : 0) + (best[k] === 4 ? 100 : best[k] >= 5 ? 50 : 0);
    return [s, names[k].length, k];
  });
  hits.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]; });
  var total = hits.length;
  sug.appendChild(el("h2", {}, el("span", { text: !total ? "Kein Treffer im Katalog" : exact ? total.toLocaleString("de-DE") + " Treffer" : "Kein genauer Treffer – ähnlich:" })));
  if (byNorm[nq] === undefined) {
    g.appendChild(tile({
      cls: "new", icon: "plus", name: "„" + raw + "“", note: qty ? qty + " · neu anlegen" : "neu anlegen",
      label: raw + " als eigenen Artikel hinzufügen", onTap: function () { pick(raw, qty); }
    }));
  }
  hits.slice(0, 59).forEach(function (h) { g.appendChild(catTile(h[2], via[h[2]], qty)); });
  sug.appendChild(g);
  if (total > 59) sug.appendChild(el("p", { class: "foot", text: "Weiter tippen, um die Auswahl einzugrenzen." }));
}
q.addEventListener("focus", openSearch);
q.addEventListener("input", function () { sugMsg = null; $("clearq").hidden = !q.value; openSearch(); renderSug(); });
$("clearq").addEventListener("click", function () { q.value = ""; sugMsg = null; $("clearq").hidden = true; renderSug(); q.focus(); });
$("toastundo").addEventListener("click", function () { var u = toastUndo; hideToast(); if (u) u(); });
q.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSearch(); });
$("searchform").addEventListener("submit", function (e) {
  e.preventDefault();
  var many = several(q.value);
  if (many) pickMany(many); else if (q.value.trim()) pick(q.value); else closeSearch();
});
$("closesearch").addEventListener("click", closeSearch);
/* Eingefügter Text mit mehreren Zeilen oder Kommas: gleich alles hinzufügen (das Feld selbst würde Zeilenumbrüche schlucken) */
q.addEventListener("paste", function (e) {
  var t = e.clipboardData && e.clipboardData.getData ? e.clipboardData.getData("text") : "";
  var many = t && !q.value.trim() ? several(t) : null;
  if (many) { e.preventDefault(); pickMany(many); q.focus(); }
});

/* ---------- Sheets ---------- */
var opener = null;
function openSheet(label) {
  if (veil.hidden) opener = document.activeElement || null;
  hideToast();
  sheet.textContent = ""; sheet.setAttribute("aria-label", label); sheet.setAttribute("tabindex", "-1");
  var x = el("button", { class: "xbtn", type: "button", "aria-label": "Schließen", on: { click: closeSheet } });
  var xs = document.createElementNS(SVGNS, "svg"), xp = document.createElementNS(SVGNS, "path");
  xs.setAttribute("viewBox", "0 0 24 24"); xs.setAttribute("aria-hidden", "true"); xp.setAttribute("d", "M6 6l12 12M18 6L6 18"); xs.appendChild(xp); x.appendChild(xs);
  for (var i = 1; i < arguments.length; i++) if (arguments[i]) sheet.appendChild(arguments[i]);
  sheet.appendChild(x);
  if (sheet.style) { sheet.style.transform = ""; sheet.style.transition = ""; }
  veil.hidden = false;
  /* Die Seite hinter dem Blatt ist weder bedienbar noch für Screenreader sichtbar */
  $("app").inert = true;
  if (sheet.scrollTop) sheet.scrollTop = 0;
  if (sheet.focus) sheet.focus();
}
function closeSheet() {
  veil.hidden = true; sheet.textContent = "";
  $("app").inert = !!document.getElementById("gate") && !!document.body;
  try { if (opener && opener.isConnected && opener.focus) opener.focus(); } catch (e) {}
  opener = null;
}
/* Schließen nur, wenn die Berührung auch auf dem Schleier begonnen hat. Sonst schließt das Loslassen nach
   langem Drücken das eben geöffnete Blatt sofort wieder, weil der Finger dann über dem Schleier liegt. */
var veilDown = false;
veil.addEventListener("pointerdown", function (e) { veilDown = e.target === veil; });
veil.addEventListener("click", function (e) { if (e.target === veil && veilDown) closeSheet(); veilDown = false; });
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !veil.hidden) closeSheet(); });
/* Tab bleibt im offenen Blatt */
document.addEventListener("keydown", function (e) {
  if (e.key !== "Tab" || veil.hidden) return;
  var f = Array.prototype.filter.call(sheet.querySelectorAll("button,[href],input,select,textarea"), function (x) { return !x.disabled && !x.hidden && x.offsetParent !== null; });
  if (!f.length) { e.preventDefault(); return; }
  var a = document.activeElement;
  if (e.shiftKey && (a === f[0] || a === sheet)) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && (a === f[f.length - 1] || !sheet.contains(a))) { e.preventDefault(); f[0].focus(); }
});
function chevDown() {
  var s = document.createElementNS(SVGNS, "svg"), p = document.createElementNS(SVGNS, "path");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true"); p.setAttribute("d", "M6 9l6 6 6-6"); s.appendChild(p);
  return s;
}

function editSheet(it) {
  var note = el("input", { id: "f-note", type: "text", value: it.note, placeholder: "z. B. 2 Stück, die große Packung", maxlength: "40" });
  var nameIn = el("input", { id: "f-name", type: "text", value: it.name, maxlength: "80", autocapitalize: "sentences", spellcheck: "false" });
  var err = el("p", { class: "notice", role: "alert", hidden: true });
  var sel = el("select", { id: "f-cat" });
  CATS.forEach(function (c, ci) { var o = el("option", { value: String(ci), text: c }); if (ci === it.cat) o.selected = true; sel.appendChild(o); });
  var chips = el("div", { class: "qchips", role: "group", "aria-label": "Schnellauswahl Menge" });
  ["1", "2", "3", "4", "6", "500 g", "1 kg", "1 Liter", "1 Packung"].forEach(function (c) {
    chips.appendChild(el("button", { class: "qchip", type: "button", text: c, on: { click: function () { note.value = c; } } }));
  });
  var head = el("div", { class: "sheet-head" }, badge(iconOf(it)),
    el("h3", {}, it.name, el("small", { text: CATS[it.cat] })));
  if (head.style && head.style.setProperty) head.style.setProperty("--c", CATCOL[it.cat]);
  var form = el("form", { on: { submit: function (e) {
    e.preventDefault();
    var nn = nameIn.value.trim().replace(/\s+/g, " "), ci = byNorm[norm(nn)], other;
    if (!nn) { nameIn.focus(); return; }
    if (norm(nn) !== norm(it.name)) {
      /* Umbenennen: Katalogschreibweise übernehmen; die Abteilung folgt dem neuen Namen, wenn sie nicht von Hand gewählt wurde */
      nn = ci !== undefined ? names[ci] : nn.charAt(0).toUpperCase() + nn.slice(1);
      other = findItem(nn);
      if (other && other !== it) { err.textContent = nn + " steht schon auf der Liste."; err.hidden = false; nameIn.focus(); return; }
      if (Number(sel.value) === it.cat) sel.value = String(catOf(nn));
    }
    it.name = nn; it.note = note.value.trim(); it.cat = Number(sel.value); save(); render(); closeSheet();
  } } },
    el("label", { class: "field", for: "f-name" }, "Name", nameIn), err,
    el("div", { class: "inline" },
      el("label", { class: "field", for: "f-note" }, "Menge oder Notiz", note),
      el("button", { class: "btn step", type: "button", "aria-label": "Menge verringern", text: "−", on: { click: function () { note.value = stepQty(note.value, -1); } } }),
      el("button", { class: "btn step", type: "button", "aria-label": "Menge erhöhen", text: "+", on: { click: function () { note.value = stepQty(note.value, 1); } } })),
    chips,
    el("label", { class: "field", for: "f-cat" }, "Abteilung", sel),
    el("div", { class: "row" },
      el("button", { class: "btn danger", type: "button", text: "Löschen", on: { click: function () {
        var u = snap(), L = cur(); L.items = L.items.filter(function (x) { return x !== it; }); save(); render(); closeSheet();
        notify(it.name + " gelöscht", u);
      } } }),
      el("button", { class: "btn primary", type: "submit", text: "Speichern" })));
  openSheet("Details zu " + it.name, head, form);
}

/* ---------- Menü: Listen und alles Weitere ---------- */
function chev() { return el("span", { class: "chev", "aria-hidden": "true", text: "›" }); }
function menuRow(text, sub, fn) {
  return el("li", {}, el("button", { class: "pick", type: "button", on: { click: fn } },
    el("span", { class: "name", text: text }), sub ? el("span", { class: "n", text: sub }) : null, chev()));
}
function listsSheet() {
  var ul = el("ul", { class: "lists" });
  S.lists.forEach(function (l) {
    var n = l.items.filter(function (i) { return !i.done; }).length, armed = false;
    var del = el("button", { class: "del", type: "button", text: "Löschen", disabled: S.lists.length < 2, "aria-label": "Liste " + l.name + " löschen" });
    del.addEventListener("click", function () {
      if (!armed) { armed = true; del.textContent = "Wirklich löschen?"; return; }
      S.lists = S.lists.filter(function (x) { return x !== l; });
      if (S.active === l.id) S.active = S.lists[0].id;
      save(); render(); listsSheet();
    });
    ul.appendChild(el("li", { class: l.id === S.active ? "cur" : "" },
      el("button", { class: "pick", type: "button", on: { click: function () { S.active = l.id; save(); render(); closeSheet(); } } },
        el("span", { class: "name", text: l.name }),
        el("span", { class: "n", text: n + " offen" })),
      del));
  });
  var inp = el("input", { id: "f-newlist", type: "text", placeholder: "z. B. Baumarkt", maxlength: "40" });
  var form = el("form", { on: { submit: function (e) {
    e.preventDefault(); var v = inp.value.trim(); if (!v) { inp.focus(); return; }
    var l = { id: uid(), name: v, items: [] }; S.lists.push(l); S.active = l.id; save(); render(); closeSheet();
  } } },
    el("div", { class: "inline" },
      el("label", { class: "field", for: "f-newlist" }, "Neue Liste", inp),
      el("button", { class: "btn primary", type: "submit", text: "Anlegen" })));
  var ren = el("input", { id: "f-rename", type: "text", value: cur().name, maxlength: "40" });
  var renForm = el("form", { on: { submit: function (e) {
    e.preventDefault(); var v = ren.value.trim(); if (!v) { ren.focus(); return; }
    cur().name = v; save(); render(); listsSheet();
  } } },
    el("div", { class: "inline" },
      el("label", { class: "field", for: "f-rename" }, "Aktuelle Liste umbenennen", ren),
      el("button", { class: "btn", type: "submit", text: "Ändern" })));
  var menu = el("ul", { class: "lists menu" },
    menuRow("Liste teilen", "", function () { closeSheet(); shareList(); }),
    menuRow("Geteilte Liste einfügen", "", pasteSheet),
    menuRow("Vorlagen", S.templates.length ? String(S.templates.length) : "", templatesSheet),
    menuRow("Reihenfolge im Laden", "", orderSheet),
    menuRow("Sicherung", "", backupSheet),
    INSTALL && !INSTALL.platform().standalone ? menuRow("Als App installieren", "", INSTALL.sheet) : null);
  var seg = el("div", { class: "seg", role: "group", "aria-label": "Darstellung" });
  [["auto", "System"], ["light", "Hell"], ["dark", "Dunkel"]].forEach(function (o) {
    seg.appendChild(el("button", { type: "button", text: o[1], "aria-pressed": String(S.theme === o[0]), on: { click: function () {
      S.theme = o[0]; save(); applyTheme();
      Array.prototype.forEach.call(seg.children, function (b) { b.setAttribute("aria-pressed", String(b.textContent === o[1])); });
    } } }));
  });
  openSheet("Listen", el("h3", { text: "Meine Listen" }), ul, renForm, form, el("h4", { text: "Mehr" }), menu, el("h4", { text: "Darstellung" }), seg);
}

/* ---------- Hell, Dunkel oder wie das System ---------- */
function applyTheme() {
  var th = S.theme === "light" || S.theme === "dark" ? S.theme : "";
  try { localStorage.setItem("einkaufszettel.theme", th); } catch (e) {}
  var root = document.documentElement;
  if (!root) return;
  if (th) root.setAttribute("data-theme", th); else root.removeAttribute("data-theme");
  /* Farbe der Browserleiste mitziehen */
  Array.prototype.forEach.call(document.querySelectorAll('meta[name="theme-color"]'), function (m) {
    var dark = th ? th === "dark" : /dark/.test(m.getAttribute("media") || "");
    m.setAttribute("content", dark ? "#0e1411" : "#edf0ea");
  });
}

/* ---------- Sicherung als Datei ---------- */
function backupData() {
  return { app: "einkaufszettel", version: 1, exported: new Date().toISOString(), lists: S.lists, templates: S.templates, order: S.order, freq: S.freq };
}
/* Liest eine Sicherung und übernimmt nur, was die App kennt: Text in begrenzter Länge, gültige Abteilungen, neue Kennungen. */
function readBackup(text) {
  var d;
  try { d = JSON.parse(text); } catch (e) { return null; }
  if (!d || d.app !== "einkaufszettel" || !Array.isArray(d.lists)) return null;
  function str(x, n) { return typeof x === "string" ? x.trim().slice(0, n) : ""; }
  function items(a) {
    return (Array.isArray(a) ? a : []).slice(0, 2000).filter(function (i) { return i && str(i.name, 80); }).map(function (i) {
      var n = str(i.name, 80);
      return { id: uid(), name: n, cat: i.cat >= 0 && i.cat < CATS.length && i.cat === Math.floor(i.cat) ? i.cat : catOf(n), note: str(i.note, 40), done: !!i.done };
    });
  }
  var out = { lists: [], templates: [], order: validOrder(d.order) ? d.order.slice() : null, freq: {} };
  d.lists.slice(0, 100).forEach(function (l) {
    if (!l || !Array.isArray(l.items)) return;
    var x = { id: uid(), name: str(l.name, 40) || "Liste", items: items(l.items) };
    if (validOrder(l.order)) x.order = l.order.slice();
    out.lists.push(x);
  });
  (Array.isArray(d.templates) ? d.templates : []).slice(0, 100).forEach(function (t) {
    if (!t || !Array.isArray(t.items) || !str(t.name, 40)) return;
    out.templates.push({ id: uid(), name: str(t.name, 40), items: items(t.items).map(function (i) { return { name: i.name, note: i.note }; }) });
  });
  if (d.freq && typeof d.freq === "object") Object.keys(d.freq).slice(0, 5000).forEach(function (k) {
    if (typeof d.freq[k] === "number" && d.freq[k] > 0) out.freq[k.slice(0, 80)] = Math.min(Math.floor(d.freq[k]), 9999);
  });
  return out.lists.length || out.templates.length ? out : null;
}
function restoreBackup(b, replace) {
  if (replace) {
    if (b.lists.length) { S.lists = b.lists; S.active = b.lists[0].id; }
    S.templates = b.templates; S.freq = b.freq;
    if (b.order) S.order = b.order;
  } else {
    b.lists.forEach(function (l) { S.lists.push(l); });
    b.templates.forEach(function (t) {
      S.templates = S.templates.filter(function (x) { return norm(x.name) !== norm(t.name); });
      S.templates.push(t);
    });
    Object.keys(b.freq).forEach(function (k) { S.freq[k] = Math.max(S.freq[k] || 0, b.freq[k]); });
  }
  S.example = false; save(); render();
}
function backupSheet() {
  var err = el("p", { class: "notice", role: "alert", hidden: true, text: "Das ist keine Sicherung des Einkaufszettels." });
  var file = el("input", { type: "file", accept: "application/json,.json", "aria-label": "Sicherung laden" });
  file.addEventListener("change", function () {
    var f = file.files && file.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      var b = readBackup(String(r.result));
      if (!b) { err.hidden = false; file.value = ""; return; }
      var armed = false;
      var rep = el("button", { class: "btn danger", type: "button", text: "Alles ersetzen" });
      rep.addEventListener("click", function () {
        if (!armed) { armed = true; rep.textContent = "Wirklich ersetzen?"; return; }
        restoreBackup(b, true); closeSheet(); notify("Sicherung geladen");
      });
      openSheet("Sicherung laden", el("h3", { text: "Sicherung laden?" }),
        el("p", { class: "lead", text: b.lists.length + (b.lists.length === 1 ? " Liste" : " Listen") + " und " + b.templates.length + (b.templates.length === 1 ? " Vorlage" : " Vorlagen") + " in der Datei." }),
        el("p", { class: "lead", text: "„Dazunehmen“ behält deine jetzigen Listen. „Alles ersetzen“ löscht sie." }),
        el("div", { class: "row" }, rep,
          el("button", { class: "btn primary", type: "button", text: "Dazunehmen", on: { click: function () { restoreBackup(b, false); closeSheet(); notify("Sicherung dazugenommen"); } } })));
    };
    r.onerror = function () { err.hidden = false; };
    r.readAsText(f);
  });
  openSheet("Sicherung", el("h3", { text: "Sicherung" }),
    el("p", { class: "lead", text: "Deine Listen liegen nur auf diesem Gerät. Eine Sicherung ist eine Datei mit allen Listen, Vorlagen und der Reihenfolge – zum Aufheben oder für ein anderes Gerät." }),
    el("button", { class: "btn primary block", type: "button", text: "Sicherung speichern", on: { click: function () {
      try {
        var url = URL.createObjectURL(new Blob([JSON.stringify(backupData(), null, 1)], { type: "application/json" }));
        var a = el("a", { href: url, download: "einkaufszettel-" + new Date().toISOString().slice(0, 10) + ".json" });
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
        notify("Sicherung gespeichert");
      } catch (e) { notify("Speichern nicht möglich"); }
    } } }),
    el("label", { class: "btn block filebtn" }, "Sicherung laden", file), err);
}
$("listbtn").addEventListener("click", listsSheet);

/* Mehrere Artikel auf die aktuelle Liste setzen (Vorlage, geteilte Liste). Was schon offen draufsteht, bleibt. */
function applyItems(items, what) {
  var u = snap(), L = cur(), n = 0;
  items.forEach(function (x) {
    var ex = findItem(x.name);
    if (ex && !ex.done) return;
    if (ex) { ex.done = false; if (x.note) ex.note = x.note; } else L.items.push(mk(x.name, x.note));
    n++;
  });
  save(); render();
  notify(n ? n + (n === 1 ? " Artikel" : " Artikel") + " aus " + what + " hinzugefügt" : "Alles aus " + what + " steht schon drauf", n ? u : null);
}

/* ---------- Vorlagen: wiederkehrende Einkäufe mit einem Tipp auf die Liste ---------- */
function templatesSheet() {
  var ul = el("ul", { class: "lists" });
  S.templates.forEach(function (t) {
    var armed = false;
    var del = el("button", { class: "del", type: "button", text: "Löschen", "aria-label": "Vorlage " + t.name + " löschen" });
    del.addEventListener("click", function () {
      if (!armed) { armed = true; del.textContent = "Wirklich löschen?"; return; }
      S.templates = S.templates.filter(function (x) { return x !== t; }); save(); templatesSheet();
    });
    ul.appendChild(el("li", {},
      el("button", { class: "pick", type: "button", "aria-label": "Vorlage " + t.name + " auf die Liste setzen",
        on: { click: function () { closeSheet(); applyItems(t.items, "„" + t.name + "“"); } } },
        el("span", { class: "name", text: t.name }),
        el("span", { class: "n", text: t.items.length + " Artikel" })),
      del));
  });
  var L = cur(), inp = el("input", { id: "f-tpl", type: "text", value: L.name, maxlength: "40" });
  var form = el("form", { on: { submit: function (e) {
    e.preventDefault(); var v = inp.value.trim(); if (!v) { inp.focus(); return; }
    if (!L.items.length) { notify("Die Liste ist leer"); return; }
    S.templates = S.templates.filter(function (x) { return norm(x.name) !== norm(v); });
    S.templates.push({ id: uid(), name: v, items: L.items.map(function (i) { return { name: i.name, note: i.note }; }) });
    save(); templatesSheet();
  } } },
    el("div", { class: "inline" },
      el("label", { class: "field", for: "f-tpl" }, "Aktuelle Liste als Vorlage speichern", inp),
      el("button", { class: "btn primary", type: "submit", text: "Speichern" })));
  openSheet("Vorlagen", el("h3", { text: "Vorlagen" }),
    S.templates.length ? el("p", { class: "lead", text: "Antippen setzt alle Artikel der Vorlage auf „" + L.name + "“." })
      : el("p", { class: "lead", text: "Noch keine Vorlage. Speichere eine Liste, die du immer wieder brauchst – zum Beispiel den Wocheneinkauf oder alles fürs Grillen." }),
    S.templates.length ? ul : null, form);
}

/* ---------- Reihenfolge der Abteilungen wie im eigenen Laden ---------- */
function orderSheet() {
  var L = cur(), ul = el("ul", { class: "lists order" });
  function arr() { return L.order || S.order; }
  /* gilt die Reihenfolge für alle Listen oder nur für diese (anderer Laden)? */
  var bAll = el("button", { type: "button", text: "Alle Listen", on: { click: function () { delete L.order; save(); render(); fill(); } } });
  var bOwn = el("button", { type: "button", text: "Nur „" + L.name + "“", on: { click: function () { if (!L.order) L.order = S.order.slice(); save(); render(); fill(); } } });
  var seg = el("div", { class: "seg", role: "group", "aria-label": "Gilt für" }, bAll, bOwn);
  function fill(focus) {
    ul.textContent = "";
    bAll.setAttribute("aria-pressed", L.order ? "false" : "true"); bOwn.setAttribute("aria-pressed", L.order ? "true" : "false");
    arr().forEach(function (ci, pos) {
      function move(d) {
        return function () {
          var o = arr(), j = pos + d; if (j < 0 || j >= o.length) return;
          o.splice(j, 0, o.splice(pos, 1)[0]); save(); render(); fill([j, d]);
        };
      }
      var up = el("button", { class: "mv", type: "button", "aria-label": CATS[ci] + " nach oben", disabled: pos === 0, text: "↑", on: { click: move(-1) } });
      var down = el("button", { class: "mv", type: "button", "aria-label": CATS[ci] + " nach unten", disabled: pos === arr().length - 1, text: "↓", on: { click: move(1) } });
      ul.appendChild(el("li", {}, el("span", { class: "oico" }, glyph(EMO_DEF[ci])), el("span", { class: "name", text: CATS[ci] }), up, down));
      if (focus && focus[0] === pos) { var b = focus[1] < 0 ? up : down; if (b.disabled) b = focus[1] < 0 ? down : up; setTimeout(function () { if (b.focus) b.focus(); }, 0); }
    });
  }
  fill();
  openSheet("Reihenfolge im Laden", el("h3", { text: "Reihenfolge im Laden" }),
    el("p", { class: "lead", text: "Bring die Abteilungen in die Reihenfolge, in der du durch deinen Laden gehst. Die Liste sortiert sich danach." }),
    seg, ul,
    el("div", { class: "row" },
      el("button", { class: "btn", type: "button", text: "Zurücksetzen", on: { click: function () {
        var o = arr(); o.length = 0; CATS.forEach(function (c, i) { o.push(i); }); save(); render(); fill();
      } } }),
      el("button", { class: "btn primary", type: "button", text: "Fertig", on: { click: closeSheet } })));
}

/* ---------- Teilen ohne Server: die Liste steckt im Link ---------- */
function b64e(str) {
  var b = new TextEncoder().encode(str), s = "";
  for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64d(s) {
  s = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  var b = new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
  return new TextDecoder().decode(b);
}
function shareList() {
  var L = cur(), open = L.items.filter(function (i) { return !i.done; });
  if (!open.length) { notify("Auf der Liste steht nichts Offenes"); return; }
  var data = { n: L.name, i: open.map(function (i) { return i.note ? [i.name, i.note] : [i.name]; }) };
  var url = location.origin + location.pathname + "#l=" + b64e(JSON.stringify(data));
  var text = L.name + "\n" + open.map(function (i) { return "– " + i.name + (i.note ? " (" + i.note + ")" : ""); }).join("\n");
  function copy() {
    try {
      navigator.clipboard.writeText(text + "\n\n" + url).then(function () { notify("Liste mit Link kopiert"); }, function () { notify("Kopieren nicht möglich"); });
    } catch (e) { notify("Teilen ist in diesem Browser nicht möglich"); }
  }
  if (navigator.share) navigator.share({ title: L.name, text: text + "\n\nIn den Einkaufszettel übernehmen:", url: url }).catch(function (e) { if (!e || e.name !== "AbortError") copy(); });
  else copy();
}
/* Geteilte Liste aus dem Link lesen. Übernommen wird nur Text in begrenzter Länge. */
function readShared(text) {
  var m = /#l=([A-Za-z0-9_-]+)/.exec(text || "");
  if (!m) return null;
  try {
    var d = JSON.parse(b64d(m[1]));
    if (!d || typeof d.n !== "string" || !Array.isArray(d.i)) return null;
    var items = d.i.slice(0, 300).filter(function (x) { return Array.isArray(x) && typeof x[0] === "string" && x[0].trim(); })
      .map(function (x) { return { name: x[0].trim().slice(0, 80), note: typeof x[1] === "string" ? x[1].trim().slice(0, 40) : "" }; });
    return items.length ? { name: d.n.trim().slice(0, 40) || "Geteilte Liste", items: items } : null;
  } catch (e) { return null; }
}
/* Ohne Angabe wird der Link in der Adresszeile gelesen (Aufruf beim Start und bei hashchange) */
function importSheet(d) {
  if (!d || !d.items) d = readShared(location.hash);
  if (!d) return false;
  function done() { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  var prev = d.items.slice(0, 8).map(function (x) { return x.name; }).join(", ") + (d.items.length > 8 ? " …" : "");
  openSheet("Geteilte Liste", el("h3", { text: "Liste übernehmen?" }),
    el("p", { class: "lead" }, el("b", { text: d.name }), " · " + d.items.length + " Artikel"),
    el("p", { class: "lead", text: prev }),
    el("div", { class: "row" },
      el("button", { class: "btn", type: "button", text: "Zu „" + cur().name + "“", on: { click: function () { done(); closeSheet(); applyItems(d.items, "„" + d.name + "“"); } } }),
      el("button", { class: "btn primary", type: "button", text: "Als neue Liste", on: { click: function () {
        done(); var l = { id: uid(), name: d.name, items: [] }; S.lists.push(l); S.active = l.id; S.example = false;
        d.items.forEach(function (x) { l.items.push(mk(x.name, x.note)); });
        save(); render(); closeSheet(); notify("Liste „" + d.name + "“ übernommen");
      } } })));
  return true;
}

/* In der installierten App kommt ein geteilter Link nicht von selbst an (auf dem iPhone öffnet er Safari).
   Hier lässt er sich aus der Nachricht einfügen. */
function pasteSheet() {
  var inp = el("input", { id: "f-link", type: "text", placeholder: "Link oder ganze Nachricht einfügen", autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
  var err = el("p", { class: "notice", role: "alert", hidden: true, text: "Darin steckt keine geteilte Liste. Kopiere die ganze Nachricht mit dem Link." });
  function take(v) { var d = readShared(v); if (d) importSheet(d); else { err.hidden = false; inp.focus(); } }
  var form = el("form", { on: { submit: function (e) { e.preventDefault(); take(inp.value); } } },
    el("div", { class: "inline" },
      el("label", { class: "field", for: "f-link" }, "Geteilter Link", inp),
      el("button", { class: "btn primary", type: "submit", text: "Übernehmen" })));
  var clip = typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.readText
    ? el("button", { class: "btn block", type: "button", text: "Aus der Zwischenablage einfügen", on: { click: function () {
        navigator.clipboard.readText().then(function (t) { inp.value = t; take(t); }, function () { inp.focus(); });
      } } }) : null;
  openSheet("Geteilte Liste einfügen", el("h3", { text: "Geteilte Liste einfügen" }),
    el("p", { class: "lead", text: "Kopiere die Nachricht mit dem Link und füge sie hier ein." }), clip, form, err);
}

checkTidy();
applyTheme();
render();

/* ---------- Alles ab hier braucht einen echten Browser ---------- */
var INSTALL = null;
if (typeof window !== "undefined" && window.matchMedia) (function () {
  var APP_URL = "einkauf.micana.de", GATE_KEY = "einkaufszettel.gateSkip";

  /* Zoom durch Spreizen in Safari unterbinden (gesturestart gibt es nur dort) */
  ["gesturestart", "gesturechange"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
  });

  /* Bildschirm anlassen, solange die App zu sehen ist. Der Browser gibt die Sperre frei, sobald man wegwechselt. */
  function wake() {
    if (!navigator.wakeLock || document.visibilityState !== "visible") return;
    try { navigator.wakeLock.request("screen").catch(function () {}); } catch (e) {}
  }
  document.addEventListener("visibilitychange", wake);
  wake();
  /* beim Zurückkehren prüfen, ob Erledigtes vom letzten Einkauf herumliegt */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && !tidy && checkTidy() && !searchOpen) render();
  });

  /* ---- Spracheingabe: Knopf im Suchfeld, nur wo der Browser sie kann. Die Erkennung macht der Browser,
     bei Chrome und Safari auf den Servern des Herstellers; die App selbst schickt nichts weg. ---- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, mic = $("mic");
  if (SR && mic) {
    var rec = null;
    mic.hidden = false;
    mic.addEventListener("click", function () {
      if (rec) { rec.stop(); return; }
      var r = new SR(), heard = "";
      r.lang = "de-DE"; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = function (e) { for (var i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) heard += " " + e.results[i][0].transcript; };
      r.onerror = function (e) {
        notify(e.error === "not-allowed" || e.error === "service-not-allowed" ? "Mikrofon ist nicht erlaubt" : e.error === "network" ? "Spracheingabe braucht Internet" : e.error === "no-speech" ? "Nichts gehört" : "Spracheingabe nicht möglich");
      };
      r.onend = function () {
        rec = null; mic.classList.remove("on"); mic.setAttribute("aria-pressed", "false"); q.placeholder = "Artikel hinzufügen";
        var items = splitItems(heard.trim(), true);
        if (items.length) pickMany(items);
      };
      try { r.start(); rec = r; mic.classList.add("on"); mic.setAttribute("aria-pressed", "true"); q.placeholder = "Ich höre zu …"; }
      catch (e) { notify("Spracheingabe nicht möglich"); }
    });
  }

  /* ---- Als App installieren: Hinweise je Gerät, einmaliger Vollbild-Hinweis, danach ein Balken oben ---- */
  var deferredPrompt = null, appInstalled = false;
  function platform() {
    var ua = navigator.userAgent;
    var standalone = matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true;
    var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var android = /Android/.test(ua);
    var inapp = /Instagram|FBAN|FBAV|Line\/|Telegram|WhatsApp|TikTok|; wv\)/i.test(ua);
    var browser = "other";
    if (inapp) browser = "inapp";
    else if (ios) browser = /CriOS/.test(ua) ? "chrome" : /FxiOS/.test(ua) ? "firefox" : /EdgiOS/.test(ua) ? "edge" : /Safari/.test(ua) ? "safari" : "other";
    else if (android) browser = /SamsungBrowser/.test(ua) ? "samsung" : /Firefox/.test(ua) ? "firefox" : /EdgA/.test(ua) ? "edge" : /OPR|Opera/.test(ua) ? "opera" : /Chrome/.test(ua) ? "chrome" : "other";
    else browser = /Edg\//.test(ua) ? "edge" : /Chrome/.test(ua) ? "chrome" : /Firefox/.test(ua) ? "firefox" : /Safari/.test(ua) ? "safari" : "other";
    return { os: ios ? "ios" : android ? "android" : "desktop", browser: browser, standalone: standalone };
  }
  /* Schritte je Gerät; {S} steht für das Teilen-Symbol */
  function installSteps(os, browser) {
    var add = "Auf „Hinzufügen“ tippen.", menu = "Auf das Menü ⋮ tippen.", ok = "Bestätigen.";
    var I = {
      "ios-safari": ["Unten (iPhone) bzw. oben (iPad) auf das Teilen-Symbol {S} tippen.", "Nach unten scrollen und „Zum Home-Bildschirm“ wählen.", "Oben rechts auf „Hinzufügen“ tippen."],
      "ios-chrome": ["Oben rechts in der Adresszeile auf das Teilen-Symbol {S} tippen.", "„Zum Home-Bildschirm“ wählen (eventuell erst „Mehr“ antippen).", add],
      "ios-firefox": ["Unten rechts auf das Menü ☰ tippen.", "„Teilen“ wählen, dann „Zum Home-Bildschirm“.", add],
      "ios-edge": ["Unten auf das Menü ⋯ tippen, dann auf „Teilen“ {S}.", "„Zum Home-Bildschirm“ wählen.", add],
      "ios-other": ["Öffne diese Seite in Safari (Adresse kopieren und in Safari einfügen).", "Dann Teilen {S} → „Zum Home-Bildschirm“ → „Hinzufügen“."],
      "android-chrome": ["Oben rechts auf das Menü ⋮ tippen.", "„App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen.", "Mit „Installieren“ bestätigen."],
      "android-samsung": ["Unten rechts auf das Menü ☰ tippen.", "„Seite hinzufügen zu“ wählen, dann „Startbildschirm“.", "Mit „Hinzufügen“ bestätigen."],
      "android-firefox": [menu, "„Installieren“ bzw. „Zum Startbildschirm hinzufügen“ wählen.", "Mit „Hinzufügen“ bestätigen."],
      "android-edge": ["Unten auf das Menü ⋯ tippen.", "„Zum Telefon hinzufügen“ bzw. „App installieren“ wählen.", ok],
      "android-opera": [menu, "„Zum Startbildschirm hinzufügen“ wählen.", ok],
      "android-other": ["Öffne diese Seite am besten in Chrome.", "Menü ⋮ → „App installieren“."],
      "inapp": ["Du hast die Seite aus einer App (z. B. WhatsApp oder Telegram) geöffnet. Von dort kann man nichts installieren.", "Tippe oben rechts auf ⋯ bzw. ⋮ und wähle „Im Browser öffnen“.", "Dann erscheint die passende Anleitung."],
      "desktop-chrome": ["Rechts in der Adresszeile auf das Installieren-Symbol (Bildschirm mit Pfeil) klicken.", "„Installieren“ bestätigen.", "Noch praktischer: diese Seite am Handy öffnen."],
      "desktop-edge": ["Rechts in der Adresszeile auf „App verfügbar“ klicken.", "„Installieren“ bestätigen."],
      "desktop-safari": ["Im Menü „Ablage“ → „Zum Dock hinzufügen“ wählen."],
      "desktop-other": ["Am besten öffnest du die Seite auf deinem Smartphone: " + APP_URL]
    };
    return I[browser === "inapp" ? "inapp" : os + "-" + browser] || I[os + "-other"] || I["desktop-other"];
  }
  function shareIcon() {
    var s = document.createElementNS(SVGNS, "svg"), p = document.createElementNS(SVGNS, "path");
    s.setAttribute("class", "shareic"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-label", "Teilen");
    p.setAttribute("d", "M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"); s.appendChild(p);
    return s;
  }
  function stepList(steps) {
    var ol = el("ol", { class: "steps" });
    steps.forEach(function (t) {
      var li = el("li", {}), parts = t.split("{S}");
      parts.forEach(function (x, i) { if (i) li.appendChild(shareIcon()); li.appendChild(document.createTextNode(x)); });
      ol.appendChild(li);
    });
    return ol;
  }
  var OS_NAME = { ios: "iPhone / iPad", android: "Android", desktop: "Computer" };
  var BR_NAME = { safari: "Safari", chrome: "Chrome", firefox: "Firefox", edge: "Edge", samsung: "Samsung Internet", opera: "Opera", inapp: "In-App-Browser", other: "Browser" };
  function nativeBtn() {
    return el("button", { class: "btn primary block", type: "button", "data-native": "", hidden: !deferredPrompt, text: "Jetzt installieren", on: { click: nativeInstall } });
  }
  function installGuide(os, browser, compact) {
    return el("div", { class: "guide" },
      el("p", { class: "det", text: "Erkannt: " + OS_NAME[os] + " · " + BR_NAME[browser] }),
      nativeBtn(), stepList(installSteps(os, browser)),
      compact ? null : el("p", { class: "lead", text: "Danach findest du „Einkauf“ als Symbol auf dem Startbildschirm. Die App startet ohne Adresszeile und funktioniert auch ohne Netz." }));
  }
  function installed() {
    appInstalled = true; S.installSeen = true; save();
    if (!veil.hidden && sheet.getAttribute("aria-label") === "Als App installieren") closeSheet();
    if ($g("gate")) gate(true);
  }
  function nativeInstall() {
    if (!deferredPrompt) return;
    var p = deferredPrompt; deferredPrompt = null; p.prompt();
    p.userChoice.then(function (r) { if (r.outcome === "accepted") installed(); });
  }
  function $g(id) { return document.getElementById(id); }
  function rm(id) { var e = $g(id); if (e) e.remove(); }
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferredPrompt = e;
    Array.prototype.forEach.call(document.querySelectorAll("[data-native]"), function (b) { b.hidden = false; });
  });
  window.addEventListener("appinstalled", function () { installed(); notify("App installiert"); });
  function gateSkipped() { try { return !!localStorage.getItem(GATE_KEY); } catch (e) { return false; } }
  /* Prüft (Chrome auf Android), ob die App schon installiert ist – dann soll man sie öffnen statt im Browser weiterzumachen */
  function detectInstalled() {
    try {
      if (!navigator.getInstalledRelatedApps) return Promise.resolve(appInstalled);
      return navigator.getInstalledRelatedApps().then(function (a) { if (a && a.length) appInstalled = true; return appInstalled; }, function () { return appInstalled; });
    } catch (e) { return Promise.resolve(appInstalled); }
  }
  /* Seite „Als App installieren“ aus dem Menü: eigenes Gerät, darunter die anderen */
  function installSheet() {
    var p = platform();
    var others = el("div", { class: "others" });
    [["ios", "safari"], ["ios", "chrome"], ["android", "chrome"], ["android", "samsung"], ["android", "firefox"]].forEach(function (x) {
      if (x[0] === p.os && x[1] === p.browser) return;
      others.appendChild(el("details", {}, el("summary", { text: OS_NAME[x[0]] + " · " + BR_NAME[x[1]] }), stepList(installSteps(x[0], x[1]))));
    });
    openSheet("Als App installieren", el("h3", { text: "Als App installieren" }),
      p.standalone ? el("p", { class: "notice ok", text: "Die App ist bereits installiert." }) : null,
      el("div", { class: "card" }, el("h4", { text: "Dein Gerät" }), installGuide(p.os, p.browser)),
      el("h4", { text: "Andere Geräte" }), others);
  }
  /* Handy oder Tablet im Browser: beim ersten Mal ein Vollbild-Hinweis, danach nur der Balken oben */
  function gate(force) {
    var p = platform(), mobile = p.os !== "desktop";
    rm("nag"); document.body.classList.remove("nagged");
    if (p.standalone) { rm("gate"); document.body.classList.remove("gated"); $("app").inert = !veil.hidden; return; }
    if (!mobile) return desktopSheet(p);
    if (!force && gateSkipped()) { rm("gate"); return nag(); }
    function draw() {
      var g = $g("gate");
      if (!g) { g = el("div", { id: "gate", class: "gate", role: "dialog", "aria-modal": "true", "aria-labelledby": "gate-h" }); document.body.appendChild(g); }
      g.textContent = "";
      var inner = el("div", { class: "gate-in" },
        el("div", { class: "gate-top" }, el("img", { src: "icons/icon.svg", alt: "", width: "32", height: "32" }), el("b", { text: "Einkaufszettel" })));
      if (appInstalled) {
        inner.appendChild(el("h1", { id: "gate-h", tabindex: "-1", text: "Die App ist installiert" }));
        inner.appendChild(el("p", { class: "notice ok", text: "Öffne sie jetzt über das Symbol „Einkauf“ auf deinem Startbildschirm. Dieses Browserfenster kannst du schließen." }));
      } else {
        inner.appendChild(el("h1", { id: "gate-h", tabindex: "-1", text: "Zuerst die App installieren" }));
        var card = el("div", { class: "card gate-card" }, el("h4", { text: "So geht's" }), installGuide(p.os, p.browser, true));
        if (p.browser === "inapp" || p.browser === "other") card.appendChild(el("button", { class: "btn", type: "button", text: "Adresse kopieren", on: { click: function () {
          try { navigator.clipboard.writeText("https://" + APP_URL).then(function () { notify("Adresse kopiert – im Browser einfügen"); }, function () { notify(APP_URL); }); } catch (e) { notify(APP_URL); }
        } } }));
        inner.appendChild(card);
        inner.appendChild(el("ul", { class: "gate-why" },
          el("li", {}, el("b", { text: "Immer auf dem Startbildschirm" }), " – wie eine richtige App."),
          el("li", {}, el("b", { text: "Funktioniert ohne Internet" }), " – auch im Laden."),
          el("li", {}, el("b", { text: "Deine Listen sind sicherer" }), " – der Browser löscht sie nicht so leicht.")));
        if (p.os === "ios" && p.browser !== "inapp") inner.appendChild(el("p", { class: "notice" }, "Wichtig auf iPhone und iPad: Was du hier im Browser einträgst, wird ", el("b", { text: "nicht" }), " in die installierte App übernommen. Installiere deshalb zuerst."));
      }
      inner.appendChild(el("button", { class: "gate-skip", type: "button", text: appInstalled ? "Trotzdem im Browser weiter" : "Ohne Installation im Browser weiter", on: { click: function () {
        try { localStorage.setItem(GATE_KEY, String(Date.now())); } catch (e) {}
        rm("gate"); document.body.classList.remove("gated"); $("app").inert = !veil.hidden; nag();
      } } }));
      g.appendChild(inner);
    }
    draw();
    document.body.classList.add("gated"); $("app").inert = true;
    if (!force && !appInstalled) detectInstalled().then(function (x) { if (x && $g("gate")) draw(); });
    var h = $g("gate-h"); if (h && h.focus) h.focus();
  }
  /* Balken oben, solange die App im Browser läuft */
  function nag() {
    if ($g("nag")) return;
    var b = el("button", { id: "nag", class: "nag", type: "button", on: { click: function () { gate(true); } } },
      el("b", { text: "App nicht installiert" }), el("span", { class: "go", text: "Installieren ›" }));
    document.body.insertBefore(b, document.body.firstChild); document.body.classList.add("nagged");
    document.documentElement.style.setProperty("--nag-h", b.offsetHeight + "px");
  }
  /* Computer: nur ein Hinweis, einmal */
  function desktopSheet(p) {
    var later = false; try { later = !!sessionStorage.getItem("einkaufszettel.sheetLater"); } catch (e) {}
    if (S.installSeen || later || !veil.hidden) return;
    openSheet("Als App speichern", el("h3", { text: "Als App speichern" }),
      el("p", { class: "lead", text: "So hast du den Einkaufszettel immer griffbereit – auch ohne Internet. Am bequemsten ist er am Handy." }),
      installGuide(p.os, p.browser, true),
      el("div", { class: "row" },
        el("button", { class: "btn", type: "button", text: "Später", on: { click: function () { try { sessionStorage.setItem("einkaufszettel.sheetLater", "1"); } catch (e) {} closeSheet(); } } }),
        el("button", { class: "btn primary", type: "button", text: "Verstanden", on: { click: function () { S.installSeen = true; save(); closeSheet(); } } })));
  }
  INSTALL = { platform: platform, sheet: installSheet };

  /* ---- Blatt nach unten wegwischen: Es wandert mit dem Finger mit. Nach genug Weg oder Schwung schließt es,
     sonst federt es zurück. Gilt nur, wenn das Blatt oben steht, damit lange Blätter weiter rollen. ---- */
  (function () {
    var y0 = 0, x0 = 0, t0 = 0, dy = 0, drag = false, track = false;
    var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function reset() { sheet.style.transition = ""; sheet.style.transform = ""; sheet.style.animation = ""; veil.style.backgroundColor = ""; }
    sheet.addEventListener("touchstart", function (e) {
      var tg = e.target;
      track = e.touches.length === 1 && sheet.scrollTop <= 0 && !(tg.closest && tg.closest("input,select,textarea"));
      drag = false; dy = 0; y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; t0 = Date.now();
    }, { passive: true });
    sheet.addEventListener("touchmove", function (e) {
      if (!track) return;
      var d = e.touches[0].clientY - y0, dx = e.touches[0].clientX - x0;
      if (!drag) {
        if (d > 8 && d > Math.abs(dx) * 1.5) { drag = true; sheet.style.transition = "none"; sheet.style.animation = "none"; }
        else { if (d < -8 || Math.abs(dx) > 12) track = false; return; }
      }
      if (e.cancelable) e.preventDefault();
      dy = Math.max(0, d);
      sheet.style.transform = "translateY(" + dy + "px)";
      veil.style.backgroundColor = "rgba(8,14,10," + (0.55 * Math.max(0, 1 - dy / 420)).toFixed(3) + ")";
    }, { passive: false });
    function end() {
      if (!drag) { track = false; return; }
      drag = false; track = false;
      var speed = dy / Math.max(1, Date.now() - t0), close = dy > 120 || (dy > 40 && speed > 0.5);
      sheet.style.transition = calm ? "none" : "transform .18s ease-out";
      if (close) {
        sheet.style.transform = "translateY(100%)";
        setTimeout(function () { reset(); closeSheet(); }, calm ? 0 : 180);
      } else {
        sheet.style.transform = ""; veil.style.backgroundColor = "";
        setTimeout(reset, 200);
      }
    }
    sheet.addEventListener("touchend", end);
    sheet.addEventListener("touchcancel", end);
  })();

  /* Geteilte Liste aus dem Link anbieten; am Computer erst danach der Installationshinweis */
  var shared = importSheet();
  window.addEventListener("hashchange", importSheet);
  if (!(shared && platform().os === "desktop")) gate();

  /* ---- Offline-Nutzung und Hinweis auf eine neue Version (nur über https oder lokal, nicht bei file://) ---- */
  function showUpdate(worker) {
    if ($g("update")) return;
    var btn = el("button", { type: "button", text: "Jetzt laden" });
    btn.addEventListener("click", function () { reloading = true; save(); btn.textContent = "Lädt …"; worker.postMessage({ type: "SKIP_WAITING" }); });
    document.body.appendChild(el("div", { id: "update", class: "update", role: "status" }, el("b", { text: "Neue Version verfügbar" }), btn));
  }
  var reloading = false;
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    /* Neu geladen wird nur nach dem Tipp auf „Jetzt laden“, nie von selbst mitten im Einkauf */
    navigator.serviceWorker.addEventListener("controllerchange", function () { if (reloading) { reloading = false; location.reload(); } });
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        function offer(w) { if (w && navigator.serviceWorker.controller) showUpdate(w); }
        if (reg.waiting) offer(reg.waiting);
        reg.addEventListener("updatefound", function () {
          var w = reg.installing;
          if (w) w.addEventListener("statechange", function () { if (w.state === "installed") offer(w); });
        });
        /* beim Zurückkehren in die App nach einer neuen Version schauen */
        document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") reg.update().catch(function () {}); });
      }).catch(function () {});
    });
  }
})();
