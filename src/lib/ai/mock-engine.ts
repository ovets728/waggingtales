import type { StoryInput, GeneratedStory, StoryPage } from './story-engine';

/* -------------------------------------------------------------------------- */
/*  Placeholder images                                                        */
/* -------------------------------------------------------------------------- */

const PAGE_COLORS = [
  '#6B8FD4', // soft blue
  '#7BC67E', // green
  '#E8A75F', // amber
  '#D47BA0', // pink
  '#8B7FC7', // purple
];

/**
 * Build a tiny 1x1 pixel PNG in a solid colour.
 * This avoids any canvas/DOM dependency so it works in Node.
 */
function createPlaceholderImage(color: string, label: string): string {
  // Create an SVG and encode it as a data URL, then convert that concept
  // to a simple base64 representation. Since jsPDF needs PNG/JPEG,
  // we create a minimal solid-colour PNG manually.
  //
  // Minimal 1x1 PNG adapted to a readable placeholder:
  // We'll use an SVG data-url approach embedded as a fallback, but
  // for the PDF we need actual PNG. Let's create a tiny 200x200 PNG.
  void label;
  return createSolidPng(color);
}

/**
 * Creates a minimal valid 200x200 solid-colour PNG in base64.
 * Uses raw IHDR + IDAT construction with no canvas dependency.
 */
function createSolidPng(hex: string): string {
  // Parse the hex colour
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const width = 200;
  const height = 200;

  // Build uncompressed raw pixel data (filter byte 0 + RGB per pixel per row)
  const rawRowLen = 1 + width * 3; // filter byte + RGB
  const rawData = Buffer.alloc(rawRowLen * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rawRowLen;
    rawData[offset] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
    }
  }

  // zlib deflate (store block — no real compression, but valid deflate)
  const zlibData = deflateStore(rawData);

  // Assemble PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = buildChunk('IHDR', (() => {
    const buf = Buffer.alloc(13);
    buf.writeUInt32BE(width, 0);
    buf.writeUInt32BE(height, 4);
    buf[8] = 8;  // bit depth
    buf[9] = 2;  // colour type: RGB
    buf[10] = 0; // compression
    buf[11] = 0; // filter
    buf[12] = 0; // interlace
    return buf;
  })());

  const idat = buildChunk('IDAT', zlibData);
  const iend = buildChunk('IEND', Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdr, idat, iend]);
  return png.toString('base64');
}

/** Build a PNG chunk: length(4) + type(4) + data + crc(4) */
function buildChunk(type: string, data: Buffer): Buffer {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput) >>> 0, 0);
  return Buffer.concat([len, typeBytes, data, crc]);
}

/** CRC-32 (used by PNG) */
function crc32(buf: Buffer): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return crc ^ 0xFFFFFFFF;
}

/**
 * Wrap raw data in a valid zlib stream using uncompressed (store) blocks.
 * Max block size for deflate store is 65535 bytes.
 */
function deflateStore(data: Buffer): Buffer {
  const MAX_BLOCK = 65535;
  const blocks: Buffer[] = [];

  // zlib header: CMF=0x78, FLG=0x01  (deflate, no dict, check bits)
  blocks.push(Buffer.from([0x78, 0x01]));

  let offset = 0;
  while (offset < data.length) {
    const remaining = data.length - offset;
    const blockLen = Math.min(remaining, MAX_BLOCK);
    const isFinal = offset + blockLen >= data.length;

    const header = Buffer.alloc(5);
    header[0] = isFinal ? 0x01 : 0x00;
    header.writeUInt16LE(blockLen, 1);
    header.writeUInt16LE(blockLen ^ 0xFFFF, 3);
    blocks.push(header);
    blocks.push(data.subarray(offset, offset + blockLen));
    offset += blockLen;
  }

  // Adler-32 checksum
  let a = 1;
  let b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE(((b << 16) | a) >>> 0, 0);
  blocks.push(adler);

  return Buffer.concat(blocks);
}

/* -------------------------------------------------------------------------- */
/*  Mock stories by theme and language                                        */
/* -------------------------------------------------------------------------- */

interface MockStoryData {
  title: string;
  pages: string[];
}

