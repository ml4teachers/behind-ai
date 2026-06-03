import type { Locale } from './config'

/*
 * Übersetzungs-Schicht (Gerüst).
 *
 * Aktuell nur die Shell/Navigation. Seiten-Inhalte werden beim jeweiligen
 * Redesign hierher migriert. Fehlt ein Key in der aktiven Sprache, greift
 * automatisch Deutsch (defaultLocale) als Fallback — Englisch darf also
 * lückenhaft bleiben, bis die Texte final sind.
 */
export const messages: Record<Locale, Record<string, string>> = {
  de: {
    'brand.name': 'Behind AI',
    'brand.tagline': 'Wie funktionieren KI-Sprachmodelle?',

    // Startseite
    'home.hero.title': 'Schau hinter die KI',
    'home.hero.subtitle':
      'Wie Sprachmodelle wirklich funktionieren – zum Ausprobieren mit echten Modellen.',

    'home.demo.caption':
      'Der Kern jedes Sprachmodells: das nächste Wort vorhersagen. Tippe einen Satzanfang und sieh, was ein echtes Modell für wahrscheinlich hält – klicke einen Token, um ihn anzuhängen.',
    'home.demo.seed': 'Gelb ist eine',
    'home.demo.placeholder': 'Gib einen Satzanfang ein …',
    'home.demo.predict': 'Nächsten Token vorhersagen',
    'home.demo.loading': 'Modell rechnet …',
    'home.demo.reset': 'Zurücksetzen',
    'home.demo.currentText': 'Aktueller Text',
    'home.demo.remaining': 'Tausende weitere Tokens',
    'home.demo.fallbackNotice': 'Beispiel-Daten – das Modell ist gerade nicht erreichbar.',
    'home.demo.openFull': 'Zur Erklärung',
    'home.demo.example1': 'Der beste Freund des Menschen ist der',
    'home.demo.example2': 'Es war einmal eine',

    'home.paths.heading': 'Zwei Wege durch das Thema',
    'home.path.behindModels.desc':
      'Wie die Technik funktioniert – von Tokens über Training bis Reasoning.',
    'home.path.aiInUse.desc':
      'Worauf es bei der Nutzung im Alltag ankommt – Datenschutz, Kosten, Hardware.',

    'home.more.title': 'Was ist überhaupt ein Sprachmodell?',
    'home.more.body':
      'Ein Sprachmodell hat enorme Mengen Text gelesen und dabei gelernt, Muster der Sprache zu erkennen. Im Kern sagt es immer das wahrscheinlichste nächste Wort voraus – nur auf extrem hohem Niveau. Daraus entstehen Antworten, Zusammenfassungen, Übersetzungen und vieles mehr.',

    'nav.home': 'Einführung',
    'nav.resources': 'Ressourcen',
    'nav.section.behindModels': 'Hinter den Modellen',
    'nav.section.aiInUse': 'KI im Einsatz',

    'nav.tokenization': 'Tokenisierung',
    'nav.nextToken': 'Next-Token-Prediction',
    'nav.data': 'Daten',
    'nav.training': 'Training vs. Inferenz',
    'nav.finetuning': 'Finetuning',
    'nav.rlhf': 'RLHF',
    'nav.rag': 'RAG',
    'nav.cot': 'Chain-of-Thought',
    'nav.embeddings': 'Embeddings',
    'nav.localVsCloud': 'Lokal vs. Cloud',
    'nav.hardware': 'Hardware-Check',
    'nav.costs': 'Kosten',
    'nav.privacy': 'Datenschutz',

    // --- Seiten-Pattern (gemeinsam) ---
    'common.moreAbout': 'Mehr dazu',
    'common.back': 'Zurück',
    'common.reset': 'Zurücksetzen',

    // --- Next-Token-Prediction ---
    'nextToken.title': 'Next-Token-Prediction',
    'nextToken.subtitle':
      'Ein Sprachmodell macht im Kern nur eines: Es sagt das nächste Token voraus — wieder und wieder, Token für Token.',
    'nextToken.placeholder': 'Gib den Anfang eines Satzes ein …',
    'nextToken.predict': 'Nächsten Token vorhersagen',
    // Beispiel-Satzanfänge (Pool; auf der Seite werden zufällig zwei gezeigt)
    'nextToken.ex1': 'Der beste Freund des Menschen ist der',
    'nextToken.ex2': 'Es war einmal eine',
    'nextToken.ex3': 'Die Hauptstadt von Frankreich ist',
    'nextToken.ex4': 'Zwei plus zwei ergibt',
    'nextToken.ex5': 'Der Himmel ist',
    'nextToken.ex6': 'Am Wochenende gehe ich am liebsten',
    'nextToken.ex7': 'Das Gegenteil von gross ist',
    'nextToken.ex8': 'Künstliche Intelligenz wird',
    'nextToken.caption':
      'Echtes Modell (Gemini über Vertex AI). Wähle einen Token, um den Satz Schritt für Schritt weiterzuschreiben — oder überlass die Wahl dem Zufall.',
    'nextToken.emptyTitle':
      'Klicke auf „Nächsten Token vorhersagen", um echte Wahrscheinlichkeiten zu sehen.',
    'nextToken.emptyBody':
      'Danach kannst du einzelne Tokens auswählen und beobachten, wie das Modell Schritt für Schritt Text erzeugt.',
    'nextToken.moreP1':
      'Das Herzstück jedes Sprachmodells ist eine einzige Fähigkeit: Für jedes mögliche nächste Token berechnet es eine Wahrscheinlichkeit. Zur Wahl stehen über 50 000 Tokens — aber nur eine Handvoll ist wirklich wahrscheinlich, der Rest liegt nahe null.',
    'nextToken.moreP2':
      'Einen ganzen Text erzeugt das Modell durch Wiederholung: Token anhängen, neu rechnen, nächstes Token wählen. So entsteht Wort für Wort ein ganzer Satz.',
    'nextToken.moreP3':
      'Die Temperatur steuert, wie „mutig" gewählt wird. Niedrig: Das Modell nimmt fast immer das wahrscheinlichste Token — verlässlich, aber vorhersehbar. Hoch: Die Verteilung wird flacher, auch unwahrscheinlichere Tokens kommen zum Zug — der Text wird kreativer und unberechenbarer.',
    'nextToken.nextLabel': 'Weiter: Wo kommen die Daten her?',

    // --- Tokenisierung ---
    'tokenization.title': 'Tokenisierung',
    'tokenization.subtitle':
      'Bevor ein Modell Text verarbeiten kann, zerlegt es ihn in Tokens — kleine Bausteine aus einzelnen Zeichen, Wortteilen oder ganzen Wörtern.',
    'tokenization.placeholder': 'Gib einen Text ein …',
    'tokenization.process': 'Text tokenisieren',
    'tokenization.example1': 'Beispieltext 1',
    'tokenization.example2': 'Beispieltext 2',
    'tokenization.caption':
      'Echter GPT-Tokenizer (BPE) — derselbe, den auch ChatGPT nutzt. Fahre über ein Token, um zu sehen, wie der Text zerschnitten wird.',
    'tokenization.emptyTitle':
      'Klicke auf „Text tokenisieren", um zu sehen, wie dein Text in Tokens zerfällt.',
    'tokenization.emptyBody':
      'Die Tokens müssen nicht mit Wörtern übereinstimmen — oft ist ein Wort aus mehreren Stücken zusammengesetzt.',
    'tokenization.multimodal':
      'Übrigens: Nicht nur Text wird tokenisiert. Auch Bilder und Audio zerlegen moderne Modelle in Tokens, bevor sie sie verarbeiten — mehr dazu später bei den Modell-Typen.',
    'tokenization.moreP1':
      'Computer verstehen keine Wörter, sondern nur Zahlen. Darum wird Text zuerst in Tokens zerlegt und jedes Token einer Zahl (Token-ID) zugeordnet.',
    'tokenization.moreP2':
      'Die Zerlegung übernimmt der BPE-Algorithmus (Byte Pair Encoding): Häufige Zeichenfolgen werden zu eigenen Tokens zusammengefasst, seltene Wörter in kleinere Stücke aufgeteilt. „Programmieren" wird so etwa zu „Program" + „m" + „ieren".',
    'tokenization.moreP3':
      'Aus den Token-IDs werden anschliessend Embeddings — Zahlenlisten, die Bedeutung erfassen. Genau darum geht es auf der nächsten Station.',
    'tokenization.nextLabel': 'Weiter: Embeddings',
    // Visualisierungs-Komponente (TokenizationVisualization)
    'tokenization.viz.loading': 'Text wird tokenisiert …',
    'tokenization.viz.tokensTitle': 'Tokens — so zerlegt das Modell deinen Text',
    'tokenization.viz.idsTitle': 'Token-IDs — nur diese Zahlen verarbeitet das Modell',
    'tokenization.viz.tokensWord': 'Tokens',
    'tokenization.viz.from': 'aus',
    'tokenization.viz.chars': 'Zeichen',
    'tokenization.viz.errorTitle': 'Tokenisierung fehlgeschlagen',
    'tokenization.viz.errorBody': 'Bitte versuche es noch einmal.',

    // --- Embeddings ---
    'embeddings.title': 'Embeddings',
    'embeddings.subtitle':
      'Embeddings übersetzen Bedeutung in Zahlen: Wörter mit ähnlicher Bedeutung bekommen ähnliche Zahlenvektoren — und Ähnlichkeit wird messbar.',
    'embeddings.caption':
      'Echte Embeddings (Google gemini-embedding-2). Tipp ein Wort ein — es wird live zu einem Vektor und landet bei Wörtern mit ähnlicher Bedeutung. Über die Legende lassen sich Kategorien aus- und einblenden. Die Karte ist eine 2D-Projektion eines 768-dimensionalen Raums; Nähe bleibt dabei grob erhalten.',
    'embeddings.moreP1':
      'Ein Embedding ist ein langer Zahlenvektor (hier 768 Zahlen). Das Besondere: Wörter mit ähnlicher Bedeutung haben ähnliche Vektoren. Man kann sich jedes Wort als Punkt in einem hochdimensionalen Raum vorstellen — „Hund" und „Katze" liegen nah beieinander, „Hund" und „Mathematik" weit auseinander. Genau diese Nähe drückt die Landkarte oben in zwei Dimensionen aus.',
    'embeddings.moreP2':
      'Wie ähnlich zwei Embeddings sind, misst die Cosinus-Ähnlichkeit: ein Wert zwischen -1 und 1 (in der Praxis meist 0 bis 1), wobei 1 für „nahezu gleiche Bedeutung" steht. Diese Vektoren lernt ein Modell aus riesigen Textmengen nach dem Prinzip: Wörter, die in ähnlichen Kontexten vorkommen, haben ähnliche Bedeutung.',
    'embeddings.moreP3':
      'Embeddings sind ein Grundbaustein vieler KI-Anwendungen: semantische Suche, Empfehlungssysteme, Übersetzung und vor allem RAG, wo passende Dokumente gefunden werden, um Antworten mit echtem Wissen zu unterfüttern.',
    'embeddings.nextLabel': 'Weiter: Next-Token-Prediction',

    'a11y.toggleTheme': 'Hell/Dunkel umschalten',
    'a11y.toggleSidebar': 'Navigation ein-/ausblenden',
    'a11y.toggleLanguage': 'Sprache wechseln',
    'a11y.toggleAccent': 'Akzentfarbe wählen',
  },
  en: {
    'brand.name': 'Behind AI',
    'brand.tagline': 'How do AI language models work?',

    // Home page
    'home.hero.title': 'Look behind the AI',
    'home.hero.subtitle':
      'How language models really work – hands-on with real models.',

    'home.demo.caption':
      'The core of every language model: predicting the next word. Type the start of a sentence and see what a real model finds likely – click a token to append it.',
    'home.demo.seed': 'Yellow is a',
    'home.demo.placeholder': 'Type the start of a sentence …',
    'home.demo.predict': 'Predict next token',
    'home.demo.loading': 'Model is thinking …',
    'home.demo.reset': 'Reset',
    'home.demo.currentText': 'Current text',
    'home.demo.remaining': 'Thousands more tokens',
    'home.demo.fallbackNotice': 'Example data – the model is currently unavailable.',
    'home.demo.openFull': 'To the explanation',
    'home.demo.example1': "Man's best friend is the",
    'home.demo.example2': 'Once upon a time there was a',

    'home.paths.heading': 'Two ways into the topic',
    'home.path.behindModels.desc':
      'How the technology works – from tokens through training to reasoning.',
    'home.path.aiInUse.desc':
      'What matters when using AI day to day – privacy, cost, hardware.',

    'home.more.title': 'So what is a language model?',
    'home.more.body':
      'A language model has read vast amounts of text and learned to recognise patterns in language. At its core it always predicts the most likely next word – just at an extremely high level. From that come answers, summaries, translations and much more.',

    'nav.home': 'Introduction',
    'nav.resources': 'Resources',
    'nav.section.behindModels': 'Behind the models',
    'nav.section.aiInUse': 'AI in practice',

    'nav.tokenization': 'Tokenization',
    'nav.nextToken': 'Next-token prediction',
    'nav.data': 'Data',
    'nav.training': 'Training vs. inference',
    'nav.finetuning': 'Fine-tuning',
    'nav.rlhf': 'RLHF',
    'nav.rag': 'RAG',
    'nav.cot': 'Chain-of-thought',
    'nav.embeddings': 'Embeddings',
    'nav.localVsCloud': 'Local vs. cloud',
    'nav.hardware': 'Hardware check',
    'nav.costs': 'Costs',
    'nav.privacy': 'Data protection',

    // --- Page pattern (shared) ---
    'common.moreAbout': 'Learn more',
    'common.back': 'Back',
    'common.reset': 'Reset',

    // --- Next-token prediction ---
    'nextToken.title': 'Next-token prediction',
    'nextToken.subtitle':
      'At its core a language model does only one thing: it predicts the next token — again and again, token by token.',
    'nextToken.placeholder': 'Type the start of a sentence …',
    'nextToken.predict': 'Predict next token',
    // Example sentence starts (pool; two are shown at random on the page)
    'nextToken.ex1': 'Man’s best friend is a',
    'nextToken.ex2': 'Once upon a time there was a',
    'nextToken.ex3': 'The capital of France is',
    'nextToken.ex4': 'Two plus two equals',
    'nextToken.ex5': 'The sky is',
    'nextToken.ex6': 'On weekends I love to',
    'nextToken.ex7': 'The opposite of big is',
    'nextToken.ex8': 'Artificial intelligence will',
    'nextToken.caption':
      'A real model (Gemini via Vertex AI). Pick a token to continue the sentence step by step — or let chance decide.',
    'nextToken.emptyTitle': 'Click “Predict next token” to see real probabilities.',
    'nextToken.emptyBody':
      'You can then pick individual tokens and watch the model generate text step by step.',
    'nextToken.moreP1':
      'The heart of every language model is a single skill: for each possible next token it computes a probability. There are over 50,000 tokens to choose from — but only a handful are truly likely; the rest sit near zero.',
    'nextToken.moreP2':
      'A whole text emerges through repetition: append a token, recompute, pick the next one. Word by word, a full sentence appears.',
    'nextToken.moreP3':
      'Temperature controls how “bold” the choice is. Low: the model almost always takes the most likely token — reliable but predictable. High: the distribution flattens and less likely tokens get picked too — the text becomes more creative and less predictable.',
    'nextToken.nextLabel': 'Next: Where does the data come from?',

    // --- Tokenization ---
    'tokenization.title': 'Tokenization',
    'tokenization.subtitle':
      'Before a model can process text, it splits it into tokens — small building blocks made of single characters, word fragments or whole words.',
    'tokenization.placeholder': 'Enter some text …',
    'tokenization.process': 'Tokenize text',
    'tokenization.example1': 'Sample text 1',
    'tokenization.example2': 'Sample text 2',
    'tokenization.caption':
      'A real GPT tokenizer (BPE) — the same one ChatGPT uses. Hover over a token to see how the text is cut up.',
    'tokenization.emptyTitle': 'Click “Tokenize text” to see how your text breaks into tokens.',
    'tokenization.emptyBody':
      'Tokens need not line up with words — often a single word is assembled from several pieces.',
    'tokenization.multimodal':
      'By the way: it’s not only text that gets tokenized. Modern models also split images and audio into tokens before processing them — more on that later under model types.',
    'tokenization.moreP1':
      'Computers don’t understand words, only numbers. So text is first split into tokens, and each token is mapped to a number (its token ID).',
    'tokenization.moreP2':
      'The split is done by the BPE algorithm (byte pair encoding): frequent character sequences become their own tokens, while rare words are broken into smaller pieces. “Programming”, for instance, might become “Program” + “m” + “ing”.',
    'tokenization.moreP3':
      'The token IDs then become embeddings — lists of numbers that capture meaning. That’s exactly what the next station is about.',
    'tokenization.nextLabel': 'Next: Embeddings',
    // Visualization component (TokenizationVisualization)
    'tokenization.viz.loading': 'Tokenizing text …',
    'tokenization.viz.tokensTitle': 'Tokens — how the model splits your text',
    'tokenization.viz.idsTitle': 'Token IDs — the model only processes these numbers',
    'tokenization.viz.tokensWord': 'tokens',
    'tokenization.viz.from': 'from',
    'tokenization.viz.chars': 'characters',
    'tokenization.viz.errorTitle': 'Tokenization failed',
    'tokenization.viz.errorBody': 'Please try again.',

    // --- Embeddings ---
    'embeddings.title': 'Embeddings',
    'embeddings.subtitle':
      'Embeddings turn meaning into numbers: words with similar meaning get similar number vectors — and similarity becomes measurable.',
    'embeddings.caption':
      'Real embeddings (Google gemini-embedding-2). Type a word — it becomes a vector live and lands next to words with similar meaning. Use the legend to show or hide categories. The map is a 2D projection of a 768-dimensional space; closeness is roughly preserved.',
    'embeddings.moreP1':
      'An embedding is a long vector of numbers (here 768 values). The key property: words with similar meaning have similar vectors. Picture each word as a point in a high-dimensional space — “dog” and “cat” sit close together, “dog” and “mathematics” far apart. That closeness is exactly what the map above expresses in two dimensions.',
    'embeddings.moreP2':
      'How similar two embeddings are is measured by cosine similarity: a value between -1 and 1 (in practice mostly 0 to 1), where 1 means “almost identical meaning”. A model learns these vectors from huge amounts of text following one principle: words that appear in similar contexts have similar meaning.',
    'embeddings.moreP3':
      'Embeddings are a foundational building block of many AI applications: semantic search, recommendation systems, translation and above all RAG, where matching documents are retrieved to ground answers in real knowledge.',
    'embeddings.nextLabel': 'Next: Next-token prediction',

    'a11y.toggleTheme': 'Toggle light/dark',
    'a11y.toggleSidebar': 'Show/hide navigation',
    'a11y.toggleLanguage': 'Switch language',
    'a11y.toggleAccent': 'Choose accent colour',
  },
}
