import { YoutubeTranscript } from 'youtube-transcript';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { generateEmbedding, chunkText } from './documentProcessor';

// Interface for transcript data
export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

export interface ExtractedVideoContent {
  videoId: string;
  title: string;
  url: string;
  transcript: string;
  segments: TranscriptSegment[];
  extractedAt: string;
  duration: number;
  wordCount: number;
}

// Interface for processing results
export interface ProcessingResult {
  success: boolean;
  videoId: string;
  chunksProcessed: number;
  error?: string;
  filePath?: string;
}

// Extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Extract YouTube transcript from video ID
export async function extractTranscript(videoId: string): Promise<ExtractedVideoContent | null> {
  try {
    console.log(`📹 Extracting transcript for video ID: ${videoId}`);
    
    // Get transcript segments
    const transcriptSegments = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcriptSegments || transcriptSegments.length === 0) {
      console.error(`❌ No transcript available for video: ${videoId}`);
      return null;
    }

    // Combine all text segments
    const fullTranscript = transcriptSegments
      .map(segment => segment.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Calculate duration and word count
    const totalDuration = transcriptSegments.reduce((sum, segment) => 
      sum + (segment.duration || 0), 0);
    const wordCount = fullTranscript.split(/\s+/).length;

    const extractedContent: ExtractedVideoContent = {
      videoId,
      title: `YouTube Video ${videoId}`, // Will be enriched later
      url: `https://www.youtube.com/watch?v=${videoId}`,
      transcript: fullTranscript,
      segments: transcriptSegments.map(segment => ({
        text: segment.text,
        duration: segment.duration || 0,
        offset: segment.offset || 0,
        lang: segment.lang
      })),
      extractedAt: new Date().toISOString(),
      duration: totalDuration,
      wordCount
    };

    console.log(`✅ Transcript extracted: ${wordCount} words, ${totalDuration}s duration`);
    return extractedContent;

  } catch (error) {
    console.error(`❌ Error extracting transcript for ${videoId}:`, error);
    return null;
  }
}

// Process markdown file to extract YouTube URLs
export function extractYouTubeUrls(filePath: string): string[] {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const urls: string[] = [];
    
    // Regex patterns for YouTube URLs
    const patterns = [
      /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"\s&]+)/g,
      /https?:\/\/youtu\.be\/([^"\s&]+)/g,
      /youtube\.com\/embed\/([^"\s&]+)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        urls.push(match[0]);
      }
    });

    return [...new Set(urls)]; // Remove duplicates
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Extract metadata from markdown file
export function extractMarkdownMetadata(filePath: string): {
  title?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
} {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const metadata: Record<string, string | string[]> = {};
    
    // Extract YAML frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      
      // Parse key-value pairs
      const lines = frontmatter.split('\n');
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          
          // Handle arrays (tags)
          if (key === 'tags' && value) {
            metadata[key] = [value];
          } else if (value) {
            metadata[key] = value;
          }
        }
      });
    }

    return metadata;
  } catch (error) {
    console.error(`Error extracting metadata from ${filePath}:`, error);
    return {};
  }
}

