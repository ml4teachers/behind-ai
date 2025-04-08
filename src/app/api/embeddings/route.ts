import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate embeddings using OpenAI's text-embedding-3-small model
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Generate embedding using OpenAI's embedding model
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float"
    });

    // Extract the embedding vector from the response
    const embedding = embeddingResponse.data[0].embedding;
    
    console.log(`Generated embedding for "${text}" with dimension ${embedding.length}`);

    return NextResponse.json({ embedding });
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate embedding',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}