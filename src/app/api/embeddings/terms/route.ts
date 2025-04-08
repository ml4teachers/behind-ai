import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// API-Endpunkt, der die Embeddings aus der JSON-Datei liest
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'embeddings.json');
    
    // Überprüfe, ob die Datei existiert
    if (!fs.existsSync(filePath)) {
      console.error(`Embeddings JSON file not found at path: ${filePath}`);
      return NextResponse.json(
        { error: 'Embeddings file not found' },
        { status: 404 }
      );
    }
    
    // Lese die JSON-Datei
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let rawData;
    
    try {
      rawData = JSON.parse(fileContent);
      // Debug: Ausgabe der Struktur des geladenen JSON
      console.log('JSON structure keys:', Object.keys(rawData));
      console.log('JSON file structure type:', typeof rawData, Array.isArray(rawData) ? 'array' : 'object');
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON format', details: String(jsonError) },
        { status: 500 }
      );
    }
    
    // Verschiedene mögliche Formate erkennen und verarbeiten
    let terms = [];
    let embeddings = [];
    
    // Format 1: {terms: [...], embeddings: [...]}
    if (rawData.terms && Array.isArray(rawData.terms) && 
        rawData.embeddings && Array.isArray(rawData.embeddings)) {
      terms = rawData.terms;
      embeddings = rawData.embeddings;
    } 
    // Format 2: [{term: "...", embedding: [...]}, ...]
    else if (Array.isArray(rawData) && rawData.length > 0) {
      // Überprüfe, ob das erste Element die erwartete Struktur hat
      if (rawData[0] && typeof rawData[0] === 'object' && 
          rawData[0].term !== undefined && rawData[0].embedding !== undefined) {
        console.log('Detected Format 2: Array of objects with term and embedding properties');
        console.log('First item term:', rawData[0].term);
        console.log('First item embedding length:', rawData[0].embedding.length);
        
        terms = rawData.map(item => item.term);
        embeddings = rawData.map(item => item.embedding);
      } else {
        console.error('JSON is an array but doesn\'t match expected format. First item:', JSON.stringify(rawData[0]).substring(0, 100));
      }
    }
    // Format 3: {"term1": [...], "term2": [...], ...}
    else if (typeof rawData === 'object' && !Array.isArray(rawData) && Object.keys(rawData).length > 0) {
      // Check if values are arrays that could be embeddings
      const firstKey = Object.keys(rawData)[0];
      if (Array.isArray(rawData[firstKey]) && rawData[firstKey].every(item => typeof item === 'number')) {
        terms = Object.keys(rawData);
        embeddings = terms.map(term => rawData[term]);
      }
    }
    
    // Überprüfe, ob wir erfolgreich Daten extrahieren konnten
    if (terms.length === 0 || embeddings.length === 0) {
      console.error('Could not extract terms and embeddings from JSON. Structure:', JSON.stringify(rawData).substring(0, 200) + '...');
      return NextResponse.json(
        { error: 'Invalid data format', details: 'Could not extract terms and embeddings' },
        { status: 500 }
      );
    }
    
    if (terms.length !== embeddings.length) {
      console.error(`Mismatch between terms (${terms.length}) and embeddings (${embeddings.length})`);
      return NextResponse.json(
        { error: 'Data mismatch in embeddings file' },
        { status: 500 }
      );
    }
    
    console.log(`Successfully loaded ${terms.length} terms with embedding dimension ${embeddings[0]?.length || 0}`);
    
    return NextResponse.json({
      terms,
      embeddings
    });
  } catch (error) {
    console.error('Error in embeddings API route:', error);
    
    // Detaillierte Fehlermeldung
    return NextResponse.json(
      { 
        error: 'Failed to retrieve embedding terms', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}