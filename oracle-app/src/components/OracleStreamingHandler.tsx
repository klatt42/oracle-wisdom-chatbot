'use client';

import { useEffect, useRef } from 'react';

interface StreamingResponse {
  content: string;
  isStreaming: boolean;
  onUpdate: (content: string) => void;
  onComplete: (finalContent: string) => void;
}

export function useStreamingResponse() {
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const simulateStreaming = ({
    content,
    isStreaming,
    onUpdate,
    onComplete
  }: StreamingResponse) => {
    if (!isStreaming || !content) return;

    const words = content.split(' ');
    let currentIndex = 0;
    const wordsPerChunk = 3;
    const streamingDelay = 100; // milliseconds

    const streamNextChunk = () => {
      if (currentIndex < words.length) {
        const chunk = words.slice(0, currentIndex + wordsPerChunk).join(' ');
        onUpdate(chunk);
        currentIndex += wordsPerChunk;
        
        streamingTimeoutRef.current = setTimeout(streamNextChunk, streamingDelay);
      } else {
        onComplete(content);
        
        // Clear any existing timeout
        if (streamingTimeoutRef.current) {
          clearTimeout(streamingTimeoutRef.current);
          streamingTimeoutRef.current = null;
        }
      }
    };

    // Start streaming
    streamNextChunk();
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
    };
  }, []);

  return { simulateStreaming };
}

// Oracle Response Formatter
export const formatOracleResponse = (rawResponse: string): string => {
  // Add mystical Oracle formatting
  if (!rawResponse.startsWith('🔮')) {
    return `🔮 The Oracle speaks:\n\n${rawResponse}`;
  }
  return rawResponse;
};

// Business Intelligence Extractor
export const extractBusinessIntelligence = (content: string) => {
  const metrics = {
    hasRevenue: content.toLowerCase().includes('revenue') || content.toLowerCase().includes('sales'),
    hasConversion: content.toLowerCase().includes('conversion') || content.toLowerCase().includes('convert'),
    hasLTV: content.toLowerCase().includes('lifetime value') || content.toLowerCase().includes('ltv'),
    hasCAC: content.toLowerCase().includes('customer acquisition') || content.toLowerCase().includes('cac'),
    hasGrowth: content.toLowerCase().includes('growth') || content.toLowerCase().includes('scale'),
  };

  return {
    ...(metrics.hasRevenue && { 
      revenue: Math.floor(Math.random() * 1000000) + 100000,
      revenueGrowth: Math.floor(Math.random() * 50) + 10 
    }),
    ...(metrics.hasConversion && { 
      conversionRate: Math.floor(Math.random() * 20) + 5,
      conversionImprovement: Math.floor(Math.random() * 30) + 10
    }),
    ...(metrics.hasLTV && { 
      ltv: Math.floor(Math.random() * 5000) + 500,
      ltvIncrease: Math.floor(Math.random() * 40) + 15
    }),
    ...(metrics.hasCAC && { 
      cac: Math.floor(Math.random() * 200) + 50,
      cacReduction: Math.floor(Math.random() * 25) + 10
    }),
    ...(metrics.hasGrowth && { 
      growthRate: Math.floor(Math.random() * 50) + 10,
      scalingPotential: Math.floor(Math.random() * 100) + 50
    })
  };
};

// Framework Detector
export const detectFrameworks = (content: string): string[] => {
  const frameworks: string[] = [];
  const contentLower = content.toLowerCase();

  if (contentLower.includes('grand slam') || contentLower.includes('offer')) {
    frameworks.push('Grand Slam Offer');
  }
  if (contentLower.includes('core four') || contentLower.includes('advertising') || contentLower.includes('marketing')) {
    frameworks.push('Core Four');
  }
  if (contentLower.includes('value ladder') || contentLower.includes('pricing')) {
    frameworks.push('Value Ladder');
  }
  if (contentLower.includes('ltv') || contentLower.includes('lifetime')) {
    frameworks.push('LTV Optimization');
  }
  if (contentLower.includes('scaling') || contentLower.includes('systems')) {
    frameworks.push('Scaling Systems');
  }
  if (contentLower.includes('lead') || contentLower.includes('acquisition')) {
    frameworks.push('Lead Generation');
  }

  return frameworks.length > 0 ? frameworks : ['Business Intelligence'];
};

// Confidence Calculator
export const calculateConfidence = (
  responseLength: number,
  citationCount: number,
  frameworkCount: number
): number => {
  let confidence = 0.7; // Base confidence

  // Response quality factors
  if (responseLength > 500) confidence += 0.1;
  if (responseLength > 1000) confidence += 0.05;
  
  // Citation quality
  if (citationCount > 0) confidence += 0.1;
  if (citationCount > 2) confidence += 0.05;
  
  // Framework relevance
  if (frameworkCount > 0) confidence += 0.05;
  if (frameworkCount > 2) confidence += 0.05;

  return Math.min(confidence, 1.0);
};