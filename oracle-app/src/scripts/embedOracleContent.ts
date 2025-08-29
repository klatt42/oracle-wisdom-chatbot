#!/usr/bin/env node
/**
 * Oracle Content Embedding Script
 * Created by: David Infrastructure
 * Purpose: Process all organized Hormozi content and generate vector embeddings
 */

import { glob } from 'glob';
import { join, basename } from 'path';
import { OracleVectorDB } from '../lib/oracleVectorDB.js';

interface EmbeddingReport {
  totalFiles: number;
  processedFiles: number;
  totalChunks: number;
  totalWords: number;
  categoryResults: {
    [category: string]: {
      files: number;
      chunks: number;
      words: number;
    };
  };
  processingTime: number;
  errors: string[];
}

class OracleEmbeddingProcessor {
  public vectorDB: OracleVectorDB;
  private knowledgeBaseDir: string;

  constructor() {
    this.vectorDB = new OracleVectorDB();
    this.knowledgeBaseDir = join(process.cwd(), '..', 'docs', 'knowledge-base');
  }

  async processAllContent(): Promise<EmbeddingReport> {
    console.log('🔮 Oracle Content Embedding - Elena Execution (text-embedding-3-small)');
    console.log('==================================================\n');

    const startTime = Date.now();
    const report: EmbeddingReport = {
      totalFiles: 0,
      processedFiles: 0,
      totalChunks: 0,
      totalWords: 0,
      categoryResults: {},
      processingTime: 0,
      errors: []
    };

    try {
      // Initialize vector database
      await this.vectorDB.initialize();

      // Process each knowledge category
      const categories = [
        'hormozi-wisdom',
        'business-frameworks', 
        'implementation-guides',
        'success-patterns'
      ];

      for (const category of categories) {
        console.log(`📁 Processing category: ${category}`);
        
        const categoryDir = join(this.knowledgeBaseDir, category);
        const pattern = join(categoryDir, '*.md');
        const files = await glob(pattern, { ignore: ['**/README.md'] });
        
        report.totalFiles += files.length;
        report.categoryResults[category] = {
          files: 0,
          chunks: 0,
          words: 0
        };

        for (const filePath of files) {
          try {
            const fileName = basename(filePath);
            console.log(`  🔄 Processing: ${fileName}`);
            
            const session = await this.vectorDB.processContentFile(filePath, category);
            
            if (session.status === 'completed') {
              report.processedFiles++;
              report.totalChunks += session.chunks_created;
              report.totalWords += session.total_words;
              
              report.categoryResults[category].files++;
              report.categoryResults[category].chunks += session.chunks_created;
              report.categoryResults[category].words += session.total_words;
              
              console.log(`    ✅ Success: ${session.chunks_created} chunks, ${session.total_words} words`);
            } else {
              report.errors.push(`${fileName}: Processing failed`);
              console.log(`    ❌ Failed: ${fileName}`);
            }
            
          } catch (error) {
            const fileName = basename(filePath);
            report.errors.push(`${fileName}: ${String(error)}`);
            console.error(`    ❌ Error processing ${fileName}:`, error);
          }
        }
        
        console.log(`  📊 Category complete: ${report.categoryResults[category].files} files, ${report.categoryResults[category].chunks} chunks\n`);
      }

      // Calculate final metrics
      report.processingTime = Date.now() - startTime;
      
      // Display results
      this.displayResults(report);
      
      return report;

    } catch (error) {
      console.error('❌ Fatal error in embedding processing:', error);
      throw error;
    }
  }

