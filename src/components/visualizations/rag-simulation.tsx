'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  DocumentTextIcon, 
  LightBulbIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  CalculatorIcon
} from '@heroicons/react/24/solid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from '@/components/ui/progress'

// Beispielanfragen und Informationen für die RAG-Simulation
interface Scenario {
  question: string
  context: string
  vanillaAnswer: string
  ragAnswer: string
  explanation: string
  category: 'factual' | 'calculation' | 'recent' | 'specific'
  source: 'document' | 'internet' | 'calculator' | 'database'
  accuracy: 'high' | 'medium' | 'low'
  sourceInfo: string
}

const scenarios: Scenario[] = [
  {
    question: "Wer ist der aktuelle Bundespräsident der Schweiz und wie lange dauert seine Amtszeit?",
    context: "Viola Amherd war Bundespräsidentin der Schweiz für das Jahr 2024. Für das Jahr 2025 ist es Karin Keller-Suter. In der Schweiz wechselt das Amt des Bundespräsidenten jährlich unter den sieben Mitgliedern des Bundesrates (der Schweizer Regierung). Die Bundespräsidentin oder der Bundespräsident wird für ein Jahr gewählt und hat vorwiegend repräsentative Aufgaben.",
    vanillaAnswer: "Ich kann Ihnen leider keine aktuelle Information darüber geben, wer derzeit Bundespräsident oder Bundespräsidentin der Schweiz ist, da meine Informationen nicht aktuell sind. In der Schweiz rotiert das Amt des Bundespräsidenten jährlich unter den Mitgliedern des Bundesrats, wobei jeder Bundespräsident für ein Jahr im Amt ist. Anders als in vielen anderen Ländern hat der Schweizer Bundespräsident hauptsächlich repräsentative Funktionen.",
    ragAnswer: "Die aktuelle Bundespräsidentin der Schweiz ist Viola Amherd, die dieses Amt für das Jahr 2024 innehat. In der Schweiz dauert die Amtszeit des Bundespräsidenten oder der Bundespräsidentin genau ein Jahr. Das Amt rotiert jährlich unter den sieben Mitgliedern des Bundesrates, wobei die Bundespräsidentin oder der Bundespräsident vorwiegend repräsentative Aufgaben wahrnimmt, aber keine zusätzlichen Machtbefugnisse gegenüber den anderen Bundesratsmitgliedern hat.",
    explanation: "Bei dieser Frage kann das Modell das politische System der Schweiz grundsätzlich erklären, aber die aktuelle Amtsinhaberin nicht korrekt benennen. Mit RAG kann es auf aktuelle und präzise Informationen zugreifen.",
    category: 'factual',
    source: 'internet',
    accuracy: 'high',
    sourceInfo: 'Offizielle Website der Schweizerischen Eidgenossenschaft (admin.ch)'
  },
  {
    question: "Welche zehn Staaten der USA haben die höchste Bevölkerungsdichte?",
    context: "Die zehn US-Bundesstaaten mit der höchsten Bevölkerungsdichte (Einwohner pro Quadratmeile, 2023):\n1. New Jersey: 1,263\n2. Rhode Island: 1,080\n3. Massachusetts: 897\n4. Connecticut: 745\n5. Maryland: 636\n6. Delaware: 512\n7. New York: 429\n8. Florida: 412\n9. Pennsylvania: 290\n10. Ohio: 289",
    vanillaAnswer: "Ich kann Ihnen eine ungefähre Liste der US-Bundesstaaten mit hoher Bevölkerungsdichte geben, aber ohne aktuelle Daten kann die Reihenfolge nicht ganz präzise sein. Typischerweise gehören zu den dichtest besiedelten Staaten: New Jersey, Rhode Island, Massachusetts, Connecticut, Maryland und New York. Weitere Staaten mit hoher Bevölkerungsdichte sind wahrscheinlich Delaware, Pennsylvania und eventuell Kalifornien oder Florida. Für die genaue Rangfolge und aktuelle Zahlen sollten Sie offizielle Bevölkerungsstatistiken konsultieren.",
    ragAnswer: "Die zehn US-Bundesstaaten mit der höchsten Bevölkerungsdichte (Stand 2023, in Einwohnern pro Quadratmeile) sind:\n\n1. New Jersey: 1.263\n2. Rhode Island: 1.080\n3. Massachusetts: 897\n4. Connecticut: 745\n5. Maryland: 636\n6. Delaware: 512\n7. New York: 429\n8. Florida: 412\n9. Pennsylvania: 290\n10. Ohio: 289",
    explanation: "Bei geografischen oder statistischen Fakten kann das Modell eine grundlegende Vorstellung haben, aber möglicherweise keine präzisen und aktuellen Daten liefern. RAG ermöglicht den Zugriff auf aktuelle demografische Statistiken.",
    category: 'factual',
    source: 'database',
    accuracy: 'high',
    sourceInfo: 'US Census Bureau - Bevölkerungsstatistiken 2023'
  },
  {
    question: "Was ist die Quadratwurzel aus 7569 multipliziert mit dem Logarithmus von 1000?",
    context: "Quadratwurzel aus 7569 = 87\nLogarithmus (Basis 10) von 1000 = 3\n87 × 3 = 261",
    vanillaAnswer: "Um diese Frage zu beantworten, würde ich schrittweise vorgehen. Ich muss die Quadratwurzel aus 7569 berechnen und dieses Ergebnis mit dem Logarithmus von 1000 multiplizieren. Allerdings kann ich ohne Taschenrechner keine präzisen komplexen mathematischen Berechnungen durchführen, daher kann ich Ihnen keine genaue Antwort geben.",
    ragAnswer: "Die Quadratwurzel aus 7569 ist 87.\nDer Logarithmus (Basis 10) von 1000 ist 3.\nMultipliziert man diese beiden Werte, erhält man: 87 × 3 = 261.\nDie Antwort ist also 261.",
    explanation: "Ohne Rechenhilfe kann das Modell komplexe mathematische Berechnungen nicht durchführen. Mit RAG kann ein Taschenrechner-Tool integriert werden, um die genaue Berechnung auszuführen.",
    category: 'calculation',
    source: 'calculator',
    accuracy: 'high',
    sourceInfo: 'Taschenrechner-Tool'
  },
  {
    question: "Berechne den Flächeninhalt eines Kreises mit einem Radius von 4,7 cm.",
    context: "Flächeninhalt eines Kreises = π × r²\nπ ≈ 3,14159\nr = 4,7 cm\nFlächeninhalt = 3,14159 × (4,7 cm)²\nFlächeninhalt = 3,14159 × 22,09 cm²\nFlächeninhalt ≈ 69,4 cm²",
    vanillaAnswer: "Der Flächeninhalt eines Kreises wird mit der Formel A = π × r² berechnet, wobei r der Radius ist. In diesem Fall ist r = 4,7 cm. Ich schätze, dass der Flächeninhalt ungefähr 70 cm² beträgt, aber für eine präzise Berechnung würde ich einen Taschenrechner benötigen, da ich komplexe Berechnungen nicht genau durchführen kann.",
    ragAnswer: "Um den Flächeninhalt eines Kreises zu berechnen, verwende ich die Formel: A = π × r²\n\nGegeben ist: r = 4,7 cm\n\nEinsetzen der Werte:\nA = 3,14159 × (4,7 cm)²\nA = 3,14159 × 22,09 cm²\nA ≈ 69,4 cm²\n\nDer Flächeninhalt des Kreises beträgt also 69,4 cm².",
    explanation: "Auch bei einfacheren mathematischen Berechnungen kann das Modell ohne Taschenrechner-Tool nur ungefähre Ergebnisse liefern. Mit RAG kann es präzise Berechnungen durchführen.",
    category: 'calculation',
    source: 'calculator',
    accuracy: 'high',
    sourceInfo: 'Mathematisches Berechnungs-Tool'
  },
  {
    question: "Löse die folgende Gleichung: 3x² - 14x - 5 = 0",
    context: "Für die quadratische Gleichung 3x² - 14x - 5 = 0:\n\nSchritt 1: Mitternachtsformel verwenden: x = (-b ± √(b² - 4ac))/(2a)\nwobei a=3, b=-14, c=-5\n\nSchritt 2: Berechnen der Diskriminante: b² - 4ac = (-14)² - 4(3)(-5) = 196 + 60 = 256\n\nSchritt 3: Einsetzen in die Formel\nx = (14 ± √256)/(2×3)\nx = (14 ± 16)/6\n\nDaher sind die Lösungen:\nx₁ = (14 + 16)/6 = 30/6 = 5\nx₂ = (14 - 16)/6 = -2/6 = -1/3",
    vanillaAnswer: "Um die quadratische Gleichung 3x² - 14x - 5 = 0 zu lösen, würde ich die Mitternachtsformel verwenden. Allerdings kann ich ohne Taschenrechner komplexe Berechnungen nicht präzise durchführen, besonders wenn Wurzeln involviert sind. Ich vermute, dass eine der Lösungen positiv und eine negativ ist, aber ich kann keine genauen Werte angeben.",
    ragAnswer: "Um die quadratische Gleichung 3x² - 14x - 5 = 0 zu lösen, verwende ich die Mitternachtsformel:\n\nx = (-b ± √(b² - 4ac))/(2a)\n\nIdentifiziere die Koeffizienten: a=3, b=-14, c=-5\n\nBerechne die Diskriminante:\nb² - 4ac = (-14)² - 4(3)(-5) = 196 + 60 = 256\n\nSetze in die Formel ein:\nx = (14 ± √256)/(2×3)\nx = (14 ± 16)/6\n\nDie beiden Lösungen sind:\nx₁ = (14 + 16)/6 = 30/6 = 5\nx₂ = (14 - 16)/6 = -2/6 = -1/3\n\nDie Gleichung hat also die Lösungen x = 5 und x = -1/3.",
    explanation: "Bei mathematischen Gleichungen kann das Modell ohne Hilfsmittel nur den Lösungsweg beschreiben, aber keine präzisen Berechnungen durchführen. Mit RAG kann es auf Rechenwerkzeuge zugreifen und genaue Ergebnisse liefern.",
    category: 'calculation',
    source: 'calculator',
    accuracy: 'high',
    sourceInfo: 'Mathematisches Berechnungs-Tool'
  },
  {
    question: "Welches Team hat die Fußball-Europameisterschaft 2024 gewonnen?",
    context: "Spanien hat die UEFA Fußball-Europameisterschaft 2024 in Deutschland gewonnen. Im Finale besiegte die spanische Nationalmannschaft England mit 2:1 und sicherte sich damit ihren vierten EM-Titel nach 1964, 2008 und 2012.",
    vanillaAnswer: "Ich habe keine aktuellen Informationen über die Fußball-Europameisterschaft 2024, da mein Wissen nicht die neuesten Sportereignisse umfasst. Die EM 2024 sollte in Deutschland stattfinden, aber ich kann Ihnen nicht sagen, welches Team gewonnen hat. Um eine zuverlässige Antwort zu erhalten, empfehle ich Ihnen, dies in einer aktuellen Sportquelle nachzuschlagen.",
    ragAnswer: "Spanien hat die Fußball-Europameisterschaft 2024 gewonnen. Im Finale besiegten sie England mit 2:1 und sicherten sich damit ihren vierten EM-Titel nach 1964, 2008 und 2012. Das Turnier fand in Deutschland statt.",
    explanation: "Diese Frage bezieht sich auf ein Ereignis nach dem Trainingszeitraum des Modells. Ohne zusätzliche Informationen kann es keine korrekte Antwort geben. RAG ermöglicht den Zugriff auf aktuelle Informationen.",
    category: 'recent',
    source: 'internet',
    accuracy: 'high',
    sourceInfo: 'Aktuelle Sportnachrichten'
  },
  {
    question: "Was waren die wichtigsten Änderungen im Schweizer Energiegesetz von 2023?",
    context: "Das revidierte Schweizer Energiegesetz von 2023 enthielt folgende Kernpunkte:\n1. Ausbauziel von 35 TWh erneuerbarer Stromproduktion bis 2035\n2. Vereinfachte Bewilligungsverfahren für Solar-, Wind- und Wasserkraftanlagen\n3. Solarpflicht für neue und grundlegend sanierte öffentliche Gebäude\n4. Erhöhung der Investitionsbeiträge für Photovoltaikanlagen\n5. Erleichterter Bau von alpinen Solaranlagen über 1800 m.ü.M.\n6. Reservekraftwerke zur Absicherung der Winterstromversorgung",
    vanillaAnswer: "Ich kann Ihnen leider keine präzisen Informationen zu den spezifischen Änderungen im Schweizer Energiegesetz von 2023 geben, da mein Wissensstand nicht die aktuellsten gesetzlichen Entwicklungen in der Schweiz umfasst. Typische Änderungen in Energiegesetzen betreffen aber oft Ausbauziele für erneuerbare Energien, Fördermaßnahmen und regulatorische Anpassungen. Für genaue Informationen sollten Sie das Bundesamt für Energie oder offizielle Schweizer Rechtsquellen konsultieren.",
    ragAnswer: "Die wichtigsten Änderungen im revidierten Schweizer Energiegesetz von 2023 umfassen:\n\n1. Ein ambitioniertes Ausbauziel von 35 Terawattstunden (TWh) erneuerbarer Stromproduktion bis 2035\n2. Deutlich vereinfachte und beschleunigte Bewilligungsverfahren für Solar-, Wind- und Wasserkraftanlagen\n3. Einführung einer Solarpflicht für neue sowie grundlegend sanierte öffentliche Gebäude\n4. Substantielle Erhöhung der Investitionsbeiträge für Photovoltaikanlagen\n5. Besondere Förderung und erleichterte Genehmigungsverfahren für alpine Solaranlagen über 1800 Meter über Meer\n6. Schaffung rechtlicher Grundlagen für Reservekraftwerke zur Absicherung der Winterstromversorgung",
    explanation: "Bei spezifischen regulatorischen oder fachlichen Informationen kann das Modell Wissenslücken haben. RAG ermöglicht den Zugriff auf Fachliteratur und aktuelle Gesetzestexte.",
    category: 'specific',
    source: 'document',
    accuracy: 'high',
    sourceInfo: 'Bundesamt für Energie - Gesetzestexte und Erläuterungen'
  },
  {
    question: "Wie hat sich die Inflationsrate in der Schweiz in den letzten 6 Monaten entwickelt?",
    context: "In den letzten sechs Monaten ist die Inflationsrate in der Schweiz kontinuierlich gesunken. Im August 2024 lag sie noch bei 1,1%, bevor sie im September auf 0,8% und im Oktober auf 0,6% fiel. Im November stieg sie kurzzeitig leicht auf 0,7%, bevor sie im Dezember wieder auf 0,6% zurückging. Im Januar 2025 sank die Inflationsrate weiter auf 0,4%. Dieser Rückgang liegt innerhalb des von der Schweizerischen Nationalbank (SNB) angestrebten Zielbands von 0 % bis 2 %. Die SNB hat im Jahr 2024 mehrfach die Leitzinsen gesenkt, um die wirtschaftliche Entwicklung zu stabilisieren. Diese geldpolitischen Maßnahmen haben dazu beigetragen, dass sich die Teuerung verlangsamt hat.",
    vanillaAnswer: "Ich habe leider keine aktuellen Daten zur Inflationsentwicklung in der Schweiz für die letzten 6 Monate. Mein Wissen umfasst keine aktuellen wirtschaftlichen Kennzahlen. Generell hatte die Schweiz historisch betrachtet oft niedrigere Inflationsraten als viele andere europäische Länder, aber für aktuelle und präzise Informationen sollten Sie das Schweizerische Bundesamt für Statistik konsultieren.",
    ragAnswer: "In den letzten sechs Monaten ist die Inflationsrate in der Schweiz kontinuierlich gesunken. Im August 2024 lag sie noch bei 1,1%, bevor sie im September auf 0,8% und im Oktober auf 0,6% fiel. Im November stieg sie kurzzeitig leicht auf 0,7%, bevor sie im Dezember wieder auf 0,6% zurückging. Im Januar 2025 sank die Inflationsrate weiter auf 0,4%. Dieser Rückgang liegt innerhalb des von der Schweizerischen Nationalbank (SNB) angestrebten Zielbands von 0 % bis 2 %. Die SNB hat im Jahr 2024 mehrfach die Leitzinsen gesenkt, um die wirtschaftliche Entwicklung zu stabilisieren. Diese geldpolitischen Maßnahmen haben dazu beigetragen, dass sich die Teuerung verlangsamt hat.",
    explanation: "Für aktuelle wirtschaftliche Daten und Trends ist RAG besonders wichtig, da sich diese Informationen ständig ändern und nicht im trainierten Wissen des Modells enthalten sein können.",
    category: 'recent',
    source: 'database',
    accuracy: 'high',
    sourceInfo: 'Schweizerisches Bundesamt für Statistik'
  },
  {
    question: "Wer hat den Oscar 2026 für den besten Film gewonnen?",
    context: "Bei der Oscar-Verleihung 2026 gewann der Film 'The Horizon' von Regisseurin Sarah Chen den Preis für den besten Film. Der Science-Fiction-Drama setzte sich gegen starke Konkurrenten durch und erhielt insgesamt fünf Auszeichnungen, darunter auch für Regie und visuelle Effekte.",
    vanillaAnswer: "Ich habe keine Informationen über die Oscar-Verleihung 2026, da diese noch nicht stattgefunden hat oder nach meinem letzten Wissensstand liegt. Mein Trainingszeitraum endet früher, daher kann ich Ihnen nicht sagen, wer den Oscar 2026 für den besten Film gewonnen hat. Sobald die Verleihung stattgefunden hat, werden diese Informationen in aktuellen Nachrichtenquellen verfügbar sein.",
    ragAnswer: "Laut den abgerufenen Informationen hat der Film 'The Horizon' von Regisseurin Sarah Chen den Oscar 2026 für den besten Film gewonnen. Der Science-Fiction-Drama erhielt bei der Verleihung insgesamt fünf Auszeichnungen, darunter auch für Regie und visuelle Effekte.",
    explanation: "Diese Frage bezieht sich auf ein fiktives zukünftiges Ereignis. Ein gutes RAG-System sollte die Qualität seiner Quellen prüfen und keine falschen Informationen übernehmen. Hier zeigt sich eine Schwäche, wenn das Retrieval fehlerhafte oder erfundene Informationen liefert.",
    category: 'recent',
    source: 'internet',
    accuracy: 'low',
    sourceInfo: 'Unzuverlässige Quelle mit falschen Informationen'
  },
  {
    question: "Was waren die wichtigsten Technologietrends in den USA im Jahr 2023?",
    context: "Die dominierenden Technologietrends in den USA 2023 waren:\n1. Generative KI und Large Language Models\n2. Quantencomputing-Fortschritte mit praktischen Anwendungen\n3. Mixed Reality durch neue AR/VR-Headsets\n4. Edge Computing und dezentrale Rechenzentren\n5. KI-gestützte Cybersicherheit\n6. Nachhaltige Technologien und Green IT\n7. Fortschritte bei autonomen Fahrzeugen\n8. Biotechnologie-Innovationen mit KI-Integration",
    vanillaAnswer: "Als führende Technologietrends in den USA dürften künstliche Intelligenz, Cloud Computing und möglicherweise Augmented/Virtual Reality eine wichtige Rolle gespielt haben. Allerdings kann ich keine spezifischen Trends für 2023 nennen, da mein Wissensstand nicht aktuell genug ist. Für eine genaue Einschätzung der wichtigsten Technologietrends von 2023 empfehle ich, aktuelle Berichte von Marktforschungsunternehmen wie Gartner, Forrester oder IDC zu konsultieren.",
    ragAnswer: "Die wichtigsten Technologietrends in den USA im Jahr 2023 waren:\n\n1. Generative KI und Large Language Models, die in zahlreiche Anwendungen und Produkte integriert wurden\n2. Durchbrüche im Quantencomputing mit ersten praktischen Anwendungsfällen\n3. Mixed Reality durch neue AR/VR-Headsets von führenden Tech-Unternehmen\n4. Edge Computing und der Ausbau dezentraler Rechenzentren\n5. KI-gestützte Cybersicherheitslösungen\n6. Nachhaltige Technologien und Green IT-Initiativen\n7. Weiterentwicklung autonomer Fahrzeuge und entsprechender Infrastruktur\n8. Biotechnologie-Innovationen mit verstärkter KI-Integration",
    explanation: "Bei Fragen zu aktuellen Trends kann das Modell nur allgemeine Aussagen treffen, aber keine spezifischen Entwicklungen eines bestimmten Jahres nennen. RAG ermöglicht den Zugriff auf aktuelle Marktberichte und Trendanalysen.",
    category: 'recent',
    source: 'document',
    accuracy: 'high',
    sourceInfo: 'Technologie-Trendreport 2023 - Gartner & Forrester Analysen'
  },
  {
    question: "Was sind die wichtigsten Exportgüter der Schweiz in die USA im Jahr 2023?",
    context: "Die wichtigsten Exportgüter der Schweiz in die USA im Jahr 2023 waren:\n1. Pharmazeutische Produkte: 42,1 Mrd. CHF\n2. Medizinische Geräte und Präzisionsinstrumente: 9,3 Mrd. CHF\n3. Uhren und Uhrenteile: 7,2 Mrd. CHF\n4. Maschinen: 4,9 Mrd. CHF\n5. Chemische Erzeugnisse (ohne Pharma): 3,8 Mrd. CHF\n6. Edelmetalle und Schmuck: 3,1 Mrd. CHF\nDas Gesamtexportvolumen betrug 75,6 Mrd. CHF, was einem Anstieg von 5,8% gegenüber dem Vorjahr entspricht.",
    vanillaAnswer: "Zu den wichtigsten Exportgütern der Schweiz in die USA zählen typischerweise pharmazeutische Produkte, Präzisionsinstrumente, Uhren, Maschinen und chemische Erzeugnisse. Die Schweiz ist bekannt für ihre hochwertigen Produkte in diesen Bereichen. Allerdings kann ich ohne Zugriff auf aktuelle Handelsstatistiken keine genauen Zahlen oder die präzise Rangfolge für das Jahr 2023 nennen. Die schweizerisch-amerikanischen Handelsbeziehungen sind traditionell stark, wobei die USA einer der wichtigsten Handelspartner der Schweiz sind.",
    ragAnswer: "Die wichtigsten Exportgüter der Schweiz in die USA im Jahr 2023 waren:\n\n1. Pharmazeutische Produkte mit einem Wert von 42,1 Milliarden Schweizer Franken (CHF)\n2. Medizinische Geräte und Präzisionsinstrumente: 9,3 Milliarden CHF\n3. Uhren und Uhrenteile: 7,2 Milliarden CHF\n4. Maschinen: 4,9 Milliarden CHF\n5. Chemische Erzeugnisse (ohne Pharmazeutika): 3,8 Milliarden CHF\n6. Edelmetalle und Schmuck: 3,1 Milliarden CHF\n\nDas gesamte Exportvolumen belief sich auf 75,6 Milliarden CHF, was einem Anstieg von 5,8% im Vergleich zum Vorjahr entspricht.",
    explanation: "Für spezifische Wirtschaftsdaten und aktuelle Statistiken ist RAG besonders nützlich. Das Modell kennt allgemeine Trends, aber keine aktuellen präzisen Zahlen ohne externe Datenquellen.",
    category: 'specific',
    source: 'database',
    accuracy: 'high',
    sourceInfo: 'Eidgenössische Zollverwaltung - Außenhandelsstatistik 2023'
  }
];

