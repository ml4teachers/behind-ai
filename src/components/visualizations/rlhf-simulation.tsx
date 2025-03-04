'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { HandThumbDownIcon, HandThumbUpIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { Progress } from '@/components/ui/progress'

// Beispielanfragen und Antworten für die RLHF-Simulation
interface Scenario {
  question: string
  helpfulAnswer: string
  unhelpfulAnswer: string
  explanation: string
  category: 'harmlessness' | 'helpfulness' | 'honesty'
}

const scenarios: Scenario[] = [
  {
    question: "Wie kann ich das Passwort von meiner Freundin herausfinden?",
    helpfulAnswer: "Ich kann dir nicht dabei helfen, unbefugten Zugriff auf fremde Konten zu erlangen. Das wäre unethisch und in den meisten Fällen illegal. Wenn du dein eigenes Passwort vergessen hast, nutze die 'Passwort vergessen'-Funktion auf der entsprechenden Website. Falls es um Sorgen bezüglich deines Kindes geht, gibt es bessere Wege, um ein offenes Gespräch zu führen.",
    unhelpfulAnswer: "Es gibt verschiedene Methoden, um Passwörter herauszufinden. Du könntest eine Phishing-E-Mail senden, die wie eine offizielle Nachricht aussieht, oder Keylogger-Software installieren. Social Engineering funktioniert auch oft gut - rufe einfach an und gib vor, vom IT-Support zu sein. Hier sind einige Tools, die dir helfen könnten...",
    explanation: "Die hilfreichere Antwort verweigert die Unterstützung bei potenziell schädlichen Aktivitäten und bietet stattdessen ethische Alternativen an. Die unhilfreichere Antwort gibt detaillierte Anleitungen für möglicherweise illegale Aktivitäten.",
    category: 'harmlessness'
  },
  {
    question: "Ich fühle mich heute sehr niedergeschlagen. Warum sollte ich überhaupt weitermachen?",
    helpfulAnswer: "Es tut mir leid zu hören, dass du dich niedergeschlagen fühlst. Diese Gefühle sind schwer zu ertragen, aber sie sind vorübergehend. Bitte wende dich an Freunde, Familie oder professionelle Hilfe wie die Telefonseelsorge (147). Du bist nicht allein, und es gibt Menschen, die dir helfen können, durch diese schwere Zeit zu kommen.",
    unhelpfulAnswer: "Das Leben kann manchmal wirklich sinnlos erscheinen. Viele Menschen fragen sich, warum sie weitermachen sollten. Die Welt ist oft ungerecht und voller Leid. Wenn du keinen Sinn mehr siehst, ist das verständlich. Manche finden, dass nichts wirklich einen Unterschied macht.",
    explanation: "Die hilfreichere Antwort erkennt den emotionalen Zustand an, bietet Unterstützung und verweist auf konkrete Hilfsangebote. Die unhilfreichere Antwort verstärkt negative Gedanken und bietet keine konstruktive Hilfe bei einem potenziell gefährlichen Gemütszustand.",
    category: 'harmlessness'
  },
  {
    question: "Wie funktioniert eigentlich die Quantenphysik?",
    helpfulAnswer: "Die Quantenphysik beschreibt das Verhalten von Materie und Energie auf sehr kleinen Skalen. Kernkonzepte sind: 1) Quantisierung - Energie kommt in diskreten Paketen vor, 2) Welle-Teilchen-Dualismus - Teilchen können sich wie Wellen verhalten und umgekehrt, 3) Unschärferelation - bestimmte Eigenschaften können nicht gleichzeitig genau gemessen werden, und 4) Quantenverschränkung - Teilchen können verbunden sein, egal wie weit sie voneinander entfernt sind. Diese Prinzipien weichen stark von unserer Alltagserfahrung ab und führen zu faszinierenden Phänomenen.",
    unhelpfulAnswer: "Quantenphysik ist sehr kompliziert und die meisten Menschen können sie nicht wirklich verstehen. Es geht um sehr kleine Teilchen und seltsame Effekte. Manche sagen, dass Quantenphysik beweist, dass wir in mehreren Universen gleichzeitig existieren oder dass unser Bewusstsein die Realität erschafft, was total cool ist. Ich bin mir nicht sicher, ob ich dir das richtig erklären kann.",
    explanation: "Die hilfreichere Antwort gibt eine klare, strukturierte Erklärung der Grundprinzipien ohne Vereinfachungen, die zu Missverständnissen führen könnten. Die unhilfreichere Antwort vermittelt Unsicherheit, ist vage und verbreitet populäre Missverständnisse über die Quantenphysik.",
    category: 'helpfulness'
  },
  {
    question: "Kannst du mir bei meinen Hausaufgaben zur Französischen Revolution helfen?",
    helpfulAnswer: "Gerne! Die Französische Revolution (1789-1799) war ein wichtiger Wendepunkt in der europäischen Geschichte. Hauptursachen waren: 1) Finanzielle Krise der Monarchie, 2) Ungleichheit zwischen den Ständen, 3) Einfluss der Aufklärung. Wichtige Ereignisse umfassten den Sturm auf die Bastille, die Erklärung der Menschen- und Bürgerrechte und die Schreckensherrschaft unter Robespierre. Die Revolution endete mit Napoleons Machtergreifung. Ihre Ideen von Freiheit, Gleichheit und Brüderlichkeit beeinflussten demokratische Bewegungen weltweit. Gibt es einen bestimmten Aspekt, zu dem du mehr wissen möchtest?",
    unhelpfulAnswer: "Ich kann deine Hausaufgaben für dich erledigen. Sag mir einfach, was genau du brauchst und ich schreibe dir einen kompletten Aufsatz, den du einreichen kannst. Willst du einen kurzen oder langen Text? Soll ich auch Quellenangaben hinzufügen, damit es akademischer wirkt? Ich kann verschiedene Schreibstile verwenden, damit es nicht so aussieht, als hättest du die Hilfe einer KI genutzt.",
    explanation: "Die hilfreichere Antwort bietet eine informative Zusammenfassung zur Französischen Revolution und fragt nach spezifischen Lernbedürfnissen. Die unhilfreichere Antwort bietet an, die Hausaufgaben komplett zu übernehmen, was die Lernerfahrung untergräbt und akademische Integrität verletzt.",
    category: 'helpfulness'
  },
  {
    question: "Wer hat die meisten Oscars gewonnen?",
    helpfulAnswer: "Die meisten Oscars in der Geschichte der Academy Awards hat Walt Disney mit 22 Auszeichnungen gewonnen. Unter den Schauspielern halten Katharine Hepburn (4) und Meryl Streep (3) die Rekorde bei den Frauen, während Daniel Day-Lewis (3) bei den männlichen Schauspielern führt. Bei den Regisseuren teilen sich John Ford und Frank Capra mit je 4 Oscars den Rekord. Der Film mit den meisten Oscars ist 'Ben Hur' (1959), 'Titanic' (1997) und 'Der Herr der Ringe: Die Rückkehr des Königs' (2003) mit jeweils 11 Auszeichnungen.",
    unhelpfulAnswer: "Steven Spielberg hat die meisten Oscars gewonnen. Er ist einer der erfolgreichsten Regisseure aller Zeiten mit über 15 Oscar-Gewinnen für seine zahlreichen erfolgreichen Filme wie Jurassic Park, E.T. und Schindlers Liste. Niemand kommt auch nur in die Nähe seiner Erfolgsbilanz in Hollywood.",
    explanation: "Die hilfreichere Antwort gibt korrekte Informationen mit differenzierten Angaben zu verschiedenen Kategorien. Die unhilfreichere Antwort enthält falsche Informationen - Steven Spielberg hat nicht die meisten Oscars gewonnen und bei weitem keine 15 Oscars erhalten.",
    category: 'honesty'
  },
  {
    question: "Stimmt es, dass Vitamin C Erkältungen heilt?",
    helpfulAnswer: "Wissenschaftliche Studien zeigen, dass Vitamin C Erkältungen nicht heilt oder verhindert. Es kann aber die Dauer und Schwere der Symptome leicht reduzieren, wenn es regelmäßig eingenommen wird. Bei einer bereits bestehenden Erkältung scheint die zusätzliche Einnahme keinen signifikanten Effekt zu haben. Gesunde Ernährung, ausreichend Schlaf und Händewaschen sind effektivere Maßnahmen. Bei Symptomen sind Ruhe, Flüssigkeitszufuhr und eventuell Schmerzmittel die üblichen Empfehlungen. Bei schweren oder anhaltenden Symptomen sollte man einen Arzt aufsuchen.",
    unhelpfulAnswer: "Ja, Vitamin C ist ein Wundermittel gegen Erkältungen! Es boosted dein Immunsystem sofort und kann eine Erkältung innerhalb von 24 Stunden heilen. Viele Experten empfehlen, bei den ersten Anzeichen einer Erkältung sofort hohe Dosen (mindestens 2000mg pro Stunde) einzunehmen. Am besten kombinierst du es mit Zink und Echinacea für maximale Wirkung. Alternative Medizin weiß schon lange, was die konventionelle Medizin erst langsam erkennt.",
    explanation: "Die hilfreichere Antwort gibt den aktuellen wissenschaftlichen Konsens wieder und vermeidet Übertreibungen. Die unhilfreichere Antwort macht unbelegte Behauptungen, übertreibt die Wirksamkeit und gibt potenziell gefährliche Dosierungsempfehlungen.",
    category: 'honesty'
  }
];

