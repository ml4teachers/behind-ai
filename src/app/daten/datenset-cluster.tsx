'use client'

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Papa from 'papaparse'
import dynamic from 'next/dynamic'

// React-Plotly with dynamic import to avoid SSR issues
const PlotlyComponent = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <p>Lädt Visualisierung...</p>
})

interface ClusterInfo {
  clusterId: number
  label: string
  labelTranslated: string
  x: number
  y: number
}

interface DataPoint {
  x: number
  y: number
  eduScore: number
  label: number
  text: string
}

// CSV row type definitions to avoid 'any'
interface InfoRow {
  cluster_id: string
  cluster_summaries?: string
  cluster_summaries_translated?: string
  cluster_position_x: string
  cluster_position_y: string
}

interface DataRow {
  X: string
  Y: string
  edu_labels: string
  cluster_labels: string
  content_display_translated?: string
  content_display?: string
}

// Color generator for clusters
const getColor = (i: number, opacity = 1) => {
  const COLORS = [
    ["235", "102", "59"], // Burnt Orange
    ["46", "145", "229"], // Sky Blue
    ["225", "95", "153"], // Soft Magenta
    ["28", "167", "28"], // Bright Green
    ["167", "119", "241"], // Lavender
    ["182", "129", "0"], // Mustard Yellow
    ["134", "42", "22"], // Brick Red
    ["0", "160", "139"], // Teal
    ["175", "0", "56"], // Crimson
    ["108", "124", "50"], // Olive Green
    ["81", "28", "251"], // Royal Blue
    ["218", "22", "255"], // Electric Purple
    ["98", "0", "66"], // Dark Magenta
    ["251", "0", "209"], // Hot Pink
    ["252", "0", "128"], // Bright Pink
    ["119", "138", "174"], // Slate Blue
    ["22", "22", "167"], // Deep Blue
    ["218", "96", "202"], // Orchid
  ]
  
  if (i < 0) {
    i = Math.abs(i)
  }
  return `rgba(${COLORS[i % COLORS.length].join(",")}, ${opacity})`
}

