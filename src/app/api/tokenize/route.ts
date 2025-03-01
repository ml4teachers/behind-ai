import { NextResponse } from 'next/server';
import { encode, decode } from 'gpt-tokenizer';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text muss ein gültiger String sein' },
        { status: 400 }
      );
    }

    // Text in Tokens umwandeln
    const tokens = encode(text);
    
    // Token-IDs zurück in Text umwandeln (für die Visualisierung)
    const decodedTokens = tokens.map(id => ({
      id,
      token: decode([id])
    }));
    
    return NextResponse.json({
      tokens: decodedTokens,
      totalTokens: tokens.length
    });
  } catch (error) {
    console.error('Tokenisierungsfehler:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Tokenisierung' },
      { status: 500 }
    );
  }
}