/**
 * Oracle Content Management System - Main Interface
 * Dr. Sarah Hook + Elena Execution - Phase 3.5 Oracle Content Management
 * 
 * Psychology-driven design for content creators and business professionals
 */

import React, { useState, useEffect, useCallback } from 'react';
import { oracleTheme, getMysticalShadow, mysticalAnimations } from '../../../styles/oracle-theme';

// Import components
import FileUploadInterface from './FileUploadInterface';
import UrlProcessingInterface from './UrlProcessingInterface';
import YouTubeProcessingInterface from './YouTubeProcessingInterface';
import ProcessingStatusDisplay from './ProcessingStatusDisplay';
import ContentLibraryDashboard from './ContentLibraryDashboard';

// Icons
import { 
  CloudArrowUpIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  ChartBarIcon,
  SparklesIcon,
  EyeIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

type TabType = 'upload' | 'url' | 'youtube' | 'status' | 'library';

interface ProcessingJob {
  id: string;
  type: 'file' | 'url' | 'youtube';
  name: string;
  source: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  stages: ProcessingStage[];
  metadata?: {
    fileSize?: number;
    wordCount?: number;
    quality?: number;
    frameworks?: string[];
    chapters?: number;
    duration?: string;
  };
  contentId?: string;
}

interface ProcessingStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
  estimatedDuration?: number;
  actualDuration?: number;
}

const OracleContentManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-switch to status tab when processing starts
  useEffect(() => {
    const hasActiveJobs = processingJobs.some(job => 
      job.status === 'queued' || job.status === 'processing'
    );
    
    if (hasActiveJobs && activeTab !== 'status') {
      // Gentle nudge to status tab with notification
      addNotification('info', 'Content processing started. Switch to Status tab to monitor progress.');
    }
  }, [processingJobs]);

  const addNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const createProcessingStages = (type: 'file' | 'url' | 'youtube'): ProcessingStage[] => {
    const commonStages = [
      {
        id: 'validation',
        name: 'Validation',
        description: 'Checking content and permissions',
        status: 'pending' as const,
        progress: 0,
        estimatedDuration: 5000
      },
      {
        id: 'extraction',
        name: 'Content Extraction',
        description: 'Extracting text and metadata',
        status: 'pending' as const,
        progress: 0,
        estimatedDuration: 15000
      },
      {
        id: 'analysis',
        name: 'Business Analysis',
        description: 'Analyzing frameworks and relevance',
        status: 'pending' as const,
        progress: 0,
        estimatedDuration: 20000
      },
      {
        id: 'processing',
        name: 'RAG Processing',
        description: 'Creating embeddings and chunks',
        status: 'pending' as const,
        progress: 0,
        estimatedDuration: 25000
      },
      {
        id: 'storage',
        name: 'Storage',
        description: 'Saving to knowledge base',
        status: 'pending' as const,
        progress: 0,
        estimatedDuration: 5000
      }
    ];

    if (type === 'youtube') {
      commonStages.splice(1, 1, {
        id: 'transcript',
        name: 'Transcript Extraction',
        description: 'Extracting video transcript and metadata',
        status: 'pending' as const,
        progress: 0,
        estimatedDuration: 30000
      });
    }

    return commonStages;
  };

  // File upload handlers
  const handleFilesUploaded = useCallback((files: any[]) => {
    const newJobs: ProcessingJob[] = files.map(file => ({
      id: file.id,
      type: 'file' as const,
      name: file.file.name,
      source: file.file.name,
      status: 'queued' as const,
      progress: 0,
      startTime: new Date(),
      stages: createProcessingStages('file'),
      metadata: {
        fileSize: file.file.size
      }
    }));
    
    setProcessingJobs(prev => [...prev, ...newJobs]);
    addNotification('info', `${files.length} file(s) added to processing queue`);
  }, []);

  const handleFileRemoved = useCallback((fileId: string) => {
    setProcessingJobs(prev => prev.filter(job => job.id !== fileId));
  }, []);

  // URL processing handlers
  const handleUrlsProcessed = useCallback((urls: any[]) => {
    const newJobs: ProcessingJob[] = urls.map(url => ({
      id: url.id,
      type: 'url' as const,
      name: url.metadata?.title || new URL(url.url).hostname,
      source: url.url,
      status: url.status === 'completed' ? 'completed' : 'processing',
      progress: url.progress,
      startTime: new Date(),
      stages: createProcessingStages('url'),
      metadata: {
        wordCount: url.metadata?.wordCount,
        quality: url.metadata?.quality,
        frameworks: url.metadata?.frameworks
      },
      contentId: url.contentId
    }));
    
    setProcessingJobs(prev => {
      const updated = [...prev];
      newJobs.forEach(newJob => {
        const existingIndex = updated.findIndex(job => job.id === newJob.id);
        if (existingIndex >= 0) {
          updated[existingIndex] = newJob;
        } else {
          updated.push(newJob);
        }
      });
      return updated;
    });
  }, []);

  const handleUrlRemoved = useCallback((urlId: string) => {
    setProcessingJobs(prev => prev.filter(job => job.id !== urlId));
  }, []);

  // YouTube processing handlers
  const handleVideosProcessed = useCallback((videos: any[]) => {
    const newJobs: ProcessingJob[] = videos.map(video => ({
      id: video.id,
      type: 'youtube' as const,
      name: video.metadata?.title || `Video ${video.videoId}`,
      source: video.url,
      status: video.status === 'completed' ? 'completed' : 'processing',
      progress: video.progress,
      startTime: new Date(),
      stages: createProcessingStages('youtube'),
      metadata: {
        wordCount: video.metadata?.transcriptWordCount,
        quality: video.metadata?.quality,
        frameworks: video.metadata?.frameworks,
        chapters: video.metadata?.chapterCount,
        duration: video.metadata?.duration
      },
      contentId: video.contentId
    }));
    
    setProcessingJobs(prev => {
      const updated = [...prev];
      newJobs.forEach(newJob => {
        const existingIndex = updated.findIndex(job => job.id === newJob.id);
        if (existingIndex >= 0) {
          updated[existingIndex] = newJob;
        } else {
          updated.push(newJob);
        }
      });
      return updated;
    });
  }, []);

  const handleVideoRemoved = useCallback((videoId: string) => {
    setProcessingJobs(prev => prev.filter(job => job.id !== videoId));
  }, []);

  // Processing status handlers
  const handleJobRemove = useCallback((jobId: string) => {
    setProcessingJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);

  const handleJobView = useCallback((jobId: string, contentId: string) => {
    window.open(`/oracle/content/${contentId}`, '_blank');
  }, []);

  // Content library handlers
  const handleContentView = useCallback((contentId: string) => {
    window.open(`/oracle/content/${contentId}`, '_blank');
  }, []);

  const handleContentEdit = useCallback((contentId: string) => {
    window.open(`/oracle/content/${contentId}/edit`, '_blank');
  }, []);

  const handleContentDelete = useCallback(async (contentId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this content?');
    if (confirmDelete) {
      try {
        const response = await fetch(`/api/oracle-content/${contentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('oracle_token')}`
          }
        });
        
        if (response.ok) {
          addNotification('success', 'Content deleted successfully');
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        addNotification('error', 'Failed to delete content');
      }
    }
  }, []);

  const handleContentDownload = useCallback(async (contentId: string) => {
    try {
      const response = await fetch(`/api/oracle-content/${contentId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('oracle_token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `oracle-content-${contentId}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        addNotification('success', 'Content exported successfully');
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      addNotification('error', 'Failed to download content');
    }
  }, []);

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'upload': return CloudArrowUpIcon;
      case 'url': return GlobeAltIcon;
      case 'youtube': return VideoCameraIcon;
      case 'status': return ChartBarIcon;
      case 'library': return SparklesIcon;
      default: return CloudArrowUpIcon;
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'upload': return 'Upload Files';
      case 'url': return 'Web Content';
      case 'youtube': return 'YouTube Videos';
      case 'status': return 'Processing Status';
      case 'library': return 'Content Library';
      default: return 'Upload';
    }
  };

  const getActiveJobsCount = () => {
    return processingJobs.filter(job => 
      job.status === 'queued' || job.status === 'processing'
    ).length;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <FileUploadInterface
            onFilesUploaded={handleFilesUploaded}
            onFileRemoved={handleFileRemoved}
            maxFiles={10}
            maxFileSize={100 * 1024 * 1024} // 100MB
          />
        );
      
      case 'url':
        return (
          <UrlProcessingInterface
            onUrlsProcessed={handleUrlsProcessed}
            onUrlRemoved={handleUrlRemoved}
            maxUrls={5}
          />
        );
      
      case 'youtube':
        return (
          <YouTubeProcessingInterface
            onVideosProcessed={handleVideosProcessed}
            onVideoRemoved={handleVideoRemoved}
            maxVideos={3}
          />
        );
      
      case 'status':
        return (
          <ProcessingStatusDisplay
            jobs={processingJobs}
            onJobRemove={handleJobRemove}
            onJobView={handleJobView}
            maxDisplayJobs={20}
            showCompleted={true}
          />
        );
      
      case 'library':
        return (
          <ContentLibraryDashboard
            onContentView={handleContentView}
            onContentEdit={handleContentEdit}
            onContentDelete={handleContentDelete}
            onContentDownload={handleContentDownload}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="oracle-cms">
      <style jsx>{`
        ${mysticalAnimations.fadeInUp}
        ${mysticalAnimations.pulseGlow}
        ${mysticalAnimations.shimmer}
        
        .oracle-cms {
          min-height: 100vh;
          background: linear-gradient(135deg, #0F0F23 0%, #1F1B2E 50%, #2D1B69 100%);
          font-family: ${oracleTheme.typography.bodyFont};
          position: relative;
        }
        
        .cms-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: ${oracleTheme.spacing[8]};
        }
        
        .system-header {
          text-align: center;
          margin-bottom: ${oracleTheme.spacing[12]};
          animation: fadeInUp 0.8s ease-out;
        }
        
        .header-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto ${oracleTheme.spacing[6]};
          color: ${oracleTheme.colors.etherealGold};
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .system-title {
          font-family: ${oracleTheme.typography.displayFont};
          font-size: ${oracleTheme.typography.sizes['5xl']};
          font-weight: ${oracleTheme.typography.weights.bold};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[4]};
          text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
        }
        
        .system-subtitle {
          font-size: ${oracleTheme.typography.sizes.xl};
          color: ${oracleTheme.colors.moonbeamSilver};
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        
        .status-bar {
          background: ${oracleTheme.variants.card.mystical.background};
          backdrop-filter: ${oracleTheme.variants.card.mystical.backdropFilter};
          border: ${oracleTheme.variants.card.mystical.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          padding: ${oracleTheme.spacing[4]} ${oracleTheme.spacing[6]};
          margin-bottom: ${oracleTheme.spacing[8]};
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: ${oracleTheme.spacing[4]};
        }
        
        .status-left {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[4]};
        }
        
        .status-right {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[3]};
        }
        
        .online-status {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
          padding: ${oracleTheme.spacing[2]} ${oracleTheme.spacing[3]};
          border-radius: ${oracleTheme.borders.radius.lg};
          font-size: ${oracleTheme.typography.sizes.sm};
          font-weight: ${oracleTheme.typography.weights.medium};
        }
        
        .status-online {
          background: rgba(16, 185, 129, 0.2);
          color: ${oracleTheme.colors.emeraldWisdom};
        }
        
        .status-offline {
          background: rgba(239, 68, 68, 0.2);
          color: ${oracleTheme.colors.crimsonWarning};
        }
        
        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulseGlow 2s infinite;
        }
        
        .processing-summary {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .active-jobs-badge {
          background: rgba(139, 92, 246, 0.3);
          color: ${oracleTheme.colors.processing};
          padding: ${oracleTheme.spacing[1]} ${oracleTheme.spacing[2]};
          border-radius: ${oracleTheme.borders.radius.full};
          font-size: ${oracleTheme.typography.sizes.xs};
          font-weight: ${oracleTheme.typography.weights.medium};
        }
        
        .tab-navigation {
          background: ${oracleTheme.variants.card.ethereal.background};
          backdrop-filter: ${oracleTheme.variants.card.ethereal.backdropFilter};
          border: ${oracleTheme.variants.card.ethereal.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          padding: ${oracleTheme.spacing[2]};
          margin-bottom: ${oracleTheme.spacing[8]};
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .tab-button {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
          padding: ${oracleTheme.spacing[3]} ${oracleTheme.spacing[6]};
          border: none;
          border-radius: ${oracleTheme.borders.radius.lg};
          background: transparent;
          color: ${oracleTheme.colors.moonbeamSilver};
          font-size: ${oracleTheme.typography.sizes.base};
          font-weight: ${oracleTheme.typography.weights.medium};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.normal};
          position: relative;
        }
        
        .tab-button:hover {
          color: ${oracleTheme.colors.crystallineWhite};
          transform: translateY(-2px);
        }
        
        .tab-button.active {
          background: ${oracleTheme.colors.primaryGradient};
          color: ${oracleTheme.colors.crystallineWhite};
          box-shadow: ${getMysticalShadow('medium')};
        }
        
        .tab-icon {
          width: 20px;
          height: 20px;
        }
        
        .tab-badge {
          position: absolute;
          top: ${oracleTheme.spacing[1]};
          right: ${oracleTheme.spacing[1]};
          background: ${oracleTheme.colors.crimsonWarning};
          color: ${oracleTheme.colors.crystallineWhite};
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${oracleTheme.typography.sizes.xs};
          font-weight: ${oracleTheme.typography.weights.bold};
          animation: pulseGlow 2s infinite;
        }
        
        .content-area {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .notifications {
          position: fixed;
          top: ${oracleTheme.spacing[6]};
          right: ${oracleTheme.spacing[6]};
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: ${oracleTheme.spacing[2]};
          max-width: 400px;
        }
        
        .notification {
          background: ${oracleTheme.variants.card.mystical.background};
          backdrop-filter: ${oracleTheme.variants.card.mystical.backdropFilter};
          border: ${oracleTheme.variants.card.mystical.border};
          border-radius: ${oracleTheme.borders.radius.lg};
          padding: ${oracleTheme.spacing[4]};
          box-shadow: ${getMysticalShadow('medium')};
          animation: slideInRight 0.3s ease-out;
          position: relative;
          overflow: hidden;
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .notification::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }
        
        .notification.success::before {
          background: ${oracleTheme.colors.emeraldWisdom};
        }
        
        .notification.error::before {
          background: ${oracleTheme.colors.crimsonWarning};
        }
        
        .notification.info::before {
          background: ${oracleTheme.colors.sapphireInfo};
        }
        
        .notification-content {
          display: flex;
          align-items: flex-start;
          gap: ${oracleTheme.spacing[3]};
        }
        
        .notification-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: ${oracleTheme.spacing[0.5]};
        }
        
        .notification-success .notification-icon {
          color: ${oracleTheme.colors.emeraldWisdom};
        }
        
        .notification-error .notification-icon {
          color: ${oracleTheme.colors.crimsonWarning};
        }
        
        .notification-info .notification-icon {
          color: ${oracleTheme.colors.sapphireInfo};
        }
        
        .notification-text {
          flex: 1;
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.crystallineWhite};
          line-height: 1.4;
        }
        
        .notification-time {
          font-size: ${oracleTheme.typography.sizes.xs};
          color: ${oracleTheme.colors.stardustGray};
          margin-top: ${oracleTheme.spacing[1]};
        }
        
        @media (max-width: 768px) {
          .cms-container {
            padding: ${oracleTheme.spacing[4]};
          }
          
          .system-title {
            font-size: ${oracleTheme.typography.sizes['3xl']};
          }
          
          .system-subtitle {
            font-size: ${oracleTheme.typography.sizes.lg};
          }
          
          .status-bar {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          
          .tab-navigation {
            padding: ${oracleTheme.spacing[1]};
          }
          
          .tab-button {
            padding: ${oracleTheme.spacing[2]} ${oracleTheme.spacing[4]};
            font-size: ${oracleTheme.typography.sizes.sm};
          }
          
          .notifications {
            top: ${oracleTheme.spacing[4]};
            right: ${oracleTheme.spacing[4]};
            left: ${oracleTheme.spacing[4]};
            max-width: none;
          }
        }
      `}</style>

      <div className="cms-container">
        {/* System Header */}
        <header className="system-header">
          <SparklesIcon className="header-icon" />
          <h1 className="system-title">Oracle Content Sanctuary</h1>
          <p className="system-subtitle">
            Transform your knowledge into searchable wisdom with mystical precision and business intelligence
          </p>
        </header>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="status-left">
            <div className={`online-status ${isOnline ? 'status-online' : 'status-offline'}`}>
              <div 
                className="status-indicator"
                style={{ background: isOnline ? oracleTheme.colors.emeraldWisdom : oracleTheme.colors.crimsonWarning }}
              />
              {isOnline ? 'Oracle Online' : 'Oracle Offline'}
            </div>
            
            <div className="processing-summary">
              Processing Status: 
              {getActiveJobsCount() > 0 ? (
                <span className="active-jobs-badge">
                  {getActiveJobsCount()} Active
                </span>
              ) : (
                <span style={{ color: oracleTheme.colors.emeraldWisdom }}>
                  Ready
                </span>
              )}
            </div>
          </div>
          
          <div className="status-right">
            <span style={{ fontSize: oracleTheme.typography.sizes.sm, color: oracleTheme.colors.moonbeamSilver }}>
              Total Content: {processingJobs.filter(j => j.status === 'completed').length}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="tab-navigation">
          {(['upload', 'url', 'youtube', 'status', 'library'] as TabType[]).map((tab) => {
            const TabIcon = getTabIcon(tab);
            const activeJobs = tab === 'status' ? getActiveJobsCount() : 0;
            
            return (
              <button
                key={tab}
                type="button"
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <TabIcon className="tab-icon" />
                {getTabLabel(tab)}
                {activeJobs > 0 && tab === 'status' && (
                  <span className="tab-badge">{activeJobs}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <main className="content-area">
          {renderTabContent()}
        </main>
      </div>

      {/* Notifications */}
      <div className="notifications">
        {notifications.map((notification) => {
          const NotificationIcon = notification.type === 'success' 
            ? CheckCircleIcon 
            : notification.type === 'error' 
            ? ExclamationTriangleIcon 
            : EyeIcon;
            
          return (
            <div key={notification.id} className={`notification notification-${notification.type}`}>
              <div className="notification-content">
                <NotificationIcon className="notification-icon" />
                <div>
                  <div className="notification-text">{notification.message}</div>
                  <div className="notification-time">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OracleContentManagementSystem;