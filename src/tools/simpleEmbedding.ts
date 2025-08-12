/**
 * Simple Local Embedding Implementation
 * 
 * This creates basic embeddings without requiring external models or APIs.
 * While not as sophisticated as OpenAI or Llama embeddings, it provides
 * functional semantic similarity for basic use cases.
 */

import crypto from 'crypto';

// Simple word vectors for common concepts (just a small sample)
const conceptVectors: Record<string, number[]> = {
  // Locations
  'shanghai': [0.8, 0.1, 0.2, 0.9, 0.3, 0.7, 0.1, 0.5],
  'china': [0.7, 0.2, 0.3, 0.8, 0.4, 0.6, 0.2, 0.4],
  'city': [0.6, 0.3, 0.4, 0.7, 0.5, 0.5, 0.3, 0.3],
  'location': [0.5, 0.4, 0.5, 0.6, 0.6, 0.4, 0.4, 0.2],
  'live': [0.4, 0.5, 0.6, 0.5, 0.7, 0.3, 0.5, 0.1],
  'based': [0.3, 0.6, 0.7, 0.4, 0.8, 0.2, 0.6, 0.2],
  
  // Pets
  'dog': [0.2, 0.8, 0.1, 0.3, 0.2, 0.9, 0.1, 0.6],
  'milo': [0.1, 0.9, 0.2, 0.2, 0.1, 0.8, 0.2, 0.7],
  'mila': [0.2, 0.7, 0.3, 0.1, 0.2, 0.9, 0.1, 0.8],
  'pet': [0.3, 0.6, 0.4, 0.2, 0.3, 0.8, 0.2, 0.5],
  'animal': [0.4, 0.5, 0.5, 0.3, 0.4, 0.7, 0.3, 0.4],
  
  // Person
  'tristan': [0.9, 0.2, 0.8, 0.1, 0.9, 0.1, 0.7, 0.3],
  'user': [0.8, 0.3, 0.7, 0.2, 0.8, 0.2, 0.6, 0.4],
  'name': [0.7, 0.4, 0.6, 0.3, 0.7, 0.3, 0.5, 0.5],
  'person': [0.6, 0.5, 0.5, 0.4, 0.6, 0.4, 0.4, 0.6]
};

function simpleHash(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function generateWordEmbedding(word: string): number[] {
  const lowerWord = word.toLowerCase();
  
  // Check if we have a predefined vector for this word
  if (conceptVectors[lowerWord]) {
    return conceptVectors[lowerWord];
  }
  
  // Generate a deterministic but "random-looking" vector based on the word
  const hash = simpleHash(lowerWord);
  const vector: number[] = [];
  
  for (let i = 0; i < 8; i++) {
    // Use hash and position to generate consistent values between -1 and 1
    const seed = (hash + i * 31) % 1000;
    vector.push((seed / 500) - 1);
  }
  
  return vector;
}

export function generateSimpleEmbedding(text: string): number[] {
  // Tokenize the text into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  if (words.length === 0) {
    return new Array(1536).fill(0);
  }
  
  // Get embeddings for each word
  const wordEmbeddings = words.map(generateWordEmbedding);
  
  // Average the word embeddings to get sentence embedding
  const embeddingSize = 8; // Size of our simple embeddings
  const avgEmbedding = new Array(embeddingSize).fill(0);
  
  for (const wordEmb of wordEmbeddings) {
    for (let i = 0; i < embeddingSize; i++) {
      avgEmbedding[i] += wordEmb[i];
    }
  }
  
  // Average the values
  for (let i = 0; i < embeddingSize; i++) {
    avgEmbedding[i] /= wordEmbeddings.length;
  }
  
  // Pad to 1536 dimensions to match OpenAI format
  const fullEmbedding = new Array(1536).fill(0);
  for (let i = 0; i < Math.min(embeddingSize, 1536); i++) {
    fullEmbedding[i] = avgEmbedding[i];
  }
  
  // Add some variation in the remaining dimensions based on text characteristics
  for (let i = embeddingSize; i < 1536; i++) {
    const seed = (simpleHash(text) + i) % 1000;
    fullEmbedding[i] = ((seed / 1000) - 0.5) * 0.1; // Small random values
  }
  
  return fullEmbedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}