export function DatensetCluster() {
  const plotRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const loadClusterData = async () => {
      try {
        setIsLoading(true)
        
        // Lade Cluster-Informationen aus der CSV-Datei
        const infoResponse = await fetch('/daten/assets/info.csv')
        const infoText = await infoResponse.text()
      
        // Parse die CSV mit Papa Parse mit Typisierung
        const infoResults = Papa.parse<InfoRow>(infoText, {
          header: true,
          skipEmptyLines: true,
        })
        
        // Konvertiere die CSV-Daten in das ClusterInfo-Format
        const clusterInfo: ClusterInfo[] = infoResults.data
          .filter(row => row.cluster_id !== undefined && row.cluster_id !== '-1' && row.cluster_summaries_translated)
          .map(row => ({
            clusterId: parseInt(row.cluster_id),
            label: row.cluster_summaries || '',
            labelTranslated: row.cluster_summaries_translated || '',
            x: parseFloat(row.cluster_position_x),
            y: parseFloat(row.cluster_position_y)
          }))
        
        // Lade Datenpunkte aus der CSV-Datei
        const dataResponse = await fetch('/daten/assets/data.csv')
        const dataText = await dataResponse.text()
        
        // Parse die CSV mit Papa Parse mit Typisierung
        const dataResults = Papa.parse<DataRow>(dataText, {
          header: true,
          skipEmptyLines: true,
          delimiter: ';' // Beachte das Semikolon als Trennzeichen
        })
        
        // Konvertiere die CSV-Daten in das DataPoint-Format
        const dataPoints: DataPoint[] = dataResults.data
          .filter(row => row.X !== undefined && row.Y !== undefined)
          .map(row => ({
            x: parseFloat(row.X), // Skaliere die x-Koordinaten
            y: parseFloat(row.Y), // Skaliere die y-Koordinaten
            eduScore: parseInt(row.edu_labels) || 0,
            label: parseInt(row.cluster_labels) || 0,
            text: row.content_display_translated || row.content_display || 'Kein Text verfügbar'
          }))

          function formatHoverText(text: string, wordsPerLine = 10, maxLines = 15): string {
            const words = text.split(' ');
            let formattedText = '';
            let lineCount = 0;
          
            for (let i = 0; i < words.length; i++) {
              formattedText += words[i] + ' ';
          
              // Nach jeweils wordsPerLine Wörtern einen Zeilenumbruch einfügen
              if ((i + 1) % wordsPerLine === 0) {
                lineCount++;
                if (lineCount >= maxLines) {
                  formattedText += '...';
                  break;
                }
                formattedText += '<br>';
              }
            }
          
            return formattedText.trim();
          }

        
        if (plotRef.current) {
          // Label-Mapping für Hover-Text
          const labelIDToName: {[key: number]: string} = {}
          clusterInfo.forEach(info => {
            labelIDToName[info.clusterId] = info.labelTranslated
          })
          
          // Scatter-Plot-Daten erstellen
          const plotData = [{
            type: 'scatter',
            mode: 'markers',
            x: dataPoints.map(d => d.x),
            y: dataPoints.map(d => d.y),
            marker: {
              color: dataPoints.map(d => getColor(d.label, 0.4)),
              size: 5.5,
            },
            hoverinfo: 'text',
            hovertext: dataPoints.map(d => 
              `<b>Thema:</b> ${labelIDToName[d.label] || "Unbekannt"}<br>
              <b>Bildungswert:</b> ${d.eduScore}/5<br>
              <b>Text:</b> ${formatHoverText(d.text, 10, 15)}`
            ),
            hoverlabel: {
              bgcolor: 'white',
            },
          }]
          
          // Annotationen für Cluster-Labels hinzufügen
          const annotations = clusterInfo.map(info => ({
            x: info.x,
            y: info.y,
            text: info.labelTranslated,
            showarrow: false,
            font: {
              size: 14,
              color: 'black',
              weight: 'bold',
            },
            bgcolor: getColor(info.clusterId, 0.6),
            borderpad: 2,
          }))
          
          // Layout-Konfiguration
          const layout = {
            height: 500,
            width: plotRef.current.clientWidth,
            xaxis: {
              showticklabels: false,
              showgrid: false,
              zeroline: false,
              title: {
                text: "Interaktive Visualisierung des FineWeb-Datensatzes",
                font: {
                  size: 16,
                  style: "italic",
                },
              },
              // Automatischer Bereich basierend auf Daten
              autorange: true
            },
            yaxis: {
              showticklabels: false,
              showgrid: false,
              zeroline: false,
              // Automatischer Bereich basierend auf Daten
              autorange: true
            },
            annotations: annotations.slice(0, 15), // Auf 15 Annotationen für Übersichtlichkeit begrenzen
            font: {
              family: "system-ui, sans-serif",
            },
            margin: {
              t: 30,
              b: 50,
              l: 15,
              r: 15,
            },
            hovermode: 'closest'
          }
          
          // Setze die Daten für react-plotly.js
          setPlotData(plotData)
          setPlotLayout(layout)
          setIsLoading(false)
          
          // Nur ein cleanup für potentielle future listeners
          return () => {
            // Cleanup code wenn nötig
          }
        }
      } catch (err) {
        console.error('Error loading cluster data:', err)
        setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
        setIsLoading(false)
      }
    }
    
    loadClusterData()
  }, [])

  if (error) {
    return (
      <Card className="p-4 bg-red-50 text-red-800">
        <p>Fehler beim Laden der Visualisierung: {error}</p>
      </Card>
    )
  }
  
  // State für Plotly Daten und Layout
  const [plotData, setPlotData] = useState<any[]>([])
  const [plotLayout, setPlotLayout] = useState<any>({})
  
  // Zustandsvariable für Client-side rendering
  const [isReady, setIsReady] = useState(false)
  
  // Setze isReady nach dem ersten Render
  useEffect(() => {
    setIsReady(true)
  }, [])
  
  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10">
          <Skeleton className="h-[400px] w-full mb-2" />
          <p className="text-gray-500">Lade Datenvisualisierung...</p>
        </div>
      )}
      
      <div 
        ref={plotRef} 
        className="w-full"
        style={{ minHeight: '500px' }}
      >
        {!isLoading && isReady && plotData.length > 0 && (
          <PlotlyComponent
            data={plotData}
            layout={plotLayout}
            config={{ 
              displayModeBar: true,
              responsive: true,
              scrollZoom: true,
              displaylogo: false
            }}
            style={{ width: '100%', height: '500px' }}
          />
        )}
      </div>
      
      {!isLoading && (
        <div className="text-xs text-gray-500 mt-2">
          Hinweis: Beachte die Werkzeuge oben rechts, um in einzelne Bereiche 🔍 hineinzuzoomen und das 🏠 Haus, um wieder zur ursprünglichen Darstellung zu wechseln.
        </div>
      )}
    </div>
  )
}