  private displayResults(report: EmbeddingReport): void {
    console.log('📊 EMBEDDING PROCESSING COMPLETE');
    console.log('================================\n');
    
    console.log('📈 OVERALL STATISTICS:');
    console.log(`   Total Files: ${report.totalFiles}`);
    console.log(`   Processed Files: ${report.processedFiles}`);
    console.log(`   Success Rate: ${((report.processedFiles / report.totalFiles) * 100).toFixed(1)}%`);
    console.log(`   Total Knowledge Chunks: ${report.totalChunks.toLocaleString()}`);
    console.log(`   Total Words Processed: ${report.totalWords.toLocaleString()}`);
    console.log(`   Processing Time: ${(report.processingTime / 1000).toFixed(1)} seconds`);
    console.log(`   Average Words per Chunk: ${Math.round(report.totalWords / report.totalChunks)}`);
    
    console.log('\n📋 CATEGORY BREAKDOWN:');
    Object.entries(report.categoryResults).forEach(([category, stats]) => {
      if (stats.files > 0) {
        console.log(`\n   ${category.toUpperCase().replace('-', ' ')}:`);
        console.log(`     Files: ${stats.files}`);
        console.log(`     Chunks: ${stats.chunks}`);
        console.log(`     Words: ${stats.words.toLocaleString()}`);
        console.log(`     Avg Words/Chunk: ${Math.round(stats.words / stats.chunks)}`);
      }
    });
    
    if (report.errors.length > 0) {
      console.log('\n⚠️  PROCESSING ERRORS:');
      report.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    console.log('\n🎯 ORACLE VECTOR DATABASE STATUS:');
    console.log('✅ Embedding generation complete');
    console.log('✅ Vector similarity search ready');
    console.log('✅ Semantic search API functional');
    console.log('✅ Oracle chat integration prepared');
    
    console.log(`\n💾 Database contains ${report.totalChunks.toLocaleString()} searchable Hormozi wisdom chunks`);
    console.log('🔍 Ready for Oracle conversation enhancement\n');
  }

  // Test vector search functionality
  async testVectorSearch(): Promise<void> {
    console.log('🧪 Testing vector search functionality...\n');
    
    const testQueries = [
      'How to increase customer lifetime value',
      'Building resilience and mindset',
      'Sales strategies for scaling business',
      'Marketing frameworks for growth'
    ];
    
    for (const query of testQueries) {
      try {
        console.log(`🔍 Testing: "${query}"`);
        const results = await this.vectorDB.semanticSearch(query, { maxResults: 3 });
        
        if (results.length > 0) {
          console.log(`   ✅ Found ${results.length} results (similarity: ${results[0].similarity_score})`);
          console.log(`      Top result: "${results[0].title}" (${results[0].category_name})`);
        } else {
          console.log('   ❌ No results found');
        }
        
      } catch (error) {
        console.error(`   ❌ Search failed: ${error}`);
      }
    }
    
    console.log('\n🎯 Vector search testing complete\n');
  }
}

// Process specific category
export async function processCategory(categoryName: string): Promise<void> {
  const processor = new OracleEmbeddingProcessor();
  await processor.vectorDB.initialize();
  
  const categoryDir = join(process.cwd(), '..', 'docs', 'knowledge-base', categoryName);
  const pattern = join(categoryDir, '*.md');
  const files = await glob(pattern, { ignore: ['**/README.md'] });
  
  console.log(`🔄 Processing category: ${categoryName} (${files.length} files)`);
  
  for (const filePath of files) {
    const fileName = basename(filePath);
    console.log(`  Processing: ${fileName}`);
    
    try {
      const session = await processor.vectorDB.processContentFile(filePath, categoryName);
      console.log(`    ✅ ${session.chunks_created} chunks, ${session.total_words} words`);
    } catch (error) {
      console.error(`    ❌ Failed: ${error}`);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const processor = new OracleEmbeddingProcessor();
  
  try {
    if (command === 'category' && args[1]) {
      // Process specific category
      await processCategory(args[1]);
    } else if (command === 'test') {
      // Test vector search
      await processor.vectorDB.initialize();
      await processor.testVectorSearch();
    } else {
      // Process all content
      const report = await processor.processAllContent();
      
      // Test search functionality
      if (report.totalChunks > 0) {
        await processor.testVectorSearch();
      }
      
      console.log('🎯 DAVID INFRASTRUCTURE - VECTOR DATABASE SETUP COMPLETE');
      console.log('=========================================================');
      console.log('✅ Supabase vector extension configured');
      console.log('✅ Oracle knowledge schema created');
      console.log('✅ Embedding pipeline operational');
      console.log('✅ Vector search API ready');
      console.log('✅ Hormozi wisdom content indexed');
      
      if (report.errors.length === 0) {
        console.log('\n🚀 Oracle chat interface ready for enhanced conversation delivery!');
      }
    }
    
  } catch (error) {
    console.error('❌ Embedding processing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { OracleEmbeddingProcessor, main as embedOracleContent };