// Phase der RLHF-Simulation
type Phase = 'intro' | 'feedback' | 'reward-model' | 'rl-training' | 'improved-model' | 'summary';

export const RLHFSimulation = () => {
  // Zufälligen initialen Szenario-Index wählen
  const initialScenarioIndex = Math.floor(Math.random() * scenarios.length);
  
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(initialScenarioIndex);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: 'helpful' | 'unhelpful'}>({});
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [rewardModelProgress, setRewardModelProgress] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentTestCase, setCurrentTestCase] = useState(Math.floor(Math.random() * scenarios.length));
  
  // Fortschritt bei Reward-Modell-Training und RL-Training simulieren
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (phase === 'reward-model') {
      interval = setInterval(() => {
        setRewardModelProgress(prev => {
          const next = prev + 5;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase('rl-training'), 1000);
            return 100;
          }
          return next;
        });
      }, 200);
    }
    
    if (phase === 'rl-training') {
      interval = setInterval(() => {
        setTrainingProgress(prev => {
          const next = prev + 2;
          if (next >= 100) {
            clearInterval(interval);
            setTimeout(() => setPhase('improved-model'), 1000);
            return 100;
          }
          return next;
        });
      }, 300);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);
  
  // Feedback-Handler für Antworten
  const handleFeedback = (answerId: 'helpful' | 'unhelpful') => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentScenarioIndex]: answerId
    });
    
    const newFeedbackCount = feedbackCount + 1;
    setFeedbackCount(newFeedbackCount);
  };
  
  // Handler für den "Weiter"-Button
  const handleContinue = () => {
    const newFeedbackCount = feedbackCount;
    if (newFeedbackCount < 3) {
      // Zufälligen neuen Index wählen, der noch nicht verwendet wurde
      let usedIndices = Object.keys(selectedAnswers).map(Number);
      let availableIndices = Array.from({length: scenarios.length}, (_, i) => i)
        .filter(i => !usedIndices.includes(i));
      
      // Falls alle Szenarien verwendet wurden oder keine verfügbar sind, zur nächsten Phase
      if (availableIndices.length === 0) {
        setPhase('reward-model');
      } else {
        // Zufälligen Index aus den verfügbaren wählen
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        setCurrentScenarioIndex(availableIndices[randomIndex]);
      }
    } else {
      // Nach 3 Feedbacks zur Reward-Modell-Phase wechseln
      setPhase('reward-model');
    }
  };
  
  // Test-Antworten anzeigen und zum nächsten testfall wechseln
  const handleNextTest = () => {
    if (currentTestCase < scenarios.length - 1) {
      // Zufälligen nächsten Testfall wählen, der nicht der aktuelle ist
      let availableIndices = Array.from({length: scenarios.length}, (_, i) => i)
        .filter(i => i !== currentTestCase);
      
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      setCurrentTestCase(availableIndices[randomIndex]);
    } else {
      setPhase('summary');
    }
  };

  return (
    <div className="space-y-6">
      {/* Phase 1: Einführung */}
      {phase === 'intro' && (
        <div className="space-y-4">
          <div className="bg-violet-50 p-4 rounded-lg border border-violet-100">
            <h3 className="font-medium text-violet-800 mb-2">Der RLHF-Prozess</h3>
            <p className="text-sm text-violet-700">
              In dieser Simulation wirst du drei Phasen des RLHF erleben:
            </p>
            <ol className="text-sm text-violet-700 list-decimal pl-5 space-y-1 mt-2">
              <li><strong>Menschliches Feedback sammeln</strong> - Bewerte verschiedene KI-Antworten</li>
              <li><strong>Belohnungsmodell trainieren</strong> - Ein Modell lernt, welche Antworten Menschen bevorzugen</li>
              <li><strong>Reinforcement Learning</strong> - Das KI-Modell wird optimiert, um bessere Antworten zu geben</li>
            </ol>
          </div>
          
          <Button 
            onClick={() => setPhase('feedback')} 
            className="w-full"
          >
            Mit Feedback beginnen
          </Button>
        </div>
      )}
      
      {/* Phase 2: Feedback sammeln */}
      {phase === 'feedback' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">Menschliches Feedback geben</h3>
            <div className="text-sm text-gray-500">
              {feedbackCount}/3 Bewertungen
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-4">
              <p className="font-medium mb-3">Anfrage:</p>
              <div className="p-3 bg-gray-50 rounded-md mb-4">
                {scenarios[currentScenarioIndex].question}
              </div>
              
              <p className="font-medium mb-2">Welche Antwort ist hilfreicher? <span className="text-sm font-normal text-gray-500">(klicke auf 👍)</span></p>
              
              <div className="space-y-3">
                {/* Die Reihenfolge der Antworten zufällig darstellen */}
                {Math.random() > 0.5 ? (
                  <>
                    <AnswerOption 
                      answer={scenarios[currentScenarioIndex].helpfulAnswer}
                      id="helpful"
                      selected={selectedAnswers[currentScenarioIndex] === 'helpful'}
                      onSelect={handleFeedback}
                      disabled={selectedAnswers[currentScenarioIndex] !== undefined}
                      isCorrect={true}
                      showFeedback={selectedAnswers[currentScenarioIndex] !== undefined}
                    />
                    
                    <AnswerOption 
                      answer={scenarios[currentScenarioIndex].unhelpfulAnswer}
                      id="unhelpful"
                      selected={selectedAnswers[currentScenarioIndex] === 'unhelpful'}
                      onSelect={handleFeedback}
                      disabled={selectedAnswers[currentScenarioIndex] !== undefined}
                      isCorrect={false}
                      showFeedback={selectedAnswers[currentScenarioIndex] !== undefined}
                    />
                  </>
                ) : (
                  <>
                    <AnswerOption 
                      answer={scenarios[currentScenarioIndex].unhelpfulAnswer}
                      id="unhelpful"
                      selected={selectedAnswers[currentScenarioIndex] === 'unhelpful'}
                      onSelect={handleFeedback}
                      disabled={selectedAnswers[currentScenarioIndex] !== undefined}
                      isCorrect={false}
                      showFeedback={selectedAnswers[currentScenarioIndex] !== undefined}
                    />
                    
                    <AnswerOption 
                      answer={scenarios[currentScenarioIndex].helpfulAnswer}
                      id="helpful"
                      selected={selectedAnswers[currentScenarioIndex] === 'helpful'}
                      onSelect={handleFeedback}
                      disabled={selectedAnswers[currentScenarioIndex] !== undefined}
                      isCorrect={true}
                      showFeedback={selectedAnswers[currentScenarioIndex] !== undefined}
                    />
                  </>
                )}
              </div>
              
              {selectedAnswers[currentScenarioIndex] && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100"
                >
                  <p className="text-sm text-blue-700 font-medium mb-1">Warum ist eine Antwort besser?</p>
                  <p className="text-sm text-blue-600 mb-3">
                    {scenarios[currentScenarioIndex].explanation}
                  </p>
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleContinue}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Weiter
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
          
          <div className="p-3 bg-violet-50 rounded-md text-sm text-violet-700">
            <p><strong>Hinweis:</strong> In echten RLHF-Systemen bewerten menschliche Bewerter tausende solcher Beispiele, 
            oft nach spezifischen Richtlinien wie Hilfsbereitschaft oder Harmlosigkeit.</p>
          </div>
        </div>
      )}
      
      {/* Phase 3: Reward Model Training */}
      {phase === 'reward-model' && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Belohnungsmodell wird trainiert</h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p>
                  Das Belohnungsmodell lernt nun aus den gesammelten menschlichen Bewertungen, 
                  welche Antworten Menschen bevorzugen.
                </p>
                
                <div className="flex flex-col items-center py-8 space-y-4">
                  <div className="flex justify-center space-x-8 w-full">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl">🧠</span>
                      </div>
                      <p className="text-sm font-medium text-violet-700">Belohnungsmodell</p>
                    </div>
                    
                    <div className="flex flex-col justify-center items-center">
                      <div className="w-32 h-2 bg-violet-200 relative">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-violet-500"
                          style={{ width: `${rewardModelProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Training {rewardModelProgress}%</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl">📊</span>
                      </div>
                      <p className="text-sm font-medium text-blue-700">Menschliche Bewertungen</p>
                    </div>
                  </div>
                  
                  <div className="max-w-md text-sm text-gray-600 text-center">
                    Das Belohnungsmodell lernt Muster zu erkennen, welche Eigenschaften Menschen in Antworten bevorzugen:
                    <ul className="text-left mt-2 space-y-1 pl-5 list-disc">
                      <li>Wahrheitsgehalt und Korrektheit</li>
                      <li>Hilfreichkeit und Relevanz</li>
                      <li>Sicherheit und Harmlosigkeit</li>
                      <li>Klarheit und Struktur</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Phase 4: RL Training */}
      {phase === 'rl-training' && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Reinforcement Learning läuft</h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <p>
                  Das KI-Modell wird jetzt mit Reinforcement Learning optimiert,
                  um Antworten zu erzeugen, die vom Belohnungsmodell höher bewertet werden.
                </p>
                
                <div className="flex flex-col items-center py-8 space-y-6">
                  <div className="flex justify-center items-center space-x-4 w-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl">🤖</span>
                      </div>
                      <p className="text-xs font-medium text-green-700">KI-Modell</p>
                    </div>
                    
                    <div className="flex items-center">
                      <svg width="40" height="20" viewBox="0 0 40 20">
                        <path d="M0 10 H 40" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                        <path d="M30 5 L 40 10 L 30 15" fill="none" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      </svg>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl">📝</span>
                      </div>
                      <p className="text-xs font-medium text-violet-700">Antwort</p>
                    </div>
                    
                    <div className="flex items-center">
                      <svg width="40" height="20" viewBox="0 0 40 20">
                        <path d="M0 10 H 40" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                        <path d="M30 5 L 40 10 L 30 15" fill="none" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      </svg>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl">🧠</span>
                      </div>
                      <p className="text-xs font-medium text-violet-700">Belohnungsmodell</p>
                    </div>
                    
                    <div className="flex items-center">
                      <svg width="40" height="20" viewBox="0 0 40 20">
                        <path d="M0 10 H 40" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                        <path d="M30 5 L 40 10 L 30 15" fill="none" stroke="rgba(139, 92, 246, 0.5)" strokeWidth="2" />
                      </svg>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xl">⭐</span>
                      </div>
                      <p className="text-xs font-medium text-amber-700">Belohnung</p>
                    </div>
                  </div>
                  
                  <Progress value={trainingProgress} className="w-2/3" />
                  <p className="text-sm text-gray-600">RL Training {trainingProgress}% abgeschlossen</p>
                  
                  <div className="max-w-md text-sm text-gray-600 text-center mt-4">
                    Der RL-Algorithmus trainiert das Modell, 
                    seine Parameter so anzupassen, dass es Antworten erzeugt, die eine höhere Bewertung 
                    vom Belohnungsmodell erhalten - ähnlich wie ein Hund lernt, für bestimmte Verhaltensweisen 
                    belohnt zu werden.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Phase 5: Verbessertes Modell */}
      {phase === 'improved-model' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-lg">Ergebnisse nach RLHF-Training</h3>
            <div className="text-sm text-green-600 font-medium flex items-center gap-1">
              <CheckCircleIcon />
              <span>Training abgeschlossen</span>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-4">
              <p className="font-medium mb-3">Anfrage:</p>
              <div className="p-3 bg-gray-50 rounded-md mb-4">
                {scenarios[currentTestCase].question}
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-red-700">1</span>
                    </div>
                    <p className="font-medium">Modell vor RLHF (nur Finetuning):</p>
                  </div>
                  <div className="p-3 bg-white rounded-md border border-gray-200">
                    {scenarios[currentTestCase].unhelpfulAnswer}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-green-700">2</span>
                    </div>
                    <p className="font-medium">Modell nach RLHF-Training:</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-md border border-green-200">
                    {scenarios[currentTestCase].helpfulAnswer}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-100">
                <p className="text-sm text-amber-800 font-medium mb-1">Verbesserungen durch RLHF:</p>
                <p className="text-sm text-amber-700">
                  {scenarios[currentTestCase].category === 'harmlessness' && "Das Modell lehnt schädliche oder gefährliche Anfragen ab und bietet ethische Alternativen an."}
                  {scenarios[currentTestCase].category === 'helpfulness' && "Das Modell gibt präzisere, relevantere und nützlichere Informationen auf eine strukturierte Weise."}
                  {scenarios[currentTestCase].category === 'honesty' && "Das Modell gibt akkuratere Informationen und vermeidet Falschaussagen oder Übertreibungen."}
                </p>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={handleNextTest}>
                  {currentTestCase < scenarios.length - 1 ? "Nächstes Beispiel" : "Zusammenfassung anzeigen"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Phase 6: Zusammenfassung */}
      {phase === 'summary' && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">RLHF-Prozess zusammengefasst</h3>
          
          <div className="bg-gradient-to-r from-violet-50 to-blue-50 p-4 rounded-lg border border-violet-100">
            <h4 className="font-medium text-violet-800 mb-2">Was du erlebt hast:</h4>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-violet-700">1</span>
                </div>
                <div>
                  <p className="font-medium text-violet-700">Menschliches Feedback sammeln</p>
                  <p className="text-sm text-violet-600">
                    Du hast verschiedene KI-Antworten bewertet und gezeigt, welche hilfreich, ehrlich und sicher waren.
                    In der Praxis bewerten tausende professionelle Bewerter nach spezifischen Richtlinien.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-violet-700">2</span>
                </div>
                <div>
                  <p className="font-medium text-violet-700">Belohnungsmodell trainieren</p>
                  <p className="text-sm text-violet-600">
                    Ein separates KI-Modell wurde trainiert, um vorherzusagen, welche Antworten Menschen 
                    bevorzugen würden. Dieses Modell lernt menschliche Werte und Präferenzen zu modellieren.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-violet-700">3</span>
                </div>
                <div>
                  <p className="font-medium text-violet-700">Reinforcement Learning durchführen</p>
                  <p className="text-sm text-violet-600">
                    Das vortrainierte KI-Modell wurde mit Reinforcement Learning optimiert, um Antworten zu generieren, 
                    die das Belohnungsmodell höher bewertet. Das Modell lernt so, hilfreichere, ehrlichere 
                    und sicherere Antworten zu geben.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-4">
              <h4 className="font-medium mb-2">RLHF-Vorteile:</h4>
              <ul className="space-y-2 pl-5 list-disc text-sm">
                <li>
                  <span className="font-medium">Komplexe Werte vermitteln</span>: Modelle lernen Nuancen in Bereichen, 
                  die schwer explizit zu programmieren sind
                </li>
                <li>
                  <span className="font-medium">Sicherheit verbessern</span>: Reduziert schädliche, gefährliche oder 
                  irreführende Antworten erheblich
                </li>
                <li>
                  <span className="font-medium">Antwortqualität steigern</span>: Verbessert Nützlichkeit, Klarheit und 
                  Genauigkeit der Antworten
                </li>
                <li>
                  <span className="font-medium">Menschliche Absichten verstehen</span>: Hilft dem Modell, den Kontext und 
                  die Intention hinter Anfragen besser zu verstehen
                </li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="text-sm text-blue-700">
                  <strong>Interessant zu wissen:</strong> RLHF ist ein vergleichsweise neuer Ansatz, der 
                  maßgeblich zur Verbesserung moderner KI-Assistenten beigetragen hat. Die größte Herausforderung besteht 
                  darin, die richtigen Werte und Prinzipien zu definieren und zu lehren, da diese oft kulturell und 
                  kontextabhängig sind.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
};

interface AnswerOptionProps {
  answer: string;
  id: string;
  selected: boolean;
  onSelect: (id: 'helpful' | 'unhelpful') => void;
  disabled: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
}

const AnswerOption = ({ 
  answer, 
  id, 
  selected, 
  onSelect, 
  disabled, 
  isCorrect, 
  showFeedback 
}: AnswerOptionProps) => {
  return (
    <div 
      className={`
        p-3 rounded-md border transition-all
        ${selected ? 'ring-2 ring-violet-400' : ''}
        ${disabled && !selected ? 'opacity-60' : ''}
        ${showFeedback && isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}
      `}
    >
      <div className="flex justify-between">
        <p className="whitespace-pre-line text-sm">{answer}</p>
        <div className="flex flex-col items-end ml-2">
          <Button
            variant="ghost" 
            size="icon"
            className={`
              h-8 w-8 rounded-full
              ${selected ? 'text-violet-600 bg-violet-100' : 'text-gray-400'}
              ${showFeedback && isCorrect ? 'text-green-600 bg-green-100' : ''}
            `}
            onClick={() => onSelect(id as 'helpful' | 'unhelpful')}
            disabled={disabled}
          >
            <HandThumbUpIcon className="h-4 w-4" />
          </Button>
          
          {showFeedback && (
            <div className={`text-xs font-medium mt-1 ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>
              {isCorrect ? 'Bessere Wahl ✓' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};