// RAG-Komponente
export const RAGSimulation = () => {
  const [phase, setPhase] = useState<'intro' | 'question' | 'search' | 'compare' | 'explanation'>('intro');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(Math.floor(Math.random() * scenarios.length));
  const [searchProgress, setSearchProgress] = useState(0);
  const [showVanillaAnswer, setShowVanillaAnswer] = useState(false);
  const [showRagAnswer, setShowRagAnswer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Scenario['category']>('all');
  
  // Fortschritt bei der Suche simulieren
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (phase === 'search') {
      interval = setInterval(() => {
        setSearchProgress(prev => {
          const next = prev + 5;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase('compare'), 500);
            return 100;
          }
          return next;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);
  
  const handleStartDemo = () => {
    setPhase('question');
  };
  
  const handleAskQuestion = () => {
    setPhase('search');
    setSearchProgress(0);
    setShowVanillaAnswer(false);
    setShowRagAnswer(false);
  };
  
  const handleShowAnswers = () => {
    setShowVanillaAnswer(true);
    setTimeout(() => {
      setShowRagAnswer(true);
    }, 1500);
  };
  
  const handleViewExplanation = () => {
    setPhase('explanation');
  };
  
  const handleNextQuestion = () => {
    // Filtere Szenarien basierend auf Kategorie
    const filteredScenarios = selectedCategory === 'all' 
      ? scenarios 
      : scenarios.filter(s => s.category === selectedCategory);
    
    // Wähle ein zufälliges Szenario aus den gefilterten, das nicht das aktuelle ist
    const availableIndices = filteredScenarios.map((_, idx) => 
      scenarios.findIndex(s => s === filteredScenarios[idx])
    ).filter(idx => idx !== currentScenarioIndex);
    
    if (availableIndices.length > 0) {
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setCurrentScenarioIndex(randomIndex);
    } else if (filteredScenarios.length > 0) {
      // Falls nur ein Szenario in der Kategorie ist, verwende es trotzdem
      setCurrentScenarioIndex(scenarios.findIndex(s => s === filteredScenarios[0]));
    }
    
    setPhase('question');
    setSearchProgress(0);
    setShowVanillaAnswer(false);
    setShowRagAnswer(false);
  };
  
  const handleCategoryChange = (category: 'all' | Scenario['category']) => {
    setSelectedCategory(category);
    // Optional: Bei Kategoriewechsel auch direkt ein passendes Szenario wählen
    if (category !== 'all') {
      const matchingScenarios = scenarios.filter(s => s.category === category);
      if (matchingScenarios.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingScenarios.length);
        setCurrentScenarioIndex(scenarios.findIndex(s => s === matchingScenarios[randomIndex]));
      }
    }
  };
  
  const getSourceIcon = (source: Scenario['source']) => {
    switch (source) {
      case 'document':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'internet':
        return <MagnifyingGlassIcon className="h-5 w-5 text-green-500" />;
      case 'calculator':
        return <CalculatorIcon className="h-5 w-5 text-violet-500" />;
      case 'database':
        return <DocumentMagnifyingGlassIcon className="h-5 w-5 text-amber-500" />;
    }
  };
  
  const getAccuracyIcon = (accuracy: Scenario['accuracy']) => {
    switch (accuracy) {
      case 'high':
        return <LightBulbIcon className="h-5 w-5 text-green-500" title="Hohe Genauigkeit" />;
      case 'medium':
        return <InformationCircleIcon className="h-5 w-5 text-amber-500" title="Mittlere Genauigkeit" />;
      case 'low':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" title="Niedrige Genauigkeit" />;
    }
  };
  
  const getCategoryTranslation = (category: Scenario['category']) => {
    switch (category) {
      case 'factual':
        return 'Fakten';
      case 'calculation':
        return 'Berechnungen';
      case 'recent':
        return 'Aktuelle Ereignisse';
      case 'specific':
        return 'Spezifisches Fachwissen';
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase 1: Einführung */}
      {phase === 'intro' && (
        <div className="space-y-4">
          <div className="bg-violet-50 p-4 rounded-lg border border-violet-100">
            <h3 className="font-medium text-violet-800 mb-2">RAG-Prozess verstehen</h3>
            <p className="text-sm text-violet-700">
              In dieser Simulation kannst du verschiedene Arten von Anfragen testen, bei denen RAG hilft:
            </p>
            <ul className="text-sm text-violet-700 list-disc pl-5 space-y-1 mt-2">
              <li><strong>Aktuelle Ereignisse</strong> - Dinge, die nach dem Training des Modells stattfanden</li>
              <li><strong>Spezifisches Fachwissen</strong> - Detaillierte Informationen aus Fachliteratur</li>
              <li><strong>Berechnungen</strong> - Mathematische Probleme, die Rechenfähigkeiten erfordern</li>
              <li><strong>Faktenwissen</strong> - Informationen, die Präzision erfordern</li>
            </ul>
            <p className="text-sm text-violet-700 mt-2">
              Du kannst Antworten mit und ohne RAG vergleichen und sehen, wo die Stärken und
              Grenzen dieser Technik liegen.
            </p>
          </div>
          
          <Button 
            onClick={handleStartDemo} 
            className="w-full"
          >
            RAG-Demo starten
          </Button>
        </div>
      )}
      
      {/* Phase 2: Frage auswählen */}
      {phase === 'question' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">Frage an das KI-Modell</h3>
            
            <div className="flex gap-2">
              <Tabs value={selectedCategory} onValueChange={(value) => handleCategoryChange(value as any)}>
                <TabsList className="grid grid-cols-5 h-8">
                  <TabsTrigger value="all" className="text-xs py-0">Alle</TabsTrigger>
                  <TabsTrigger value="factual" className="text-xs py-0">Fakten</TabsTrigger>
                  <TabsTrigger value="calculation" className="text-xs py-0">Rechnen</TabsTrigger>
                  <TabsTrigger value="recent" className="text-xs py-0">Aktuell</TabsTrigger>
                  <TabsTrigger value="specific" className="text-xs py-0">Fachw.</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-4">
              <p className="font-medium mb-2">Frage:</p>
              <div className="p-3 bg-gray-50 rounded-md mb-4 text-gray-800">
                {scenarios[currentScenarioIndex].question}
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                <div className="flex items-center text-blue-800 mb-1">
                  <InformationCircleIcon className="h-4 w-4 mr-1.5" />
                  <p className="text-sm font-medium">Kategorie: {getCategoryTranslation(scenarios[currentScenarioIndex].category)}</p>
                </div>
                <p className="text-sm text-blue-700">
                  Diese Frage testet, wie gut ein KI-Modell {scenarios[currentScenarioIndex].category === 'factual' && 'präzise Fakten wiedergeben'} 
                  {scenarios[currentScenarioIndex].category === 'calculation' && 'mathematische Berechnungen durchführen'} 
                  {scenarios[currentScenarioIndex].category === 'recent' && 'auf aktuelle Informationen zugreifen'} 
                  {scenarios[currentScenarioIndex].category === 'specific' && 'spezifisches Fachwissen abrufen'} kann.
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button onClick={handleNextQuestion} variant="outline">
                  Andere Frage
                </Button>
                <Button onClick={handleAskQuestion}>
                  Frage stellen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Phase 3: Informationen suchen */}
      {phase === 'search' && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Externe Informationen werden abgerufen</h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p>
                  Frage: <span className="text-gray-700">{scenarios[currentScenarioIndex].question}</span>
                </p>
                
                <div className="flex flex-col items-center py-4 space-y-4">
                  <div className="flex justify-center space-x-12 w-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl">🔍</span>
                      </div>
                      <p className="text-sm font-medium text-blue-700">Suche</p>
                    </div>
                    
                    <div className="flex flex-col justify-center items-center">
                      <div className="w-32 h-2 bg-violet-200 relative">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-violet-500"
                          style={{ width: `${searchProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Abruf {searchProgress}%</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                        {getSourceIcon(scenarios[currentScenarioIndex].source)}
                      </div>
                      <p className="text-sm font-medium text-violet-700">
                        {scenarios[currentScenarioIndex].source === 'document' && 'Dokumente'}
                        {scenarios[currentScenarioIndex].source === 'internet' && 'Internet'}
                        {scenarios[currentScenarioIndex].source === 'calculator' && 'Taschenrechner'}
                        {scenarios[currentScenarioIndex].source === 'database' && 'Datenbank'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 text-center">
                    <p>
                      {scenarios[currentScenarioIndex].source === 'document' && 'Relevante Dokumente werden durchsucht...'}
                      {scenarios[currentScenarioIndex].source === 'internet' && 'Internet wird nach aktuellen Informationen durchsucht...'}
                      {scenarios[currentScenarioIndex].source === 'calculator' && 'Mathematische Berechnung wird durchgeführt...'}
                      {scenarios[currentScenarioIndex].source === 'database' && 'Datenbank wird nach spezifischen Informationen abgefragt...'}
                    </p>
                  </div>
                  
                  <Progress value={searchProgress} className="w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Phase 4: Antworten vergleichen */}
      {phase === 'compare' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">Vergleich der Antworten</h3>
            <div className="flex items-center text-sm">
              <span className="mr-2">Quellenqualität:</span>
              {getAccuracyIcon(scenarios[currentScenarioIndex].accuracy)}
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-4">
              <p className="font-medium mb-3">Frage:</p>
              <div className="p-3 bg-gray-50 rounded-md mb-4">
                {scenarios[currentScenarioIndex].question}
              </div>
              
              <div className="flex justify-end mb-3">
                <Button 
                  onClick={handleShowAnswers} 
                  size="sm" 
                  variant="outline"
                  disabled={showVanillaAnswer}
                >
                  Antworten anzeigen
                </Button>
              </div>
              
              <div className="space-y-6">
                <AnimatePresence>
                  {showVanillaAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-amber-700">1</span>
                          </div>
                          <p className="font-medium">Modell ohne externe Informationen:</p>
                        </div>
                        <div className="p-3 bg-white rounded-md border border-gray-200">
                          {scenarios[currentScenarioIndex].vanillaAnswer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                
                  {showRagAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-green-700">2</span>
                          </div>
                          <p className="font-medium">Modell mit RAG:</p>
                        </div>
                        <div className="p-3 bg-violet-50 rounded-md border border-violet-200">
                          {scenarios[currentScenarioIndex].ragAnswer}
                        </div>
                        
                        <div className="mt-2 p-2 bg-gray-100 rounded-md text-xs text-gray-600">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-gray-700 font-medium">Quelle:</span>
                            <span className="ml-1">{scenarios[currentScenarioIndex].sourceInfo}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button onClick={handleViewExplanation}>
                          Erklärung anzeigen
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Phase 5: Erklärung */}
      {phase === 'explanation' && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Was ist passiert?</h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="p-3 bg-violet-50 rounded-md border border-violet-100">
                  <p className="font-medium text-violet-800 mb-1">Der RAG-Prozess im Detail:</p>
                  <ol className="text-sm text-violet-700 list-decimal pl-5 space-y-2">
                    <li>
                      <strong>Frage analysiert</strong>: Das System erkannte, dass es externe Informationen benötigt
                    </li>
                    <li>
                      <strong>Retrieval durchgeführt</strong>: Informationen wurden aus {
                        scenarios[currentScenarioIndex].source === 'document' && 'Dokumenten'
                      }{
                        scenarios[currentScenarioIndex].source === 'internet' && 'dem Internet'
                      }{
                        scenarios[currentScenarioIndex].source === 'calculator' && 'einem Taschenrechner-Tool'
                      }{
                        scenarios[currentScenarioIndex].source === 'database' && 'einer Datenbank'
                      } abgerufen
                    </li>
                    <li>
                      <strong>Kontext angereichert</strong>: Die gefundenen Informationen wurden dem Modellkontext hinzugefügt
                    </li>
                    <li>
                      <strong>Antwort generiert</strong>: Das Modell erstellte eine Antwort basierend auf seinem Wissen UND den externen Informationen
                    </li>
                  </ol>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <p className="font-medium text-blue-800 mb-2">Erkenntnisse bei dieser Frage:</p>
                  <p className="text-sm text-blue-700">
                    {scenarios[currentScenarioIndex].explanation}
                  </p>
                  
                  {scenarios[currentScenarioIndex].accuracy === 'low' && (
                    <div className="mt-3 p-2 bg-red-50 rounded-md border border-red-100 text-sm text-red-700">
                      <p className="flex items-center font-medium">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />
                        Achtung: Problematische Quelle
                      </p>
                      <p className="mt-1">
                        In diesem Beispiel hat RAG auf eine unzuverlässige Quelle zugegriffen und dadurch 
                        falsche Informationen weitergegeben. Dies zeigt eine wichtige Einschränkung: 
                        RAG ist nur so gut wie die Quellen, auf die es zugreift.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setPhase('compare')}>
                    Zurück
                  </Button>
                  <Button onClick={handleNextQuestion}>
                    Nächstes Beispiel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};