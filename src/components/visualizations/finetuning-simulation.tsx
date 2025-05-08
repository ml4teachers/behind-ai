'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { ChatBubbleIcon, InfoCircledIcon, ReloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'

// Beispielanfragen für die Simulation
const sampleQueries = [
  "Wer war Albert Einstein?",
  "Was ist der Satz des Pythagoras?",
  "Schreibe ein kurzes Gedicht über Roboter",
  "Wie funktioniert ein Elektromotor?",
  "Erkläre mir die Relativitätstheorie einfach"
]

interface ChatMessage {
  content: string
  role: 'user' | 'assistant'
  model: 'pretrained' | 'finetuned'
}

export const FinetuningSimulation = () => {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pretrained')
  const [pretrainedMessages, setPretrainedMessages] = useState<ChatMessage[]>([])
  const [finetunedMessages, setFinetunedMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchModelResponse = async (userQuery: string, mode: 'pretrained' | 'finetuned') => {
    try {
      const response = await fetch('/api/finetuning-simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userQuery,
          mode: mode,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler bei der API-Anfrage')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Fehler bei der API-Anfrage:', error)
      setError(error instanceof Error ? error.message : 'Unbekannter Fehler')
      return null
    }
  }

  const handleSendMessage = async () => {
    if (!query.trim() || isTyping) return
    setError(null)

    // Füge Benutzernachricht hinzu
    const userMessage = {
      content: query,
      role: 'user',
      model: activeTab as 'pretrained' | 'finetuned'
    }

    // Füge die Nachricht zum richtigen Chat hinzu
    if (activeTab === 'pretrained') {
      setPretrainedMessages(prev => [...prev, userMessage as ChatMessage])
    } else {
      setFinetunedMessages(prev => [...prev, userMessage as ChatMessage])
    }

    setIsTyping(true)
    
    // API aufrufen, um eine Antwort zu erhalten
    const responseContent = await fetchModelResponse(query, activeTab as 'pretrained' | 'finetuned')
    
    if (responseContent) {
      const assistantMessage = {
        content: responseContent,
        role: 'assistant',
        model: activeTab as 'pretrained' | 'finetuned'
      }
      
      if (activeTab === 'pretrained') {
        setPretrainedMessages(prev => [...prev, assistantMessage as ChatMessage])
      } else {
        setFinetunedMessages(prev => [...prev, assistantMessage as ChatMessage])
      }
    }
    
    setIsTyping(false)
    setQuery('')
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setError(null)
  }

  const handleSampleQuery = (sample: string) => {
    setQuery(sample)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 bg-violet-50 p-4 rounded-lg border border-violet-100">
        <div className="flex gap-2 items-start">
          <InfoCircledIcon className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-violet-800">Sprachmodell-Simulation vor und nach dem Finetuning</h3>
            <p className="text-sm text-violet-700">
              Stelle eine Frage an das Modell und vergleiche das Verhalten zwischen einem Modell, 
              das wie im Pretraining einfach Text fortsetzt, und einem Modell, das als Assistent 
              finegetuned wurde. Du kannst zwischen den Tabs wechseln, um den Unterschied zu sehen.
            </p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Ein Fehler ist aufgetreten</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Beispielanfragen:</p>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sample, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm"
              onClick={() => handleSampleQuery(sample)}
              className="text-xs"
              disabled={isTyping}
            >
              {sample}
            </Button>
          ))}
        </div>
      </div>
      
      <Tabs defaultValue="pretrained" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pretrained">Nur Pretraining</TabsTrigger>
          <TabsTrigger value="finetuned">Nach Finetuning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pretrained" className="space-y-4">
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex flex-col h-[360px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {pretrainedMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-6">
                      <ChatBubbleIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>Das Modell wurde mit großen Textmengen trainiert, um Texte vorherzusagen und zu vervollständigen.</p>
                      <p className="text-sm mt-2">Stelle eine Frage, um zu sehen, wie ein Modell nach dem Pretraining antwortet.</p>
                    </div>
                  ) : (
                    pretrainedMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg ${
                          message.role === 'user' 
                          ? 'bg-violet-100 text-violet-900 ml-6'
                          : 'bg-white border border-gray-200 mr-6'
                        }`}
                      >
                        <p className="text-xs text-gray-500 mb-1">
                          {message.role === 'user' ? 'Du:' : 'Modell nach Pretraining:'}
                        </p>
                        <p className="whitespace-pre-line">{message.content}</p>
                      </motion.div>
                    ))
                  )}
                  {isTyping && activeTab === 'pretrained' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-white border border-gray-200 mr-6"
                    >
                      <p className="text-xs text-gray-500 mb-1">Modell nach Pretraining:</p>
                      <div className="flex items-center gap-2 text-gray-400">
                        <ReloadIcon className="w-3 h-3 animate-spin" />
                        <span>Generiert Fortsetzung...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="bg-white p-2 rounded-lg border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Gib eine Frage ein..."
                      className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      disabled={isTyping}
                    />
                    <Button onClick={handleSendMessage} disabled={!query.trim() || isTyping}>
                      Senden
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-sm font-medium mb-2">Was passiert nach dem Pretraining:</p>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Das Modell <span className="text-amber-700">setzt den Text fort</span> statt direkt zu antworten</li>
              <li>• Es kann <span className="text-amber-700">in den Text des Prompts einfließen</span> und diesen wiederholen</li>
              <li>• Die Antworten sind oft <span className="text-amber-700">ausschweifend und unfokussiert</span></li>
              <li>• Es fehlt das <span className="text-amber-700">Verständnis für seine Rolle</span> als Assistent</li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="finetuned" className="space-y-4">
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex flex-col h-[360px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {finetunedMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-6">
                      <ChatBubbleIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>Das Modell wurde zusätzlich mit Dialog-Beispielen trainiert, um die Rolle eines Assistenten zu lernen.</p>
                      <p className="text-sm mt-2">Stelle eine Frage, um zu sehen, wie ein Modell nach dem Finetuning antwortet.</p>
                    </div>
                  ) : (
                    finetunedMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg ${
                          message.role === 'user' 
                          ? 'bg-violet-100 text-violet-900 ml-6'
                          : 'bg-green-50 border border-green-200 mr-6'
                        }`}
                      >
                        <p className="text-xs text-gray-500 mb-1">
                          {message.role === 'user' ? 'Du:' : 'Modell nach Finetuning:'}
                        </p>
                        <p className="whitespace-pre-line">{message.content}</p>
                      </motion.div>
                    ))
                  )}
                  {isTyping && activeTab === 'finetuned' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-green-50 border border-green-200 mr-6"
                    >
                      <p className="text-xs text-gray-500 mb-1">Modell nach Finetuning:</p>
                      <div className="flex items-center gap-2 text-gray-400">
                        <ReloadIcon className="w-3 h-3 animate-spin" />
                        <span>Erstellt Antwort...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                <div className="bg-white p-2 rounded-lg border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Gib eine Frage ein..."
                      className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      disabled={isTyping}
                    />
                    <Button onClick={handleSendMessage} disabled={!query.trim() || isTyping}>
                      Senden
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-sm font-medium mb-2">Was Finetuning verbessert hat:</p>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Das Modell <span className="text-green-700">antwortet direkt</span> auf die gestellte Frage</li>
              <li>• Es verwendet <span className="text-green-700">klare, strukturierte Formate</span> (Listen, Abschnitte)</li>
              <li>• Die Antworten sind <span className="text-green-700">prägnant und fokussiert</span></li>
              <li>• Es versteht seine <span className="text-green-700">Rolle als hilfreicher Assistent</span></li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <h3 className="font-medium text-amber-800 mb-2">Wie funktioniert Finetuning?</h3>
        <p className="text-sm text-amber-700 mb-2">
          Beim Finetuning wird das Modell mit <strong>speziellen Datensätzen</strong> trainiert, die aus 
          menschlichen Anfragen und idealen Antworten bestehen. Dabei lernt es:
        </p>
        <ul className="text-sm space-y-1 text-amber-700 list-disc pl-5">
          <li>Eine konsistente <strong>Assistenten-Persona</strong> einzunehmen</li>
          <li>Direkt auf Fragen zu <strong>antworten statt Text fortzuführen</strong></li>
          <li>Informationen <strong>strukturiert und klar</strong> zu präsentieren</li>
          <li>Anweisungen aus dem Prompt zu <strong>befolgen</strong></li>
        </ul>
        <p className="text-sm text-amber-700 mt-2">
          Der Finetuning-Prozess verwendet dabei die gleiche Trainingstechnik wie beim Pretraining, aber mit 
          einem spezifischen, qualitativ hochwertigen Datensatz für Konversationen.
        </p>
      </div>
      
      <div className="p-2 bg-gray-100 rounded text-xs text-gray-500 text-center">
        Die Simulation verwendet echte KI-Modelle: Babbage-002 (nur vortrainiert) zeigt,
        wie ein Sprachmodell vor dem Finetuning reagiert, während GPT-4.1-mini das Verhalten
        nach dem Finetuning demonstriert.
      </div>
    </div>
  )
}