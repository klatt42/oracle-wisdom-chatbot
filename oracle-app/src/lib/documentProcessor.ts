import OpenAI from 'openai';
import { addHormoziWisdom } from './supabase';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize OpenAI for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    book?: string;
    chapter?: string;
    topic?: string;
    framework?: string;
    business_phase?: string;
    difficulty_level?: string;
    implementation_time?: string;
    success_metrics?: string[];
    related_concepts?: string[];
  };
}

// Generate embedding for text content
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.replace(/\n/g, ' '),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Chunk text content for optimal vector storage
export function chunkText(
  text: string, 
  maxChunkSize: number = 1000, 
  overlap: number = 200
): string[] {
  const sentences = text.split(/[.!?]\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      
      // Add overlap from previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5)); // Rough word estimate
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 50); // Filter very small chunks
}

// Process knowledge base markdown files
export async function processKnowledgeBaseFile(
  filePath: string,
  baseMetadata: Partial<DocumentChunk['metadata']>
): Promise<boolean> {
  try {
    console.log(`Processing knowledge base file: ${filePath}`);
    
    const content = readFileSync(filePath, 'utf-8');
    const chunks = chunkText(content);
    
    let processedCount = 0;
    
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      
      const success = await addHormoziWisdomWithEmbedding(
        chunk,
        filePath,
        {
          ...baseMetadata,
          source: filePath,
        } as DocumentChunk['metadata'],
        embedding
      );
      
      if (success) {
        processedCount++;
      }
      
      // Rate limiting for API calls
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Successfully processed ${processedCount}/${chunks.length} chunks from ${filePath}`);
    return processedCount > 0;
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Add wisdom with pre-generated embedding
async function addHormoziWisdomWithEmbedding(
  content: string,
  source: string,
  metadata: DocumentChunk['metadata'],
  embedding: number[]
): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import('./supabase');
    
    const { data, error } = await supabaseAdmin
      .from('hormozi_wisdom')
      .insert([
        {
          content,
          source: metadata.source || source,
          book: metadata.book,
          chapter: metadata.chapter,
          topic: metadata.topic,
          framework: metadata.framework,
          business_phase: metadata.business_phase,
          difficulty_level: metadata.difficulty_level,
          implementation_time: metadata.implementation_time,
          success_metrics: metadata.success_metrics,
          related_concepts: metadata.related_concepts,
          embedding: JSON.stringify(embedding), // Convert to JSON for storage
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error adding wisdom with embedding:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addHormoziWisdomWithEmbedding:', error);
    return false;
  }
}

// Process all knowledge base documents
export async function processAllKnowledgeBase(): Promise<void> {
  console.log('Starting Oracle knowledge base processing...');
  
  const knowledgeBaseFiles = [
    {
      path: 'docs/knowledge-base/hormozi-wisdom/README.md',
      metadata: {
        topic: 'hormozi_wisdom',
        business_phase: 'all',
        framework: 'core_principles'
      }
    },
    {
      path: 'docs/knowledge-base/business-frameworks/README.md',
      metadata: {
        topic: 'business_frameworks',
        business_phase: 'scaling',
        framework: 'systematic_building'
      }
    },
    {
      path: 'docs/knowledge-base/implementation-guides/README.md',
      metadata: {
        topic: 'implementation_guides',
        business_phase: 'all',
        framework: 'step_by_step'
      }
    },
    {
      path: 'docs/knowledge-base/success-patterns/README.md',
      metadata: {
        topic: 'success_patterns',
        business_phase: 'optimization',
        framework: 'proven_strategies'
      }
    },
    {
      path: 'docs/knowledge-base/oracle-system/README.md',
      metadata: {
        topic: 'oracle_system',
        business_phase: 'all',
        framework: 'ai_conversation'
      }
    }
  ];
  
  let successCount = 0;
  
  for (const file of knowledgeBaseFiles) {
    try {
      const fullPath = join(process.cwd(), file.path);
      const success = await processKnowledgeBaseFile(fullPath, file.metadata);
      if (success) successCount++;
    } catch (error) {
      console.error(`Failed to process ${file.path}:`, error);
    }
  }
  
  console.log(`Knowledge base processing complete: ${successCount}/${knowledgeBaseFiles.length} files processed successfully`);
}

// Utility function for processing raw Hormozi content
export function extractHormoziContent(rawContent: string): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Basic content structure detection
  const sections = rawContent.split(/#{1,3}\s+/); // Split on headers
  
  for (let i = 1; i < sections.length; i++) { // Skip first empty split
    const section = sections[i];
    const [title, ...contentParts] = section.split('\n');
    const content = contentParts.join('\n').trim();
    
    if (content.length > 100) { // Only process substantial content
      const textChunks = chunkText(content);
      
      for (const chunk of textChunks) {
        chunks.push({
          content: chunk,
          metadata: {
            source: 'raw_content_extraction',
            chapter: title?.trim(),
            topic: detectTopic(chunk),
            framework: detectFramework(chunk),
            business_phase: detectBusinessPhase(chunk),
          }
        });
      }
    }
  }
  
  return chunks;
}

// Content analysis helpers
function detectTopic(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('offer') || lowerContent.includes('value proposition')) {
    return 'offers';
  } else if (lowerContent.includes('lead') || lowerContent.includes('marketing')) {
    return 'leads';
  } else if (lowerContent.includes('scale') || lowerContent.includes('system')) {
    return 'scaling';
  } else if (lowerContent.includes('mindset') || lowerContent.includes('psychology')) {
    return 'mindset';
  }
  
  return 'general';
}

function detectFramework(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('grand slam')) {
    return 'grand_slam_offers';
  } else if (lowerContent.includes('core four')) {
    return 'core_four';
  } else if (lowerContent.includes('value equation')) {
    return 'value_equation';
  }
  
  return 'general_framework';
}

function detectBusinessPhase(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('startup') || lowerContent.includes('beginning')) {
    return 'startup';
  } else if (lowerContent.includes('scale') || lowerContent.includes('growth')) {
    return 'scaling';
  } else if (lowerContent.includes('optimize') || lowerContent.includes('mastery')) {
    return 'optimization';
  }
  
  return 'all';
}