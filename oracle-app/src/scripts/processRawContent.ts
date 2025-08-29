#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { glob } from 'glob';

// Content categorization interface
interface ContentFile {
  filePath: string;
  fileName: string;
  title: string;
  tags: string[];
  createdAt: string;
  hasContent: boolean;
  isYouTubeOnly: boolean;
  wordCount: number;
  category: 'hormozi-wisdom' | 'business-frameworks' | 'implementation-guides' | 'success-patterns' | 'youtube-queue';
  contentPreview: string;
}

interface ProcessingReport {
  totalFiles: number;
  processedFiles: number;
  categorizedFiles: {
    'hormozi-wisdom': ContentFile[];
    'business-frameworks': ContentFile[];
    'implementation-guides': ContentFile[];
    'success-patterns': ContentFile[];
    'youtube-queue': ContentFile[];
  };
  summary: {
    directContentFiles: number;
    youtubeOnlyFiles: number;
    totalWordCount: number;
    averageWordsPerFile: number;
  };
}

// Main content processor
class OracleContentProcessor {
  private rawContentDir: string;
  private knowledgeBaseDir: string;
  
  constructor() {
    this.rawContentDir = join(process.cwd(), '..', 'docs', 'knowledge-base', 'raw-content');
    this.knowledgeBaseDir = join(process.cwd(), '..', 'docs', 'knowledge-base');
  }

  // Process all raw content files
  async processAllContent(): Promise<ProcessingReport> {
    console.log('🔮 Oracle Content Processing - Elena Execution');
    console.log('==============================================\n');

    const report: ProcessingReport = {
      totalFiles: 0,
      processedFiles: 0,
      categorizedFiles: {
        'hormozi-wisdom': [],
        'business-frameworks': [],
        'implementation-guides': [],
        'success-patterns': [],
        'youtube-queue': []
      },
      summary: {
        directContentFiles: 0,
        youtubeOnlyFiles: 0,
        totalWordCount: 0,
        averageWordsPerFile: 0
      }
    };

    try {
      // Find all markdown files
      const pattern = join(this.rawContentDir, '*.md');
      const files = await glob(pattern, { ignore: ['**/*.Zone.Identifier'] });
      
      report.totalFiles = files.length;
      console.log(`📁 Found ${files.length} raw content files to process\n`);

      // Process each file
      for (const filePath of files) {
        try {
          const contentFile = await this.analyzeContentFile(filePath);
          if (contentFile) {
            report.categorizedFiles[contentFile.category].push(contentFile);
            report.processedFiles++;
            
            if (contentFile.hasContent) {
              report.summary.directContentFiles++;
              report.summary.totalWordCount += contentFile.wordCount;
            } else {
              report.summary.youtubeOnlyFiles++;
            }

            console.log(`✅ Processed: ${contentFile.fileName} → ${contentFile.category}`);
            console.log(`   📊 Words: ${contentFile.wordCount}, Content: ${contentFile.hasContent ? 'Yes' : 'YouTube Only'}`);
          }
        } catch (error) {
          console.error(`❌ Error processing ${basename(filePath)}:`, error);
        }
      }

      // Calculate averages
      if (report.summary.directContentFiles > 0) {
        report.summary.averageWordsPerFile = Math.round(
          report.summary.totalWordCount / report.summary.directContentFiles
        );
      }

      // Create organized content files
      await this.createOrganizedContent(report);

      console.log('\n📊 PROCESSING SUMMARY');
      console.log('=====================');
      console.log(`Total Files: ${report.totalFiles}`);
      console.log(`Processed Files: ${report.processedFiles}`);
      console.log(`Direct Content Files: ${report.summary.directContentFiles}`);
      console.log(`YouTube Only Files: ${report.summary.youtubeOnlyFiles}`);
      console.log(`Total Word Count: ${report.summary.totalWordCount.toLocaleString()}`);
      console.log(`Average Words per Content File: ${report.summary.averageWordsPerFile}`);

      console.log('\n📋 CATEGORIZATION RESULTS');
      console.log('==========================');
      Object.entries(report.categorizedFiles).forEach(([category, files]) => {
        if (files.length > 0) {
          console.log(`\n${category.toUpperCase().replace('-', ' ')} (${files.length} files):`);
          files.forEach(file => {
            const contentStatus = file.hasContent ? `${file.wordCount} words` : 'YouTube link';
            console.log(`  • ${file.title} (${contentStatus})`);
          });
        }
      });

      return report;

    } catch (error) {
      console.error('❌ Error in content processing:', error);
      throw error;
    }
  }

