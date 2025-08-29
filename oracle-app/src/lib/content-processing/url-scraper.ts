/**
 * URL Scraping and Processing Service
 * Elena Execution - Oracle Content Processing Infrastructure
 */

import { supabaseAdmin } from '../supabase';
import * as cheerio from 'cheerio';
import { Readability } from 'mozilla-readability';
import { JSDOM } from 'jsdom';

export interface UrlScrapingOptions {
  extractImages?: boolean;
  followRedirects?: boolean;
  respectRobots?: boolean;
  timeout?: number;
  userAgent?: string;
  maxContentLength?: number;
}

export interface ScrapedContent {
  url: string;
  finalUrl: string;
  title: string;
  content: string;
  description?: string;
  author?: string;
  publishedDate?: Date;
  wordCount: number;
  quality: {
    score: number;
    readabilityScore: number;
    contentStructure: number;
    metadata: number;
  };
  metadata: {
    domain: string;
    httpStatus: number;
    contentType: string;
    keywords: string[];
    images: string[];
    links: string[];
    headings: { level: number; text: string }[];
  };
}

export interface RobotsPolicy {
  allowed: boolean;
  crawlDelay?: number;
  userAgent?: string;
}

export class UrlScraper {
  private defaultOptions: UrlScrapingOptions = {
    extractImages: false,
    followRedirects: true,
    respectRobots: true,
    timeout: 30000,
    userAgent: 'Oracle-Content-Processor/1.0 (+https://oracle-wisdom.com/bot)',
    maxContentLength: 10 * 1024 * 1024 // 10MB
  };

