/**
 * Oracle URL Content Processor
 * Elena Execution - Web content extraction service with intelligent business framework detection
 */

import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import fetch from 'node-fetch';
import { URL } from 'url';
import * as cheerio from 'cheerio';

// Types
import { 
  ContentItem, 
  ContentMetadata, 
  ProcessingResult,
  BusinessRelevanceScore,
  FrameworkReference,
  HormoziFramework,
  BusinessConcept,
  BusinessCategory
} from '../../types/content';

export interface WebScrapingOptions {
  extractImages?: boolean;
  followRedirects?: boolean;
  maxDepth?: number;
  respectRobots?: boolean;
  timeout?: number;
  userAgent?: string;
  headers?: Record<string, string>;
}

export interface ExtractedWebContent {
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedDate?: Date;
  modifiedDate?: Date;
  siteName?: string;
  url: string;
  canonicalUrl?: string;
  language?: string;
  wordCount: number;
  readingTime: number;
  images?: string[];
  links?: string[];
  metadata: Record<string, any>;
}

export interface CitationData {
  title: string;
  author?: string;
  siteName?: string;
  publishedDate?: Date;
  accessedDate: Date;
  url: string;
  excerpt: string;
}

export class OracleUrlProcessor {
  private readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; OracleBot/1.0; +https://oracle-wisdom.ai/bot)';
  private readonly DEFAULT_TIMEOUT = 30000;
  private readonly MAX_CONTENT_LENGTH = 1000000; // 1MB limit
  
  // Business framework keywords for detection
  private readonly FRAMEWORK_KEYWORDS: Record<HormoziFramework, string[]> = {
    'Grand Slam Offer': [
      'grand slam offer', 'irresistible offer', 'value proposition', 'offer stack',
      'guarantee', 'scarcity', 'urgency', 'bonuses', 'risk reversal'
    ],
    'Core Four': [
      'core four', 'lead magnet', 'landing page', 'nurture sequence', 'sales process',
      'lead generation', 'conversion funnel', 'email sequence'
    ],
    'Value Ladder': [
      'value ladder', 'product suite', 'upsell', 'cross-sell', 'customer journey',
      'ascension model', 'backend products', 'premium offers'
    ],
    'LTV/CAC': [
      'lifetime value', 'customer acquisition cost', 'ltv cac ratio', 'unit economics',
      'retention rate', 'churn rate', 'payback period'
    ],
    'Scaling Systems': [
      'scaling systems', 'automation', 'delegation', 'systems thinking', 'processes',
      'operational excellence', 'team building', 'workflow optimization'
    ],
    'Lead Generation': [
      'lead generation', 'traffic generation', 'lead magnets', 'content marketing',
      'paid advertising', 'organic reach', 'lead scoring'
    ],
    'Customer Acquisition': [
      'customer acquisition', 'acquisition channels', 'conversion optimization',
      'funnel optimization', 'sales process', 'closing techniques'
    ],
    'Business Operations': [
      'business operations', 'operational efficiency', 'process improvement',
      'team management', 'project management', 'resource allocation'
    ],
    'Revenue Optimization': [
      'revenue optimization', 'pricing strategy', 'profit margins', 'revenue streams',
      'monetization', 'financial modeling', 'growth hacking'
    ],
    'Team Building': [
      'team building', 'hiring', 'company culture', 'leadership development',
      'employee retention', 'performance management', 'organizational design'
    ]
  };

  private readonly BUSINESS_CATEGORIES: Record<BusinessCategory, string[]> = {
    'marketing': ['marketing', 'advertising', 'branding', 'promotion', 'campaign'],
    'sales': ['sales', 'selling', 'closing', 'negotiation', 'prospecting'],
    'operations': ['operations', 'processes', 'efficiency', 'automation', 'workflow'],
    'leadership': ['leadership', 'management', 'team', 'culture', 'vision'],
    'finance': ['finance', 'revenue', 'profit', 'cost', 'budget', 'roi'],
    'strategy': ['strategy', 'planning', 'growth', 'competitive', 'positioning'],
    'customer_experience': ['customer', 'experience', 'service', 'satisfaction', 'retention'],
    'product_development': ['product', 'development', 'innovation', 'features', 'roadmap'],
    'scaling': ['scaling', 'growth', 'expansion', 'scalability', 'systems'],
    'optimization': ['optimization', 'improvement', 'performance', 'analytics', 'testing']
  };