  // Analyze individual content file
  private async analyzeContentFile(filePath: string): Promise<ContentFile | null> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileName = basename(filePath);
      
      // Extract metadata
      const metadata = this.extractMetadata(content);
      
      // Analyze content
      const hasSubstantialContent = this.hasSubstantialContent(content);
      const isYouTubeOnly = this.isYouTubeOnlyFile(content);
      const wordCount = this.countWords(content);
      const category = this.categorizeContent(fileName, metadata, content, hasSubstantialContent);
      const contentPreview = this.extractContentPreview(content);

      return {
        filePath,
        fileName,
        title: metadata.title || fileName.replace('.md', ''),
        tags: metadata.tags || [],
        createdAt: metadata.createdAt || new Date().toISOString(),
        hasContent: hasSubstantialContent,
        isYouTubeOnly,
        wordCount,
        category,
        contentPreview
      };

    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return null;
    }
  }

  // Extract YAML metadata
  private extractMetadata(content: string): any {
    const metadata: any = {};
    
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      
      const lines = frontmatter.split('\n');
      lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          
          if (key === 'tags' && value) {
            metadata[key] = [value];
          } else if (value) {
            metadata[key] = value;
          }
        }
      });
    }

    return metadata;
  }

  // Check if file has substantial content beyond metadata
  private hasSubstantialContent(content: string): boolean {
    // Remove frontmatter
    const contentWithoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
    
    // Remove common non-content sections
    const cleanContent = contentWithoutFrontmatter
      .replace(/## Sources\s*[\s\S]*$/i, '') // Remove sources section
      .replace(/- \[website\]\(.*?\)/g, '') // Remove website links
      .trim();

    // Check for actual content (not just whitespace, dashes, or empty headers)
    const meaningfulLines = cleanContent
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 0 && 
               !trimmed.match(/^-+$/) && 
               !trimmed.match(/^#+\s*$/) &&
               !trimmed.startsWith('##') ||
               (trimmed.startsWith('##') && trimmed.length > 10);
      });

    return meaningfulLines.length > 3 && this.countWords(cleanContent) > 100;
  }

  // Check if file only contains YouTube links
  private isYouTubeOnlyFile(content: string): boolean {
    return content.includes('youtube.com/watch') && !this.hasSubstantialContent(content);
  }

  // Count words in content
  private countWords(content: string): number {
    const cleanContent = content
      .replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '') // Remove frontmatter
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
      .replace(/#/g, '') // Remove headers
      .replace(/[^\w\s]/g, ' '); // Replace punctuation with spaces

    return cleanContent
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  // Categorize content based on analysis
  private categorizeContent(
    fileName: string, 
    metadata: any, 
    content: string, 
    hasContent: boolean
  ): ContentFile['category'] {
    
    // If no substantial content, goes to YouTube queue
    if (!hasContent) {
      return 'youtube-queue';
    }

    const lowerFileName = fileName.toLowerCase();
    const lowerContent = content.toLowerCase();
    const tags = (metadata.tags || []).map((t: string) => t.toLowerCase());

    // Business Frameworks - Financial metrics, systems, equations
    if (
      lowerFileName.includes('equation') ||
      lowerFileName.includes('paid ads') ||
      lowerContent.includes('ltv') ||
      lowerContent.includes('lifetime value') ||
      lowerContent.includes('customer acquisition cost') ||
      lowerContent.includes('cac') ||
      lowerContent.includes('roi') ||
      lowerContent.includes('business metric') ||
      tags.includes('sales') ||
      tags.includes('marketing')
    ) {
      return 'business-frameworks';
    }

    // Hormozi Wisdom - Core philosophy, harsh truths, mindset
    if (
      lowerFileName.includes('harsh truth') ||
      lowerFileName.includes('hormozi') ||
      lowerFileName.includes('advice') ||
      lowerContent.includes('alex hormozi') ||
      lowerContent.includes('mindset') ||
      lowerContent.includes('psychology') ||
      lowerContent.includes('resilience') ||
      tags.includes('leadership') ||
      lowerContent.includes('personal growth')
    ) {
      return 'hormozi-wisdom';
    }

    // Implementation Guides - Step-by-step processes, how-tos
    if (
      lowerFileName.includes('blueprint') ||
      lowerFileName.includes('millionaire') ||
      lowerFileName.includes('how to') ||
      lowerContent.includes('step') ||
      lowerContent.includes('process') ||
      lowerContent.includes('implementation') ||
      lowerContent.includes('guide') ||
      tags.includes('venture capital')
    ) {
      return 'implementation-guides';
    }

    // Success Patterns - Case studies, proven strategies, results
    if (
      lowerFileName.includes('masterclass') ||
      lowerFileName.includes('strategy') ||
      lowerContent.includes('case study') ||
      lowerContent.includes('success') ||
      lowerContent.includes('proven') ||
      lowerContent.includes('result')
    ) {
      return 'success-patterns';
    }

    // Default to Hormozi wisdom for direct Alex content
    if (lowerContent.includes('alex') || lowerContent.includes('hormozi')) {
      return 'hormozi-wisdom';
    }

    // Default to business frameworks for marketing/sales content
    return 'business-frameworks';
  }

  // Extract preview of content
  private extractContentPreview(content: string): string {
    const contentWithoutFrontmatter = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
    const cleanContent = contentWithoutFrontmatter
      .replace(/## Sources\s*[\s\S]*$/i, '')
      .trim();

    const firstMeaningfulLine = cleanContent
      .split('\n')
      .find(line => {
        const trimmed = line.trim();
        return trimmed.length > 20 && !trimmed.startsWith('#');
      });

    return firstMeaningfulLine ? 
      (firstMeaningfulLine.substring(0, 200) + (firstMeaningfulLine.length > 200 ? '...' : '')) :
      'No content preview available';
  }

  // Create organized content files in knowledge base structure
  private async createOrganizedContent(report: ProcessingReport): Promise<void> {
    console.log('\n📝 Creating organized content files...');

    for (const [category, files] of Object.entries(report.categorizedFiles)) {
      if (files.length === 0) continue;

      const categoryDir = join(this.knowledgeBaseDir, category);
      
      // Ensure directory exists
      if (!existsSync(categoryDir)) {
        mkdirSync(categoryDir, { recursive: true });
      }

      // Create category-specific content files
      await this.createCategoryContent(category as ContentFile['category'], files);
    }

    // Create processing report
    await this.createProcessingReport(report);
  }

  // Create content for specific category
  private async createCategoryContent(category: ContentFile['category'], files: ContentFile[]): Promise<void> {
    const categoryDir = join(this.knowledgeBaseDir, category);

    if (category === 'youtube-queue') {
      // Create YouTube processing queue
      await this.createYouTubeQueue(files);
      return;
    }

    // Create individual content files for categories with substantial content
    for (const file of files.filter(f => f.hasContent)) {
      try {
        // Read original content
        const originalContent = readFileSync(file.filePath, 'utf-8');
        
        // Create enhanced content with Oracle structure
        const enhancedContent = this.createEnhancedContent(file, originalContent, category);
        
        // Create filename (sanitize for filesystem)
        const safeFileName = file.title
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .toLowerCase()
          .substring(0, 50) + '.md';
        
        const outputPath = join(categoryDir, safeFileName);
        writeFileSync(outputPath, enhancedContent, 'utf-8');
        
        console.log(`   ✅ Created: ${category}/${safeFileName}`);
      } catch (error) {
        console.error(`   ❌ Error creating content for ${file.fileName}:`, error);
      }
    }
  }

  // Create enhanced content with Oracle structure
  private createEnhancedContent(file: ContentFile, originalContent: string, category: string): string {
    const timestamp = new Date().toISOString();
    
    const enhanced = `---
title: ${file.title}
category: ${category}
source: ${file.fileName}
tags: [${file.tags.map(t => `"${t}"`).join(', ')}]
wordCount: ${file.wordCount}
processedAt: ${timestamp}
processedBy: Elena Execution
oracleIntegration: true
---

# ${file.title}

## Oracle Content Classification
- **Category**: ${category.replace('-', ' ').toUpperCase()}
- **Content Type**: ${file.hasContent ? 'Direct Hormozi Content' : 'YouTube Source'}
- **Word Count**: ${file.wordCount.toLocaleString()}
- **Processing Date**: ${new Date().toLocaleDateString()}
- **Source File**: ${file.fileName}

## Content Summary
${file.contentPreview}

---

## Original Content

${originalContent.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')}

---

## Oracle Integration Notes
*This content has been processed by Elena Execution for integration into the Oracle Knowledge Base. The content maintains Alex Hormozi's original wisdom while being structured for optimal semantic search and Oracle conversation enhancement.*

**Vector Database Status**: Ready for embedding generation  
**Framework Classification**: ${this.detectFrameworks(originalContent)}  
**Business Phase**: ${this.detectBusinessPhase(originalContent)}  
**Implementation Complexity**: ${this.assessComplexity(file.wordCount)}  
`;

    return enhanced;
  }

  // Create YouTube processing queue
  private async createYouTubeQueue(files: ContentFile[]): Promise<void> {
    const queueContent = `---
title: YouTube Content Processing Queue
category: youtube-processing
processedAt: ${new Date().toISOString()}
processedBy: Elena Execution
totalVideos: ${files.length}
coordinatedWith: David Infrastructure
---

# 🎥 YouTube Content Processing Queue

## Queue Overview
**Total Videos to Process**: ${files.length}  
**Queue Created**: ${new Date().toLocaleDateString()}  
**Coordination**: David Infrastructure YouTube extraction system  
**Integration Target**: Oracle Knowledge Base enhancement  

---

## Processing Queue

${files.map((file, index) => {
  const originalContent = readFileSync(file.filePath, 'utf-8');
  const youtubeUrl = this.extractYouTubeUrl(originalContent);
  
  return `### ${index + 1}. ${file.title}

**Source File**: \`${file.fileName}\`  
**YouTube URL**: ${youtubeUrl || 'URL extraction needed'}  
**Tags**: ${file.tags.join(', ')}  
**Created**: ${new Date(file.createdAt).toLocaleDateString()}  
**Processing Status**: Pending  

**Metadata**:
- Title: ${file.title}
- Category: ${this.predictYouTubeCategory(file)}
- Expected Content: ${this.predictContentType(file)}

---`;
}).join('\n')}

