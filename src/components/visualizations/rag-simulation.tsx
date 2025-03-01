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
    question: "Wer ist der aktuelle Bundeskanzler von Deutschland und seit wann ist er im Amt?",
    context: "Olaf Scholz (SPD) ist seit dem 8. Dezember 2021 Bundeskanzler von Deutschland. Er wurde nach der Bundestagswahl 2021 zum Nachfolger von Angela Merkel gewählt und führt eine Koalition aus SPD, Grünen und FDP (die sogenannte Ampel-Koalition) an.",
    vanillaAnswer: "Soweit ich weiß, ist Olaf Scholz (SPD) der aktuelle Bundeskanzler von Deutschland. Er übernahm das Amt nach Angela Merkel, aber ich bin mir nicht ganz sicher, wann genau er vereidigt wurde. Ich glaube, es war Ende 2021, aber das genaue Datum kann ich nicht mit Sicherheit nennen.",
    ragAnswer: "Olaf Scholz (SPD) ist der aktuelle Bundeskanzler von Deutschland. Er ist seit dem 8. Dezember 2021 im Amt, als er als Nachfolger von Angela Merkel vereidigt wurde. Scholz führt eine Koalitionsregierung aus SPD, Grünen und FDP an, die auch als Ampel-Koalition bezeichnet wird.",
    explanation: "Bei dieser Frage kann das Modell den aktuellen Bundeskanzler möglicherweise korrekt nennen, aber beim genauen Datum der Amtsübernahme unsicher sein. Mit RAG kann es auf aktuelle und präzise Informationen zugreifen.",
    category: 'factual',
    source: 'internet',
    accuracy: 'high',
    sourceInfo: 'Aktuelle Regierungsinformationen (Bundesregierung.de)'
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
    question: "Was waren die wichtigsten Änderungen im deutschen Erneuerbare-Energien-Gesetz von 2023?",
    context: "Die Novelle des Erneuerbare-Energien-Gesetzes (EEG) 2023 brachte wichtige Änderungen:\n1. Anhebung der Ausbauziele: 80% erneuerbarer Strom bis 2030\n2. Vereinfachung von Genehmigungsverfahren für Solar- und Windkraftanlagen\n3. Einführung eines Bonus für Bürgerenergiegesellschaften\n4. Neue Flächenziele für Windenergie (2% der Landesfläche)\n5. Abschaffung der EEG-Umlage für Verbraucher seit Juli 2022",
    vanillaAnswer: "Ich kann Ihnen einige allgemeine Informationen zu Änderungen im EEG geben, aber für die spezifischen Änderungen von 2023 habe ich möglicherweise nicht die aktuellsten Details. Typische Änderungen in EEG-Novellen umfassen Anpassungen der Vergütungssätze, Ausbauziele und Förderkonditionen. Für präzise und aktuelle Informationen zu den Änderungen 2023 sollten Sie das Bundesministerium für Wirtschaft und Klimaschutz oder die Gesetzestexte direkt konsultieren.",
    ragAnswer: "Die wichtigsten Änderungen im EEG 2023 umfassen:\n1. Deutliche Anhebung der Ausbauziele auf 80% erneuerbaren Strom bis 2030\n2. Beschleunigte Genehmigungsverfahren für Solar- und Windkraftanlagen\n3. Finanzieller Bonus für Bürgerenergiegesellschaften zur Förderung lokaler Beteiligung\n4. Verbindliche Flächenziele für Windenergie (2% der Landesfläche)\n5. Vollständige Abschaffung der EEG-Umlage für Verbraucher (bereits seit Juli 2022 wirksam)",
    explanation: "Bei spezifischen regulatorischen oder fachlichen Informationen kann das Modell Wissenslücken haben. RAG ermöglicht den Zugriff auf Fachinformationen und aktuelle Gesetzestexte.",
    category: 'specific',
    source: 'document',
    accuracy: 'high',
    sourceInfo: 'EEG 2023 - Gesetzestext und Erläuterungen'
  },
  {
    question: "Wie hat sich die Inflationsrate in Deutschland in den letzten 6 Monaten entwickelt?",
    context: "Inflationsrate in Deutschland (Verbraucherpreisindex, Veränderung zum Vorjahresmonat):\nJanuar 2024: 2,9%\nFebruar 2024: 2,5%\nMärz 2024: 2,3%\nApril 2024: 2,2%\nMai 2024: 2,0%\nJuni 2024: 1,9%",
    vanillaAnswer: "Ich habe leider keine aktuellen Daten zur Inflationsentwicklung in Deutschland für die letzten 6 Monate. Mein Wissen ist nicht auf dem neuesten Stand für aktuelle wirtschaftliche Indikatoren. Vor meinem Wissenscutoff zeigte Deutschland, wie viele andere Länder auch, erhöhte Inflationsraten, aber für präzise und aktuelle Informationen sollten Sie das Statistische Bundesamt oder die Deutsche Bundesbank konsultieren.",
    ragAnswer: "Die Inflationsrate in Deutschland (gemessen am Verbraucherpreisindex im Vergleich zum Vorjahresmonat) zeigt in den letzten 6 Monaten einen kontinuierlichen Rückgang:\n- Januar 2024: 2,9%\n- Februar 2024: 2,5%\n- März 2024: 2,3%\n- April 2024: 2,2%\n- Mai 2024: 2,0%\n- Juni 2024: 1,9%\n\nDie Inflation ist somit in diesem Zeitraum von 2,9% auf unter 2% gesunken, was der Zielmarke der Europäischen Zentralbank entspricht.",
    explanation: "Für aktuelle wirtschaftliche Daten und Trends ist RAG besonders wichtig, da sich diese Informationen ständig ändern und nicht im trainierten Wissen des Modells enthalten sein können.",
    category: 'recent',
    source: 'database',
    accuracy: 'high',
    sourceInfo: 'Statistisches Bundesamt - Wirtschaftsdaten'
  },
  {
    question: "Welche Nebenwirkungen hat der COVID-19-Impfstoff BNT162b2 (Pfizer/BioNTech)?",
    context: "Häufige Nebenwirkungen des Pfizer/BioNTech COVID-19-Impfstoffs (BNT162b2/Comirnaty):\n- Sehr häufig (>10%): Schmerzen an der Injektionsstelle, Müdigkeit, Kopfschmerzen, Muskelschmerzen, Schüttelfrost, Gelenkschmerzen, Fieber\n- Häufig (1-10%): Rötung/Schwellung an der Einstichstelle, Übelkeit\n- Gelegentlich (0,1-1%): Lymphknotenschwellung, Schlaflosigkeit, Lethargie, verminderter Appetit\n- Selten (<0,01%): Gesichtslähmung (Bell's Palsy)\n- Sehr selten: Myokarditis und Perikarditis, insbesondere bei jungen Männern nach der zweiten Dosis",
    vanillaAnswer: "Der COVID-19-Impfstoff von Pfizer/BioNTech (BNT162b2, auch bekannt als Comirnaty) kann verschiedene Nebenwirkungen haben. Zu den häufigeren zählen Schmerzen an der Injektionsstelle, Müdigkeit, Kopfschmerzen und Muskelschmerzen. Fieber, Schüttelfrost und Gelenkschmerzen können ebenfalls auftreten. Seltenere Nebenwirkungen können sein: Lymphknotenschwellungen und allergische Reaktionen. Sehr selten wurden Fälle von Myokarditis (Herzmuskelentzündung) berichtet, besonders bei jüngeren männlichen Personen. Die meisten Nebenwirkungen sind mild bis moderat und klingen innerhalb weniger Tage ab.",
    ragAnswer: "Der Pfizer/BioNTech COVID-19-Impfstoff (BNT162b2/Comirnaty) kann folgende Nebenwirkungen haben:\n\nSehr häufig (>10%):\n- Schmerzen an der Injektionsstelle\n- Müdigkeit\n- Kopfschmerzen\n- Muskelschmerzen\n- Schüttelfrost\n- Gelenkschmerzen\n- Fieber\n\nHäufig (1-10%):\n- Rötung/Schwellung an der Einstichstelle\n- Übelkeit\n\nGelegentlich (0,1-1%):\n- Lymphknotenschwellung\n- Schlaflosigkeit\n- Lethargie\n- Verminderter Appetit\n\nSelten (<0,01%):\n- Gesichtslähmung (Bell's Palsy)\n\nSehr selten, aber wichtig zu beachten:\n- Myokarditis und Perikarditis (Herzentzündungen), besonders bei jungen Männern nach der zweiten Dosis",
    explanation: "Bei medizinischen Fragen kann das Modell grundlegende Informationen haben, aber möglicherweise nicht alle spezifischen Details präzise wiedergeben. RAG ermöglicht den Zugriff auf Fachliteratur und aktuelle Studien.",
    category: 'specific',
    source: 'document',
    accuracy: 'medium',
    sourceInfo: 'Fachinformationen der Europäischen Arzneimittelagentur (EMA)'
  },
  {
    question: "Wer hat den Oscar 2025 für den besten Film gewonnen?",
    context: "Bei der Oscar-Verleihung 2025 gewann der Film 'The Horizon' von Regisseurin Sarah Chen den Preis für den besten Film. Der Science-Fiction-Drama setzte sich gegen starke Konkurrenten durch und erhielt insgesamt fünf Auszeichnungen, darunter auch für Regie und visuelle Effekte.",
    vanillaAnswer: "Ich habe keine Informationen über die Oscar-Verleihung 2025, da diese noch nicht stattgefunden hat oder nach meinem letzten Wissensstand liegt. Mein Trainingszeitraum endet früher, daher kann ich Ihnen nicht sagen, wer den Oscar 2025 für den besten Film gewonnen hat. Sobald die Verleihung stattgefunden hat, werden diese Informationen in aktuellen Nachrichtenquellen verfügbar sein.",
    ragAnswer: "Laut den abgerufenen Informationen hat der Film 'The Horizon' von Regisseurin Sarah Chen den Oscar 2025 für den besten Film gewonnen. Der Science-Fiction-Drama erhielt bei der Verleihung insgesamt fünf Auszeichnungen, darunter auch für Regie und visuelle Effekte.",
    explanation: "Diese Frage bezieht sich auf ein fiktives zukünftiges Ereignis. Ein gutes RAG-System sollte die Qualität seiner Quellen prüfen und keine falschen Informationen übernehmen. Hier zeigt sich eine Schwäche, wenn das Retrieval fehlerhafte oder erfundene Informationen liefert.",
    category: 'recent',
    source: 'internet',
    accuracy: 'low',
    sourceInfo: 'Unzuverlässige Quelle mit falschen Informationen'
  },
  {
    question: "Was sind die wichtigsten Exportgüter Deutschlands nach Kanada im Jahr 2023?",
    context: "Die wichtigsten Exportgüter Deutschlands nach Kanada im Jahr 2023 waren:\n1. Kraftfahrzeuge und Kraftfahrzeugteile: 5,2 Mrd. Euro\n2. Maschinen: 3,8 Mrd. Euro\n3. Pharmazeutische Erzeugnisse: 2,7 Mrd. Euro\n4. Chemische Erzeugnisse: 1,9 Mrd. Euro\n5. Elektrische Ausrüstungen: 1,5 Mrd. Euro\nDas Gesamtexportvolumen betrug 19,6 Mrd. Euro, was einem Anstieg von 3,2% gegenüber dem Vorjahr entspricht.",
    vanillaAnswer: "Als wichtigste Exportgüter Deutschlands nach Kanada zählen typischerweise Kraftfahrzeuge und Kraftfahrzeugteile, Maschinen, pharmazeutische Erzeugnisse und chemische Produkte. Allerdings kann ich ohne Zugriff auf aktuelle Handelsstatistiken keine genauen Zahlen oder Rangfolgen für das Jahr 2023 nennen. Die deutsch-kanadischen Handelsbeziehungen sind traditionell stark im Bereich hochwertiger Industrieprodukte und Technologien.",
    ragAnswer: "Die wichtigsten Exportgüter Deutschlands nach Kanada im Jahr 2023 waren:\n\n1. Kraftfahrzeuge und Kraftfahrzeugteile mit einem Wert von 5,2 Milliarden Euro\n2. Maschinen: 3,8 Milliarden Euro\n3. Pharmazeutische Erzeugnisse: 2,7 Milliarden Euro\n4. Chemische Erzeugnisse: 1,9 Milliarden Euro\n5. Elektrische Ausrüstungen: 1,5 Milliarden Euro\n\nDas gesamte Exportvolumen betrug 19,6 Milliarden Euro, was einem Anstieg von 3,2% im Vergleich zum Vorjahr entspricht.",
    explanation: "Für spezifische Wirtschaftsdaten und aktuelle Statistiken ist RAG besonders nützlich. Das Modell kennt allgemeine Trends, aber keine aktuellen präzisen Zahlen ohne externe Datenquellen.",
    category: 'specific',
    source: 'database',
    accuracy: 'high',
    sourceInfo: 'Statistisches Bundesamt - Außenhandelsstatistik 2023'
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