  constructor(private options: UrlScrapingOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  async scrapeUrl(url: string): Promise<ScrapedContent> {
    const startTime = Date.now();
    
    try {
      // Validate URL
      const urlObj = this.validateUrl(url);
      
      // Check robots.txt if required
      if (this.options.respectRobots) {
        const robotsPolicy = await this.checkRobotsTxt(urlObj.origin);
        if (!robotsPolicy.allowed) {
          throw new Error('URL blocked by robots.txt policy');
        }
      }

      // Perform HTTP request
      const response = await this.fetchWithTimeout(url);
      const html = await response.text();
      const finalUrl = response.url;

      // Parse HTML and extract content
      const $ = cheerio.load(html);
      const dom = new JSDOM(html, { url: finalUrl });
      
      // Use Mozilla Readability for content extraction
      const reader = new Readability(dom.window.document as any);
      const readabilityResult = (reader as any).parse();

      // Extract metadata
      const metadata = this.extractMetadata($ as any, finalUrl);
      const content = readabilityResult?.textContent || this.fallbackContentExtraction($ as any);
      const title = readabilityResult?.title || $('title').text() || metadata.domain;

      // Calculate quality scores
      const quality = this.calculateQualityScore(content, metadata, readabilityResult);

      const scrapedContent: ScrapedContent = {
        url,
        finalUrl,
        title: title.trim(),
        content: content.trim(),
        description: $('meta[name="description"]').attr('content') || 
                    $('meta[property="og:description"]').attr('content'),
        author: this.extractAuthor($ as any),
        publishedDate: this.extractPublishedDate($ as any),
        wordCount: this.countWords(content),
        quality,
        metadata: {
          ...metadata,
          httpStatus: response.status,
          contentType: response.headers.get('content-type') || 'text/html'
        }
      };

      console.log(`URL scraped successfully: ${url} (${Date.now() - startTime}ms)`);
      return scrapedContent;

    } catch (error) {
      console.error(`URL scraping failed for ${url}:`, error);
      throw new Error(`Failed to scrape URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateUrl(url: string): URL {
    try {
      const urlObj = new URL(url.trim());
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }

      // Check for suspicious domains
      const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        throw new Error('Local URLs are not permitted for security reasons');
      }

      return urlObj;
    } catch (error) {
      throw new Error(`Invalid URL format: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async checkRobotsTxt(origin: string): Promise<RobotsPolicy> {
    try {
      const robotsUrl = `${origin}/robots.txt`;
      const response = await fetch(robotsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': this.options.userAgent || this.defaultOptions.userAgent!
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout for robots.txt
      });

      if (!response.ok) {
        return { allowed: true }; // If robots.txt doesn't exist, allow scraping
      }

      const robotsText = await response.text();
      return this.parseRobotsTxt(robotsText, this.options.userAgent || this.defaultOptions.userAgent!);
    } catch (error) {
      console.warn(`Failed to check robots.txt for ${origin}:`, error instanceof Error ? error.message : String(error));
      return { allowed: true }; // Allow scraping if robots.txt check fails
    }
  }

  private parseRobotsTxt(robotsText: string, userAgent: string): RobotsPolicy {
    const lines = robotsText.split('\n').map(line => line.trim());
    let currentUserAgent = '';
    let allowed = true;
    let crawlDelay: number | undefined;

    for (const line of lines) {
      if (line.startsWith('User-agent:')) {
        currentUserAgent = line.substring(11).trim().toLowerCase();
      } else if (line.startsWith('Disallow:') && 
                 (currentUserAgent === '*' || currentUserAgent === userAgent.toLowerCase())) {
        const disallowPath = line.substring(9).trim();
        if (disallowPath === '/' || disallowPath === '') {
          allowed = false;
        }
      } else if (line.startsWith('Allow:') && 
                 (currentUserAgent === '*' || currentUserAgent === userAgent.toLowerCase())) {
        allowed = true;
      } else if (line.startsWith('Crawl-delay:') && 
                 (currentUserAgent === '*' || currentUserAgent === userAgent.toLowerCase())) {
        crawlDelay = parseInt(line.substring(12).trim());
      }
    }

    return { allowed, crawlDelay, userAgent };
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.options.userAgent || this.defaultOptions.userAgent!,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: controller.signal,
        redirect: this.options.followRedirects ? 'follow' : 'manual'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check content length
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > (this.options.maxContentLength || this.defaultOptions.maxContentLength!)) {
        throw new Error('Content too large to process');
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private extractMetadata($: cheerio.CheerioAPI, finalUrl: string) {
    const urlObj = new URL(finalUrl);
    
    return {
      domain: urlObj.hostname,
      keywords: this.extractKeywords($),
      images: this.extractImages($, finalUrl),
      links: this.extractLinks($),
      headings: this.extractHeadings($)
    };
  }

  private extractKeywords($: cheerio.CheerioAPI): string[] {
    const keywords: string[] = [];
    
    // Meta keywords
    const metaKeywords = $('meta[name="keywords"]').attr('content');
    if (metaKeywords) {
      keywords.push(...metaKeywords.split(',').map(k => k.trim()));
    }

    // Open Graph tags
    const ogKeywords = $('meta[property="og:keywords"]').attr('content');
    if (ogKeywords) {
      keywords.push(...ogKeywords.split(',').map(k => k.trim()));
    }

    // Extract from headings and strong emphasis
    $('h1, h2, h3, strong, b').each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 2 && text.length < 50) {
        keywords.push(text);
      }
    });

    return [...new Set(keywords)].slice(0, 20); // Deduplicate and limit
  }

  private extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const images: string[] = [];
    
    $('img[src]').each((_, element) => {
      const src = $(element).attr('src');
      if (src) {
        try {
          const imageUrl = new URL(src, baseUrl).href;
          images.push(imageUrl);
        } catch (error) {
          // Skip invalid image URLs
        }
      }
    });

    return images.slice(0, 10); // Limit to 10 images
  }

