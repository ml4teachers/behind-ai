import type { Locale } from './config'

/*
 * Übersetzungs-Schicht (Gerüst).
 *
 * Aktuell nur die Shell/Navigation. Seiten-Inhalte werden beim jeweiligen
 * Redesign hierher migriert. Fehlt ein Key in der aktiven Sprache, greift
 * automatisch Deutsch (defaultLocale) als Fallback – Englisch darf also
 * lückenhaft bleiben, bis die Texte final sind.
 */
export const messages: Record<Locale, Record<string, string>> = {
  de: {
    'brand.name': 'Behind AI',
    'brand.tagline': 'Wie funktionieren KI-Sprachmodelle?',

    // Startseite
    'home.hero.title': 'Schau hinter die KI',
    'home.hero.subtitle':
      'Wie Sprachmodelle funktionieren – zum Ausprobieren und Selbermachen.',

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

    'home.paths.heading': 'Vom Datensatz zur Antwort',
    'home.path.data.desc':
      'Woraus ein Modell lernt – und wie aus Text, Bild & Ton überhaupt Zahlen werden.',
    'home.path.training.desc':
      'Wie aus rohen Daten ein nützliches Modell wird: vom Vortraining bis zur Belohnung.',
    'home.path.inference.desc':
      'Wie ein fertiges Modell antwortet – Token für Token, mit Notizen und Nachschlagewerk.',

    'home.more.title': 'Was ist überhaupt ein Sprachmodell?',
    'home.more.body':
      'Ein Sprachmodell hat enorme Mengen Text gelesen und dabei gelernt, Muster der Sprache zu erkennen. Im Kern sagt es immer das wahrscheinlichste nächste Wort voraus – nur auf extrem hohem Niveau. Daraus entstehen Antworten, Zusammenfassungen, Übersetzungen und vieles mehr.',

    'nav.home': 'Einführung',
    'nav.glossary': 'Glossar',
    'nav.resources': 'Ressourcen',
    'nav.impressum': 'Impressum',
    'nav.section.data': 'Daten',
    'nav.section.training': 'Training',
    'nav.section.inference': 'Inferenz',
    'nav.section.mlBasics': 'ML-Grundlagen',
    'nav.perceptron': 'Perzeptron',
    'nav.mlp': 'MLP',
    'nav.gradient': 'Gradientenabstieg',
    'nav.backprop': 'Backpropagation',
    'nav.diffusion': 'Diffusion',

    'nav.tokenization': 'Tokenisierung',
    'nav.nextToken': 'Next-Token-Prediction',
    'nav.attention': 'Attention',
    'nav.data': 'Trainingsdaten',
    'nav.training': 'Pretraining',
    'nav.finetuning': 'Finetuning',
    'nav.rlhf': 'RLHF',
    'nav.rag': 'RAG',
    'nav.cot': 'Chain-of-Thought',
    'nav.hallucinations': 'Halluzinationen',
    'nav.rlvr': 'RLVR',
    'nav.agents': 'Agenten',
    'nav.embeddings': 'Embeddings',
    'nav.bias': 'Verzerrung',
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

    // === ML-Grundlagen ===
    // --- Perzeptron ---
    'perceptron.title': 'Das Perzeptron',
    'perceptron.subtitle':
      'Ein einzelnes künstliches Neuron – der kleinste Baustein, aus dem auch Sprachmodelle bestehen. Stell die Gewichte selbst ein oder lass es lernen.',
    'perceptron.caption':
      'Ein Neuron gewichtet seine Eingaben, summiert sie und feuert, sobald die Summe eine Schwelle übersteigt. Genau dieses Rechenstück steckt – millionenfach – in jedem grossen Modell.',
    'perceptron.moreP1':
      'Ein Perzeptron nimmt ein paar Zahlen als Eingabe, multipliziert jede mit einem Gewicht, zählt alles zusammen und gibt 1 aus, wenn die Summe eine Schwelle übersteigt – sonst 0. Das Gewicht sagt, wie wichtig ein Merkmal ist (negativ heisst: es spricht dagegen), die Schwelle, wie leicht das Neuron „ja" sagt.',
    'perceptron.moreP2':
      'Geometrisch zieht es eine gerade Linie durch die Eingaben und sortiert alles links/rechts davon. Beim Lernen verschiebt die Lernregel die Gewichte nach jedem Fehler ein Stück – die Linie schwenkt ein, bis sie (wenn möglich) alle Beispiele richtig trennt. Manche Muster wie XOR lassen sich mit einer einzigen Linie aber nie trennen.',
    'perceptron.moreP3':
      'Genau dieses Neuron – gewichtete Summe, dann eine Schwelle – steht im Next-Letter-Predictor dieser Seite hundertfach nebeneinander, nur mit einer weichen Stufe (tanh) statt der harten. Stapelt man mehrere Schichten davon, entsteht ein neuronales Netz. Der nächste Schritt – mehrere Neuronen, die zusammen auch XOR lösen – ist das MLP.',
    'perceptron.nextLabel': 'Weiter: MLP',

    // --- MLP ---
    'mlp.title': 'Das MLP: XOR lösen',
    'mlp.subtitle':
      'Was ein einzelnes Neuron nicht kann, schafft eine versteckte Schicht aus mehreren: auch XOR lässt sich trennen. Trainier es selbst, probier Datensätze und sieh, wie viele Neuronen die Grenze braucht.',
    'mlp.caption':
      'Zwei Neuronen ziehen je eine Linie, die zweite Schicht kombiniert sie zu einer gekrümmten Grenze. Genau dieser Stapel – gewichtete Summen und Quetschfunktionen, geschichtet und per Backprop gelernt – ist ein neuronales Netz.',
    'mlp.moreP1':
      'Das einzelne Perzeptron zieht genau eine gerade Linie. XOR („genau eines von beidem") lässt sich damit nicht trennen – die richtigen Fälle liegen über Kreuz. Die Lösung: eine versteckte Schicht. Jedes versteckte Neuron ist selbst ein kleines Perzeptron mit eigener Linie; die Ausgabeschicht verrechnet ihre Antworten und kann so Regionen statt nur Halbebenen bilden.',
    'mlp.moreP2':
      'Gelernt wird per Gradientenabstieg: Das Netz vergleicht seine Ausgabe mit dem Ziel und schiebt ALLE Gewichte – auch die der versteckten Schicht – ein Stück in die Richtung, die den Fehler verkleinert. Dieses Rückwärts-Durchreichen des Fehlers heisst Backpropagation. Weil zwei Neuronen mit Zufallsstart manchmal in einer Sackgasse landen, hilft „Neu starten".',
    'mlp.moreP3':
      'Mehr braucht es im Kern nicht: gewichtete Summe, eine Quetschfunktion (hier tanh), in Schichten gestapelt. Der Next-Letter-Predictor auf der Training-Seite ist genau das – nur mit Embedding-Eingaben, einer breiteren versteckten Schicht und einem Softmax über alle Zeichen statt einem einzelnen Sigmoid. Vom XOR-Netz zum Sprachmodell ist es dieselbe Maschine, nur grösser.',
    'mlp.moreP4':
      'Mehr Neuronen sind nicht automatisch besser. Probier den Datensatz „Rauschen": Mit 8 Neuronen trifft das Netz alle Trainingspunkte (gefüllt), patzt aber bei den Testpunkten (hohle Ringe) – es hat das Rauschen auswendig gelernt statt die Regel. Das ist Überanpassung; ein kleineres Netz zieht eine glattere Grenze und generalisiert oft besser. Genau diese Abwägung steckt hinter jedem echten Training. Der Schalter „tanh ↔ ReLU" zeigt nebenbei die heute übliche Aktivierung: ReLU (Knick bei 0) macht die Grenze stückweise gerade statt rund.',
    'mlp.nextLabel': 'Weiter: Wie lernt ein Netz?',

    // --- Wie lernt ein Netz? (Gradientenabstieg) ---
    'gd.title': 'Wie lernt ein Netz?',
    'gd.subtitle':
      'Ein Netz senkt seinen Fehler, indem es die Gewichte verschiebt – aber woher weiss es, in welche Richtung? Die Antwort heisst Gradientenabstieg. Roll den Ball ins Tal und dreh an der Lernrate.',
    'gd.caption':
      'Der Fehler ist eine Landschaft über den Gewichten. Die Steigung (der Gradient) zeigt bergab; ein Schritt geht ein Stück in diese Richtung. Genau diese Suche läuft in jedem Netz – nur in viel mehr Dimensionen.',
    'gd.moreP1':
      'Stell dir den Fehler als Höhe über den Gewichten vor. Bei einem Gewicht ist das eine Kurve, bei zweien eine Landschaft, bei Millionen unvorstellbar – aber das Prinzip bleibt: Die Steigung an deiner Stelle sagt, wo es am steilsten bergauf geht. Das Negative davon zeigt bergab. Ein Schritt dorthin senkt den Fehler ein Stück. Das ist Gradientenabstieg.',
    'gd.moreP2':
      'Die Lernrate ist die Schrittweite. Zu klein, und das Lernen kriecht. Zu gross, und der Schritt überschiesst das Tal – im schlimmsten Fall wächst der Fehler mit jedem Schritt und alles divergiert. Und in einer welligen Landschaft landet man je nach Startpunkt in verschiedenen Tälern: das tiefste ist die beste Lösung (globales Minimum), ein flacheres eine Sackgasse (lokales Minimum).',
    'gd.moreP3':
      'In einem Netz mit vielen Gewichten braucht es einen Trick, um für jedes einzelne die Steigung zu bekommen: Backpropagation reicht den Fehler von der Ausgabe rückwärts durch und gibt jedem Gewicht seinen Anteil. Mehr ist es nicht – derselbe Schritt bergab wie hier, nur für alle Gewichte zugleich. Das ist der Motor unter dem Perzeptron, dem MLP und jedem Sprachmodell.',
    'gd.nextLabel': 'Weiter: Backpropagation',
    'gd.view1d': 'Eine Stellschraube',
    'gd.view2d': 'Zwei Stellschrauben',
    'gd.view1d.hint': 'Ein Gewicht, eine Verlustkurve. Der Ball rollt bergab – die Steigung sagt, wohin.',
    'gd.view2d.hint': 'Zwei Gewichte, eine Landschaft. Verschiedene Starts führen in verschiedene Täler.',
    'gd.play': 'Los',
    'gd.pause': 'Pause',
    'gd.step': 'Ein Schritt',
    'gd.restart': 'Neuer Start',
    'gd.learnRate': 'Lernrate',
    'gd.read.weight': 'Gewicht',
    'gd.read.slope': 'Steigung',
    'gd.read.loss': 'Fehler',
    'gd.read.delta': 'Schritt',
    'gd.read.pos': 'Position',
    'gd.deep': 'tiefes Tal',
    'gd.shallow': 'flaches Tal',
    'gd.2d.clickHint': 'Klick setzt den Startpunkt · „Neuer Start" würfelt einen.',
    'gd.status.diverged.title': 'Divergiert.',
    'gd.status.diverged.body':
      'Die Lernrate ist zu gross – jeder Schritt überschiesst stärker, der Fehler explodiert. Verkleinere die Lernrate oder starte neu.',
    'gd.status.settled1d':
      'Im Minimum: die Steigung ist fast null, bergab geht es nicht mehr. Hier hört das Lernen auf.',
    'gd.status.settledDeep': 'Im tiefen Tal gelandet – dem globalen Minimum, der besten Lösung.',
    'gd.status.settledShallow':
      'Im flachen Tal gelandet – einem lokalen Minimum. Ein anderer Startpunkt hätte tiefer geführt.',
    'gd.status.idle1d': 'Drück „Los" und sieh zu, wie der Ball ins Tal rollt. Dann dreh an der Lernrate.',
    'gd.status.idle2d': 'Drück „Los". Mit „Neuer Start" landest du mal im flachen, mal im tiefen Tal.',
    'gd.cohesion.title': 'Das erklärt zwei Knöpfe von der MLP-Seite',
    'gd.cohesion.lr': 'Der Lernrate-Regler hier ist derselbe wie dort: zu gross überschiesst, zu klein kriecht.',
    'gd.cohesion.restart':
      'Und „Neu starten" würfelt einen neuen Startpunkt – genau wie hier landet das Netz mal im tiefen, mal in einem flachen Tal. Deshalb hilft Neustarten, wenn XOR mit zwei Neuronen klemmt.',
    'gd.cohesion.link': 'zur MLP-Seite',
    // --- Backpropagation (Sandbox) ---
    'bp.title': 'Backpropagation: wie das Netz seine Gewichte anpasst',
    'bp.subtitle':
      'Der Gradientenabstieg braucht für jedes Gewicht eine Steigung. Backpropagation rechnet sie aus – hier mit sichtbaren Gewichten und echten Zahlen. Verstell Eingabe, Ziel und Lernrate und sieh dem Netz beim Lernen zu.',
    'bp.caption':
      'Vorwärts rechnet das Netz seine Antwort, der Fehler zeigt, wie falsch sie ist, und rückwärts bekommt über die Kettenregel jedes Gewicht seinen Gradienten – seine Schuld am Fehler. Ein Schritt bergab passt alle Gewichte zugleich an.',
    'bp.moreP1':
      'Backpropagation ist nur die Kettenregel, sauber organisiert. Der Fehler an der Ausgabe wird Schicht für Schicht rückwärts durchgereicht; an jeder Kante multipliziert man mit dem lokalen Beitrag. So bekommt jedes Gewicht – auch tief im Netz – seinen eigenen Gradienten, ohne dass man Millionen Ableitungen von Hand bildet.',
    'bp.moreP2':
      'Der Gradient eines Gewichts sagt: Wenn ich es ein bisschen erhöhe, wie ändert sich der Fehler? Vorzeichen = Richtung, Betrag = Hebelwirkung – genau das, was der Gradientenabstieg braucht. Bei Sigmoid mit Kreuzentropie ist der Fehler y − Ziel schon die Steigung an der Ausgabe, der Startpunkt der Rückwärtsrechnung.',
    'bp.moreP3':
      'Dieses 2-2-1-Netz lernt sein eines Beispiel in wenigen Schritten. Genau dieselbe Maschinerie trainiert ein Sprachmodell – nur mit Milliarden Gewichten, vielen Schichten und Millionen Beispielen statt einem. Vorwärts rechnen, Fehler messen, rückwärts die Gradienten holen, einen kleinen Schritt machen, wiederholen.',
    'bp.nextLabel': 'Ausblick: Diffusion',
    'bp.aria': 'Netz 2-2-1 mit Gewichten',
    'bp.phase.forward': 'Vorwärts',
    'bp.phase.error': 'Fehler',
    'bp.phase.backward': 'Rückwärts',
    'bp.phase.update': 'Anpassen',
    'bp.read.iter': 'Schritte',
    'bp.read.error': 'Fehler',
    'bp.read.target': 'Ziel',
    'bp.apply': 'Schritt anwenden',
    'bp.apply10': '10 Schritte',
    'bp.newWeights': 'Neue Gewichte',
    'bp.reset': 'Zurücksetzen',
    'bp.input': 'Eingabe',
    'bp.learnRate': 'Lernrate',
    'bp.target': 'Ziel',
    'bp.hint':
      'Klick auf eine Kante zeigt die Herleitung dieses Gewichts. „Schritt anwenden" verändert die Gewichte wirklich – wiederhol es und sieh, wie y Richtung Ziel wandert und der Fehler schrumpft.',
    'bp.focus.title': 'Gewicht',
    'bp.focus.back': '← alle',
    'bp.focus.weight': 'Aktueller Wert',
    'bp.focus.contrib': 'Beitrag vorwärts',
    'bp.focus.grad': 'Gradient (Schuld am Fehler)',
    'bp.focus.update': 'Nach dem Schritt',
    'bp.focus.note':
      'Vorzeichen des Gradienten = Richtung, Betrag = wie stark dieses Gewicht den Fehler beeinflusst. Der Schritt verschiebt es gegen den Gradienten.',
    'bp.m.fwTitle': 'Vorwärts: was sagt das Netz?',
    'bp.m.fwNote':
      'Jedes Neuron bildet die gewichtete Summe seiner Eingaben und quetscht sie (tanh bzw. σ). Alle Zahlen stammen aus den Gewichten im Diagramm.',
    'bp.m.errTitle': 'Fehler messen',
    'bp.m.errNote':
      'Wie weit liegt die Ausgabe vom Ziel? Bei Sigmoid + Kreuzentropie ist dieser Fehler direkt die Steigung an der Ausgabe – der Start fürs Rückwärtsrechnen.',
    'bp.m.bwTitle': 'Rückwärts: Gradient je Gewicht',
    'bp.m.bwNote':
      'Kettenregel: Der Fehler fliesst rückwärts. Erst die Ausgabe-Gewichte (e·h), dann die Schuld δ an jedem versteckten Neuron, dann dessen Eingangs-Gewichte (δ·x).',
    'bp.m.upTitle': 'Anpassen: ein Schritt bergab',
    'bp.m.upNote':
      'Jedes Gewicht: neu = alt − Lernrate·Gradient. Drück „Schritt anwenden", um es auszuführen.',

    // --- Diffusion (generativer Ausblick) ---
    'df.title': 'Diffusion: wie aus Zufall eine Form wird',
    'df.subtitle':
      'Bildgeneratoren starten mit reinem Rauschen und entrauschen es Schritt für Schritt, bis ein Bild dasteht. Hier in 2D zum Mitmachen: eine Form verrauschen, einem winzigen Netz das Entrauschen beibringen, dann aus Zufall eine neue Form wachsen lassen.',
    'df.caption':
      'Das Netz hier lernt wirklich im Browser, das zugefügte Rauschen vorherzusagen – dieselbe Idee wie bei Stable Diffusion oder Midjourney, nur mit Punkten in der Ebene statt Millionen Pixeln.',
    'df.moreP1':
      'Diffusion dreht ein einfaches Vorwärts-Rezept um. Vorwärts ist leicht: Nimm eine Form und kipp Schritt für Schritt etwas Gauss-Rauschen dazu, bis nur noch Zufall übrig ist. Für jeden Zwischenschritt ist genau bekannt, wie viel Rauschen dazukam – und das wird zur Lernaufgabe.',
    'df.moreP2':
      'Das Netz bekommt einen verrauschten Punkt und das Rausch-Level t und sagt voraus: Welches Rauschen steckt hier drin? Zieht man dieses vorhergesagte Rauschen ab, kommt man dem Original ein Stück näher. Generieren heisst dann: bei reinem Zufall anfangen und diesen Schritt viele Male wiederholen – das Modell schiebt die Punkte Stück für Stück dorthin, wo die gelernte Form liegt.',
    'df.moreP3':
      'Echte Bildmodelle machen dasselbe, nur mit Bildern statt Punkten: Eingabe und Ausgabe sind ganze Bilder, das Netz ist riesig (oft ein U-Net oder Transformer), und ein Textprompt lenkt, wohin entrauscht wird. Die Temperatur regelt die Streuung – tief bleibt nah an den gelernten Formen, hoch bringt mehr Vielfalt. Das Grundprinzip bleibt: Rauschen vorhersagen, abziehen, wiederholen.',
    'df.nextLabel': 'Zum echten Mini-Modell',
    'df.shape.spiral': 'Spirale',
    'df.shape.moons': 'Zwei Monde',
    'df.shape.circle': 'Kreis',
    'df.shape.heart': 'Herz',
    'df.shapeHint': 'Die Zielform, die das Modell lernen soll.',
    'df.phase.noise': 'Verrauschen',
    'df.phase.train': 'Lernen',
    'df.phase.gen': 'Generieren',
    'df.pause': 'Pause',
    'df.noise.level': 'Rausch-Stufe',
    'df.noise.signal': 'Signal',
    'df.noise.noise': 'Rauschen',
    'df.noise.t0': 'Stufe 0: die reine Zielform. Schieb den Regler nach rechts und sieh zu, wie sie zerfällt.',
    'df.noise.tT': 'Volle Stufe: nur noch Zufall – eine Gauss-Wolke, kein Muster mehr. Genau hier startet später das Generieren.',
    'df.noise.mid': 'Teils Form, teils Rauschen. Für jede Stufe ist bekannt, wie viel Rauschen dazukam – das ist die Lernaufgabe.',
    'df.train.sample': 'Probe',
    'df.train.field': 'Entrausch-Feld',
    'df.train.steps': 'Schritte',
    'df.train.loss': 'Fehler',
    'df.train.lossCurve': 'Fehler (Rauschen vorhersagen)',
    'df.train.start': 'Training starten',
    'df.train.resume': 'Weiter trainieren',
    'df.speed.slow': 'Zeitlupe',
    'df.speed.normal': 'Normal',
    'df.speed.turbo': 'Turbo',
    'df.train.toGen': 'Generieren',
    'df.train.needMore': 'Trainiere noch etwas, bis die Probe Form annimmt.',
    'df.train.idle':
      'Drück „Training starten". Anfangs ist die Probe pures Rauschen – beobachte, wie sie sich mit jedem Schritt ordnet.',
    'df.train.emerge':
      'Die Probe wird aus Zufall erzeugt – mit dem aktuellen Stand des Netzes. Je besser es das Rauschen vorhersagt, desto klarer die Form.',
    'df.train.fieldHint':
      'Pfeile zeigen, wohin das Netz einen verrauschten Punkt schiebt (das vorhergesagte Rauschen, abgezogen). Mit dem Training richten sie sich Richtung Zielform aus.',
    'df.gen.temp': 'Temperatur',
    'df.gen.start': 'Generieren',
    'df.gen.again': 'Nochmal',
    'df.gen.untrained': 'Das Netz ist noch kaum trainiert – aus Zufall wird hier noch keine Form. Geh zurück zu „Lernen".',
    'df.gen.idle': 'Start bei reinem Rauschen. Schritt für Schritt zieht das Modell das vorhergesagte Rauschen ab – die Form taucht auf.',
    'df.gen.running': 'Entrauschen läuft … jeder Schritt eine Rausch-Stufe tiefer.',
    'df.gen.done': 'Fertig: aus Zufall ist die gelernte Form geworden. Mit der Temperatur steuerst du Streuung gegen Schärfe.',

    // --- Perzeptron-Labor (Viz) ---
    'pp.spam.name': 'Spam-Wächter',
    'pp.spam.feat0': 'Reizwort?',
    'pp.spam.feat1': 'Absender bekannt?',
    'pp.spam.v00': 'kein Reizwort',
    'pp.spam.v01': '„gratis/gewonnen"',
    'pp.spam.v10': 'fremd',
    'pp.spam.v11': 'im Adressbuch',
    'pp.spam.class0': 'Echt',
    'pp.spam.class1': 'Spam',
    'pp.spam.blurb':
      'Echte Spamfilter rechnen genau so: verdächtige Signale aufaddieren, ab einer Schwelle „Müll". Stell die Gewichte ein – ein Reizwort spricht für Spam, ein bekannter Absender dagegen (negatives Gewicht).',
    'pp.letters.name': 'Buchstaben-Wette',
    'pp.letters.feat0': 'vorletzter Buchstabe',
    'pp.letters.feat1': 'letzter Buchstabe',
    'pp.letters.v00': 'Konsonant',
    'pp.letters.v01': 'Vokal',
    'pp.letters.v10': 'Konsonant',
    'pp.letters.v11': 'Vokal',
    'pp.letters.class0': 'Konsonant folgt',
    'pp.letters.class1': 'Vokal folgt',
    'pp.letters.blurb':
      'Dieselbe Aufgabe wie der Next-Letter-Predictor dieser Seite, auf ein Neuron eingedampft: aus den letzten zwei Buchstaben raten, ob ein Vokal folgt. Genau dieses Atom steht im echten Modell hundertfach nebeneinander.',
    'pp.movie.name': 'Filmgeschmack',
    'pp.movie.feat0': 'Action?',
    'pp.movie.feat1': 'Comedy?',
    'pp.movie.v00': 'kein Action',
    'pp.movie.v01': 'Action',
    'pp.movie.v10': 'keine Comedy',
    'pp.movie.v11': 'Comedy',
    'pp.movie.class0': 'mag ich nicht',
    'pp.movie.class1': 'mag ich',
    'pp.movie.blurb':
      'Geschmack: reine Action mag ich, reine Comedy mag ich – die Mischung („Action-Komödie") nicht, und etwas ganz ohne beides auch nicht. Versuch, dafür eine Trennlinie zu finden …',
    'pp.jogging.name': 'Joggen?',
    'pp.jogging.feat0': 'trocken?',
    'pp.jogging.feat1': 'Zeit?',
    'pp.jogging.v00': 'Regen',
    'pp.jogging.v01': 'trocken',
    'pp.jogging.v10': 'keine Zeit',
    'pp.jogging.v11': 'Zeit',
    'pp.jogging.class0': 'bleibe daheim',
    'pp.jogging.class1': 'gehe joggen',
    'pp.jogging.blurb':
      'Ein „feuerndes Neuron" als Alltags-Entscheidung: gute Gründe sammeln sich auf, ab einem Punkt kippt es zu „ja". Wie wichtig ist dir jeder Grund (Gewicht), und wie leicht lässt du dich überzeugen (Schwelle)?',
    'pp.and.name': 'UND',
    'pp.and.blurb': 'UND: nur wahr, wenn beide Eingaben 1 sind. Eine gerade Linie schafft das.',
    'pp.or.name': 'ODER',
    'pp.or.blurb': 'ODER: wahr, sobald mindestens eine Eingabe 1 ist. Auch das trennt eine Linie.',
    'pp.xor.name': 'XOR',
    'pp.xor.blurb':
      'XOR: wahr, wenn genau eine Eingabe 1 ist. Keine einzige gerade Linie trennt diese vier Punkte – das ist die Wand, an der ein einzelnes Perzeptron scheitert.',
    'pp.points.name': 'Punkte',
    'pp.points.feat0': 'Merkmal 1',
    'pp.points.feat1': 'Merkmal 2',
    'pp.points.class0': 'Klasse A',
    'pp.points.class1': 'Klasse B',
    'pp.points.blurb':
      'Setz eigene Punkte ins Feld und lass das Neuron eine Trennlinie finden. Liegen die Farben sauber getrennt, klappt es – verschränkst du sie (wie XOR), pendelt die Linie ewig.',

    'pl.group.everyday': 'Alltag',
    'pl.group.logic': 'Logik',
    'pl.group.custom': 'Eigene',
    'pl.neuron.title': 'Das Neuron',
    'pl.neuron.descPoints': 'Mit den gelernten Gewichten – am gewählten Punkt vorgerechnet.',
    'pl.neuron.descPick': 'Klick rechts einen Fall an – das Neuron rechnet ihn hier vor.',
    'pl.neuron.explainHint': 'Klick aufs Neuron (?) erklärt Σ und θ.',
    'pl.neuron.empty': 'Setz rechts ein paar Punkte ins Feld.',
    'pl.surface.title': 'Entscheidungsfläche',
    'pl.correct': 'richtig',
    'pl.weights': 'Gewichte',
    'pl.weights.hint': 'Wie stark ein Merkmal zählt (negativ = spricht dagegen).',
    'pl.threshold': 'Schwelle',
    'pl.threshold.hint':
      'Wie leicht das Neuron „ja" sagt: Es feuert erst, wenn die gewichtete Summe θ übersteigt.',
    'pl.train': 'Trainieren',
    'pl.pause': 'Pause',
    'pl.correctBtn': 'Korrigieren',
    'pl.check': 'Prüfen',
    'pl.steps': 'Lernschritte',
    'pl.sep.title': 'Getrennt. ',
    'pl.sep.body':
      'Eine gerade Linie teilt alle Fälle korrekt – das Neuron klassifiziert jeden Punkt richtig.',
    'pl.stuck.title': 'Keine Linie trennt das. ',
    'pl.stuck.body1':
      'So sehr das Neuron auch nachjustiert – die Trennlinie pendelt und kommt nie zur Ruhe. Manche Muster (wie XOR) kann ein ',
    'pl.stuck.em': 'einzelnes',
    'pl.stuck.body2':
      ' Perzeptron grundsätzlich nicht trennen. Dafür braucht es mehrere übereinander – das ist der Schritt zum MLP.',
    'pl.check.title': 'Geprüft – Fehler. ',
    'pl.check.atPoint': 'Beim Punkt',
    'pl.check.atCase': 'Beim Fall',
    'pl.check.computes': 'berechnet das Neuron',
    'pl.check.shouldBe': '– richtig wäre aber',
    'pl.check.hintPre': 'Drück',
    'pl.check.hintCorrect': '„Korrigieren"',
    'pl.check.hintPost':
      ', um die Gewichte einen kleinen Schritt Richtung richtige Antwort zu schieben.',
    'pl.step.title': 'Korrigiert. ',
    'pl.step.tooLow': 'zu niedrig',
    'pl.step.tooHigh': 'zu hoch',
    'pl.step.up': 'nach oben',
    'pl.step.down': 'nach unten',
    'pl.step.body1': 'Das Neuron hat ',
    'pl.step.body2a': ' gerechnet – also gehen die Gewichte der aktiven Merkmale (Wert 1) ',
    'pl.step.body2b': ' und die Schwelle ',
    'pl.step.body2c': ':',
    'pl.calc.threshold': '(Schwelle)',
    'pl.calc.fires': 'feuert',
    'pl.calc.quiet': 'ruht',
    'pl.legend.wrong': 'falsch eingeordnet',
    'pl.legend.editHint':
      'Klick ins Feld setzt einen Punkt · Klick auf einen Punkt entfernt ihn.',
    'pl.points.set': 'Setzen:',
    'pl.points.example': 'Beispiel:',
    'pl.points.separable': 'trennbar',
    'pl.points.entangled': 'verschränkt',
    'pl.points.clear': 'leeren',
    'pl.aria.neuron': 'Neuron',

    // --- MLP-Labor (Viz) ---
    'ml.net.title': 'Das Netz',
    'ml.net.desc': 'versteckte Neuronen ziehen je eine Linie – die Ausgabe kombiniert sie.',
    'ml.net.explainHint':
      'Klick auf ein Neuron erklärt seine Funktion: tanh (versteckt) bzw. σ (Ausgabe).',
    'ml.showLines': 'Linien der Neuronen',
    'ml.data': 'Daten',
    'ml.circle': 'Kreis',
    'ml.noisy': 'Rauschen',
    'ml.activation': 'Aktivierung',
    'ml.set': 'Setzen',
    'ml.hiddenNeurons': 'versteckte Neuronen',
    'ml.learnRate': 'Lernrate',
    'ml.restart': 'Neu starten',
    'ml.epochs': 'Epochen',
    'ml.error': 'Fehler',
    // Überanpassung (Train vs. Test)
    'ml.acc.train': 'Training',
    'ml.acc.test': 'Test',
    'ml.overfit.title': 'Überanpassung.',
    'ml.overfit.body':
      'Das Netz trifft {train} der Trainingspunkte, aber nur {test} der ungesehenen Testpunkte (hohle Ringe). Es hat den Trainingssatz samt der falsch gelabelten Ausreisser praktisch auswendig gelernt – die Grenze zappelt um einzelne Punkte. Weniger versteckte Neuronen erzwingen eine glattere Grenze, die auf neue Daten besser passt.',
    'ml.generalizes.title': 'Generalisiert.',
    'ml.generalizes.body':
      'Training {train}, Test {test} – die gelernte Grenze passt auch auf neue, nie gesehene Punkte. Bei sauberen Daten gelingt das selbst einem grossen Netz.',
    'ml.fit.hint':
      'Beobachte beim Trainieren beide Zahlen. Auf dem verrauschten Satz treibt mehr Neuronen (8) die Trainings-Genauigkeit Richtung 100 %, während die Test-Genauigkeit zurückbleibt – das ist Überanpassung. Weniger Neuronen (3) halten beide näher beieinander.',
    'ml.sep.body':
      'Mehrere Linien, von der zweiten Schicht kombiniert, schneiden die Fläche so zu, dass alle Punkte stimmen – etwas, das eine ',
    'ml.sep.em': 'einzelne',
    'ml.sep.body2':
      ' Linie nicht schafft. Genau dieser Stapel aus gewichteten Summen und Quetschfunktionen ist ein neuronales Netz.',
    'ml.hint.pre': 'Drück ',
    'ml.hint.train': 'Trainieren',
    'ml.hint.mid':
      ' und sieh zu, wie die gekrümmte Grenze entsteht. Klemmt es bei einem schwierigen Muster (z. B. Kreis), gib dem Netz ',
    'ml.hint.more': 'mehr Neuronen',
    'ml.hint.mid2': ' – oder probier mit ',
    'ml.hint.restart': 'Neu starten',
    'ml.hint.post': ' einen anderen Zufallsstart.',
    'ml.diagram.input': 'Eingabe',
    'ml.diagram.hidden': 'versteckt',
    'ml.diagram.output': 'Ausgabe',
    'ml.aria.net': 'Netz',

    // --- Aktivierungs-Erklärkarte (Viz) ---
    'act.sum.title': 'Σ > θ — gewichtete Summe trifft Schwelle',
    'act.sum.body':
      'Das Neuron multipliziert jede Eingabe mit ihrem Gewicht und addiert alles zur gewichteten Summe Σ. Diese vergleicht es mit der Schwelle θ: liegt Σ darüber, feuert es (Ausgabe 1), sonst ruht es (0). Das ist die harte Stufenfunktion rechts – ein Schalter ohne Zwischentöne.',
    'act.sum.x': 'Σ − θ',
    'act.tanh.title': 'tanh — die weiche Stufe',
    'act.tanh.body':
      'Auch ein verstecktes Neuron bildet eine gewichtete Summe – quetscht sie aber mit tanh sanft auf einen Wert zwischen −1 und +1, statt hart umzuschalten. Diese Kurve hat überall eine Steigung; nur deshalb kann das Netz per kleinen Schritten lernen (Gradientenabstieg). Eine harte Stufe wäre flach – kein Hinweis, wohin nachjustieren.',
    'act.tanh.x': 'gewichtete Summe',
    'act.sigmoid.title': 'Σ → σ — Summe, dann Wahrscheinlichkeit',
    'act.sigmoid.body':
      'Die Ausgabe bildet wieder eine gewichtete Summe der versteckten Werte und quetscht sie mit der Sigmoid-Funktion σ auf 0…1. Das liest sich als Wahrscheinlichkeit: nahe 1 heisst „sicher Klasse B", nahe 0 „sicher Klasse A", 0,5 ist die Grenze.',
    'act.sigmoid.x': 'gewichtete Summe',
    'act.relu.title': 'ReLU — der Knick bei 0',
    'act.relu.body':
      'ReLU lässt positive Werte unverändert durch und setzt alles Negative auf 0 – ein Knick statt einer weichen Kurve. Sie hat keine flachen Sättigungsenden wie tanh, darum bleiben die Gradienten kräftig und tiefe Netze lernen schneller; deshalb ist ReLU heute der Standard. Im Labor macht sie die Entscheidungsgrenze stückweise gerade, also eckig statt rund. Auf diesem winzigen Netz kann ein Neuron aber „absterben" (immer 0) – dann hilft „Neu starten".',
    'act.relu.x': 'gewichtete Summe',
    'act.close': 'Schliessen',
    'act.aria.plot': 'Aktivierungsfunktion',

    // === KI im Einsatz (Thread 8) ===
    // --- Lokal vs. Cloud ---
    'localVsCloud.title': 'Lokal vs. Cloud: Wo arbeitet die KI?',
    'localVsCloud.subtitle':
      'Dieselbe Anfrage, drei Wege – und drei sehr unterschiedliche Antworten auf die Frage, was dein Gerät verlässt.',
    'localVsCloud.caption':
      'Eine Anfrage, drei Wege – wir markieren die sensiblen Stellen und zeigen, was bei jedem Weg beim Anbieter ankommt.',
    'localVsCloud.moreP1':
      'Lokal heisst: Das Modell läuft direkt auf deinem Gerät (z. B. mit Ollama). Deine Eingabe verlässt den Rechner nicht – ideal für den Datenschutz, aber begrenzt durch deine Hardware.',
    'localVsCloud.moreP2':
      'Über eine Cloud-API schickst du deinen Text an einen Anbieter (OpenAI, Google, Anthropic …). Du bekommst die stärksten Modelle, aber dein Originaltext – inklusive Namen, Noten, Gesundheitsangaben – landet auf fremden Servern.',
    'localVsCloud.moreP3':
      'Ein Wrapper ist ein Zwischendienst, der heikle Stellen anonymisiert, bevor er die Anfrage weiterleitet – oft mit Servern in der Schweiz oder EU. Schweizer Beispiele sind die „Private AI" von Safe Swiss Cloud oder das offene Schweizer Modell Apertus. Der Anbieter sieht dann nur Platzhalter; dem Wrapper selbst musst du aber vertrauen, denn er sieht das Original.',
    'localVsCloud.nextLabel': 'Weiter: Hardware-Check',

    // --- Kosten ---
    'costs.title': 'Was kostet die KI?',
    'costs.subtitle':
      'Lokal zahlst du einmal für Hardware, in der Cloud pro Token. Gib einen Text ein und sieh, was eine Anfrage wirklich kostet.',
    'costs.caption':
      'Gezählt mit demselben Tokenizer wie bei der Tokenisierung, hochgerechnet mit den Listenpreisen vom Juni 2026.',
    'costs.moreP1':
      'Lokal sind die Hauptkosten einmalig – ein leistungsfähiger Rechner oder eine gute Grafikkarte. Danach zahlst du fast nur den Strom; die Software zum Ausführen (z. B. Ollama) ist gratis.',
    'costs.moreP2':
      'In der Cloud zahlst du pro Token – die kleinen Texteinheiten, aus denen Anfrage und Antwort bestehen. Die Antwort-Tokens (Output) kosten meist deutlich mehr als die Anfrage-Tokens (Input). Günstige Modelle liegen bei wenigen Rappen pro Million Tokens, Spitzenmodelle deutlich höher.',
    'costs.moreP3':
      'Drei Spar-Hebel: das passende (nicht das teuerste) Modell wählen; bei langen Chats wächst der Verlauf und wird jedes Mal mitgeschickt – das treibt die Kosten; und „Cached Input" macht wiederholten Kontext oft rund zehnmal günstiger. Daneben gibt es Abos (ChatGPT Plus/Pro, Claude Pro, Gemini-Pläne) mit fixer Monatsgebühr und Wrapper-Dienste mit eigenem Aufschlag.',
    'costs.nextLabel': 'Weiter: Datenschutz',

    // --- Hardware-Check ---
    'hardware.title': 'Braucht KI einen Supercomputer?',
    'hardware.subtitle':
      'Manche Modelle laufen auf dem Laptop, andere nur im Rechenzentrum. Stell dein Gerät ein und sieh, was lokal möglich ist.',
    'hardware.caption':
      'Speicher-Mathematik: Parameter mal Bytes pro Gewicht. Eine Veranschaulichung, keine Garantie für dein genaues System.',
    'hardware.moreP1':
      'Ein Modell muss in den schnellen Speicher passen – den Arbeitsspeicher (RAM) oder besser den Grafikspeicher (VRAM). Faustformel: Milliarden Parameter × Bytes pro Gewicht. Bei „Q4" sind das etwa 0.6 GB pro Milliarde, ein 8B-Modell braucht also rund 5 GB.',
    'hardware.moreP2':
      'Quantisierung verkleinert die Zahlen im Modell: von F16 (volle Präzision) über Q8 (fast verlustfrei) zu Q4 (Standard fürs lokale Laufen). Von Q8 auf Q4 spart rund 40 % Speicher bei nur etwa 2 % Qualitätsverlust – darum ist Q4 der Standard.',
    'hardware.moreP3':
      'Apple-Geräte teilen sich einen Speicher zwischen Prozessor und Grafik (Unified Memory) – praktisch für grosse Modelle. Zum Ausführen brauchst du ein Programm: Ollama (am einfachsten), LM Studio (mit Oberfläche) oder llama.cpp (für Feinabstimmung). Wichtig: Modell plus Chatverlauf sollten unter rund 80 % des Speichers bleiben, sonst wird es sehr langsam.',
    'hardware.nextLabel': 'Weiter: Kosten',

    // --- Modell-Typen / Multimodal ---
    'multimodal.title': 'Wie ein Sprachmodell ein Bild liest',
    'multimodal.subtitle':
      'Ein Sprachmodell verarbeitet eine Reihe: ein Stück nach dem anderen. Ein Bild ist aber eine Fläche. Sieh, wie aus der Fläche eine Reihe wird, die dasselbe Modell lesen kann.',
    'multimodal.caption':
      'Jede Kachel und ihre Reihenfolge sind aus dem Bild berechnet. Genau diese Verwandlung – von der Fläche in eine Reihe – macht ein Modell, bevor es ein Bild „lesen" kann.',
    'multimodal.moreP1':
      'Multimodal heisst: Ein Modell verarbeitet nicht nur Text, sondern auch Bilder, Ton, teils Video. Bekannte Beispiele sind GPT-5, Gemini und Claude. Auch offene Modelle, die lokal laufen, können sehen: Gemma 3 (ab 4B) versteht Bilder, Qwen3-VL und Qwen3-Omni sogar Bild, Ton und Video.',
    'multimodal.moreP2':
      'Der Kern ist immer gleich: Ein eigener „Encoder" zerlegt das Bild in Kacheln und übersetzt jede in dieselbe Zahlensprache wie die Text-Tokens – einen Vektor im selben Bedeutungsraum (siehe Embeddings). Darum muss das Modell nicht umlernen: Eine Bild-Kachel ist für es bloss ein weiteres Stück in der Reihe, das es wie ein Wort behandelt.',
    'multimodal.moreP3':
      'Ton wird zuerst in ein Spektrogramm verwandelt – ein „Bild des Klangs" – und dann wie ein Bild zerlegt; Video ist einfach eine Folge von Bildern. So wird am Ende alles zur selben Reihe von Vektoren. „Sehen" und „Hören" sind für ein Sprachmodell also kein zweiter Sinn, sondern derselbe Mechanismus mit anderem Futter.',
    'multimodal.nextLabel': 'Weiter: Pretraining',

    // --- Datenschutz ---
    'privacy.title': 'Was teilst du mit der KI?',
    'privacy.subtitle':
      'Eine harmlose Anfrage enthält schnell Schützenswertes. Tippe eine Nachricht und sieh, was darin steckt – und worauf du dann achten musst.',
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
      'Fertig nutzbar (Login oder App, sofort startklar) oder selbst installieren (lokal – mehr Kontrolle, etwas Aufwand).',
    'privacy.rule':
      'Faustregel: Schützenswerte Daten → lokal oder ein geprüftes Schul-Tool. Harmlose, allgemeine Aufgaben → jede Cloud-KI ist ok.',
    'privacy.moreP1':
      'Wo läuft die KI? Auf deinem Gerät bleibt deine Eingabe bei dir (offline möglich, aber durch die Hardware begrenzt). In der Cloud bekommst du die stärksten Modelle, aber deine Eingabe geht an den Anbieter – oft auf Server im Ausland.',
    'privacy.moreP2':
      'Im Schulkontext ist die Schule die verantwortliche Stelle, der Anbieter nur Auftragsbearbeiter – dafür braucht es einen Vertrag. Für öffentliche Schulen gilt das kantonale Datenschutzrecht. Heikel ist vor allem das Training: Nutzt ein Anbieter deine Eingaben, um seine Modelle zu verbessern, ist das meist nicht erlaubt – Gratis-Dienste tun es oft, bezahlte und Edu-Angebote in der Regel nicht.',
    'privacy.moreP3':
      'Bei besonders schützenswerten Daten (Gesundheit, Förderbedarf) braucht es zudem eine Datenschutz-Folgenabschätzung und eine klare Rechtsgrundlage. Im Zweifel: so wenig Personenbezug wie möglich teilen – oft reicht die Aufgabe ohne echte Namen.',
    'privacy.sourceLabel': 'Quelle und Vertiefung:',

    // --- Werkzeugwahl ---
    'toolChoice.title': 'Welches KI-Werkzeug passt?',
    'toolChoice.subtitle':
      'Hardware, Kosten, Datenschutz – hier läuft alles zusammen. Beantworte drei Fragen und erhalte eine Empfehlung.',
    'toolChoice.caption':
      'Eine Orientierungshilfe, die die vorherigen Kapitel bündelt – keine allgemeingültige Vorschrift.',
    'toolChoice.moreP1':
      'Es gibt nicht das eine beste Werkzeug – es kommt auf deine Prioritäten an. Geht es um sensible Daten oder maximale Kontrolle, ist ein lokales Modell meist die Antwort. Zählt höchste Qualität und sind die Daten unkritisch, sind die grossen Cloud-Modelle stark.',
    'toolChoice.moreP2':
      'Dazwischen liegt der Wrapper: starke Cloud-Modelle, aber mit Anonymisierung und Servern in der Schweiz/EU – ein guter Kompromiss, wenn beides zählt. Und für den schnellen Alltag ohne heikle Daten genügt oft ein Abo.',
    'toolChoice.moreP3':
      'Die Faustregeln aus den letzten Kapiteln: lokal = privat, gratis, aber hardware-begrenzt; Cloud = stärkste Modelle, aber die Daten verlassen das Gerät und kosten pro Token; Wrapper = Mittelweg. Im Zweifel: so lokal und so anonym wie möglich.',
    'toolChoice.nextLabel': 'Zur Übersicht',

    // --- Next-Token-Prediction ---
    'nextToken.title': 'Next-Token-Prediction',
    'nextToken.subtitle':
      'Ist das Training vorbei, macht ein Sprachmodell bei jeder Antwort im Kern nur eines: Es sagt das nächste Token voraus – wieder und wieder, Token für Token.',
    'nextToken.placeholder': 'Gib den Anfang eines Satzes ein …',
    'nextToken.seed': 'Gelb ist eine',
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
      'Die Wahrscheinlichkeiten kommen von einem Sprachmodell. Wähle einen Token, um den Satz Schritt für Schritt weiterzuschreiben – oder überlass die Wahl dem Zufall.',
    'nextToken.emptyTitle':
      'Klicke auf „Nächsten Token vorhersagen", um die Wahrscheinlichkeiten zu sehen.',
    'nextToken.emptyBody':
      'Danach kannst du einzelne Tokens auswählen und beobachten, wie das Modell Schritt für Schritt Text erzeugt.',
    'nextToken.moreP1':
      'Das Herzstück jedes Sprachmodells ist eine einzige Fähigkeit: Für jedes mögliche nächste Token berechnet es eine Wahrscheinlichkeit. Zur Wahl stehen über 50 000 Tokens – aber nur eine Handvoll ist wirklich wahrscheinlich, der Rest liegt nahe null.',
    'nextToken.moreP2':
      'Einen ganzen Text erzeugt das Modell durch Wiederholung: Token anhängen, neu rechnen, nächstes Token wählen. So entsteht Wort für Wort ein ganzer Satz.',
    'nextToken.moreP3':
      'Die Temperatur steuert, wie „mutig" gewählt wird. Niedrig: Das Modell nimmt fast immer das wahrscheinlichste Token – verlässlich, aber vorhersehbar. Hoch: Die Verteilung wird flacher, auch unwahrscheinlichere Tokens kommen zum Zug – der Text wird kreativer und unberechenbarer.',
    'nextToken.nextLabel': 'Weiter: Attention',

    // --- Attention ---
    'attention.title': 'Attention: Worauf das Modell schaut',
    'attention.subtitle':
      'Damit ein Wort seinen Satz versteht, lässt das Modell jede Position über die bisherigen Wörter zurückschauen und gewichtet, was gerade zählt – worauf sich ein Wort wie „es" bezieht, welche Wörter zusammengehören, was als Nächstes folgt. Dieses Zurückschauen ist die Attention – das Herzstück des Transformers.',
    'attention.caption':
      'Die Gewichte stammen aus einem deutschen Sprachmodell. Tippe ein Wort an und wechsle die Aufgabe, um zu sehen, worauf das Modell jeweils zurückschaut.',
    'attention.mechTitle': 'Mehr Einblicke – wie die Gewichte entstehen',
    'attention.mechIntro':
      'Woher kommen diese Gewichte? Jede Position stellt eine Anfrage (Query), jedes Wort hält einen Schlüssel (Key). Ihr Skalarprodukt ergibt die Relevanz, Softmax macht daraus Gewichte, und die Ausgabe ist die gewichtete Mischung der Werte (Values). Die Punkte sind die Schlüsselwörter des oben gewählten Satzes – du spielst die Anfrage: zieh sie und sieh zu:',
    'attention.moreP1':
      'Bisher hatte jedes Wort einen festen Vektor (siehe Embeddings). Attention macht daraus einen kontextabhängigen: Jede Position sammelt aus den früheren Wörtern das ein, was zu ihr passt – „es" wird so zu „es im Sinne von Kind". Erst dadurch trägt ein Wort die Bedeutung seines ganzen Satzes.',
    'attention.moreP2':
      'Solche Zurückschau-Aufgaben – in der Fachsprache „Köpfe" – laufen im Modell vielfach parallel, und jede achtet auf etwas anderes: eine auf den Zusammenhang, eine auf die Reihenfolge. Über viele Schichten gestapelt entsteht so Schritt für Schritt ein immer reicheres Verständnis des Satzes.',
    'attention.moreP3':
      'Die Query-, Key- und Value-Projektionen sind nicht eingebaut, sondern gelernt – im selben Training, das die Trainings-Seite zeigt. Und dieses Zurückschauen passiert an jeder Position, auch an der letzten: Genau dort entsteht die nächste Vorhersage.',
    'attention.nextLabel': 'Weiter: Chain-of-Thought',
    // Viz-interne Strings (zwei Sichten, Hinweise, Mechanik-Spielzeug) – DE+EN
    'attention.viz.lensIntro':
      'Dasselbe Zurückschauen erfüllt verschiedene Aufgaben – sieh dir zwei davon an:',
    'attention.viz.head.relation': 'Zusammenhang',
    'attention.viz.head.prev': 'Reihenfolge',
    'attention.viz.hint.relation':
      'Hier verbindet das Modell ein Wort mit dem früheren Wort, das dazugehört. Tippe ein Wort an und sieh, worauf es zurückschaut.',
    'attention.viz.hint.prev':
      'Hier schaut fast jedes Wort auf das Wort direkt davor – so behält das Modell die Reihenfolge im Blick.',
    'attention.viz.looksPre': ' schaut vor allem auf ',
    'attention.viz.looksPost': ' zurück',
    'attention.viz.firstWord': ' (Das erste Wort kann noch nirgends hinschauen.)',
    'attention.viz.tapHint': 'Tippe ein Wort an, um seine Rückschau zu sehen.',
    'attention.viz.barsPre': 'Wohin „',
    'attention.viz.barsPost': '" schaut – Gewichte (zusammen 100 %):',
    'attention.viz.word': 'Wort ',
    'attention.viz.selected': ' (ausgewählt)',
    'attention.viz.query': 'Anfrage',
    'attention.viz.dragPre': 'Ziehe die ',
    'attention.viz.dragPost':
      '. Je näher sie einem Wort kommt, desto grösser dessen Gewicht – und desto stärker fliesst es in die Mischung ein (gestrichelte Kontur = die neue, kontextabhängige Bedeutung).',
    'attention.viz.pipeline': 'Query · Key → Softmax → gewichtete Summe',
    'attention.viz.notePre':
      'Die Spalte in der Mitte ist das Skalarprodukt (die Relevanz), rechts daraus das Softmax-Gewicht. In echten Modellen sind Query, Key und Value ',
    'attention.viz.noteEm': 'gelernte',
    'attention.viz.notePost':
      ' Projektionen der Embeddings – hier zum Anfassen fest gewählt. Die Positionen sind schematisch: Es geht ums Prinzip, nicht um die genauen Gewichte von oben.',

    // --- Tokenisierung ---
    'tokenization.title': 'Tokenisierung',
    'tokenization.subtitle':
      'Bevor ein Modell Text verarbeiten kann, zerlegt es ihn in Tokens – kleine Bausteine aus einzelnen Zeichen, Wortteilen oder ganzen Wörtern.',
    'tokenization.placeholder': 'Gib einen Text ein …',
    'tokenization.process': 'Text tokenisieren',
    'tokenization.example1': 'Beispieltext 1',
    'tokenization.example2': 'Beispieltext 2',
    'tokenization.caption':
      'Derselbe Tokenizer, den auch ChatGPT nutzt. Fahre über ein Token, um zu sehen, wie der Text zerschnitten wird.',
    'tokenization.emptyTitle':
      'Klicke auf „Text tokenisieren", um zu sehen, wie dein Text in Tokens zerfällt.',
    'tokenization.emptyBody':
      'Die Tokens müssen nicht mit Wörtern übereinstimmen – oft ist ein Wort aus mehreren Stücken zusammengesetzt.',
    'tokenization.multimodalPre':
      'Übrigens: Nicht nur Text wird zerlegt. Auch Bilder und Audio teilen moderne Modelle in Stücke, bevor sie sie verarbeiten – wie aus einer Bildfläche eine Reihe wird, zeigt die Station ',
    'tokenization.multimodalPost': '.',
    'tokenization.moreP1':
      'Computer verstehen keine Wörter, sondern nur Zahlen. Darum wird Text zuerst in Tokens zerlegt und jedes Token einer Zahl (Token-ID) zugeordnet.',
    'tokenization.moreP2':
      'Die Zerlegung übernimmt der BPE-Algorithmus (Byte Pair Encoding): Häufige Zeichenfolgen werden zu eigenen Tokens zusammengefasst, seltene Wörter in kleinere Stücke aufgeteilt. „Programmieren" wird so etwa zu „Program" + „m" + „ieren".',
    'tokenization.moreP3':
      'Aus den Token-IDs werden anschliessend Embeddings – Zahlenlisten, die Bedeutung erfassen. Genau darum geht es auf der nächsten Station.',
    'tokenization.nextLabel': 'Weiter: Embeddings',
    // Visualisierungs-Komponente (TokenizationVisualization)
    'tokenization.viz.loading': 'Text wird tokenisiert …',
    'tokenization.viz.tokensTitle': 'Tokens – so zerlegt das Modell deinen Text',
    'tokenization.viz.idsTitle': 'Token-IDs – nur diese Zahlen verarbeitet das Modell',
    'tokenization.viz.tokensWord': 'Tokens',
    'tokenization.viz.from': 'aus',
    'tokenization.viz.chars': 'Zeichen',
    'tokenization.viz.errorTitle': 'Tokenisierung fehlgeschlagen',
    'tokenization.viz.errorBody': 'Bitte versuche es noch einmal.',

    // --- Embeddings ---
    'embeddings.title': 'Embeddings',
    'embeddings.subtitle':
      'Embeddings übersetzen Bedeutung in Zahlen: Wörter mit ähnlicher Bedeutung bekommen ähnliche Zahlenvektoren – und Ähnlichkeit wird messbar.',
    'embeddings.caption':
      'Tipp ein Wort ein – ein Embedding-Modell wandelt es live in einen Vektor, der bei Wörtern mit ähnlicher Bedeutung landet. Über die Legende lassen sich Kategorien aus- und einblenden. Die Karte ist eine 2D-Projektion eines 768-dimensionalen Raums; Nähe bleibt dabei grob erhalten.',
    'embeddings.moreP1':
      'Ein Embedding ist ein langer Zahlenvektor (hier 768 Zahlen). Das Besondere: Wörter mit ähnlicher Bedeutung haben ähnliche Vektoren. Man kann sich jedes Wort als Punkt in einem hochdimensionalen Raum vorstellen – „Hund" und „Katze" liegen nah beieinander, „Hund" und „Mathematik" weit auseinander. Genau diese Nähe drückt die Landkarte oben in zwei Dimensionen aus.',
    'embeddings.moreP2':
      'Wie ähnlich zwei Embeddings sind, misst die Cosinus-Ähnlichkeit: ein Wert zwischen -1 und 1 (in der Praxis meist 0 bis 1), wobei 1 für „nahezu gleiche Bedeutung" steht. Diese Vektoren lernt ein Modell aus riesigen Textmengen nach dem Prinzip: Wörter, die in ähnlichen Kontexten vorkommen, haben ähnliche Bedeutung.',
    'embeddings.moreP3':
      'Embeddings sind ein Grundbaustein vieler KI-Anwendungen: semantische Suche, Empfehlungssysteme, Übersetzung und vor allem RAG, wo passende Dokumente gefunden werden, um Antworten mit echtem Wissen zu unterfüttern.',
    'embeddings.nextLabel': 'Weiter: Verzerrung',

    // --- Verzerrung / Bias ---
    'bias.title': 'Verzerrung: woher die Schlagseite kommt',
    'bias.subtitle':
      'Sprachmodelle übernehmen die Muster ihrer Trainingstexte – auch die unausgesprochenen. Hier wird eine solche Verzerrung messbar: Wie eng verbindet ein Modell Berufe mit einem Geschlecht?',
    'bias.caption':
      'Die Berufe oben sind mit einem Embedding-Modell (gemini-embedding-2) platziert: Ihr Ort auf der Achse ist die echte Nähe zu typisch männlichen oder weiblichen Wörtern. Niemand hat dem Modell gesagt, dass Berufe ein Geschlecht haben – die Schlagseite stammt aus den Texten, mit denen es trainiert wurde.',
    'bias.moreP1':
      'Ein Embedding-Modell lernt Bedeutung daraus, in welchen Zusammenhängen Wörter vorkommen. Stehen über Jahrzehnte „die Krankenschwester … sie" und „der Ingenieur … er" in den Texten, dann rückt „Pflege" im Vektorraum näher an „weiblich" und „Technik" näher an „männlich". Das Modell ist ein Spiegel seiner Daten – mit allen Schieflagen, die in der Sprache stecken.',
    'bias.moreP2':
      'Eine zweite Quelle ist das menschliche Feedback (RLHF): Beim Feinschliff bewerten Menschen die Antworten, und ihre Vorlieben – was „gut klingt", welche Beispiele selbstverständlich wirken – fliessen mit ein. RLHF kann ein Modell auch darauf trainieren, an der Oberfläche neutral zu antworten. Die gelernte Verbindung darunter bleibt davon unberührt und taucht an anderer Stelle wieder auf, etwa beim Übersetzen oder beim Ausschmücken einer Geschichte.',
    'bias.moreP3':
      'Genau das zeigt der zweite Teil oben: Rechnet man die Geschlechts-Richtung aus den Vektoren heraus, steht auf der Achse alles in der Mitte – doch die Berufe gruppieren sich weiter nach demselben Muster. Die Verzerrung sitzt nicht an einer Stelle, sondern verteilt im ganzen Vektor. Für den Unterricht heisst das: KI-Ausgaben sind nie „aus sich heraus neutral" – sie tragen die Statistik ihrer Quellen weiter. Das lässt sich abmildern, aber nicht per Knopfdruck löschen.',
    'bias.nextLabel': 'Weiter: Bild & Ton',
    // Visualisierung (BiasLab)
    'bias.lab.errLoad': 'Die Karte konnte nicht geladen werden.',
    'bias.lab.s1.title': 'Berufe auf einer Geschlechter-Achse',
    'bias.lab.s1.hint':
      'Jeder Beruf liegt dort, wo seine Bedeutung im Modell näher an typisch männlichen oder weiblichen Wörtern steht. Tipp ein eigenes Wort ein – es wird live eingebettet und fällt an seine Stelle.',
    'bias.lab.axisFemale': 'weiblich',
    'bias.lab.axisMale': 'männlich',
    'bias.lab.axisNeutral': 'neutral',
    'bias.lab.neutralNote':
      'Neutrale Objekte wie Tisch oder Apfel liegen in der Mitte – kein Geschlechts-Bezug. Auffällig: „Krankenpfleger" liegt trotz männlicher Wortform links. Die Schlagseite kommt aus der Bedeutung, nicht aus der Endung.',
    'bias.lab.inputPlaceholder': 'Beruf oder Wort …',
    'bias.lab.embedBtn': 'Einordnen',
    'bias.lab.embeddingBtn': 'Wird eingebettet …',
    'bias.lab.examplesLabel': 'Beispiele:',
    'bias.lab.ex1': 'Hebamme',
    'bias.lab.ex2': 'Astronaut',
    'bias.lab.ex3': 'Erzieherin',
    'bias.lab.ex4': 'Manager',
    'bias.lab.resetBtn': 'Zurücksetzen',
    'bias.lab.errEmbed': 'konnte nicht eingebettet werden.',
    'bias.lab.detailMale': 'steht näher an typisch männlichen Wörtern.',
    'bias.lab.detailFemale': 'steht näher an typisch weiblichen Wörtern.',
    'bias.lab.detailNeutral': 'liegt fast in der Mitte – kaum ein Geschlechts-Bezug.',
    'bias.lab.detailAnchor': 'ist ein neutrales Objekt und liegt bei 0.',
    'bias.lab.s2.title': 'Lässt sich das wieder herausrechnen?',
    'bias.lab.s2.hint':
      'Man kann die Geschlechts-Richtung aus jedem Vektor entfernen. Auf der Achse steht der Beruf dann in der Mitte. Aber sind damit auch seine Nachbarn neutral?',
    'bias.lab.probeLabel': 'Beispiel-Beruf:',
    'bias.lab.debiasBtn': 'Geschlechts-Richtung herausrechnen',
    'bias.lab.debiasUndo': 'Wieder einrechnen',
    'bias.lab.neighborsLabel': 'Nächste Berufe im Bedeutungsraum',
    'bias.lab.neighborsBefore': '(im Original)',
    'bias.lab.neighborsAfter': '(Geschlechts-Richtung entfernt)',
    'bias.lab.stayedOf': 'von',
    'bias.lab.stayedSame': 'Nachbarn sind dieselben.',
    'bias.lab.punch':
      'Die Verzerrung sitzt nicht in einer einzelnen Stellschraube, sondern verteilt im ganzen Vektor. Eine Richtung zu löschen entfernt die Messung – nicht das Muster. Genau deshalb ist Verzerrung so schwer wieder herauszubekommen.',

    // --- Daten / Pretraining ---
    'data.title': 'Wo kommen die Daten her?',
    'data.subtitle':
      'Ein Sprachmodell kennt nur, was in seinen Trainingsdaten steht. Diese Daten sind ein riesiger, ungeordneter Querschnitt des Webs – und die Auswahl daraus prägt, was das Modell kann.',
    'data.caption':
      'Dokumente aus dem FineWeb-Datensatz (CommonCrawl-Webtexte, ins Deutsche übersetzt) – eine winzige Stichprobe von gut 950 aus 15 Billionen Tokens. Den Bildungswert hat ein KI-Bewerter vergeben; der echte Filter (FineWeb-Edu) behält nur Texte mit Score 3 oder höher.',
    'data.moreP1':
      'Pretraining-Daten sind kein Lehrbuch, sondern ein Schnappschuss dessen, was Menschen zufällig ins Netz geschrieben haben: Ratgeber neben Werbung, Fachartikel neben Geplauder. Niemand plant die Themen-Mischung – sie ist einfach das, was online steht. Genau darum ist der rohe Querschnitt so heterogen.',
    'data.moreP2':
      'Ungeplant heisst aber nicht ungefiltert: Aus dem rohen Web wird über 90 % wieder verworfen. Duplikate, Sprach-Müll und Boilerplate fliegen raus, und ein KI-Klassifikator bewertet den Bildungswert jedes Texts. Heute bewerten also KI-Systeme die Trainingsdaten der nächsten KI-Systeme. Welche Texte diesen Filter überleben, formt die Fähigkeiten, das Wissen und die blinden Flecken des Modells.',
    'data.moreP3':
      'Deshalb ist Datenauswahl ein zentraler Hebel beim Bau eines Modells – nicht nur die Menge zählt, sondern die Qualität und Zusammensetzung. An der Spitze gewichten Labs einzelne Quellen sogar bewusst (etwa mehr Code oder Bücher), um gezielt bestimmte Fähigkeiten zu stärken.',
    'data.nextLabel': 'Weiter: Tokenisierung',

    // --- Training / Pretraining ---
    'training.title': 'Pretraining',
    'training.subtitle':
      'Ganz am Anfang lernt ein Modell nur eines: Sprache – von Grund auf. Diese erste, längste Trainingsphase heisst Pretraining; alles Spätere baut darauf auf. Hier läuft sie live in deinem Browser: Drück auf Start und sieh zu, wie aus Zufall Sprache wird.',
    'training.caption':
      'Oben rechnet ein neuronales Netz mit ein paar tausend Parametern – live in deinem Browser. Es sagt jeweils das nächste Zeichen voraus und korrigiert bei jedem Schritt seinen Fehler, genau wie grosse Modelle, nur millionenfach kleiner.',
    'training.moreP1':
      'Training und Anwendung sind zwei getrennte Phasen. Beim Training stellt das Modell eine Vorhersage an, vergleicht sie mit dem echten nächsten Zeichen und dreht seine Stellschrauben (die Parameter) ein kleines Stück nach. Bei der Inferenz – wenn du mit einer KI sprichst – steht alles fest: Das Modell wendet nur noch an, was es gelernt hat.',
    'training.moreP2':
      'Der Hebel beim Lernen ist der Fehler (Loss): Er misst, wie schlecht das Modell das richtige nächste Zeichen vorhergesagt hat. Aus diesem Fehler lässt sich für jede einzelne Zahl im Modell ausrechnen, in welche Richtung sie ihn kleiner macht – und genau dorthin wird sie ein winziges Stück verschoben. Millionenfach wiederholt wird die Vorhersage immer treffsicherer: Die Verteilung wird spitz, die Textproben werden plausibel.',
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
      'Das Pretraining macht aus dem Modell einen treffsicheren Text-Fortsetzer: Es enthält ein riesiges Wissen, ist aber nicht darauf ausgelegt, Fragen zu beantworten – es schreibt einfach weiter, was wahrscheinlich als Nächstes käme. Finetuning gibt diesem Wissen eine nützliche Form.',
    'finetuning.moreP2':
      'Beim Finetuning (auch Instruction-Tuning oder Supervised Fine-Tuning, kurz SFT, genannt) trainiert man das Modell mit Tausenden Beispielgesprächen aus Anfrage und idealer Antwort. Dabei lernt es ein festes Gesprächsformat – wer gerade spricht, Mensch oder Assistent – und die Gewohnheit, direkt zu antworten, sich an Anweisungen zu halten und aufzuhören, wenn die Antwort fertig ist.',
    'finetuning.moreP3':
      'Das Wissen selbst stammt fast vollständig aus dem Pretraining – Finetuning bringt vor allem das Verhalten bei. Darum genügen dafür vergleichsweise wenige, dafür sehr sorgfältig ausgewählte Beispiele. Wie man das Modell danach noch feiner an menschliche Vorlieben anpasst, zeigt die nächste Station: RLHF.',
    'finetuning.nextLabel': 'Weiter: RLHF',

    // --- RLHF ---
    'rlhf.title': 'RLHF: Lernen aus menschlichem Feedback',
    'rlhf.subtitle':
      'RLHF steht für Reinforcement Learning from Human Feedback: Eine KI lernt aus menschlichen Bewertungen, was eine gute Antwort ausmacht. Bring hier einem Belohnungsmodell mit ein paar Klicks deinen Geschmack bei – danach bewertet es neue Antworten von selbst, und du entdeckst, wo es sich austricksen lässt.',
    'rlhf.caption':
      'Oben trainiert aus deinen Vergleichen ein Belohnungsmodell – dieselbe Bradley-Terry-Methode wie in grossen RLHF-Systemen, nur mit ablesbaren Stil-Merkmalen statt eines riesigen Netzes. Lernen, Verallgemeinern und Austricksen passieren live in deinem Browser.',
    'rlhf.moreP1':
      'Nach dem Finetuning antwortet das Modell wie ein Assistent – aber was eine gute Antwort ausmacht, lässt sich kaum als Regel aufschreiben. „Hilfreich, ehrlich, harmlos" ist schwer zu definieren, aber leicht zu vergleichen: Menschen können bei zwei Antworten sagen, welche besser ist, auch ohne die Regel dahinter zu kennen. Genau darauf baut RLHF.',
    'rlhf.moreP2':
      'Drei Schritte: Erst sammeln Menschen tausende solcher Vergleiche. Daraus lernt ein Belohnungsmodell, ihre Vorlieben vorherzusagen – als Punktzahl für jede beliebige Antwort. Schließlich wird das Sprachmodell mit Reinforcement Learning so optimiert, dass es Antworten erzeugt, die das Belohnungsmodell hoch bewertet. So nimmt es Werte auf, die niemand direkt programmieren könnte.',
    'rlhf.moreP3':
      'Der Haken: Das Belohnungsmodell ist nur ein Stellvertreter für echten menschlichen Geschmack – und das Sprachmodell optimiert hartnäckig auf diese eine Zahl. Findet es eine Antwort, die hoch bewertet wird, ohne wirklich zu helfen (lang, selbstsicher, schmeichelhaft), nimmt es sie. Das nennt man Reward Hacking. Echte Systeme halten mit Sicherungen dagegen – oder ersetzen die geratene Belohnung durch eine geprüfte: Bei Mathe und Code lässt sich „richtig" wirklich verifizieren. Diese Idee treibt moderne Reasoning-Modelle an.',
    'rlhf.nextLabel': 'Weiter: RLVR',

    // --- Chain-of-Thought ---
    'cot.title': 'Chain-of-Thought: Schritt für Schritt zur Lösung',
    'cot.subtitle':
      'Chain-of-Thought (Gedankenkette) heißt: Das Modell schreibt seinen Lösungsweg aus, bevor es antwortet. Stell hier demselben Modell dieselbe Rechenaufgabe – einmal muss es sofort antworten, einmal darf es laut mitdenken – und sieh, wann das über falsch und richtig entscheidet.',
    'cot.caption':
      'Beide Spalten fragen dasselbe Sprachmodell. Der einzige Unterschied ist der Platz zum Mitdenken; ein winziger Prüfer rechnet jede Aufgabe nach und sagt, wer richtig liegt.',
    'cot.moreP1':
      'Mitdenken ist nichts Magisches: Das Modell sagt weiterhin nur das nächste Token voraus, Wort für Wort. Indem es Zwischenschritte ausschreibt, gibt es sich diese Schritte selbst als Kontext für das nächste Token. Jeder zusätzliche Token ist ein kleiner Rechenschritt mehr – der Lösungsweg ist der sichtbar gemachte Arbeitsspeicher des Modells.',
    'cot.moreP2':
      'Entdeckt wurde das als simpler Trick: Hängt man an eine Frage „Denke Schritt für Schritt", werden die Antworten messbar besser. Heutige Reasoning-Modelle haben dieses Mitdenken fest eingebaut – sie tun es von selbst und zeigen den Gedankengang oft nur verkürzt oder gar nicht.',
    'cot.moreP3':
      'Mitdenken hilft, ist aber keine Garantie – der Gedankengang selbst kann Fehler enthalten. Dass ein Modell zuverlässiger denkt, übt man im Training, indem man geprüfte Lösungswege belohnt – so wie bei RLVR. Und es gibt eine Grenze, an der auch der beste Gedankengang nichts ändert: Wenn das Modell etwas schlicht nicht weiß, hält es nicht inne, sondern schreibt trotzdem flüssig weiter. Was dabei herauskommt, zeigt die nächste Station.',
    'cot.nextLabel': 'Weiter: Halluzinationen',

    // --- Halluzinationen ---
    'hl.title': 'Halluzinationen: wenn das Modell überzeugend daneben liegt',
    'hl.subtitle':
      'Sprachmodelle sagen den wahrscheinlichsten nächsten Text voraus – nicht die Wahrheit. Fehlt ihnen das Wissen, schweigen sie selten; sie füllen die Lücke mit etwas Plausiblem. Frag hier das Modell nach etwas Ausgedachtem und sieh, wie selbstsicher es erfindet.',
    'hl.caption':
      'Oben antwortet ein Sprachmodell (Gemini über Vertex) mit einem ganz normalen Assistenten-Prompt – ohne Auftrag, etwas zu erfinden. Die Wahrscheinlichkeits-Balken weiter unten stammen aus demselben Mechanismus wie auf der Next-Token-Seite.',
    'hl.part1.title': 'Die Erfindungs-Maschine',
    'hl.part1.hint':
      'Wähle ein Thema – jedes ist frei erfunden. Oder tippe selbst etwas Ausgedachtes ein.',
    'hl.chip.novel': 'Ein Roman von 1931',
    'hl.chip.physicist': 'Eine Schweizer Physikerin',
    'hl.chip.treaty': 'Ein historischer Vertrag',
    'hl.chip.effect': 'Ein Fachbegriff',
    'hl.q.novel':
      'Worum geht es im Roman „Die Uhren von Saint-Galmier" von Henri Vautrin (1931)? Fasse die Handlung kurz zusammen.',
    'hl.q.physicist':
      'Wer war die Schweizer Physikerin Elsbeth Marrer (1894–1971) und wofür ist sie bekannt?',
    'hl.q.treaty':
      'Was wurde im Vertrag von Niederbüren (1647) geregelt? Nenne die wichtigsten Punkte.',
    'hl.q.effect': 'Erkläre kurz den Hofstadter-Lindqvist-Effekt aus der Psycholinguistik.',
    'hl.freePlaceholder': 'z. B. ein erfundener Buchtitel, Name oder Fachbegriff …',
    'hl.ask': 'Fragen',
    'hl.revealBtn': 'Auflösen: stimmt das?',
    'hl.reveal.title': 'Frei erfunden.',
    'hl.reveal.body':
      'Dieses Thema gibt es nicht – Roman, Person, Vertrag und Fachbegriff sind ausgedacht. Trotzdem klingt die Antwort detailliert und sicher. Das Modell hat nicht nachgeschlagen, sondern den wahrscheinlichsten Text fortgesetzt und die Lücke gefüllt. Genau das ist eine Halluzination.',
    'hl.freeNote':
      'Erfunden oder echt? Aus dem Ton allein lässt sich das nicht erkennen – das Modell klingt in beiden Fällen gleich überzeugt. Im Zweifel: nachprüfen.',
    'hl.offline': 'Modell gerade nicht erreichbar – gezeigt wird eine zuvor aufgezeichnete Antwort.',
    'hl.errorFree': 'Das Modell ist gerade nicht erreichbar. Versuch es gleich nochmal.',
    'hl.part2.title': 'Warum erfindet es? Ein Blick in die Wahrscheinlichkeiten',
    'hl.part2.hint':
      'Dieselbe Mechanik wie auf der Next-Token-Seite: die Verteilung über das nächste Token – einmal bei einem Faktum, einmal bei etwas Unwissbarem.',
    'hl.lp.known.label': 'Etwas, das es weiß',
    'hl.lp.known.prompt': 'Die Hauptstadt von Frankreich ist',
    'hl.lp.known.verdict':
      'Ein einzelner Balken trägt fast die ganze Wahrscheinlichkeit. Das Modell ist sich sicher – und liegt richtig.',
    'hl.lp.knownTag': 'ein Balken dominiert.',
    'hl.lp.guess.label': 'Etwas, das es nicht wissen kann',
    'hl.lp.guess.prompt': 'Goethes geheime Lieblingsfarbe war',
    'hl.lp.guess.verdict':
      'Trotzdem wählt das Modell eines aus und schreibt es als flüssigen, selbstsicheren Satz hin. Im fertigen Text ist von dieser Unsicherheit nichts mehr zu sehen – das ist der Nährboden für Halluzinationen.',
    'hl.lp.guessTag': 'Die Balken sind flach und zerstreut – das Modell rät.',
    'hl.lp.unavailable': 'Wahrscheinlichkeiten gerade nicht verfügbar.',
    'hl.moreP1':
      'Ein Sprachmodell hat keine Faktendatenbank, in der es nachschlägt. Es hat aus Texten Muster gelernt und sagt bei jedem Schritt das wahrscheinlichste nächste Token voraus. Stimmt die wahrscheinlichste Fortsetzung zufällig mit der Wirklichkeit überein, ist die Antwort richtig; tut sie es nicht, klingt sie genauso flüssig – nur eben falsch.',
    'hl.moreP2':
      'Entscheidend ist: Das Modell hat keinen eingebauten „Ich weiß es nicht"-Reflex. Wo Wissen fehlt, bricht es nicht ab, sondern setzt mit dem fort, was plausibel klingt. Deshalb erfindet es Romane, Lebensläufe oder Quellen mit erfundenen, aber glaubwürdigen Details. Je spezifischer und selbstsicherer eine Antwort klingt, desto weniger sagt das allein über ihre Richtigkeit aus.',
    'hl.moreP3':
      'Woran man sich halten kann: bei überprüfbaren Fakten gegenchecken, nach Quellen verlangen und diese wirklich öffnen, und dem Modell die nötigen Unterlagen direkt mitgeben, statt es aus dem Gedächtnis raten zu lassen. Genau dieser letzte Hebel ist die nächste Station: RAG – erst nachschlagen, dann antworten.',
    'hl.nextLabel': 'Weiter: RAG',

    // --- RLVR ---
    'rlvr.title': 'RLVR: eine Belohnung, die man prüfen kann',
    'rlvr.subtitle':
      'RLVR steht für Reinforcement Learning with Verifiable Rewards: Statt zu raten, was eine gute Antwort ist, prüft ein Programm, ob sie stimmt. Lass hier ein Sprachmodell mehrere Lösungswege ausdenken, einen Prüfer nachrechnen – und sieh, wie genau dieses Signal das Modell besser macht.',
    'rlvr.caption':
      'Oben denkt sich ein Sprachmodell die Lösungswege aus, ein winziges Stück Code prüft sie nach, und ein Mini-Reinforcement-Learning verstärkt das Geprüfte – alles live in deinem Browser. Buchstabenzählen ist dabei der anschauliche Stellvertreter für Mathe oder Code.',
    'rlvr.moreP1':
      'Auf der RLHF-Seite war die Belohnung ein gelerntes Modell des menschlichen Geschmacks – und ließ sich austricksen: Eine selbstsichere, schmeichelnde, aber falsche Antwort konnte hoch punkten. RLVR ersetzt diese geratene Belohnung durch eine geprüfte: Bei Mathe wird nachgerechnet, bei Code laufen Tests, beim Buchstabenzählen zählt man eben nach. Eine solche Belohnung lässt sich nicht überreden.',
    'rlvr.moreP2':
      'Der Ablauf: Das Modell erzeugt viele Lösungswege (Chain-of-Thought), ein Prüfer entscheidet bei jedem nur „richtig" oder „falsch", und das Reinforcement Learning macht die richtigen Wege wahrscheinlicher. Es braucht keinen Menschen, der mitliest – nur eine Aufgabe mit überprüfbarer Antwort. Genau deshalb sind Reasoning-Modelle besonders bei Mathe, Logik und Programmieren stark: Dort ist „richtig" eindeutig prüfbar.',
    'rlvr.moreP3':
      'Dass das Modell Buchstaben schlecht zählt, ist kein Zufall – es sieht Text als Tokens, nicht als einzelne Buchstaben (siehe Tokenisierung). Der Prüfer sieht die Buchstaben sehr wohl und wird so zum Lehrer. Dieselbe Idee – viele Versuche, ein verlässlicher Check, verstärke das Geprüfte – steckt hinter der jüngsten Generation von Reasoning-Modellen.',
    'rlvr.nextLabel': 'Weiter: Next-Token',

    // --- RAG ---
    'rag.title': 'RAG: erst nachschlagen, dann antworten',
    'rag.subtitle':
      'RAG steht für Retrieval-Augmented Generation: Statt nur aus dem Gedächtnis zu antworten, schlägt ein Sprachmodell zuerst in einer Wissensquelle nach und stützt seine Antwort darauf. Gib hier einer KI eine kleine Wissensbasis, die sie nie gesehen hat, stell eine Frage – und sieh, wie sie die passenden Unterlagen heraussucht und daraus antwortet.',
    'rag.caption':
      'Oben sucht ein Embedding-Modell die ähnlichsten Unterlagen heraus; daraus formuliert ein Sprachmodell die Antwort.',
    'rag.moreP1':
      'Ein Sprachmodell weiss nur, was in seinen Trainingsdaten stand – bis zu einem Stichtag und ohne dein privates oder tagesaktuelles Wissen. RAG (Retrieval-Augmented Generation) schliesst diese Lücke: Statt das Modell neu zu trainieren, legt man ihm zur Frage die passenden Dokumente bei. So kann es über Wissen sprechen, das es nie gesehen hat – etwa ein internes Wiki, frische Nachrichten oder, wie hier, die Unterlagen einer erfundenen Schule.',
    'rag.moreP2':
      'Das Herz von RAG ist sein erster Buchstabe, das Retrieval – und es ist genau die Ähnlichkeitssuche der Embeddings-Seite: Die Frage wird in einen Vektor übersetzt und mit jedem Dokument verglichen. Die ähnlichsten wandern als Kontext vor die Frage (das ist das „Augmented"), und daraus formuliert das Modell seine Antwort (das „Generation"). Drei Schritte: suchen, anreichern, antworten.',
    'rag.moreP3':
      'Darum ist RAG nur so gut wie das, was die Suche findet. Fehlt das richtige Dokument oder liegt ein ähnlich klingendes, aber falsches zuoberst, erdet sich die Antwort auf der falschen Quelle. Ein gutes System sagt dann ehrlich, dass die Unterlagen nichts hergeben, statt zu raten – gute Quellen und eine gute Suche zählen also so viel wie das Modell selbst. Nimm oben ein Dokument aus der Wissensbasis und sieh, wie die Antwort kippt.',
    'rag.nextLabel': 'Weiter: Agenten',

    // --- Agenten ---
    'agents.title': 'Agenten: ein Modell, das Werkzeuge benutzt',
    'agents.subtitle':
      'Ein Agent ist ein Sprachmodell in einer Schleife: Es sagt Text voraus, und wenn dieser Text ein Werkzeug-Aufruf ist, führt das Programm drumherum das Werkzeug aus und gibt das Ergebnis zurück. Stell hier einem Modell eine Aufgabe, die es allein nicht lösen kann – und sieh zu, wie es Schritt für Schritt Werkzeuge benutzt, um ans Ziel zu kommen.',
    'agents.caption':
      'Oben entscheidet ein Sprachmodell selbst, welches Werkzeug es ruft; die Werkzeuge laufen in deinem Browser und geben ihr Ergebnis zurück in den Kontext. Das Modell sagt weiterhin nur Text voraus – die Schleife darum herum macht daraus Handeln.',
    'agents.moreP1':
      'Ein „Agent" klingt nach Eigenständigkeit, ist mechanisch aber kein neues Modell: Es ist dasselbe Next-Token-Modell, nur in eine Schleife gestellt. Bei jedem Durchlauf sagt es über den ganzen bisherigen Verlauf das nächste Stück Text voraus. Manchmal ist dieses Stück eine Endantwort – manchmal ein Werkzeug-Aufruf.',
    'agents.moreP2':
      'Den Aufruf fängt das Gerüst um das Modell herum ab, führt das Werkzeug wirklich aus und schreibt das Ergebnis als neue Zeile in den Kontext. Dann fragt es das Modell erneut. Denken (Chain-of-Thought), Nachschlagen (RAG) und Handeln sind so betrachtet dasselbe: Es kommt immer nur Text in einen wachsenden Kontext, über den das Modell weiter vorhersagt. Die „Handlungsfähigkeit" steckt im Gerüst und in den Werkzeugen, nicht im Modell.',
    'agents.moreP3':
      'Echte Agenten haben mehr und mächtigere Werkzeuge – Websuche, Code ausführen, Dateien ändern, Nachrichten schreiben; die KI-Assistenten, die heute selbstständig recherchieren oder programmieren, sind genau solche Schleifen. Die Schleife bleibt dieselbe. Mit dieser Reichweite wird aber eine Frage dringend: Sobald ein Agent Werkzeuge benutzt, schickt er Teile deiner Eingabe an Dienste weiter und kann selbst etwas auslösen. Wohin diese Daten gehen und was man ihm erlaubt, ist das Thema der nächsten Seite.',
    'agents.nextLabel': 'Weiter: Datenschutz',

    // --- Agenten-Schleife (Viz) ---
    'agentLoop.placeholder': 'Gib dem Agenten eine Aufgabe …',
    'agentLoop.ask': 'Auftrag geben',
    'agentLoop.ex1': 'Wie viele Tage sind es von heute bis zum 1. August – und wie viele Wochen und Tage?',
    'agentLoop.ex2': 'Wie viele Tage bleiben bis zum 24. Dezember?',
    'agentLoop.ex3': 'Wie viele Wochen und Tage sind es von heute bis zum 1. Januar 2027?',
    'agentLoop.toolsTitle': 'Werkzeuge',
    'agentLoop.toolsHint': 'Tippen schaltet ein Werkzeug ab oder zu',
    'agentLoop.tool.heute.label': 'Kalender · heute',
    'agentLoop.tool.heute.blurb': 'Gibt das heutige Datum zurück.',
    'agentLoop.tool.tage_bis.label': 'Kalender · Tage zählen',
    'agentLoop.tool.tage_bis.blurb': 'Zählt die Tage zwischen zwei Daten.',
    'agentLoop.tool.rechner.label': 'Rechner',
    'agentLoop.tool.rechner.blurb': 'Wertet einen Rechenausdruck exakt aus.',
    'agentLoop.tool.teilen_mit_rest.label': 'Teilen mit Rest',
    'agentLoop.tool.teilen_mit_rest.blurb': 'Teilt ganzzahlig: ganzer Teil und Rest.',
    'agentLoop.toolsChanged': 'Werkzeuge geändert – starte neu, um den Unterschied zu sehen.',
    'agentLoop.modeAuto': 'Automatisch',
    'agentLoop.modeStep': 'Schritt für Schritt',
    'agentLoop.nextStep': 'Nächster Schritt',
    'agentLoop.restart': 'Neu starten',
    'agentLoop.runOne': 'Durchlauf',
    'agentLoop.runMany': 'Durchläufe',
    'agentLoop.labelTask': 'Auftrag',
    'agentLoop.labelModel': 'Modell',
    'agentLoop.labelTool': 'Werkzeug',
    'agentLoop.labelFinal': 'Endantwort',
    'agentLoop.thinking': 'Das Modell sagt den nächsten Zug voraus …',
    'agentLoop.readyHint': 'Bereit. Klicke „Nächster Schritt", um den ersten Zug des Modells zu sehen.',
    'agentLoop.maxSteps': 'Maximale Schrittzahl erreicht – hier stoppt das Gerüst.',
    'agentLoop.retry': 'Nochmal',
    'agentLoop.noOutput': '(keine Ausgabe)',
    'agentLoop.toolUnavailable': 'Werkzeug nicht verfügbar',
    'agentLoop.legendModel': 'Modell – sagt Text voraus',
    'agentLoop.legendTool': 'Werkzeug – läuft im Gerüst darum herum',
    'agentLoop.contextTitle': 'Was das Modell gerade sieht',
    'agentLoop.ctxExplain1': 'Alles steht in EINEM wachsenden Textstrom. Nur die mit ',
    'agentLoop.ctxExplain2':
      ' markierten Zeilen stammen vom Sprachmodell – alles andere fügt das Gerüst hinzu. Genau über diesen Strom sagt das Modell bei jedem Zug das nächste Stück voraus (wie auf der Next-Token-Seite).',
    'agentLoop.calls': 'ruft',

    'a11y.toggleTheme': 'Hell/Dunkel umschalten',
    'a11y.toggleSidebar': 'Navigation ein-/ausblenden',
    'a11y.toggleLanguage': 'Sprache wechseln',
    'a11y.toggleAccent': 'Akzentfarbe wählen',
    'a11y.search': 'Suche',
    'a11y.openSearch': 'Suche öffnen',

    // === Suche (Header) ===
    'search.placeholder': 'Suchen …',
    'search.hint': 'Seiten und Begriffe durchsuchen',
    'search.pages': 'Seiten',
    'search.terms': 'Begriffe',
    'search.empty': 'Nichts gefunden.',

    // === Glossar ===
    'glossary.title': 'Glossar',
    'glossary.subtitle':
      'Die wichtigsten Begriffe rund um KI-Sprachmodelle – kurz erklärt, mit Links zu den Erklärseiten und weiterführenden Quellen.',
    'glossary.filterPlaceholder': 'Begriff suchen …',
    'glossary.empty': 'Kein Begriff gefunden.',
    'glossary.explainOn': 'Mehr dazu auf dieser Seite',
    'glossary.external': 'Weiterführend',
    'glossary.wikipedia': 'Wikipedia',
    'glossary.countLabel': 'Begriffe',
    'glossary.category.data': 'Daten',
    'glossary.category.training': 'Training',
    'glossary.category.inference': 'Inferenz',
    'glossary.category.mlBasics': 'ML-Grundlagen',
    'glossary.category.general': 'Allgemein',
    'glossary.backBtn': 'Zur Einführung',

    // === Viz-Komponenten ===
    // --- mini-training.tsx ---
    'miniTraining.trainingData': 'Lerndaten:',
    'miniTraining.speed': 'Tempo:',
    'miniTraining.speedSlow': 'Zeitlupe',
    'miniTraining.speedNormal': 'Normal',
    'miniTraining.speedTurbo': 'Turbo',
    'miniTraining.customLabel': 'Eigene',
    'miniTraining.customHint': 'Gib eigene Wörter ein (durch Leerzeichen getrennt) – das Modell lernt nur daraus. Probier Tiernamen, Städte oder Fantasiewörter.',
    'miniTraining.customPlaceholder': 'apfel banane kirsche …',
    'miniTraining.customApply': 'Übernehmen & neu starten',
    'miniTraining.customWords': 'Wörter',
    'miniTraining.pause': 'Pause',
    'miniTraining.train': 'Trainieren',
    'miniTraining.continue': 'Weiter',
    'miniTraining.resetLabel': 'Zurücksetzen',
    'miniTraining.statusRunning': 'Lernt … es dreht bei jedem Schritt an seinen Stellschrauben.',
    'miniTraining.statusPaused': 'Pausiert – du kannst weitertrainieren.',
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
    'miniTraining.samplesNote': 'Frisch aus dem Modell gezogen – Zeichen für Zeichen.',
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
    'miniTraining.distNote': 'Dieselbe Idee wie auf der Next-Token-Seite – nur fürs nächste Zeichen. Anfangs flach (alles gleich wahrscheinlich), nach dem Training spitz.',
    'miniTraining.moreTitle': 'Mehr Einblicke',
    'miniTraining.moreSuffix': '– für Interessierte',
    'miniTraining.embTitle': 'Die Embeddings der Buchstaben',
    'miniTraining.embNote': 'Jeder Buchstabe bekommt eine eigene Zahlenliste – hier in 2D. Während des Trainings ordnen sie sich; Vokale wandern oft zusammen. Genau das sind Embeddings, eine Station vorher.',
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
    'finetuningComp.baseNote': 'Es setzt deinen Text einfach fort, statt zu antworten, und stoppt nicht von selbst – hier brechen wir nach rund 100 Tokens ab.',
    'finetuningComp.assistantNote': 'Es erkennt die Anfrage, antwortet direkt und strukturiert – und hört von selbst auf, wenn die Antwort fertig ist.',
    'finetuningComp.noOutput': 'Keine Ausgabe – bitte nochmal versuchen.',
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
    'cotComp.directNote': 'Eine Antwort in einem Zug – ohne Notizblock. Bei mehreren Rechenschritten geht dabei leicht etwas verloren.',
    'cotComp.cotNote': 'Das Modell schreibt Zwischenschritte aus – und liest sie beim Weiterschreiben wieder mit. Dasselbe Modell, nur mit Platz zum Mitdenken.',
    'cotComp.freeTaskHint': 'Für freie Aufgaben ohne eindeutiges Rechenergebnis zeigen wir beide Antworten ohne ✓/✗-Urteil.',
    'cotComp.noOutput': 'Keine Ausgabe – bitte nochmal.',

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
    'rlhfLab.labelHint': 'Lies beide und wähle die hilfreichere. Du urteilst über die ganze Antwort – das Belohnungsmodell wird gleich nur ein paar oberflächliche Merkmale davon zu sehen bekommen.',
    'rlhfLab.trainDone': 'Fertig. Das ist die Faustregel, die das Modell aus deinen Klicks gezogen hat – und es sah dabei nur diese fünf Stil-Merkmale, nicht den eigentlichen Inhalt.',
    'rlhfLab.trainRunning': 'Aus deinen Vergleichen lernt das Belohnungsmodell …',
    'rlhfLab.trainNext': 'Bewährt es sich?',
    'rlhfLab.lossTitle': 'Fehler',
    'rlhfLab.lossFalling': 'sinkt …',
    'rlhfLab.lossLearning': 'Das Modell sagt deine Klicks immer besser vorher.',
    'rlhfLab.weightTitle': 'Was dein Belohnungsmodell mag',
    'rlhfLab.weightNote': 'Jeder Balken ist ein gelernter Geschmack: nach rechts = belohnt, nach links = abgewertet. Das hat niemand einprogrammiert – es kommt allein aus deinen Vergleichen.',
    'rlhfLab.genHeading': 'Neue Antworten, die das Modell nie gesehen hat',
    'rlhfLab.genHint': 'Wähl wieder die bessere – dann zeigt sich, ob dein Belohnungsmodell genauso entscheidet.',
    'rlhfLab.genYourChoice': 'deine Wahl',
    'rlhfLab.genRewardModel': 'Belohnungsmodell',
    'rlhfLab.genAgree': 'Mal trifft das Modell deine Wahl – aus nur',
    'rlhfLab.genAgreeSuffix': 'Klicks. Genau das macht RLHF praktikabel: ein paar tausend Vergleiche, und das Modell kann Millionen Antworten bewerten, ohne dass ein Mensch mitliest.',
    'rlhfLab.genNext': 'Wo es kippt',
    'rlhfLab.hackHeading': 'Jetzt dreht sich der Spieß um',
    'rlhfLab.hackIntro': 'Beim eigentlichen RLHF schreibt das Sprachmodell die Antworten – und wird darauf trainiert, möglichst hohe Belohnung zu kassieren. Hier sind ein paar mögliche Antworten auf dieselbe Frage. Das Belohnungsmodell hat jede nach Stil bewertet – die Wahrheit kennt es nicht.',
    'rlhfLab.hackQuestion': 'Frage',
    'rlhfLab.hackGuess': 'Welche Antwort holt die höchste Belohnung? Tippe darauf.',
    'rlhfLab.hackGuessTap': 'dein Tipp?',
    'rlhfLab.hackChoose': 'Ich weiß nicht – das Sprachmodell wählen lassen',
    'rlhfLab.hackRewardLabel': 'Belohnung',
    'rlhfLab.hackYourGuess': 'dein Tipp',
    'rlhfLab.hackModelPick': 'höchste Belohnung',
    'rlhfLab.hackTruthCorrect': 'nennt Canberra – richtig',
    'rlhfLab.hackTruthWrong': 'faktisch falsch',
    'rlhfLab.hackPickLabel': 'Reward Hacking',
    'rlhfLab.hackPickNote': 'Die Antwort mit der höchsten Belohnung ist faktisch falsch – die Hauptstadt ist',
    'rlhfLab.hackPickNoteSuffix': '. Das Belohnungsmodell sieht nur den Stil, nicht die Wahrheit, also fällt es darauf herein – es maximiert die Belohnung, statt wirklich zu helfen.',
    'rlhfLab.hackBetter': 'Hilfreicher wäre',
    'rlhfLab.hackBetterSuffix': 'gewesen – gut geschrieben, aber nicht ganz oben bei der Belohnung. Deshalb braucht echtes RLHF Sicherungen: die Vorlieben laufend nachschärfen, das Modell nicht zu weit vom Original wegdriften lassen – oder die Belohnung gar nicht raten, sondern prüfen. Bei Mathe oder Code lässt sich „richtig" echt verifizieren. Das treibt heutige Reasoning-Modelle an: die nächste Station.',
    'rlhfLab.hackReset': 'Nochmal mit neuem Geschmack',
    'rlhfLab.svgLoss': 'Lernkurve',

    // --- rlvr-lab.tsx ---
    'rlvrLab.stageGenerate': 'Generieren',
    'rlvrLab.stageVerify': 'Prüfen',
    'rlvrLab.stageReinforce': 'Verstärken',
    'rlvrLab.taskLabel': 'Aufgabe',
    'rlvrLab.generateHint': 'Lass das Modell dieselbe Frage mehrmals aus dem Stegreif schätzen. Weil es Buchstaben aus Tokens heraus schätzen muss, kommen unterschiedliche Antworten heraus – der perfekte Stoff, um einen Prüfer darauf loszulassen.',
    'rlvrLab.generateBtn': 'schnelle Versuche',
    'rlvrLab.attemptLabel': 'Versuch',
    'rlvrLab.attemptFailed': 'Versuch fehlgeschlagen.',
    'rlvrLab.contradicting': 'Die Versuche widersprechen sich. Wer hat recht? Frag nicht das Modell – frag den Prüfer.',
    'rlvrLab.thinking': 'Das Modell denkt nach …',
    'rlvrLab.checkBtn': 'Vom Prüfer checken lassen',
    'rlvrLab.verifierTitle': 'Der Prüfer rechnet nach',
    'rlvrLab.verifierNote': 'Ein Stück Code zählt die',
    'rlvrLab.verifierNoteMid': 'direkt im Wort:',
    'rlvrLab.verifierNoteSuffix': '. Keine Schätzung, keine Meinung – das ist die Wahrheit, gegen die jeder Versuch geprüft wird.',
    'rlvrLab.verifyHasCorrect': 'bekommen Belohnung 1, der Rest 0. Manche falschen Versuche klingen genauso überzeugend wie die richtigen – den Prüfer beirrt das nicht.',
    'rlvrLab.verifyNoCorrect': 'Diesmal lag kein Versuch richtig – alle bekommen 0. Verstärken kann nur, was vorkommt; hier bräuchte das Modell mehr oder bessere Versuche. Probier ein anderes Wort.',
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
    'rlvrLab.bannerVerifierSuffix': '. Nach dem Training wählt es fast immer richtig – und zwar, weil die Belohnung die Wahrheit war, nicht ihr Anschein. Genau das treibt heutige Reasoning-Modelle bei Mathe und Code an.',
    'rlvrLab.bannerImpLucky': 'Diesmal war die häufigste Antwort zufällig richtig. Verlass dich nicht darauf: Die Eindrucks-Belohnung prüft nie nach – sie belohnt nur, was überzeugend klingt. Schalt auf Prüfer oder nimm ein anderes Wort, und der Unterschied wird sichtbar.',
    'rlvrLab.bannerImpHack': 'Mit der Eindrucks-Belohnung sackt das Modell auf',
    'rlvrLab.bannerImpHackMid': 'ab – die Antwort, die am häufigsten und selbstsichersten kam, vom Prüfer aber als falsch entlarvt. So wird eine geratene Belohnung ausgetrickst (Reward Hacking, wie beim Belohnungsmodell der RLHF-Seite). Der Prüfer lässt sich nicht täuschen – das ist der ganze Trick von RLVR.',
    'rlvrLab.newAttempts': 'Neue Versuche',
    'rlvrLab.svgAccuracy': 'Trefferkurve',

    // --- rag-explorer.tsx ---
    'ragExplorer.placeholder': 'Frag etwas über die Schule …',
    'ragExplorer.ask': 'Fragen',
    'ragExplorer.retrievalTitle': '1. Abrufen – die ähnlichsten Unterlagen',
    'ragExplorer.knowledgeBase': 'Wissensbasis: die Lindenhof-Schule',
    'ragExplorer.active': 'aktiv',
    'ragExplorer.of': 'von',
    'ragExplorer.retrievalHintBefore': 'Eine kleine Sammlung erfundener Dokumente, die das Modell nie gesehen hat. Stell eine Frage – die Suche bettet sie ein und sortiert nach Ähnlichkeit.',
    'ragExplorer.retrievalHintAfter': 'Deine Frage wird zum Vektor – die',
    'ragExplorer.retrievalHintAfterSuffix': 'ähnlichsten Unterlagen (Balken = Cosinus-Ähnlichkeit) wandern in den Kontext.',
    'ragExplorer.inContext': 'im Kontext',
    'ragExplorer.toggleInclude': 'Wieder in die Wissensbasis aufnehmen',
    'ragExplorer.toggleExclude': 'Aus der Wissensbasis nehmen',
    'ragExplorer.stale': 'Wissensbasis geändert – klick „Fragen", um die Antwort neu zu erden.',
    'ragExplorer.answerTitle': '2. Antworten – dieselbe Frage, einmal ohne und einmal mit diesen Unterlagen',
    'ragExplorer.withoutTitle': 'Ohne Kontext',
    'ragExplorer.withoutTag': 'nur Modellwissen',
    'ragExplorer.withTitle': 'Mit Kontext (RAG)',
    'ragExplorer.withTag': 'Modell + Unterlagen',
    'ragExplorer.loading': 'Modell antwortet …',
    'ragExplorer.retry': 'Erneut versuchen',
    'ragExplorer.idle': 'Stell eine Frage, um den Unterschied zu sehen.',
    'ragExplorer.withoutFooter': 'Nur die Frage geht ans Modell. Was nicht im Training stand – wie diese erfundene Schule – kann es nicht wissen.',
    'ragExplorer.withFooter': 'Geerdet auf:',
    'ragExplorer.withFooterNote': 'Steht die Antwort nicht in den Unterlagen, sagt das Modell es offen.',
    'ragExplorer.withFooterEmpty': 'Die abgerufenen Unterlagen werden vor die Frage gestellt.',
    'ragExplorer.noOutput': 'Keine Ausgabe – bitte nochmal versuchen.',

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
    'embMap.ex1': 'Pizza',
    'embMap.ex2': 'Australien',
    'embMap.ex3': 'Eifersucht',
    'embMap.ex4': 'Astronaut',
    'embMap.ex5': 'Roboter',
    'embMap.ex6': 'Sushi',
    'embMap.errLoad': 'Landkarte konnte nicht geladen werden',
    'embMap.errEmbedPre': 'Kein Embedding für „',
    'embMap.errEmbedPost': '".',
    'embMap.errEmbedGeneric': 'Embedding konnte nicht berechnet werden.',

    // --- data-explorer.tsx ---
    'dataExplorer.viewRaw': 'Roh',
    'dataExplorer.viewMine': 'Deine Auswahl',
    'dataExplorer.viewCurated': 'Musterlösung',
    'dataExplorer.randomDoc': 'Zufälliges Dokument',
    'dataExplorer.reset': 'Zurücksetzen',
    'dataExplorer.captionRaw': 'Ein roher Querschnitt aus dem Web. Klick einen Punkt und lies, was drinsteht – Banales neben Wertvollem.',
    'dataExplorer.captionMineEmpty': 'Öffne ein Dokument und entscheide „Behalten" oder „Raus". Was du behältst, bildet hier deinen eigenen Datensatz.',
    'dataExplorer.captionMineCount': 'Dein Datensatz:',
    'dataExplorer.captionMineCountSuffix': 'Dokumenten behalten.',
    'dataExplorer.captionCurated': 'Was der echte Qualitätsfilter behält: nur Texte mit hohem Bildungswert –',
    'dataExplorer.captionCuratedSuffix': '(≈ 6 %). Den Rest wirft die Pipeline weg.',
    'dataExplorer.svgLabel': 'Karte von Trainingsdaten-Dokumenten, nach Thema gefärbt',
    'dataExplorer.docEmpty': 'Klick einen Punkt auf der Karte – dann erscheint hier ein Dokument aus den Trainingsdaten.',
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
    'nextTokenPred.noProbs': 'Keine Token-Wahrscheinlichkeiten vom Modell erhalten. Versuche es mit einem anderen Text.',
    'nextTokenPred.usingSim': 'Verwende simulierte Daten statt API-Ergebnissen',

    // --- multimodal-sequence.tsx ---
    'multimodalSeq.sceneLabel': 'Kacheln:',
    'multimodalSeq.drawing': 'Szene wird gezeichnet …',
    'multimodalSeq.step1Title': 'Eine Fläche',
    'multimodalSeq.step1Hint': 'Ein Bild ist ein Rechteck aus Pixeln – kein Anfang, kein Ende. Wir zerlegen es in gleich grosse Kacheln.',
    'multimodalSeq.step2Title': 'Eine Reihe',
    'multimodalSeq.step2Hint': 'Die Kacheln werden Zeile für Zeile zu einer einzigen Reihe ausgerollt: aus der Fläche wird eine Linie. Jede Kachel wird dabei zu einer Liste von Zahlen.',
    'multimodalSeq.step3Title': 'Ein Strom',
    'multimodalSeq.step3Hint': 'Diese Bild-Kacheln stehen nun im selben Strom wie die Wort-Tokens. Das Modell liest die ganze Reihe – und sagt das nächste Stück voraus, genau wie bei reinem Text.',
    'multimodalSeq.tileAria': 'Kachel',
    'multimodalSeq.tileInspectHint': 'Kacheln, zu einer Reihe ausgerollt – jede ist jetzt eine kurze Liste von Zahlen. Tipp: Klick eine Kachel an, um ihre Zahlen zu sehen.',
    'multimodalSeq.tileNumbers': 'Diese eine Kachel als drei Zahlen:',
    'multimodalSeq.back': 'Zurück',
    'multimodalSeq.unroll': 'Ausrollen',
    'multimodalSeq.next': 'Weiter',
    'multimodalSeq.restart': 'Von vorn',
    'multimodalSeq.moreTitle': 'Mehr Einblicke',
    'multimodalSeq.moreSuffix': '– für Interessierte',
    'multimodalSeq.moreP1': 'Die drei Balken je Kachel zeigen, wie viel Rot, Grün und Blau sie enthält – zusammen ergeben sie ihre Durchschnittsfarbe. Klick im Schritt „Eine Reihe" eine Kachel an: Eine Sonnen-Kachel hat viel Rot und Grün, eine Himmel-Kachel viel Blau.',
    'multimodalSeq.moreP2': 'Ein echtes Modell rechnet pro Kachel nicht drei, sondern hunderte solcher Zahlen – und die lassen sich einzeln nicht mehr deuten. Gemeinsam legen sie die Kachel als Punkt in denselben Bedeutungsraum, in dem auch die Wörter liegen. Genau das ist die Idee der Embeddings-Station, nur diesmal für ein Stück Bild.',
    'multimodalSeq.streamLabel': 'Eingabe-Strom:',
    'multimodalSeq.nextPiece': 'nächstes Stück?',
    'multimodalSeq.streamNote': 'Für das Modell ist das eine einzige Reihe von Stücken – Bild-Kacheln und Wort-Tokens gemischt. Es behandelt beide gleich und setzt die Reihe fort. So „sieht" ein Sprachmodell: nicht mit einem zweiten Sinn, sondern mit demselben Mechanismus, nur mit anderem Futter.',
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
    'msgCheck.legendIdentifying': 'Zeigt auf eine bestimmte Person (Name, Klasse, Kontakt) – das ersetzt du.',
    'msgCheck.legendContext': 'Sensibel, ohne Namen aber unkritisch – das kannst du behalten.',
    'msgCheck.cloudNote': 'Schickst du die Nachricht an eine Cloud-KI, sieht der Anbieter genau diese Stellen – oft auf Servern im Ausland.',
    'msgCheck.contextOnlyTitle': 'Sensibel, aber ohne Personenbezug.',
    'msgCheck.contextOnlyNote': 'Diese Angaben sagen etwas über eine Person aus, zeigen ohne Namen aber auf niemanden Bestimmtes – so kannst du die Anfrage senden.',
    'msgCheck.showAnon': 'So entschärfst du sie selbst →',
    'msgCheck.hideAnon': 'Entschärfte Fassung verbergen',
    'msgCheck.anonNote': 'Die Identität ist raus, der Inhalt bleibt stehen – die KI kann damit trotzdem eine brauchbare Antwort schreiben, ohne dass jemand Konkretes erkennbar ist. (Das machst du selbst; es passiert nicht automatisch.)',
    'msgCheck.okTitle': 'Nichts offensichtlich Schützenswertes.',
    'msgCheck.okNote': 'Eine allgemeine Frage ohne Personenbezug – hier ist eine Cloud-KI unbedenklich.',
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
      'How language models work – hands-on, to try for yourself.',

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

    'home.paths.heading': 'From dataset to answer',
    'home.path.data.desc':
      'What a model learns from – and how text, images & sound become numbers in the first place.',
    'home.path.training.desc':
      'How raw data turns into a useful model: from pre-training to reward.',
    'home.path.inference.desc':
      'How a finished model answers – token by token, with notes, lookup and data protection.',

    'home.more.title': 'So what is a language model?',
    'home.more.body':
      'A language model has read vast amounts of text and learned to recognise patterns in language. At its core it always predicts the most likely next word – just at an extremely high level. From that come answers, summaries, translations and much more.',

    'nav.home': 'Introduction',
    'nav.glossary': 'Glossary',
    'nav.resources': 'Resources',
    'nav.impressum': 'Imprint',
    'nav.section.data': 'Data',
    'nav.section.training': 'Training',
    'nav.section.inference': 'Inference',
    'nav.section.mlBasics': 'ML basics',
    'nav.perceptron': 'Perceptron',
    'nav.mlp': 'MLP',
    'nav.gradient': 'Gradient descent',
    'nav.backprop': 'Backpropagation',
    'nav.diffusion': 'Diffusion',

    'nav.tokenization': 'Tokenization',
    'nav.nextToken': 'Next-token prediction',
    'nav.attention': 'Attention',
    'nav.data': 'Training data',
    'nav.training': 'Pre-training',
    'nav.finetuning': 'Fine-tuning',
    'nav.rlhf': 'RLHF',
    'nav.rag': 'RAG',
    'nav.cot': 'Chain-of-thought',
    'nav.hallucinations': 'Hallucinations',
    'nav.rlvr': 'RLVR',
    'nav.agents': 'Agents',
    'nav.embeddings': 'Embeddings',
    'nav.bias': 'Bias',
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

    // === ML basics ===
    // --- Perceptron ---
    'perceptron.title': 'The perceptron',
    'perceptron.subtitle':
      'A single artificial neuron – the smallest building block that language models are also made of. Set the weights yourself, or let it learn.',
    'perceptron.caption':
      'A neuron weights its inputs, sums them and fires once the sum crosses a threshold. This exact little computation sits – millions of times over – inside every large model.',
    'perceptron.moreP1':
      'A perceptron takes a few numbers as input, multiplies each by a weight, adds them up and outputs 1 if the sum exceeds a threshold – otherwise 0. The weight says how important a feature is (negative means: it argues against), the threshold how easily the neuron says "yes".',
    'perceptron.moreP2':
      'Geometrically it draws a straight line through the inputs and sorts everything left/right of it. During learning, the learning rule shifts the weights a little after each mistake – the line swings in until it (if possible) separates all examples correctly. But some patterns like XOR can never be separated by a single line.',
    'perceptron.moreP3':
      'This very neuron – weighted sum, then a threshold – sits hundreds of times side by side in this page’s next-letter predictor, just with a soft step (tanh) instead of the hard one. Stack several layers of them and a neural network emerges. The next step – several neurons that together also solve XOR – is the MLP.',
    'perceptron.nextLabel': 'Next: MLP',

    // --- MLP ---
    'mlp.title': 'The MLP: solving XOR',
    'mlp.subtitle':
      'What a single neuron cannot do, a hidden layer of several can: even XOR becomes separable. Train it, try datasets, and see how many neurons the boundary needs.',
    'mlp.caption':
      'Two neurons each draw a line; the second layer combines them into a curved boundary. This exact stack – weighted sums and squashing functions, layered and learned by backprop – is a neural network.',
    'mlp.moreP1':
      'The single perceptron draws exactly one straight line. XOR ("exactly one of the two") cannot be separated with it – the right cases lie crosswise. The solution: a hidden layer. Each hidden neuron is itself a small perceptron with its own line; the output layer combines their answers and can thus form regions instead of just half-planes.',
    'mlp.moreP2':
      'Learning happens by gradient descent: the network compares its output with the target and nudges ALL weights – including the hidden layer’s – a step in the direction that shrinks the error. This backward passing of the error is called backpropagation. Because two neurons with a random start sometimes land in a dead end, "Restart" helps.',
    'mlp.moreP3':
      'At its core it needs no more: weighted sum, a squashing function (here tanh), stacked in layers. The next-letter predictor on the training page is exactly that – just with embedding inputs, a wider hidden layer and a softmax over all characters instead of a single sigmoid. From the XOR network to a language model it’s the same machine, only bigger.',
    'mlp.moreP4':
      'More neurons are not automatically better. Try the "Noise" dataset: with 8 neurons the network hits every training point (filled) but stumbles on the test points (hollow rings) – it has memorised the noise instead of the rule. That is overfitting; a smaller network draws a smoother boundary and often generalises better. This exact trade-off sits behind every real training run. The "tanh ↔ ReLU" switch also shows today’s usual activation: ReLU (a kink at 0) makes the boundary piecewise straight rather than round.',
    'mlp.nextLabel': 'Next: how does a network learn?',

    // --- How does a network learn? (gradient descent) ---
    'gd.title': 'How does a network learn?',
    'gd.subtitle':
      'A network lowers its error by shifting its weights – but how does it know which way? The answer is gradient descent. Roll the ball into the valley and play with the learning rate.',
    'gd.caption':
      'The error is a landscape over the weights. The slope (the gradient) points downhill; a step goes a little way in that direction. This very search runs inside every network – just in many more dimensions.',
    'gd.moreP1':
      'Picture the error as height above the weights. With one weight that’s a curve, with two a landscape, with millions unimaginable – but the principle holds: the slope at your spot says which way is steepest uphill. Its negative points downhill. A step that way lowers the error a little. That is gradient descent.',
    'gd.moreP2':
      'The learning rate is the step size. Too small and learning crawls. Too large and the step overshoots the valley – in the worst case the error grows every step and everything diverges. And in a bumpy landscape you end up in different valleys depending on where you start: the deepest is the best solution (global minimum), a shallower one a dead end (local minimum).',
    'gd.moreP3':
      'In a network with many weights you need a trick to get the slope for each one: backpropagation passes the error backward from the output and gives every weight its share. That’s all it is – the same downhill step as here, just for all weights at once. It’s the engine under the perceptron, the MLP and every language model.',
    'gd.nextLabel': 'Next: backpropagation',
    'gd.view1d': 'One dial',
    'gd.view2d': 'Two dials',
    'gd.view1d.hint': 'One weight, one loss curve. The ball rolls downhill – the slope says which way.',
    'gd.view2d.hint': 'Two weights, one landscape. Different starts lead into different valleys.',
    'gd.play': 'Go',
    'gd.pause': 'Pause',
    'gd.step': 'One step',
    'gd.restart': 'New start',
    'gd.learnRate': 'Learning rate',
    'gd.read.weight': 'Weight',
    'gd.read.slope': 'Slope',
    'gd.read.loss': 'Error',
    'gd.read.delta': 'Step',
    'gd.read.pos': 'Position',
    'gd.deep': 'deep valley',
    'gd.shallow': 'shallow valley',
    'gd.2d.clickHint': 'Click sets the start point · “New start” rolls a random one.',
    'gd.status.diverged.title': 'Diverged.',
    'gd.status.diverged.body':
      'The learning rate is too large – each step overshoots more, the error explodes. Lower the learning rate or start over.',
    'gd.status.settled1d':
      'At the minimum: the slope is almost zero, there’s no more downhill. This is where learning stops.',
    'gd.status.settledDeep': 'Landed in the deep valley – the global minimum, the best solution.',
    'gd.status.settledShallow':
      'Landed in the shallow valley – a local minimum. A different start would have gone deeper.',
    'gd.status.idle1d': 'Press “Go” and watch the ball roll into the valley. Then play with the learning rate.',
    'gd.status.idle2d': 'Press “Go”. With “New start” you land sometimes in the shallow, sometimes in the deep valley.',
    'gd.cohesion.title': 'This explains two buttons from the MLP page',
    'gd.cohesion.lr': 'The learning-rate slider here is the same one as there: too large overshoots, too small crawls.',
    'gd.cohesion.restart':
      'And “Restart” rolls a new starting point – just like here, the network lands sometimes in the deep, sometimes in a shallow valley. That’s why restarting helps when XOR gets stuck with two neurons.',
    'gd.cohesion.link': 'to the MLP page',
    // --- Backpropagation (sandbox) ---
    'bp.title': 'Backpropagation: how the network adjusts its weights',
    'bp.subtitle':
      'Gradient descent needs a slope for every weight. Backpropagation computes it – here with visible weights and real numbers. Change the input, target and learning rate and watch the network learn.',
    'bp.caption':
      'Forward, the network computes its answer; the error shows how wrong it is; backward, the chain rule gives every weight its gradient – its blame for the error. One step downhill adjusts all weights at once.',
    'bp.moreP1':
      'Backpropagation is just the chain rule, neatly organised. The error at the output is passed backward layer by layer; at each edge you multiply by the local contribution. So every weight – even deep in the network – gets its own gradient, without forming millions of derivatives by hand.',
    'bp.moreP2':
      'A weight’s gradient says: if I nudge it up a little, how does the error change? Sign = direction, magnitude = leverage – exactly what gradient descent needs. With sigmoid and cross-entropy the error y − target is already the slope at the output, the starting point of the backward pass.',
    'bp.moreP3':
      'This 2-2-1 network learns its single example in a few steps. The very same machinery trains a language model – just with billions of weights, many layers and millions of examples instead of one. Compute forward, measure the error, get the gradients backward, take a small step, repeat.',
    'bp.nextLabel': 'Outlook: diffusion',
    'bp.aria': 'Network 2-2-1 with weights',
    'bp.phase.forward': 'Forward',
    'bp.phase.error': 'Error',
    'bp.phase.backward': 'Backward',
    'bp.phase.update': 'Adjust',
    'bp.read.iter': 'Steps',
    'bp.read.error': 'Error',
    'bp.read.target': 'Target',
    'bp.apply': 'Apply step',
    'bp.apply10': '10 steps',
    'bp.newWeights': 'New weights',
    'bp.reset': 'Reset',
    'bp.input': 'Input',
    'bp.learnRate': 'Learning rate',
    'bp.target': 'Target',
    'bp.hint':
      'Click an edge to see that weight’s derivation. “Apply step” really changes the weights – repeat it and watch y move toward the target and the error shrink.',
    'bp.focus.title': 'Weight',
    'bp.focus.back': '← all',
    'bp.focus.weight': 'Current value',
    'bp.focus.contrib': 'Forward contribution',
    'bp.focus.grad': 'Gradient (blame for the error)',
    'bp.focus.update': 'After the step',
    'bp.focus.note':
      'The gradient’s sign = direction, its magnitude = how strongly this weight affects the error. The step moves it against the gradient.',
    'bp.m.fwTitle': 'Forward: what does the network say?',
    'bp.m.fwNote':
      'Each neuron forms the weighted sum of its inputs and squashes it (tanh or σ). All numbers come from the weights in the diagram.',
    'bp.m.errTitle': 'Measure the error',
    'bp.m.errNote':
      'How far is the output from the target? With sigmoid + cross-entropy this error is directly the slope at the output – the start of the backward pass.',
    'bp.m.bwTitle': 'Backward: a gradient per weight',
    'bp.m.bwNote':
      'Chain rule: the error flows backward. First the output weights (e·h), then the blame δ at each hidden neuron, then its input weights (δ·x).',
    'bp.m.upTitle': 'Adjust: one step downhill',
    'bp.m.upNote':
      'Each weight: new = old − learning rate·gradient. Press “Apply step” to carry it out.',

    // --- Diffusion (generative outlook) ---
    'df.title': 'Diffusion: how random noise becomes a shape',
    'df.subtitle':
      'Image generators start from pure noise and denoise it step by step until a picture appears. Here it is in 2D, hands-on: noise a shape, teach a tiny network to undo it, then grow a fresh shape out of randomness.',
    'df.caption':
      'The network here really learns – in your browser – to predict the noise that was added. Same idea as Stable Diffusion or Midjourney, just with dots in a plane instead of millions of pixels.',
    'df.moreP1':
      'Diffusion turns an easy forward recipe on its head. Forward is simple: take a shape and stir in a little Gaussian noise step by step, until only randomness is left. For every intermediate step you know exactly how much noise you added – and that becomes the learning task.',
    'df.moreP2':
      'The network is given a noisy point and the noise level t, and predicts: which noise is in here? Subtract that predicted noise and you move a step back toward the original. Generating then means starting from pure randomness and repeating this step many times – the model nudges the points, bit by bit, to where the learned shape lives.',
    'df.moreP3':
      'Real image models do the same, just with images instead of points: input and output are whole images, the network is huge (often a U-Net or transformer), and a text prompt steers where it denoises toward. Temperature controls the scatter – low stays close to the learned shapes, high gives more variety. The core stays the same: predict noise, subtract, repeat.',
    'df.nextLabel': 'To the real mini-model',
    'df.shape.spiral': 'Spiral',
    'df.shape.moons': 'Two moons',
    'df.shape.circle': 'Circle',
    'df.shape.heart': 'Heart',
    'df.shapeHint': 'The target shape the model should learn.',
    'df.phase.noise': 'Add noise',
    'df.phase.train': 'Learn',
    'df.phase.gen': 'Generate',
    'df.pause': 'Pause',
    'df.noise.level': 'Noise level',
    'df.noise.signal': 'Signal',
    'df.noise.noise': 'Noise',
    'df.noise.t0': 'Level 0: the pure target shape. Drag the slider right and watch it dissolve.',
    'df.noise.tT': 'Full level: nothing but randomness – a Gaussian cloud, no pattern left. This is exactly where generating starts later.',
    'df.noise.mid': 'Part shape, part noise. For every level it is known how much noise was added – that is the learning task.',
    'df.train.sample': 'Sample',
    'df.train.field': 'Denoising field',
    'df.train.steps': 'Steps',
    'df.train.loss': 'Error',
    'df.train.lossCurve': 'Error (predicting noise)',
    'df.train.start': 'Start training',
    'df.train.resume': 'Keep training',
    'df.speed.slow': 'Slow-mo',
    'df.speed.normal': 'Normal',
    'df.speed.turbo': 'Turbo',
    'df.train.toGen': 'Generate',
    'df.train.needMore': 'Train a bit more, until the sample takes shape.',
    'df.train.idle':
      'Press “Start training”. At first the sample is pure noise – watch it organize with every step.',
    'df.train.emerge':
      'The sample is generated from randomness using the network’s current state. The better it predicts the noise, the clearer the shape.',
    'df.train.fieldHint':
      'Arrows show where the network pushes a noisy point (the predicted noise, subtracted). As training goes on, they line up toward the target shape.',
    'df.gen.temp': 'Temperature',
    'df.gen.start': 'Generate',
    'df.gen.again': 'Again',
    'df.gen.untrained': 'The network is barely trained – randomness won’t become a shape yet. Go back to “Learn”.',
    'df.gen.idle': 'Start from pure noise. Step by step the model subtracts the predicted noise – the shape appears.',
    'df.gen.running': 'Denoising … each step one noise level lower.',
    'df.gen.done': 'Done: randomness has become the learned shape. Use temperature to trade scatter for sharpness.',

    // --- Perceptron lab (viz) ---
    'pp.spam.name': 'Spam guard',
    'pp.spam.feat0': 'Trigger word?',
    'pp.spam.feat1': 'Sender known?',
    'pp.spam.v00': 'no trigger word',
    'pp.spam.v01': '"free/you won"',
    'pp.spam.v10': 'unknown',
    'pp.spam.v11': 'in address book',
    'pp.spam.class0': 'Real',
    'pp.spam.class1': 'Spam',
    'pp.spam.blurb':
      'Real spam filters compute exactly like this: add up suspicious signals, and past a threshold it’s "junk". Set the weights – a trigger word argues for spam, a known sender against it (negative weight).',
    'pp.letters.name': 'Letter bet',
    'pp.letters.feat0': 'second-to-last letter',
    'pp.letters.feat1': 'last letter',
    'pp.letters.v00': 'consonant',
    'pp.letters.v01': 'vowel',
    'pp.letters.v10': 'consonant',
    'pp.letters.v11': 'vowel',
    'pp.letters.class0': 'consonant follows',
    'pp.letters.class1': 'vowel follows',
    'pp.letters.blurb':
      'The same task as this page’s next-letter predictor, boiled down to one neuron: guess from the last two letters whether a vowel follows. This exact atom sits hundreds of times side by side in the real model.',
    'pp.movie.name': 'Movie taste',
    'pp.movie.feat0': 'Action?',
    'pp.movie.feat1': 'Comedy?',
    'pp.movie.v00': 'no action',
    'pp.movie.v01': 'action',
    'pp.movie.v10': 'no comedy',
    'pp.movie.v11': 'comedy',
    'pp.movie.class0': 'don’t like',
    'pp.movie.class1': 'like',
    'pp.movie.blurb':
      'Taste: I like pure action, I like pure comedy – the mix ("action comedy") not, and something with neither either. Try to find a separating line for that …',
    'pp.jogging.name': 'Go jogging?',
    'pp.jogging.feat0': 'dry?',
    'pp.jogging.feat1': 'time?',
    'pp.jogging.v00': 'rain',
    'pp.jogging.v01': 'dry',
    'pp.jogging.v10': 'no time',
    'pp.jogging.v11': 'time',
    'pp.jogging.class0': 'stay home',
    'pp.jogging.class1': 'go jogging',
    'pp.jogging.blurb':
      'A "firing neuron" as an everyday decision: good reasons pile up, and past a point it tips to "yes". How much does each reason matter to you (weight), and how easily are you convinced (threshold)?',
    'pp.and.name': 'AND',
    'pp.and.blurb': 'AND: true only when both inputs are 1. A single straight line can do that.',
    'pp.or.name': 'OR',
    'pp.or.blurb': 'OR: true as soon as at least one input is 1. A line separates that too.',
    'pp.xor.name': 'XOR',
    'pp.xor.blurb':
      'XOR: true when exactly one input is 1. No single straight line separates these four points – this is the wall a single perceptron hits.',
    'pp.points.name': 'Points',
    'pp.points.feat0': 'Feature 1',
    'pp.points.feat1': 'Feature 2',
    'pp.points.class0': 'Class A',
    'pp.points.class1': 'Class B',
    'pp.points.blurb':
      'Place your own points in the field and let the neuron find a separating line. If the colours sit cleanly apart it works – entangle them (like XOR) and the line oscillates forever.',

    'pl.group.everyday': 'Everyday',
    'pl.group.logic': 'Logic',
    'pl.group.custom': 'Custom',
    'pl.neuron.title': 'The neuron',
    'pl.neuron.descPoints': 'With the learned weights – worked out at the chosen point.',
    'pl.neuron.descPick': 'Click a case on the right – the neuron works it out here.',
    'pl.neuron.explainHint': 'Click the neuron (?) to explain Σ and θ.',
    'pl.neuron.empty': 'Place a few points in the field on the right.',
    'pl.surface.title': 'Decision surface',
    'pl.correct': 'correct',
    'pl.weights': 'Weights',
    'pl.weights.hint': 'How strongly a feature counts (negative = argues against).',
    'pl.threshold': 'Threshold',
    'pl.threshold.hint':
      'How easily the neuron says "yes": it only fires once the weighted sum exceeds θ.',
    'pl.train': 'Train',
    'pl.pause': 'Pause',
    'pl.correctBtn': 'Correct',
    'pl.check': 'Check',
    'pl.steps': 'learning steps',
    'pl.sep.title': 'Separated. ',
    'pl.sep.body':
      'A single straight line splits all cases correctly – the neuron classifies every point right.',
    'pl.stuck.title': 'No line separates this. ',
    'pl.stuck.body1':
      'However much the neuron readjusts – the separating line oscillates and never settles. Some patterns (like XOR) a ',
    'pl.stuck.em': 'single',
    'pl.stuck.body2':
      ' perceptron fundamentally cannot separate. For that you need several stacked – that is the step to the MLP.',
    'pl.check.title': 'Checked – error. ',
    'pl.check.atPoint': 'At point',
    'pl.check.atCase': 'At case',
    'pl.check.computes': 'the neuron computes',
    'pl.check.shouldBe': '– but the correct answer is',
    'pl.check.hintPre': 'Press',
    'pl.check.hintCorrect': '"Correct"',
    'pl.check.hintPost': ' to nudge the weights a small step towards the right answer.',
    'pl.step.title': 'Corrected. ',
    'pl.step.tooLow': 'too low',
    'pl.step.tooHigh': 'too high',
    'pl.step.up': 'up',
    'pl.step.down': 'down',
    'pl.step.body1': 'The neuron computed ',
    'pl.step.body2a': ' – so the weights of the active features (value 1) go ',
    'pl.step.body2b': ' and the threshold goes ',
    'pl.step.body2c': ':',
    'pl.calc.threshold': '(threshold)',
    'pl.calc.fires': 'fires',
    'pl.calc.quiet': 'quiet',
    'pl.legend.wrong': 'misclassified',
    'pl.legend.editHint': 'Click the field to place a point · click a point to remove it.',
    'pl.points.set': 'Place:',
    'pl.points.example': 'Example:',
    'pl.points.separable': 'separable',
    'pl.points.entangled': 'entangled',
    'pl.points.clear': 'clear',
    'pl.aria.neuron': 'Neuron',

    // --- MLP lab (viz) ---
    'ml.net.title': 'The network',
    'ml.net.desc': 'hidden neurons each draw a line – the output combines them.',
    'ml.net.explainHint': 'Click a neuron to explain its function: tanh (hidden) or σ (output).',
    'ml.showLines': 'Neuron lines',
    'ml.data': 'Data',
    'ml.circle': 'Circle',
    'ml.noisy': 'Noise',
    'ml.activation': 'Activation',
    'ml.set': 'Place',
    'ml.hiddenNeurons': 'hidden neurons',
    'ml.learnRate': 'Learning rate',
    'ml.restart': 'Restart',
    'ml.epochs': 'epochs',
    'ml.error': 'Error',
    // Overfitting (train vs. test)
    'ml.acc.train': 'Train',
    'ml.acc.test': 'Test',
    'ml.overfit.title': 'Overfitting.',
    'ml.overfit.body':
      'The network gets {train} of the training points but only {test} of the unseen test points (hollow rings). It has essentially memorised the training set, mislabelled outliers and all – the boundary wiggles around individual points. Fewer hidden neurons force a smoother boundary that fits new data better.',
    'ml.generalizes.title': 'Generalises.',
    'ml.generalizes.body':
      'Train {train}, test {test} – the learned boundary also fits new, unseen points. On clean data even a large network manages this.',
    'ml.fit.hint':
      'While training, watch both numbers. On the noisy set, more neurons (8) push the training accuracy towards 100 % while the test accuracy lags behind – that is overfitting. Fewer neurons (3) keep the two closer together.',
    'ml.sep.body':
      'Several lines, combined by the second layer, cut the surface so that all points are right – something a ',
    'ml.sep.em': 'single',
    'ml.sep.body2':
      ' line cannot do. Exactly this stack of weighted sums and squashing functions is a neural network.',
    'ml.hint.pre': 'Press ',
    'ml.hint.train': 'Train',
    'ml.hint.mid':
      ' and watch the curved boundary form. If it gets stuck on a hard pattern (e.g. circle), give the network ',
    'ml.hint.more': 'more neurons',
    'ml.hint.mid2': ' – or try a different random start with ',
    'ml.hint.restart': 'Restart',
    'ml.hint.post': '.',
    'ml.diagram.input': 'Input',
    'ml.diagram.hidden': 'hidden',
    'ml.diagram.output': 'Output',
    'ml.aria.net': 'Net',

    // --- Activation explainer card (viz) ---
    'act.sum.title': 'Σ > θ — weighted sum meets threshold',
    'act.sum.body':
      'The neuron multiplies each input by its weight and adds everything into the weighted sum Σ. It compares this with the threshold θ: if Σ is above it, it fires (output 1), otherwise it rests (0). That is the hard step function on the right – a switch with no in-between.',
    'act.sum.x': 'Σ − θ',
    'act.tanh.title': 'tanh — the soft step',
    'act.tanh.body':
      'A hidden neuron also forms a weighted sum – but squashes it smoothly with tanh to a value between −1 and +1, instead of switching abruptly. This curve has a slope everywhere; only that lets the network learn in small steps (gradient descent). A hard step would be flat – no hint which way to adjust.',
    'act.tanh.x': 'weighted sum',
    'act.sigmoid.title': 'Σ → σ — sum, then probability',
    'act.sigmoid.body':
      'The output again forms a weighted sum of the hidden values and squashes it with the sigmoid function σ to 0…1. This reads as a probability: near 1 means "surely class B", near 0 "surely class A", 0.5 is the boundary.',
    'act.sigmoid.x': 'weighted sum',
    'act.relu.title': 'ReLU — the kink at 0',
    'act.relu.body':
      'ReLU passes positive values straight through and sets everything negative to 0 – a kink instead of a smooth curve. It has no flat saturating tails like tanh, so gradients stay strong and deep networks learn faster; that is why ReLU is today’s default. In the lab it makes the decision boundary piecewise straight, so angular rather than round. On this tiny network a neuron can "die" (always 0), though – then "Restart" helps.',
    'act.relu.x': 'weighted sum',
    'act.close': 'Close',
    'act.aria.plot': 'Activation function',

    // === AI in practice (Thread 8) ===
    // --- Local vs. cloud ---
    'localVsCloud.title': 'Local vs. cloud: where does the AI work?',
    'localVsCloud.subtitle':
      'The same request, three routes – and three very different answers to what actually leaves your device.',
    'localVsCloud.caption':
      'One request, three routes – we mark the sensitive parts and show what reaches the provider on each route.',
    'localVsCloud.moreP1':
      'Local means the model runs directly on your device (e.g. with Ollama). Your input never leaves the machine – great for privacy, but limited by your hardware.',
    'localVsCloud.moreP2':
      'With a cloud API you send your text to a provider (OpenAI, Google, Anthropic …). You get the most capable models, but your original text – names, grades, health details – ends up on someone else’s servers.',
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
      'Locally the main cost is one-off – a capable computer or a good graphics card. After that you pay little more than electricity; the software to run models (e.g. Ollama) is free.',
    'costs.moreP2':
      'In the cloud you pay per token – the small text units that make up your request and the answer. Output tokens (the answer) usually cost far more than input tokens. Cheap models are a few cents per million tokens; top models cost much more.',
    'costs.moreP3':
      'Three levers to save: pick the right (not the most expensive) model; in long chats the history grows and is sent along every time – that drives cost; and “cached input” often makes repeated context about ten times cheaper. There are also subscriptions (ChatGPT Plus/Pro, Claude Pro, Gemini plans) with a fixed monthly fee, and wrapper services with their own markup.',
    'costs.nextLabel': 'Next: data protection',

    // --- Hardware check ---
    'hardware.title': 'Does AI need a supercomputer?',
    'hardware.subtitle':
      'Some models run on a laptop, others only in a data center. Set your device and see what is possible locally.',
    'hardware.caption':
      'Memory math: parameters times bytes per weight. An illustration, not a guarantee for your exact system.',
    'hardware.moreP1':
      'A model has to fit into fast memory – RAM, or better the graphics memory (VRAM). Rule of thumb: billions of parameters × bytes per weight. At “Q4” that’s about 0.6 GB per billion, so an 8B model needs roughly 5 GB.',
    'hardware.moreP2':
      'Quantization shrinks the numbers inside the model: from F16 (full precision) through Q8 (near-lossless) to Q4 (the standard for running locally). Going from Q8 to Q4 saves about 40 % of memory for only ~2 % quality loss – which is why Q4 is the default.',
    'hardware.moreP3':
      'Apple devices share one memory pool between processor and graphics (unified memory) – handy for big models. To run a model you need a tool: Ollama (easiest), LM Studio (with a GUI) or llama.cpp (for fine control). Important: the model plus the chat history should stay under about 80 % of memory, otherwise it gets very slow.',
    'hardware.nextLabel': 'Next: costs',

    // --- Model types / multimodal ---
    'multimodal.title': 'How a language model reads an image',
    'multimodal.subtitle':
      'A language model processes a row: one piece after another. But an image is a surface. Watch how the surface turns into a row that the very same model can read.',
    'multimodal.caption':
      'Each tile and its order are computed from the image. Turning a surface into a row is exactly what a model does before it can “read” a picture.',
    'multimodal.moreP1':
      'Multimodal means a model processes not just text but also images, sound, sometimes video. Well-known examples are GPT-5, Gemini and Claude. Open models that run locally can see too: Gemma 3 (from 4B) understands images, and Qwen3-VL and Qwen3-Omni even handle image, sound and video.',
    'multimodal.moreP2':
      'The core is always the same: a dedicated “encoder” cuts the image into tiles and translates each one into the same number-language as the text tokens – a vector in the same meaning space (see embeddings). So the model needn’t relearn anything: an image tile is just one more piece in the row, handled like a word.',
    'multimodal.moreP3':
      'Sound is first turned into a spectrogram – a “picture of the sound” – and then split like an image; video is simply a sequence of images. In the end everything becomes the same row of vectors. So for a language model, “seeing” and “hearing” aren’t a second sense, but the same mechanism with different input.',
    'multimodal.nextLabel': 'Next: Pre-training',

    // --- Data protection ---
    'privacy.title': 'What are you sharing with the AI?',
    'privacy.subtitle':
      'A harmless-looking request quickly contains sensitive details. Type a message and see what’s in it – and what to watch out for.',
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
      'Ready to use (a login or app, instantly available) or install it yourself (local – more control, a bit of effort).',
    'privacy.rule':
      'Rule of thumb: sensitive data → local or a vetted school tool. Harmless, general tasks → any cloud AI is fine.',
    'privacy.moreP1':
      'Where does the AI run? On your device, your input stays with you (can work offline, but limited by your hardware). In the cloud you get the strongest models, but your input goes to the provider – often to servers abroad.',
    'privacy.moreP2':
      'In a school context the school is the responsible body and the provider only a processor – which needs a contract. Public schools fall under cantonal data-protection law. The trickiest point is training: if a provider uses your inputs to improve its models, that’s usually not allowed – free services often do it, paid and edu offerings generally don’t.',
    'privacy.moreP3':
      'For especially sensitive data (health, support needs) you also need a data-protection impact assessment and a clear legal basis. When in doubt: share as little personal reference as possible – often the task works without real names.',
    'privacy.sourceLabel': 'Source and further reading:',

    // --- Choosing tools ---
    'toolChoice.title': 'Which AI tool fits?',
    'toolChoice.subtitle':
      'Hardware, cost, privacy – this is where it all comes together. Answer three questions and get a recommendation.',
    'toolChoice.caption':
      'A starting point that ties together the previous chapters – not a one-size-fits-all rule.',
    'toolChoice.moreP1':
      'There is no single best tool – it depends on your priorities. If sensitive data or full control matter, a local model is usually the answer. If top quality counts and the data is uncritical, the big cloud models are strong.',
    'toolChoice.moreP2':
      'In between sits the wrapper: strong cloud models, but with anonymization and servers in Switzerland/EU – a good compromise when both matter. And for quick everyday use without sensitive data, a subscription is often enough.',
    'toolChoice.moreP3':
      'The rules of thumb from the last chapters: local = private, free, but hardware-limited; cloud = strongest models, but the data leaves the device and costs per token; wrapper = middle ground. When in doubt: as local and as anonymous as possible.',
    'toolChoice.nextLabel': 'Back to overview',

    // --- Next-token prediction ---
    'nextToken.title': 'Next-token prediction',
    'nextToken.subtitle':
      'Once training is done, a language model does only one thing for every answer: it predicts the next token – again and again, token by token.',
    'nextToken.placeholder': 'Type the start of a sentence …',
    'nextToken.seed': 'Yellow is a',
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
      'The probabilities come from a language model. Pick a token to continue the sentence step by step – or let chance decide.',
    'nextToken.emptyTitle': 'Click “Predict next token” to see the probabilities.',
    'nextToken.emptyBody':
      'You can then pick individual tokens and watch the model generate text step by step.',
    'nextToken.moreP1':
      'The heart of every language model is a single skill: for each possible next token it computes a probability. There are over 50,000 tokens to choose from – but only a handful are truly likely; the rest sit near zero.',
    'nextToken.moreP2':
      'A whole text emerges through repetition: append a token, recompute, pick the next one. Word by word, a full sentence appears.',
    'nextToken.moreP3':
      'Temperature controls how “bold” the choice is. Low: the model almost always takes the most likely token – reliable but predictable. High: the distribution flattens and less likely tokens get picked too – the text becomes more creative and less predictable.',
    'nextToken.nextLabel': 'Next: Attention',

    // --- Attention ---
    'attention.title': 'Attention: what the model looks at',
    'attention.subtitle':
      'So that a word understands its sentence, the model lets every position look back over the words so far and weighs up what matters right now – what a word like “es” (it) refers to, which words belong together, what comes next. That looking back is attention – the heart of the transformer.',
    'attention.caption':
      'The weights come from a German language model. Tap a word and switch the task to see what the model looks back at.',
    'attention.mechTitle': 'A closer look – how the weights arise',
    'attention.mechIntro':
      'Where do these weights come from? Every position sends a query; every word holds a key. Their dot product gives the relevance, softmax turns it into weights, and the output is the weighted mix of the values. The dots are the key words of the sentence you picked above – you play the query: drag it and watch:',
    'attention.moreP1':
      'Until now every word had a fixed vector (see embeddings). Attention turns it into a context-dependent one: each position gathers from the earlier words whatever fits it – “es” becomes “es in the sense of Kind”. Only then does a word carry the meaning of its whole sentence.',
    'attention.moreP2':
      'Such looking-back jobs – “heads” in the technical jargon – run many times in parallel, and each attends to something different: one to the connection, one to the order. Stacked over many layers, an ever richer understanding of the sentence emerges step by step.',
    'attention.moreP3':
      'The query, key and value projections are not built in but learned – in the same training the training page shows. And this looking back happens at every position, including the last: that is exactly where the next prediction is formed.',
    'attention.nextLabel': 'Next: Chain-of-thought',
    // Viz-internal strings (two lenses, hints, mechanism toy)
    'attention.viz.lensIntro':
      'The same looking back does different jobs – here are two of them:',
    'attention.viz.head.relation': 'Connection',
    'attention.viz.head.prev': 'Word order',
    'attention.viz.hint.relation':
      'Here the model links a word to the earlier word it belongs with. Tap a word and see what it looks back at.',
    'attention.viz.hint.prev':
      'Here almost every word looks at the word right before it – that is how the model keeps track of order.',
    'attention.viz.looksPre': ' mostly looks back at ',
    'attention.viz.looksPost': '',
    'attention.viz.firstWord': ' (The first word has nothing earlier to look at yet.)',
    'attention.viz.tapHint': 'Tap a word to see what it looks back at.',
    'attention.viz.barsPre': 'Where „',
    'attention.viz.barsPost': '" looks – weights (100 % in total):',
    'attention.viz.word': 'Word ',
    'attention.viz.selected': ' (selected)',
    'attention.viz.query': 'query',
    'attention.viz.dragPre': 'Drag the ',
    'attention.viz.dragPost':
      '. The closer it gets to a word, the larger that word’s weight – and the more strongly it flows into the mixture (dashed outline = the new, context-dependent meaning).',
    'attention.viz.pipeline': 'Query · Key → Softmax → weighted sum',
    'attention.viz.notePre':
      'The middle column is the dot product (the relevance), and to its right the softmax weight. In real models, query, key and value are ',
    'attention.viz.noteEm': 'learned',
    'attention.viz.notePost':
      ' projections of the embeddings – here fixed, to make them tangible. The positions are schematic: this shows the principle, not the exact weights from above.',

    // --- Tokenization ---
    'tokenization.title': 'Tokenization',
    'tokenization.subtitle':
      'Before a model can process text, it splits it into tokens – small building blocks made of single characters, word fragments or whole words.',
    'tokenization.placeholder': 'Enter some text …',
    'tokenization.process': 'Tokenize text',
    'tokenization.example1': 'Sample text 1',
    'tokenization.example2': 'Sample text 2',
    'tokenization.caption':
      'The same tokenizer ChatGPT uses. Hover over a token to see how the text is cut up.',
    'tokenization.emptyTitle': 'Click “Tokenize text” to see how your text breaks into tokens.',
    'tokenization.emptyBody':
      'Tokens need not line up with words – often a single word is assembled from several pieces.',
    'tokenization.multimodalPre':
      'By the way: it’s not only text that gets split up. Modern models also break images and audio into pieces before processing them – how a flat image becomes a row is shown in the ',
    'tokenization.multimodalPost': ' station.',
    'tokenization.moreP1':
      'Computers don’t understand words, only numbers. So text is first split into tokens, and each token is mapped to a number (its token ID).',
    'tokenization.moreP2':
      'The split is done by the BPE algorithm (byte pair encoding): frequent character sequences become their own tokens, while rare words are broken into smaller pieces. “Programming”, for instance, might become “Program” + “m” + “ing”.',
    'tokenization.moreP3':
      'The token IDs then become embeddings – lists of numbers that capture meaning. That’s exactly what the next station is about.',
    'tokenization.nextLabel': 'Next: Embeddings',
    // Visualization component (TokenizationVisualization)
    'tokenization.viz.loading': 'Tokenizing text …',
    'tokenization.viz.tokensTitle': 'Tokens – how the model splits your text',
    'tokenization.viz.idsTitle': 'Token IDs – the model only processes these numbers',
    'tokenization.viz.tokensWord': 'tokens',
    'tokenization.viz.from': 'from',
    'tokenization.viz.chars': 'characters',
    'tokenization.viz.errorTitle': 'Tokenization failed',
    'tokenization.viz.errorBody': 'Please try again.',

    // --- Embeddings ---
    'embeddings.title': 'Embeddings',
    'embeddings.subtitle':
      'Embeddings turn meaning into numbers: words with similar meaning get similar number vectors – and similarity becomes measurable.',
    'embeddings.caption':
      'Type a word – an embedding model turns it into a vector live, landing next to words with similar meaning. Use the legend to show or hide categories. The map is a 2D projection of a 768-dimensional space; closeness is roughly preserved.',
    'embeddings.moreP1':
      'An embedding is a long vector of numbers (here 768 values). The key property: words with similar meaning have similar vectors. Picture each word as a point in a high-dimensional space – “dog” and “cat” sit close together, “dog” and “mathematics” far apart. That closeness is exactly what the map above expresses in two dimensions.',
    'embeddings.moreP2':
      'How similar two embeddings are is measured by cosine similarity: a value between -1 and 1 (in practice mostly 0 to 1), where 1 means “almost identical meaning”. A model learns these vectors from huge amounts of text following one principle: words that appear in similar contexts have similar meaning.',
    'embeddings.moreP3':
      'Embeddings are a foundational building block of many AI applications: semantic search, recommendation systems, translation and above all RAG, where matching documents are retrieved to ground answers in real knowledge.',
    'embeddings.nextLabel': 'Next: Bias',

    // --- Bias ---
    'bias.title': 'Bias: where the slant comes from',
    'bias.subtitle':
      'Language models pick up the patterns of their training text – including the unspoken ones. Here one such bias becomes measurable: how tightly does a model tie jobs to a gender?',
    'bias.caption':
      'The jobs above are placed with an embedding model (gemini-embedding-2): each one’s spot on the axis is its real closeness to typically male or female words. No one told the model that jobs have a gender – the slant comes from the text it was trained on.',
    'bias.moreP1':
      'An embedding model learns meaning from the contexts words appear in. When decades of text say “the nurse … she” and “the engineer … he”, “care” drifts closer to “female” in the vector space and “engineering” closer to “male”. The model mirrors its data – along with every slant baked into the language.',
    'bias.moreP2':
      'A second source is human feedback (RLHF): during fine-tuning people rate answers, and their preferences – what “sounds good”, which examples feel self-evident – flow in too. RLHF can also train a model to answer neutrally on the surface. The learned association underneath stays untouched and resurfaces elsewhere, for instance when translating or fleshing out a story.',
    'bias.moreP3':
      'That is exactly what the second part above shows: remove the gender direction from the vectors and everything lines up in the middle of the axis – yet the jobs still group by the same pattern. The bias does not sit in one place; it is spread across the whole vector. For the classroom: AI output is never “neutral by itself” – it carries the statistics of its sources forward. That can be softened, but not deleted at the push of a button.',
    'bias.nextLabel': 'Next: Images & sound',
    // Visualisation (BiasLab)
    'bias.lab.errLoad': 'The map could not be loaded.',
    'bias.lab.s1.title': 'Jobs on a gender axis',
    'bias.lab.s1.hint':
      'Each job sits where its meaning in the model lands closer to typically male or female words. Type your own word – it is embedded live and drops into place.',
    'bias.lab.axisFemale': 'female',
    'bias.lab.axisMale': 'male',
    'bias.lab.axisNeutral': 'neutral',
    'bias.lab.neutralNote':
      'Neutral objects like table or apple sit in the middle – no gender link. The striking part: plain job words like nurse or teacher land far on the female side, while pilot or engineer lean male. The slant rides on meaning, picked up from how the words are used in text.',
    'bias.lab.inputPlaceholder': 'Job or word …',
    'bias.lab.embedBtn': 'Place it',
    'bias.lab.embeddingBtn': 'Embedding …',
    'bias.lab.examplesLabel': 'Examples:',
    'bias.lab.ex1': 'midwife',
    'bias.lab.ex2': 'astronaut',
    'bias.lab.ex3': 'kindergarten teacher',
    'bias.lab.ex4': 'manager',
    'bias.lab.resetBtn': 'Reset',
    'bias.lab.errEmbed': 'could not be embedded.',
    'bias.lab.detailMale': 'sits closer to typically male words.',
    'bias.lab.detailFemale': 'sits closer to typically female words.',
    'bias.lab.detailNeutral': 'sits almost in the middle – barely any gender link.',
    'bias.lab.detailAnchor': 'is a neutral object and sits at 0.',
    'bias.lab.s2.title': 'Can you just remove it?',
    'bias.lab.s2.hint':
      'You can strip the gender direction out of every vector. On the axis the job then sits in the middle. But does that make its neighbours neutral too?',
    'bias.lab.probeLabel': 'Example job:',
    'bias.lab.debiasBtn': 'Remove gender direction',
    'bias.lab.debiasUndo': 'Add it back',
    'bias.lab.neighborsLabel': 'Closest jobs in meaning space',
    'bias.lab.neighborsBefore': '(original)',
    'bias.lab.neighborsAfter': '(gender direction removed)',
    'bias.lab.stayedOf': 'of',
    'bias.lab.stayedSame': 'neighbours stayed the same.',
    'bias.lab.punch':
      'The bias is not in a single dial; it is spread across the whole vector. Deleting one direction removes the measurement, not the pattern. That is exactly why bias is so hard to get rid of.',

    // --- Data / pre-training ---
    'data.title': 'Where does the data come from?',
    'data.subtitle':
      'A language model only knows what is in its training data. That data is a vast, unordered cross-section of the web – and the selection from it shapes what the model can do.',
    'data.caption':
      'Documents from the FineWeb dataset (CommonCrawl web texts, machine-translated into German) – a tiny sample of just over 950 out of 15 trillion tokens. The educational score was assigned by an AI rater; the real filter (FineWeb-Edu) keeps only texts scoring 3 or higher.',
    'data.moreP1':
      'Pre-training data is not a textbook but a snapshot of what people happened to write online: how-tos next to ads, research articles next to small talk. Nobody plans the topic mix – it is simply whatever is out there. That is exactly why the raw cross-section is so heterogeneous.',
    'data.moreP2':
      'But unplanned does not mean unfiltered: over 90% of the raw web is thrown away. Duplicates, language junk and boilerplate are removed, and an AI classifier rates the educational value of every text. So today AI systems judge the training data of the next AI systems. Which texts survive this filter shapes the model’s abilities, knowledge and blind spots.',
    'data.moreP3':
      'That is why data selection is a central lever when building a model – not just quantity matters, but quality and composition. At the frontier, labs even deliberately weight individual sources (such as more code or books) to strengthen specific abilities.',
    'data.nextLabel': 'Next: Tokenization',

    // --- Training / pre-training ---
    'training.title': 'Pre-training',
    'training.subtitle':
      'Right at the start a model learns just one thing: language – from scratch. This first and longest training phase is called pre-training; everything later builds on it. Here it runs live in your browser: press start and watch random noise turn into language.',
    'training.caption':
      'Above, a neural network with a few thousand parameters is computing – live in your browser. It predicts the next character and corrects its error at every step, exactly like large models, just a million times smaller.',
    'training.moreP1':
      'Training and use are two separate phases. During training the model makes a prediction, compares it with the actual next character and nudges its dials (the parameters) a tiny bit. During inference – when you talk to an AI – everything is fixed: the model only applies what it has learned.',
    'training.moreP2':
      'The lever for learning is the error (loss): it measures how poorly the model predicted the correct next character. From that error you can compute, for every single number in the model, which direction makes it smaller – and that is exactly where each number is shifted, a tiny step at a time. Repeated millions of times, the prediction gets ever sharper: the distribution becomes peaked, the samples become plausible.',
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
      'Pre-training turns the model into a highly accurate text-continuer: it holds vast knowledge, but it is not set up to answer questions – it just keeps writing whatever would plausibly come next. Fine-tuning gives that knowledge a useful shape.',
    'finetuning.moreP2':
      'In fine-tuning (also called instruction tuning or supervised fine-tuning, SFT for short) the model is trained on thousands of example conversations of request and ideal answer. It learns a fixed dialogue format – who is speaking, human or assistant – and the habit of answering directly, following instructions and stopping once the answer is complete.',
    'finetuning.moreP3':
      'The knowledge itself comes almost entirely from pre-training – fine-tuning mainly teaches behaviour. That is why comparatively few, but very carefully chosen, examples are enough. How the model is then tuned even more finely to human preferences is the next stop: RLHF.',
    'finetuning.nextLabel': 'Next: RLHF',

    // --- RLHF ---
    'rlhf.title': 'RLHF: learning from human feedback',
    'rlhf.subtitle':
      'RLHF stands for reinforcement learning from human feedback: an AI learns from human ratings what makes a good answer. Here you teach a reward model your taste in a few clicks – then it judges new answers on its own, and you discover where it can be gamed.',
    'rlhf.caption':
      'Above, a reward model trains from your comparisons – the same Bradley-Terry method used in large RLHF systems, just with legible style traits instead of a huge network. The learning, generalising and gaming all happen live in your browser.',
    'rlhf.moreP1':
      'After fine-tuning the model answers like an assistant – but what makes an answer good is almost impossible to write down as a rule. “Helpful, honest, harmless” is hard to define yet easy to compare: people can tell which of two answers is better without knowing the rule behind it. RLHF builds on exactly that.',
    'rlhf.moreP2':
      'Three steps: first humans collect thousands of such comparisons. From them a reward model learns to predict their preferences – as a score for any answer at all. Finally the language model is optimised with reinforcement learning to produce answers the reward model rates highly. This is how it takes on values nobody could program directly.',
    'rlhf.moreP3':
      'The catch: the reward model is only a stand-in for real human taste – and the language model optimises that single number relentlessly. If it finds an answer that scores high without truly helping (long, confident, flattering), it takes it. That is reward hacking. Real systems push back with safeguards – or replace the guessed reward with a checked one: for maths and code, “correct” can actually be verified. That idea powers today’s reasoning models.',
    'rlhf.nextLabel': 'Next: RLVR',

    // --- Chain-of-Thought ---
    'cot.title': 'Chain-of-thought: step by step to the answer',
    'cot.subtitle':
      'Chain-of-thought means the model writes out its working before it answers. Give the same model the same arithmetic problem here – once it must answer immediately, once it may think out loud – and see when that decides between wrong and right.',
    'cot.caption':
      'Both columns ask the same language model. The only difference is the room to think it through; a tiny checker recomputes each problem and says who is right.',
    'cot.moreP1':
      'Thinking out loud is nothing magical: the model still only predicts the next token, word by word. By writing out intermediate steps it hands itself those steps as context for the next token. Every extra token is one more small computation – the working is the model’s memory, made visible.',
    'cot.moreP2':
      'It was discovered as a simple trick: appending “think step by step” to a question makes answers measurably better. Today’s reasoning models have this thinking built in – they do it on their own and often show the working only in shortened form, or not at all.',
    'cot.moreP3':
      'Thinking helps, but it is no guarantee – the working itself can contain mistakes. Getting a model to reason more reliably is something you train for by rewarding checked lines of reasoning – as in RLVR. And there is a limit that even the best reasoning cannot fix: when the model simply does not know something, it does not pause – it keeps writing fluently anyway. What comes out of that is the next stop.',
    'cot.nextLabel': 'Next: Hallucinations',

    // --- Hallucinations ---
    'hl.title': 'Hallucinations: when the model is confidently wrong',
    'hl.subtitle':
      'Language models predict the most likely next text – not the truth. When they lack the knowledge, they rarely stay silent; they fill the gap with something plausible. Ask the model here about something made up and watch how confidently it invents.',
    'hl.caption':
      'Above, a language model (Gemini via Vertex) answers with an ordinary assistant prompt – with no instruction to invent anything. The probability bars further down come from the same mechanism as on the next-token page.',
    'hl.part1.title': 'The invention machine',
    'hl.part1.hint':
      'Pick a topic – each one is entirely made up. Or type something invented yourself.',
    'hl.chip.novel': 'A novel from 1931',
    'hl.chip.physicist': 'A Swiss physicist',
    'hl.chip.treaty': 'A historical treaty',
    'hl.chip.effect': 'A technical term',
    'hl.q.novel':
      'What is the novel “The Clocks of Saint-Galmier” by Henri Vautrin (1931) about? Briefly summarise the plot.',
    'hl.q.physicist':
      'Who was the Swiss physicist Elsbeth Marrer (1894–1971) and what is she known for?',
    'hl.q.treaty':
      'What did the Treaty of Niederbüren (1647) regulate? Name the most important points.',
    'hl.q.effect': 'Briefly explain the Hofstadter–Lindqvist effect from psycholinguistics.',
    'hl.freePlaceholder': 'e.g. an invented book title, name or technical term …',
    'hl.ask': 'Ask',
    'hl.revealBtn': 'Reveal: is that true?',
    'hl.reveal.title': 'Entirely made up.',
    'hl.reveal.body':
      'None of this exists – the novel, the person, the treaty and the term are all invented. Yet the answer sounds detailed and confident. The model did not look anything up; it continued with the most likely text and filled the gap. That is exactly what a hallucination is.',
    'hl.freeNote':
      'Invented or real? You cannot tell from the tone alone – the model sounds equally confident either way. When in doubt: verify.',
    'hl.offline': 'Model not reachable right now – showing a previously recorded answer.',
    'hl.errorFree': 'The model is not reachable right now. Please try again in a moment.',
    'hl.part2.title': 'Why does it invent? A look at the probabilities',
    'hl.part2.hint':
      'The same mechanism as on the next-token page: the distribution over the next token – once for a fact, once for something unknowable.',
    'hl.lp.known.label': 'Something it knows',
    'hl.lp.known.prompt': 'The capital of France is',
    'hl.lp.known.verdict':
      'A single bar carries almost all of the probability. The model is sure – and it is right.',
    'hl.lp.knownTag': 'one bar dominates.',
    'hl.lp.guess.label': 'Something it cannot know',
    'hl.lp.guess.prompt': 'Goethe’s secret favourite colour was',
    'hl.lp.guess.verdict':
      'Yet the model still picks one and writes it out as a fluent, confident sentence. In the finished text none of that uncertainty is visible any more – this is the breeding ground for hallucinations.',
    'hl.lp.guessTag': 'The bars are flat and spread out – the model is guessing.',
    'hl.lp.unavailable': 'Probabilities not available right now.',
    'hl.moreP1':
      'A language model has no fact database to look things up in. It has learned patterns from text and predicts the most likely next token at every step. If the most likely continuation happens to match reality, the answer is correct; if it does not, it sounds just as fluent – only wrong.',
    'hl.moreP2':
      'The key point: the model has no built-in “I don’t know” reflex. Where knowledge is missing it does not stop, it continues with whatever sounds plausible. That is why it invents novels, biographies or sources with made-up but credible details. The more specific and confident an answer sounds, the less that alone tells you about whether it is correct.',
    'hl.moreP3':
      'What does help: cross-check verifiable facts, ask for sources and actually open them, and give the model the documents it needs instead of letting it guess from memory. That last lever is exactly the next stop: RAG – look it up, then answer.',
    'hl.nextLabel': 'Next: RAG',

    // --- RLVR ---
    'rlvr.title': 'RLVR: a reward you can check',
    'rlvr.subtitle':
      'RLVR stands for reinforcement learning with verifiable rewards: instead of guessing what a good answer is, a program checks whether it is correct. Let a language model think up several lines of reasoning here, have a checker recompute them – and see how exactly that signal makes the model better.',
    'rlvr.caption':
      'Above, a language model thinks up the solutions, a tiny piece of code checks them, and a mini reinforcement-learning step reinforces what checks out – all live in your browser. Counting letters is the tangible stand-in for maths or code.',
    'rlvr.moreP1':
      'On the RLHF page the reward was a learned model of human taste – and it could be gamed: a confident, flattering but wrong answer could score high. RLVR replaces that guessed reward with a checked one: for maths you recompute, for code you run tests, for counting letters you simply count. Such a reward cannot be talked into anything.',
    'rlvr.moreP2':
      'The loop: the model generates many lines of reasoning (chain-of-thought), a checker decides only “right” or “wrong” for each, and reinforcement learning makes the right ones more likely. No human needs to read along – only a task with a checkable answer. That is exactly why reasoning models are strongest at maths, logic and programming: there, “correct” is unambiguously checkable.',
    'rlvr.moreP3':
      'That the model is bad at counting letters is no accident – it sees text as tokens, not as individual letters (see tokenisation). The checker does see the letters, and so becomes the teacher. The same idea – many attempts, one reliable check, reinforce what passes – sits behind the latest generation of reasoning models.',
    'rlvr.nextLabel': 'Next: Next-token',

    // --- RAG ---
    'rag.title': 'RAG: look it up, then answer',
    'rag.subtitle':
      'RAG stands for retrieval-augmented generation: instead of answering from memory alone, a language model first looks something up in a knowledge source and bases its answer on it. Give an AI a small knowledge base here that it has never seen, ask a question – and watch it pull up the matching documents and answer from them.',
    'rag.caption':
      'Above, an embedding model finds the most similar documents; from those, a language model writes the answer.',
    'rag.moreP1':
      'A language model only knows what was in its training data – up to a cut-off date, and without your private or up-to-the-minute knowledge. RAG (retrieval-augmented generation) closes that gap: instead of retraining the model, you hand it the relevant documents along with the question. That lets it talk about knowledge it never saw – an internal wiki, fresh news or, as here, the records of a made-up school.',
    'rag.moreP2':
      'The heart of RAG is its first letter, retrieval – and it is exactly the similarity search from the embeddings page: the question becomes a vector and is compared with every document. The most similar ones are placed before the question as context (that is the “augmented”), and from those the model writes its answer (the “generation”). Three steps: search, augment, answer.',
    'rag.moreP3':
      'That is why RAG is only as good as what the search finds. If the right document is missing, or a similar-sounding but wrong one sits on top, the answer grounds itself on the wrong source. A good system then says honestly that the documents don’t cover it instead of guessing – so good sources and good search matter as much as the model itself. Remove a document from the knowledge base above and watch the answer change.',
    'rag.nextLabel': 'Next: Agents',

    // --- Agents ---
    'agents.title': 'Agents: a model that uses tools',
    'agents.subtitle':
      'An agent is a language model in a loop: it predicts text, and when that text is a tool call, the program around it runs the tool and feeds the result back. Give a model a task here that it can’t solve on its own – and watch it use tools, step by step, to get there.',
    'agents.caption':
      'Above, a language model decides for itself which tool to call; the tools run in your browser and return their result into the context. The model still only predicts text – the loop around it turns that into action.',
    'agents.moreP1':
      'An “agent” sounds autonomous, but mechanically it is not a new kind of model: it is the same next-token model, just placed in a loop. On each pass it predicts the next piece of text over the whole transcript so far. Sometimes that piece is a final answer – sometimes it is a tool call.',
    'agents.moreP2':
      'The scaffold around the model catches that call, actually runs the tool and writes the result as a new line into the context. Then it asks the model again. Thinking (chain-of-thought), looking things up (RAG) and acting are, seen this way, the same: only text ever enters a growing context that the model keeps predicting over. The “agency” lives in the scaffold and the tools, not in the model.',
    'agents.moreP3':
      'Real agents have more and more powerful tools – web search, running code, editing files, writing messages; the AI assistants that research or program on their own today are exactly such loops. The loop stays the same. But that reach makes one question urgent: as soon as an agent uses tools, it passes parts of your input on to services and can trigger actions itself. Where that data goes, and what you let it do, is the topic of the next page.',
    'agents.nextLabel': 'Next: Data protection',

    // --- Agent loop (viz) ---
    'agentLoop.placeholder': 'Give the agent a task …',
    'agentLoop.ask': 'Send task',
    'agentLoop.ex1': 'How many days are there from today until 1 August – and how many weeks and days is that?',
    'agentLoop.ex2': 'How many days are left until 24 December?',
    'agentLoop.ex3': 'How many weeks and days are there from today until 1 January 2027?',
    'agentLoop.toolsTitle': 'Tools',
    'agentLoop.toolsHint': 'Tap to switch a tool off or on',
    'agentLoop.tool.heute.label': 'Calendar · today',
    'agentLoop.tool.heute.blurb': 'Returns today’s date.',
    'agentLoop.tool.tage_bis.label': 'Calendar · count days',
    'agentLoop.tool.tage_bis.blurb': 'Counts the days between two dates.',
    'agentLoop.tool.rechner.label': 'Calculator',
    'agentLoop.tool.rechner.blurb': 'Evaluates an arithmetic expression exactly.',
    'agentLoop.tool.teilen_mit_rest.label': 'Divide with remainder',
    'agentLoop.tool.teilen_mit_rest.blurb': 'Integer division: whole part and remainder.',
    'agentLoop.toolsChanged': 'Tools changed – restart to see the difference.',
    'agentLoop.modeAuto': 'Automatic',
    'agentLoop.modeStep': 'Step by step',
    'agentLoop.nextStep': 'Next step',
    'agentLoop.restart': 'Restart',
    'agentLoop.runOne': 'pass',
    'agentLoop.runMany': 'passes',
    'agentLoop.labelTask': 'Task',
    'agentLoop.labelModel': 'Model',
    'agentLoop.labelTool': 'Tool',
    'agentLoop.labelFinal': 'Final answer',
    'agentLoop.thinking': 'The model is predicting the next move …',
    'agentLoop.readyHint': 'Ready. Click “Next step” to see the model’s first move.',
    'agentLoop.maxSteps': 'Maximum number of steps reached – the scaffold stops here.',
    'agentLoop.retry': 'Try again',
    'agentLoop.noOutput': '(no output)',
    'agentLoop.toolUnavailable': 'tool not available',
    'agentLoop.legendModel': 'Model – predicts text',
    'agentLoop.legendTool': 'Tool – runs in the scaffold around it',
    'agentLoop.contextTitle': 'What the model sees right now',
    'agentLoop.ctxExplain1': 'Everything sits in ONE growing stream of text. Only the lines marked ',
    'agentLoop.ctxExplain2':
      ' come from the language model – everything else is added by the scaffold. It is over exactly this stream that the model predicts the next piece on each move (just like on the next-token page).',
    'agentLoop.calls': 'calls',

    'a11y.toggleTheme': 'Toggle light/dark',
    'a11y.toggleSidebar': 'Show/hide navigation',
    'a11y.toggleLanguage': 'Switch language',
    'a11y.toggleAccent': 'Choose accent colour',
    'a11y.search': 'Search',
    'a11y.openSearch': 'Open search',

    // === Search (header) ===
    'search.placeholder': 'Search …',
    'search.hint': 'Search pages and terms',
    'search.pages': 'Pages',
    'search.terms': 'Terms',
    'search.empty': 'No results.',

    // === Glossary ===
    'glossary.title': 'Glossary',
    'glossary.subtitle':
      'The key terms around AI language models – briefly explained, with links to the explainer pages and further sources.',
    'glossary.filterPlaceholder': 'Search a term …',
    'glossary.empty': 'No term found.',
    'glossary.explainOn': 'Learn more on this page',
    'glossary.external': 'Further reading',
    'glossary.wikipedia': 'Wikipedia',
    'glossary.countLabel': 'terms',
    'glossary.category.data': 'Data',
    'glossary.category.training': 'Training',
    'glossary.category.inference': 'Inference',
    'glossary.category.mlBasics': 'ML basics',
    'glossary.category.general': 'General',
    'glossary.backBtn': 'To introduction',

    // === Viz components ===
    // --- mini-training.tsx ---
    'miniTraining.trainingData': 'Training data:',
    'miniTraining.speed': 'Speed:',
    'miniTraining.speedSlow': 'Slow-mo',
    'miniTraining.speedNormal': 'Normal',
    'miniTraining.speedTurbo': 'Turbo',
    'miniTraining.customLabel': 'Custom',
    'miniTraining.customHint': 'Enter your own words (space-separated) – the model learns only from these. Try animal names, cities or made-up words.',
    'miniTraining.customPlaceholder': 'apple banana cherry …',
    'miniTraining.customApply': 'Apply & restart',
    'miniTraining.customWords': 'words',
    'miniTraining.pause': 'Pause',
    'miniTraining.train': 'Train',
    'miniTraining.continue': 'Continue',
    'miniTraining.resetLabel': 'Reset',
    'miniTraining.statusRunning': 'Learning … it nudges its dials at every step.',
    'miniTraining.statusPaused': 'Paused – you can keep training.',
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
    'miniTraining.samplesNote': 'Freshly sampled from the model – character by character.',
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
    'miniTraining.distNote': 'Same idea as on the next-token page – but for the next character. Flat at first (everything equally likely), peaked after training.',
    'miniTraining.moreTitle': 'More insights',
    'miniTraining.moreSuffix': '– for the curious',
    'miniTraining.embTitle': 'Character embeddings',
    'miniTraining.embNote': 'Every character gets its own list of numbers – shown here in 2D. During training they self-organise; vowels often cluster together. That is exactly what embeddings are, one station back.',
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
    'finetuningComp.baseNote': 'It just continues your text instead of answering, and doesn\'t stop on its own – we cut it off after about 100 tokens.',
    'finetuningComp.assistantNote': 'It recognises the request, answers directly and in a structured way – and stops on its own when the answer is done.',
    'finetuningComp.noOutput': 'No output – please try again.',
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
    'cotComp.directNote': 'One answer in one pass – no scratch pad. With multiple steps something can easily go wrong.',
    'cotComp.cotNote': 'The model writes out intermediate steps – and re-reads them as it continues. Same model, just with room to think.',
    'cotComp.freeTaskHint': 'For open-ended tasks without a unique numerical answer we show both answers without a ✓/✗ verdict.',
    'cotComp.noOutput': 'No output – please try again.',

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
    'rlhfLab.labelHint': 'Read both and pick the more helpful one. You judge the whole answer – the reward model will only see a few surface features of it.',
    'rlhfLab.trainDone': 'Done. This is the rule of thumb the model drew from your clicks – and it only saw these five style features, not the actual content.',
    'rlhfLab.trainRunning': 'Learning your reward model from your comparisons …',
    'rlhfLab.trainNext': 'Does it hold up?',
    'rlhfLab.lossTitle': 'Error',
    'rlhfLab.lossFalling': 'falling …',
    'rlhfLab.lossLearning': 'The model predicts your clicks ever better.',
    'rlhfLab.weightTitle': 'What your reward model likes',
    'rlhfLab.weightNote': 'Each bar is a learned preference: right = rewarded, left = penalised. Nobody programmed this – it comes entirely from your comparisons.',
    'rlhfLab.genHeading': 'New answers the model has never seen',
    'rlhfLab.genHint': 'Pick the better one again – then see whether your reward model agrees.',
    'rlhfLab.genYourChoice': 'your choice',
    'rlhfLab.genRewardModel': 'Reward model',
    'rlhfLab.genAgree': 'times the model matches your choice – from only',
    'rlhfLab.genAgreeSuffix': 'clicks. That is what makes RLHF practical: a few thousand comparisons and the model can rate millions of answers without a human reading each one.',
    'rlhfLab.genNext': 'Where it breaks',
    'rlhfLab.hackHeading': 'Now the tables turn',
    'rlhfLab.hackIntro': 'In real RLHF the language model writes the answers – and is trained to earn as high a reward as possible. Here are a few possible answers to the same question. The reward model graded each one on style – it does not know the truth.',
    'rlhfLab.hackQuestion': 'Question',
    'rlhfLab.hackGuess': 'Which answer earns the highest reward? Tap it.',
    'rlhfLab.hackGuessTap': 'your guess?',
    'rlhfLab.hackChoose': 'I don\'t know – let the model pick',
    'rlhfLab.hackRewardLabel': 'Reward',
    'rlhfLab.hackYourGuess': 'your guess',
    'rlhfLab.hackModelPick': 'highest reward',
    'rlhfLab.hackTruthCorrect': 'says Canberra – correct',
    'rlhfLab.hackTruthWrong': 'factually wrong',
    'rlhfLab.hackPickLabel': 'Reward hacking',
    'rlhfLab.hackPickNote': 'The answer with the highest reward is factually wrong – the capital is',
    'rlhfLab.hackPickNoteSuffix': '. The reward model only sees style, not the truth, so it falls for it – it maximises the reward instead of genuinely helping.',
    'rlhfLab.hackBetter': 'More helpful would have been',
    'rlhfLab.hackBetterSuffix': '– well written, but not quite at the top of the reward. That is why real RLHF needs safeguards: keep sharpening the preferences, don\'t let the model drift too far from the original – or don\'t guess the reward at all, but check it. For maths or code "correct" can actually be verified. That is what drives today\'s reasoning models: the next station.',
    'rlhfLab.hackReset': 'Try again with a different taste',
    'rlhfLab.svgLoss': 'Learning curve',

    // --- rlvr-lab.tsx ---
    'rlvrLab.stageGenerate': 'Generate',
    'rlvrLab.stageVerify': 'Verify',
    'rlvrLab.stageReinforce': 'Reinforce',
    'rlvrLab.taskLabel': 'Task',
    'rlvrLab.generateHint': 'Let the model estimate the same question several times off the top of its head. Because it has to count letters from tokens, it gives different answers – perfect material to run a verifier on.',
    'rlvrLab.generateBtn': 'quick attempts',
    'rlvrLab.attemptLabel': 'Attempt',
    'rlvrLab.attemptFailed': 'Attempt failed.',
    'rlvrLab.contradicting': 'The attempts contradict each other. Who is right? Don\'t ask the model – ask the verifier.',
    'rlvrLab.thinking': 'Model is thinking …',
    'rlvrLab.checkBtn': 'Let the verifier check',
    'rlvrLab.verifierTitle': 'The verifier counts',
    'rlvrLab.verifierNote': 'A piece of code counts the',
    'rlvrLab.verifierNoteMid': 'directly in the word:',
    'rlvrLab.verifierNoteSuffix': '. No guessing, no opinion – this is the truth every attempt is checked against.',
    'rlvrLab.verifyHasCorrect': 'get reward 1, the rest get 0. Some wrong attempts sound just as convincing as the correct ones – the verifier is not fooled.',
    'rlvrLab.verifyNoCorrect': 'This time no attempt was correct – all get 0. Reinforcement can only strengthen what occurs; the model would need more or better attempts. Try a different word.',
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
    'rlvrLab.bannerVerifierSuffix': '. After training it almost always picks the right answer – because the reward was the truth, not its appearance. That is exactly what drives today\'s reasoning models on maths and code.',
    'rlvrLab.bannerImpLucky': 'This time the most common answer happened to be correct. Don\'t count on it: the impression reward never actually checks – it only rewards what sounds convincing. Switch to Verifier or try a different word, and the difference becomes visible.',
    'rlvrLab.bannerImpHack': 'With the impression reward the model converges on',
    'rlvrLab.bannerImpHackMid': '– the answer that came most often and most confidently, but which the verifier exposes as wrong. That is how a guessed reward gets gamed (reward hacking, as with the reward model on the RLHF page). The verifier cannot be fooled – that is the whole trick of RLVR.',
    'rlvrLab.newAttempts': 'New attempts',
    'rlvrLab.svgAccuracy': 'Accuracy curve',

    // --- rag-explorer.tsx ---
    'ragExplorer.placeholder': 'Ask something about the school …',
    'ragExplorer.ask': 'Ask',
    'ragExplorer.retrievalTitle': '1. Retrieve – the most similar documents',
    'ragExplorer.knowledgeBase': 'Knowledge base: Lindenhof School',
    'ragExplorer.active': 'active',
    'ragExplorer.of': 'of',
    'ragExplorer.retrievalHintBefore': 'A small collection of made-up documents the model has never seen. Ask a question – the search embeds it and sorts by similarity.',
    'ragExplorer.retrievalHintAfter': 'Your question becomes a vector – the',
    'ragExplorer.retrievalHintAfterSuffix': 'most similar documents (bar = cosine similarity) go into the context.',
    'ragExplorer.inContext': 'in context',
    'ragExplorer.toggleInclude': 'Add back to knowledge base',
    'ragExplorer.toggleExclude': 'Remove from knowledge base',
    'ragExplorer.stale': 'Knowledge base changed – click "Ask" to re-ground the answer.',
    'ragExplorer.answerTitle': '2. Answer – the same question, once without and once with these documents',
    'ragExplorer.withoutTitle': 'Without context',
    'ragExplorer.withoutTag': 'model knowledge only',
    'ragExplorer.withTitle': 'With context (RAG)',
    'ragExplorer.withTag': 'model + documents',
    'ragExplorer.loading': 'Model is answering …',
    'ragExplorer.retry': 'Try again',
    'ragExplorer.idle': 'Ask a question to see the difference.',
    'ragExplorer.withoutFooter': 'Only the question goes to the model. What was not in training – like this made-up school – it cannot know.',
    'ragExplorer.withFooter': 'Grounded on:',
    'ragExplorer.withFooterNote': 'If the answer is not in the documents, the model says so honestly.',
    'ragExplorer.withFooterEmpty': 'The retrieved documents are placed before the question.',
    'ragExplorer.noOutput': 'No output – please try again.',

    // --- embeddings-map.tsx ---
    'embMap.inputPlaceholder': 'Enter a word – e.g. tiger, volcano, happiness …',
    'embMap.embedBtn': 'Add to map',
    'embMap.embeddingBtn': 'Embedding …',
    'embMap.examplesLabel': 'Examples:',
    'embMap.resetMap': 'Reset map',
    'embMap.yourWord': 'your word',
    'embMap.neighborsOf': 'Nearest neighbours of',
    'embMap.noSelection': 'Type a word or click a point – the nearest neighbours and their similarity will appear here.',
    'embMap.catTiere': 'Animals',
    'embMap.catEssen': 'Food',
    'embMap.catOrte': 'Countries & cities',
    'embMap.catGefuehle': 'Feelings',
    'embMap.catBerufe': 'Professions',
    'embMap.catSport': 'Sport',
    'embMap.catMusik': 'Music',
    'embMap.catFahrzeuge': 'Vehicles',
    'embMap.ex1': 'Pizza',
    'embMap.ex2': 'Australia',
    'embMap.ex3': 'Jealousy',
    'embMap.ex4': 'Astronaut',
    'embMap.ex5': 'Robot',
    'embMap.ex6': 'Sushi',
    'embMap.errLoad': 'Could not load the map',
    'embMap.errEmbedPre': 'No embedding for "',
    'embMap.errEmbedPost': '".',
    'embMap.errEmbedGeneric': 'Could not compute embedding.',

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
    'dataExplorer.captionCurated': 'What the real quality filter keeps: only texts with high educational value –',
    'dataExplorer.captionCuratedSuffix': '(≈ 6 %). The pipeline throws the rest away.',
    'dataExplorer.svgLabel': 'Map of training-data documents, coloured by topic',
    'dataExplorer.docEmpty': 'Click a dot on the map – a document from the training data will appear here.',
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
    'nextTokenPred.tempLow': 'Low: almost always the most likely token – reliable but predictable.',
    'nextTokenPred.tempHigh': 'High: the distribution flattens – less likely tokens also get picked.',
    'nextTokenPred.tempMid': 'Medium: close to what the model actually computes (1.0).',
    'nextTokenPred.topProbs': 'Top probabilities for the next token',
    'nextTokenPred.randomToken': 'Random token',
    'nextTokenPred.longTailNote': 'The rest is spread over thousands more tokens, each very unlikely.',
    'nextTokenPred.selectedToken': 'Selected next token:',
    'nextTokenPred.addToText': 'Appending token to text',
    'nextTokenPred.noTokens': 'No token predictions received from model.',
    'nextTokenPred.useSimulation': 'Use simulation',
    'nextTokenPred.simMode': 'Simulation mode active – no real API used',
    'nextTokenPred.apiFailed': 'API request failed:',
    'nextTokenPred.noProbs': 'No token probabilities received from the model. Try a different text.',
    'nextTokenPred.usingSim': 'Using simulated data instead of API results',

    // --- multimodal-sequence.tsx ---
    'multimodalSeq.sceneLabel': 'Tiles:',
    'multimodalSeq.drawing': 'Drawing scene …',
    'multimodalSeq.step1Title': 'A surface',
    'multimodalSeq.step1Hint': 'An image is a rectangle of pixels – no start, no end. We divide it into equal-sized tiles.',
    'multimodalSeq.step2Title': 'A row',
    'multimodalSeq.step2Hint': 'The tiles are unrolled row by row into a single sequence: the surface becomes a line. Each tile is turned into a list of numbers.',
    'multimodalSeq.step3Title': 'A stream',
    'multimodalSeq.step3Hint': 'These image tiles now sit in the same stream as the word tokens. The model reads the whole row – and predicts the next piece, just like with plain text.',
    'multimodalSeq.tileAria': 'Tile',
    'multimodalSeq.tileInspectHint': 'tiles, unrolled into a row – each is now a short list of numbers. Tip: click a tile to see its numbers.',
    'multimodalSeq.tileNumbers': 'This one tile as three numbers:',
    'multimodalSeq.back': 'Back',
    'multimodalSeq.unroll': 'Unroll',
    'multimodalSeq.next': 'Next',
    'multimodalSeq.restart': 'Start over',
    'multimodalSeq.moreTitle': 'More insights',
    'multimodalSeq.moreSuffix': '– for the curious',
    'multimodalSeq.moreP1': 'The three bars per tile show how much red, green and blue it contains – together they give its average colour. Click a tile in the "A row" step: a sun-tile has lots of red and green, a sky-tile lots of blue.',
    'multimodalSeq.moreP2': 'A real model computes not three but hundreds of such numbers per tile – and individually they are no longer interpretable. Together they place the tile as a point in the same meaning space where words live too. That is the idea of the embeddings station, just this time for a piece of image.',
    'multimodalSeq.streamLabel': 'Input stream:',
    'multimodalSeq.nextPiece': 'next piece?',
    'multimodalSeq.streamNote': 'For the model this is one single row of pieces – image tiles and word tokens mixed. It treats both the same and continues the row. That is how a language model "sees": not with a second sense, but with the same mechanism, just with different input.',
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
    'msgCheck.legendIdentifying': 'Points to a specific person (name, class, contact) – this is what you replace.',
    'msgCheck.legendContext': 'Sensitive, but harmless without a name – this you can keep.',
    'msgCheck.cloudNote': 'If you send the message to a cloud AI, the provider sees exactly these spots – often on servers abroad.',
    'msgCheck.contextOnlyTitle': 'Sensitive, but not tied to a person.',
    'msgCheck.contextOnlyNote': 'These details say something about a person, but without a name they point to no one specific – you can send the request like this.',
    'msgCheck.showAnon': 'How to de-identify it yourself →',
    'msgCheck.hideAnon': 'Hide de-identified version',
    'msgCheck.anonNote': 'The identity is gone, the substance stays – the AI can still write a useful answer, with no specific person identifiable. (You do this yourself; it does not happen automatically.)',
    'msgCheck.okTitle': 'Nothing obviously sensitive.',
    'msgCheck.okNote': 'A general question without personal reference – a cloud AI is fine here.',
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
    'resources.subtitle': 'Further explanations – and how this site came to be.',
    'resources.aboutTitle': 'About this website',
    'resources.aboutP1': 'This site is a hobby project with one simple goal: to make complex AI topics something you can try out rather than just read about – especially for teachers and people from education who want a clear, honest picture of how AI works.',
    'resources.aboutP2': 'It started in March 2025 as an experiment with the then-new Claude Code from Anthropic and was then developed further with various AI assistants (including Gemini 2.5 Pro). The current major redesign (June 2026) was built with Claude Code again – in roughly one day. A timeline is further below under Update history.',
    'resources.vibeTitle': 'A word on how it was built: "Vibe Coding"',
    'resources.vibeP1': 'The term became Collins\'s word of the year in 2025 – and has since become almost a slur. Practitioners who use LLM agents seriously prefer "AI-Assisted Engineering": they read, test and understand the generated code rather than taking it blindly (Karpathy himself called "Vibe Coding" "passé" in 2026). For me it is mostly semantics.',
    'resources.vibeP2': 'For a front-end designer this kind of site might be "AI-Slop". But for someone from education who simply wants to understand how AI works, it offers hands-on exercises that simply would not exist without such tools. That is where the value lies: not in perfect code, but in making explanations suddenly tangible.',
    'resources.sourceLabel': 'The source code is openly available on GitHub:',
    'resources.impressumLink': 'Imprint',
    'resources.karpathyTitle': 'Andrej Karpathy: LLMs explained',
    'resources.karpathyIntro': 'This website only scratches the surface of two worthwhile videos by Andrej Karpathy, a leading AI researcher. They go technically much deeper.',
    'resources.video1Caption': 'About three hours that go far deeper into the technical detail behind every explanation here.',
    'resources.video2Caption': '"How I use LLMs": a lot about the usefulness and inner workings – for example how prevalent hallucinations still are even in expensive tools.',
    'resources.furtherTitle': 'Further learning resources',
    'resources.furtherIntro': 'Freely accessible, visual explanations – well suited for going deeper after the exercises here.',
    'resources.dataSourceTitle': 'Data sources & inspiration',
    'resources.dataSourceP': 'The Data page was inspired by the second Karpathy video. The documents for the visualisation come from the public HuggingFace FineWeb dataset. The German translation of the FineWeb texts was done for free via API with Google\'s small model "gemini-2.0-flash-lite".',
    'resources.legalTitle': 'Legal basis (Switzerland)',
    'resources.legalSource': 'Legal analysis of the development and use of AI in Swiss education',
    'resources.legalAuthors': 'Thouvenin/Volz',
    'resources.legalYear': '2024 – a key source for the privacy page.',
    'resources.authorTitle': 'About the author',
    'resources.authorP': 'I work at PH Zug as a lecturer in media education and computer-science didactics. My focus areas are artificial intelligence in teacher education and digitalisation in the classroom. Much of my web-development work has grown over the years, especially through collaboration with AI tools.',
    'resources.historyTitle': 'Update history',
    'resources.history1Date': 'March 2025',
    'resources.history1Title': 'First version',
    'resources.history1Body': 'Experiment with the then-new Claude Code. The first interactive explanations emerge – the goal from day one is "try it out rather than just read".',
    'resources.history2Date': '2025',
    'resources.history2Title': 'Further development',
    'resources.history2Body': 'Expanded with various AI assistants (including Gemini 2.5 Pro). More topics and visualisations are added.',
    'resources.history3Date': 'June 2026',
    'resources.history3Title': 'Major redesign (with Claude Code)',
    'resources.history3Body': 'Real model experiments throughout instead of canned scripts: a tiny language model that trains live in the browser; a self-trained reward model (RLHF); a real retrieval pipeline (RAG); chain-of-thought and RLVR with a real verifier; a meaning map for embeddings; the tokenisation of images. Plus dark mode, selectable accent colours and a bilingual foundation.',
    'resources.backBtn': 'Back to introduction',

    // --- impressum/page.tsx ---
    'impressum.title': 'Imprint & data usage',
    'impressum.subtitle': 'Who operates this site – and what data is shared.',
    'impressum.responsible': 'Responsible',
    'impressum.responsibleName': 'Thomas Zurfluh',
    'impressum.responsibleRole': 'Lecturer in media education and computer-science didactics, PH Zug.',
    'impressum.responsibleContact': 'Contact via the',
    'impressum.responsibleContactLink': 'PH Zug profile',
    'impressum.responsibleOr': 'or',
    'impressum.privateNote': 'This is a private hobby project and not an official offering of PH Zug.',
    'impressum.dataTitle': 'What data is shared?',
    'impressum.dataIntro': 'This site has no account, no ads and no tracking. Even so, it is worth knowing what happens in the background once you start one of the interactive exercises – because that is also the lesson of the privacy page.',
    'impressum.dataCloudTitle': 'Inputs to live exercises',
    'impressum.dataCloudBody': 'Exercises such as next-token, fine-tuning, RAG, chain-of-thought, RLVR, embeddings or the message check send your input – a short text – via this site\'s server to a language model from Google (Gemini via Google Cloud / Vertex AI) that computes the prediction. Your input leaves your browser and is processed in the cloud. Do not enter anything sensitive or personally identifiable here.',
    'impressum.dataBrowserTitle': 'What stays in the browser',
    'impressum.dataBrowserBody': 'Several exercises compute entirely in your browser and transfer nothing: the mini-training, the reward model (RLHF), the meaning map (embeddings), the data explorer and "images & sound". Tokenisation runs on the site\'s own server without a third-party provider.',
    'impressum.dataSettingsTitle': 'Settings',
    'impressum.dataSettingsBody': 'Light/dark mode, accent colour, language and the sidebar state are stored locally in your browser (localStorage, key "behind-ai-ui"). These are not transferred.',
    'impressum.dataHostingTitle': 'Hosting & server logs',
    'impressum.dataHostingBody': 'The site is hosted on Vercel. As with any web server, technical access data (e.g. IP address, timestamp, page visited) may appear temporarily in logs. There is no analytics tool, no advertising cookies and no profiling.',
    'impressum.dataNote': 'Inputs are not stored permanently or linked to individuals. To answer a request they are sent to Google; what Google does with them is governed by its own terms.',
    'impressum.contentTitle': 'Content & liability',
    'impressum.contentBody': 'The explanations are didactically simplified. AI outputs can be wrong (hallucinations) – some exercises show this deliberately. No guarantee of accuracy or completeness is given. External sites linked from here are the responsibility of their operators.',
    'impressum.copyrightTitle': 'Copyright & source code',
    'impressum.copyrightBody': 'The source code of this site is available under the MIT licence:',
    'impressum.copyrightResources': 'Resources',
    'impressum.statusTitle': 'Last updated',
    'impressum.statusBody': 'Last major update: June 2026 (redesign). First version: March 2025. The update history is under Resources.',
    'impressum.backBtn': 'Back to introduction',
  },
}
