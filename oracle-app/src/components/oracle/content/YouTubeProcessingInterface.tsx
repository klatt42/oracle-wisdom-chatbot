/**
 * Oracle YouTube Processing Interface
 * Dr. Sarah Hook + Elena Execution - Phase 3.5 Oracle Content Management
 */

import React, { useState, useRef, useEffect } from 'react';
import { oracleTheme, getMysticalShadow, mysticalAnimations } from '../../../styles/oracle-theme';

// Icons
import { 
  PlayIcon,
  VideoCameraIcon,
  ClockIcon,
  EyeIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface YouTubeProcessingItem {
  id: string;
  url: string;
  videoId: string;
  status: 'pending' | 'extracting' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  contentId?: string;
  metadata?: {
    title?: string;
    channel?: string;
    description?: string;
    duration?: string;
    viewCount?: number;
    publishedAt?: string;
    transcriptWordCount?: number;
    chapterCount?: number;
    speakerCount?: number;
    quality?: number;
    frameworks?: string[];
  };
}

interface YouTubeProcessingOptions {
  includeTranscript: boolean;
  includeComments: boolean;
  transcriptLanguage: string;
  maxComments: number;
  chapterDetection: boolean;
  speakerIdentification: boolean;
  timestampReferences: boolean;
  quality: 'standard' | 'high' | 'maximum';
}

interface YouTubeProcessingInterfaceProps {
  onVideosProcessed: (videos: YouTubeProcessingItem[]) => void;
  onVideoRemoved: (videoId: string) => void;
  maxVideos?: number;
}

const YouTubeProcessingInterface: React.FC<YouTubeProcessingInterfaceProps> = ({
  onVideosProcessed,
  onVideoRemoved,
  maxVideos = 3
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [processedVideos, setProcessedVideos] = useState<YouTubeProcessingItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [options, setOptions] = useState<YouTubeProcessingOptions>({
    includeTranscript: true,
    includeComments: false,
    transcriptLanguage: 'en',
    maxComments: 50,
    chapterDetection: true,
    speakerIdentification: true,
    timestampReferences: true,
    quality: 'high'
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /m\.youtube\.com\/watch\?v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const validateYouTubeUrl = (url: string): { isValid: boolean; videoId?: string; error?: string } => {
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return { isValid: false, error: 'Invalid YouTube URL format' };
    }

    // Basic video ID validation
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return { isValid: false, error: 'Invalid YouTube video ID format' };
    }

    return { isValid: true, videoId };
  };

  const extractUrlsFromInput = (input: string): string[] => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=)[^\s]+/g;
    const matches = input.match(youtubeRegex) || [];
    
    // Also handle line-separated URLs
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);
    const lineUrls = lines.filter(line => extractVideoId(line) !== null);
    
    return [...new Set([...matches, ...lineUrls])];
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    const urls = extractUrlsFromInput(urlInput);
    
    if (urls.length === 0) {
      setValidationErrors(['No valid YouTube URLs found in the input']);
      return;
    }
    
    if (urls.length + processedVideos.length > maxVideos) {
      setValidationErrors([`Maximum ${maxVideos} videos allowed. You have ${processedVideos.length} already added.`]);
      return;
    }
    
    // Validate all URLs and extract video IDs
    const errors: string[] = [];
    const validVideos: { url: string; videoId: string }[] = [];
    
    for (const url of urls) {
      const validation = validateYouTubeUrl(url);
      if (validation.isValid && validation.videoId) {
        // Check for duplicates
        const isDuplicate = processedVideos.some(v => v.videoId === validation.videoId) ||
                            validVideos.some(v => v.videoId === validation.videoId);
        
        if (isDuplicate) {
          errors.push(`${url}: Video already added`);
        } else {
          validVideos.push({ url, videoId: validation.videoId });
        }
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
    const newVideos: YouTubeProcessingItem[] = validVideos.map(({ url, videoId }) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url,
      videoId,
      status: 'pending' as const,
      progress: 0
    }));
    
    setProcessedVideos(prev => [...prev, ...newVideos]);
    setUrlInput('');
    
    // Start processing
    await processVideos(newVideos);
  };

  const processVideos = async (videos: YouTubeProcessingItem[]) => {
    setIsProcessing(true);
    
    for (const videoItem of videos) {
      try {
        // Update status to extracting
        setProcessedVideos(prev => prev.map(v => 
          v.id === videoItem.id ? { ...v, status: 'extracting' } : v
        ));
        
        // Simulate extraction progress
        for (let progress = 0; progress <= 40; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setProcessedVideos(prev => prev.map(v => 
            v.id === videoItem.id ? { ...v, progress } : v
          ));
        }
        
        // Update status to processing
        setProcessedVideos(prev => prev.map(v => 
          v.id === videoItem.id ? { ...v, status: 'processing' } : v
        ));
        
        // Call Oracle YouTube processing API
        const response = await fetch('/api/oracle-content/youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('oracle_token')}`
          },
          body: JSON.stringify({
            urls: [videoItem.url],
            options: {
              ...options,
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
        for (let progress = 40; progress <= 100; progress += 15) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setProcessedVideos(prev => prev.map(v => 
            v.id === videoItem.id ? { ...v, progress } : v
          ));
        }
        
        // Extract metadata from result
        const contentData = result.data.results[0];
        const metadata = {
          title: contentData?.title || `Video ${videoItem.videoId}`,
          channel: contentData?.metadata?.channel || 'Unknown Channel',
          description: contentData?.metadata?.description?.substring(0, 200) || '',
          duration: contentData?.metadata?.duration || '0:00',
          viewCount: contentData?.metadata?.viewCount || 0,
          publishedAt: contentData?.metadata?.publishedAt,
          transcriptWordCount: contentData?.metadata?.transcriptWordCount || 0,
          chapterCount: contentData?.metadata?.chapterCount || 0,
          speakerCount: contentData?.metadata?.speakerCount || 1,
          quality: contentData?.metadata?.quality || 75,
          frameworks: contentData?.metadata?.framework || []
        };
        
        // Mark as completed
        setProcessedVideos(prev => prev.map(v => 
          v.id === videoItem.id ? { 
            ...v, 
            status: 'completed',
            contentId: contentData?.id,
            metadata
          } : v
        ));

      } catch (error) {
        setProcessedVideos(prev => prev.map(v => 
          v.id === videoItem.id ? { 
            ...v, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Processing failed'
          } : v
        ));
      }
    }

    setIsProcessing(false);
    onVideosProcessed(processedVideos);
  };

  const removeVideo = (videoId: string) => {
    setProcessedVideos(prev => prev.filter(v => v.id !== videoId));
    onVideoRemoved(videoId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleUrlSubmit();
    }
  };

  const getStatusIcon = (status: YouTubeProcessingItem['status']) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'extracting':
        return VideoCameraIcon;
      case 'processing':
        return ArrowPathIcon;
      case 'completed':
        return CheckCircleIcon;
      case 'error':
        return ExclamationTriangleIcon;
      default:
        return PlayIcon;
    }
  };

  const formatDuration = (duration?: string): string => {
    if (!duration) return '0:00';
    // Handle ISO 8601 duration format (PT15M30S) or simple format
    if (duration.startsWith('PT')) {
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = parseInt(match[1] || '0');
        const minutes = parseInt(match[2] || '0');
        const seconds = parseInt(match[3] || '0');
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
    return duration;
  };

  const formatViewCount = (count?: number): string => {
    if (!count) return '0 views';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  return (
    <div className="oracle-youtube-processing">
      <style jsx>{`
        ${mysticalAnimations.fadeInUp}
        ${mysticalAnimations.pulseGlow}
        ${mysticalAnimations.shimmer}
        
        .oracle-youtube-processing {
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
          color: ${oracleTheme.colors.crimsonWarning};
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
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: ${oracleTheme.borders.radius.lg};
          color: ${oracleTheme.colors.crystallineWhite};
          font-family: ${oracleTheme.typography.bodyFont};
          font-size: ${oracleTheme.typography.sizes.base};
          resize: vertical;
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .url-textarea:focus {
          outline: none;
          border-color: ${oracleTheme.colors.crimsonWarning};
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
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
        
        .advanced-options {
          margin: ${oracleTheme.spacing[4]} 0;
          padding: ${oracleTheme.spacing[4]};
          background: rgba(99, 102, 241, 0.05);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: ${oracleTheme.borders.radius.lg};
        }
        
        .options-toggle {
          background: none;
          border: none;
          color: ${oracleTheme.colors.mysticalPurple};
          cursor: pointer;
          font-size: ${oracleTheme.typography.sizes.sm};
          margin-bottom: ${oracleTheme.spacing[3]};
          text-decoration: underline;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: ${oracleTheme.spacing[4]};
        }
        
        .option-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .option-label {
          color: ${oracleTheme.colors.crystallineWhite};
          font-size: ${oracleTheme.typography.sizes.sm};
        }
        
        .option-input {
          background: rgba(15, 15, 35, 0.6);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: ${oracleTheme.borders.radius.base};
          color: ${oracleTheme.colors.crystallineWhite};
          padding: ${oracleTheme.spacing[1]} ${oracleTheme.spacing[2]};
        }
        
        .submit-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .video-count {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .youtube-button {
          background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
          color: #FFFFFF;
          border: none;
          border-radius: ${oracleTheme.borders.radius.lg};
          padding: ${oracleTheme.spacing[3]} ${oracleTheme.spacing[8]};
          font-size: ${oracleTheme.typography.sizes.base};
          font-weight: ${oracleTheme.typography.weights.medium};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.normal};
          box-shadow: 0 4px 16px rgba(255, 0, 0, 0.3);
        }
        
        .youtube-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255, 0, 0, 0.4);
        }
        
        .youtube-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .video-list {
          margin-top: ${oracleTheme.spacing[8]};
        }
        
        .video-item {
          background: ${oracleTheme.variants.card.ethereal.background};
          backdrop-filter: ${oracleTheme.variants.card.ethereal.backdropFilter};
          border: ${oracleTheme.variants.card.ethereal.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          padding: ${oracleTheme.spacing[6]};
          margin-bottom: ${oracleTheme.spacing[6]};
          animation: fadeInUp 0.3s ease-out;
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .video-item:hover {
          box-shadow: ${getMysticalShadow('medium')};
          transform: translateY(-2px);
        }
        
        .video-header {
          display: flex;
          align-items: flex-start;
          gap: ${oracleTheme.spacing[4]};
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .video-thumbnail {
          position: relative;
          flex-shrink: 0;
        }
        
        .thumbnail-image {
          width: 160px;
          height: 90px;
          border-radius: ${oracleTheme.borders.radius.lg};
          object-fit: cover;
        }
        
        .play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          background: rgba(255, 0, 0, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .video-info {
          flex: 1;
          min-width: 0;
        }
        
        .video-title {
          font-size: ${oracleTheme.typography.sizes.lg};
          font-weight: ${oracleTheme.typography.weights.semibold};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[2]};
          line-height: 1.4;
          word-break: break-word;
        }
        
        .video-channel {
          font-size: ${oracleTheme.typography.sizes.base};
          color: ${oracleTheme.colors.moonbeamSilver};
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .video-meta {
          display: flex;
          flex-wrap: wrap;
          gap: ${oracleTheme.spacing[4]};
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.stardustGray};
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .video-actions {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .status-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        
        .status-pending .status-icon { color: ${oracleTheme.colors.stardustGray}; }
        .status-extracting .status-icon { color: ${oracleTheme.colors.crimsonWarning}; }
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
        
        .status-extracting, .status-processing { 
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
          background: rgba(239, 68, 68, 0.2);
          border-radius: ${oracleTheme.borders.radius.full};
          overflow: hidden;
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
          border-radius: ${oracleTheme.borders.radius.full};
          transition: width 0.3s ease;
        }
        
        .metadata-section {
          margin-top: ${oracleTheme.spacing[4]};
          padding-top: ${oracleTheme.spacing[4]};
          border-top: 1px solid rgba(239, 68, 68, 0.2);
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
          color: ${oracleTheme.colors.crimsonWarning};
          flex-shrink: 0;
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
          background: rgba(239, 68, 68, 0.2);
          color: ${oracleTheme.colors.crimsonWarning};
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
          <VideoCameraIcon className="section-icon" />
          <h3 className="section-title">YouTube Wisdom Extraction</h3>
          <p className="section-subtitle">
            Transform video content into searchable Oracle knowledge
          </p>
        </div>

        <div className="input-group">
          <textarea
            ref={inputRef}
            className="url-textarea"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Paste YouTube URLs here (one per line or separated by spaces)

Examples:
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/abc123defgh
https://youtube.com/embed/xyz789mnopq`}
          />
          
          <div className="input-help">
            Press <kbd>Cmd+Enter</kbd> (Mac) or <kbd>Ctrl+Enter</kbd> (PC) to process videos
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

          {/* Advanced Options */}
          <div className="advanced-options">
            <button
              type="button"
              className="options-toggle"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
            </button>
            
            {showAdvancedOptions && (
              <div className="options-grid">
                <div className="option-item">
                  <label className="option-label">Include Transcript</label>
                  <input
                    type="checkbox"
                    checked={options.includeTranscript}
                    onChange={(e) => setOptions(prev => ({...prev, includeTranscript: e.target.checked}))}
                  />
                </div>
                
                <div className="option-item">
                  <label className="option-label">Chapter Detection</label>
                  <input
                    type="checkbox"
                    checked={options.chapterDetection}
                    onChange={(e) => setOptions(prev => ({...prev, chapterDetection: e.target.checked}))}
                  />
                </div>
                
                <div className="option-item">
                  <label className="option-label">Speaker ID</label>
                  <input
                    type="checkbox"
                    checked={options.speakerIdentification}
                    onChange={(e) => setOptions(prev => ({...prev, speakerIdentification: e.target.checked}))}
                  />
                </div>
                
                <div className="option-item">
                  <label className="option-label">Timestamp References</label>
                  <input
                    type="checkbox"
                    checked={options.timestampReferences}
                    onChange={(e) => setOptions(prev => ({...prev, timestampReferences: e.target.checked}))}
                  />
                </div>
                
                <div className="option-item">
                  <label className="option-label">Quality</label>
                  <select
                    className="option-input"
                    value={options.quality}
                    onChange={(e) => setOptions(prev => ({...prev, quality: e.target.value as any}))}
                  >
                    <option value="standard">Standard</option>
                    <option value="high">High</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
                
                <div className="option-item">
                  <label className="option-label">Transcript Language</label>
                  <select
                    className="option-input"
                    value={options.transcriptLanguage}
                    onChange={(e) => setOptions(prev => ({...prev, transcriptLanguage: e.target.value}))}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="submit-section">
            <div className="video-count">
              {processedVideos.length}/{maxVideos} videos processed
            </div>
            
            <button
              type="button"
              className="youtube-button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || isProcessing || processedVideos.length >= maxVideos}
            >
              {isProcessing ? 'Processing...' : 'Extract Video Wisdom'}
            </button>
          </div>
        </div>
      </div>

      {/* Video List */}
      {processedVideos.length > 0 && (
        <div className="video-list">
          {processedVideos.map((videoItem) => {
            const StatusIcon = getStatusIcon(videoItem.status);
            
            return (
              <div key={videoItem.id} className={`video-item status-${videoItem.status}`}>
                <div className="video-header">
                  <div className="video-thumbnail">
                    <img 
                      src={getThumbnailUrl(videoItem.videoId)} 
                      alt="Video thumbnail"
                      className="thumbnail-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/160/90';
                      }}
                    />
                    <div className="play-overlay">
                      <PlayIcon width={16} height={16} />
                    </div>
                  </div>
                  
                  <div className="video-info">
                    <div className="video-title">
                      {videoItem.metadata?.title || `Video ${videoItem.videoId}`}
                    </div>
                    
                    {videoItem.metadata?.channel && (
                      <div className="video-channel">
                        {videoItem.metadata.channel}
                      </div>
                    )}
                    
                    <div className="video-meta">
                      <span>🎬 {formatDuration(videoItem.metadata?.duration)}</span>
                      <span>👀 {formatViewCount(videoItem.metadata?.viewCount)}</span>
                      {videoItem.metadata?.transcriptWordCount && (
                        <span>📝 {videoItem.metadata.transcriptWordCount.toLocaleString()} words</span>
                      )}
                      {videoItem.metadata?.chapterCount && (
                        <span>📑 {videoItem.metadata.chapterCount} chapters</span>
                      )}
                      {videoItem.metadata?.quality && (
                        <span>⭐ {Math.round(videoItem.metadata.quality)}% quality</span>
                      )}
                    </div>
                  </div>

                  <div className="video-actions">
                    <StatusIcon className="status-icon" />
                    <span className={`status-badge status-${videoItem.status}`}>
                      {videoItem.status}
                    </span>
                    
                    {videoItem.status === 'completed' && videoItem.contentId && (
                      <button
                        type="button"
                        className="action-button"
                        title="View Content"
                        onClick={() => {
                          window.open(`/oracle/content/${videoItem.contentId}`, '_blank');
                        }}
                      >
                        <EyeIcon width={16} height={16} />
                      </button>
                    )}
                    
                    <button
                      type="button"
                      className="action-button remove-button"
                      title="Remove Video"
                      onClick={() => removeVideo(videoItem.id)}
                      disabled={videoItem.status === 'extracting' || videoItem.status === 'processing'}
                    >
                      <XMarkIcon width={16} height={16} />
                    </button>
                  </div>
                </div>

                {(videoItem.status === 'extracting' || videoItem.status === 'processing') && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${videoItem.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {videoItem.error && (
                  <div className="error-message">{videoItem.error}</div>
                )}

                {videoItem.metadata && videoItem.status === 'completed' && (
                  <div className="metadata-section">
                    <div className="metadata-grid">
                      {videoItem.metadata.speakerCount && (
                        <div className="metadata-item">
                          <SpeakerWaveIcon className="metadata-icon" />
                          <span className="metadata-label">Speakers:</span>
                          <span className="metadata-value">{videoItem.metadata.speakerCount}</span>
                        </div>
                      )}
                      
                      {videoItem.metadata.transcriptWordCount && (
                        <div className="metadata-item">
                          <DocumentTextIcon className="metadata-icon" />
                          <span className="metadata-label">Transcript:</span>
                          <span className="metadata-value">{videoItem.metadata.transcriptWordCount.toLocaleString()} words</span>
                        </div>
                      )}
                      
                      {videoItem.metadata.chapterCount && (
                        <div className="metadata-item">
                          <ChartBarIcon className="metadata-icon" />
                          <span className="metadata-label">Chapters:</span>
                          <span className="metadata-value">{videoItem.metadata.chapterCount}</span>
                        </div>
                      )}
                    </div>
                    
                    {videoItem.metadata.frameworks && videoItem.metadata.frameworks.length > 0 && (
                      <>
                        <div style={{ margin: `${oracleTheme.spacing[3]} 0 ${oracleTheme.spacing[2]}` }}>
                          <span className="metadata-label">Detected Frameworks:</span>
                        </div>
                        <div className="frameworks-list">
                          {videoItem.metadata.frameworks.map((framework, index) => (
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

export default YouTubeProcessingInterface;