  private extractLinks($: cheerio.CheerioAPI): string[] {
    const links: string[] = [];
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && href.startsWith('http')) {
        links.push(href);
      }
    });

    return [...new Set(links)].slice(0, 50); // Deduplicate and limit
  }

  private extractHeadings($: cheerio.CheerioAPI): Array<{ level: number; text: string }> {
    const headings: Array<{ level: number; text: string }> = [];
    
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const $element = $(element);
      const tagName = $element.prop('tagName')?.toLowerCase() || 'h1';
      const level = parseInt(tagName.charAt(1));
      const text = $element.text().trim();
      
      if (text.length > 0) {
        headings.push({ level, text });
      }
    });

    return headings.slice(0, 20); // Limit to 20 headings
  }

  private fallbackContentExtraction($: cheerio.CheerioAPI): string {
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads').remove();
    
    // Try to extract from common content containers
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '.main-content',
      '#content',
      'main',
      '.article-body'
    ];

    for (const selector of contentSelectors) {
      const content = $(selector).text().trim();
      if (content.length > 200) {
        return content;
      }
    }

    // Fallback to body content
    return $('body').text().trim();
  }

  private extractAuthor($: cheerio.CheerioAPI): string | undefined {
    // Try various author meta tags
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="og:author"]',
      'meta[property="article:author"]',
      '.author',
      '.byline',
      '.post-author'
    ];

    for (const selector of authorSelectors) {
      const author = $(selector).attr('content') || $(selector).text();
      if (author && author.trim().length > 0) {
        return author.trim();
      }
    }

    return undefined;
  }

  private extractPublishedDate($: cheerio.CheerioAPI): Date | undefined {
    // Try various date meta tags
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[property="og:published_time"]',
      'meta[name="publish-date"]',
      'meta[name="date"]',
      'time[datetime]'
    ];

    for (const selector of dateSelectors) {
      const dateStr = $(selector).attr('content') || $(selector).attr('datetime');
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return undefined;
  }

  private calculateQualityScore(
    content: string, 
    metadata: any, 
    readabilityResult: any
  ): ScrapedContent['quality'] {
    const contentLength = content.length;
    const wordCount = this.countWords(content);
    
    // Content quality (0-100)
    let contentScore = 0;
    if (wordCount > 100) contentScore += 20;
    if (wordCount > 500) contentScore += 20;
    if (wordCount > 1000) contentScore += 20;
    if (contentLength > 1000 && wordCount / contentLength * 1000 > 4) contentScore += 20; // Good word density
    if (readabilityResult && readabilityResult.length > 200) contentScore += 20;

    // Readability score (0-100)
    let readabilityScore = 50; // Default
    if (readabilityResult) {
      // Estimate readability based on sentence and word structure
      const sentences = content.split(/[.!?]+/).length;
      const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0;
      
      if (avgWordsPerSentence > 10 && avgWordsPerSentence < 25) {
        readabilityScore = 80;
      } else if (avgWordsPerSentence > 5 && avgWordsPerSentence < 35) {
        readabilityScore = 65;
      }
    }

    // Structure quality (0-100)
    let structureScore = 0;
    if (metadata.headings.length > 0) structureScore += 25;
    if (metadata.headings.length > 3) structureScore += 25;
    if (metadata.images.length > 0) structureScore += 15;
    if (metadata.links.length > 5) structureScore += 15;
    if (contentLength > 500) structureScore += 20;

    // Metadata quality (0-100)
    let metadataScore = 0;
    if (metadata.keywords.length > 0) metadataScore += 20;
    if (metadata.keywords.length > 5) metadataScore += 20;
    if (content.includes('business') || content.includes('strategy') || content.includes('marketing')) metadataScore += 20;
    if (metadata.headings.some((h: any) => h.text.length > 10)) metadataScore += 20;
    if (metadata.domain.includes('edu') || metadata.domain.includes('gov')) metadataScore += 20;

    // Overall score (weighted average)
    const score = Math.round(
      contentScore * 0.4 +
      readabilityScore * 0.2 +
      structureScore * 0.2 +
      metadataScore * 0.2
    );

    return {
      score: Math.min(100, Math.max(0, score)),
      readabilityScore: Math.min(100, Math.max(0, readabilityScore)),
      contentStructure: Math.min(100, Math.max(0, structureScore)),
      metadata: Math.min(100, Math.max(0, metadataScore))
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // Static utility method for quick URL validation
  static validateUrlFormat(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url.trim());
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' };
      }

      // Check for suspicious domains (SSRF protection)
      const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        return { isValid: false, error: 'Local URLs are not permitted for security reasons' };
      }

      // Check for common non-web schemes
      const bannedSchemes = ['file:', 'ftp:', 'data:', 'javascript:'];
      if (bannedSchemes.includes(urlObj.protocol)) {
        return { isValid: false, error: 'URL scheme not supported' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: `Invalid URL format: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}

// Default scraper instance
export const urlScraper = new UrlScraper();