  constructor() {}

  /**
   * Process a URL and extract content for Oracle ingestion
   */
  async processUrl(
    url: string, 
    options: WebScrapingOptions = {}
  ): Promise<ContentItem> {
    try {
      const extractedContent = await this.extractWebContent(url, options);
      const contentItem = await this.createContentItem(extractedContent);
      
      return contentItem;
    } catch (error) {
      throw new Error(`Failed to process URL ${url}: ${error}`);
    }
  }

  /**
   * Extract and clean web content from URL
   */
  private async extractWebContent(
    url: string, 
    options: WebScrapingOptions
  ): Promise<ExtractedWebContent> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      userAgent = this.DEFAULT_USER_AGENT,
      headers = {},
      followRedirects = true,
      respectRobots = true
    } = options;

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }

    // Check robots.txt if requested
    if (respectRobots) {
      const canCrawl = await this.checkRobotsTxt(parsedUrl.origin, parsedUrl.pathname);
      if (!canCrawl) {
        throw new Error('URL blocked by robots.txt');
      }
    }

    // Fetch the webpage
    const response = await fetch(url, {
      timeout,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...headers
      },
      redirect: followRedirects ? 'follow' : 'manual'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error('URL does not return HTML content');
    }

    const html = await response.text();
    
    if (html.length > this.MAX_CONTENT_LENGTH) {
      throw new Error('Content exceeds maximum length limit');
    }

    return this.parseHtmlContent(html, url);
  }

  /**
   * Parse HTML content using Readability and Cheerio
   */
  private parseHtmlContent(html: string, url: string): ExtractedWebContent {
    const dom = new JSDOM(html, { url });
    const doc = dom.window.document;
    
    // Use Readability for main content extraction
    const reader = new Readability(doc);
    const article = reader.parse();
    
    if (!article) {
      throw new Error('Failed to extract readable content from page');
    }

    // Use Cheerio for additional metadata extraction
    const $ = cheerio.load(html);
    
    // Extract metadata
    const metadata = this.extractMetadata($);
    const title = article.title || metadata.title || $('title').text().trim();
    const author = metadata.author || this.extractAuthor($);
    const publishedDate = metadata.publishedDate ? new Date(metadata.publishedDate) : undefined;
    const modifiedDate = metadata.modifiedDate ? new Date(metadata.modifiedDate) : undefined;
    
    // Calculate reading time (average 200 words per minute)
    const wordCount = article.textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // Extract images and links if needed
    const images = this.extractImages($, url);
    const links = this.extractLinks($, url);
    
    return {
      title,
      content: article.textContent,
      excerpt: article.excerpt,
      author,
      publishedDate,
      modifiedDate,
      siteName: metadata.siteName,
      url,
      canonicalUrl: metadata.canonicalUrl || url,
      language: metadata.language || 'en',
      wordCount,
      readingTime,
      images,
      links,
      metadata: {
        ...metadata,
        byline: article.byline,
        dir: article.dir,
        siteName: article.siteName,
        publishedTime: article.publishedTime
      }
    };
  }

  /**
   * Extract metadata from HTML document
   */
  private extractMetadata($: cheerio.CheerioAPI): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Open Graph metadata
    $('meta[property^="og:"]').each((_, elem) => {
      const property = $(elem).attr('property')?.replace('og:', '');
      const content = $(elem).attr('content');
      if (property && content) {
        metadata[property] = content;
      }
    });

    // Twitter Card metadata
    $('meta[name^="twitter:"]').each((_, elem) => {
      const name = $(elem).attr('name')?.replace('twitter:', '');
      const content = $(elem).attr('content');
      if (name && content) {
        metadata[`twitter_${name}`] = content;
      }
    });

    // Standard metadata
    const metaTags = [
      'description', 'keywords', 'author', 'publisher', 'copyright',
      'robots', 'language', 'revisit-after', 'distribution'
    ];

    metaTags.forEach(tag => {
      const content = $(`meta[name="${tag}"]`).attr('content');
      if (content) {
        metadata[tag] = content;
      }
    });

    // Structured data (JSON-LD)
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const jsonLd = JSON.parse($(elem).html() || '{}');
        metadata.structuredData = { ...metadata.structuredData, ...jsonLd };
      } catch (e) {
        // Ignore invalid JSON-LD
      }
    });

    // Canonical URL
    metadata.canonicalUrl = $('link[rel="canonical"]').attr('href');

    return metadata;
  }

  /**
   * Extract author information
   */
  private extractAuthor($: cheerio.CheerioAPI): string | undefined {
    // Try various author selectors
    const authorSelectors = [
      '[rel="author"]',
      '.author',
      '.byline',
      '[itemprop="author"]',
      '.post-author',
      '.article-author'
    ];

    for (const selector of authorSelectors) {
      const author = $(selector).first().text().trim();
      if (author && author.length < 100) {
        return author;
      }
    }

    return undefined;
  }

  /**
   * Extract images from content
   */
  private extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const images: string[] = [];
    const seenUrls = new Set<string>();

    $('img').each((_, elem) => {
      const src = $(elem).attr('src');
      if (src) {
        try {
          const imageUrl = new URL(src, baseUrl).href;
          if (!seenUrls.has(imageUrl)) {
            images.push(imageUrl);
            seenUrls.add(imageUrl);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    return images.slice(0, 20); // Limit to 20 images
  }

  /**
   * Extract links from content
   */
  private extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];
    const seenUrls = new Set<string>();

    $('a[href]').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href && !href.startsWith('#')) {
        try {
          const linkUrl = new URL(href, baseUrl).href;
          if (!seenUrls.has(linkUrl)) {
            links.push(linkUrl);
            seenUrls.add(linkUrl);
          }
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    return links.slice(0, 50); // Limit to 50 links
  }

  /**
   * Check robots.txt compliance
   */
  private async checkRobotsTxt(origin: string, pathname: string): Promise<boolean> {
    try {
      const robotsUrl = `${origin}/robots.txt`;
      const response = await fetch(robotsUrl, { timeout: 5000 });
      
      if (!response.ok) {
        return true; // If robots.txt doesn't exist, allow crawling
      }

      const robotsTxt = await response.text();
      const lines = robotsTxt.split('\n').map(line => line.trim().toLowerCase());
      
      let userAgentSection = false;
      
      for (const line of lines) {
        if (line.startsWith('user-agent:')) {
          const userAgent = line.substring('user-agent:'.length).trim();
          userAgentSection = userAgent === '*' || userAgent.includes('oracle');
        } else if (userAgentSection && line.startsWith('disallow:')) {
          const disallowPath = line.substring('disallow:'.length).trim();
          if (disallowPath && pathname.startsWith(disallowPath)) {
            return false;
          }
        }
      }

      return true;
    } catch {
      return true; // If we can't check robots.txt, allow crawling
    }
  }

  /**
   * Create ContentItem from extracted web content
   */
  private async createContentItem(content: ExtractedWebContent): Promise<ContentItem> {
    const contentMetadata = await this.analyzeContent(content);
    const businessRelevance = this.calculateBusinessRelevance(content);
    
    const contentItem: ContentItem = {
      id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: content.title,
      type: 'url',
      source: content.url,
      uploadedAt: new Date(),
      status: 'processing',
      progress: 0,
      metadata: {
        ...contentMetadata,
        wordCount: content.wordCount,
        characterCount: content.content.length,
        language: content.language,
        author: content.author,
        createdDate: content.publishedDate,
        modifiedDate: content.modifiedDate,
        extractedText: content.content.substring(0, 1000), // Preview
        businessRelevance,
        siteName: content.siteName,
        canonicalUrl: content.canonicalUrl,
        readingTime: content.readingTime,
        images: content.images?.length || 0,
        links: content.links?.length || 0,
        webMetadata: content.metadata
      }
    };

    return contentItem;
  }

  /**
   * Analyze content for framework detection and quality assessment
   */
  private async analyzeContent(content: ExtractedWebContent): Promise<ContentMetadata> {
    const text = content.content.toLowerCase();
    const frameworks = this.detectFrameworks(text);
    const businessConcepts = this.extractBusinessConcepts(text);
    const quality = this.assessContentQuality(content);
    
    return {
      wordCount: content.wordCount,
      characterCount: content.content.length,
      quality,
      language: content.language || 'en',
      author: content.author,
      createdDate: content.publishedDate,
      modifiedDate: content.modifiedDate,
      extractedText: content.content,
      summary: content.excerpt || content.content.substring(0, 500),
      framework: frameworks.map(f => f.framework),
      keywords: this.extractKeywords(text),
      businessConcepts
    };
  }

  /**
   * Detect business frameworks in content
   */
  private detectFrameworks(text: string): FrameworkReference[] {
    const frameworks: FrameworkReference[] = [];

    Object.entries(this.FRAMEWORK_KEYWORDS).forEach(([framework, keywords]) => {
      const matches = keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      );

      if (matches.length > 0) {
        const confidence = Math.min(matches.length / keywords.length, 1);
        
        frameworks.push({
          framework: framework as HormoziFramework,
          confidence,
          context: this.extractFrameworkContext(text, matches[0]),
          explanation: `Detected through keywords: ${matches.join(', ')}`,
          relatedConcepts: matches
        });
      }
    });

    return frameworks.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract framework context from text
   */
  private extractFrameworkContext(text: string, keyword: string): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';

    const start = Math.max(0, index - 100);
    const end = Math.min(text.length, index + keyword.length + 100);
    
    return text.substring(start, end).trim();
  }

  /**
   * Extract business concepts from content
   */
  private extractBusinessConcepts(text: string): BusinessConcept[] {
    const concepts: BusinessConcept[] = [];

    Object.entries(this.BUSINESS_CATEGORIES).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = text.match(regex);
        
        if (matches && matches.length > 0) {
          const importance = Math.min(matches.length / 10, 1);
          const context = this.extractFrameworkContext(text, keyword);
          
          concepts.push({
            concept: keyword,
            category: category as BusinessCategory,
            importance,
            context,
            relatedFrameworks: this.getRelatedFrameworks(keyword)
          });
        }
      });
    });

    return concepts.sort((a, b) => b.importance - a.importance).slice(0, 20);
  }

  /**
   * Get related frameworks for a keyword
   */
  private getRelatedFrameworks(keyword: string): HormoziFramework[] {
    const related: HormoziFramework[] = [];

    Object.entries(this.FRAMEWORK_KEYWORDS).forEach(([framework, keywords]) => {
      if (keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
        related.push(framework as HormoziFramework);
      }
    });

    return related;
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - count word frequency
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'cannot', 'be', 'am', 'is', 'are', 'was', 'were',
      'been', 'being', 'get', 'got', 'go', 'went', 'come', 'came', 'see', 'saw', 'know',
      'knew', 'take', 'took', 'make', 'made', 'give', 'gave', 'find', 'found'
    ]);
    
    return stopWords.has(word.toLowerCase());
  }

  /**
   * Assess content quality based on various factors
   */
  private assessContentQuality(content: ExtractedWebContent): number {
    let score = 50; // Base score

    // Word count factor (optimal range: 800-2500 words)
    if (content.wordCount >= 800 && content.wordCount <= 2500) {
      score += 20;
    } else if (content.wordCount >= 500) {
      score += 10;
    } else if (content.wordCount < 200) {
      score -= 20;
    }

    // Author presence
    if (content.author) {
      score += 10;
    }

    // Publication date
    if (content.publishedDate) {
      const daysSincePublished = Math.floor(
        (Date.now() - content.publishedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSincePublished <= 365) {
        score += 10;
      } else if (daysSincePublished <= 1095) {
        score += 5;
      }
    }

    // Content structure (presence of headers, paragraphs)
    const hasStructure = content.content.includes('\n\n');
    if (hasStructure) {
      score += 10;
    }

    // Language detection (prefer English)
    if (content.language === 'en') {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate business relevance score
   */
  private calculateBusinessRelevance(content: ExtractedWebContent): BusinessRelevanceScore {
    const text = content.content.toLowerCase();
    
    // Calculate framework relevance
    const frameworkRelevance = {
      grandSlamOffer: this.calculateFrameworkScore(text, 'Grand Slam Offer'),
      coreFour: this.calculateFrameworkScore(text, 'Core Four'),
      valueLadder: this.calculateFrameworkScore(text, 'Value Ladder'),
      ltvCac: this.calculateFrameworkScore(text, 'LTV/CAC'),
      scalingSystems: this.calculateFrameworkScore(text, 'Scaling Systems')
    };

    // Calculate topic categories
    const topicCategories = {
      marketing: this.calculateCategoryScore(text, 'marketing'),
      sales: this.calculateCategoryScore(text, 'sales'),
      operations: this.calculateCategoryScore(text, 'operations'),
      leadership: this.calculateCategoryScore(text, 'leadership'),
      finance: this.calculateCategoryScore(text, 'finance'),
      strategy: this.calculateCategoryScore(text, 'strategy')
    };

    // Calculate overall score
    const frameworkAvg = Object.values(frameworkRelevance).reduce((a, b) => a + b, 0) / 5;
    const topicAvg = Object.values(topicCategories).reduce((a, b) => a + b, 0) / 6;
    const overallScore = (frameworkAvg + topicAvg) / 2;

    return {
      overallScore: Math.round(overallScore),
      frameworkRelevance,
      topicCategories
    };
  }

  /**
   * Calculate framework-specific relevance score
   */
  private calculateFrameworkScore(text: string, framework: HormoziFramework): number {
    const keywords = this.FRAMEWORK_KEYWORDS[framework] || [];
    const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    
    return Math.round((matches.length / keywords.length) * 100);
  }

  /**
   * Calculate category-specific relevance score
   */
  private calculateCategoryScore(text: string, category: BusinessCategory): number {
    const keywords = this.BUSINESS_CATEGORIES[category] || [];
    const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    
    return Math.round((matches.length / keywords.length) * 100);
  }

  /**
   * Generate citation for web source
   */
  generateCitation(content: ExtractedWebContent, style: 'apa' | 'mla' | 'chicago' = 'apa'): string {
    const citationData: CitationData = {
      title: content.title,
      author: content.author,
      siteName: content.siteName,
      publishedDate: content.publishedDate,
      accessedDate: new Date(),
      url: content.url,
      excerpt: content.excerpt || content.content.substring(0, 150) + '...'
    };

    return this.formatCitation(citationData, style);
  }

  /**
   * Format citation according to specified style
   */
  private formatCitation(data: CitationData, style: string): string {
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    switch (style) {
      case 'apa':
        return [
          data.author && `${data.author}.`,
          data.publishedDate && `(${data.publishedDate.getFullYear()}).`,
          `${data.title}.`,
          data.siteName && `${data.siteName}.`,
          `Retrieved ${formatDate(data.accessedDate)}, from ${data.url}`
        ].filter(Boolean).join(' ');

      case 'mla':
        return [
          data.author && `${data.author}.`,
          `"${data.title}."`,
          data.siteName && `${data.siteName},`,
          data.publishedDate && `${formatDate(data.publishedDate)},`,
          `${data.url}.`,
          `Accessed ${formatDate(data.accessedDate)}.`
        ].filter(Boolean).join(' ');

      case 'chicago':
        return [
          data.author && `${data.author}.`,
          `"${data.title}."`,
          data.siteName && `${data.siteName}.`,
          data.publishedDate && `${formatDate(data.publishedDate)}.`,
          `${data.url}`,
          `(accessed ${formatDate(data.accessedDate)}).`
        ].filter(Boolean).join(' ');

      default:
        return `${data.title} - ${data.url} (accessed ${formatDate(data.accessedDate)})`;
    }
  }
}