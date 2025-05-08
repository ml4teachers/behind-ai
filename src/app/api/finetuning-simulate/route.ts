import { NextRequest, NextResponse } from 'next/server'

// Konstanten für die OpenAI API
const CHAT_API_URL = 'https://api.openai.com/v1/chat/completions'
const COMPLETIONS_API_URL = 'https://api.openai.com/v1/completions'
const API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { query, mode } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query muss angegeben werden' },
        { status: 400 }
      )
    }

    if (!mode || !['pretrained', 'finetuned'].includes(mode)) {
      return NextResponse.json(
        { error: 'Gültiger Modus (pretrained oder finetuned) muss angegeben werden' },
        { status: 400 }
      )
    }

    let response, data;

    if (mode === 'pretrained') {
      // Verwende babbage-002 für den Pretraining-Modus (reines Sprachmodell ohne Assistenz-Finetuning)
      response = await fetch(COMPLETIONS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'babbage-002',
          prompt: query,
          max_tokens: 350,
          temperature: 0.7,
          stop: ["\n\n"]
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API-Fehler (babbage):', errorData)
        return NextResponse.json(
          { error: `Fehler bei der Anfrage an die Completions API: ${response.status}` },
          { status: response.status }
        )
      }
      
      data = await response.json()
      return NextResponse.json({
        response: data.choices[0].text,
        model: mode
      })
      
    } else {
      // Verwende gpt-4.1-nano für den Finetuning-Modus (Assistenz-Modell)
      response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            { role: 'system', content: "Du bist ein hilfreicher Assistent. Beantworte die Frage direkt und präzise. Halte deine Antwort kurz und strukturiert." },
            { role: 'user', content: query }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('API-Fehler (GPT-4.1-mini):', errorData)
        return NextResponse.json(
          { error: `Fehler bei der Anfrage an die Chat API: ${response.status}` },
          { status: response.status }
        )
      }
      
      data = await response.json()
      return NextResponse.json({
        response: data.choices[0].message.content,
        model: mode
      })
    }
    
  } catch (error) {
    console.error('Server-Fehler:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}