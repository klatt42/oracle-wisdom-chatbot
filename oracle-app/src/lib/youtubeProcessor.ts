import { glob } from 'glob';
import { join, basename } from 'path';
import { 
  extractYouTubeUrls, 
  extractVideoId, 
  extractTranscript, 
  processTranscriptToVector, 
  extractMarkdownMetadata,
  saveTranscriptToFile,
  type ProcessingResult
} from './youtubeTranscriptExtractor';
import { getProcessingMonitor } from './youtubeMonitor';

// Interface for batch processing results
export interface BatchProcessingResult {
  totalFiles: number;
  processedFiles: number;
  successfulExtractions: number;
  failedExtractions: number;
  totalChunksProcessed: number;
  results: ProcessingResult[];
  errors: string[];
  summary: {
    topicDistribution: Record<string, number>;
    frameworkDistribution: Record<string, number>;
    processingTime: number;
  };
}

// Main YouTube content processor
export class YouTubeContentProcessor {
  private outputDir: string;
  private knowledgeBaseDir: string;
  
  constructor(knowledgeBaseDir: string, outputDir: string = 'temp/transcripts') {
    this.knowledgeBaseDir = knowledgeBaseDir;
    this.outputDir = outputDir;
  }

  // Process all markdown files in knowledge base for YouTube content
  async processAllYouTubeContent(): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    console.log('🚀 Starting YouTube content processing...');

    // Initialize monitoring
    const monitor = getProcessingMonitor(this.outputDir);
    const runId = monitor.startBatchRun();

    const result: BatchProcessingResult = {
      totalFiles: 0,
      processedFiles: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      totalChunksProcessed: 0,
      results: [],
      errors: [],
      summary: {
        topicDistribution: {},
        frameworkDistribution: {},
        processingTime: 0
      }
    };

