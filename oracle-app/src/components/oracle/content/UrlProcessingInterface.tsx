/**
 * Oracle URL Processing Interface
 * Dr. Sarah Hook + Elena Execution - Phase 3.5 Oracle Content Management
 */

import React, { useState, useRef, useEffect } from 'react';
import { oracleTheme, getMysticalShadow, mysticalAnimations } from '../../../styles/oracle-theme';

// Icons
import { 
  GlobeAltIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface UrlProcessingItem {
  id: string;
  url: string;
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  contentId?: string;
  metadata?: {
    title?: string;
    domain?: string;
    description?: string;
    author?: string;
    wordCount?: number;
    quality?: number;
    frameworks?: string[];
  };
}

interface UrlProcessingInterfaceProps {
  onUrlsProcessed: (urls: UrlProcessingItem[]) => void;
  onUrlRemoved: (urlId: string) => void;
  maxUrls?: number;
}

const UrlProcessingInterface: React.FC<UrlProcessingInterfaceProps> = ({
  onUrlsProcessed,
  onUrlRemoved,
  maxUrls = 5
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [processedUrls, setProcessedUrls] = useState<UrlProcessingItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const validateUrl = (url: string): { isValid: boolean; error?: string } => {
    try {
      const urlObj = new URL(url.trim());
      
      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' };
      }
      
      // Check for localhost/internal IPs (SSRF protection)
      const hostname = urlObj.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.16.') ||
          hostname.includes('internal')) {
        return { isValid: false, error: 'Internal URLs are not allowed for security reasons' };
      }
      
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  };

  const extractUrlsFromInput = (input: string): string[] => {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const matches = input.match(urlRegex) || [];
    
    // Also handle line-separated URLs
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);
    const lineUrls = lines.filter(line => {
      try {
        new URL(line);
        return true;
      } catch {
        return false;
      }
    });
    
    return [...new Set([...matches, ...lineUrls])];
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    const urls = extractUrlsFromInput(urlInput);
    
    if (urls.length === 0) {
      setValidationErrors(['No valid URLs found in the input']);
      return;
    }
    
    if (urls.length + processedUrls.length > maxUrls) {
      setValidationErrors([`Maximum ${maxUrls} URLs allowed. You have ${processedUrls.length} already added.`]);
      return;
    }
    
    // Validate all URLs
    const errors: string[] = [];
    const validUrls: string[] = [];
    
    for (const url of urls) {
      const validation = validateUrl(url);
      if (validation.isValid) {
        validUrls.push(url);
      } else {
        errors.push(`${url}: ${validation.error}`);
      }
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    
    // Create processing items
    const newUrls: UrlProcessingItem[] = validUrls.map(url => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      status: 'pending' as const,
      progress: 0
    }));
    
    setProcessedUrls(prev => [...prev, ...newUrls]);
    setUrlInput('');
    
    // Start processing
    await processUrls(newUrls);
  };

  const processUrls = async (urls: UrlProcessingItem[]) => {
    setIsProcessing(true);
    
    for (const urlItem of urls) {
      try {
        // Update status to validating
        setProcessedUrls(prev => prev.map(u => 
          u.id === urlItem.id ? { ...u, status: 'validating' } : u
        ));
        
        // Simulate validation progress
        for (let progress = 0; progress <= 30; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setProcessedUrls(prev => prev.map(u => 
            u.id === urlItem.id ? { ...u, progress } : u
          ));
        }
        
        // Update status to processing
        setProcessedUrls(prev => prev.map(u => 
          u.id === urlItem.id ? { ...u, status: 'processing' } : u
        ));
        
        // Call Oracle URL processing API
        const response = await fetch('/api/oracle-content/url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('oracle_token')}`
          },
          body: JSON.stringify({
            urls: [urlItem.url],
            options: {
              extractImages: false,
              followRedirects: true,
              respectRobots: true,
              quality: 'high',
              extractFrameworks: true,
              generateSummary: true
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Processing failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Simulate processing progress
        for (let progress = 30; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setProcessedUrls(prev => prev.map(u => 
            u.id === urlItem.id ? { ...u, progress } : u
          ));
        }
        
        // Extract metadata from result
        const contentData = result.data.results[0];
        const metadata = {
          title: contentData?.title || extractDomainFromUrl(urlItem.url),
          domain: extractDomainFromUrl(urlItem.url),
          description: contentData?.metadata?.extractedText?.substring(0, 200) || '',
          author: contentData?.metadata?.author,
          wordCount: contentData?.metadata?.wordCount,
          quality: contentData?.metadata?.quality,
          frameworks: contentData?.metadata?.framework || []
        };
        
        // Mark as completed
        setProcessedUrls(prev => prev.map(u => 
          u.id === urlItem.id ? { 
            ...u, 
            status: 'completed',
            contentId: contentData?.id,
            metadata
          } : u
        ));

      } catch (error) {
        setProcessedUrls(prev => prev.map(u => 
          u.id === urlItem.id ? { 
            ...u, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Processing failed'
          } : u
        ));
      }
    }

    setIsProcessing(false);
    onUrlsProcessed(processedUrls);
  };

  const extractDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'Unknown';
    }
  };

  const removeUrl = (urlId: string) => {
    setProcessedUrls(prev => prev.filter(u => u.id !== urlId));
    onUrlRemoved(urlId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleUrlSubmit();
    }
  };

  const getStatusIcon = (status: UrlProcessingItem['status']) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'validating':
        return ShieldCheckIcon;
      case 'processing':
        return ArrowPathIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'error':
        return ExclamationTriangleIcon;
      default:
        return LinkIcon;
    }
  };

  const getQualityColor = (quality?: number) => {
    if (!quality) return oracleTheme.colors.stardustGray;
    if (quality >= 80) return oracleTheme.colors.emeraldWisdom;
    if (quality >= 60) return oracleTheme.colors.etherealGold;
    return oracleTheme.colors.amberAlert;
  };

  return (
    <div className="oracle-url-processing">
      <style jsx>{`
        ${mysticalAnimations.fadeInUp}
        ${mysticalAnimations.pulseGlow}
        ${mysticalAnimations.shimmer}
        
        .oracle-url-processing {
          font-family: ${oracleTheme.typography.bodyFont};
        }
        
        .input-section {
          background: ${oracleTheme.variants.card.mystical.background};
          backdrop-filter: ${oracleTheme.variants.card.mystical.backdropFilter};
          border: ${oracleTheme.variants.card.mystical.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          box-shadow: ${getMysticalShadow('light')};
          padding: ${oracleTheme.spacing[8]};
          margin-bottom: ${oracleTheme.spacing[8]};
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .input-section:hover {
          box-shadow: ${getMysticalShadow('medium')};
          transform: translateY(-2px);
        }
        
        .section-header {
          text-align: center;
          margin-bottom: ${oracleTheme.spacing[6]};
        }
        
        .section-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto ${oracleTheme.spacing[4]};
          color: ${oracleTheme.colors.mysticalPurple};
        }
        
        .section-title {
          font-family: ${oracleTheme.typography.displayFont};
          font-size: ${oracleTheme.typography.sizes['2xl']};
          font-weight: ${oracleTheme.typography.weights.semibold};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .section-subtitle {
          font-size: ${oracleTheme.typography.sizes.base};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .input-group {
          position: relative;
        }
        
        .url-textarea {
          width: 100%;
          min-height: 120px;
          padding: ${oracleTheme.spacing[4]};
          background: rgba(15, 15, 35, 0.6);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: ${oracleTheme.borders.radius.lg};
          color: ${oracleTheme.colors.crystallineWhite};
          font-family: ${oracleTheme.typography.bodyFont};
          font-size: ${oracleTheme.typography.sizes.base};
          resize: vertical;
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .url-textarea:focus {
          outline: none;
          border-color: ${oracleTheme.colors.mysticalPurple};
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }
        
        .url-textarea::placeholder {
          color: ${oracleTheme.colors.stardustGray};
        }
        
        .input-help {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
          margin-top: ${oracleTheme.spacing[2]};
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .validation-errors {
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .error-item {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: ${oracleTheme.borders.radius.md};
          padding: ${oracleTheme.spacing[3]};
          margin-bottom: ${oracleTheme.spacing[2]};
          color: ${oracleTheme.colors.crimsonWarning};
          font-size: ${oracleTheme.typography.sizes.sm};
        }
        
        .submit-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .url-count {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .mystical-button {
          background: ${oracleTheme.variants.button.primary.background};
          color: ${oracleTheme.variants.button.primary.color};
          border: none;
          border-radius: ${oracleTheme.borders.radius.lg};
          padding: ${oracleTheme.spacing[3]} ${oracleTheme.spacing[8]};
          font-size: ${oracleTheme.typography.sizes.base};
          font-weight: ${oracleTheme.typography.weights.medium};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.normal};
          box-shadow: ${oracleTheme.variants.button.primary.boxShadow};
        }
        
        .mystical-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
        }
        
        .mystical-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .url-list {
          margin-top: ${oracleTheme.spacing[8]};
        }
        
        .url-item {
          background: ${oracleTheme.variants.card.ethereal.background};
          backdrop-filter: ${oracleTheme.variants.card.ethereal.backdropFilter};
          border: ${oracleTheme.variants.card.ethereal.border};
          border-radius: ${oracleTheme.borders.radius.lg};
          padding: ${oracleTheme.spacing[6]};
          margin-bottom: ${oracleTheme.spacing[4]};
          animation: fadeInUp 0.3s ease-out;
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .url-item:hover {
          box-shadow: ${getMysticalShadow('medium')};
          transform: translateY(-1px);
        }
        
        .url-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .url-info {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        
        .status-icon {
          width: 24px;
          height: 24px;
          margin-right: ${oracleTheme.spacing[3]};
          flex-shrink: 0;
        }
        
        .status-pending .status-icon { color: ${oracleTheme.colors.stardustGray}; }
        .status-validating .status-icon { color: ${oracleTheme.colors.etherealGold}; }
        .status-processing .status-icon { 
          color: ${oracleTheme.colors.processing}; 
          animation: spin 2s linear infinite;
        }
        .status-completed .status-icon { color: ${oracleTheme.colors.emeraldWisdom}; }
        .status-error .status-icon { color: ${oracleTheme.colors.crimsonWarning}; }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .url-details {
          flex: 1;
          min-width: 0;
        }
        
        .url-title {
          font-size: ${oracleTheme.typography.sizes.lg};
          font-weight: ${oracleTheme.typography.weights.medium};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[1]};
          word-break: break-word;
        }
        
        .url-link {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.mysticalPurple};
          text-decoration: none;
          margin-bottom: ${oracleTheme.spacing[2]};
          display: block;
          word-break: break-all;
        }
        
        .url-link:hover {
          text-decoration: underline;
        }
        
        .url-meta {
          display: flex;
          gap: ${oracleTheme.spacing[4]};
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .url-actions {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .status-badge {
          padding: ${oracleTheme.spacing[1]} ${oracleTheme.spacing[3]};
          border-radius: ${oracleTheme.borders.radius.full};
          font-size: ${oracleTheme.typography.sizes.xs};
          font-weight: ${oracleTheme.typography.weights.medium};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-pending { 
          background: rgba(156, 163, 175, 0.2);
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .status-validating, .status-processing { 
          background: rgba(139, 92, 246, 0.2);
          color: ${oracleTheme.colors.processing};
        }
        
        .status-completed { 
          background: rgba(16, 185, 129, 0.2);
          color: ${oracleTheme.colors.success};
        }
        
        .status-error { 
          background: rgba(239, 68, 68, 0.2);
          color: ${oracleTheme.colors.error};
        }
        
        .action-button {
          padding: ${oracleTheme.spacing[2]};
          border: none;
          border-radius: ${oracleTheme.borders.radius.base};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.fast};
          background: rgba(99, 102, 241, 0.1);
          color: ${oracleTheme.colors.mysticalPurple};
        }
        
        .action-button:hover {
          background: rgba(99, 102, 241, 0.2);
          transform: scale(1.05);
        }
        
        .remove-button {
          background: rgba(239, 68, 68, 0.1);
          color: ${oracleTheme.colors.crimsonWarning};
        }
        
        .remove-button:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        
        .progress-section {
          margin-top: ${oracleTheme.spacing[4]};
        }
        
        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: ${oracleTheme.borders.radius.full};
          overflow: hidden;
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .progress-fill {
          height: 100%;
          background: ${oracleTheme.colors.primaryGradient};
          border-radius: ${oracleTheme.borders.radius.full};
          transition: width 0.3s ease;
        }
        
        .metadata-section {
          margin-top: ${oracleTheme.spacing[4]};
          padding-top: ${oracleTheme.spacing[4]};
          border-top: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: ${oracleTheme.spacing[4]};
        }
        
        .metadata-item {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .metadata-icon {
          width: 16px;
          height: 16px;
          color: ${oracleTheme.colors.mysticalPurple};
        }
        
        .metadata-label {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .metadata-value {
          font-weight: ${oracleTheme.typography.weights.medium};
          color: ${oracleTheme.colors.crystallineWhite};
        }
        
        .frameworks-list {
          display: flex;
          flex-wrap: wrap;
          gap: ${oracleTheme.spacing[2]};
          margin-top: ${oracleTheme.spacing[2]};
        }
        
        .framework-tag {
          padding: ${oracleTheme.spacing[1]} ${oracleTheme.spacing[2]};
          background: rgba(99, 102, 241, 0.2);
          color: ${oracleTheme.colors.mysticalPurple};
          border-radius: ${oracleTheme.borders.radius.base};
          font-size: ${oracleTheme.typography.sizes.xs};
          font-weight: ${oracleTheme.typography.weights.medium};
        }
        
        .error-message {
          color: ${oracleTheme.colors.crimsonWarning};
          font-size: ${oracleTheme.typography.sizes.sm};
          margin-top: ${oracleTheme.spacing[2]};
          padding: ${oracleTheme.spacing[2]};
          background: rgba(239, 68, 68, 0.1);
          border-radius: ${oracleTheme.borders.radius.base};
        }
      `}</style>

      {/* Input Section */}
      <div className="input-section">
        <div className="section-header">
          <GlobeAltIcon className="section-icon" />
          <h3 className="section-title">Extract Web Wisdom</h3>
          <p className="section-subtitle">
            Transform web articles into Oracle knowledge
          </p>
        </div>

        <div className="input-group">
          <textarea
            ref={inputRef}
            className="url-textarea"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Paste URLs here (one per line or separated by spaces)

Examples:
https://example.com/business-article
https://blog.example.com/marketing-strategy
https://news.example.com/industry-insights`}
          />
          
          <div className="input-help">
            Press <kbd>Cmd+Enter</kbd> (Mac) or <kbd>Ctrl+Enter</kbd> (PC) to process URLs
          </div>

          {validationErrors.length > 0 && (
            <div className="validation-errors">
              {validationErrors.map((error, index) => (
                <div key={index} className="error-item">
                  {error}
                </div>
              ))}
            </div>
          )}

          <div className="submit-section">
            <div className="url-count">
              {processedUrls.length}/{maxUrls} URLs processed
            </div>
            
            <button
              type="button"
              className="mystical-button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || isProcessing || processedUrls.length >= maxUrls}
            >
              {isProcessing ? 'Processing...' : 'Extract Wisdom'}
            </button>
          </div>
        </div>
      </div>

      {/* URL List */}
      {processedUrls.length > 0 && (
        <div className="url-list">
          {processedUrls.map((urlItem) => {
            const StatusIcon = getStatusIcon(urlItem.status);
            
            return (
              <div key={urlItem.id} className={`url-item status-${urlItem.status}`}>
                <div className="url-header">
                  <div className="url-info">
                    <StatusIcon className="status-icon" />
                    <div className="url-details">
                      <div className="url-title">
                        {urlItem.metadata?.title || extractDomainFromUrl(urlItem.url)}
                      </div>
                      <a 
                        href={urlItem.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="url-link"
                      >
                        {urlItem.url}
                      </a>
                      {urlItem.metadata && (
                        <div className="url-meta">
                          <span>📄 {urlItem.metadata.wordCount || 0} words</span>
                          <span>🌐 {urlItem.metadata.domain}</span>
                          {urlItem.metadata.quality && (
                            <span style={{ color: getQualityColor(urlItem.metadata.quality) }}>
                              ⭐ {Math.round(urlItem.metadata.quality)}% quality
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="url-actions">
                    <span className={`status-badge status-${urlItem.status}`}>
                      {urlItem.status}
                    </span>
                    
                    {urlItem.status === 'completed' && urlItem.contentId && (
                      <button
                        type="button"
                        className="action-button"
                        title="View Content"
                        onClick={() => {
                          window.open(`/oracle/content/${urlItem.contentId}`, '_blank');
                        }}
                      >
                        <EyeIcon width={16} height={16} />
                      </button>
                    )}
                    
                    <button
                      type="button"
                      className="action-button remove-button"
                      title="Remove URL"
                      onClick={() => removeUrl(urlItem.id)}
                      disabled={urlItem.status === 'validating' || urlItem.status === 'processing'}
                    >
                      <XMarkIcon width={16} height={16} />
                    </button>
                  </div>
                </div>

                {(urlItem.status === 'validating' || urlItem.status === 'processing') && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${urlItem.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {urlItem.error && (
                  <div className="error-message">{urlItem.error}</div>
                )}

                {urlItem.metadata && urlItem.status === 'completed' && (
                  <div className="metadata-section">
                    <div className="metadata-grid">
                      {urlItem.metadata.author && (
                        <div className="metadata-item">
                          <span className="metadata-label">Author:</span>
                          <span className="metadata-value">{urlItem.metadata.author}</span>
                        </div>
                      )}
                      
                      {urlItem.metadata.wordCount && (
                        <div className="metadata-item">
                          <ChartBarIcon className="metadata-icon" />
                          <span className="metadata-label">Words:</span>
                          <span className="metadata-value">{urlItem.metadata.wordCount.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {urlItem.metadata.quality && (
                        <div className="metadata-item">
                          <span className="metadata-label">Quality:</span>
                          <span 
                            className="metadata-value" 
                            style={{ color: getQualityColor(urlItem.metadata.quality) }}
                          >
                            {Math.round(urlItem.metadata.quality)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {urlItem.metadata.frameworks && urlItem.metadata.frameworks.length > 0 && (
                      <>
                        <div style={{ margin: `${oracleTheme.spacing[3]} 0 ${oracleTheme.spacing[2]}` }}>
                          <span className="metadata-label">Detected Frameworks:</span>
                        </div>
                        <div className="frameworks-list">
                          {urlItem.metadata.frameworks.map((framework, index) => (
                            <span key={index} className="framework-tag">
                              {framework}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UrlProcessingInterface;