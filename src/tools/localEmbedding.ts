import { getLlama, resolveModelFile } from 'node-llama-cpp';
import { fileURLToPath } from 'url';
import path from 'path';

let llamaInstance: any = null;
let embeddingModel: any = null;
let embeddingContext: any = null;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.join(__dirname, '../../../../models'); // Go up to project root, then models

export async function initializeLocalEmbedding() {
  if (embeddingContext) {
    return embeddingContext;
  }

  console.log('🤖 Initializing local embedding model...');
  
  try {
    // Initialize Llama
    if (!llamaInstance) {
      llamaInstance = await getLlama();
      console.log('✅ Llama initialized');
    }

    // Use a smaller, simpler embedding model that's reliable
    // This model is specifically designed for embeddings and is smaller (~74MB)
    const modelUri = "hf:BAAI/bge-small-en-v1.5-gguf:bge-small-en-v1.5.q8_0.gguf";
    
    console.log('📥 Resolving/downloading embedding model (this may take time on first run)...');
    console.log('   Model:', modelUri);
    console.log('   Target directory:', modelsDir);
    
    // Resolve/download the model
    const modelPath = await resolveModelFile(modelUri, modelsDir);
    console.log('✅ Model resolved to:', modelPath);
    
    // Load the embedding model
    if (!embeddingModel) {
      console.log('🔄 Loading model into memory...');
      embeddingModel = await llamaInstance.loadModel({
        modelPath: modelPath
      });
      console.log('✅ Embedding model loaded');
    }

    // Create embedding context
    if (!embeddingContext) {
      console.log('🔄 Creating embedding context...');
      embeddingContext = await embeddingModel.createEmbeddingContext();
      console.log('✅ Embedding context created');
    }

    return embeddingContext;
    
  } catch (error) {
    console.error('❌ Failed to initialize local embedding model:', error);
    throw error;
  }
}

export async function generateLocalEmbedding(text: string): Promise<number[]> {
  const context = await initializeLocalEmbedding();
  
  try {
    const embedding = await context.getEmbeddingFor(text);
    const vector = embedding.vector;
    
    // BGE-small outputs 384-dimensional embeddings, but we need 1536
    // We'll pad with zeros to match OpenAI's dimension
    if (vector.length < 1536) {
      const paddedVector = new Array(1536).fill(0);
      for (let i = 0; i < vector.length; i++) {
        paddedVector[i] = vector[i];
      }
      return paddedVector;
    }
    
    // If somehow longer, truncate
    return vector.slice(0, 1536);
    
  } catch (error) {
    console.error('❌ Failed to generate embedding:', error);
    throw error;
  }
}

// Cleanup function
export async function cleanupLocalEmbedding() {
  if (embeddingContext) {
    await embeddingContext.dispose();
    embeddingContext = null;
  }
  if (embeddingModel) {
    await embeddingModel.dispose();
    embeddingModel = null;
  }
}