    try {
      // Find all markdown files in raw-content directory
      const pattern = join(this.knowledgeBaseDir, 'raw-content', '*.md');
      const files = await glob(pattern, { ignore: ['**/*.Zone.Identifier'] });
      
      result.totalFiles = files.length;
      console.log(`📁 Found ${files.length} markdown files to process`);

      // Process each file
      for (const filePath of files) {
        try {
          const fileName = basename(filePath);
          console.log(`\n📄 Processing file: ${fileName}`);
          
          const fileResult = await this.processFile(filePath);
          if (fileResult) {
            result.results.push(fileResult);
            result.processedFiles++;
            
            if (fileResult.success) {
              result.successfulExtractions++;
              result.totalChunksProcessed += fileResult.chunksProcessed;
            } else {
              result.failedExtractions++;
              if (fileResult.error) {
                result.errors.push(`${fileName}: ${fileResult.error}`);
              }
            }
          }
        } catch (error) {
          const fileName = basename(filePath);
          const errorMsg = `Error processing ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(`❌ ${errorMsg}`);
          result.errors.push(errorMsg);
          result.failedExtractions++;
        }
      }

      // Calculate processing time and generate summary
      result.summary.processingTime = Date.now() - startTime;
      this.generateProcessingSummary(result);

      // Complete monitoring
      monitor.completeBatchRun(runId, result);

      console.log(`\n✅ YouTube content processing complete!`);
      this.printBatchResults(result);

      return result;

    } catch (error) {
      console.error('❌ Error in batch processing:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown batch processing error');
      return result;
    }
  }

  // Process individual markdown file
  async processFile(filePath: string): Promise<ProcessingResult | null> {
    try {
      console.log(`🔍 Analyzing file: ${basename(filePath)}`);
      
      // Extract YouTube URLs from file
      const urls = extractYouTubeUrls(filePath);
      if (urls.length === 0) {
        console.log(`ℹ️  No YouTube URLs found in ${basename(filePath)}`);
        return null;
      }

      // Extract metadata from markdown
      const metadata = extractMarkdownMetadata(filePath);
      console.log(`📋 Extracted metadata:`, { 
        title: metadata.title, 
        tags: metadata.tags 
      });

      // Process first YouTube URL (assuming one per file)
      const firstUrl = urls[0];
      const videoId = extractVideoId(firstUrl);
      
      if (!videoId) {
        console.error(`❌ Invalid YouTube URL: ${firstUrl}`);
        return {
          success: false,
          videoId: 'unknown',
          chunksProcessed: 0,
          error: 'Invalid YouTube URL',
          filePath
        };
      }

      console.log(`🎥 Processing video: ${videoId}`);

      // Extract transcript
      const extractedContent = await extractTranscript(videoId);
      if (!extractedContent) {
        return {
          success: false,
          videoId,
          chunksProcessed: 0,
          error: 'Failed to extract transcript',
          filePath
        };
      }

      // Enrich with metadata
      if (metadata.title) {
        extractedContent.title = metadata.title;
      }

      // Save transcript for backup
      try {
        await this.ensureOutputDirectory();
        saveTranscriptToFile(extractedContent, this.outputDir);
      } catch (saveError) {
        console.warn(`⚠️  Could not save transcript file: ${saveError}`);
      }

      // Process transcript to vector database
      const result = await processTranscriptToVector(
        extractedContent, 
        filePath, 
        metadata
      );

      console.log(`${result.success ? '✅' : '❌'} Processing result: ${result.chunksProcessed} chunks processed`);
      return result;

    } catch (error) {
      console.error(`❌ Error processing file ${filePath}:`, error);
      return {
        success: false,
        videoId: 'error',
        chunksProcessed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        filePath
      };
    }
  }

  // Process specific YouTube URL directly
  async processYouTubeUrl(
    url: string, 
    title?: string, 
    tags?: string[]
  ): Promise<ProcessingResult> {
    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        return {
          success: false,
          videoId: 'invalid',
          chunksProcessed: 0,
          error: 'Invalid YouTube URL'
        };
      }

      console.log(`🎥 Direct processing of video: ${videoId}`);

      // Extract transcript
      const extractedContent = await extractTranscript(videoId);
      if (!extractedContent) {
        return {
          success: false,
          videoId,
          chunksProcessed: 0,
          error: 'Failed to extract transcript'
        };
      }

      // Enrich with provided metadata
      if (title) extractedContent.title = title;

      // Save transcript
      try {
        await this.ensureOutputDirectory();
        saveTranscriptToFile(extractedContent, this.outputDir);
      } catch (saveError) {
        console.warn(`⚠️  Could not save transcript: ${saveError}`);
      }

      // Process to vector database
      const metadata = {
        title: title || extractedContent.title,
        tags: tags || []
      };

      return await processTranscriptToVector(
        extractedContent, 
        url, 
        metadata
      );

    } catch (error) {
      console.error(`❌ Error processing YouTube URL ${url}:`, error);
      return {
        success: false,
        videoId: extractVideoId(url) || 'error',
        chunksProcessed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Generate processing summary statistics
  private generateProcessingSummary(result: BatchProcessingResult): void {
    // Topic distribution
    const topics: Record<string, number> = {};
    const frameworks: Record<string, number> = {};

    result.results.forEach(r => {
      // This would be enhanced with actual topic/framework data from processing
      // For now, we'll use file-based estimation
      if (r.filePath) {
        const fileName = basename(r.filePath).toLowerCase();
        
        // Topic estimation from filename
        if (fileName.includes('copywriting')) {
          topics['copywriting'] = (topics['copywriting'] || 0) + 1;
        } else if (fileName.includes('marketing') || fileName.includes('ads')) {
          topics['marketing'] = (topics['marketing'] || 0) + 1;
        } else if (fileName.includes('mindset') || fileName.includes('psychology')) {
          topics['psychology'] = (topics['psychology'] || 0) + 1;
        } else if (fileName.includes('money') || fileName.includes('millionaire')) {
          topics['wealth_building'] = (topics['wealth_building'] || 0) + 1;
        } else {
          topics['general_business'] = (topics['general_business'] || 0) + 1;
        }

        // Framework estimation
        if (fileName.includes('harsh truths')) {
          frameworks['resilience_building'] = (frameworks['resilience_building'] || 0) + 1;
        } else if (fileName.includes('copywriting')) {
          frameworks['sales_optimization'] = (frameworks['sales_optimization'] || 0) + 1;
        } else if (fileName.includes('social media')) {
          frameworks['content_strategy'] = (frameworks['content_strategy'] || 0) + 1;
        } else {
          frameworks['general_framework'] = (frameworks['general_framework'] || 0) + 1;
        }
      }
    });

    result.summary.topicDistribution = topics;
    result.summary.frameworkDistribution = frameworks;
  }

  // Print batch processing results
  private printBatchResults(result: BatchProcessingResult): void {
    console.log('\n📊 YOUTUBE PROCESSING RESULTS');
    console.log('================================');
    console.log(`📁 Total Files: ${result.totalFiles}`);
    console.log(`✅ Processed Files: ${result.processedFiles}`);
    console.log(`🎥 Successful Extractions: ${result.successfulExtractions}`);
    console.log(`❌ Failed Extractions: ${result.failedExtractions}`);
    console.log(`🧩 Total Chunks Processed: ${result.totalChunksProcessed}`);
    console.log(`⏱️  Processing Time: ${(result.summary.processingTime / 1000).toFixed(2)}s`);
    
    if (Object.keys(result.summary.topicDistribution).length > 0) {
      console.log('\n📋 Topic Distribution:');
      Object.entries(result.summary.topicDistribution)
        .forEach(([topic, count]) => {
          console.log(`  ${topic}: ${count}`);
        });
    }

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors Encountered:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
  }

  // Ensure output directory exists
  private async ensureOutputDirectory(): Promise<void> {
    try {
      const { existsSync, mkdirSync } = await import('fs');
      if (!existsSync(this.outputDir)) {
        mkdirSync(this.outputDir, { recursive: true });
      }
    } catch (error) {
      console.warn(`Could not create output directory: ${error}`);
    }
  }

  // Get processing statistics
  getProcessingStats(): { 
    outputDir: string; 
    knowledgeBaseDir: string; 
  } {
    return {
      outputDir: this.outputDir,
      knowledgeBaseDir: this.knowledgeBaseDir
    };
  }
}

// Convenience function for batch processing
export async function processOracleYouTubeContent(
  knowledgeBaseDir: string = 'docs/knowledge-base',
  outputDir: string = 'temp/transcripts'
): Promise<BatchProcessingResult> {
  const processor = new YouTubeContentProcessor(knowledgeBaseDir, outputDir);
  return await processor.processAllYouTubeContent();
}

// Convenience function for single URL processing
export async function processSingleYouTubeUrl(
  url: string,
  title?: string,
  tags?: string[]
): Promise<ProcessingResult> {
  const processor = new YouTubeContentProcessor('docs/knowledge-base');
  return await processor.processYouTubeUrl(url, title, tags);
}