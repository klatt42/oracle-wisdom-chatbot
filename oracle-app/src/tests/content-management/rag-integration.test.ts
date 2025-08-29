/**
 * Oracle RAG System Integration Testing Suite
 * Victoria Validator - Comprehensive RAG integration tests
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Test setup
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONFIG,
  TEST_USERS,
  FRAMEWORK_TEST_CASES,
  createTestContentItem,
  waitFor
} from './setup';

// System under test
import { UniversalContentProcessor } from '../../services/content/universalContentProcessor';
import { OracleEmbeddingService } from '../../services/content/embeddingService';
import { OracleStorageService } from '../../services/content/storageService';
import { OracleChunkingService } from '../../services/content/chunkingService';

// Mock dependencies
jest.mock('../../services/content/embeddingService');
jest.mock('../../services/content/storageService');
jest.mock('../../services/content/chunkingService');
jest.mock('openai');
jest.mock('pg');

describe('Oracle RAG System Integration', () => {
  let universalProcessor: UniversalContentProcessor;
  let embeddingService: jest.Mocked<OracleEmbeddingService>;
  let storageService: jest.Mocked<OracleStorageService>;
  let chunkingService: jest.Mocked<OracleChunkingService>;

  beforeEach(() => {
    // Setup mocked services
    embeddingService = {
      generateEmbeddings: jest.fn(),
      generateQueryEmbedding: jest.fn(),
      similaritySearch: jest.fn(),
      batchGenerateEmbeddings: jest.fn()
    } as any;

    storageService = {
      storeContent: jest.fn(),
      getContent: jest.fn(),
      searchContent: jest.fn(),
      updateContent: jest.fn(),
      deleteContent: jest.fn(),
      storeEmbeddings: jest.fn(),
      searchByEmbedding: jest.fn()
    } as any;

    chunkingService = {
      chunkContent: jest.fn(),
      rechunkContent: jest.fn(),
      optimizeChunks: jest.fn(),
      validateChunks: jest.fn()
    } as any;

    universalProcessor = new UniversalContentProcessor();
    
    jest.clearAllMocks();
  });

  describe('Content Processing Pipeline Integration', () => {
    test('should process content through complete RAG pipeline', async () => {
      const contentItem = createTestContentItem({
        metadata: {
          extractedText: FRAMEWORK_TEST_CASES[0].text
        }
      });

      // Mock chunking service response
      const mockChunks = [
        {
          id: 'chunk1',
          contentId: contentItem.id,
          chunkIndex: 0,
          text: FRAMEWORK_TEST_CASES[0].text.substring(0, 200),
          startPosition: 0,
          endPosition: 200,
          wordCount: 35,
          characterCount: 200,
          metadata: {
            section: 'introduction',
            quality: 0.85
          }
        },
        {
          id: 'chunk2', 
          contentId: contentItem.id,
          chunkIndex: 1,
          text: FRAMEWORK_TEST_CASES[0].text.substring(200),
          startPosition: 200,
          endPosition: FRAMEWORK_TEST_CASES[0].text.length,
          wordCount: 30,
          characterCount: FRAMEWORK_TEST_CASES[0].text.length - 200,
          metadata: {
            section: 'framework',
            quality: 0.9
          }
        }
      ];

      chunkingService.chunkContent.mockResolvedValue({
        chunks: mockChunks,
        statistics: {
          totalChunks: 2,
          averageChunkSize: 150,
          qualityScore: 0.875
        }
      });

      // Mock embedding service response
      const mockEmbeddings = mockChunks.map((chunk, index) => ({
        id: `embedding_${index}`,
        chunkId: chunk.id,
        vector: Array.from({ length: 1536 }, () => Math.random()),
        dimensions: 1536,
        model: 'text-embedding-ada-002',
        createdAt: new Date(),
        metadata: {
          tokens: chunk.wordCount,
          cost: 0.0001,
          processingTime: 500,
          quality: 0.9
        }
      }));

      embeddingService.generateEmbeddings.mockResolvedValue({
        embeddings: mockEmbeddings,
        totalTokens: 65,
        cost: 0.0002,
        processingTime: 1000
      });

      // Mock storage service
      storageService.storeContent.mockResolvedValue({
        success: true,
        contentId: contentItem.id,
        chunksStored: 2,
        embeddingsStored: 2
      });

      // Process content
      const result = await universalProcessor.processContent(contentItem);

      // Verify pipeline execution
      expect(chunkingService.chunkContent).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          contentId: contentItem.id
        })
      );

      expect(embeddingService.generateEmbeddings).toHaveBeenCalledWith(
        mockChunks,
        expect.any(Object)
      );

      expect(storageService.storeContent).toHaveBeenCalledWith(
        expect.objectContaining({ id: contentItem.id }),
        mockChunks,
        mockEmbeddings,
        expect.any(Object)
      );

      expect(result.success).toBe(true);
      expect(result.chunks).toEqual(mockChunks);
      expect(result.embeddings).toEqual(mockEmbeddings);
    });

    test('should handle pipeline failures gracefully', async () => {
      const contentItem = createTestContentItem();

      // Mock chunking failure
      chunkingService.chunkContent.mockRejectedValue(new Error('Chunking service unavailable'));

      try {
        await universalProcessor.processContent(contentItem);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Content processing failed');
      }

      // Verify that failure doesn't corrupt the system
      expect(chunkingService.chunkContent).toHaveBeenCalledTimes(1);
      expect(embeddingService.generateEmbeddings).not.toHaveBeenCalled();
      expect(storageService.storeContent).not.toHaveBeenCalled();
    });
  });

  describe('Embedding Generation and Storage', () => {
    test('should generate embeddings for business content', async () => {
      const businessChunks = [
        {
          id: 'chunk1',
          contentId: 'content1',
          chunkIndex: 0,
          text: 'Our grand slam offer includes irresistible value proposition with guarantees.',
          startPosition: 0,
          endPosition: 73,
          wordCount: 11,
          characterCount: 73,
          metadata: { frameworkReferences: ['Grand Slam Offer'] }
        },
        {
          id: 'chunk2',
          contentId: 'content1', 
          chunkIndex: 1,
          text: 'The core four elements drive our lead generation and sales process optimization.',
          startPosition: 73,
          endPosition: 152,
          wordCount: 13,
          characterCount: 79,
          metadata: { frameworkReferences: ['Core Four'] }
        }
      ];

      const mockEmbeddings = businessChunks.map((chunk, index) => ({
        id: `emb_${index}`,
        chunkId: chunk.id,
        vector: Array.from({ length: 1536 }, (_, i) => (i + index) / 1536), // Deterministic vectors for testing
        dimensions: 1536,
        model: 'text-embedding-ada-002',
        createdAt: new Date(),
        metadata: {
          tokens: chunk.wordCount,
          cost: 0.0001,
          processingTime: 400,
          quality: 0.95
        }
      }));

      embeddingService.generateEmbeddings.mockResolvedValue({
        embeddings: mockEmbeddings,
        totalTokens: 24,
        cost: 0.0002,
        processingTime: 800
      });

      const result = await embeddingService.generateEmbeddings(businessChunks);

      expect(result.embeddings).toHaveLength(2);
      expect(result.embeddings[0].vector).toHaveLength(1536);
      expect(result.embeddings[0].chunkId).toBe('chunk1');
      expect(result.embeddings[1].chunkId).toBe('chunk2');
      expect(result.totalTokens).toBe(24);
      expect(result.cost).toBeGreaterThan(0);
    });

    test('should batch process large numbers of chunks efficiently', async () => {
      const largeChunkSet = Array.from({ length: 100 }, (_, i) => ({
        id: `chunk_${i}`,
        contentId: 'large_content',
        chunkIndex: i,
        text: `Business content chunk ${i} with framework mentions.`,
        startPosition: i * 60,
        endPosition: (i + 1) * 60,
        wordCount: 9,
        characterCount: 60,
        metadata: {}
      }));

      // Mock batch processing
      embeddingService.batchGenerateEmbeddings = jest.fn().mockResolvedValue({
        embeddings: largeChunkSet.map((chunk, i) => ({
          id: `emb_${i}`,
          chunkId: chunk.id,
          vector: Array.from({ length: 1536 }, () => Math.random()),
          dimensions: 1536,
          model: 'text-embedding-ada-002',
          createdAt: new Date()
        })),
        totalTokens: 900,
        cost: 0.01,
        processingTime: 5000,
        batchInfo: {
          batchSize: 20,
          totalBatches: 5
        }
      });

      const result = await embeddingService.batchGenerateEmbeddings!(largeChunkSet);

      expect(result.embeddings).toHaveLength(100);
      expect(result.batchInfo?.totalBatches).toBe(5);
      expect(result.processingTime).toBeLessThan(10000); // Should be efficient
    });
  });

  describe('Semantic Search Integration', () => {
    test('should perform semantic search on stored embeddings', async () => {
      const query = 'How to create irresistible business offers?';
      const queryEmbedding = Array.from({ length: 1536 }, () => Math.random());

      // Mock query embedding generation
      embeddingService.generateQueryEmbedding.mockResolvedValue({
        embedding: queryEmbedding,
        tokens: 8,
        cost: 0.0001,
        processingTime: 200
      });

      // Mock similarity search results
      const mockSearchResults = [
        {
          chunkId: 'chunk1',
          contentId: 'content1',
          text: 'Our grand slam offer framework creates irresistible value propositions.',
          score: 0.92,
          metadata: {
            framework: ['Grand Slam Offer'],
            quality: 0.88
          }
        },
        {
          chunkId: 'chunk2',
          contentId: 'content2', 
          text: 'Value stacking and guarantee strategies make offers compelling.',
          score: 0.87,
          metadata: {
            framework: ['Grand Slam Offer'],
            quality: 0.85
          }
        },
        {
          chunkId: 'chunk3',
          contentId: 'content3',
          text: 'Lead magnets should provide immediate value to prospects.',
          score: 0.71,
          metadata: {
            framework: ['Core Four'],
            quality: 0.80
          }
        }
      ];

      embeddingService.similaritySearch.mockResolvedValue({
        results: mockSearchResults,
        totalResults: 3,
        searchTime: 50,
        searchMetadata: {
          algorithm: 'cosine_similarity',
          threshold: 0.7
        }
      });

      const searchResult = await embeddingService.similaritySearch(queryEmbedding, {
        limit: 5,
        threshold: 0.7
      });

      expect(searchResult.results).toHaveLength(3);
      expect(searchResult.results[0].score).toBeGreaterThan(0.9);
      expect(searchResult.results[0].text).toContain('irresistible');
      expect(searchResult.results[0].metadata.framework).toContain('Grand Slam Offer');
      
      // Results should be sorted by relevance score
      for (let i = 0; i < searchResult.results.length - 1; i++) {
        expect(searchResult.results[i].score).toBeGreaterThanOrEqual(
          searchResult.results[i + 1].score
        );
      }
    });

    test('should filter search results by business framework', async () => {
      const query = 'lead generation strategies';
      const queryEmbedding = Array.from({ length: 1536 }, () => Math.random());

      embeddingService.generateQueryEmbedding.mockResolvedValue({
        embedding: queryEmbedding,
        tokens: 3,
        cost: 0.0001,
        processingTime: 150
      });

      // Mock filtered search results
      const coreFrameworkResults = [
        {
          chunkId: 'chunk1',
          contentId: 'content1',
          text: 'Lead magnets convert visitors into qualified prospects at 15% rates.',
          score: 0.89,
          metadata: {
            framework: ['Core Four'],
            quality: 0.92
          }
        },
        {
          chunkId: 'chunk2', 
          contentId: 'content2',
          text: 'Landing page optimization increases lead generation conversion rates.',
          score: 0.84,
          metadata: {
            framework: ['Core Four'],
            quality: 0.87
          }
        }
      ];

      embeddingService.similaritySearch.mockResolvedValue({
        results: coreFrameworkResults,
        totalResults: 2,
        searchTime: 45,
        searchMetadata: {
          algorithm: 'cosine_similarity',
          filters: ['Core Four'],
          threshold: 0.7
        }
      });

      const searchResult = await embeddingService.similaritySearch(queryEmbedding, {
        limit: 5,
        threshold: 0.7,
        filters: { framework: ['Core Four'] }
      });

      expect(searchResult.results).toHaveLength(2);
      
      // All results should be Core Four framework
      for (const result of searchResult.results) {
        expect(result.metadata.framework).toContain('Core Four');
      }
    });
  });

  describe('Content Retrieval and Citation', () => {
    test('should retrieve content with proper citations', async () => {
      const contentItem = createTestContentItem({
        type: 'url',
        source: 'https://example.com/business-article',
        metadata: {
          author: 'Business Expert',
          createdDate: new Date('2024-01-15'),
          title: 'Advanced Business Frameworks'
        }
      });

      storageService.getContent.mockResolvedValue(contentItem);

      const retrieved = await storageService.getContent(contentItem.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(contentItem.id);
      
      // Should include citation information
      expect(retrieved!.metadata.author).toBe('Business Expert');
      expect(retrieved!.metadata.createdDate).toEqual(new Date('2024-01-15'));
      expect(retrieved!.source).toBe('https://example.com/business-article');
    });

    test('should generate proper citations for different content types', async () => {
      const contentTypes = [
        {
          type: 'url',
          source: 'https://hbr.org/business-strategy',
          expectedCitation: 'Harvard Business Review'
        },
        {
          type: 'pdf',
          source: '/uploads/business-guide.pdf',
          expectedCitation: 'business-guide.pdf'
        },
        {
          type: 'youtube',
          source: 'https://youtube.com/watch?v=abc123',
          expectedCitation: 'YouTube Video'
        }
      ];

      for (const { type, source, expectedCitation } of contentTypes) {
        const contentItem = createTestContentItem({
          type: type as any,
          source,
          metadata: {
            title: 'Test Content'
          }
        });

        storageService.getContent.mockResolvedValue(contentItem);
        
        const retrieved = await storageService.getContent(contentItem.id);
        expect(retrieved).toBeDefined();
        
        // Citation format should be appropriate for content type
        const citation = generateCitation(retrieved!);
        expect(citation).toContain(expectedCitation);
      }
    });
  });

  describe('Vector Database Integration', () => {
    test('should store embeddings in vector database with metadata', async () => {
      const contentItem = createTestContentItem();
      const mockChunks = [
        {
          id: 'chunk1',
          contentId: contentItem.id,
          chunkIndex: 0,
          text: 'Business framework content',
          startPosition: 0,
          endPosition: 25,
          wordCount: 4,
          characterCount: 25,
          metadata: {
            framework: ['Grand Slam Offer'],
            quality: 0.9
          }
        }
      ];

      const mockEmbeddings = [
        {
          id: 'emb1',
          chunkId: 'chunk1',
          vector: Array.from({ length: 1536 }, () => Math.random()),
          dimensions: 1536,
          model: 'text-embedding-ada-002',
          createdAt: new Date(),
          metadata: {
            tokens: 4,
            quality: 0.9
          }
        }
      ];

      storageService.storeEmbeddings = jest.fn().mockResolvedValue({
        success: true,
        storedCount: 1,
        indexTime: 100
      });

      const result = await storageService.storeEmbeddings!(mockEmbeddings, {
        index: 'oracle-business-content',
        namespace: 'production'
      });

      expect(result.success).toBe(true);
      expect(result.storedCount).toBe(1);
      expect(storageService.storeEmbeddings).toHaveBeenCalledWith(
        mockEmbeddings,
        expect.objectContaining({
          index: 'oracle-business-content',
          namespace: 'production'
        })
      );
    });

    test('should perform vector similarity search with filtering', async () => {
      const queryVector = Array.from({ length: 1536 }, () => Math.random());
      
      const mockVectorResults = [
        {
          id: 'emb1',
          score: 0.94,
          metadata: {
            chunkId: 'chunk1',
            contentId: 'content1',
            framework: ['Grand Slam Offer'],
            text: 'Grand slam offer creates irresistible value'
          }
        },
        {
          id: 'emb2',
          score: 0.88,
          metadata: {
            chunkId: 'chunk2', 
            contentId: 'content2',
            framework: ['Core Four'],
            text: 'Lead magnets generate qualified prospects'
          }
        }
      ];

      storageService.searchByEmbedding = jest.fn().mockResolvedValue({
        results: mockVectorResults,
        searchTime: 25,
        totalResults: 2
      });

      const searchResult = await storageService.searchByEmbedding!(queryVector, {
        topK: 10,
        threshold: 0.8,
        includeMetadata: true,
        filter: {
          framework: { $in: ['Grand Slam Offer', 'Core Four'] }
        }
      });

      expect(searchResult.results).toHaveLength(2);
      expect(searchResult.results[0].score).toBeGreaterThan(0.9);
      expect(searchResult.searchTime).toBeLessThan(100); // Should be fast
      
      // Verify filtering worked
      for (const result of searchResult.results) {
        const frameworks = result.metadata.framework;
        expect(['Grand Slam Offer', 'Core Four'].some(f => frameworks.includes(f))).toBe(true);
      }
    });
  });

  describe('Content Freshness and Updates', () => {
    test('should detect and handle content updates', async () => {
      const originalContent = createTestContentItem({
        metadata: {
          lastModified: new Date('2024-01-01'),
          version: 1
        }
      });

      const updatedContent = {
        ...originalContent,
        metadata: {
          ...originalContent.metadata,
          lastModified: new Date('2024-02-01'),
          version: 2,
          extractedText: 'Updated business framework content with new insights'
        }
      };

      storageService.updateContent.mockResolvedValue({
        success: true,
        updated: true,
        previousVersion: 1,
        newVersion: 2
      });

      const updateResult = await storageService.updateContent(originalContent.id, updatedContent);

      expect(updateResult.success).toBe(true);
      expect(updateResult.updated).toBe(true);
      expect(updateResult.newVersion).toBe(2);
      
      // Should trigger reprocessing for updated content
      expect(storageService.updateContent).toHaveBeenCalledWith(
        originalContent.id,
        expect.objectContaining({
          metadata: expect.objectContaining({
            version: 2,
            lastModified: expect.any(Date)
          })
        })
      );
    });

    test('should invalidate outdated embeddings on content update', async () => {
      const contentId = 'content_to_update';
      
      storageService.deleteContent.mockResolvedValue({
        success: true,
        deletedContent: true,
        deletedChunks: 5,
        deletedEmbeddings: 5
      });

      const deleteResult = await storageService.deleteContent(contentId);

      expect(deleteResult.success).toBe(true);
      expect(deleteResult.deletedChunks).toBe(5);
      expect(deleteResult.deletedEmbeddings).toBe(5);
    });
  });

  describe('Error Handling and Resilience', () => {
    test('should handle embedding service failures gracefully', async () => {
      const chunks = [createMockChunk()];
      
      embeddingService.generateEmbeddings.mockRejectedValue(
        new Error('OpenAI API rate limit exceeded')
      );

      try {
        await embeddingService.generateEmbeddings(chunks);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('rate limit');
      }
    });

    test('should handle vector database connection issues', async () => {
      const queryVector = Array.from({ length: 1536 }, () => Math.random());
      
      storageService.searchByEmbedding = jest.fn().mockRejectedValue(
        new Error('Vector database connection timeout')
      );

      try {
        await storageService.searchByEmbedding!(queryVector);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('connection timeout');
      }
    });

    test('should provide fallback search when vector search fails', async () => {
      const query = 'business frameworks';
      
      // Mock vector search failure
      embeddingService.similaritySearch.mockRejectedValue(
        new Error('Vector search unavailable')
      );

      // Mock fallback text search
      storageService.searchContent.mockResolvedValue({
        items: [
          createTestContentItem({
            metadata: {
              extractedText: 'Grand slam offer framework implementation guide'
            }
          })
        ],
        total: 1,
        hasMore: false
      });

      const fallbackResult = await storageService.searchContent({
        query,
        page: 1,
        limit: 10
      });

      expect(fallbackResult.items).toHaveLength(1);
      expect(fallbackResult.items[0].metadata.extractedText).toContain('framework');
    });
  });
});

// Helper functions for RAG integration testing
function createMockChunk() {
  return {
    id: `chunk_${Math.random().toString(36).substr(2, 9)}`,
    contentId: 'test_content',
    chunkIndex: 0,
    text: 'Business framework content for testing',
    startPosition: 0,
    endPosition: 38,
    wordCount: 6,
    characterCount: 38,
    metadata: {}
  };
}

function generateCitation(contentItem: any): string {
  const { type, source, metadata } = contentItem;
  const title = metadata.title || 'Untitled';
  const author = metadata.author || 'Unknown';
  const date = metadata.createdDate ? new Date(metadata.createdDate).toLocaleDateString() : 'Unknown date';

  switch (type) {
    case 'url':
      const domain = new URL(source).hostname;
      return `${title} - ${author} - ${domain} - ${date}`;
    case 'pdf':
    case 'docx':
      return `${title} - ${author} - ${date}`;
    case 'youtube':
      return `${title} - YouTube Video - ${date}`;
    default:
      return `${title} - ${author} - ${date}`;
  }
}