function getMockStory(
  petName: string,
  theme: string,
  language: string
): MockStoryData {
  const stories: Record<string, Record<string, MockStoryData>> = {
    spaceAdventure: {
      en: {
        title: `${petName}'s Space Adventure`,
        pages: [
          `${petName} sat on the windowsill, gazing up at the twinkling night sky. The stars seemed to dance and sparkle, whispering of faraway galaxies. "One day," ${petName} thought, "I'll fly among the stars." A warm breeze carried the scent of adventure through the open window.`,
          `The very next morning, a shiny silver rocket ship landed right in the backyard! Its door slid open with a gentle hiss. A friendly alien peeked out and said, "We need the bravest explorer on Earth. Would you like to come on a space adventure?" ${petName} didn't hesitate for a second.`,
          `Zooming past the moon, ${petName} pressed a furry paw against the window in wonder. Saturn's rings sparkled like a million tiny crystals. They visited a planet made entirely of bouncy clouds, where ${petName} jumped higher than ever before, doing somersaults in the low gravity.`,
          `On a distant star, they met the Cosmic Kittens, a friendly group who collected stardust for their art projects. ${petName} helped them paint a brand-new constellation shaped like a paw print. The Cosmic Kittens cheered, and the new constellation glowed brightly in the night sky.`,
          `As the rocket ship gently landed back home, ${petName} carried a tiny jar of stardust as a souvenir. Curling up on the warm windowsill, ${petName} looked up at the sky and smiled. There, shining brightly, was the paw-print constellation. The greatest adventures always lead back home.`,
        ],
      },
      es: {
        title: `La Aventura Espacial de ${petName}`,
        pages: [
          `${petName} estaba sentado en el alfeizar de la ventana, mirando el cielo nocturno lleno de estrellas. Las estrellas parecian bailar y brillar, susurrando sobre galaxias lejanas. "Algun dia", penso ${petName}, "volare entre las estrellas." Una brisa calida traia el aroma de la aventura.`,
          `A la manana siguiente, un cohete plateado y brillante aterrizo en el jardin! Su puerta se abrio con un suave silbido. Un amigable extraterrestre se asomo y dijo: "Necesitamos al explorador mas valiente de la Tierra. Te gustaria venir a una aventura espacial?" ${petName} no dudo ni un segundo.`,
          `Pasando la luna a toda velocidad, ${petName} presiono una patita peluda contra la ventana maravillado. Los anillos de Saturno brillaban como un millon de cristales diminutos. Visitaron un planeta hecho completamente de nubes rebotonas, donde ${petName} salto mas alto que nunca.`,
          `En una estrella lejana, conocieron a los Gatitos Cosmicos, un grupo amigable que recolectaba polvo de estrellas para sus proyectos de arte. ${petName} les ayudo a pintar una nueva constelacion en forma de huella de pata. Los Gatitos Cosmicos aplaudieron y la constelacion brillo intensamente.`,
          `Cuando el cohete aterrizo suavemente en casa, ${petName} llevaba un frasco pequeno de polvo de estrellas como recuerdo. Acurrucandose en el calido alfeizar, ${petName} miro al cielo y sonrio. Alli, brillando intensamente, estaba la constelacion de la huella de pata. Las mejores aventuras siempre llevan de vuelta a casa.`,
        ],
      },
      fr: {
        title: `L'Aventure Spatiale de ${petName}`,
        pages: [
          `${petName} etait assis sur le rebord de la fenetre, contemplant le ciel nocturne scintillant. Les etoiles semblaient danser et briller, murmurant des histoires de galaxies lointaines. "Un jour", pensa ${petName}, "je volerai parmi les etoiles." Une brise chaude apportait le parfum de l'aventure.`,
          `Le lendemain matin, une fusee argentee et brillante atterrit dans le jardin ! Sa porte s'ouvrit avec un leger sifflement. Un gentil extraterrestre regarda dehors et dit : "Nous avons besoin du plus brave explorateur de la Terre. Voulez-vous partir a l'aventure spatiale ?" ${petName} n'hesita pas une seconde.`,
          `En passant devant la lune a toute vitesse, ${petName} pressa une patte poilue contre la vitre, emerveille. Les anneaux de Saturne scintillaient comme un million de petits cristaux. Ils visiterent une planete entierement faite de nuages rebondissants ou ${petName} sauta plus haut que jamais.`,
          `Sur une etoile lointaine, ils rencontrerent les Chatons Cosmiques, un groupe amical qui collectait la poussiere d'etoiles pour leurs projets artistiques. ${petName} les aida a peindre une toute nouvelle constellation en forme d'empreinte de patte. Les Chatons Cosmiques applaudirent joyeusement.`,
          `Quand la fusee atterrit doucement a la maison, ${petName} portait un petit bocal de poussiere d'etoiles en souvenir. Se blottissant sur le rebord chaud de la fenetre, ${petName} regarda le ciel et sourit. La, brillant intensement, se trouvait la constellation en forme de patte. Les plus belles aventures ramenent toujours a la maison.`,
        ],
      },
      it: {
        title: `L'Avventura Spaziale di ${petName}`,
        pages: [
          `${petName} era seduto sul davanzale della finestra, guardando il cielo notturno scintillante. Le stelle sembravano danzare e brillare, sussurrando di galassie lontane. "Un giorno", penso ${petName}, "volero tra le stelle." Una brezza calda portava il profumo dell'avventura attraverso la finestra aperta.`,
          `La mattina seguente, un razzo d'argento lucente atterro proprio nel giardino! La sua porta si apri con un leggero sibilo. Un amichevole alieno fece capolino e disse: "Abbiamo bisogno del piu coraggioso esploratore della Terra. Vuoi venire in un'avventura spaziale?" ${petName} non esito un secondo.`,
          `Sfrecciando oltre la luna, ${petName} premette una zampetta pelosa contro il finestrino, meravigliato. Gli anelli di Saturno brillavano come un milione di piccoli cristalli. Visitarono un pianeta fatto interamente di nuvole rimbalzanti, dove ${petName} salto piu in alto che mai.`,
          `Su una stella lontana, incontrarono i Gattini Cosmici, un gruppo amichevole che raccoglieva polvere di stelle per i loro progetti artistici. ${petName} li aiuto a dipingere una nuova costellazione a forma di impronta di zampa. I Gattini Cosmici esultarono e la costellazione brillo intensamente nel cielo notturno.`,
          `Quando il razzo atterro dolcemente a casa, ${petName} portava un piccolo barattolo di polvere di stelle come ricordo. Accoccolandosi sul caldo davanzale, ${petName} guardo il cielo e sorrise. La, brillando intensamente, c'era la costellazione a forma di zampa. Le piu grandi avventure riportano sempre a casa.`,
        ],
      },
    },
    underwaterKingdom: {
      en: {
        title: `${petName} and the Underwater Kingdom`,
        pages: [
          `${petName} was playing by the seashore when a sparkling seashell washed up on the sand. It hummed a gentle melody and glowed with an ocean-blue light. When ${petName} leaned in to listen, the shell whispered, "The Underwater Kingdom needs a hero. Will you come?"`,
          `In a flash of bubbles, ${petName} found a magical bubble helmet and dove beneath the waves. Below the surface was a breathtaking world of coral castles, dancing jellyfish, and fish that shimmered in every colour of the rainbow. A seahorse guard bowed and said, "Welcome, brave one."`,
          `The kingdom was in trouble. A grumpy octopus had tangled all the sea roads with its long tentacles, and no one could travel anywhere! ${petName} had an idea. "Maybe the octopus just needs a friend," ${petName} said bravely, and swam toward the octopus's cave.`,
          `Inside the cave, the octopus looked lonely, not grumpy at all. ${petName} offered to play a game, and soon they were chasing bubbles together. The octopus laughed so hard that all its tentacles uncurled, and the sea roads were clear again! The whole kingdom celebrated.`,
          `The grateful Sea King placed a coral crown on ${petName}'s head and declared a holiday in honour of their new friend. As ${petName} surfaced back on the beach, the magical seashell sat safely in a paw. Whenever ${petName} held it to an ear, the ocean still hummed its gentle song of friendship.`,
        ],
      },
      es: {
        title: `${petName} y el Reino Submarino`,
        pages: [
          `${petName} estaba jugando en la orilla del mar cuando una concha brillante llego a la arena. Tarareaba una suave melodia y brillaba con una luz azul oceano. Cuando ${petName} se acerco a escuchar, la concha susurro: "El Reino Submarino necesita un heroe. Vendras?"`,
          `En un destello de burbujas, ${petName} encontro un casco de burbuja magico y se sumergio bajo las olas. Bajo la superficie habia un mundo impresionante de castillos de coral, medusas danzantes y peces que brillaban en todos los colores del arcoiris.`,
          `El reino estaba en problemas. Un pulpo malhumorado habia enredado todos los caminos del mar con sus largos tentaculos. ${petName} tuvo una idea: "Tal vez el pulpo solo necesita un amigo", dijo con valentia, y nado hacia la cueva del pulpo.`,
          `Dentro de la cueva, el pulpo parecia solitario, no malhumorado. ${petName} le ofrecio jugar y pronto estaban persiguiendo burbujas juntos. El pulpo rio tanto que todos sus tentaculos se desenrollaron, y los caminos del mar quedaron libres de nuevo.`,
          `El agradecido Rey del Mar coloco una corona de coral en la cabeza de ${petName} y declaro un dia festivo en honor a su nuevo amigo. Cuando ${petName} volvio a la playa, la concha magica descansaba segura en su patita. Las mejores amistades se encuentran en los lugares mas inesperados.`,
        ],
      },
      fr: {
        title: `${petName} et le Royaume Sous-Marin`,
        pages: [
          `${petName} jouait au bord de la mer quand un coquillage scintillant s'echoua sur le sable. Il fredonnait une douce melodie et brillait d'une lumiere bleu ocean. ${petName} s'approcha pour ecouter et le coquillage murmura : "Le Royaume Sous-Marin a besoin d'un heros. Viendras-tu ?"`,
          `Dans un eclat de bulles, ${petName} trouva un casque a bulles magique et plongea sous les vagues. Sous la surface se trouvait un monde epoustouflant de chateaux de corail, de meduses dansantes et de poissons aux couleurs de l'arc-en-ciel.`,
          `Le royaume etait en difficulte. Une pieuvre grincheuse avait emmele toutes les routes marines avec ses longs tentacules. ${petName} eut une idee : "Peut-etre que la pieuvre a juste besoin d'un ami", dit-il courageusement, et nagea vers la grotte.`,
          `Dans la grotte, la pieuvre semblait seule, pas du tout grincheuse. ${petName} proposa de jouer et bientot ils chassaient des bulles ensemble. La pieuvre rit tellement que tous ses tentacules se deroulaient et les routes marines furent a nouveau libres !`,
          `Le Roi de la Mer reconnaissant placa une couronne de corail sur la tete de ${petName}. De retour sur la plage, le coquillage magique reposait en securite dans sa patte. Chaque fois que ${petName} le portait a son oreille, l'ocean fredonnait encore sa douce chanson d'amitie.`,
        ],
      },
      it: {
        title: `${petName} e il Regno Sottomarino`,
        pages: [
          `${petName} stava giocando in riva al mare quando una conchiglia scintillante arrivo sulla sabbia. Canticchiava una dolce melodia e brillava di una luce blu oceano. Quando ${petName} si avvicino per ascoltare, la conchiglia sussurro: "Il Regno Sottomarino ha bisogno di un eroe. Verrai?"`,
          `In un lampo di bolle, ${petName} trovo un casco a bolle magico e si tuffo sotto le onde. Sotto la superficie c'era un mondo mozzafiato di castelli di corallo, meduse danzanti e pesci che luccicavano in ogni colore dell'arcobaleno.`,
          `Il regno era in difficolta. Un polpo scontroso aveva aggrovigliato tutte le strade del mare con i suoi lunghi tentacoli. ${petName} ebbe un'idea: "Forse il polpo ha solo bisogno di un amico", disse coraggiosamente, e nuoto verso la grotta del polpo.`,
          `Nella grotta, il polpo sembrava solo, non scontroso. ${petName} gli propose di giocare e presto stavano inseguendo bolle insieme. Il polpo rise cosi tanto che tutti i suoi tentacoli si srotolarono, e le strade del mare furono di nuovo libere!`,
          `Il grato Re del Mare pose una corona di corallo sulla testa di ${petName} e dichiaro un giorno di festa. Tornato sulla spiaggia, la conchiglia magica riposava al sicuro nella sua zampetta. Ogni volta che ${petName} la portava all'orecchio, l'oceano canticchiava ancora la sua dolce canzone di amicizia.`,
        ],
      },
    },
    enchantedForest: {
      en: {
        title: `${petName} in the Enchanted Forest`,
        pages: [
          `On a misty morning, ${petName} discovered a hidden path behind the garden fence. The trail glowed with tiny golden lights, and the air smelled of honey and wildflowers. ${petName} couldn't resist following it, and each step forward made the forest seem more magical.`,
          `The trees here could talk! An old oak bent down and said, "Welcome, little friend. The Enchanted Forest has been waiting for you." Fireflies danced in swirling patterns, and mushrooms glowed like little lanterns along the path. A cheerful squirrel offered to be ${petName}'s guide.`,
          `Deep in the forest, they found the Wishing Well. Its waters sparkled like liquid silver. "Make a wish," the squirrel said with a wink. ${petName} closed both eyes tight and wished for something wonderful: that every creature in the forest would always have enough food and friendship.`,
          `The Wishing Well erupted in a fountain of sparkles! Flowers bloomed everywhere, berry bushes grew tall, and acorns rained down from the oak trees. All the forest animals came out to celebrate, and they crowned ${petName} the Guardian of the Enchanted Forest.`,
          `As the sun began to set, ${petName} followed the golden path back home, wearing a tiny crown of wildflowers. The garden fence no longer hid the path; it was always there now, waiting for whenever ${petName} wanted to visit. Some doors, once opened, stay open forever.`,
        ],
      },
      es: {
        title: `${petName} en el Bosque Encantado`,
        pages: [
          `En una manana brumosa, ${petName} descubrio un camino escondido detras de la valla del jardin. El sendero brillaba con pequenas luces doradas, y el aire olia a miel y flores silvestres. ${petName} no pudo resistir seguirlo, y cada paso hacia el bosque mas magico.`,
          `Los arboles aqui podian hablar! Un viejo roble se inclino y dijo: "Bienvenido, pequeno amigo. El Bosque Encantado te ha estado esperando." Las luciernagas danzaban en patrones arremolinados y los hongos brillaban como pequenas linternas a lo largo del camino.`,
          `En lo profundo del bosque, encontraron el Pozo de los Deseos. Sus aguas brillaban como plata liquida. "Pide un deseo", dijo la ardilla con un guino. ${petName} cerro los ojos y deseo que todas las criaturas del bosque siempre tuvieran suficiente comida y amistad.`,
          `El Pozo de los Deseos erupciono en una fuente de brillos! Las flores florecieron por todas partes, los arbustos de bayas crecieron altos y las bellotas llovieron de los robles. Todos los animales del bosque salieron a celebrar y coronaron a ${petName} como Guardian del Bosque Encantado.`,
          `Cuando el sol comenzo a ponerse, ${petName} siguio el camino dorado de vuelta a casa, con una pequena corona de flores silvestres. La valla del jardin ya no escondia el camino; siempre estaba alli, esperando a que ${petName} quisiera visitar. Algunas puertas, una vez abiertas, permanecen abiertas para siempre.`,
        ],
      },
      fr: {
        title: `${petName} dans la Foret Enchantee`,
        pages: [
          `Par un matin brumeux, ${petName} decouvrit un chemin cache derriere la cloture du jardin. Le sentier brillait de petites lumieres dorees, et l'air sentait le miel et les fleurs sauvages. ${petName} ne put resister et chaque pas rendait la foret encore plus magique.`,
          `Les arbres ici pouvaient parler ! Un vieux chene se pencha et dit : "Bienvenue, petit ami. La Foret Enchantee t'attendait." Des lucioles dansaient en spirales et des champignons brillaient comme de petites lanternes le long du chemin.`,
          `Au coeur de la foret, ils trouverent le Puits aux Souhaits. Ses eaux scintillaient comme de l'argent liquide. "Fais un voeu", dit l'ecureuil avec un clin d'oeil. ${petName} ferma les yeux et souhaita que chaque creature de la foret ait toujours assez de nourriture et d'amitie.`,
          `Le Puits aux Souhaits jaillit en une fontaine d'etincelles ! Des fleurs fleurirent partout, les buissons de baies pousserent et des glands tomberent des chenes. Tous les animaux de la foret sortirent celebrer et couronnerent ${petName} Gardien de la Foret Enchantee.`,
          `Au coucher du soleil, ${petName} suivit le chemin dore pour rentrer, portant une petite couronne de fleurs sauvages. La cloture du jardin ne cachait plus le chemin ; il etait toujours la, attendant que ${petName} veuille visiter. Certaines portes, une fois ouvertes, restent ouvertes pour toujours.`,
        ],
      },
      it: {
        title: `${petName} nella Foresta Incantata`,
        pages: [
          `In una mattina nebbiosa, ${petName} scopri un sentiero nascosto dietro la recinzione del giardino. Il sentiero brillava di piccole luci dorate e l'aria profumava di miele e fiori selvatici. ${petName} non pote resistere a seguirlo, e ogni passo rendeva la foresta piu magica.`,
          `Gli alberi qui potevano parlare! Una vecchia quercia si chino e disse: "Benvenuto, piccolo amico. La Foresta Incantata ti stava aspettando." Le lucciole danzavano in motivi vorticosi e i funghi brillavano come piccole lanterne lungo il sentiero.`,
          `Nel profondo della foresta, trovarono il Pozzo dei Desideri. Le sue acque scintillavano come argento liquido. "Esprimi un desiderio", disse lo scoiattolo con un occhiolino. ${petName} chiuse gli occhi e desidero che ogni creatura della foresta avesse sempre abbastanza cibo e amicizia.`,
          `Il Pozzo dei Desideri eruppe in una fontana di scintille! I fiori sbocciarono ovunque, i cespugli di bacche crebbero alti e le ghiande piovvero dalle querce. Tutti gli animali della foresta uscirono a festeggiare e incoronarono ${petName} Guardiano della Foresta Incantata.`,
          `Al tramonto, ${petName} segui il sentiero dorato per tornare a casa, indossando una piccola corona di fiori selvatici. La recinzione del giardino non nascondeva piu il sentiero; era sempre li, in attesa di quando ${petName} volesse visitare. Alcune porte, una volta aperte, restano aperte per sempre.`,
        ],
      },
    },
    pirateTreasure: {
      en: {
        title: `${petName} and the Pirate Treasure`,
        pages: [
          `${petName} found an old rolled-up map tucked inside a hollow log in the park. It had a big red X marked on it and the words "Captain Whisker's Lost Treasure" written in faded ink. ${petName}'s heart raced with excitement. A real treasure map!`,
          `Following the map, ${petName} arrived at the harbour where a jolly little sailboat was waiting. Its flag had a paw print and crossbones on it. The wind filled the sails, and off they went across the sparkling blue sea, following the compass and the map.`,
          `After sailing past three small islands, ${petName} reached Treasure Island. It was wild and beautiful, with palm trees and colourful parrots squawking overhead. The map led through a jungle trail, past a waterfall, and up to a cave entrance covered in vines.`,
          `Inside the cave, ${petName} discovered Captain Whisker's treasure chest! But instead of gold coins, it was filled with something even better: toys, treats, and a journal full of stories from the captain's adventures. A note read, "For the next brave explorer who finds this."`,
          `${petName} sailed home with the treasure chest, sharing toys with every animal friend along the way. Back home, ${petName} opened the journal and began reading the captain's tales by lamplight. Perhaps someday ${petName} would fill a journal of adventures too, for the next explorer to find.`,
        ],
      },
      es: {
        title: `${petName} y el Tesoro Pirata`,
        pages: [
          `${petName} encontro un viejo mapa enrollado dentro de un tronco hueco en el parque. Tenia una gran X roja y las palabras "Tesoro Perdido del Capitan Bigotes" escritas en tinta descolorida. El corazon de ${petName} latio con emocion. Un mapa del tesoro de verdad!`,
          `Siguiendo el mapa, ${petName} llego al puerto donde esperaba un alegre velero. Su bandera tenia una huella de pata y unos huesos cruzados. El viento lleno las velas y partieron a traves del mar azul brillante, siguiendo la brujula y el mapa.`,
          `Despues de navegar junto a tres pequenas islas, ${petName} llego a la Isla del Tesoro. Era salvaje y hermosa, con palmeras y loros coloridos. El mapa conducia por un sendero de jungla, pasando una cascada, hasta la entrada de una cueva cubierta de enredaderas.`,
          `Dentro de la cueva, ${petName} descubrio el cofre del tesoro del Capitan Bigotes! Pero en lugar de monedas de oro, estaba lleno de algo aun mejor: juguetes, golosinas y un diario lleno de historias de las aventuras del capitan. Una nota decia: "Para el proximo valiente explorador."`,
          `${petName} navego a casa con el cofre del tesoro, compartiendo juguetes con cada amigo animal en el camino. En casa, ${petName} abrio el diario y comenzo a leer los relatos del capitan a la luz de la lampara. Quizas algun dia ${petName} tambien llenaria un diario de aventuras.`,
        ],
      },
      fr: {
        title: `${petName} et le Tresor des Pirates`,
        pages: [
          `${petName} trouva une vieille carte roulee a l'interieur d'un tronc creux dans le parc. Elle avait un grand X rouge et les mots "Tresor Perdu du Capitaine Moustaches" ecrits a l'encre fanee. Le coeur de ${petName} battit d'excitation. Une vraie carte au tresor !`,
          `En suivant la carte, ${petName} arriva au port ou un joyeux petit voilier attendait. Son drapeau portait une empreinte de patte et des os croises. Le vent gonfla les voiles et ils partirent a travers la mer bleue etincelante, suivant la boussole et la carte.`,
          `Apres avoir navigue devant trois petites iles, ${petName} atteignit l'Ile au Tresor. Elle etait sauvage et magnifique, avec des palmiers et des perroquets colores. La carte menait a travers un sentier de jungle, passant une cascade, jusqu'a l'entree d'une grotte couverte de lianes.`,
          `Dans la grotte, ${petName} decouvrit le coffre au tresor du Capitaine Moustaches ! Mais au lieu de pieces d'or, il etait rempli de quelque chose d'encore mieux : des jouets, des friandises et un journal plein d'histoires des aventures du capitaine.`,
          `${petName} rentra chez lui avec le coffre au tresor, partageant des jouets avec chaque ami animal en chemin. A la maison, ${petName} ouvrit le journal et commenca a lire les recits du capitaine a la lumiere de la lampe. Peut-etre qu'un jour ${petName} remplirait aussi un journal d'aventures.`,
        ],
      },
      it: {
        title: `${petName} e il Tesoro dei Pirati`,
        pages: [
          `${petName} trovo una vecchia mappa arrotolata dentro un tronco cavo nel parco. Aveva una grande X rossa e le parole "Tesoro Perduto del Capitano Baffoni" scritte con inchiostro sbiadito. Il cuore di ${petName} batte forte dall'emozione. Una vera mappa del tesoro!`,
          `Seguendo la mappa, ${petName} arrivo al porto dove aspettava un allegro veliero. La sua bandiera aveva un'impronta di zampa e delle ossa incrociate. Il vento riempi le vele e partirono attraverso il mare blu scintillante, seguendo la bussola e la mappa.`,
          `Dopo aver navigato oltre tre piccole isole, ${petName} raggiunse l'Isola del Tesoro. Era selvaggia e bellissima, con palme e pappagalli colorati. La mappa conduceva lungo un sentiero nella giungla, oltre una cascata, fino all'ingresso di una grotta coperta di liane.`,
          `Nella grotta, ${petName} scopri il forziere del Capitano Baffoni! Ma invece di monete d'oro, era pieno di qualcosa di ancora meglio: giocattoli, dolcetti e un diario pieno di storie delle avventure del capitano. Un biglietto diceva: "Per il prossimo coraggioso esploratore."`,
          `${petName} torno a casa con il forziere, condividendo giocattoli con ogni amico animale lungo la strada. A casa, ${petName} apri il diario e comincio a leggere i racconti del capitano alla luce della lampada. Forse un giorno anche ${petName} avrebbe riempito un diario di avventure.`,
        ],
      },
    },
    dinosaurLand: {
      en: {
        title: `${petName} in Dinosaur Land`,
        pages: [
          `${petName} was digging in the garden when a paw struck something hard and smooth. It was a glowing amber stone, warm to the touch. The moment ${petName} picked it up, the world shimmered and swirled, and suddenly the garden was replaced by a lush prehistoric jungle!`,
          `Enormous ferns towered overhead, and the ground trembled with distant footsteps. A baby triceratops waddled up to ${petName} and nuzzled a friendly hello. "Raaah!" it squeaked. ${petName} and the little dinosaur became instant friends, and together they set off to explore Dinosaur Land.`,
          `They discovered a river where long-necked brachiosaurus drank peacefully, their heads peeking above the treetops. A playful pterodactyl swooped down and gave ${petName} a ride through the sky. From up high, ${petName} could see volcanoes, meadows, and a sparkling waterfall.`,
          `Near the waterfall, a group of dinosaur eggs was in danger — the nest was too close to the rising river! ${petName} and the triceratops worked together to gently move each egg to higher ground. When the eggs hatched, tiny dinosaurs chirped happily at their rescuers.`,
          `As the amber stone began to glow again, ${petName} knew it was time to go home. The baby triceratops gave one last nuzzle goodbye. In a flash, ${petName} was back in the garden, the stone still warm in a paw. Every time it glowed, ${petName} knew another adventure in Dinosaur Land was waiting.`,
        ],
      },
      es: {
        title: `${petName} en la Tierra de los Dinosaurios`,
        pages: [
          `${petName} estaba cavando en el jardin cuando una pata golpeo algo duro y liso. Era una piedra de ambar brillante, caliente al tacto. En el momento en que ${petName} la recogio, el mundo brillo y giro, y de repente el jardin fue reemplazado por una exuberante jungla prehistorica!`,
          `Enormes helechos se elevaban sobre ellos y el suelo temblaba con pasos distantes. Un bebe triceratops se acerco a ${petName} y lo saludo con un amistoso empujon. "Raaah!" chillo. ${petName} y el pequeno dinosaurio se hicieron amigos al instante y juntos partieron a explorar.`,
          `Descubrieron un rio donde braquiosaurios de cuello largo bebian pacificamente. Un jugueton pterodactilo bajo en picada y le dio a ${petName} un paseo por el cielo. Desde las alturas, ${petName} podia ver volcanes, praderas y una cascada brillante.`,
          `Cerca de la cascada, un grupo de huevos de dinosaurio estaba en peligro: el nido estaba demasiado cerca del rio creciente! ${petName} y el triceratops trabajaron juntos para mover cada huevo a un terreno mas alto. Cuando los huevos eclosionaron, pequenos dinosaurios piaron felices.`,
          `Cuando la piedra de ambar comenzo a brillar de nuevo, ${petName} supo que era hora de volver a casa. El bebe triceratops dio un ultimo empujoncito de despedida. En un destello, ${petName} estaba de vuelta en el jardin, con la piedra aun caliente en la pata. Cada vez que brillaba, otra aventura esperaba.`,
        ],
      },
      fr: {
        title: `${petName} au Pays des Dinosaures`,
        pages: [
          `${petName} creusait dans le jardin quand une patte heurta quelque chose de dur et lisse. C'etait une pierre d'ambre brillante, chaude au toucher. Des que ${petName} la ramassa, le monde scintilla et tourbillonna, et soudain le jardin fut remplace par une jungle prehistorique luxuriante !`,
          `D'enormes fougeres s'elevaient au-dessus, et le sol tremblait de pas lointains. Un bebe triceratops s'approcha de ${petName} et lui fit un calin amical. "Raaah !" couina-t-il. ${petName} et le petit dinosaure devinrent immediatement amis et partirent ensemble explorer le Pays des Dinosaures.`,
          `Ils decouvrirent une riviere ou des brachiosaures au long cou buvaient paisiblement. Un pterodactyle joueur descendit en pique et offrit a ${petName} un tour dans le ciel. De la-haut, ${petName} pouvait voir des volcans, des prairies et une cascade scintillante.`,
          `Pres de la cascade, un groupe d'oeufs de dinosaures etait en danger — le nid etait trop pres de la riviere montante ! ${petName} et le triceratops travaillerent ensemble pour deplacer chaque oeuf vers un terrain plus eleve. Les petits dinosaures piaulerent joyeusement.`,
          `Quand la pierre d'ambre recommenca a briller, ${petName} sut qu'il etait temps de rentrer. Le bebe triceratops donna un dernier calin d'adieu. En un eclair, ${petName} etait de retour dans le jardin, la pierre encore chaude dans sa patte. Chaque fois qu'elle brillait, une nouvelle aventure attendait.`,
        ],
      },
      it: {
        title: `${petName} nella Terra dei Dinosauri`,
        pages: [
          `${petName} stava scavando in giardino quando una zampa colpi qualcosa di duro e liscio. Era una pietra d'ambra luminosa, calda al tatto. Nel momento in cui ${petName} la raccolse, il mondo brillo e turbino, e improvvisamente il giardino fu sostituito da una rigogliosa giungla preistorica!`,
          `Enormi felci si ergevano sopra di loro, e il terreno tremava per passi lontani. Un cucciolo di triceratopo si avvicino a ${petName} e lo saluto con un amichevole musetto. "Raaah!" squitti. ${petName} e il piccolo dinosauro diventarono subito amici e partirono insieme per esplorare.`,
          `Scoprirono un fiume dove brachiosauri dal collo lungo bevevano pacificamente. Uno pterodattilo giocherellone scese in picchiata e diede a ${petName} un giro nel cielo. Dall'alto, ${petName} poteva vedere vulcani, prati e una cascata scintillante.`,
          `Vicino alla cascata, un gruppo di uova di dinosauro era in pericolo — il nido era troppo vicino al fiume in piena! ${petName} e il triceratopo lavorarono insieme per spostare ogni uovo su un terreno piu alto. Quando le uova si schiusero, piccoli dinosauri cinguettarono felici.`,
          `Quando la pietra d'ambra comincio a brillare di nuovo, ${petName} seppe che era ora di tornare a casa. Il cucciolo di triceratopo diede un'ultima carezza di addio. In un lampo, ${petName} era di nuovo in giardino, con la pietra ancora calda nella zampa. Ogni volta che brillava, un'altra avventura aspettava.`,
        ],
      },
    },
  };

  const themeStories = stories[theme];
  if (!themeStories) {
    // Fallback: use spaceAdventure
    return getMockStory(petName, 'spaceAdventure', language);
  }

  const langStory = themeStories[language];
  if (!langStory) {
    // Fallback: English
    return themeStories['en'] ?? getMockStory(petName, 'spaceAdventure', 'en');
  }

  return langStory;
}

/* -------------------------------------------------------------------------- */
/*  Exported mock generator                                                   */
/* -------------------------------------------------------------------------- */

export async function generateMockStory(
  input: StoryInput
): Promise<GeneratedStory> {
  // Simulate a short delay to feel realistic
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const storyData = getMockStory(input.petName, input.theme, input.language);

  const pages: StoryPage[] = storyData.pages.map((text, i) => {
    const color = PAGE_COLORS[i % PAGE_COLORS.length];
    const imageBase64 = createPlaceholderImage(color, `Page ${i + 1}`);
    return {
      pageNumber: i + 1,
      text,
      imageDescription: `Illustration for page ${i + 1} of ${input.petName}'s story in ${input.artStyle} style.`,
      imageBase64,
    };
  });

  const coverColor = '#4A6FA5';
  const coverImageBase64 = createPlaceholderImage(coverColor, 'Cover');

  return {
    title: storyData.title,
    pages,
    coverImageBase64,
  };
}
