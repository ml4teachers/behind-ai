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
      'Der Kern jedes Sprachmodells: das nächste Wort vorhersagen. Tippe einen Satzanfang und sieh, was das Modell für wahrscheinlich hält – klicke einen Token, um ihn anzuhängen.',
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
      'Wie die Technik funktioniert – von Tokens über Training und Reasoning bis zu Bild & Ton.',
    'home.path.aiInUse.desc':
      'Worauf es bei der Nutzung im Alltag ankommt – Datenschutz, Kosten, Hardware.',

    'home.more.title': 'Was ist überhaupt ein Sprachmodell?',
    'home.more.body':
      'Ein Sprachmodell hat enorme Mengen Text gelesen und dabei gelernt, Muster der Sprache zu erkennen. Im Kern sagt es immer das wahrscheinlichste nächste Wort voraus – nur auf extrem hohem Niveau. Daraus entstehen Antworten, Zusammenfassungen, Übersetzungen und vieles mehr.',

    'nav.home': 'Einführung',
    'nav.resources': 'Ressourcen',
    'nav.impressum': 'Impressum',
    'nav.section.behindModels': 'Hinter den Modellen',
    'nav.section.aiInUse': 'KI im Einsatz',

    'nav.tokenization': 'Tokenisierung',
    'nav.nextToken': 'Next-Token-Prediction',
    'nav.data': 'Daten',
    'nav.training': 'Training',
    'nav.finetuning': 'Finetuning',
    'nav.rlhf': 'RLHF',
    'nav.rag': 'RAG',
    'nav.cot': 'Chain-of-Thought',
    'nav.rlvr': 'RLVR',
    'nav.embeddings': 'Embeddings',
    'nav.multimodal': 'Bild & Ton',
    'nav.localVsCloud': 'Lokal vs. Cloud',
    'nav.hardware': 'Hardware-Check',
    'nav.costs': 'Kosten',
    'nav.privacy': 'Datenschutz',
    'nav.toolChoice': 'Werkzeugwahl',

    // --- Seiten-Pattern (gemeinsam) ---
    'common.moreAbout': 'Mehr dazu',
    'common.back': 'Zurück',
    'common.reset': 'Zurücksetzen',

    // === KI im Einsatz (Thread 8) ===
    // --- Lokal vs. Cloud ---
    'localVsCloud.title': 'Lokal vs. Cloud: Wo arbeitet die KI?',
    'localVsCloud.subtitle':
      'Dieselbe Anfrage, drei Wege — und drei sehr unterschiedliche Antworten auf die Frage, was dein Gerät verlässt.',
    'localVsCloud.caption':
      'Eine Anfrage, drei Wege — wir markieren die sensiblen Stellen und zeigen, was bei jedem Weg beim Anbieter ankommt.',
    'localVsCloud.moreP1':
      'Lokal heisst: Das Modell läuft direkt auf deinem Gerät (z. B. mit Ollama). Deine Eingabe verlässt den Rechner nicht — ideal für den Datenschutz, aber begrenzt durch deine Hardware.',
    'localVsCloud.moreP2':
      'Über eine Cloud-API schickst du deinen Text an einen Anbieter (OpenAI, Google, Anthropic …). Du bekommst die stärksten Modelle, aber dein Originaltext — inklusive Namen, Noten, Gesundheitsangaben — landet auf fremden Servern.',
    'localVsCloud.moreP3':
      'Ein Wrapper ist ein Zwischendienst, der heikle Stellen anonymisiert, bevor er die Anfrage weiterleitet — oft mit Servern in der Schweiz oder EU. Schweizer Beispiele sind die „Private AI" von Safe Swiss Cloud oder das offene Schweizer Modell Apertus. Der Anbieter sieht dann nur Platzhalter; dem Wrapper selbst musst du aber vertrauen, denn er sieht das Original.',
    'localVsCloud.nextLabel': 'Weiter: Hardware-Check',

    // --- Kosten ---
    'costs.title': 'Was kostet die KI?',
    'costs.subtitle':
      'Lokal zahlst du einmal für Hardware, in der Cloud pro Token. Gib einen Text ein und sieh, was eine Anfrage wirklich kostet.',
    'costs.caption':
      'Gezählt mit demselben Tokenizer wie bei der Tokenisierung, hochgerechnet mit den Listenpreisen vom Juni 2026.',
    'costs.moreP1':
      'Lokal sind die Hauptkosten einmalig — ein leistungsfähiger Rechner oder eine gute Grafikkarte. Danach zahlst du fast nur den Strom; die Software zum Ausführen (z. B. Ollama) ist gratis.',
    'costs.moreP2':
      'In der Cloud zahlst du pro Token — die kleinen Texteinheiten, aus denen Anfrage und Antwort bestehen. Die Antwort-Tokens (Output) kosten meist deutlich mehr als die Anfrage-Tokens (Input). Günstige Modelle liegen bei wenigen Rappen pro Million Tokens, Spitzenmodelle deutlich höher.',
    'costs.moreP3':
      'Drei Spar-Hebel: das passende (nicht das teuerste) Modell wählen; bei langen Chats wächst der Verlauf und wird jedes Mal mitgeschickt — das treibt die Kosten; und „Cached Input" macht wiederholten Kontext oft rund zehnmal günstiger. Daneben gibt es Abos (ChatGPT Plus/Pro, Claude Pro, Gemini-Pläne) mit fixer Monatsgebühr und Wrapper-Dienste mit eigenem Aufschlag.',
    'costs.nextLabel': 'Weiter: Datenschutz',

    // --- Hardware-Check ---
    'hardware.title': 'Braucht KI einen Supercomputer?',
    'hardware.subtitle':
      'Manche Modelle laufen auf dem Laptop, andere nur im Rechenzentrum. Stell dein Gerät ein und sieh, was lokal möglich ist.',
    'hardware.caption':
      'Speicher-Mathematik: Parameter mal Bytes pro Gewicht. Eine Veranschaulichung, keine Garantie für dein genaues System.',
    'hardware.moreP1':
      'Ein Modell muss in den schnellen Speicher passen — den Arbeitsspeicher (RAM) oder besser den Grafikspeicher (VRAM). Faustformel: Milliarden Parameter × Bytes pro Gewicht. Bei „Q4" sind das etwa 0.6 GB pro Milliarde, ein 8B-Modell braucht also rund 5 GB.',
    'hardware.moreP2':
      'Quantisierung verkleinert die Zahlen im Modell: von F16 (volle Präzision) über Q8 (fast verlustfrei) zu Q4 (Standard fürs lokale Laufen). Von Q8 auf Q4 spart rund 40 % Speicher bei nur etwa 2 % Qualitätsverlust — darum ist Q4 der Standard.',
    'hardware.moreP3':
      'Apple-Geräte teilen sich einen Speicher zwischen Prozessor und Grafik (Unified Memory) — praktisch für grosse Modelle. Zum Ausführen brauchst du ein Programm: Ollama (am einfachsten), LM Studio (mit Oberfläche) oder llama.cpp (für Feinabstimmung). Wichtig: Modell plus Chatverlauf sollten unter rund 80 % des Speichers bleiben, sonst wird es sehr langsam.',
    'hardware.nextLabel': 'Weiter: Kosten',

    // --- Modell-Typen / Multimodal ---
    'multimodal.title': 'Wie ein Sprachmodell ein Bild liest',
    'multimodal.subtitle':
      'Ein Sprachmodell verarbeitet eine Reihe: ein Stück nach dem anderen. Ein Bild ist aber eine Fläche. Sieh, wie aus der Fläche eine Reihe wird, die dasselbe Modell lesen kann.',
    'multimodal.caption':
      'Jede Kachel und ihre Reihenfolge sind echt aus dem Bild berechnet. Genau diese Verwandlung — von der Fläche in eine Reihe — macht ein Modell, bevor es ein Bild „lesen" kann.',
    'multimodal.moreP1':
      'Multimodal heisst: Ein Modell verarbeitet nicht nur Text, sondern auch Bilder, Ton, teils Video. Bekannte Beispiele sind GPT-5, Gemini und Claude. Auch offene Modelle, die lokal laufen, können sehen: Gemma 3 (ab 4B) versteht Bilder, Qwen3-VL und Qwen3-Omni sogar Bild, Ton und Video.',
    'multimodal.moreP2':
      'Der Kern ist immer gleich: Ein eigener „Encoder" zerlegt das Bild in Kacheln und übersetzt jede in dieselbe Zahlensprache wie die Text-Tokens — einen Vektor im selben Bedeutungsraum (siehe Embeddings). Darum muss das Modell nicht umlernen: Eine Bild-Kachel ist für es bloss ein weiteres Stück in der Reihe, das es wie ein Wort behandelt.',
    'multimodal.moreP3':
      'Ton wird zuerst in ein Spektrogramm verwandelt — ein „Bild des Klangs" — und dann wie ein Bild zerlegt; Video ist einfach eine Folge von Bildern. So wird am Ende alles zur selben Reihe von Vektoren. „Sehen" und „Hören" sind für ein Sprachmodell also kein zweiter Sinn, sondern derselbe Mechanismus mit anderem Futter.',
    'multimodal.nextLabel': 'Weiter: KI im Einsatz',

    // --- Datenschutz ---
    'privacy.title': 'Was teilst du mit der KI?',
    'privacy.subtitle':
      'Eine harmlose Anfrage enthält schnell Schützenswertes. Tippe eine Nachricht und sieh, was darin steckt — und worauf du dann achten musst.',
    'privacy.caption':
      'Ein Sprachmodell markiert die schützenswerten Stellen. So siehst du, was beim Cloud-Einsatz beim Anbieter ankäme. Keine Rechtsberatung.',
    'privacy.factorsTitle': 'Worauf kommt es an?',
    'privacy.factorPrivacyTitle': 'Datenschutz',
    'privacy.factorPrivacy':
      'Weshalb: Eine Nachricht enthält schnell Namen, Noten oder Gesundheitsangaben. Worauf achten: Bleibt es auf dem Gerät? Geht es ins Ausland? Ist es ein von der Schule geprüftes Tool?',
    'privacy.factorQualityTitle': 'Qualität',
    'privacy.factorQuality':
      'Was heisst das: Versteht die KI die Aufgabe, erfindet sie wenig dazu, gibt brauchbare Antworten? Die grossen Cloud-Modelle sind hier meist stärker als kleine, lokale.',
    'privacy.factorSetupTitle': 'Einfaches Setup',
    'privacy.factorSetup':
      'Fertig nutzbar (Login oder App, sofort startklar) oder selbst installieren (lokal — mehr Kontrolle, etwas Aufwand).',
    'privacy.rule':
      'Faustregel: Schützenswerte Daten → lokal oder ein geprüftes Schul-Tool. Harmlose, allgemeine Aufgaben → jede Cloud-KI ist ok.',
    'privacy.moreP1':
      'Wo läuft die KI? Auf deinem Gerät bleibt deine Eingabe bei dir (offline möglich, aber durch die Hardware begrenzt). In der Cloud bekommst du die stärksten Modelle, aber deine Eingabe geht an den Anbieter — oft auf Server im Ausland.',
    'privacy.moreP2':
      'Im Schulkontext ist die Schule die verantwortliche Stelle, der Anbieter nur Auftragsbearbeiter — dafür braucht es einen Vertrag. Für öffentliche Schulen gilt das kantonale Datenschutzrecht. Heikel ist vor allem das Training: Nutzt ein Anbieter deine Eingaben, um seine Modelle zu verbessern, ist das meist nicht erlaubt — Gratis-Dienste tun es oft, bezahlte und Edu-Angebote in der Regel nicht.',
    'privacy.moreP3':
      'Bei besonders schützenswerten Daten (Gesundheit, Förderbedarf) braucht es zudem eine Datenschutz-Folgenabschätzung und eine klare Rechtsgrundlage. Im Zweifel: so wenig Personenbezug wie möglich teilen — oft reicht die Aufgabe ohne echte Namen.',
    'privacy.sourceLabel': 'Quelle und Vertiefung:',

    // --- Werkzeugwahl ---
    'toolChoice.title': 'Welches KI-Werkzeug passt?',
    'toolChoice.subtitle':
      'Hardware, Kosten, Datenschutz — hier läuft alles zusammen. Beantworte drei Fragen und erhalte eine Empfehlung.',
    'toolChoice.caption':
      'Eine Orientierungshilfe, die die vorherigen Kapitel bündelt — keine allgemeingültige Vorschrift.',
    'toolChoice.moreP1':
      'Es gibt nicht das eine beste Werkzeug — es kommt auf deine Prioritäten an. Geht es um sensible Daten oder maximale Kontrolle, ist ein lokales Modell meist die Antwort. Zählt höchste Qualität und sind die Daten unkritisch, sind die grossen Cloud-Modelle stark.',
    'toolChoice.moreP2':
      'Dazwischen liegt der Wrapper: starke Cloud-Modelle, aber mit Anonymisierung und Servern in der Schweiz/EU — ein guter Kompromiss, wenn beides zählt. Und für den schnellen Alltag ohne heikle Daten genügt oft ein Abo.',
    'toolChoice.moreP3':
      'Die Faustregeln aus den letzten Kapiteln: lokal = privat, gratis, aber hardware-begrenzt; Cloud = stärkste Modelle, aber die Daten verlassen das Gerät und kosten pro Token; Wrapper = Mittelweg. Im Zweifel: so lokal und so anonym wie möglich.',
    'toolChoice.nextLabel': 'Zur Übersicht',

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
      'Die Wahrscheinlichkeiten kommen von einem Sprachmodell. Wähle einen Token, um den Satz Schritt für Schritt weiterzuschreiben — oder überlass die Wahl dem Zufall.',
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
      'Derselbe Tokenizer, den auch ChatGPT nutzt. Fahre über ein Token, um zu sehen, wie der Text zerschnitten wird.',
    'tokenization.emptyTitle':
      'Klicke auf „Text tokenisieren", um zu sehen, wie dein Text in Tokens zerfällt.',
    'tokenization.emptyBody':
      'Die Tokens müssen nicht mit Wörtern übereinstimmen — oft ist ein Wort aus mehreren Stücken zusammengesetzt.',
    'tokenization.multimodal':
      'Übrigens: Nicht nur Text wird zerlegt. Auch Bilder und Audio teilen moderne Modelle in Stücke, bevor sie sie verarbeiten — wie aus einer Bildfläche eine Reihe wird, zeigt die letzte Station „Bild & Ton".',
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
      'Tipp ein Wort ein — ein Embedding-Modell wandelt es live in einen Vektor, der bei Wörtern mit ähnlicher Bedeutung landet. Über die Legende lassen sich Kategorien aus- und einblenden. Die Karte ist eine 2D-Projektion eines 768-dimensionalen Raums; Nähe bleibt dabei grob erhalten.',
    'embeddings.moreP1':
      'Ein Embedding ist ein langer Zahlenvektor (hier 768 Zahlen). Das Besondere: Wörter mit ähnlicher Bedeutung haben ähnliche Vektoren. Man kann sich jedes Wort als Punkt in einem hochdimensionalen Raum vorstellen — „Hund" und „Katze" liegen nah beieinander, „Hund" und „Mathematik" weit auseinander. Genau diese Nähe drückt die Landkarte oben in zwei Dimensionen aus.',
    'embeddings.moreP2':
      'Wie ähnlich zwei Embeddings sind, misst die Cosinus-Ähnlichkeit: ein Wert zwischen -1 und 1 (in der Praxis meist 0 bis 1), wobei 1 für „nahezu gleiche Bedeutung" steht. Diese Vektoren lernt ein Modell aus riesigen Textmengen nach dem Prinzip: Wörter, die in ähnlichen Kontexten vorkommen, haben ähnliche Bedeutung.',
    'embeddings.moreP3':
      'Embeddings sind ein Grundbaustein vieler KI-Anwendungen: semantische Suche, Empfehlungssysteme, Übersetzung und vor allem RAG, wo passende Dokumente gefunden werden, um Antworten mit echtem Wissen zu unterfüttern.',
    'embeddings.nextLabel': 'Weiter: Next-Token-Prediction',

    // --- Daten / Pretraining ---
    'data.title': 'Wo kommen die Daten her?',
    'data.subtitle':
      'Ein Sprachmodell kennt nur, was in seinen Trainingsdaten steht. Diese Daten sind ein riesiger, ungeordneter Querschnitt des Webs – und genau die Auswahl daraus prägt, was das Modell kann.',
    'data.caption':
      'Echte Dokumente aus dem FineWeb-Datensatz (CommonCrawl-Webtexte, ins Deutsche übersetzt) – eine winzige Stichprobe von gut 950 aus 15 Billionen Tokens. Den Bildungswert hat ein KI-Bewerter vergeben; der echte Filter (FineWeb-Edu) behält nur Texte mit Score 3 oder höher.',
    'data.moreP1':
      'Pretraining-Daten sind kein Lehrbuch, sondern ein Schnappschuss dessen, was Menschen zufällig ins Netz geschrieben haben: Ratgeber neben Werbung, Fachartikel neben Geplauder. Niemand plant die Themen-Mischung – sie ist einfach das, was online steht. Genau darum ist der rohe Querschnitt so heterogen.',
    'data.moreP2':
      'Ungeplant heisst aber nicht ungefiltert: Aus dem rohen Web wird über 90 % wieder verworfen. Duplikate, Sprach-Müll und Boilerplate fliegen raus, und ein KI-Klassifikator bewertet den Bildungswert jedes Texts. Heute bewerten also KI-Systeme die Trainingsdaten der nächsten KI-Systeme. Welche Texte diesen Filter überleben, formt die Fähigkeiten, das Wissen und die blinden Flecken des Modells.',
    'data.moreP3':
      'Deshalb ist Datenauswahl ein zentraler Hebel beim Bau eines Modells – nicht nur die Menge zählt, sondern die Qualität und Zusammensetzung. An der Spitze gewichten Labs einzelne Quellen sogar bewusst (etwa mehr Code oder Bücher), um gezielt bestimmte Fähigkeiten zu stärken.',
    'data.nextLabel': 'Weiter: Training',

    // --- Training / Pretraining ---
    'training.title': 'Training',
    'training.subtitle':
      'Hier lernt ein winziges Sprachmodell direkt in deinem Browser — von Grund auf. Drück auf Start und sieh zu, wie aus Zufall Sprache wird.',
    'training.caption':
      'Oben rechnet ein echtes neuronales Netz mit ein paar tausend Parametern — live in deinem Browser. Es sagt jeweils das nächste Zeichen voraus und korrigiert bei jedem Schritt seinen Fehler, genau wie grosse Modelle, nur millionenfach kleiner.',
    'training.moreP1':
      'Training und Anwendung sind zwei getrennte Phasen. Beim Training stellt das Modell eine Vorhersage an, vergleicht sie mit dem echten nächsten Zeichen und dreht seine Stellschrauben (die Parameter) ein kleines Stück nach. Bei der Inferenz — wenn du mit einer KI sprichst — steht alles fest: Das Modell wendet nur noch an, was es gelernt hat.',
    'training.moreP2':
      'Der Hebel beim Lernen ist der Fehler (Loss): Er misst, wie schlecht das Modell das richtige nächste Zeichen vorhergesagt hat. Aus diesem Fehler lässt sich für jede einzelne Zahl im Modell ausrechnen, in welche Richtung sie ihn kleiner macht — und genau dorthin wird sie ein winziges Stück verschoben. Millionenfach wiederholt wird die Vorhersage immer treffsicherer: Die Verteilung wird spitz, die Textproben werden plausibel.',
    'training.moreP3':
      'Echte Modelle arbeiten nach demselben Prinzip, nur grösser: nicht einzelne Buchstaben, sondern Wortteile (Tokens); nicht ein paar hundert Wörter, sondern Billionen; nicht Sekunden im Browser, sondern Wochen auf tausenden Grafikkarten. Dieses Lernen von Grund auf heisst Pretraining. Wie ein Modell danach für konkrete Aufgaben verfeinert wird, zeigt die nächste Station.',
    'training.nextLabel': 'Weiter: Finetuning',

    // --- Finetuning ---
    'finetuning.title': 'Finetuning',
    'finetuning.subtitle':
      'Dasselbe Modell, zwei Verhaltensweisen: Stell eine Frage und sieh, wie aus einem reinen Text-Fortsetzer ein hilfreicher Assistent wird.',
    'finetuning.caption':
      'Links verhält sich das Sprachmodell wie direkt nach dem Pretraining und setzt deinen Text einfach fort; rechts läuft dasselbe Modell als finegetunter Assistent.',
    'finetuning.moreP1':
      'Das Pretraining macht aus dem Modell einen treffsicheren Text-Fortsetzer: Es enthält ein riesiges Wissen, ist aber nicht darauf ausgelegt, Fragen zu beantworten — es schreibt einfach weiter, was wahrscheinlich als Nächstes käme. Finetuning gibt diesem Wissen eine nützliche Form.',
    'finetuning.moreP2':
      'Beim Finetuning (auch Instruction-Tuning oder Supervised Fine-Tuning, kurz SFT, genannt) trainiert man das Modell mit Tausenden Beispielgesprächen aus Anfrage und idealer Antwort. Dabei lernt es ein festes Gesprächsformat — wer gerade spricht, Mensch oder Assistent — und die Gewohnheit, direkt zu antworten, sich an Anweisungen zu halten und aufzuhören, wenn die Antwort fertig ist.',
    'finetuning.moreP3':
      'Das Wissen selbst stammt fast vollständig aus dem Pretraining — Finetuning bringt vor allem das Verhalten bei. Darum genügen dafür vergleichsweise wenige, dafür sehr sorgfältig ausgewählte Beispiele. Wie man das Modell danach noch feiner an menschliche Vorlieben anpasst, zeigt die nächste Station: RLHF.',
    'finetuning.nextLabel': 'Weiter: RLHF',

    // --- RLHF ---
    'rlhf.title': 'RLHF: Lernen aus menschlichem Feedback',
    'rlhf.subtitle':
      'RLHF steht für Reinforcement Learning from Human Feedback: Eine KI lernt aus menschlichen Bewertungen, was eine gute Antwort ausmacht. Bring hier einem echten Belohnungsmodell mit ein paar Klicks deinen Geschmack bei — danach bewertet es neue Antworten von selbst, und du entdeckst, wo es sich austricksen lässt.',
    'rlhf.caption':
      'Oben trainiert aus deinen Vergleichen ein echtes Belohnungsmodell — dieselbe Bradley-Terry-Methode wie in echten RLHF-Systemen, nur mit ablesbaren Stil-Merkmalen statt eines riesigen Netzes. Lernen, Verallgemeinern und Austricksen passieren wirklich, live in deinem Browser.',
    'rlhf.moreP1':
      'Nach dem Finetuning antwortet das Modell wie ein Assistent — aber was eine gute Antwort ausmacht, lässt sich kaum als Regel aufschreiben. „Hilfreich, ehrlich, harmlos" ist schwer zu definieren, aber leicht zu vergleichen: Menschen können bei zwei Antworten sagen, welche besser ist, auch ohne die Regel dahinter zu kennen. Genau darauf baut RLHF.',
    'rlhf.moreP2':
      'Drei Schritte: Erst sammeln Menschen tausende solcher Vergleiche. Daraus lernt ein Belohnungsmodell, ihre Vorlieben vorherzusagen — als Punktzahl für jede beliebige Antwort. Schließlich wird das Sprachmodell mit Reinforcement Learning so optimiert, dass es Antworten erzeugt, die das Belohnungsmodell hoch bewertet. So nimmt es Werte auf, die niemand direkt programmieren könnte.',
    'rlhf.moreP3':
      'Der Haken: Das Belohnungsmodell ist nur ein Stellvertreter für echten menschlichen Geschmack — und das Sprachmodell optimiert hartnäckig auf diese eine Zahl. Findet es eine Antwort, die hoch bewertet wird, ohne wirklich zu helfen (lang, selbstsicher, schmeichelhaft), nimmt es sie. Das nennt man Reward Hacking. Echte Systeme halten mit Sicherungen dagegen — oder ersetzen die geratene Belohnung durch eine geprüfte: Bei Mathe und Code lässt sich „richtig" wirklich verifizieren. Diese Idee treibt moderne Reasoning-Modelle an.',
    'rlhf.nextLabel': 'Weiter: Chain-of-Thought',

    // --- Chain-of-Thought ---
    'cot.title': 'Chain-of-Thought: Schritt für Schritt zur Lösung',
    'cot.subtitle':
      'Chain-of-Thought (Gedankenkette) heißt: Das Modell schreibt seinen Lösungsweg aus, bevor es antwortet. Stell hier demselben Modell dieselbe Rechenaufgabe — einmal muss es sofort antworten, einmal darf es laut mitdenken — und sieh, wann das über falsch und richtig entscheidet.',
    'cot.caption':
      'Beide Spalten fragen dasselbe echte Modell (Gemini über Vertex AI). Der einzige Unterschied ist der Platz zum Mitdenken; ein winziger Prüfer rechnet jede Aufgabe nach und sagt, wer richtig liegt.',
    'cot.moreP1':
      'Mitdenken ist nichts Magisches: Das Modell sagt weiterhin nur das nächste Token voraus, Wort für Wort. Indem es Zwischenschritte ausschreibt, gibt es sich diese Schritte selbst als Kontext für das nächste Token. Jeder zusätzliche Token ist ein kleiner Rechenschritt mehr — der Lösungsweg ist der sichtbar gemachte Arbeitsspeicher des Modells.',
    'cot.moreP2':
      'Entdeckt wurde das als simpler Trick: Hängt man an eine Frage „Denke Schritt für Schritt", werden die Antworten messbar besser. Heutige Reasoning-Modelle haben dieses Mitdenken fest eingebaut — sie tun es von selbst und zeigen den Gedankengang oft nur verkürzt oder gar nicht.',
    'cot.moreP3':
      'Mitdenken hilft, ist aber keine Garantie — der Gedankengang selbst kann Fehler enthalten. Wie bringt man ein Modell dazu, zuverlässig richtig zu denken? Indem man genau die Lösungswege belohnt, die nachweislich stimmen. Wie das geht, zeigt die nächste Station: RLVR.',
    'cot.nextLabel': 'Weiter: RLVR',

    // --- RLVR ---
    'rlvr.title': 'RLVR: eine Belohnung, die man prüfen kann',
    'rlvr.subtitle':
      'RLVR steht für Reinforcement Learning with Verifiable Rewards: Statt zu raten, was eine gute Antwort ist, prüft ein Programm, ob sie stimmt. Lass hier ein echtes Modell mehrere Lösungswege ausdenken, einen Prüfer nachrechnen — und sieh, wie genau dieses Signal das Modell besser macht.',
    'rlvr.caption':
      'Oben denkt sich ein echtes Modell (Gemini über Vertex AI) die Lösungswege aus, ein winziges Stück Code prüft sie nach, und ein echtes Mini-Reinforcement-Learning verstärkt das Geprüfte — alles live in deinem Browser. Buchstabenzählen ist dabei der anschauliche Stellvertreter für Mathe oder Code.',
    'rlvr.moreP1':
      'Auf der RLHF-Seite war die Belohnung ein gelerntes Modell des menschlichen Geschmacks — und ließ sich austricksen: Eine selbstsichere, schmeichelnde, aber falsche Antwort konnte hoch punkten. RLVR ersetzt diese geratene Belohnung durch eine geprüfte: Bei Mathe wird nachgerechnet, bei Code laufen Tests, beim Buchstabenzählen zählt man eben nach. Eine solche Belohnung lässt sich nicht überreden.',
    'rlvr.moreP2':
      'Der Ablauf: Das Modell erzeugt viele Lösungswege (Chain-of-Thought), ein Prüfer entscheidet bei jedem nur „richtig" oder „falsch", und das Reinforcement Learning macht die richtigen Wege wahrscheinlicher. Es braucht keinen Menschen, der mitliest — nur eine Aufgabe mit überprüfbarer Antwort. Genau deshalb sind Reasoning-Modelle besonders bei Mathe, Logik und Programmieren stark: Dort ist „richtig" eindeutig prüfbar.',
    'rlvr.moreP3':
      'Dass das Modell Buchstaben schlecht zählt, ist kein Zufall — es sieht Text als Tokens, nicht als einzelne Buchstaben (siehe Tokenisierung). Der Prüfer sieht die Buchstaben sehr wohl und wird so zum Lehrer. Dieselbe Idee — viele Versuche, ein verlässlicher Check, verstärke das Geprüfte — steckt hinter der jüngsten Generation von Reasoning-Modellen.',
    'rlvr.nextLabel': 'Weiter: RAG',

    // --- RAG ---
    'rag.title': 'RAG: erst nachschlagen, dann antworten',
    'rag.subtitle':
      'RAG steht für Retrieval-Augmented Generation: Statt nur aus dem Gedächtnis zu antworten, schlägt ein Sprachmodell zuerst in einer Wissensquelle nach und stützt seine Antwort darauf. Gib hier einer KI eine kleine Wissensbasis, die sie nie gesehen hat, stell eine Frage — und sieh, wie sie die passenden Unterlagen heraussucht und daraus antwortet.',
    'rag.caption':
      'Oben sucht ein Embedding-Modell die ähnlichsten Unterlagen heraus; daraus formuliert ein Sprachmodell die Antwort.',
    'rag.moreP1':
      'Ein Sprachmodell weiss nur, was in seinen Trainingsdaten stand — bis zu einem Stichtag und ohne dein privates oder tagesaktuelles Wissen. RAG (Retrieval-Augmented Generation) schliesst diese Lücke: Statt das Modell neu zu trainieren, legt man ihm zur Frage die passenden Dokumente bei. So kann es über Wissen sprechen, das es nie gesehen hat — etwa ein internes Wiki, frische Nachrichten oder, wie hier, die Unterlagen einer erfundenen Schule.',
    'rag.moreP2':
      'Das Herz von RAG ist sein erster Buchstabe, das Retrieval — und es ist genau die Ähnlichkeitssuche der Embeddings-Seite: Die Frage wird in einen Vektor übersetzt und mit jedem Dokument verglichen. Die ähnlichsten wandern als Kontext vor die Frage (das ist das „Augmented"), und daraus formuliert das Modell seine Antwort (das „Generation"). Drei Schritte: suchen, anreichern, antworten.',
    'rag.moreP3':
      'Darum ist RAG nur so gut wie das, was die Suche findet. Fehlt das richtige Dokument oder liegt ein ähnlich klingendes, aber falsches zuoberst, erdet sich die Antwort auf der falschen Quelle. Ein gutes System sagt dann ehrlich, dass die Unterlagen nichts hergeben, statt zu raten — gute Quellen und eine gute Suche zählen also so viel wie das Modell selbst. Nimm oben ein Dokument aus der Wissensbasis und sieh, wie die Antwort kippt.',
    'rag.nextLabel': 'Weiter: Bild & Ton',

    'a11y.toggleTheme': 'Hell/Dunkel umschalten',
    'a11y.toggleSidebar': 'Navigation ein-/ausblenden',
    'a11y.toggleLanguage': 'Sprache wechseln',
    'a11y.toggleAccent': 'Akzentfarbe wählen',

    // === Viz-Komponenten ===
    // --- mini-training.tsx ---
    'miniTraining.trainingData': 'Lerndaten:',
    'miniTraining.speed': 'Tempo:',
    'miniTraining.speedSlow': 'Zeitlupe',
    'miniTraining.speedNormal': 'Normal',
    'miniTraining.speedTurbo': 'Turbo',
    'miniTraining.customLabel': 'Eigene',
    'miniTraining.customHint': 'Gib eigene Wörter ein (durch Leerzeichen getrennt) — das Modell lernt nur daraus. Probier Tiernamen, Städte oder Fantasiewörter.',
    'miniTraining.customApply': 'Übernehmen & neu starten',
    'miniTraining.customWords': 'Wörter',
    'miniTraining.pause': 'Pause',
    'miniTraining.train': 'Trainieren',
    'miniTraining.continue': 'Weiter',
    'miniTraining.resetLabel': 'Zurücksetzen',
    'miniTraining.statusRunning': 'Lernt … es dreht bei jedem Schritt an seinen Stellschrauben.',
    'miniTraining.statusPaused': 'Pausiert — du kannst weitertrainieren.',
    'miniTraining.statusIdle': 'Noch untrainiert: reiner Zufall. Drück „Trainieren" oder „+500".',
    'miniTraining.stepLabel': 'Schritt',
    'miniTraining.samplesTitle': 'Was das Modell gerade schreibt',
    'miniTraining.showData': 'Lerndaten ansehen',
    'miniTraining.hideData': 'Lerndaten ausblenden',
    'miniTraining.resample': 'Neu würfeln',
    'miniTraining.temperature': 'Temperatur',
    'miniTraining.tempLow': 'brav: meist häufige Wörter',
    'miniTraining.tempHigh': 'wild: auch seltene Buchstaben',
    'miniTraining.tempMid': 'ausgewogen',
    'miniTraining.samplesNote': 'Frisch aus dem Modell gezogen — Zeichen für Zeichen.',
    'miniTraining.samplesNovel': 'Blau',
    'miniTraining.samplesNovelDesc': '= nicht in den Lerndaten, also selbst zusammengesetzt.',
    'miniTraining.samplesInit': 'Anfangs Kauderwelsch, dann tauchen echte Wörter auf.',
    'miniTraining.dataLabel': 'Das Modell hat nur diese',
    'miniTraining.dataLabelSuffix': 'gesehen:',
    'miniTraining.lossTitle': 'Fehler (Loss)',
    'miniTraining.lossNote': 'Der Fehler misst, wie schlecht das nächste Zeichen vorhergesagt wird. Beim blossen Raten läge er bei',
    'miniTraining.lossNoteSuffix': 'und sinkt, während das Modell lernt.',
    'miniTraining.distTitle': 'Vorhersage fürs nächste Zeichen',
    'miniTraining.distWordStart': 'Wortanfang',
    'miniTraining.distAfter': 'nach',
    'miniTraining.distNote': 'Dieselbe Idee wie auf der Next-Token-Seite — nur fürs nächste Zeichen. Anfangs flach (alles gleich wahrscheinlich), nach dem Training spitz.',
    'miniTraining.moreTitle': 'Mehr Einblicke',
    'miniTraining.moreSuffix': '— für Interessierte',
    'miniTraining.embTitle': 'Die Embeddings der Buchstaben',
    'miniTraining.embNote': 'Jeder Buchstabe bekommt eine eigene Zahlenliste — hier in 2D. Während des Trainings ordnen sie sich; Vokale wandern oft zusammen. Genau das sind Embeddings, eine Station vorher.',
    'miniTraining.exTitle': 'Ein Trainingsbeispiel',
    'miniTraining.exNote': 'So lernt das Modell: aus',
    'miniTraining.exNoteMid': 'soll',
    'miniTraining.exNoteSuffix': 'werden. Es vergleicht seine Vorhersage mit der Wahrheit und rückt die Wahrscheinlichkeit Schritt für Schritt höher.',
    'miniTraining.exGuesses': 'tippt auf',
    'miniTraining.exProbLabel': 'Wahrscheinlichkeit für',
    'miniTraining.charEndLabel': 'Ende',
    'miniTraining.svgLossCurve': 'Lernkurve',
    'miniTraining.svgEmbMap': 'Zeichen-Embeddings',

    // --- finetuning-comparison.tsx ---
    'finetuningComp.placeholder': 'Stell eine Frage oder gib eine Anweisung …',
    'finetuningComp.askBoth': 'Beide fragen',
    'finetuningComp.baseTitle': 'Basismodell',
    'finetuningComp.baseTag': 'nur Pretraining',
    'finetuningComp.assistantTitle': 'Assistent',
    'finetuningComp.assistantTag': 'nach Finetuning',
    'finetuningComp.loading': 'Modell schreibt …',
    'finetuningComp.retry': 'Erneut versuchen',
    'finetuningComp.idle': 'Stell eine Frage, um den Unterschied zu sehen.',
    'finetuningComp.baseNote': 'Es setzt deinen Text einfach fort, statt zu antworten, und stoppt nicht von selbst — hier brechen wir nach rund 100 Tokens ab.',
    'finetuningComp.assistantNote': 'Es erkennt die Anfrage, antwortet direkt und strukturiert — und hört von selbst auf, wenn die Antwort fertig ist.',
    'finetuningComp.noOutput': 'Keine Ausgabe — bitte nochmal versuchen.',
    'finetuningComp.userLabel': 'Du:',

    // --- cot-comparison.tsx ---
    'cotComp.placeholder': 'Eine Rechenaufgabe …',
    'cotComp.askBoth': 'Beide Modi',
    'cotComp.directTitle': 'Sofort antworten',
    'cotComp.directTag': 'ohne Rechenweg',
    'cotComp.cotTitle': 'Schritt für Schritt',
    'cotComp.cotTag': 'mit Rechenweg',
    'cotComp.loading': 'Modell rechnet …',
    'cotComp.retry': 'Erneut versuchen',
    'cotComp.resultLabel': 'Ergebnis',
    'cotComp.correct': 'richtig',
    'cotComp.wrong': 'falsch',
    'cotComp.directNote': 'Eine Antwort in einem Zug — ohne Notizblock. Bei mehreren Rechenschritten geht dabei leicht etwas verloren.',
    'cotComp.cotNote': 'Das Modell schreibt Zwischenschritte aus — und liest sie beim Weiterschreiben wieder mit. Dasselbe Modell, nur mit Platz zum Mitdenken.',
    'cotComp.freeTaskHint': 'Für freie Aufgaben ohne eindeutiges Rechenergebnis zeigen wir beide Antworten ohne ✓/✗-Urteil.',
    'cotComp.noOutput': 'Keine Ausgabe — bitte nochmal.',

    // --- rlhf-lab.tsx ---
    'rlhfLab.stageLabel': 'Bewerten',
    'rlhfLab.stageTrain': 'Lernen',
    'rlhfLab.stageGeneralize': 'Bewähren',
    'rlhfLab.stageHack': 'Überlisten',
    'rlhfLab.labelHeading': 'Welche Antwort ist besser?',
    'rlhfLab.labelCompare': 'Vergleich',
    'rlhfLab.labelOf': 'von',
    'rlhfLab.labelQuestion': 'Frage',
    'rlhfLab.labelChooseThis': 'Diese ist besser',
    'rlhfLab.labelHint': 'Lies beide und wähle die hilfreichere. Du urteilst über die ganze Antwort — das Belohnungsmodell wird gleich nur ein paar oberflächliche Merkmale davon zu sehen bekommen.',
    'rlhfLab.trainDone': 'Fertig. Das ist die Faustregel, die das Modell aus deinen Klicks gezogen hat — und es sah dabei nur diese fünf Stil-Merkmale, nicht den eigentlichen Inhalt.',
    'rlhfLab.trainRunning': 'Aus deinen Vergleichen lernt das Belohnungsmodell …',
    'rlhfLab.trainNext': 'Bewährt es sich?',
    'rlhfLab.lossTitle': 'Fehler',
    'rlhfLab.lossFalling': 'sinkt …',
    'rlhfLab.lossLearning': 'Das Modell sagt deine Klicks immer besser vorher.',
    'rlhfLab.weightTitle': 'Was dein Belohnungsmodell mag',
    'rlhfLab.weightNote': 'Jeder Balken ist ein gelernter Geschmack: nach rechts = belohnt, nach links = abgewertet. Das hat niemand einprogrammiert — es kommt allein aus deinen Vergleichen.',
    'rlhfLab.genHeading': 'Neue Antworten, die das Modell nie gesehen hat',
    'rlhfLab.genHint': 'Wähl wieder die bessere — dann zeigt sich, ob dein Belohnungsmodell genauso entscheidet.',
    'rlhfLab.genYourChoice': 'deine Wahl',
    'rlhfLab.genAgree': 'Mal trifft das Modell deine Wahl — aus nur',
    'rlhfLab.genAgreeSuffix': 'Klicks. Genau das macht RLHF praktikabel: ein paar tausend Vergleiche, und das Modell kann Millionen Antworten bewerten, ohne dass ein Mensch mitliest.',
    'rlhfLab.genNext': 'Wo es kippt',
    'rlhfLab.hackHeading': 'Jetzt dreht sich der Spieß um',
    'rlhfLab.hackIntro': 'Beim eigentlichen RLHF schreibt das Sprachmodell die Antworten — und wird darauf trainiert, möglichst hohe Belohnung zu kassieren. Hier sind viele mögliche Antworten auf dieselbe Frage. Jeder Punkt ist eine davon.',
    'rlhfLab.hackQuestion': 'Frage',
    'rlhfLab.hackChoose': 'Das Sprachmodell die höchste Belohnung wählen lassen',
    'rlhfLab.hackPickLabel': 'Die gewählte Antwort (höchste Belohnung)',
    'rlhfLab.hackPickNote': 'Stilistisch ein Volltreffer — aber die Hauptstadt ist',
    'rlhfLab.hackPickNoteSuffix': '. Das Belohnungsmodell sieht nur den Stil, nicht die Wahrheit, also fällt es darauf herein. Das nennt man Reward Hacking: Das Modell maximiert die Belohnung, statt wirklich zu helfen.',
    'rlhfLab.hackBetter': 'Hilfreicher wäre',
    'rlhfLab.hackBetterSuffix': 'gewesen — oben in der Grafik, aber nicht ganz rechts. Deshalb braucht echtes RLHF Sicherungen: die Vorlieben laufend nachschärfen, das Modell nicht zu weit vom Original wegdriften lassen — oder die Belohnung gar nicht raten, sondern prüfen. Bei Mathe oder Code lässt sich „richtig" echt verifizieren. Das treibt heutige Reasoning-Modelle an: die nächste Station.',
    'rlhfLab.hackReset': 'Nochmal mit neuem Geschmack',
    'rlhfLab.scatterAxisX': 'Belohnung →',
    'rlhfLab.scatterAxisY': '↑ wie hilfreich (versteckt)',
    'rlhfLab.scatterChosen': 'gewählt',
    'rlhfLab.legendHelpful': 'wirklich hilfreich & richtig',
    'rlhfLab.legendWeak': 'schwach oder falsch',
    'rlhfLab.legendChosen': 'die Wahl des Modells',
    'rlhfLab.svgLabel': 'Belohnung gegen tatsächliche Hilfe',
    'rlhfLab.svgLoss': 'Lernkurve',

    // --- rlvr-lab.tsx ---
    'rlvrLab.stageGenerate': 'Generieren',
    'rlvrLab.stageVerify': 'Prüfen',
    'rlvrLab.stageReinforce': 'Verstärken',
    'rlvrLab.taskLabel': 'Aufgabe',
    'rlvrLab.generateHint': 'Lass das Modell dieselbe Frage mehrmals aus dem Stegreif schätzen. Weil es Buchstaben aus Tokens heraus schätzen muss, kommen unterschiedliche Antworten heraus — der perfekte Stoff, um einen Prüfer darauf loszulassen.',
    'rlvrLab.generateBtn': 'schnelle Versuche',
    'rlvrLab.attemptLabel': 'Versuch',
    'rlvrLab.attemptFailed': 'Versuch fehlgeschlagen.',
    'rlvrLab.contradicting': 'Die Versuche widersprechen sich. Wer hat recht? Frag nicht das Modell — frag den Prüfer.',
    'rlvrLab.thinking': 'Das Modell denkt nach …',
    'rlvrLab.checkBtn': 'Vom Prüfer checken lassen',
    'rlvrLab.verifierTitle': 'Der Prüfer rechnet nach',
    'rlvrLab.verifierNote': 'Ein Stück Code zählt die',
    'rlvrLab.verifierNoteMid': 'direkt im Wort:',
    'rlvrLab.verifierNoteSuffix': '. Keine Schätzung, keine Meinung — das ist die Wahrheit, gegen die jeder Versuch geprüft wird.',
    'rlvrLab.verifyHasCorrect': 'bekommen Belohnung 1, der Rest 0. Manche falschen Versuche klingen genauso überzeugend wie die richtigen — den Prüfer beirrt das nicht.',
    'rlvrLab.verifyNoCorrect': 'Diesmal lag kein Versuch richtig — alle bekommen 0. Verstärken kann nur, was vorkommt; hier bräuchte das Modell mehr oder bessere Versuche. Probier ein anderes Wort.',
    'rlvrLab.verifyOf': 'von',
    'rlvrLab.verifyVersuche': 'Versuchen',
    'rlvrLab.learnBtn': 'Daraus lernen',
    'rlvrLab.rewardLabel': 'Belohnung:',
    'rlvrLab.schemeVerifier': 'Prüfer',
    'rlvrLab.schemeImpression': 'Eindruck',
    'rlvrLab.schemeVerifierHint': 'belohnt, was geprüft stimmt',
    'rlvrLab.schemeImpressionHint': 'belohnt, was am häufigsten/überzeugendsten klingt',
    'rlvrLab.classTitle': 'Wofür sich das Modell entscheidet',
    'rlvrLab.accuracyTitle': 'Chance auf richtig',
    'rlvrLab.bannerVerifier': 'Der Prüfer zieht das Modell zur geprüften Antwort',
    'rlvrLab.bannerVerifierSuffix': '. Nach dem Training wählt es fast immer richtig — und zwar, weil die Belohnung die Wahrheit war, nicht ihr Anschein. Genau das treibt heutige Reasoning-Modelle bei Mathe und Code an.',
    'rlvrLab.bannerImpLucky': 'Diesmal war die häufigste Antwort zufällig richtig. Verlass dich nicht darauf: Die Eindrucks-Belohnung prüft nie nach — sie belohnt nur, was überzeugend klingt. Schalt auf Prüfer oder nimm ein anderes Wort, und der Unterschied wird sichtbar.',
    'rlvrLab.bannerImpHack': 'Mit der Eindrucks-Belohnung sackt das Modell auf',
    'rlvrLab.bannerImpHackMid': 'ab — die Antwort, die am häufigsten und selbstsichersten kam, vom Prüfer aber als falsch entlarvt. So wird eine geratene Belohnung ausgetrickst (Reward Hacking, wie beim Belohnungsmodell der RLHF-Seite). Der Prüfer lässt sich nicht täuschen — das ist der ganze Trick von RLVR.',
    'rlvrLab.newAttempts': 'Neue Versuche',
    'rlvrLab.svgAccuracy': 'Trefferkurve',

    // --- rag-explorer.tsx ---
    'ragExplorer.placeholder': 'Frag etwas über die Schule …',
    'ragExplorer.ask': 'Fragen',
    'ragExplorer.retrievalTitle': '1. Abrufen — die ähnlichsten Unterlagen',
    'ragExplorer.knowledgeBase': 'Wissensbasis: die Lindenhof-Schule',
    'ragExplorer.active': 'aktiv',
    'ragExplorer.of': 'von',
    'ragExplorer.retrievalHintBefore': 'Eine kleine Sammlung erfundener Dokumente, die das Modell nie gesehen hat. Stell eine Frage — die Suche bettet sie ein und sortiert nach Ähnlichkeit.',
    'ragExplorer.retrievalHintAfter': 'Deine Frage wird zum Vektor — die',
    'ragExplorer.retrievalHintAfterSuffix': 'ähnlichsten Unterlagen (Balken = Cosinus-Ähnlichkeit) wandern in den Kontext.',
    'ragExplorer.inContext': 'im Kontext',
    'ragExplorer.toggleInclude': 'Wieder in die Wissensbasis aufnehmen',
    'ragExplorer.toggleExclude': 'Aus der Wissensbasis nehmen',
    'ragExplorer.stale': 'Wissensbasis geändert — klick „Fragen", um die Antwort neu zu erden.',
    'ragExplorer.answerTitle': '2. Antworten — dieselbe Frage, einmal ohne und einmal mit diesen Unterlagen',
    'ragExplorer.withoutTitle': 'Ohne Kontext',
    'ragExplorer.withoutTag': 'nur Modellwissen',
    'ragExplorer.withTitle': 'Mit Kontext (RAG)',
    'ragExplorer.withTag': 'Modell + Unterlagen',
    'ragExplorer.loading': 'Modell antwortet …',
    'ragExplorer.retry': 'Erneut versuchen',
    'ragExplorer.idle': 'Stell eine Frage, um den Unterschied zu sehen.',
    'ragExplorer.withoutFooter': 'Nur die Frage geht ans Modell. Was nicht im Training stand — wie diese erfundene Schule — kann es nicht wissen.',
    'ragExplorer.withFooter': 'Geerdet auf:',
    'ragExplorer.withFooterNote': 'Steht die Antwort nicht in den Unterlagen, sagt das Modell es offen.',
    'ragExplorer.withFooterEmpty': 'Die abgerufenen Unterlagen werden vor die Frage gestellt.',
    'ragExplorer.noOutput': 'Keine Ausgabe — bitte nochmal versuchen.',

    // --- embeddings-map.tsx ---
    'embMap.inputPlaceholder': 'Wort eingeben – z. B. Tiger, Vulkan, Glück …',
    'embMap.embedBtn': 'Auf die Karte',
    'embMap.embeddingBtn': 'Bette ein …',
    'embMap.examplesLabel': 'Beispiele:',
    'embMap.resetMap': 'Karte zurücksetzen',
    'embMap.yourWord': 'dein Wort',
    'embMap.neighborsOf': 'Nächste Nachbarn von',
    'embMap.noSelection': 'Tipp ein Wort ein oder klick einen Punkt – dann erscheinen hier die nächsten Nachbarn mit ihrer Ähnlichkeit.',
    'embMap.catTiere': 'Tiere',
    'embMap.catEssen': 'Lebensmittel',
    'embMap.catOrte': 'Länder & Städte',
    'embMap.catGefuehle': 'Gefühle',
    'embMap.catBerufe': 'Berufe',
    'embMap.catSport': 'Sport',
    'embMap.catMusik': 'Musik',
    'embMap.catFahrzeuge': 'Fahrzeuge',

    // --- data-explorer.tsx ---
    'dataExplorer.viewRaw': 'Roh',
    'dataExplorer.viewMine': 'Deine Auswahl',
    'dataExplorer.viewCurated': 'Musterlösung',
    'dataExplorer.randomDoc': 'Zufälliges Dokument',
    'dataExplorer.reset': 'Zurücksetzen',
    'dataExplorer.captionRaw': 'Ein roher Querschnitt aus dem Web. Klick einen Punkt und lies, was wirklich drinsteht – Banales neben Wertvollem, kein Lehrplan.',
    'dataExplorer.captionMineEmpty': 'Öffne ein Dokument und entscheide „Behalten" oder „Raus". Was du behältst, bildet hier deinen eigenen Datensatz.',
    'dataExplorer.captionMineCount': 'Dein Datensatz:',
    'dataExplorer.captionMineCountSuffix': 'Dokumenten behalten.',
    'dataExplorer.captionCurated': 'Was der echte Qualitätsfilter behält: nur Texte mit hohem Bildungswert –',
    'dataExplorer.captionCuratedSuffix': '(≈ 6 %). Den Rest wirft die Pipeline weg.',
    'dataExplorer.svgLabel': 'Karte von Trainingsdaten-Dokumenten, nach Thema gefärbt',
    'dataExplorer.docEmpty': 'Klick einen Punkt auf der Karte – dann erscheint hier ein echtes Dokument aus den Trainingsdaten.',
    'dataExplorer.docDecide': 'Ins Training?',
    'dataExplorer.docKeep': '✓ Behalten',
    'dataExplorer.docDiscard': '✗ Raus',
    'dataExplorer.docEduScore': 'Bildungswert (KI-Bewerter):',
    'dataExplorer.docFilterKeeps': 'Der echte Filter behält diesen Text.',
    'dataExplorer.docFilterDiscards': 'Der echte Filter sortiert diesen Text aus.',
    'dataExplorer.docAgree': 'Ihr seid euch einig.',
    'dataExplorer.docDisagree': 'Der Filter entscheidet anders als du.',
    'dataExplorer.von': 'von',

    // --- next-token-prediction.tsx ---
    'nextTokenPred.currentText': 'Aktueller Text:',
    'nextTokenPred.tokenChain': 'Token-Kette:',
    'nextTokenPred.reset': 'Zurücksetzen',
    'nextTokenPred.computing': 'Berechne Wahrscheinlichkeiten für den nächsten Token...',
    'nextTokenPred.errorTitle': 'Fehler bei der Token-Vorhersage:',
    'nextTokenPred.retry': 'Erneut versuchen',
    'nextTokenPred.hint': 'Hinweis:',
    'nextTokenPred.temperature': 'Temperatur',
    'nextTokenPred.tempLow': 'Niedrig: fast immer das wahrscheinlichste Token – verlässlich, aber vorhersehbar.',
    'nextTokenPred.tempHigh': 'Hoch: die Verteilung wird flach – auch unwahrscheinlichere Tokens kommen zum Zug.',
    'nextTokenPred.tempMid': 'Mittel: nahe an dem, was das Modell wirklich rechnet (1.0).',
    'nextTokenPred.topProbs': 'Top Wahrscheinlichkeiten für den nächsten Token',
    'nextTokenPred.randomToken': 'Zufälliger Token',
    'nextTokenPred.longTailNote': 'Der Rest verteilt sich auf tausende weitere, jeweils sehr unwahrscheinliche Tokens.',
    'nextTokenPred.selectedToken': 'Ausgewählter nächster Token:',
    'nextTokenPred.addToText': 'Füge Token zum Text hinzu',
    'nextTokenPred.noTokens': 'Keine Token-Vorhersagen vom Modell erhalten.',
    'nextTokenPred.useSimulation': 'Simulation verwenden',
    'nextTokenPred.simMode': 'Simulationsmodus aktiv - keine echte API verwendet',
    'nextTokenPred.apiFailed': 'API-Anfrage fehlgeschlagen:',

    // --- multimodal-sequence.tsx ---
    'multimodalSeq.sceneLabel': 'Kacheln:',
    'multimodalSeq.drawing': 'Szene wird gezeichnet …',
    'multimodalSeq.step1Title': 'Eine Fläche',
    'multimodalSeq.step1Hint': 'Ein Bild ist ein Rechteck aus Pixeln — kein Anfang, kein Ende. Wir zerlegen es in gleich grosse Kacheln.',
    'multimodalSeq.step2Title': 'Eine Reihe',
    'multimodalSeq.step2Hint': 'Die Kacheln werden Zeile für Zeile zu einer einzigen Reihe ausgerollt: aus der Fläche wird eine Linie. Jede Kachel wird dabei zu einer Liste von Zahlen.',
    'multimodalSeq.step3Title': 'Ein Strom',
    'multimodalSeq.step3Hint': 'Diese Bild-Kacheln stehen nun im selben Strom wie die Wort-Tokens. Das Modell liest die ganze Reihe — und sagt das nächste Stück voraus, genau wie bei reinem Text.',
    'multimodalSeq.tileAria': 'Kachel',
    'multimodalSeq.tileInspectHint': 'Kacheln, zu einer Reihe ausgerollt — jede ist jetzt eine kurze Liste von Zahlen. Tipp: Klick eine Kachel an, um ihre Zahlen zu sehen.',
    'multimodalSeq.tileNumbers': 'Diese eine Kachel als drei Zahlen:',
    'multimodalSeq.back': 'Zurück',
    'multimodalSeq.unroll': 'Ausrollen',
    'multimodalSeq.next': 'Weiter',
    'multimodalSeq.restart': 'Von vorn',
    'multimodalSeq.moreTitle': 'Mehr Einblicke',
    'multimodalSeq.moreSuffix': '— für Interessierte',
    'multimodalSeq.moreP1': 'Die drei Balken je Kachel zeigen, wie viel Rot, Grün und Blau sie enthält — zusammen ergeben sie ihre Durchschnittsfarbe. Klick im Schritt „Eine Reihe" eine Kachel an: Eine Sonnen-Kachel hat viel Rot und Grün, eine Himmel-Kachel viel Blau.',
    'multimodalSeq.moreP2': 'Ein echtes Modell rechnet pro Kachel nicht drei, sondern hunderte solcher Zahlen — und die lassen sich einzeln nicht mehr deuten. Gemeinsam legen sie die Kachel als Punkt in denselben Bedeutungsraum, in dem auch die Wörter liegen. Genau das ist die Idee der Embeddings-Station, nur diesmal für ein Stück Bild.',
    'multimodalSeq.streamLabel': 'Eingabe-Strom:',
    'multimodalSeq.nextPiece': 'nächstes Stück?',
    'multimodalSeq.streamNote': 'Für das Modell ist das eine einzige Reihe von Stücken — Bild-Kacheln und Wort-Tokens gemischt. Es behandelt beide gleich und setzt die Reihe fort. So „sieht" ein Sprachmodell: nicht mit einem zweiten Sinn, sondern mit demselben Mechanismus, nur mit anderem Futter.',
    'multimodalSeq.sceneSunset': 'Sonnenuntergang',
    'multimodalSeq.sceneMeadow': 'Wiese',
    'multimodalSeq.sceneSea': 'Meer',
    'multimodalSeq.gridCoarse': 'grob',
    'multimodalSeq.gridMedium': 'mittel',
    'multimodalSeq.gridFine': 'fein',
    'multimodalSeq.axisRed': 'Rot',
    'multimodalSeq.axisGreen': 'Grün',
    'multimodalSeq.axisBlue': 'Blau',

    // --- message-check.tsx ---
    'msgCheck.placeholder': 'Tippe eine Anfrage, wie du sie einer KI stellen würdest …',
    'msgCheck.examplesLabel': 'Beispiele:',
    'msgCheck.checkBtn': 'Nachricht prüfen',
    'msgCheck.checking': 'Prüfe …',
    'msgCheck.fallback': 'Beispiel-Daten – das Modell ist gerade nicht erreichbar. Markierung aus einer einfachen Mustererkennung.',
    'msgCheck.foundSingular': 'schützenswerte Angabe gefunden',
    'msgCheck.foundPlural': 'schützenswerte Angaben gefunden',
    'msgCheck.detected': 'Erkannt:',
    'msgCheck.detectedSuffix': 'Schickst du diese Nachricht an eine Cloud-KI, sieht der Anbieter genau das — oft auf Servern im Ausland. Solche Angaben gehören dort nicht unbedacht hin.',
    'msgCheck.showAnon': 'So könntest du sie selbst entschärfen →',
    'msgCheck.hideAnon': 'Entschärfte Fassung verbergen',
    'msgCheck.anonNote': 'Ohne echte Namen und Angaben bekommst du oft eine genauso gute Antwort — und teilst nichts Schützenswertes. (Das musst du selbst tun; es passiert nicht automatisch.)',
    'msgCheck.okTitle': 'Nichts offensichtlich Schützenswertes.',
    'msgCheck.okNote': 'Eine allgemeine Frage ohne Personenbezug — hier ist eine Cloud-KI unbedenklich.',
    'msgCheck.catName': 'Name',
    'msgCheck.catOrt': 'Ort',
    'msgCheck.catDatum': 'Datum',
    'msgCheck.catKontakt': 'Kontakt',
    'msgCheck.catGesundheit': 'Gesundheit',
    'msgCheck.catNoten': 'Note',
    'msgCheck.catPersoenlich': 'Persönliches',
    'msgCheck.catAndere': 'Sonstiges',

    // === Pages ===
    // --- resources/page.tsx ---
    'resources.title': 'Ressourcen & Hintergrund',
    'resources.subtitle': 'Weiterführende Erklärungen – und wie diese Seite entstanden ist.',
    'resources.aboutTitle': 'Über diese Webseite',
    'resources.aboutP1': 'Diese Seite ist ein Freizeitprojekt mit einem einfachen Ziel: komplexe KI-Themen so aufzubereiten, dass man sie ausprobieren kann, statt nur darüber zu lesen – besonders für Lehrpersonen und Menschen aus dem Schulfeld, die eine einfache, ehrliche Vorstellung davon suchen, wie KI funktioniert.',
    'resources.aboutP2': 'Sie startete im März 2025 als Experiment mit dem damals neuen Claude Code von Anthropic und wurde danach mit verschiedenen KI-Assistenten weiterentwickelt (u.&nbsp;a. Gemini&nbsp;2.5&nbsp;Pro). Das aktuelle, grosse Redesign (Juni&nbsp;2026) entstand wieder mit Claude Code – in rund einem Tag. Eine Zeitleiste steht weiter unten unter Update-Geschichte.',
    'resources.vibeTitle': 'Ein Wort zur Entstehung: „Vibe Coding"',
    'resources.vibeP1': 'Der Begriff wurde 2025 zum Collins-Wort des Jahres – und ist inzwischen fast ein Schimpfwort. Fachleute, die LLM-Agenten ernsthaft einsetzen, sprechen lieber von „AI-Assisted Engineering": Sie lesen, testen und verstehen den generierten Code, statt ihn blind zu übernehmen (Karpathy selbst nannte „Vibe Coding" 2026 bereits „passé"). Für mich ist das vor allem Semantik.',
    'resources.vibeP2': 'Für eine Frontend-Designerin ist eine so entstandene Seite vielleicht „AI-Slop". Aber für jemanden aus dem Schulfeld, der einfach verstehen möchte, wie KI funktioniert, bietet sie Hands-On-Übungen, die ohne solche Werkzeuge schlicht nicht existieren würden. Genau darin liegt der Wert: nicht in perfektem Code, sondern darin, dass Erklärungen plötzlich anfassbar werden.',
    'resources.sourceLabel': 'Der Quellcode steht offen auf GitHub:',
    'resources.impressumLink': 'Impressum',
    'resources.karpathyTitle': 'Andrej Karpathy: LLMs erklärt',
    'resources.karpathyIntro': 'Diese Webseite kratzt nur an der Oberfläche der beiden sehenswerten Videos von Andrej Karpathy, einem führenden KI-Forscher. Sie gehen technisch deutlich tiefer.',
    'resources.video1Caption': 'Rund drei Stunden, die zu jeder Erklärung hier viel weiter ins technische Detail gehen.',
    'resources.video2Caption': '„How I use LLMs": viel über die Nützlichkeit und Funktionsweise – etwa, wie präsent Halluzinationen selbst in teuren Tools noch sind.',
    'resources.furtherTitle': 'Weitere Lernressourcen',
    'resources.furtherIntro': 'Frei zugängliche, visuelle Erklärungen – gut geeignet, um nach den Übungen hier weiterzugehen.',
    'resources.dataSourceTitle': 'Datenquellen & Inspiration',
    'resources.dataSourceP': 'Die Seite Daten wurde durch das zweite Karpathy-Video inspiriert. Die Dokumente für die Visualisierung stammen aus dem öffentlichen HuggingFace-FineWeb-Datensatz. Die deutsche Übersetzung der FineWeb-Texte entstand kostenlos per API mit Googles kleinem Modell „gemini-2.0-flash-lite".',
    'resources.legalTitle': 'Rechtliche Grundlagen (Schweiz)',
    'resources.legalSource': 'Rechtliche Auslegeordnung zur Entwicklung und Nutzung von KI im Bildungsraum Schweiz',
    'resources.legalAuthors': 'Thouvenin/Volz',
    'resources.legalYear': '2024 – eine zentrale Quelle für die Datenschutz-Seite.',
    'resources.authorTitle': 'Über den Autor',
    'resources.authorP': 'Ich arbeite an der PH Zug als Dozent für die Fachdidaktik Medienbildung und Informatik. Meine Schwerpunkte sind Künstliche Intelligenz in der Lehrpersonenbildung und Digitalisierung im Unterricht. Vieles im Bereich Webentwicklung ist über die Jahre und vor allem durch die Zusammenarbeit mit KI-Tools entstanden.',
    'resources.historyTitle': 'Update-Geschichte',
    'resources.history1Date': 'März 2025',
    'resources.history1Title': 'Erste Version',
    'resources.history1Body': 'Experiment mit dem damals neuen Claude Code. Die ersten interaktiven Erklärungen entstehen – das Ziel ist von Anfang an „ausprobieren statt nur lesen".',
    'resources.history2Date': '2025',
    'resources.history2Title': 'Weiterentwicklung',
    'resources.history2Body': 'Ausbau mit verschiedenen KI-Assistenten (u. a. Gemini 2.5 Pro). Weitere Themen und Visualisierungen kommen dazu.',
    'resources.history3Date': 'Juni 2026',
    'resources.history3Title': 'Grosses Redesign (mit Claude Code)',
    'resources.history3Body': 'Durchgehend echte Modell-Experimente statt vorgefertigter Skripte: ein winziges Sprachmodell, das live im Browser trainiert; ein selbst trainiertes Belohnungsmodell (RLHF); eine echte Retrieval-Pipeline (RAG); Chain-of-Thought und RLVR mit echtem Prüfer; eine Bedeutungs-Landkarte für Embeddings; die Tokenisierung von Bildern. Dazu Dark-Mode, wählbare Akzentfarben und eine zweisprachige Grundlage.',
    'resources.backBtn': 'Zurück zur Einführung',

    // --- impressum/page.tsx ---
    'impressum.title': 'Impressum & Datennutzung',
    'impressum.subtitle': 'Wer diese Seite betreibt – und welche Daten dabei geteilt werden.',
    'impressum.responsible': 'Verantwortlich',
    'impressum.responsibleName': 'Thomas Zurfluh',
    'impressum.responsibleRole': 'Dozent für Fachdidaktik Medienbildung und Informatik, PH Zug.',
    'impressum.responsibleContact': 'Kontakt über das',
    'impressum.responsibleContactLink': 'PH-Zug-Profil',
    'impressum.responsibleOr': 'oder',
    'impressum.privateNote': 'Dies ist ein privates Freizeitprojekt und kein offizielles Angebot der PH Zug.',
    'impressum.dataTitle': 'Welche Daten werden geteilt?',
    'impressum.dataIntro': 'Diese Seite kommt ohne Konto, ohne Werbung und ohne Tracking aus. Trotzdem lohnt sich ein Blick darauf, was im Hintergrund passiert, sobald du eine der interaktiven Übungen startest – denn genau das ist auch die Lektion der Datenschutz-Seite.',
    'impressum.dataCloudTitle': 'Eingaben in die Live-Übungen',
    'impressum.dataCloudBody': 'Übungen wie Next-Token, Finetuning, RAG, Chain-of-Thought, RLVR, Embeddings oder der Nachrichten-Check senden deine Eingabe – einen kurzen Text – über den Server dieser Seite an ein Sprachmodell von Google (Gemini über Google Cloud / Vertex AI), das die Vorhersage berechnet. Die Eingabe verlässt also deinen Browser und wird in der Cloud verarbeitet. Gib hier nichts Schützenswertes oder Personenbezogenes ein.',
    'impressum.dataBrowserTitle': 'Was im Browser bleibt',
    'impressum.dataBrowserBody': 'Mehrere Übungen rechnen vollständig in deinem Browser und übertragen nichts: das Mini-Training, das Belohnungsmodell (RLHF), die Bedeutungs-Landkarte (Embeddings), der Daten-Explorer und „Bild & Ton". Die Tokenisierung läuft über den eigenen Server, ohne Dritt-Anbieter.',
    'impressum.dataSettingsTitle': 'Einstellungen',
    'impressum.dataSettingsBody': 'Hell/Dunkel-Modus, Akzentfarbe, Sprache und der Sidebar-Zustand werden lokal in deinem Browser gespeichert (localStorage, Schlüssel „behind-ai-ui"). Diese Angaben bleiben auf deinem Gerät und werden nicht übertragen.',
    'impressum.dataHostingTitle': 'Hosting & Server-Logs',
    'impressum.dataHostingBody': 'Die Seite wird bei Vercel gehostet. Wie bei jedem Webserver können dabei technische Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite) vorübergehend in Logs anfallen. Es gibt kein Analyse-Tool, keine Werbe-Cookies und kein Profiling.',
    'impressum.dataNote': 'Eingaben werden nicht dauerhaft gespeichert oder mit Personen verknüpft. Zur Beantwortung einer Anfrage werden sie an Google übermittelt; was Google damit tut, regeln dessen eigene Bestimmungen.',
    'impressum.contentTitle': 'Inhalt & Haftung',
    'impressum.contentBody': 'Die Erklärungen sind didaktisch vereinfacht. KI-Ausgaben können falsch sein (Halluzinationen) – das zeigen einige Übungen bewusst. Für die Richtigkeit und Vollständigkeit der Inhalte wird keine Gewähr übernommen. Für die Inhalte verlinkter externer Seiten sind deren Betreiber verantwortlich.',
    'impressum.copyrightTitle': 'Urheberrecht & Quellcode',
    'impressum.copyrightBody': 'Der Quellcode dieser Seite steht unter MIT-Lizenz offen zur Verfügung:',
    'impressum.copyrightResources': 'Ressourcen',
    'impressum.statusTitle': 'Stand',
    'impressum.statusBody': 'Letzte grosse Aktualisierung: Juni 2026 (Redesign). Erste Version: März 2025. Die Update-Geschichte steht unter Ressourcen.',
    'impressum.backBtn': 'Zurück zur Einführung',
  },
  en: {
    'brand.name': 'Behind AI',
    'brand.tagline': 'How do AI language models work?',

    // Home page
    'home.hero.title': 'Look behind the AI',
    'home.hero.subtitle':
      'How language models really work – hands-on with real models.',

    'home.demo.caption':
      'The core of every language model: predicting the next word. Type the start of a sentence and see what the model finds likely – click a token to append it.',
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
      'How the technology works – from tokens through training and reasoning to images & sound.',
    'home.path.aiInUse.desc':
      'What matters when using AI day to day – privacy, cost, hardware.',

    'home.more.title': 'So what is a language model?',
    'home.more.body':
      'A language model has read vast amounts of text and learned to recognise patterns in language. At its core it always predicts the most likely next word – just at an extremely high level. From that come answers, summaries, translations and much more.',

    'nav.home': 'Introduction',
    'nav.resources': 'Resources',
    'nav.impressum': 'Imprint',
    'nav.section.behindModels': 'Behind the models',
    'nav.section.aiInUse': 'AI in practice',

    'nav.tokenization': 'Tokenization',
    'nav.nextToken': 'Next-token prediction',
    'nav.data': 'Data',
    'nav.training': 'Training',
    'nav.finetuning': 'Fine-tuning',
    'nav.rlhf': 'RLHF',
    'nav.rag': 'RAG',
    'nav.cot': 'Chain-of-thought',
    'nav.rlvr': 'RLVR',
    'nav.embeddings': 'Embeddings',
    'nav.multimodal': 'Images & sound',
    'nav.localVsCloud': 'Local vs. cloud',
    'nav.hardware': 'Hardware check',
    'nav.costs': 'Costs',
    'nav.privacy': 'Data protection',
    'nav.toolChoice': 'Choosing tools',

    // --- Page pattern (shared) ---
    'common.moreAbout': 'Learn more',
    'common.back': 'Back',
    'common.reset': 'Reset',

    // === AI in practice (Thread 8) ===
    // --- Local vs. cloud ---
    'localVsCloud.title': 'Local vs. cloud: where does the AI work?',
    'localVsCloud.subtitle':
      'The same request, three routes — and three very different answers to what actually leaves your device.',
    'localVsCloud.caption':
      'One request, three routes — we mark the sensitive parts and show what reaches the provider on each route.',
    'localVsCloud.moreP1':
      'Local means the model runs directly on your device (e.g. with Ollama). Your input never leaves the machine — great for privacy, but limited by your hardware.',
    'localVsCloud.moreP2':
      'With a cloud API you send your text to a provider (OpenAI, Google, Anthropic …). You get the most capable models, but your original text — names, grades, health details — ends up on someone else’s servers.',
    'localVsCloud.moreP3':
      'A wrapper is an intermediary that anonymizes sensitive parts before forwarding the request, often with servers in Switzerland or the EU. Swiss examples are Safe Swiss Cloud’s “Private AI” or the open Swiss model Apertus. The provider then sees only placeholders; but you have to trust the wrapper itself, since it sees the original.',
    'localVsCloud.nextLabel': 'Next: hardware check',

    // --- Costs ---
    'costs.title': 'What does AI cost?',
    'costs.subtitle':
      'Locally you pay once for hardware; in the cloud you pay per token. Type a text and see what a request really costs.',
    'costs.caption':
      'Counted with the same tokenizer as on the tokenization page, projected with list prices from June 2026.',
    'costs.moreP1':
      'Locally the main cost is one-off — a capable computer or a good graphics card. After that you pay little more than electricity; the software to run models (e.g. Ollama) is free.',
    'costs.moreP2':
      'In the cloud you pay per token — the small text units that make up your request and the answer. Output tokens (the answer) usually cost far more than input tokens. Cheap models are a few cents per million tokens; top models cost much more.',
    'costs.moreP3':
      'Three levers to save: pick the right (not the most expensive) model; in long chats the history grows and is sent along every time — that drives cost; and “cached input” often makes repeated context about ten times cheaper. There are also subscriptions (ChatGPT Plus/Pro, Claude Pro, Gemini plans) with a fixed monthly fee, and wrapper services with their own markup.',
    'costs.nextLabel': 'Next: data protection',

    // --- Hardware check ---
    'hardware.title': 'Does AI need a supercomputer?',
    'hardware.subtitle':
      'Some models run on a laptop, others only in a data center. Set your device and see what is possible locally.',
    'hardware.caption':
      'Memory math: parameters times bytes per weight. An illustration, not a guarantee for your exact system.',
    'hardware.moreP1':
      'A model has to fit into fast memory — RAM, or better the graphics memory (VRAM). Rule of thumb: billions of parameters × bytes per weight. At “Q4” that’s about 0.6 GB per billion, so an 8B model needs roughly 5 GB.',
    'hardware.moreP2':
      'Quantization shrinks the numbers inside the model: from F16 (full precision) through Q8 (near-lossless) to Q4 (the standard for running locally). Going from Q8 to Q4 saves about 40 % of memory for only ~2 % quality loss — which is why Q4 is the default.',
    'hardware.moreP3':
      'Apple devices share one memory pool between processor and graphics (unified memory) — handy for big models. To run a model you need a tool: Ollama (easiest), LM Studio (with a GUI) or llama.cpp (for fine control). Important: the model plus the chat history should stay under about 80 % of memory, otherwise it gets very slow.',
    'hardware.nextLabel': 'Next: costs',

    // --- Model types / multimodal ---
    'multimodal.title': 'How a language model reads an image',
    'multimodal.subtitle':
      'A language model processes a row: one piece after another. But an image is a surface. Watch how the surface turns into a row that the very same model can read.',
    'multimodal.caption':
      'Each tile and its order are computed from the actual image. Turning a surface into a row is exactly what a model does before it can “read” a picture.',
    'multimodal.moreP1':
      'Multimodal means a model processes not just text but also images, sound, sometimes video. Well-known examples are GPT-5, Gemini and Claude. Open models that run locally can see too: Gemma 3 (from 4B) understands images, and Qwen3-VL and Qwen3-Omni even handle image, sound and video.',
    'multimodal.moreP2':
      'The core is always the same: a dedicated “encoder” cuts the image into tiles and translates each one into the same number-language as the text tokens — a vector in the same meaning space (see embeddings). So the model needn’t relearn anything: an image tile is just one more piece in the row, handled like a word.',
    'multimodal.moreP3':
      'Sound is first turned into a spectrogram — a “picture of the sound” — and then split like an image; video is simply a sequence of images. In the end everything becomes the same row of vectors. So for a language model, “seeing” and “hearing” aren’t a second sense, but the same mechanism with different input.',
    'multimodal.nextLabel': 'Next: AI in practice',

    // --- Data protection ---
    'privacy.title': 'What are you sharing with the AI?',
    'privacy.subtitle':
      'A harmless-looking request quickly contains sensitive details. Type a message and see what’s in it — and what to watch out for.',
    'privacy.caption':
      'A language model marks the sensitive parts. That shows what would reach the provider if you used a cloud AI. Not legal advice.',
    'privacy.factorsTitle': 'What matters?',
    'privacy.factorPrivacyTitle': 'Data protection',
    'privacy.factorPrivacy':
      'Why: a message quickly contains names, grades or health details. What to watch: does it stay on the device? does it go abroad? is it a school-approved tool?',
    'privacy.factorQualityTitle': 'Quality',
    'privacy.factorQuality':
      'What it means: does the AI understand the task, make little up, give usable answers? The big cloud models are usually stronger here than small local ones.',
    'privacy.factorSetupTitle': 'Easy setup',
    'privacy.factorSetup':
      'Ready to use (a login or app, instantly available) or install it yourself (local — more control, a bit of effort).',
    'privacy.rule':
      'Rule of thumb: sensitive data → local or a vetted school tool. Harmless, general tasks → any cloud AI is fine.',
    'privacy.moreP1':
      'Where does the AI run? On your device, your input stays with you (can work offline, but limited by your hardware). In the cloud you get the strongest models, but your input goes to the provider — often to servers abroad.',
    'privacy.moreP2':
      'In a school context the school is the responsible body and the provider only a processor — which needs a contract. Public schools fall under cantonal data-protection law. The trickiest point is training: if a provider uses your inputs to improve its models, that’s usually not allowed — free services often do it, paid and edu offerings generally don’t.',
    'privacy.moreP3':
      'For especially sensitive data (health, support needs) you also need a data-protection impact assessment and a clear legal basis. When in doubt: share as little personal reference as possible — often the task works without real names.',
    'privacy.sourceLabel': 'Source and further reading:',

    // --- Choosing tools ---
    'toolChoice.title': 'Which AI tool fits?',
    'toolChoice.subtitle':
      'Hardware, cost, privacy — this is where it all comes together. Answer three questions and get a recommendation.',
    'toolChoice.caption':
      'A starting point that ties together the previous chapters — not a one-size-fits-all rule.',
    'toolChoice.moreP1':
      'There is no single best tool — it depends on your priorities. If sensitive data or full control matter, a local model is usually the answer. If top quality counts and the data is uncritical, the big cloud models are strong.',
    'toolChoice.moreP2':
      'In between sits the wrapper: strong cloud models, but with anonymization and servers in Switzerland/EU — a good compromise when both matter. And for quick everyday use without sensitive data, a subscription is often enough.',
    'toolChoice.moreP3':
      'The rules of thumb from the last chapters: local = private, free, but hardware-limited; cloud = strongest models, but the data leaves the device and costs per token; wrapper = middle ground. When in doubt: as local and as anonymous as possible.',
    'toolChoice.nextLabel': 'Back to overview',

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
      'The probabilities come from a language model. Pick a token to continue the sentence step by step — or let chance decide.',
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
      'The same tokenizer ChatGPT uses. Hover over a token to see how the text is cut up.',
    'tokenization.emptyTitle': 'Click “Tokenize text” to see how your text breaks into tokens.',
    'tokenization.emptyBody':
      'Tokens need not line up with words — often a single word is assembled from several pieces.',
    'tokenization.multimodal':
      'By the way: it’s not only text that gets split up. Modern models also break images and audio into pieces before processing them — how a flat image becomes a row is shown in the final station, “images & sound”.',
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
      'Type a word — an embedding model turns it into a vector live, landing next to words with similar meaning. Use the legend to show or hide categories. The map is a 2D projection of a 768-dimensional space; closeness is roughly preserved.',
    'embeddings.moreP1':
      'An embedding is a long vector of numbers (here 768 values). The key property: words with similar meaning have similar vectors. Picture each word as a point in a high-dimensional space — “dog” and “cat” sit close together, “dog” and “mathematics” far apart. That closeness is exactly what the map above expresses in two dimensions.',
    'embeddings.moreP2':
      'How similar two embeddings are is measured by cosine similarity: a value between -1 and 1 (in practice mostly 0 to 1), where 1 means “almost identical meaning”. A model learns these vectors from huge amounts of text following one principle: words that appear in similar contexts have similar meaning.',
    'embeddings.moreP3':
      'Embeddings are a foundational building block of many AI applications: semantic search, recommendation systems, translation and above all RAG, where matching documents are retrieved to ground answers in real knowledge.',
    'embeddings.nextLabel': 'Next: Next-token prediction',

    // --- Data / pre-training ---
    'data.title': 'Where does the data come from?',
    'data.subtitle':
      'A language model only knows what is in its training data. That data is a vast, unordered cross-section of the web – and the selection from it shapes what the model can do.',
    'data.caption':
      'Real documents from the FineWeb dataset (CommonCrawl web texts, machine-translated into German) – a tiny sample of just over 950 out of 15 trillion tokens. The educational score was assigned by an AI rater; the real filter (FineWeb-Edu) keeps only texts scoring 3 or higher.',
    'data.moreP1':
      'Pre-training data is not a textbook but a snapshot of what people happened to write online: how-tos next to ads, research articles next to small talk. Nobody plans the topic mix – it is simply whatever is out there. That is exactly why the raw cross-section is so heterogeneous.',
    'data.moreP2':
      'But unplanned does not mean unfiltered: over 90% of the raw web is thrown away. Duplicates, language junk and boilerplate are removed, and an AI classifier rates the educational value of every text. So today AI systems judge the training data of the next AI systems. Which texts survive this filter shapes the model’s abilities, knowledge and blind spots.',
    'data.moreP3':
      'That is why data selection is a central lever when building a model – not just quantity matters, but quality and composition. At the frontier, labs even deliberately weight individual sources (such as more code or books) to strengthen specific abilities.',
    'data.nextLabel': 'Next: Training',

    // --- Training / pre-training ---
    'training.title': 'Training',
    'training.subtitle':
      'Here a tiny language model learns right in your browser — from scratch. Press start and watch random noise turn into language.',
    'training.caption':
      'Above, a real neural network with a few thousand parameters is computing — live in your browser. It predicts the next character and corrects its error at every step, exactly like large models, just a million times smaller.',
    'training.moreP1':
      'Training and use are two separate phases. During training the model makes a prediction, compares it with the actual next character and nudges its dials (the parameters) a tiny bit. During inference — when you talk to an AI — everything is fixed: the model only applies what it has learned.',
    'training.moreP2':
      'The lever for learning is the error (loss): it measures how poorly the model predicted the correct next character. From that error you can compute, for every single number in the model, which direction makes it smaller — and that is exactly where each number is shifted, a tiny step at a time. Repeated millions of times, the prediction gets ever sharper: the distribution becomes peaked, the samples become plausible.',
    'training.moreP3':
      'Real models follow the very same principle, just bigger: not single letters but word pieces (tokens); not a few hundred words but trillions; not seconds in a browser but weeks on thousands of GPUs. This learning from scratch is called pre-training. How a model is then refined for concrete tasks is the next stop.',
    'training.nextLabel': 'Next: Fine-tuning',

    // --- Fine-tuning ---
    'finetuning.title': 'Fine-tuning',
    'finetuning.subtitle':
      'Same model, two behaviours: ask a question and watch a mere text-continuer turn into a helpful assistant.',
    'finetuning.caption':
      'On the left the language model behaves as it would right after pre-training, simply continuing your text; on the right the same model runs as a fine-tuned assistant.',
    'finetuning.moreP1':
      'Pre-training turns the model into a highly accurate text-continuer: it holds vast knowledge, but it is not set up to answer questions — it just keeps writing whatever would plausibly come next. Fine-tuning gives that knowledge a useful shape.',
    'finetuning.moreP2':
      'In fine-tuning (also called instruction tuning or supervised fine-tuning, SFT for short) the model is trained on thousands of example conversations of request and ideal answer. It learns a fixed dialogue format — who is speaking, human or assistant — and the habit of answering directly, following instructions and stopping once the answer is complete.',
    'finetuning.moreP3':
      'The knowledge itself comes almost entirely from pre-training — fine-tuning mainly teaches behaviour. That is why comparatively few, but very carefully chosen, examples are enough. How the model is then tuned even more finely to human preferences is the next stop: RLHF.',
    'finetuning.nextLabel': 'Next: RLHF',

    // --- RLHF ---
    'rlhf.title': 'RLHF: learning from human feedback',
    'rlhf.subtitle':
      'RLHF stands for reinforcement learning from human feedback: an AI learns from human ratings what makes a good answer. Here you teach a real reward model your taste in a few clicks — then it judges new answers on its own, and you discover where it can be gamed.',
    'rlhf.caption':
      'Above, a real reward model trains from your comparisons — the same Bradley-Terry method used in real RLHF systems, just with legible style traits instead of a huge network. The learning, generalising and gaming all happen for real, live in your browser.',
    'rlhf.moreP1':
      'After fine-tuning the model answers like an assistant — but what makes an answer good is almost impossible to write down as a rule. “Helpful, honest, harmless” is hard to define yet easy to compare: people can tell which of two answers is better without knowing the rule behind it. RLHF builds on exactly that.',
    'rlhf.moreP2':
      'Three steps: first humans collect thousands of such comparisons. From them a reward model learns to predict their preferences — as a score for any answer at all. Finally the language model is optimised with reinforcement learning to produce answers the reward model rates highly. This is how it takes on values nobody could program directly.',
    'rlhf.moreP3':
      'The catch: the reward model is only a stand-in for real human taste — and the language model optimises that single number relentlessly. If it finds an answer that scores high without truly helping (long, confident, flattering), it takes it. That is reward hacking. Real systems push back with safeguards — or replace the guessed reward with a checked one: for maths and code, “correct” can actually be verified. That idea powers today’s reasoning models.',
    'rlhf.nextLabel': 'Next: Chain-of-thought',

    // --- Chain-of-Thought ---
    'cot.title': 'Chain-of-thought: step by step to the answer',
    'cot.subtitle':
      'Chain-of-thought means the model writes out its working before it answers. Give the same model the same arithmetic problem here — once it must answer immediately, once it may think out loud — and see when that decides between wrong and right.',
    'cot.caption':
      'Both columns ask the same real model (Gemini via Vertex AI). The only difference is the room to think it through; a tiny checker recomputes each problem and says who is right.',
    'cot.moreP1':
      'Thinking out loud is nothing magical: the model still only predicts the next token, word by word. By writing out intermediate steps it hands itself those steps as context for the next token. Every extra token is one more small computation — the working is the model’s memory, made visible.',
    'cot.moreP2':
      'It was discovered as a simple trick: appending “think step by step” to a question makes answers measurably better. Today’s reasoning models have this thinking built in — they do it on their own and often show the working only in shortened form, or not at all.',
    'cot.moreP3':
      'Thinking helps, but it is no guarantee — the working itself can contain mistakes. How do you get a model to reason reliably right? By rewarding exactly the lines of reasoning that are demonstrably correct. The next stop shows how: RLVR.',
    'cot.nextLabel': 'Next: RLVR',

    // --- RLVR ---
    'rlvr.title': 'RLVR: a reward you can check',
    'rlvr.subtitle':
      'RLVR stands for reinforcement learning with verifiable rewards: instead of guessing what a good answer is, a program checks whether it is correct. Let a real model think up several lines of reasoning here, have a checker recompute them — and see how exactly that signal makes the model better.',
    'rlvr.caption':
      'Above, a real model (Gemini via Vertex AI) thinks up the solutions, a tiny piece of code checks them, and a real mini reinforcement-learning step reinforces what checks out — all live in your browser. Counting letters is the tangible stand-in for maths or code.',
    'rlvr.moreP1':
      'On the RLHF page the reward was a learned model of human taste — and it could be gamed: a confident, flattering but wrong answer could score high. RLVR replaces that guessed reward with a checked one: for maths you recompute, for code you run tests, for counting letters you simply count. Such a reward cannot be talked into anything.',
    'rlvr.moreP2':
      'The loop: the model generates many lines of reasoning (chain-of-thought), a checker decides only “right” or “wrong” for each, and reinforcement learning makes the right ones more likely. No human needs to read along — only a task with a checkable answer. That is exactly why reasoning models are strongest at maths, logic and programming: there, “correct” is unambiguously checkable.',
    'rlvr.moreP3':
      'That the model is bad at counting letters is no accident — it sees text as tokens, not as individual letters (see tokenisation). The checker does see the letters, and so becomes the teacher. The same idea — many attempts, one reliable check, reinforce what passes — sits behind the latest generation of reasoning models.',
    'rlvr.nextLabel': 'Next: RAG',

    // --- RAG ---
    'rag.title': 'RAG: look it up, then answer',
    'rag.subtitle':
      'RAG stands for retrieval-augmented generation: instead of answering from memory alone, a language model first looks something up in a knowledge source and bases its answer on it. Give an AI a small knowledge base here that it has never seen, ask a question — and watch it pull up the matching documents and answer from them.',
    'rag.caption':
      'Above, an embedding model finds the most similar documents; from those, a language model writes the answer.',
    'rag.moreP1':
      'A language model only knows what was in its training data — up to a cut-off date, and without your private or up-to-the-minute knowledge. RAG (retrieval-augmented generation) closes that gap: instead of retraining the model, you hand it the relevant documents along with the question. That lets it talk about knowledge it never saw — an internal wiki, fresh news or, as here, the records of a made-up school.',
    'rag.moreP2':
      'The heart of RAG is its first letter, retrieval — and it is exactly the similarity search from the embeddings page: the question becomes a vector and is compared with every document. The most similar ones are placed before the question as context (that is the “augmented”), and from those the model writes its answer (the “generation”). Three steps: search, augment, answer.',
    'rag.moreP3':
      'That is why RAG is only as good as what the search finds. If the right document is missing, or a similar-sounding but wrong one sits on top, the answer grounds itself on the wrong source. A good system then says honestly that the documents don’t cover it instead of guessing — so good sources and good search matter as much as the model itself. Remove a document from the knowledge base above and watch the answer change.',
    'rag.nextLabel': 'Next: images & sound',

    'a11y.toggleTheme': 'Toggle light/dark',
    'a11y.toggleSidebar': 'Show/hide navigation',
    'a11y.toggleLanguage': 'Switch language',
    'a11y.toggleAccent': 'Choose accent colour',

    // === Viz components ===
    // --- mini-training.tsx ---
    'miniTraining.trainingData': 'Training data:',
    'miniTraining.speed': 'Speed:',
    'miniTraining.speedSlow': 'Slow-mo',
    'miniTraining.speedNormal': 'Normal',
    'miniTraining.speedTurbo': 'Turbo',
    'miniTraining.customLabel': 'Custom',
    'miniTraining.customHint': 'Enter your own words (space-separated) — the model learns only from these. Try animal names, cities or made-up words.',
    'miniTraining.customApply': 'Apply & restart',
    'miniTraining.customWords': 'words',
    'miniTraining.pause': 'Pause',
    'miniTraining.train': 'Train',
    'miniTraining.continue': 'Continue',
    'miniTraining.resetLabel': 'Reset',
    'miniTraining.statusRunning': 'Learning … it nudges its dials at every step.',
    'miniTraining.statusPaused': 'Paused — you can keep training.',
    'miniTraining.statusIdle': 'Untrained: pure random. Press "Train" or "+500".',
    'miniTraining.stepLabel': 'Step',
    'miniTraining.samplesTitle': 'What the model is writing right now',
    'miniTraining.showData': 'Show training data',
    'miniTraining.hideData': 'Hide training data',
    'miniTraining.resample': 'Re-roll',
    'miniTraining.temperature': 'Temperature',
    'miniTraining.tempLow': 'tame: mostly common words',
    'miniTraining.tempHigh': 'wild: even rare letters appear',
    'miniTraining.tempMid': 'balanced',
    'miniTraining.samplesNote': 'Freshly sampled from the model — character by character.',
    'miniTraining.samplesNovel': 'Blue',
    'miniTraining.samplesNovelDesc': '= not in the training data, so assembled by the model itself.',
    'miniTraining.samplesInit': 'Gibberish at first, then real words start appearing.',
    'miniTraining.dataLabel': 'The model has only seen these',
    'miniTraining.dataLabelSuffix': ':',
    'miniTraining.lossTitle': 'Error (Loss)',
    'miniTraining.lossNote': 'The error measures how poorly the model predicted the next character. With random guessing it would be',
    'miniTraining.lossNoteSuffix': 'and it falls as the model learns.',
    'miniTraining.distTitle': 'Prediction for the next character',
    'miniTraining.distWordStart': 'Word start',
    'miniTraining.distAfter': 'after',
    'miniTraining.distNote': 'Same idea as on the next-token page — but for the next character. Flat at first (everything equally likely), peaked after training.',
    'miniTraining.moreTitle': 'More insights',
    'miniTraining.moreSuffix': '— for the curious',
    'miniTraining.embTitle': 'Character embeddings',
    'miniTraining.embNote': 'Every character gets its own list of numbers — shown here in 2D. During training they self-organise; vowels often cluster together. That is exactly what embeddings are, one station back.',
    'miniTraining.exTitle': 'A training example',
    'miniTraining.exNote': 'This is how the model learns: from',
    'miniTraining.exNoteMid': 'should come',
    'miniTraining.exNoteSuffix': '. It compares its prediction with the truth and nudges the probability higher step by step.',
    'miniTraining.exGuesses': 'guesses',
    'miniTraining.exProbLabel': 'Probability for',
    'miniTraining.charEndLabel': 'End',
    'miniTraining.svgLossCurve': 'Learning curve',
    'miniTraining.svgEmbMap': 'Character embeddings',

    // --- finetuning-comparison.tsx ---
    'finetuningComp.placeholder': 'Ask a question or give an instruction …',
    'finetuningComp.askBoth': 'Ask both',
    'finetuningComp.baseTitle': 'Base model',
    'finetuningComp.baseTag': 'pre-training only',
    'finetuningComp.assistantTitle': 'Assistant',
    'finetuningComp.assistantTag': 'after fine-tuning',
    'finetuningComp.loading': 'Model is writing …',
    'finetuningComp.retry': 'Try again',
    'finetuningComp.idle': 'Ask a question to see the difference.',
    'finetuningComp.baseNote': 'It just continues your text instead of answering, and doesn\'t stop on its own — we cut it off after about 100 tokens.',
    'finetuningComp.assistantNote': 'It recognises the request, answers directly and in a structured way — and stops on its own when the answer is done.',
    'finetuningComp.noOutput': 'No output — please try again.',
    'finetuningComp.userLabel': 'You:',

    // --- cot-comparison.tsx ---
    'cotComp.placeholder': 'An arithmetic problem …',
    'cotComp.askBoth': 'Both modes',
    'cotComp.directTitle': 'Answer immediately',
    'cotComp.directTag': 'without working',
    'cotComp.cotTitle': 'Step by step',
    'cotComp.cotTag': 'with working',
    'cotComp.loading': 'Model is computing …',
    'cotComp.retry': 'Try again',
    'cotComp.resultLabel': 'Result',
    'cotComp.correct': 'correct',
    'cotComp.wrong': 'wrong',
    'cotComp.directNote': 'One answer in one pass — no scratch pad. With multiple steps something can easily go wrong.',
    'cotComp.cotNote': 'The model writes out intermediate steps — and re-reads them as it continues. Same model, just with room to think.',
    'cotComp.freeTaskHint': 'For open-ended tasks without a unique numerical answer we show both answers without a ✓/✗ verdict.',
    'cotComp.noOutput': 'No output — please try again.',

    // --- rlhf-lab.tsx ---
    'rlhfLab.stageLabel': 'Rate',
    'rlhfLab.stageTrain': 'Learn',
    'rlhfLab.stageGeneralize': 'Generalise',
    'rlhfLab.stageHack': 'Game it',
    'rlhfLab.labelHeading': 'Which answer is better?',
    'rlhfLab.labelCompare': 'Comparison',
    'rlhfLab.labelOf': 'of',
    'rlhfLab.labelQuestion': 'Question',
    'rlhfLab.labelChooseThis': 'This one is better',
    'rlhfLab.labelHint': 'Read both and pick the more helpful one. You judge the whole answer — the reward model will only see a few surface features of it.',
    'rlhfLab.trainDone': 'Done. This is the rule of thumb the model drew from your clicks — and it only saw these five style features, not the actual content.',
    'rlhfLab.trainRunning': 'Learning your reward model from your comparisons …',
    'rlhfLab.trainNext': 'Does it hold up?',
    'rlhfLab.lossTitle': 'Error',
    'rlhfLab.lossFalling': 'falling …',
    'rlhfLab.lossLearning': 'The model predicts your clicks ever better.',
    'rlhfLab.weightTitle': 'What your reward model likes',
    'rlhfLab.weightNote': 'Each bar is a learned preference: right = rewarded, left = penalised. Nobody programmed this — it comes entirely from your comparisons.',
    'rlhfLab.genHeading': 'New answers the model has never seen',
    'rlhfLab.genHint': 'Pick the better one again — then see whether your reward model agrees.',
    'rlhfLab.genYourChoice': 'your choice',
    'rlhfLab.genAgree': 'times the model matches your choice — from only',
    'rlhfLab.genAgreeSuffix': 'clicks. That is what makes RLHF practical: a few thousand comparisons and the model can rate millions of answers without a human reading each one.',
    'rlhfLab.genNext': 'Where it breaks',
    'rlhfLab.hackHeading': 'Now the tables turn',
    'rlhfLab.hackIntro': 'In real RLHF the language model writes the answers — and is trained to get as high a reward as possible. Here are many possible answers to the same question. Every dot is one of them.',
    'rlhfLab.hackQuestion': 'Question',
    'rlhfLab.hackChoose': 'Let the language model pick the highest reward',
    'rlhfLab.hackPickLabel': 'The chosen answer (highest reward)',
    'rlhfLab.hackPickNote': 'Stylistically a bull\'s-eye — but the capital is',
    'rlhfLab.hackPickNoteSuffix': '. The reward model only sees style, not the truth, so it falls for it. That is reward hacking: the model maximises the reward instead of genuinely helping.',
    'rlhfLab.hackBetter': 'More helpful would have been',
    'rlhfLab.hackBetterSuffix': '— high in the chart but not all the way right. That is why real RLHF needs safeguards: keep sharpening the preferences, don\'t let the model drift too far from the original — or don\'t guess the reward at all, but check it. For maths or code "correct" can actually be verified. That is what drives today\'s reasoning models: the next station.',
    'rlhfLab.hackReset': 'Try again with a different taste',
    'rlhfLab.scatterAxisX': 'Reward →',
    'rlhfLab.scatterAxisY': '↑ how helpful (hidden)',
    'rlhfLab.scatterChosen': 'chosen',
    'rlhfLab.legendHelpful': 'genuinely helpful & correct',
    'rlhfLab.legendWeak': 'weak or wrong',
    'rlhfLab.legendChosen': 'the model\'s choice',
    'rlhfLab.svgLabel': 'Reward vs. actual helpfulness',
    'rlhfLab.svgLoss': 'Learning curve',

    // --- rlvr-lab.tsx ---
    'rlvrLab.stageGenerate': 'Generate',
    'rlvrLab.stageVerify': 'Verify',
    'rlvrLab.stageReinforce': 'Reinforce',
    'rlvrLab.taskLabel': 'Task',
    'rlvrLab.generateHint': 'Let the model estimate the same question several times off the top of its head. Because it has to count letters from tokens, it gives different answers — perfect material to run a verifier on.',
    'rlvrLab.generateBtn': 'quick attempts',
    'rlvrLab.attemptLabel': 'Attempt',
    'rlvrLab.attemptFailed': 'Attempt failed.',
    'rlvrLab.contradicting': 'The attempts contradict each other. Who is right? Don\'t ask the model — ask the verifier.',
    'rlvrLab.thinking': 'Model is thinking …',
    'rlvrLab.checkBtn': 'Let the verifier check',
    'rlvrLab.verifierTitle': 'The verifier counts',
    'rlvrLab.verifierNote': 'A piece of code counts the',
    'rlvrLab.verifierNoteMid': 'directly in the word:',
    'rlvrLab.verifierNoteSuffix': '. No guessing, no opinion — this is the truth every attempt is checked against.',
    'rlvrLab.verifyHasCorrect': 'get reward 1, the rest get 0. Some wrong attempts sound just as convincing as the correct ones — the verifier is not fooled.',
    'rlvrLab.verifyNoCorrect': 'This time no attempt was correct — all get 0. Reinforcement can only strengthen what occurs; the model would need more or better attempts. Try a different word.',
    'rlvrLab.verifyOf': 'of',
    'rlvrLab.verifyVersuche': 'attempts',
    'rlvrLab.learnBtn': 'Learn from this',
    'rlvrLab.rewardLabel': 'Reward:',
    'rlvrLab.schemeVerifier': 'Verifier',
    'rlvrLab.schemeImpression': 'Impression',
    'rlvrLab.schemeVerifierHint': 'rewards what checks out',
    'rlvrLab.schemeImpressionHint': 'rewards what sounds most frequent/convincing',
    'rlvrLab.classTitle': 'What the model decides on',
    'rlvrLab.accuracyTitle': 'Chance of being right',
    'rlvrLab.bannerVerifier': 'The verifier pulls the model toward the checked answer',
    'rlvrLab.bannerVerifierSuffix': '. After training it almost always picks the right answer — because the reward was the truth, not its appearance. That is exactly what drives today\'s reasoning models on maths and code.',
    'rlvrLab.bannerImpLucky': 'This time the most common answer happened to be correct. Don\'t count on it: the impression reward never actually checks — it only rewards what sounds convincing. Switch to Verifier or try a different word, and the difference becomes visible.',
    'rlvrLab.bannerImpHack': 'With the impression reward the model converges on',
    'rlvrLab.bannerImpHackMid': '— the answer that came most often and most confidently, but which the verifier exposes as wrong. That is how a guessed reward gets gamed (reward hacking, as with the reward model on the RLHF page). The verifier cannot be fooled — that is the whole trick of RLVR.',
    'rlvrLab.newAttempts': 'New attempts',
    'rlvrLab.svgAccuracy': 'Accuracy curve',

    // --- rag-explorer.tsx ---
    'ragExplorer.placeholder': 'Ask something about the school …',
    'ragExplorer.ask': 'Ask',
    'ragExplorer.retrievalTitle': '1. Retrieve — the most similar documents',
    'ragExplorer.knowledgeBase': 'Knowledge base: Lindenhof School',
    'ragExplorer.active': 'active',
    'ragExplorer.of': 'of',
    'ragExplorer.retrievalHintBefore': 'A small collection of made-up documents the model has never seen. Ask a question — the search embeds it and sorts by similarity.',
    'ragExplorer.retrievalHintAfter': 'Your question becomes a vector — the',
    'ragExplorer.retrievalHintAfterSuffix': 'most similar documents (bar = cosine similarity) go into the context.',
    'ragExplorer.inContext': 'in context',
    'ragExplorer.toggleInclude': 'Add back to knowledge base',
    'ragExplorer.toggleExclude': 'Remove from knowledge base',
    'ragExplorer.stale': 'Knowledge base changed — click "Ask" to re-ground the answer.',
    'ragExplorer.answerTitle': '2. Answer — the same question, once without and once with these documents',
    'ragExplorer.withoutTitle': 'Without context',
    'ragExplorer.withoutTag': 'model knowledge only',
    'ragExplorer.withTitle': 'With context (RAG)',
    'ragExplorer.withTag': 'model + documents',
    'ragExplorer.loading': 'Model is answering …',
    'ragExplorer.retry': 'Try again',
    'ragExplorer.idle': 'Ask a question to see the difference.',
    'ragExplorer.withoutFooter': 'Only the question goes to the model. What was not in training — like this made-up school — it cannot know.',
    'ragExplorer.withFooter': 'Grounded on:',
    'ragExplorer.withFooterNote': 'If the answer is not in the documents, the model says so honestly.',
    'ragExplorer.withFooterEmpty': 'The retrieved documents are placed before the question.',
    'ragExplorer.noOutput': 'No output — please try again.',

    // --- embeddings-map.tsx ---
    'embMap.inputPlaceholder': 'Enter a word — e.g. tiger, volcano, happiness …',
    'embMap.embedBtn': 'Add to map',
    'embMap.embeddingBtn': 'Embedding …',
    'embMap.examplesLabel': 'Examples:',
    'embMap.resetMap': 'Reset map',
    'embMap.yourWord': 'your word',
    'embMap.neighborsOf': 'Nearest neighbours of',
    'embMap.noSelection': 'Type a word or click a point — the nearest neighbours and their similarity will appear here.',
    'embMap.catTiere': 'Animals',
    'embMap.catEssen': 'Food',
    'embMap.catOrte': 'Countries & cities',
    'embMap.catGefuehle': 'Feelings',
    'embMap.catBerufe': 'Professions',
    'embMap.catSport': 'Sport',
    'embMap.catMusik': 'Music',
    'embMap.catFahrzeuge': 'Vehicles',

    // --- data-explorer.tsx ---
    'dataExplorer.viewRaw': 'Raw',
    'dataExplorer.viewMine': 'Your selection',
    'dataExplorer.viewCurated': 'Model answer',
    'dataExplorer.randomDoc': 'Random document',
    'dataExplorer.reset': 'Reset',
    'dataExplorer.captionRaw': 'A raw cross-section of the web. Click a dot and read what is really in it – the mundane next to the valuable, no curriculum.',
    'dataExplorer.captionMineEmpty': 'Open a document and decide "Keep" or "Discard". What you keep forms your own dataset here.',
    'dataExplorer.captionMineCount': 'Your dataset:',
    'dataExplorer.captionMineCountSuffix': 'documents kept.',
    'dataExplorer.captionCurated': 'What the real quality filter keeps: only texts with high educational value —',
    'dataExplorer.captionCuratedSuffix': '(≈ 6 %). The pipeline throws the rest away.',
    'dataExplorer.svgLabel': 'Map of training-data documents, coloured by topic',
    'dataExplorer.docEmpty': 'Click a dot on the map — a real document from the training data will appear here.',
    'dataExplorer.docDecide': 'Include in training?',
    'dataExplorer.docKeep': '✓ Keep',
    'dataExplorer.docDiscard': '✗ Discard',
    'dataExplorer.docEduScore': 'Educational value (AI rater):',
    'dataExplorer.docFilterKeeps': 'The real filter keeps this text.',
    'dataExplorer.docFilterDiscards': 'The real filter discards this text.',
    'dataExplorer.docAgree': 'You agree.',
    'dataExplorer.docDisagree': 'The filter decides differently from you.',
    'dataExplorer.von': 'of',

    // --- next-token-prediction.tsx ---
    'nextTokenPred.currentText': 'Current text:',
    'nextTokenPred.tokenChain': 'Token chain:',
    'nextTokenPred.reset': 'Reset',
    'nextTokenPred.computing': 'Computing probabilities for the next token...',
    'nextTokenPred.errorTitle': 'Error in token prediction:',
    'nextTokenPred.retry': 'Try again',
    'nextTokenPred.hint': 'Note:',
    'nextTokenPred.temperature': 'Temperature',
    'nextTokenPred.tempLow': 'Low: almost always the most likely token — reliable but predictable.',
    'nextTokenPred.tempHigh': 'High: the distribution flattens — less likely tokens also get picked.',
    'nextTokenPred.tempMid': 'Medium: close to what the model actually computes (1.0).',
    'nextTokenPred.topProbs': 'Top probabilities for the next token',
    'nextTokenPred.randomToken': 'Random token',
    'nextTokenPred.longTailNote': 'The rest is spread over thousands more tokens, each very unlikely.',
    'nextTokenPred.selectedToken': 'Selected next token:',
    'nextTokenPred.addToText': 'Appending token to text',
    'nextTokenPred.noTokens': 'No token predictions received from model.',
    'nextTokenPred.useSimulation': 'Use simulation',
    'nextTokenPred.simMode': 'Simulation mode active — no real API used',
    'nextTokenPred.apiFailed': 'API request failed:',

    // --- multimodal-sequence.tsx ---
    'multimodalSeq.sceneLabel': 'Tiles:',
    'multimodalSeq.drawing': 'Drawing scene …',
    'multimodalSeq.step1Title': 'A surface',
    'multimodalSeq.step1Hint': 'An image is a rectangle of pixels — no start, no end. We divide it into equal-sized tiles.',
    'multimodalSeq.step2Title': 'A row',
    'multimodalSeq.step2Hint': 'The tiles are unrolled row by row into a single sequence: the surface becomes a line. Each tile is turned into a list of numbers.',
    'multimodalSeq.step3Title': 'A stream',
    'multimodalSeq.step3Hint': 'These image tiles now sit in the same stream as the word tokens. The model reads the whole row — and predicts the next piece, just like with plain text.',
    'multimodalSeq.tileAria': 'Tile',
    'multimodalSeq.tileInspectHint': 'tiles, unrolled into a row — each is now a short list of numbers. Tip: click a tile to see its numbers.',
    'multimodalSeq.tileNumbers': 'This one tile as three numbers:',
    'multimodalSeq.back': 'Back',
    'multimodalSeq.unroll': 'Unroll',
    'multimodalSeq.next': 'Next',
    'multimodalSeq.restart': 'Start over',
    'multimodalSeq.moreTitle': 'More insights',
    'multimodalSeq.moreSuffix': '— for the curious',
    'multimodalSeq.moreP1': 'The three bars per tile show how much red, green and blue it contains — together they give its average colour. Click a tile in the "A row" step: a sun-tile has lots of red and green, a sky-tile lots of blue.',
    'multimodalSeq.moreP2': 'A real model computes not three but hundreds of such numbers per tile — and individually they are no longer interpretable. Together they place the tile as a point in the same meaning space where words live too. That is the idea of the embeddings station, just this time for a piece of image.',
    'multimodalSeq.streamLabel': 'Input stream:',
    'multimodalSeq.nextPiece': 'next piece?',
    'multimodalSeq.streamNote': 'For the model this is one single row of pieces — image tiles and word tokens mixed. It treats both the same and continues the row. That is how a language model "sees": not with a second sense, but with the same mechanism, just with different input.',
    'multimodalSeq.sceneSunset': 'Sunset',
    'multimodalSeq.sceneMeadow': 'Meadow',
    'multimodalSeq.sceneSea': 'Sea',
    'multimodalSeq.gridCoarse': 'coarse',
    'multimodalSeq.gridMedium': 'medium',
    'multimodalSeq.gridFine': 'fine',
    'multimodalSeq.axisRed': 'Red',
    'multimodalSeq.axisGreen': 'Green',
    'multimodalSeq.axisBlue': 'Blue',

    // --- message-check.tsx ---
    'msgCheck.placeholder': 'Type a request as you would send it to an AI …',
    'msgCheck.examplesLabel': 'Examples:',
    'msgCheck.checkBtn': 'Check message',
    'msgCheck.checking': 'Checking …',
    'msgCheck.fallback': 'Example data – the model is currently unavailable. Highlighting from a simple pattern matcher.',
    'msgCheck.foundSingular': 'sensitive item found',
    'msgCheck.foundPlural': 'sensitive items found',
    'msgCheck.detected': 'Detected:',
    'msgCheck.detectedSuffix': 'If you send this to a cloud AI the provider sees exactly that — often on servers abroad. Such details should not go there unthinkingly.',
    'msgCheck.showAnon': 'How you could de-identify it yourself →',
    'msgCheck.hideAnon': 'Hide de-identified version',
    'msgCheck.anonNote': 'Without real names and details you often get an equally good answer — and share nothing sensitive. (You have to do this yourself; it does not happen automatically.)',
    'msgCheck.okTitle': 'Nothing obviously sensitive.',
    'msgCheck.okNote': 'A general question without personal reference — a cloud AI is fine here.',
    'msgCheck.catName': 'Name',
    'msgCheck.catOrt': 'Location',
    'msgCheck.catDatum': 'Date',
    'msgCheck.catKontakt': 'Contact',
    'msgCheck.catGesundheit': 'Health',
    'msgCheck.catNoten': 'Grade',
    'msgCheck.catPersoenlich': 'Personal',
    'msgCheck.catAndere': 'Other',

    // === Pages ===
    // --- resources/page.tsx ---
    'resources.title': 'Resources & background',
    'resources.subtitle': 'Further explanations — and how this site came to be.',
    'resources.aboutTitle': 'About this website',
    'resources.aboutP1': 'This site is a hobby project with one simple goal: to make complex AI topics something you can try out rather than just read about — especially for teachers and people from education who want a clear, honest picture of how AI works.',
    'resources.aboutP2': 'It started in March 2025 as an experiment with the then-new Claude Code from Anthropic and was then developed further with various AI assistants (including Gemini 2.5 Pro). The current major redesign (June 2026) was built with Claude Code again — in roughly one day. A timeline is further below under Update history.',
    'resources.vibeTitle': 'A word on how it was built: "Vibe Coding"',
    'resources.vibeP1': 'The term became Collins\'s word of the year in 2025 — and has since become almost a slur. Practitioners who use LLM agents seriously prefer "AI-Assisted Engineering": they read, test and understand the generated code rather than taking it blindly (Karpathy himself called "Vibe Coding" "passé" in 2026). For me it is mostly semantics.',
    'resources.vibeP2': 'For a front-end designer this kind of site might be "AI-Slop". But for someone from education who simply wants to understand how AI works, it offers hands-on exercises that simply would not exist without such tools. That is where the value lies: not in perfect code, but in making explanations suddenly tangible.',
    'resources.sourceLabel': 'The source code is openly available on GitHub:',
    'resources.impressumLink': 'Imprint',
    'resources.karpathyTitle': 'Andrej Karpathy: LLMs explained',
    'resources.karpathyIntro': 'This website only scratches the surface of two worthwhile videos by Andrej Karpathy, a leading AI researcher. They go technically much deeper.',
    'resources.video1Caption': 'About three hours that go far deeper into the technical detail behind every explanation here.',
    'resources.video2Caption': '"How I use LLMs": a lot about the usefulness and inner workings — for example how prevalent hallucinations still are even in expensive tools.',
    'resources.furtherTitle': 'Further learning resources',
    'resources.furtherIntro': 'Freely accessible, visual explanations — well suited for going deeper after the exercises here.',
    'resources.dataSourceTitle': 'Data sources & inspiration',
    'resources.dataSourceP': 'The Data page was inspired by the second Karpathy video. The documents for the visualisation come from the public HuggingFace FineWeb dataset. The German translation of the FineWeb texts was done for free via API with Google\'s small model "gemini-2.0-flash-lite".',
    'resources.legalTitle': 'Legal basis (Switzerland)',
    'resources.legalSource': 'Legal analysis of the development and use of AI in Swiss education',
    'resources.legalAuthors': 'Thouvenin/Volz',
    'resources.legalYear': '2024 — a key source for the privacy page.',
    'resources.authorTitle': 'About the author',
    'resources.authorP': 'I work at PH Zug as a lecturer in media education and computer-science didactics. My focus areas are artificial intelligence in teacher education and digitalisation in the classroom. Much of my web-development work has grown over the years, especially through collaboration with AI tools.',
    'resources.historyTitle': 'Update history',
    'resources.history1Date': 'March 2025',
    'resources.history1Title': 'First version',
    'resources.history1Body': 'Experiment with the then-new Claude Code. The first interactive explanations emerge — the goal from day one is "try it out rather than just read".',
    'resources.history2Date': '2025',
    'resources.history2Title': 'Further development',
    'resources.history2Body': 'Expanded with various AI assistants (including Gemini 2.5 Pro). More topics and visualisations are added.',
    'resources.history3Date': 'June 2026',
    'resources.history3Title': 'Major redesign (with Claude Code)',
    'resources.history3Body': 'Real model experiments throughout instead of canned scripts: a tiny language model that trains live in the browser; a self-trained reward model (RLHF); a real retrieval pipeline (RAG); chain-of-thought and RLVR with a real verifier; a meaning map for embeddings; the tokenisation of images. Plus dark mode, selectable accent colours and a bilingual foundation.',
    'resources.backBtn': 'Back to introduction',

    // --- impressum/page.tsx ---
    'impressum.title': 'Imprint & data usage',
    'impressum.subtitle': 'Who operates this site — and what data is shared.',
    'impressum.responsible': 'Responsible',
    'impressum.responsibleName': 'Thomas Zurfluh',
    'impressum.responsibleRole': 'Lecturer in media education and computer-science didactics, PH Zug.',
    'impressum.responsibleContact': 'Contact via the',
    'impressum.responsibleContactLink': 'PH Zug profile',
    'impressum.responsibleOr': 'or',
    'impressum.privateNote': 'This is a private hobby project and not an official offering of PH Zug.',
    'impressum.dataTitle': 'What data is shared?',
    'impressum.dataIntro': 'This site has no account, no ads and no tracking. Even so, it is worth knowing what happens in the background once you start one of the interactive exercises — because that is also the lesson of the privacy page.',
    'impressum.dataCloudTitle': 'Inputs to live exercises',
    'impressum.dataCloudBody': 'Exercises such as next-token, fine-tuning, RAG, chain-of-thought, RLVR, embeddings or the message check send your input — a short text — via this site\'s server to a language model from Google (Gemini via Google Cloud / Vertex AI) that computes the prediction. Your input leaves your browser and is processed in the cloud. Do not enter anything sensitive or personally identifiable here.',
    'impressum.dataBrowserTitle': 'What stays in the browser',
    'impressum.dataBrowserBody': 'Several exercises compute entirely in your browser and transfer nothing: the mini-training, the reward model (RLHF), the meaning map (embeddings), the data explorer and "images & sound". Tokenisation runs on the site\'s own server without a third-party provider.',
    'impressum.dataSettingsTitle': 'Settings',
    'impressum.dataSettingsBody': 'Light/dark mode, accent colour, language and the sidebar state are stored locally in your browser (localStorage, key "behind-ai-ui"). These are not transferred.',
    'impressum.dataHostingTitle': 'Hosting & server logs',
    'impressum.dataHostingBody': 'The site is hosted on Vercel. As with any web server, technical access data (e.g. IP address, timestamp, page visited) may appear temporarily in logs. There is no analytics tool, no advertising cookies and no profiling.',
    'impressum.dataNote': 'Inputs are not stored permanently or linked to individuals. To answer a request they are sent to Google; what Google does with them is governed by its own terms.',
    'impressum.contentTitle': 'Content & liability',
    'impressum.contentBody': 'The explanations are didactically simplified. AI outputs can be wrong (hallucinations) — some exercises show this deliberately. No guarantee of accuracy or completeness is given. External sites linked from here are the responsibility of their operators.',
    'impressum.copyrightTitle': 'Copyright & source code',
    'impressum.copyrightBody': 'The source code of this site is available under the MIT licence:',
    'impressum.copyrightResources': 'Resources',
    'impressum.statusTitle': 'Last updated',
    'impressum.statusBody': 'Last major update: June 2026 (redesign). First version: March 2025. The update history is under Resources.',
    'impressum.backBtn': 'Back to introduction',
  },
}
