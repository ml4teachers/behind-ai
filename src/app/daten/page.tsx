'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GuideCharacter } from '@/components/guide/guide-character'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { DatensetCluster } from './datenset-cluster'

export default function DatenPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-start gap-6 mb-8">
        <GuideCharacter emotion="thinking" />
        <div>
          <h1 className="text-3xl font-bold mb-2 text-violet-900">Wo kommen die Daten her?</h1>
          <p className="text-lg text-gray-600">
            Die Qualität und Zusammensetzung der Trainingsdaten hat einen entscheidenden Einfluss auf das Verhalten von KI-Modellen
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Warum Daten so wichtig sind</CardTitle>
          <CardDescription>
            Trainingsdaten prägen, was eine KI lernt und wie sie sich verhält
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Ein Sprachmodell wie ChatGPT hat in seiner Basisversion nie ein Spiel gespielt, einen Film gesehen oder ein Buch gelesen.
            Alles, was es weiß, stammt aus den Texten, mit denen es trainiert wurde.
          </p>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">Riesige Textmengen als Basis</p>
              <p className="text-sm text-violet-700">
                Moderne KI-Modelle wie GPT-4 werden mit <strong>Billionen von Wörtern</strong> trainiert, 
                die aus verschiedensten Quellen des Internets stammen. Die Menge und Zusammensetzung dieser 
                Daten hat enormen Einfluss auf die Fähigkeiten des Modells.
              </p>
            </div>
          </div>
          
          <p>
            Die Qualität einer KI hängt stark davon ab, welche Daten zum Training verwendet wurden. 
            Um leistungsfähige Modelle zu entwickeln, werden deshalb enorme Mengen an Textdaten aus dem 
            Internet gefiltert und aufbereitet.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Der FineWeb-Datensatz</CardTitle>
          <CardDescription>
            Ein Blick auf die Inhalte moderner KI-Trainingsdaten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Der FineWeb-Datensatz ist ein hochqualitativer, öffentlich verfügbarer Trainingsdatensatz 
            für große Sprachmodelle. Er umfasst ca. 15 Billionen Tokens (Wortbestandteile) und wurde aus 
            Webseiten des CommonCrawl-Archivs extrahiert, gefiltert und optimiert.
          </p>
          
          <div className="border rounded-lg p-4 bg-white min-h-[500px] mb-4">
            <DatensetCluster />
          </div>
          
          <p className="text-sm text-gray-600 italic mb-4">
            Interaktive Visualisierung der Themencluster im FineWeb-Datensatz. Jeder Punkt repräsentiert ein 
            Textdokument, und die Farben zeigen verschiedene thematische Cluster. Durch Zoomen und Bewegen 
            kannst du die Zusammensetzung der Daten erkunden.
          </p>
          
          <p>
            Die Visualisierung zeigt, wie vielfältig die Inhalte sind, die zum Training verwendet werden. 
            Von Technologie und Wissenschaft über Sport und Gesundheit bis hin zu Kunst und Kultur - 
            ein modernes KI-System muss aus allen Bereichen menschlichen Wissens lernen.
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wie werden Trainingsdaten gefiltert?</CardTitle>
          <CardDescription>
            Die Kunst, qualitativ hochwertige Daten aus dem Internet zu destillieren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Nicht alle Inhalte aus dem Internet sind für das Training nützlich. Forschende wenden 
            komplexe Filterverfahren an, um problematische oder qualitativ minderwertige Inhalte zu entfernen:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Duplikate entfernen</strong> - Häufig wiederkehrende Texte werden identifiziert und reduziert</li>
            <li><strong>Sprachqualität</strong> - Texte mit korrekter Grammatik und gutem Schreibstil werden bevorzugt</li>
            <li><strong>Bildungswert</strong> - Inhalte mit hohem Bildungswert erhalten höhere Priorität</li>
            <li><strong>Formatierung</strong> - Texte mit merkwürdiger Formatierung, Codefragmenten oder Listen werden gefiltert</li>
            <li><strong>Inhaltsfilter</strong> - Schädliche, anstößige oder problematische Inhalte werden entfernt</li>
          </ul>
          
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 my-4 flex gap-3">
            <InfoCircledIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-violet-800 mb-1">KI hilft bei der Datenselektion</p>
              <p className="text-sm text-violet-700">
                Interessanterweise werden heute oft selbst KI-Systeme eingesetzt, um Trainingsdaten 
                für neue KI-Modelle zu bewerten und auszuwählen. Moderne Datensätze wie FineWeb-Edu 
                nutzen bestehende Sprachmodelle, um Texte mit hohem Bildungswert zu identifizieren.
              </p>
            </div>
          </div>
          
          <p>
            Dieser Filterprozess reduziert Rohdaten oft um mehr als 90%, sodass nur die qualitativ 
            hochwertigsten Inhalte übrig bleiben. Die Qualität dieser Auswahl ist entscheidend 
            für die Fähigkeiten des resultierenden KI-Systems.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/next-token">
          <Button variant="outline">
            <span aria-hidden="true">←</span> Zurück
          </Button>
        </Link>
        <Link href="/training">
          <Button>
            Weiter: Training vs. Inferenz <span aria-hidden="true">→</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}