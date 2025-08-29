#!/usr/bin/env node
import { join } from 'path';
import { processOracleYouTubeContent, processSingleYouTubeUrl } from '../lib/youtubeProcessor';

// Configuration
const KNOWLEDGE_BASE_DIR = join(process.cwd(), '..', 'docs', 'knowledge-base');
const OUTPUT_DIR = join(process.cwd(), 'temp', 'transcripts');

async function main() {
  console.log('🔮 Oracle YouTube Content Processing System');
  console.log('==========================================\n');

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'batch':
        await runBatchProcessing();
        break;
        
      case 'single':
        const url = args[1];
        const title = args[2];
        const tags = args[3]?.split(',') || [];
        
        if (!url) {
          console.error('❌ Please provide a YouTube URL for single processing');
          console.log('Usage: npm run process-youtube single <url> [title] [tags]');
          process.exit(1);
        }
        
        await runSingleProcessing(url, title, tags);
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  }
}

async function runBatchProcessing() {
  console.log('🚀 Starting batch processing of Oracle knowledge base...');
  console.log(`📁 Knowledge Base Directory: ${KNOWLEDGE_BASE_DIR}`);
  console.log(`💾 Output Directory: ${OUTPUT_DIR}\n`);

  const result = await processOracleYouTubeContent(KNOWLEDGE_BASE_DIR, OUTPUT_DIR);
  
  console.log('\n🎯 BATCH PROCESSING SUMMARY');
  console.log('============================');
  
  if (result.successfulExtractions > 0) {
    console.log(`✅ Successfully processed ${result.successfulExtractions} videos`);
    console.log(`🧩 Generated ${result.totalChunksProcessed} knowledge chunks`);
    console.log(`⏱️  Total processing time: ${(result.summary.processingTime / 1000).toFixed(2)}s`);
    
    if (Object.keys(result.summary.topicDistribution).length > 0) {
      console.log('\n📊 Content Distribution:');
      Object.entries(result.summary.topicDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([topic, count]) => {
          console.log(`  📋 ${topic}: ${count} video${count !== 1 ? 's' : ''}`);
        });
    }
  }
  
  if (result.failedExtractions > 0) {
    console.log(`\n⚠️  ${result.failedExtractions} video${result.failedExtractions !== 1 ? 's' : ''} failed to process`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
  }
  
  if (result.successfulExtractions === 0) {
    console.log('ℹ️  No YouTube content was processed. This could mean:');
    console.log('  - No YouTube URLs found in markdown files');
    console.log('  - All videos lack available transcripts');
    console.log('  - Network connectivity issues');
  }
  
  console.log('\n🔮 Oracle wisdom enhancement status:');
  if (result.totalChunksProcessed > 0) {
    console.log(`  ✨ Oracle knowledge base expanded with ${result.totalChunksProcessed} new wisdom segments`);
    console.log('  🎯 Oracle can now provide insights from extracted YouTube content');
    console.log('  📈 Enhanced semantic search capabilities available');
  } else {
    console.log('  💤 No new content was added to Oracle knowledge base');
  }
}

async function runSingleProcessing(url: string, title?: string, tags: string[] = []) {
  console.log('🎥 Processing single YouTube video...');
  console.log(`🔗 URL: ${url}`);
  if (title) console.log(`📝 Title: ${title}`);
  if (tags.length > 0) console.log(`🏷️  Tags: ${tags.join(', ')}`);
  console.log('');
  
  const result = await processSingleYouTubeUrl(url, title, tags);
  
  console.log('\n🎯 SINGLE VIDEO PROCESSING RESULT');
  console.log('==================================');
  
  if (result.success) {
    console.log(`✅ Successfully processed video: ${result.videoId}`);
    console.log(`🧩 Generated ${result.chunksProcessed} knowledge chunks`);
    console.log('🔮 Oracle wisdom base updated with new content');
  } else {
    console.log(`❌ Failed to process video: ${result.videoId}`);
    if (result.error) {
      console.log(`💬 Error: ${result.error}`);
    }
    
    console.log('\n💡 Possible solutions:');
    console.log('  - Check if the video has available transcripts');
    console.log('  - Verify the YouTube URL is correct');
    console.log('  - Ensure network connectivity');
    console.log('  - Try again later (YouTube API rate limits)');
  }
}

function showHelp() {
  console.log('🔮 Oracle YouTube Content Processing System');
  console.log('==========================================\n');
  
  console.log('COMMANDS:');
  console.log('  batch                    Process all YouTube content in knowledge base');
  console.log('  single <url> [title] [tags]  Process a single YouTube video');
  console.log('  help                     Show this help message\n');
  
  console.log('EXAMPLES:');
  console.log('  npm run process-youtube batch');
  console.log('  npm run process-youtube single "https://youtube.com/watch?v=ABC123" "Video Title" "marketing,sales"');
  console.log('  npm run process-youtube help\n');
  
  console.log('REQUIREMENTS:');
  console.log('  - Environment variables: OPENAI_API_KEY, SUPABASE_* credentials');
  console.log('  - Internet connection for YouTube transcript extraction');
  console.log('  - Supabase vector database properly configured\n');
  
  console.log('OUTPUT:');
  console.log('  - Video transcripts saved to temp/transcripts/');
  console.log('  - Knowledge chunks stored in Supabase vector database');
  console.log('  - Oracle enhanced with searchable YouTube wisdom');
}

// Handle process events
process.on('SIGINT', () => {
  console.log('\n\n🛑 Processing interrupted by user');
  console.log('💾 Partial results may have been saved');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}

export { main as processYouTubeContentScript };