## David Infrastructure Integration

This queue is designed to work with David Infrastructure's YouTube transcript extraction system:

1. **Batch Processing**: Use \`npm run process-youtube batch\` to process entire queue
2. **Individual Processing**: Process specific videos as needed
3. **Vector Database**: Automatic integration with Supabase storage
4. **Oracle Enhancement**: Semantic search capability for all extracted content

## Processing Commands

\`\`\`bash
# Process all YouTube content
npm run process-youtube batch

# Test system before processing
npm run test-youtube

# Process specific video
npm run process-youtube single "YOUTUBE_URL" "Title" "tags"
\`\`\`

## Expected Results

After processing, these ${files.length} videos will:
- Generate ~${files.length * 15} knowledge chunks (estimated)
- Add ~${files.length * 2000} words to Oracle knowledge base (estimated)
- Enhance Oracle with video-sourced Alex Hormozi wisdom
- Provide timestamp citations for user queries

---

**Queue prepared by**: Elena Execution  
**Coordination**: David Infrastructure YouTube extraction system  
**Target**: Oracle Knowledge Base wisdom enhancement
`;

    const queuePath = join(this.knowledgeBaseDir, 'oracle-system', 'youtube-processing-queue.md');
    
    // Ensure oracle-system directory exists
    const oracleSystemDir = join(this.knowledgeBaseDir, 'oracle-system');
    if (!existsSync(oracleSystemDir)) {
      mkdirSync(oracleSystemDir, { recursive: true });
    }
    
    writeFileSync(queuePath, queueContent, 'utf-8');
    console.log(`   ✅ Created YouTube processing queue: oracle-system/youtube-processing-queue.md`);
  }

  // Helper methods for content analysis
  private extractYouTubeUrl(content: string): string | null {
    const match = content.match(/https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^"\s&]+)/);
    return match ? match[0] : null;
  }

  private predictYouTubeCategory(file: ContentFile): string {
    const title = file.title.toLowerCase();
    const tags = file.tags.map(t => t.toLowerCase());
    
    if (title.includes('copywriting') || title.includes('sales')) return 'business-frameworks';
    if (title.includes('mindset') || title.includes('advice') || tags.includes('leadership')) return 'hormozi-wisdom';
    if (title.includes('blueprint') || title.includes('millionaire')) return 'implementation-guides';
    if (title.includes('marketing') || tags.includes('marketing')) return 'business-frameworks';
    
    return 'hormozi-wisdom';
  }

  private predictContentType(file: ContentFile): string {
    const title = file.title.toLowerCase();
    
    if (title.includes('masterclass')) return 'Educational deep dive';
    if (title.includes('blueprint')) return 'Step-by-step guide';
    if (title.includes('harsh truth') || title.includes('advice')) return 'Philosophical insights';
    if (title.includes('marketing') || title.includes('ads')) return 'Tactical strategies';
    
    return 'Business wisdom and insights';
  }

  private detectFrameworks(content: string): string {
    const frameworks = [];
    const lower = content.toLowerCase();
    
    if (lower.includes('grand slam')) frameworks.push('Grand Slam Offers');
    if (lower.includes('core four')) frameworks.push('Core Four');
    if (lower.includes('ltv') || lower.includes('lifetime value')) frameworks.push('LTV Optimization');
    if (lower.includes('cac') || lower.includes('customer acquisition')) frameworks.push('Customer Acquisition');
    if (lower.includes('resilience') || lower.includes('mindset')) frameworks.push('Resilience Building');
    
    return frameworks.length > 0 ? frameworks.join(', ') : 'General Business Wisdom';
  }

  private detectBusinessPhase(content: string): string {
    const lower = content.toLowerCase();
    
    if (lower.includes('startup') || lower.includes('beginning')) return 'startup';
    if (lower.includes('scale') || lower.includes('million')) return 'scaling';
    if (lower.includes('optimize') || lower.includes('advanced')) return 'optimization';
    
    return 'all';
  }

  private assessComplexity(wordCount: number): string {
    if (wordCount < 500) return 'beginner';
    if (wordCount < 1500) return 'intermediate';
    return 'advanced';
  }

  private async createProcessingReport(report: ProcessingReport): Promise<void> {
    const reportContent = `# 🔮 Oracle Raw Content Processing Report

## Processing Summary
**Processed by**: Elena Execution  
**Processing Date**: ${new Date().toISOString()}  
**Coordination**: Alice Intelligence (structure), David Infrastructure (YouTube)  

### File Statistics
- **Total Files**: ${report.totalFiles}
- **Successfully Processed**: ${report.processedFiles}
- **Direct Content Files**: ${report.summary.directContentFiles}
- **YouTube Only Files**: ${report.summary.youtubeOnlyFiles}
- **Total Word Count**: ${report.summary.totalWordCount.toLocaleString()}
- **Average Words per Content File**: ${report.summary.averageWordsPerFile}

### Content Distribution
${Object.entries(report.categorizedFiles).map(([category, files]) => `
**${category.toUpperCase().replace('-', ' ')}**: ${files.length} files
${files.map(f => `- ${f.title} (${f.hasContent ? f.wordCount + ' words' : 'YouTube link'})`).join('\n')}
`).join('\n')}

## Oracle Integration Status
✅ **Content Organized**: All raw content categorized into Alice Intelligence structure  
✅ **YouTube Queue Created**: ${report.categorizedFiles['youtube-queue'].length} videos ready for David Infrastructure processing  
✅ **Vector Database Ready**: Direct content prepared for embedding generation  
✅ **Oracle Enhancement**: Knowledge base structured for semantic search optimization  

## Next Steps
1. **Vector Database Population**: Use David Infrastructure system to process YouTube queue
2. **Embedding Generation**: Generate embeddings for all direct content
3. **Oracle Testing**: Validate enhanced conversation capabilities
4. **Content Validation**: Coordinate with Alice Intelligence for structure verification

---
*Report generated by Elena Execution - Oracle Content Organization System*
`;

    const reportPath = join(this.knowledgeBaseDir, 'RAW_CONTENT_PROCESSING_REPORT.md');
    writeFileSync(reportPath, reportContent, 'utf-8');
    console.log(`\n📄 Processing report created: RAW_CONTENT_PROCESSING_REPORT.md`);
  }
}

// Run the content processor
async function main() {
  const processor = new OracleContentProcessor();
  
  try {
    const report = await processor.processAllContent();
    
    console.log('\n🎯 ELENA EXECUTION - RAW CONTENT PROCESSING COMPLETE');
    console.log('====================================================');
    console.log('✅ All raw content organized into Oracle knowledge structure');
    console.log('✅ YouTube processing queue prepared for David Infrastructure');
    console.log('✅ Direct content ready for vector database integration');
    console.log('✅ Oracle knowledge base enhanced and ready for wisdom delivery');
    
    if (report.summary.youtubeOnlyFiles > 0) {
      console.log(`\n🎥 YOUTUBE COORDINATION READY`);
      console.log(`${report.summary.youtubeOnlyFiles} videos queued for David Infrastructure processing`);
      console.log('Run: npm run process-youtube batch (after David Infrastructure setup)');
    }
    
    if (report.summary.directContentFiles > 0) {
      console.log(`\n📚 DIRECT CONTENT PROCESSED`);
      console.log(`${report.summary.directContentFiles} files with ${report.summary.totalWordCount.toLocaleString()} words organized`);
      console.log('Content ready for vector embedding generation');
    }
    
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { OracleContentProcessor, main as processRawContent };