"use strict";
/* DATA (Abteilungen mit Artikeln) und SYNRAW (Synonyme) kommen aus katalog.js, das src/gen.py erzeugt. */
var KEY = "einkaufszettel.v1";
var CATS = DATA.map(function (d) { return d[0]; });
var SONST = CATS.length - 1;
var STARTERS = ["Vollmilch","Butter","Eier 10er","Brötchen","Bananen","Äpfel","Tomaten","Gurke","Kartoffeln","Zwiebeln","Toastbrot","Spaghetti","Kaffee gemahlen","Naturjoghurt 3,5 %","Mineralwasser medium","Toilettenpapier","Käse","Möhren"];

function norm(s) {
  return s.toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/* ---------- Abteilungen: Farbe und Wortregeln ----------
   Die Regeln sortieren eigene Artikel in eine Abteilung ein (guess). Der zweite Wert je Eintrag und je Regel
   ist der Name eines früheren Linien-Symbols und wird nicht mehr ausgewertet. */
var META = {
  "Obst & Gemüse": ["#3d9140", "apple", [
    ["getrocknet|nuss|nusse|mandel|kerne|pistazie|marone|kastanie|cashew|studentenfutter|trail|rosine|sultanine|korinthe|apfelringe|chips|gojibeeren|datteln|kandiert", "nut"],
    ["mohre|karotte|pastinake|wurzel|rettich|radieschen|rube|rubchen|bete|topinambur|ingwer|kurkuma|galgant|maniok|taro", "carrot"],
    ["kartoffel|drillinge|hornchen|la ratte", "potato"],
    ["zwiebel|schalotte|knoblauch", "bulb"],
    ["pilz|champignon|pfifferling|seitling|shiitake|portobello|enoki|shimeji|morchel|truffel|rohrling", "mushroom"],
    ["chili|peperoni|jalapeno|habanero", "chili"],
    ["tomate|paprika|kurbis|granatapfel|kaki|patisson", "tomato"],
    ["banane", "banana"],
    ["zitrone|limette|orange|mandarine|clementine|grapefruit|pomelo|kumquat", "citrus"],
    ["traube", "grapes"],
    ["erdbeer", "strawberry"],
    ["kirsch|beere|physalis|litschi|pflaume|zwetschge|mirabelle|reneklode|sanddorn|hagebutte", "cherry"],
    ["birne|quitte|avocado|guave", "pear"],
    ["mais", "corn"],
    ["salat|rucola|spinat|mangold|kohl|kresse|lollo|endivie|chicoree|radicchio|batavia|frisee|pak choi|wirsing|brokkoli|romanesco|sprossen|lauch|sellerie|fenchel|spargel|bohnen|schoten|erbsen|artischock|okra|zucchini|gurke|aubergine|kraut|gemuse|coleslaw|petersilie|basilikum|dill|koriander|minze|rosmarin|thymian|salbei|oregano|majoran|estragon|kerbel|liebstock|barlauch|melisse|zitronengras|suppengrun|rhabarber|blatter|romana|portulak|postelein|lowenzahn|sauerampfer|mizuna|edamame|shiso|lorbeer|borretsch|pimpinelle|waldmeister|lavendel|stielmus|sprouts", "leaf"]]],
  "Brot & Backwaren": ["#b5732a", "bread", [
    ["croissant|hornchen|franzbrotchen", "croissant"],
    ["donut|berliner|krapfen|bagel|simit|mutzen|quarkballchen|schmalzkuchen", "donut"],
    ["brotchen|semmel|schrippe|toastie|brioche|laugen|brezel|wecken|seelen|schusterjungen|knuppel|panini|vinschgauer|buns", "bun"],
    ["kuchen|torte|stollen|schnecke|tasche|strudel|eclair|windbeutel|plunder|ecken|amerikaner|brownie|cookie|waffel|biskuit|schecke|donauwelle|bienenstich|muffin|quiche|geback|crepe|boden|ohren|stangen|keulchen|puddingbrezel|streusel|zopf|kranz|macarons|florentiner|petit|cupcake|cake|baklava|cannoli|churros|pastel|kalter hund|bananenbrot|osterbrot|weckmann", "cake"]]],
  "Milch, Käse & Eier": ["#2f7dbf", "milk", [
    ["kase|gouda|edamer|emmentaler|tilsiter|maasdamer|appenzeller|gruyere|cheddar|parmesan|grana|pecorino|manchego|mozzarella|burrata|feta|halloumi|camembert|brie\\b|gorgonzola|roquefort|limburger|romadur|obazda|provolone|scamorza|taleggio|fontina|havarti|esrom|jarlsberg|paneer|ricotta|mascarpone|babybel|leerdammer|geramont|philadelphia|exquisa|bresso|almette|kiri|raclette|fondue|comte|reblochon|munster|chaumes|cambozola|bavaria blu|stilton|danablu|morbier|vacherin|old amsterdam|mimolette|quargel|weisslacker|tete de moine", "cheese"],
    ["\\beier|eiweiss|wachtelei|vollei|eigelb", "egg"],
    ["tofu|tempeh|seitan|vegan|vegetarisch|falafel|hummus|gemuse|antipasti|oliven|guacamole|bratling|soja-|jackfruit|erbsenprotein|kichererbsen|baba|muhammara", "leaf"],
    ["butter(?!milch)|margarine|schmalz|streichfett|\\brama\\b|latta|kerrygold", "butter"],
    ["joghurt|quark|skyr|pudding|dessert|grutze|mousse|tiramisu|panna|creme|schmand|saure sahne|sour cream|milchreis|gotterspeise|activia|actimel|fruchtzwerge|monte|almighurt|dany|leckermaulchen|tzatziki|aioli|dip|taramas|tirokafteri", "cup"],
    ["nudeln|tortellini|ravioli|gnocchi|spatzle|maultaschen|knodel|klosse|suppe|salat|kaiserschmarrn|pasta|pesto|sushi", "bowl"],
    ["teig|hefe|reibekuchen|pulver", "bag"]]],
  "Fleisch, Wurst & Fisch": ["#bf463f", "steak", [
    ["schinken|prosciutto|speck|bacon|pancetta|coppa|lardo|guanciale|pastrami", "steak"],
    ["burger|patties", "burger"],
    ["fisch|lachs|forelle|saibling|zander|karpfen|kabeljau|rotbarsch|scholle|seezunge|butt\\b|dorade|barsch|pangasius|tilapia|matjes|hering|rollmops|buckling|makrele|sprotte|aal\\b|schillerlocke|garnele|krabbe|krebs|surimi|muschel|oktopus|pulpo|hummer|kaviar|rogen|sushi|sashimi|wels|hecht|schleie|marane|felchen|stor\\b|seeteufel|seehecht|leng|rotzunge|flunder|steinbeisser|knurrhahn|rotbarbe|sardine|sardelle|anchovis|kipper|gabelbissen|gambas|langustinen|kaisergranat|calamari|sepia|austern|algen|wakame", "fish"],
    ["wurst|salami|wiener|knacker|krakauer|cabanossi|debreziner|landjager|beisser|mettenden|chorizo|fuet|griller|bifi|lyoner|mortadella|salsiccia|merguez|sucuk|regensburger|braunschweiger|gottinger|pinkel|stracke|feldkieker|rauchenden", "sausage"],
    ["hahnchen|huhn|huhner|pute|ente|gans|ganse|geflugel|wachtel|chicken|kuken|fasan", "drumstick"]]],
  "Tiefkühl": ["#2a9db3", "snow", [
    ["eiswurfel|crushed", "snow"],
    ["pizza|flammkuchen|piccolinis|ristorante|ofenfrische|pinsa|calzone", "pizza"],
    ["\\beis|wassereis|stieleis|kindereis|proteineis|fruchteis|milcheis|sahneeis|nuss-eis|sorbet|frozen|magnum|cornetto|langnese|movenpick|haagen|ben & jerry|nogger", "ice"],
    ["burger", "burger"],
    ["pommes|krokett|rosti|kartoffel|wedges|fries|hash browns|potatoes", "fries"],
    ["fisch|lachs|filet|garnele|meeres|muschel|pangasius|zander|rotbarsch|scholle|calamari|surimi|kibbelinge", "fish"],
    ["chicken|hahnchen|ente\\b|enten|gans\\b|ganse|pute", "drumstick"],
    ["beer|kirsch|mango|ananas|pflaume|smoothie|rhabarber|aprikose|pfirsich|banane|obst|granatapfel", "cherry"],
    ["croissant", "croissant"],
    ["donut|berliner|quarkballchen|churros", "donut"],
    ["lasagne|nudel|tortell|ravioli|maultaschen|goreng|paella|pfanne|gyoza|dim sum|wan tan|frikassee|gulasch|cannelloni|pierogi|pelmeni|wareniki|manti|spatzle|knodel|curry|bolognese|penne|spaghetti|tagliatelle|reis|sushi|suppe|eintopf|chili con|moussaka|auflauf|gratin|bao|sommerrollen", "bowl"],
    ["brotchen|brezel|brezen|baguette|brot|ciabatta|naan", "bun"],
    ["kuchen|torte|strudel|windbeutel|waffel|germknodel|kaiserschmarrn|muffin|brownie|cheesecake|cake|crepes|pancakes|tiramisu|profiteroles|buchteln|dampfnudeln", "cake"],
    ["tk-|gemuse|spinat|vegan|veggie", "leaf"]]],
  "Nudeln, Reis & Konserven": ["#c2622b", "can", [
    ["ol\\b|essig|balsamico|zitronensaft|limettensaft|ketchup|mayo|remoulade|senf|sosse|sauce|dressing|sriracha|sambal|wurze|mirin|sirup|ponzu|tamari|ketjap|verjus|condimento|reiswein|jus\\b|kwas", "oil"],
    ["thunfisch|sardine|sardelle|makrele|hering|lachs|dorsch|muschel|krabben dose|sprotten|saupiquet|hawesta|appel", "fish"],
    ["glas|gurke|cornichon|pickle|oliven|kapern|eingelegt|pesto|ajvar|aufstrich|chutney|kimchi|paste|mus\\b|mark\\b|kompott|meerrettich|schattenmorellen|sauerkraut|dip|fond|tahini|harissa|letscho|silberzwiebeln|hengstenberg|sugo|salsa|creme|tapenade|antipasti|gochujang|doenjang|adschika|salca|ghee|smetana|tworog", "jar"],
    ["nudel|spaghetti|linguine|tagliatelle|fettuccine|pappardelle|penne|rigatoni|fusilli|spirelli|farfalle|makkaroni|tortiglioni|conchiglie|orecchiette|cannelloni|lasagne|spatzle|knopfle|tortell|ravioli|gnocchi|reis|couscous|bulgur|quinoa|hirse|polenta|griess|buchweizen|amaranth|grunkern|graupen|dinkel|weizen|suppe|eintopf|topf|terrine|risotto|gericht|curry|dal\\b|masala|barilla|buitoni|miracoli|labskaus|soljanka|borschtsch|minestrone|oryza|gulasch|bigos|zurek|becher|pasta|orzo|risoni|bucatini|capellini|vermicelli|paccheri|trofie|gemelli|somen|kritharaki|paneer", "bowl"],
    ["bruhe|bouillon|fix\\b|binder|pulver|wurfel|panko|mehl|chips|rostzwiebeln|taco|kit\\b|blatter|papier|papadam|glucks|salatkerne|wurzmischung|tute|mix\\b|flocken|tortillas|zucker|kombu|wakame|furikake|hefe", "bag"]]],
  "Backen & Gewürze": ["#a37f22", "bag", [
    ["kerzen", "candle"],
    ["sirup|dicksaft|aroma|extrakt|flussig|rosenwasser|goldsaft", "oil"],
    ["kuverture|schoko|kakao|nougat|marzipan|glasur|callets|cake melts", "choc"],
    ["konfiture|fullung|mark\\b|paste|aprikotur|gelee", "jar"],
    ["salz|pfeffer|paprika|chili|curry|kurkuma|kummel|koriander|kardamom|zimt|nelken|muskat|piment|anis|fenchel|senfkorner|wacholder|lorbeer|ingwer|knoblauch|zwiebel|safran|getrocknet|krauter|gewurz|masala|hanout|zatar|sumach|bockshorn|wurzmischung|vanille gemahlen|\\brub\\b|beeren|bluten|baharat|berbere|dukkah|chermoula|pumpkin|macis|tonka|galgant|amchur|asafoetida|ajowan|namak|beifuss", "shaker"]]],
  "Frühstück, Kaffee & Tee": ["#8a5a3c", "jar", [
    ["kaffee|espresso|crema|cappuccino|latte|kakao|trinkschokolade|nescafe|jacobs|dallmayr|lavazza|senseo|nespresso|tassimo|nesquik|kaba|ovomaltine|mokka|ristretto|cold brew(?!-tee)|golden-milk", "coffee"],
    ["tee\\b|teemischung|teekapseln|earl grey|darjeeling|sencha|matcha|chai|teekanne|heisse zitrone|kandis", "tea"],
    ["riegel|flapjack|fruchtschnitte", "choc"],
    ["flocken|musli|porridge|granola|cornflakes|cerealien|pops|kissen|ringe|flakes|kleie|frosties|smacks|krispies|oats|crunch|haferbrei|puffreis|gepufft|biscuits|weizenkeime|hafermark|chia", "bowl"]]],
  "Süßes & Snacks": ["#c2477d", "candy", [
    ["popcorn", "popcorn"],
    ["lutscher|zuckerstange|schleckmuschel", "lollipop"],
    ["keks|cookie|waffel|biskuit|spekulatius|lebkuchen|pfeffernusse|pfefferkuchen|zimtsterne|kipferl|printen|baumkuchen|amarettini|cantuccini|shortbread|soft cake|kuchen|russisch brot|geback|milchschnitte|prinzenrolle|oreo|pick up|makronen|filinchen|knacke|hanuta|knoppers|platzchen|heidesand|hippen|engelsaugen|husarenkrapfen|spitzbuben|barentatzen|magenbrot|fruchtebrot|stollen", "cookie"],
    ["chips|flips|salz|brezel|cracker|erdnuss|erdnusse|cashew|pistazie|mandeln|macadamia|nuss-frucht|nussmix|nachos|laugen|kichererbsen|wasabi|snack|jerky|biltong|trockenfleisch|pringles|erdnusslocken|nicnac|knabber|sticks|stangen|ringe|ballchen|studentenfutter|pekannusse|walnusse|kerne|edamame|mais geroste|party-mix|grissini|reisgeback", "bag"],
    ["schoko|praline|marzipan|nougat|riegel|mozartkugel|domino|advent|milka|ritter sport|kinder |duplo|toffifee|merci|ferrero|raffaello|mon cheri|lindt|after eight|snickers|\\bmars\\b|twix|bounty|milky way|kitkat|\\blion\\b|m&m|smarties|halloren|knusperflocken|bambina|minztafelchen|uberraschungsei|weinbrandbohnen|rumkugeln|krokant|ostereier|-eier", "choc"]]],
  "Getränke": ["#5a6cd4", "bottle", [
    ["ginger ale|ginger beer|spicy ginger|tonic|bitter lemon|soda|wasser|cola(?!bier)|sirup|wild berry", "bottle"],
    ["saft|nektar|schorle|smoothie|shot\\b|trinkpackchen|eistee|limo|brause|hohes c|granini|punica|valensina|rotbackchen|capri|drink|trinkmahlzeit", "glass"],
    ["bier|\\b(pils|helles|export|lager|ipa|radler|marzen|gose|kolsch|cider|stout|porter|tripel|kriek|russ)\\b|\\bale\\b|weizen(?!korn)|bock\\b|berliner weisse|malztrunk|partyfass|radeberger|wernesgruner|kostritzer|krostitzer|sternburg|freiberger|feldschlosschen|beck's|krombacher|bitburger|warsteiner|veltins|erdinger|paulaner|franziskaner|augustiner|jever|flensburger|hasseroder", "beer"],
    ["cocktail|mojito|caipirinha|colada|\\bgin\\b|wodka|\\brum\\b|whisk|tequila|mezcal|pisco|likor|schnaps|korn\\b|\\bbrand\\b|brand\\b|geist\\b|obstler|grappa|ouzo|raki|aquavit|amaretto|sambuca|absinth|cachaca|curacao|triple sec|maraschino|barenfang|bitter|fernet|amaro|pastis|genever|cognac|armagnac|calvados|brandy|bourbon|scotch|limoncello|jagermeister|baileys|ramazzotti|berentzen|angostura|spirituose|saurer apfel|rumtopf|kirschwasser|zwetschgenwasser|williamsbirne|doppelkorn", "cocktail"],
    ["wein|sekt|secco|prosecco|champagner|\\bcava\\b|cremant|piccolo|\\bhugo\\b|riesling|thurgau|silvaner|burgunder|chardonnay|sauvignon|pinot|traminer|dornfelder|merlot|shiraz|tempranillo|rioja|chianti|primitivo|montepulciano|bordeaux|lambrusco|sherry|wermut|aperitif|aperol|federweisser|veltliner|zweigelt|blaufrankisch|lemberger|trollinger|portugieser|regent|malbec|syrah|zinfandel|sangiovese|barolo|barbera|valpolicella|amarone|avola|rhone|beaujolais|chablis|sancerre|elbling|kerner|bacchus|scheurebe|gutedel|rivaner|muskateller|verdejo|albarino|vinho|soave|lugana|vermentino|rose\\b|weissherbst|rotling|blanc de|spatlese|auslese|kabinett|madeira|marsala|retsina|sangria|bowle|punsch|jagertee|met\\b|sake|frizzante|spumante|asti|spritz", "wine"]]],
  "Drogerie & Gesundheit": ["#8a55c7", "pump", [
    ["zahnburste|aufsteckburste|interdental|zahnseide|zungenreiniger|zahnholzer|munddusche", "brush"],
    ["rasier|bart|epilier|scherkopf|haarschneider", "razor"],
    ["lippenstift|lipgloss|lipliner|mascara|eyeliner|kajal|lidschatten|make-up|foundation|concealer|rouge|\\bpuder\\b|kompaktpuder|loser puder|bronzer|highlighter|primer|wimpern|augenbrauen|nagellack|kosmetik|schmink|kunstnagel|unterlack|uberlack|bb-cream|cc-cream", "lipstick"],
    ["kamm|burste|haarband|haarreif|haarspange|haarnadel|haargummi|haarklammer|scrunchie|lockenwickler|haarnetz|duttkissen|haarschere", "comb"],
    ["parfum|eau de|bodyspray|duftset|aftershave|korperspray", "perfume"],
    ["sonnen|after sun|after-sun|selbstbrauner", "sun"],
    ["thermometer|blutdruck|pulsoximeter|waage|teststreifen|schnelltest", "thermometer"],
    ["pflaster|verband|binde\\b|mullbinde|kompresse|tape|hansaplast|wundauflage|dreiecktuch|erste-hilfe", "plaster"],
    ["tablette|vitamin|magnesium|calcium|\\bzink|eisen|kapseln|baldrian|protein|hustensaft|tropfen|elektrolyt|bonbons|pastillen|ibuprofen|paracetamol|zapfchen|mittel\\b|probiotika|biotin|selen|jod|kalium|kieselerde|kollagen|coenzym|omega|lebertran|algenol|spirulina|chlorella|maca|ashwagandha|ginseng|melatonin|mariendistel|whey|casein|kreatin|bcaa|folsaure|heilerde|traubenzucker", "pill"],
    ["tucher|watte|binden|slipeinlagen|tampons|einlagen|always|pads\\b", "roll"],
    ["dusch|shampoo|seife|\\bdeo|spulung|haar|bad\\b|bade|schaumbad|waschlotion|waschgel|lotion|spray|serum|ol\\b|wasser|tonic|reinigung|desinfektion", "pump"],
    ["zahnpasta|zahncreme|zahngel|creme|cream|salbe|gel\\b|balsam|korperbutter|colgate|odol|elmex|aronal|blend-a-med|sensodyne|labello|bepanthen|lippen|vaseline|melkfett|sheabutter|hirschtalg|maske|peeling", "tube"]]],
  "Haushalt & Putzen": ["#1f9783", "box", [
    ["toilettenpapier|kuchenrolle|servietten|papierhandtucher|folie|backpapier|butterbrotpapier", "roll"],
    ["waschmittel|weichspuler|spulmittel|klarspuler|hygienespuler|persil|ariel|\\bspee\\b|weisser riese|lenor|perwoll|pril|fairy", "jug"],
    ["kleiderbugel|hosenbugel|kleidersack", "hanger"],
    ["bugel|dampfglatter", "iron"],
    ["mull|gelbe sacke|sacke|treteimer|kosmetikeimer", "bin"],
    ["eimer", "bucket"],
    ["beutel", "bag"],
    ["batterie|knopfzelle|akku(?!sauger)", "battery"],
    ["gluhbirne|lampe|leuchtstoff|leuchtmittel|led-|lichterkette|nachtlicht|laterne|windlicht", "lamp"],
    ["kerze|teelicht|grablicht", "candle"],
    ["pfanne|wok\\b", "pan"],
    ["kochtopf|topfset|schnellkochtopf|milchtopf|kasserolle|brater|auflaufform|dampfgar|slow cooker|fondue", "cookpot"],
    ["grill|anzund|kohle|brikett|brenn|kamin|feuer|streichholz|zundholz|gas|fackel|lampenol|raucher", "flame"],
    ["geschenkpapier|geschenkband|geschenktute|party|girlande|konfetti|luftschlangen|luftballon|troten|knallbonbon|papierhute|tischfeuerwerk|tortenfontane", "gift"],
    ["kabel|stecker|steckdose|netzteil|powerbank|usb|hdmi|ladegerat|kopfhorer|handy|display", "plug"],
    ["wasserkocher|wasserkessel|kanne|french press|espressokocher|karaffe|krug", "kettle"],
    ["toaster|maschine|mixer|ruhrgerat|kocher|maker|waffeleisen|fritteuse|mikrowelle|backofen|kochplatte|automat|bereiter|sprudler|vakuumierer|allesschneider|zerkleinerer|entsafter|sauger|saugroboter|dampfreiniger|kaffeemuhle|luftbefeuchter|luftentfeuchter", "toaster"],
    ["einmach|schraubglaser|vorratsglaser|gewurzglaser", "jar"],
    ["teller|besteck|gabel|loffel|messer(?!becher)|schale|schussel|tasse|becher|glaser|geschirr|tablett|platte\\b|essstabchen|schneidebrett|kochloffel|pfannenwender|schneebesen|kelle|schaber|zange|reibe|hobel|schaler|offner|korkenzieher|presse|stampfer|sieb|nudelholz|morser|muhle", "cutlery"],
    ["wasche|korb", "basket"],
    ["besen|handfeger|wischmopp|wischer|staubwedel|burste|kehrschaufel|schrubber|abzieher", "broom"],
    ["reiniger|entferner|spray|politur|pflege|entkalker|scheuer|wc-|\\bsoda\\b|seife|starke|bugelwasser|bleich|erfrischer|fleckensalz|schimmel|frosch|ajax|meister proper|domestos|\\bbref\\b|cillit|\\bviss\\b|sagrotan|vanish|febreze|silberputz|duft|schuhcreme|fleck", "spray"]]],
  "Baby & Kind": ["#d7647f", "babybottle", [
    ["windel|pants|wickel|pampers", "diaper"],
    ["glaschen|brei|quetschie|babynahrung|alete|bebivita", "jar"],
    ["keks|stangen|kringel|waffel|riegel|musli", "cookie"],
    ["malbuch|knete|kreide|farben|sticker|puzzle|zeitschrift|sammelkarten", "pencil"],
    ["creme|lotion|shampoo|\\bol\\b|babyol|babybad|waschgel|puder|bubchen", "pump"]]],
  "Tierbedarf": ["#7a8a2c", "paw", [
    ["fisch|teich|aquarium", "fish"]]],
  "Kleidung & Textilien": ["#56799a", "shirt", [
    ["socken|strumpf|strumpfe|fusslinge", "sock"],
    ["handschuh|faustlinge|mutze|hut\\b|cap\\b|stirnband|ohrenschutzer|schal\\b|halstuch", "beanie"],
    ["schuh|stiefel|sandalen|flip-flops|sneaker|pantoffeln|clogs|sohlen|schnursenkel|fersenkissen", "shoe"],
    ["tasche|rucksack|koffer|ranzen|beutel|geldborse", "handbag"],
    ["handtuch|handtucher|duschtuch|badetuch|saunatuch|strandtuch|waschlappen|waschhandschuh|badematte|vorleger|duschmatte|tischdecke|laufer|servietten|wachstuch|teppich|vorhang|gardine|plaid|uberwurf", "towel"],
    ["bett|kissen|decke|laken|matratze|molton|steppbett|nasseschutz", "bed"],
    ["garn|nadel|naht|nah|knopf|knopfe|reissverschluss|wolle|strick|hakel|stick|stopf|fingerhut|gummi|kordel|band\\b|flicken|aufnaher|stoff|filz|vlies|watte|klett|schneider|einfadler|bugelbilder|etiketten", "thread"],
    ["hose|jeans|leggings|shorts|chino|rock\\b|slips|panty|hipster|unterhose", "pants"],
    ["jacke|mantel|weste|anzug|poncho|kittel|pullover|sweatshirt|overall", "jacket"]]],
  "Baumarkt & Werkzeug": ["#cf861b", "hammer", [
    ["fahrrad|sattel|pedale|lenker|gepacktrager|reflektor|rucklicht|bremszug|schaltzug", "bike"],
    ["auto|motor|scheibenwisch|scheibenenteiser|scheibenfrost|scheibenreiniger|kuhl|adblue|felgen|wischer|eiskratzer|duftbaum|enteiser|reifen|wagenheber|radkreuz|starthilfe|abschlepp|warndreieck|zundkerzen|h7|h4|sitzbezuge|kofferraum|schneeketten|bremsen|bremsflussig|getriebe|cockpit|lackstift|kratzer", "car"],
    ["schloss|riegel|zylinder|turkette|turspion|tresor", "lock"],
    ["leuchte|strahler|lampe|led-panel", "lamp"],
    ["schraubendreher|torx|inbus|\\bbits?\\b|bit-|bithalter", "screwdriver"],
    ["schlussel(?!kasten)|zange|ratsche|schraubstock|zwinge", "wrench"],
    ["bohr|akkuschrauber|frase|schleif|sage|multitool|elektrohobel|kompressor|heissluft|trennscheiben|schruppscheiben|facherscheiben|sauger|werkzeug-", "drill"],
    ["steckdose|schalter|kabel|stecker|kupplung|fassung|dimmer|klemmen|sicherung|dose\\b|melder|trafo|baldachin|aderend|schrumpf|litze", "plug"],
    ["hahn|armatur|dusch|brause|siphon|spulkasten|wc-|waschbecken|ventil|rohr|schlauch|stopsel|perlator|strahlregler|thermostat|boiler|erhitzer|fitting|heizkorper|haarsieb|heberglocke|druckminderer", "faucet"],
    ["massband|bandmass|zollstock|wasserwaage|messschieber|entfernungsmesser|winkel\\b|anschlagwinkel", "tape"],
    ["leiter|tritt|arbeitsbock", "ladder"],
    ["walze|roller|farbrolle|pinsel|quast", "roller"],
    ["farbe|lack|lasur|grund|beize|ol\\b|wachs|firnis|verdunnung|spiritus|aceton|benzin|abbeizer|kleister|putz|spachtel|zement|mortel|beton|gips|kitt|fugen|silikon|acryl|kleber|leim|harz|dicht|bitumen|schaum|abtonpaste|terpentin", "paintcan"],
    ["holz|latten|leisten|platte|brett|diele|laminat|parkett|vinyl|boden|fliesen|paneele|stab\\b|pfosten|sperrholz|hobelware|fensterbank|profil|regal|tapete|raufaser", "plank"],
    ["schraube|dubel|nagel|nieten|mutter|scheiben\\b|splinte|krampen|stifte|anker|haken|ose|schelle|verbinder|scharnier|winkel|federringe|gewindestangen", "screw"],
    ["band\\b|tape|krepp", "roll"],
    ["handschuhe|helm|schutz|maske|overall|stiefel", "shirt"]]],
  "Garten & Pflanzen": ["#5b9a2d", "pot", [
    ["grill|feuer|fackel|gasflasche", "flame"],
    ["giess|schlauch|brause|sprenger|bewasser|regentonne|hahnanschluss", "wateringcan"],
    ["spaten|schaufel|gabel|harke|rechen|hacke|stecher|kelle|kralle|schere|schneeschieber|maher|trimmer|vertikutierer|laubblaser", "shovel"],
    ["erde\\b|dunger|kalk|sand|mulch|kompost(?!er)|samen|saat|blaukorn|mehl|spane|granulat|blahton|perlite|streu|splitt|sack|nachsaat|rasen\\b|bienenweide|grundungung", "bag"],
    ["blume|rose|tulpe|orchidee|strauss|stern|kranz|gesteck|geranie|petunie|stiefmutterchen|primel|veilchen|begonie|fuchsie|lavendel|chrysantheme|heide|hortensie|amaryllis|narzisse|krokus|hyazinthe|dahlie|gladiole|stauden|zwiebeln|christrose", "flower"],
    ["baum|strauch|strauch|hecke|bambus|palme|ficus|monstera|buchs|efeu|tanne|mistel", "tree"]]],
  "Büro & Schule": ["#486ba3", "pencil", [
    ["drucker|toner|patrone|laminier|aktenvernichter|maus|tastatur|webcam|headset|festplatte|usb|sd-karte|rohlinge|laptop|monitor|rechner|bildschirm", "printer"],
    ["schere|cutter|klingen|briefoffner", "scissors"],
    ["ordner|hefter|mappe|hulle|register|ablage|sammler|trenn|aktendeckel", "folder"],
    ["heft|block|buch|kalender|planer|papier|karton|pappe", "notebook"],
    ["brief|umschlag|versand|karte\\b|karten\\b|paket|post", "envelope"],
    ["klammer|locher|heftgerat|tacker|reisszweck|pinn|gummi|magnete|klebe|kleber|tesa|uhu|pritt|band\\b|klebefilm", "paperclip"]]],
  "Sonstiges": ["#6f7a80", "box", [
    ["geschenk|mitbringsel|blumen", "gift"],
    ["paket|brief|post", "envelope"],
    ["tasche|tute|beutel", "handbag"],
    ["tanken|auto", "car"]]]
};
var CATCOL = [], CATRULES = [];
CATS.forEach(function (c) {
  var m = META[c] || ["#6f7a80", "box", []];
  CATCOL.push(m[0]);
  CATRULES.push(m[2].map(function (p) { return [new RegExp(p[0]), p[1]]; }));
});
function ruleIcon(cat, n) {
  var r = CATRULES[cat];
  for (var i = 0; i < r.length; i++) if (r[i][0].test(n)) return r[i][1];
  return null;
}
/* ---------- Farbige Bildzeichen (Stil E) ----------
   Je Abteilung: Regeln (erste passende gewinnt), danach das Standardzeichen.
   Ein Wert mit "#" ist eine eigene Zeichnung aus dem Sprite, alles andere ein Emoji-Zeichen, zu dem emoji/<Codepunkte>.svg gehört
   (Noto Emoji; nach Änderungen an der Tabelle tools/bildzeichen.py laufen lassen). */
var EMO = {
  "Obst & Gemüse": ["🥬", [
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
    ["croissant|hornchen|franzbrotchen", "🥐"], ["brezel|laugen", "🥨"], ["bagel", "🥯"], ["donut|berliner(?! landbrot)|krapfen|quarkballchen|mutzen|schmalzkuchen", "🍩"],
    ["brotchen|semmel|schrippe|wecken|seelen|schusterjungen|knuppel|buns|toasties|brioche", "#bun"],
    ["baguette|ciabatta|grissini|brotsticks|stange|panini", "🥖"], ["fladenbrot|pita|naan|wrap|tortilla|lavash|yufka|durum|pide|simit|matzen", "🫓"],
    ["pfannkuchen|crepe", "🥞"], ["waffel", "🧇"], ["torte", "🎂"], ["muffin|cupcake|cake pops", "🧁"], ["quiche|zwiebelkuchen|borek", "🥧"],
    ["schnecke", "🍰"], ["cookie|macarons|florentiner|knacke|zwieback|reiswaffel|maiswaffel|dinkelwaffel|ecken|ohren|amerikaner", "🍪"],
    ["kuchen|stollen|strudel|schnecke|tasche|streusel|brownie|biskuit|schecke|donauwelle|bienenstich|eclair|windbeutel|plunder|boden|zopf|kranz|baklava|cannoli|churros|pastel|kalter hund|petit|keulchen|puddingbrezel|osterbrot|weckmann", "🍰"]]],
  "Milch, Käse & Eier": ["🥛", [
    ["kase|gouda|edamer|emmentaler|tilsiter|maasdamer|appenzeller|gruyere|cheddar|parmesan|grana|pecorino|manchego|mozzarella|burrata|feta|halloumi|camembert|brie\\b|gorgonzola|roquefort|limburger|romadur|obazda|provolone|scamorza|taleggio|fontina|havarti|esrom|jarlsberg|paneer|ricotta|mascarpone|babybel|leerdammer|geramont|philadelphia|exquisa|bresso|almette|kiri|raclette|fondue|comte|reblochon|munster|chaumes|cambozola|bavaria blu|stilton|danablu|morbier|vacherin|old amsterdam|mimolette|quargel|weisslacker|tete de moine", "🧀"],
    ["\\beier|eiweiss|wachtelei|vollei|eigelb", "🥚"], ["butter(?!milch)|margarine|schmalz|streichfett|\\brama\\b|latta|kerrygold", "🧈"],
    ["tofu|tempeh|seitan|vegan|vegetarisch|falafel|bratling|soja-|jackfruit|erbsenprotein|gemuse", "🌱"],
    ["pudding|panna|brulee|mousse|tiramisu|gotterspeise|wackelpudding|grutze|dessert", "🍮"],
    ["joghurt|quark|skyr|creme|schmand|saure sahne|sour cream|milchreis|activia|fruchtzwerge|monte|almighurt|dany|leckermaulchen|tzatziki|aioli|dip|hummus|frischkase|taramas|guacamole", "#cup"],
    ["maultaschen|knodel|klosse|schupfnudeln|germknodel|dampfnudeln", "🥟"], ["nudeln|tortellini|ravioli|gnocchi|spatzle|pasta|pesto", "🍝"], ["suppe", "🍲"], ["salat", "🥗"],
    ["sushi", "🍣"], ["sandwich|wrap", "🥪"], ["oliven|antipasti", "🫒"], ["pizzateig|flammkuchenteig|teig|hefe", "#bag"], ["kaiserschmarrn|reibekuchen", "🥞"]]],
  "Fleisch, Wurst & Fisch": ["🥩", [
    ["sushi|sashimi", "🍣"], ["garnele|krabbe|scampi|gambas|shrimp", "🦐"], ["krebs|hummer|langustinen|kaisergranat", "🦞"], ["muschel|auster", "🦪"], ["tintenfisch|calamari|oktopus|pulpo|sepia", "🦑"],
    ["schinken|prosciutto|coppa|lardo|guanciale|pastrami|haxe|eisbein|keule|schaufele", "🍖"], ["speck|bacon|pancetta", "🥓"], ["(^|[\\s-])burger|lachsburger|patties", "🍔"],
    ["fisch|lachs|forelle|saibling|zander|karpfen|kabeljau|rotbarsch|scholle|seezunge|butt\\b|dorade|barsch|pangasius|tilapia|matjes|hering|rollmops|buckling|makrele|sprotte|aal\\b|schillerlocke|surimi|kaviar|rogen|wels|hecht|schleie|marane|felchen|stor\\b|seeteufel|seehecht|leng|rotzunge|flunder|steinbeisser|knurrhahn|rotbarbe|sardine|sardelle|anchovis|kipper|gabelbissen|algen|wakame", "🐟"],
    ["wurst|salami|wiener|knacker|krakauer|cabanossi|debreziner|landjager|beisser|mettenden|chorizo|fuet|griller|bifi|lyoner|mortadella|salsiccia|merguez|sucuk|regensburger|braunschweiger|gottinger|pinkel|stracke|feldkieker|rauchenden|aufschnitt|leberkase|fleischkase|sulze|presskopf|saumagen", "#sausage"],
    ["hahnchen|huhn|huhner|pute|ente|gans|ganse|geflugel|wachtel|chicken|kuken|fasan", "🍗"], ["spiess(?!braten)|schaschlik|souvlaki|gyros|doner|kebab", "🍢"]]],
  "Tiefkühl": ["❄️", [
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
    ["tk-|gemuse|spinat|vegan|veggie|falafel", "🥦"], ["frikadellen|kottbullar|hackballchen|cevapcici|bifteki|schnitzel|cordon|hack|pulled|wild|kaninchen|rehkeule|hirsch", "🥩"]]],
  "Nudeln, Reis & Konserven": ["🥫", [
    ["thunfisch|sardine|sardelle|makrele|hering|lachs|dorsch|sprotten|saupiquet|hawesta|appel|muscheln\\b|krabben(?!chips)", "🐟"], ["kapern|rotkohl|meerrettich|weinblatter", "🫙"],
    ["passiert|passata|polpa|pelati|geschalt|gehackte tomaten|stuckige tomaten|tomatenstucke|tomaten dose|dosentomaten|san-marzano", "🥫"], ["ketchup", "🍅"], ["senf", "🍶"],
    ["olivenol", "🫒"], ["sojasosse|ketjap|tamari|ponzu|fischsosse|teriyaki|mirin|reiswein|essig|balsamico|ol\\b|verjus|condimento", "🍶"], ["honig", "🍯"],
    ["ramen|instantnudel|mie-|udon|soba|pho|glasnudel|reisnudel|wok-nudeln|chow|somen|pad-thai|yum yum|asia-snack", "🍜"],
    ["nudel|spaghetti|linguine|tagliatelle|fettuccine|pappardelle|penne|rigatoni|fusilli|spirelli|farfalle|makkaroni|tortiglioni|conchiglie|orecchiette|cannelloni|lasagne|spatzle|knopfle|tortell|ravioli|gnocchi|barilla|buitoni|miracoli|pasta|orzo|risoni|bucatini|capellini|vermicelli|paccheri|trofie|gemelli|kritharaki|maccheroni|girandole|casarecce|strozzapreti|radiatori|rotelle|ditalini|anelli|stelline|mafaldine|tagliolini", "🍝"],
    ["curry|dal\\b|masala|korma|vindaloo|tandoori|butter-chicken|palak", "🍛"], ["sushi|nori", "🍣"], ["taco", "🌮"], ["tortillas|papadam|naan|yufka", "🫓"],
    ["reis|risotto", "🍚"], ["couscous|bulgur|quinoa|hirse|polenta|griess|buchweizen|amaranth|grunkern|graupen|dinkel|weizen|gerste|roggen|emmer|einkorn|kamut|freekeh|teff|hafergrutze|tapioka|sago", "🌾"],
    ["suppe|eintopf|bruhe|bouillon|fond|topf|terrine|gulasch|soljanka|borschtsch|minestrone|labskaus|bigos|zurek|jus\\b|suppeneinlage|backerbsen", "🍲"],
    ["tomate|ketchup|passata|sugo|polpa|pelati|datterini|salca", "🍅"], ["senf|mayo|remoulade|sosse|sauce|dressing|sriracha|sambal|wurze|sirup|kwas", "🍶"],
    ["oliven|tapenade", "🫒"], ["mais", "🌽"], ["bohne|linse|kichererbse|erbse|refried|baked beans", "🫘"], ["pilz|champignon|pfifferling|truffel|shiitake|morchel", "🍄"], ["kokos", "🥥"],
    ["chili|peperoni|jalapeno|harissa|pul biber|chipotle|gochu|adschika", "🌶️"], ["paprika|ajvar|letscho", "🫑"], ["knoblauch", "🧄"], ["zwiebel", "🧅"], ["gurke|cornichon|pickle", "🥒"],
    ["kartoffel|\\brosti", "🥔"], ["knodel|klosse", "🥟"], ["ananas", "🍍"], ["pfirsich|aprikose|pflaume", "🍑"], ["kirsch|schattenmorelle", "🍒"], ["mandarine", "🍊"], ["apfel", "🍎"], ["birne", "🍐"],
    ["glas|eingelegt|pesto|aufstrich|chutney|kimchi|paste|mus\\b|mark\\b|kompott|meerrettich|sauerkraut|kraut|dip|tahini|creme|antipasti|kapern|ghee|smetana|tworog|salat", "🫙"],
    ["fix\\b|binder|pulver|wurfel|panko|mehl|chips|rostzwiebeln|kit\\b|blatter|papier|glucks|kerne|wurzmischung|tute|mix\\b|flocken|zucker|hefe|fett", "#bag"]]],
  "Backen & Gewürze": ["#bag", [
    ["kerzen", "🕯️"], ["gotterspeise|tortenguss|gelatine", "🍮"], ["puderzucker|zitronensaure", "#bag"], ["lebensmittelfarbe|dekostifte", "🎨"], ["honig|sirup|dicksaft|goldsaft", "🍯"],
    ["kuverture|schoko|kakao|nougat|glasur|callets|cake melts", "🍫"], ["kokos", "🥥"], ["erdnuss|erdnusse", "🥜"],
    ["mandel|haselnuss|walnuss|pistazie|pekan|cashew|nuss|krokant|marzipan", "🌰"], ["zitron|orange", "🍋"], ["kirsch", "🍒"],
    ["chili|cayenne|chipotle|piment|paprika|harissa", "🌶️"], ["knoblauch", "🧄"], ["zwiebel", "🧅"],
    ["getrocknet|krauter|lorbeer|oregano|basilikum|thymian|rosmarin|majoran|petersilie|dill|salbei|estragon|minze|bluten|kerbel|beifuss|schabzigerklee|zitronengras", "🌿"],
    ["salz|pfeffer|curry|kurkuma|kummel|koriander|kardamom|zimt|nelken|muskat|anis|fenchel|senf|wacholder|ingwer|safran|gewurz|masala|hanout|zatar|sumach|bockshorn|\\brub\\b|baharat|berbere|dukkah|chermoula|pumpkin|macis|tonka|galgant|amchur|asafoetida|ajowan|namak|vanille gemahlen|beeren", "🧂"],
    ["mehl|griess|starke|kleie|dunst", "🌾"], ["streusel|perlen|zucker(blumen|herzen|augen|schrift)|dekor|nonpareilles|fondant|tortendeko|aufleger|topper", "🍬"],
    ["tortenguss|gelatine|pudding|gotterspeise|gelier|creme|mousse|kaltschale", "🍮"], ["konfiture|fullung|mark\\b|paste|aprikotur|gelee|aroma|extrakt|rosenwasser", "🫙"]]],
  "Frühstück, Kaffee & Tee": ["🫙", [
    ["kaffee|espresso|crema|cappuccino|latte|nescafe|jacobs|dallmayr|lavazza|senseo|nespresso|tassimo|mokka|ristretto|cold brew(?!-tee)", "☕"],
    ["riegel|flapjack|fruchtschnitte", "🍫"], ["erdnussbutter|erdnussmus", "🥜"],
    ["flocken|musli|porridge|granola|cornflakes|cerealien|pops|kissen|ringe|flakes|kleie|frosties|smacks|krispies|oats|crunch|haferbrei|puffreis|gepufft|biscuits|weizenkeime|hafermark|\\bchia", "🥣"],
    ["kakao|trinkschokolade|nesquik|kaba|ovomaltine", "🍫"], ["teekanne", "🫖"], ["tee\\b|teemischung|teekapseln|earl grey|darjeeling|sencha|matcha|chai|heisse zitrone|kandis|golden-milk", "🍵"],
    ["honig", "🍯"], ["erdnuss", "🥜"],
    ["nutella|nudossi|nusspli|schoko|nougat", "🍫"]]],
  "Süßes & Snacks": ["🍬", [
    ["popcorn", "🍿"], ["lutscher|zuckerstange|schleckmuschel", "🍭"], ["salzstangen|brezel|laugen", "🥨"],
    ["keks|cookie|waffel|biskuit|spekulatius|lebkuchen|pfeffernusse|pfefferkuchen|zimtsterne|kipferl|printen|baumkuchen|amarettini|cantuccini|shortbread|soft cake|kuchen|russisch brot|geback|milchschnitte|prinzenrolle|oreo|pick up|makronen|filinchen|knacke|hanuta|knoppers|platzchen|heidesand|hippen|engelsaugen|husarenkrapfen|spitzbuben|barentatzen|magenbrot|fruchtebrot|stollen", "🍪"],
    ["erdnuss|erdnusse", "🥜"], ["cashew|pistazie|mandeln|macadamia|nussmix|nuss-frucht|studentenfutter|pekannusse|walnusse|kerne|wasabi-nusse", "🌰"],
    ["cracker|reisgeback|reis-chips", "🍘"], ["saure |fruchtgummi|weingummi|lakritz|gummibar", "🍬"], ["wasabi-erbsen|chips|flips|nachos|sticks|stangen|ringe|ballchen|knabber|party-mix|snack|pringles|erdnusslocken|nicnac|grissini|kichererbsen|edamame|mais geroste", "#bag"],
    ["jerky|biltong|trockenfleisch|salami", "🥩"],
    ["schoko|praline|marzipan|nougat|riegel|mozartkugel|domino|advent|milka|ritter sport|kinder |duplo|toffifee|merci|ferrero|raffaello|mon cheri|lindt|after eight|snickers|\\bmars\\b|twix|bounty|milky way|kitkat|\\blion\\b|m&m|smarties|halloren|knusperflocken|bambina|minztafelchen|uberraschungsei|weinbrandbohnen|rumkugeln|krokant|ostereier|-eier", "🍫"]]],
  "Getränke": ["🥤", [
    ["(^|[\\s-])mate", "🧉"], ["wasser|gerolsteiner|volvic|vittel|evian|apollinaris|\\bvio\\b|lichtenauer|margon|brambacher|oppacher", "💧"],
    ["saft|nektar|smoothie|trinkpackchen|shot\\b|hohes c|granini|punica|valensina|rotbackchen|capri|sirup", "🧃"],
    ["kaffee|cappuccino|latte|espresso-drink", "☕"], ["milch|kakao-drink|protein-drink|trinkmahlzeit", "🥛"],
    ["bier|\\b(pils|helles|export|lager|ipa|radler|marzen|gose|kolsch|cider|stout|porter|tripel|kriek|russ)\\b|\\bale\\b|weizen(?!korn)|bock\\b|berliner weisse|malztrunk|partyfass|radeberger|wernesgruner|kostritzer|krostitzer|sternburg|freiberger|feldschlosschen|beck's|krombacher|bitburger|warsteiner|veltins|erdinger|paulaner|franziskaner|augustiner|jever|flensburger|hasseroder", "🍺"],
    ["cocktail|mojito|caipirinha|colada|spritz|aperol|hugo|sangria|bowle|punsch|aperitif", "🍹"],
    ["sekt|secco|prosecco|champagner|\\bcava\\b|cremant|piccolo|frizzante|spumante|asti", "🍾"],
    ["\\bgin\\b|wodka|\\brum\\b|whisk|tequila|mezcal|pisco|likor|schnaps|korn\\b|brand\\b|geist\\b|obstler|grappa|ouzo|raki|aquavit|amaretto|sambuca|absinth|cachaca|curacao|triple sec|maraschino|barenfang|bitter|fernet|amaro|pastis|genever|cognac|armagnac|calvados|brandy|bourbon|scotch|limoncello|jagermeister|baileys|ramazzotti|berentzen|angostura|spirituose|saurer apfel|rumtopf|kirschwasser|zwetschgenwasser|williamsbirne", "🥃"],
    ["wein|riesling|thurgau|silvaner|burgunder|chardonnay|sauvignon|pinot|traminer|dornfelder|merlot|shiraz|tempranillo|rioja|chianti|primitivo|montepulciano|bordeaux|lambrusco|sherry|wermut|federweisser|veltliner|zweigelt|blaufrankisch|lemberger|trollinger|portugieser|regent|malbec|syrah|zinfandel|sangiovese|barolo|barbera|valpolicella|amarone|avola|rhone|beaujolais|chablis|sancerre|elbling|kerner|bacchus|scheurebe|gutedel|rivaner|muskateller|verdejo|albarino|vinho|soave|lugana|vermentino|rose\\b|weissherbst|rotling|blanc de|spatlese|auslese|kabinett|madeira|marsala|retsina|jagertee|met\\b|sake", "🍷"]]],
  "Drogerie & Gesundheit": ["🧴", [
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
    ["dusch|badvorleger", "🚿"], ["wc-|klo|toiletten|pumpel", "🚽"], ["handschuh|topflappen", "🧤"], ["schuh", "👞"], ["kleiderbugel|hosenbugel|kleidersack|bugel|wasche|textil", "👕"], ["schere", "✂️"],
    ["insekt|fliegen|ameisen|motten|wespen|mucken|silberfisch|schaben", "🪰"], ["folie|backpapier|butterbrotpapier|bratschlauch", "#roll"], ["beutel", "#bag"], ["tuch\\b|tucher|lappen", "🧽"],
    ["seife", "🧼"], ["mittel|spuler|reiniger|entferner|spray|politur|pflege|entkalker|scheuer|soda|starke|bleich|erfrischer|fleck|schimmel|persil|ariel|spee|weisser riese|lenor|perwoll|pril|fairy|frosch|ajax|meister proper|domestos|bref|cillit|viss|sagrotan|vanish|febreze|tabs|duft|pods|klarspuler", "🧴"],
    ["maschine|mixer|ruhrgerat|kocher|maker|waffeleisen|fritteuse|mikrowelle|backofen|kochplatte|automat|toaster|sauger|saugroboter|dampfreiniger", "🔌"]]],
  "Baby & Kind": ["🍼", [
    ["windel|pants|wickel|pampers", "👶"], ["glaschen|quetschie|alete|bebivita", "🫙"], ["brei|flocken|musli", "🥣"], ["keks|stangen|kringel|waffel|riegel", "🍪"],
    ["malbuch|kreide|farben|knete", "🖍️"], ["puzzle", "🧩"], ["sticker|sammelkarten|zeitschrift", "📰"], ["seifenblasen", "🫧"], ["sandspielzeug|spielzeug|beissring", "🧸"],
    ["creme|lotion|shampoo|babyol|babybad|waschgel|puder|bubchen|penaten|sonnencreme", "🧴"], ["feuchttucher|tucher|mullwindeln", "🧻"], ["besteck", "🍴"], ["brotdose", "🍱"], ["trinkflasche|trinklern", "🥤"],
    ["saft", "🧃"], ["tee", "🍵"], ["latzchen", "👶"]]],
  "Tierbedarf": ["🐾", [
    ["katze|kitten|whiskas|felix|sheba|kitekat|catsan", "🐱"], ["knochen|kau|ochsenziemer|schweineohren", "🦴"], ["hund|pedigree|frolic|cesar|chappi|leckerli|trainingssnacks", "🐶"],
    ["wellensittich|kanarien|papagei|vogel|meise|kolbenhirse|streufutter|fettfutter", "🐦"], ["fisch|teich|aquarium|filterwatte", "🐟"], ["kaninchen", "🐰"],
    ["hamster|nager|meerschwein|kleintier|heu|stroh|einstreu|salzleckstein", "🐹"], ["huhner|legemehl", "🐔"], ["pferd", "🐴"], ["igel", "🦔"], ["schildkrote", "🐢"], ["zecke|floh", "🦟"]]],
  "Kleidung & Textilien": ["👕", [
    ["handtuch|handtucher|duschtuch|badetuch|saunatuch|strandtuch|waschlappen|waschhandschuh|badematte|vorleger|duschmatte", "🛁"], ["strickjacke", "🧥"],
    ["socken|strumpf|strumpfe|fusslinge", "🧦"], ["handschuh|faustlinge", "🧤"], ["schal\\b|halstuch|tuch\\b", "🧣"], ["sonnenhut|strohhut|fischerhut", "👒"], ["mutze|cap\\b|stirnband|ohrenschutzer", "🧢"],
    ["gummistiefel|stiefel|wanderschuhe", "🥾"], ["sandalen|flip-flops|badeschuhe", "🩴"], ["pantoffel|clogs|hausschuhe", "🥿"], ["schuh|sneaker|sohlen|schnursenkel|fersenkissen", "👟"],
    ["rucksack|ranzen|turnbeutel", "🎒"], ["koffer|reisetasche", "🧳"], ["geldborse", "👛"], ["tasche\\b", "👜"], ["sonnenbrille", "🕶️"], ["schirm", "☂️"],
    ["bikini", "👙"], ["badeanzug", "🩱"], ["badehose|shorts|kurze hose|radlerhose|boxershorts", "🩳"], ["slips|panty|hipster|unterhose|string|bh\\b|bustier", "🩲"],
    ["bett|kissen|decke|laken|matratze|molton|steppbett|nasseschutz", "🛏️"], ["vorhang|gardine", "🪟"],
    ["garn|naht|nah|faden|fingerhut|einfadler|schneider|stopf|stick", "🧵"], ["wolle|strick|hakel|nadelspiel", "🧶"], ["nadel", "🪡"], ["knopf|knopfe|sicherheits|reissverschluss|klett|haken und", "🧷"],
    ["kleid|rock\\b|nachthemd", "👗"], ["hose|jeans|leggings|chino", "👖"], ["hemd|bluse|krawatte|fliege|einstecktuch", "👔"], ["jacke|mantel|weste|anzug|poncho|kittel|overall", "🧥"],
    ["tischdecke|laufer|servietten|wachstuch|tischset", "🍽️"]]],
  "Baumarkt & Werkzeug": ["🧰", [
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
    ["grill|feuer|fackel|gasflasche", "🔥"], ["sonnenschirm|sonnensegel", "⛱️"], ["stuhl|bank|liege|tisch|hangematte", "🪑"],
    ["giess|schlauch|brause|sprenger|bewasser|regentonne|hahnanschluss|pool|planschbecken|teich", "💧"],
    ["erde\\b|dunger|kalk|sand|mulch|kompost|blaukorn|mehl|spane|granulat|blahton|perlite|sack", "#bag"],
    ["weihnachtsbaum|tannengrun|adventskranz", "🎄"], ["sonnenblume", "🌻"], ["rose", "🌹"], ["strauss|schnittblumen|gesteck|trockenblumen|kunstblumen", "💐"],
    ["blume|tulpe|orchidee|geranie|petunie|stiefmutterchen|primel|veilchen|begonie|fuchsie|lavendel|chrysantheme|heide|hortensie|amaryllis|narzisse|krokus|hyazinthe|dahlie|gladiole|stauden|christrose|weihnachtsstern", "🌷"],
    ["kaktus|sukkulent", "🌵"], ["palme", "🌴"], ["baum|strauch|hecke|bambus|ficus|buchs|efeu|mistel", "🌳"],
    ["tomate", "🍅"], ["mohre", "🥕"], ["gurke|zucchini", "🥒"], ["kurbis", "🎃"], ["paprika", "🫑"], ["chili", "🌶️"], ["erdbeer", "🍓"], ["salat|kohlrabi", "🥬"], ["bohne|erbse", "🫘"],
    ["samen|saat|nachsaat|rasen|bienenweide|grundungung|anzucht|quelltabletten", "🌱"], ["krauter|basilikum|petersilie|schnittlauch|kresse", "🌿"], ["laub", "🍂"],
    ["schneck", "🐌"], ["ameise", "🐜"], ["insektenhotel|biene", "🐝"], ["vogel|\\bnist|futtersaule", "🐦"], ["igel", "🦔"], ["katze", "🐱"],
    ["schnee|streu|winterschutz", "❄️"], ["handschuhe", "🧤"], ["schere", "✂️"], ["solar|leuchten|lichterkette", "💡"],
]],
  "Büro & Schule": ["✏️", [
    ["drucker(?!papier)|toner|patrone", "🖨️"], ["maus\\b|mauspad", "🖱️"], ["tastatur", "⌨️"], ["laptop|monitor|bildschirm|webcam", "💻"], ["usb|sd-karte|festplatte|rohlinge", "💾"], ["rechner", "🧮"], ["headset", "🎧"],
    ["schere|cutter|klingen|briefoffner", "✂️"], ["geodreieck|winkelmesser|zirkel", "📐"], ["lineal|schablone", "📏"],
    ["ordner|hefter|mappe|hulle|register|ablage|sammler|trenn|aktendeckel", "📁"], ["kalender|planer", "📅"], ["heft|block|buch", "📒"], ["papier|karton|pappe", "📄"],
    ["brief|umschlag|karte\\b|karten\\b|post", "✉️"], ["paket|versand|luftpolster", "📦"], ["etiketten|anhanger", "🏷️"], ["geschenk|schleifen", "🎁"],
    ["klammer|locher|heftgerat|tacker|enthefter", "📎"], ["reisszweck|pinn|magnete", "📌"],
    ["pinsel", "🖌️"], ["farben|malkasten|tusch|aquarell|acryl|leinwand|staffelei|deckweiss", "🎨"], ["marker|wachsmal|kreide|buntstift|filzstift|fasermaler|brush", "🖍️"],
    ["kugelschreiber|fuller|fineliner|gelschreiber|tintenroller|tinte", "🖊️"], ["schultute|federmappe|mappchen", "🎒"], ["bastel|perlen|pompons|wackelaugen|moosgummi|pfeifenreiniger|glitzer", "🧩"]]],
  "Sonstiges": ["🛒", [
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
function guess(n) {
  for (var i = 0; i < GUESS_ORDER.length; i++) {
    var ic = ruleIcon(GUESS_ORDER[i], n);
    if (ic) return { cat: GUESS_ORDER[i], icon: pictogram(GUESS_ORDER[i], n) };
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
    v: 3, example: true, freq: {}, active: "l1",
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
function load() {
  try {
    var s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.lists) && s.lists.length) {
      s.freq = s.freq || {};
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
      var u = snap(); it.done = !it.done; lastId = it.id; buzz(); save(); render(); lastId = null;
      notify(it.name + (it.done ? " erledigt" : " wieder offen"), u);
    },
    onHold: function () { editSheet(it); }
  });
  if (!it.done) t.appendChild(el("button", { class: "dots", type: "button", "aria-label": "Details zu " + it.name,
    on: { click: function () { editSheet(it); } } }, dotsSvg()));
  return t;
}

/* ---------- Liste ---------- */
function render() {
  var L = cur(), open = [], done = [];
  L.items.forEach(function (i) { (i.done ? done : open).push(i); });
  open.sort(function (a, b) { return a.cat - b.cat; });
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
    main.appendChild(el("h2", {}, el("span", { text: "Erledigt · " + done.length }),
      el("button", { class: "link danger", type: "button", text: "Entfernen", on: { click: function () {
        var u = snap(), n = done.length;
        L.items = L.items.filter(function (i) { return !i.done; }); save(); render();
        notify(n + (n === 1 ? " erledigter Artikel entfernt" : " erledigte Artikel entfernt"), u);
      } } })));
    var g2 = el("div", { class: "grid" });
    done.forEach(function (i) { g2.appendChild(itemTile(i)); });
    main.appendChild(g2);
  }
}
function add(name) {
  name = name.trim().replace(/\s+/g, " ");
  if (!name) return;
  var i = byNorm[norm(name)];
  if (i !== undefined) name = names[i]; else name = name.charAt(0).toUpperCase() + name.slice(1);
  var ex = findItem(name), msg;
  if (ex && !ex.done) return { text: name + " steht schon auf der Liste", changed: false };
  if (ex) { ex.done = false; msg = name + " wieder auf der Liste"; }
  else { cur().items.push(mk(name)); msg = name + " hinzugefügt"; }
  S.freq[name] = (S.freq[name] || 0) + 1;
  save(); render();
  return { text: msg, changed: true };
}

/* ---------- Suche ---------- */
function openSearch() {
  if (searchOpen) return;
  searchOpen = true; main.hidden = true; sug.hidden = false; $("closesearch").hidden = false; renderSug();
}
function closeSearch() {
  searchOpen = false; sugMsg = null; $("clearq").hidden = true; q.value = ""; main.hidden = false; sug.hidden = true; $("closesearch").hidden = true; q.blur();
}
function pick(name) {
  var u = snap(), r = add(name);
  if (r) { buzz(); sugMsg = { text: r.text, undo: r.changed ? u : null }; }
  q.value = ""; $("clearq").hidden = true; renderSug(); q.focus();
}
function catTile(i, via) {
  var n = names[i], ex = findItem(n), on = ex && !ex.done;
  return tile({
    cls: on ? "on" : "", icon: icons[i], cat: cats[i], name: n, checked: on,
    note: on ? "steht drauf" : (via ? "für " + via : ""),
    label: n + (on ? ", steht schon auf der Liste" : ". Hinzufügen"),
    onTap: function () { if (on) q.focus(); else pick(n); }
  });
}
/* Güte eines Treffers: 0 gleich, 1 Namensanfang, 2 Wortanfang, 3 Wortende (Grundwort wie „milch“ in „Vollmilch“),
   4 irgendwo mitten im Wort. Stufe 4 steht immer hinter allen anderen, egal wie gängig der Artikel ist. */
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
  var raw = q.value.trim(), nq = norm(raw), g = el("div", { class: "grid" });
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
  var hits = Object.keys(best).map(function (k) {
    k = Number(k);
    var s = best[k] - (staple[k] ? 2.1 : 0) - Math.min(S.freq[names[k]] || 0, 5) * 0.6 - (best[k] === 0 ? 5 : 0) + (best[k] === 4 ? 100 : 0);
    return [s, names[k].length, k];
  });
  hits.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]; });
  var total = hits.length;
  sug.appendChild(el("h2", {}, el("span", { text: total ? total.toLocaleString("de-DE") + " Treffer" : "Kein Treffer im Katalog" })));
  if (byNorm[nq] === undefined) {
    g.appendChild(tile({
      cls: "new", icon: "plus", name: "„" + raw + "“", note: "neu anlegen",
      label: raw + " als eigenen Artikel hinzufügen", onTap: function () { pick(raw); }
    }));
  }
  hits.slice(0, 59).forEach(function (h) { g.appendChild(catTile(h[2], via[h[2]])); });
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
  if (q.value.trim()) pick(q.value); else closeSearch();
});
$("closesearch").addEventListener("click", closeSearch);

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
  veil.hidden = false;
  if (sheet.focus) sheet.focus();
}
function closeSheet() {
  veil.hidden = true; sheet.textContent = "";
  try { if (opener && opener.isConnected && opener.focus) opener.focus(); } catch (e) {}
  opener = null;
}
/* Schließen nur, wenn die Berührung auch auf dem Schleier begonnen hat. Sonst schließt das Loslassen nach
   langem Drücken das eben geöffnete Blatt sofort wieder, weil der Finger dann über dem Schleier liegt. */
var veilDown = false;
veil.addEventListener("pointerdown", function (e) { veilDown = e.target === veil; });
veil.addEventListener("click", function (e) { if (e.target === veil && veilDown) closeSheet(); veilDown = false; });
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !veil.hidden) closeSheet(); });

function editSheet(it) {
  var note = el("input", { id: "f-note", type: "text", value: it.note, placeholder: "z. B. 2 Stück, die große Packung", maxlength: "40" });
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
    e.preventDefault(); it.note = note.value.trim(); it.cat = Number(sel.value); save(); render(); closeSheet();
  } } },
    el("label", { class: "field", for: "f-note" }, "Menge oder Notiz", note),
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
  openSheet("Listen", el("h3", { text: "Meine Listen" }), ul, renForm, form);
}
$("listbtn").addEventListener("click", listsSheet);

render();

/* Offline-Nutzung: Service Worker anmelden (nur über https oder lokal, nicht bei file://) */
if (typeof navigator !== "undefined" && "serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