// Process transcript into chunks and generate embeddings
export async function processTranscriptToVector(
  extractedContent: ExtractedVideoContent,
  sourceFile: string,
  metadata: Record<string, unknown> = {}
): Promise<ProcessingResult> {
  try {
    console.log(`🔄 Processing transcript for vector storage: ${extractedContent.videoId}`);
    
    // Chunk the transcript
    const chunks = chunkText(extractedContent.transcript, 1000, 200);
    let processedChunks = 0;

    // Detect topic and framework from content
    const detectedTopic = detectTopicFromContent(extractedContent.transcript);
    const detectedFramework = detectFrameworkFromContent(extractedContent.transcript);
    const businessPhase = detectBusinessPhaseFromContent(extractedContent.transcript);

    for (const [index, chunk] of chunks.entries()) {
      try {
        // Generate embedding for chunk
        const embedding = await generateEmbedding(chunk);
        
        // Prepare metadata for database
        const chunkMetadata = {
          source: sourceFile,
          book: 'YouTube Video',
          chapter: `${metadata.title || extractedContent.title} - Part ${index + 1}`,
          topic: (metadata.tags as string[])?.[0] || detectedTopic,
          framework: detectedFramework,
          business_phase: businessPhase,
          difficulty_level: 'intermediate',
          implementation_time: estimateImplementationTime(chunk),
          success_metrics: extractSuccessMetrics(chunk),
          related_concepts: extractRelatedConcepts(chunk)
        };

        // Store in vector database
        const success = await addHormoziWisdomWithEmbedding(
          chunk,
          extractedContent.url,
          chunkMetadata,
          embedding
        );

        if (success) {
          processedChunks++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (chunkError) {
        console.error(`Error processing chunk ${index}:`, chunkError);
      }
    }

    console.log(`✅ Processed ${processedChunks}/${chunks.length} chunks for ${extractedContent.videoId}`);

    return {
      success: processedChunks > 0,
      videoId: extractedContent.videoId,
      chunksProcessed: processedChunks,
      filePath: sourceFile
    };

  } catch (error) {
    console.error(`❌ Error processing transcript to vector:`, error);
    return {
      success: false,
      videoId: extractedContent.videoId,
      chunksProcessed: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Enhanced content analysis functions
function detectTopicFromContent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('copywriting') || lowerContent.includes('sales copy')) {
    return 'copywriting';
  } else if (lowerContent.includes('paid ads') || lowerContent.includes('advertising')) {
    return 'advertising';
  } else if (lowerContent.includes('social media') || lowerContent.includes('content creation')) {
    return 'social_media';
  } else if (lowerContent.includes('seo') || lowerContent.includes('search engine')) {
    return 'seo';
  } else if (lowerContent.includes('mindset') || lowerContent.includes('psychology')) {
    return 'psychology';
  } else if (lowerContent.includes('business model') || lowerContent.includes('strategy')) {
    return 'business_strategy';
  } else if (lowerContent.includes('money') || lowerContent.includes('wealth') || lowerContent.includes('millionaire')) {
    return 'wealth_building';
  }
  
  return 'general_business';
}

function detectFrameworkFromContent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('grand slam offer') || lowerContent.includes('value equation')) {
    return 'grand_slam_offers';
  } else if (lowerContent.includes('core four') || lowerContent.includes('lead generation')) {
    return 'core_four';
  } else if (lowerContent.includes('ltv') || lowerContent.includes('lifetime value')) {
    return 'ltv_optimization';
  } else if (lowerContent.includes('70-20-10') || lowerContent.includes('ad creative')) {
    return 'ad_creative_optimization';
  } else if (lowerContent.includes('harsh truths') || lowerContent.includes('resilience')) {
    return 'resilience_building';
  }
  
  return 'general_framework';
}

function detectBusinessPhaseFromContent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('startup') || lowerContent.includes('beginning') || lowerContent.includes('first business')) {
    return 'startup';
  } else if (lowerContent.includes('scale') || lowerContent.includes('growth') || lowerContent.includes('million')) {
    return 'scaling';
  } else if (lowerContent.includes('optimize') || lowerContent.includes('mastery') || lowerContent.includes('advanced')) {
    return 'optimization';
  }
  
  return 'all';
}

function estimateImplementationTime(content: string): string {
  const wordCount = content.split(/\s+/).length;
  
  if (wordCount < 100) return '1-2 weeks';
  else if (wordCount < 300) return '2-4 weeks';
  else if (wordCount < 500) return '1-2 months';
  else return '2-3 months';
}

function extractSuccessMetrics(content: string): string[] {
  const metrics: string[] = [];
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('conversion') || lowerContent.includes('convert')) {
    metrics.push('conversion_rate_improvement');
  }
  if (lowerContent.includes('revenue') || lowerContent.includes('money') || lowerContent.includes('profit')) {
    metrics.push('revenue_growth');
  }
  if (lowerContent.includes('customers') || lowerContent.includes('leads')) {
    metrics.push('customer_acquisition');
  }
  if (lowerContent.includes('retention') || lowerContent.includes('lifetime')) {
    metrics.push('customer_retention');
  }
  
  return metrics.length > 0 ? metrics : ['business_improvement'];
}

function extractRelatedConcepts(content: string): string[] {
  const concepts: string[] = [];
  const lowerContent = content.toLowerCase();
  
  const conceptMap = {
    'sales': ['copywriting', 'offers', 'conversion'],
    'marketing': ['advertising', 'leads', 'traffic'],
    'psychology': ['mindset', 'beliefs', 'motivation'],
    'business': ['strategy', 'operations', 'systems'],
    'finance': ['revenue', 'profit', 'metrics']
  };

  Object.entries(conceptMap).forEach(([concept, keywords]) => {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      concepts.push(concept);
    }
  });
  
  return concepts.length > 0 ? concepts : ['business_wisdom'];
}

// Add embedding function for transcript processing
async function addHormoziWisdomWithEmbedding(
  content: string,
  source: string,
  metadata: Record<string, unknown>,
  embedding: number[]
): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import('./supabase');
    
    const { error } = await supabaseAdmin
      .from('hormozi_wisdom')
      .insert([
        {
          content,
          source,
          book: metadata.book,
          chapter: metadata.chapter,
          topic: metadata.topic,
          framework: metadata.framework,
          business_phase: metadata.business_phase,
          difficulty_level: metadata.difficulty_level,
          implementation_time: metadata.implementation_time,
          success_metrics: metadata.success_metrics,
          related_concepts: metadata.related_concepts,
          embedding: JSON.stringify(embedding),
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

// Save extracted transcript to file (for backup/reference)
export function saveTranscriptToFile(
  extractedContent: ExtractedVideoContent,
  outputDir: string
): string {
  try {
    const fileName = `${extractedContent.videoId}_transcript.json`;
    const filePath = join(outputDir, fileName);
    
    writeFileSync(filePath, JSON.stringify(extractedContent, null, 2), 'utf-8');
    console.log(`💾 Transcript saved to: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error(`Error saving transcript to file:`, error);
    throw error;
  }
}