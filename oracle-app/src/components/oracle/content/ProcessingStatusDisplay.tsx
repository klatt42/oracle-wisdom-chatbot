/**
 * Oracle Real-Time Processing Status Display
 * Dr. Sarah Hook + Elena Execution - Phase 3.5 Oracle Content Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { oracleTheme, getMysticalShadow, mysticalAnimations } from '../../../styles/oracle-theme';

// Icons
import { 
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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

interface ProcessingStatusDisplayProps {
  jobs: ProcessingJob[];
  onJobRemove: (jobId: string) => void;
  onJobView: (jobId: string, contentId: string) => void;
  maxDisplayJobs?: number;
  showCompleted?: boolean;
}

const ProcessingStatusDisplay: React.FC<ProcessingStatusDisplayProps> = ({
  jobs,
  onJobRemove,
  onJobView,
  maxDisplayJobs = 10,
  showCompleted = true
}) => {
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live timers
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getJobIcon = (type: ProcessingJob['type']) => {
    switch (type) {
      case 'file': return CloudArrowUpIcon;
      case 'url': return GlobeAltIcon;
      case 'youtube': return VideoCameraIcon;
      default: return DocumentTextIcon;
    }
  };

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'queued': return ClockIcon;
      case 'processing': return ArrowPathIcon;
      case 'completed': return CheckCircleIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getStageStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return ClockIcon;
      case 'active': 
      case 'processing': return ArrowPathIcon;
      case 'completed': return CheckCircleIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getStatusColor = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'queued': return oracleTheme.colors.stardustGray;
      case 'processing': return oracleTheme.colors.processing;
      case 'completed': return oracleTheme.colors.emeraldWisdom;
      case 'error': return oracleTheme.colors.crimsonWarning;
      default: return oracleTheme.colors.stardustGray;
    }
  };

  const formatDuration = (start: Date, end?: Date): string => {
    const endTime = end || currentTime;
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateOverallProgress = (job: ProcessingJob): number => {
    if (job.status === 'completed') return 100;
    if (job.status === 'error') return 0;
    
    const completedStages = job.stages.filter(s => s.status === 'completed').length;
    const activeStage = job.stages.find(s => s.status === 'active');
    const totalStages = job.stages.length;
    
    if (totalStages === 0) return job.progress;
    
    let progress = (completedStages / totalStages) * 100;
    if (activeStage) {
      progress += (activeStage.progress / totalStages);
    }
    
    return Math.min(100, Math.max(0, progress));
  };

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const filteredJobs = jobs
    .filter(job => showCompleted || job.status !== 'completed')
    .sort((a, b) => {
      // Sort by status priority, then by start time
      const statusOrder = { 'processing': 0, 'queued': 1, 'error': 2, 'completed': 3 };
      const statusDiff = (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
      if (statusDiff !== 0) return statusDiff;
      return b.startTime.getTime() - a.startTime.getTime();
    })
    .slice(0, maxDisplayJobs);

  if (filteredJobs.length === 0) {
    return (
      <div className="processing-status-empty">
        <style jsx>{`
          .processing-status-empty {
            background: ${oracleTheme.variants.card.mystical.background};
            backdrop-filter: ${oracleTheme.variants.card.mystical.backdropFilter};
            border: ${oracleTheme.variants.card.mystical.border};
            border-radius: ${oracleTheme.borders.radius.xl};
            padding: ${oracleTheme.spacing[12]};
            text-align: center;
            color: ${oracleTheme.colors.moonbeamSilver};
          }
          
          .empty-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto ${oracleTheme.spacing[4]};
            opacity: 0.5;
          }
          
          .empty-title {
            font-family: ${oracleTheme.typography.displayFont};
            font-size: ${oracleTheme.typography.sizes.xl};
            margin-bottom: ${oracleTheme.spacing[2]};
          }
          
          .empty-subtitle {
            font-size: ${oracleTheme.typography.sizes.base};
          }
        `}</style>
        
        <ChartBarIcon className="empty-icon" />
        <div className="empty-title">No Active Processing</div>
        <div className="empty-subtitle">
          Upload files or add URLs to see processing status here
        </div>
      </div>
    );
  }

  return (
    <div className="processing-status-display">
      <style jsx>{`
        ${mysticalAnimations.fadeInUp}
        ${mysticalAnimations.pulseGlow}
        ${mysticalAnimations.shimmer}
        
        .processing-status-display {
          font-family: ${oracleTheme.typography.bodyFont};
        }
        
        .status-header {
          background: ${oracleTheme.variants.card.mystical.background};
          backdrop-filter: ${oracleTheme.variants.card.mystical.backdropFilter};
          border: ${oracleTheme.variants.card.mystical.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          padding: ${oracleTheme.spacing[6]};
          margin-bottom: ${oracleTheme.spacing[6]};
          text-align: center;
        }
        
        .header-icon {
          width: 32px;
          height: 32px;
          margin: 0 auto ${oracleTheme.spacing[3]};
          color: ${oracleTheme.colors.mysticalPurple};
        }
        
        .header-title {
          font-family: ${oracleTheme.typography.displayFont};
          font-size: ${oracleTheme.typography.sizes.xl};
          font-weight: ${oracleTheme.typography.weights.semibold};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .header-subtitle {
          font-size: ${oracleTheme.typography.sizes.base};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .job-list {
          display: flex;
          flex-direction: column;
          gap: ${oracleTheme.spacing[4]};
        }
        
        .job-item {
          background: ${oracleTheme.variants.card.ethereal.background};
          backdrop-filter: ${oracleTheme.variants.card.ethereal.backdropFilter};
          border: ${oracleTheme.variants.card.ethereal.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          padding: ${oracleTheme.spacing[6]};
          animation: fadeInUp 0.3s ease-out;
          transition: all ${oracleTheme.transitions.normal};
          cursor: pointer;
        }
        
        .job-item:hover {
          box-shadow: ${getMysticalShadow('medium')};
          transform: translateY(-2px);
        }
        
        .job-item.processing {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          animation: pulseGlow 3s infinite;
        }
        
        .job-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .job-info {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }
        
        .job-type-icon {
          width: 24px;
          height: 24px;
          margin-right: ${oracleTheme.spacing[3]};
          flex-shrink: 0;
        }
        
        .job-type-file { color: ${oracleTheme.colors.etherealGold}; }
        .job-type-url { color: ${oracleTheme.colors.mysticalPurple}; }
        .job-type-youtube { color: ${oracleTheme.colors.crimsonWarning}; }
        
        .job-details {
          flex: 1;
          min-width: 0;
        }
        
        .job-name {
          font-size: ${oracleTheme.typography.sizes.base};
          font-weight: ${oracleTheme.typography.weights.medium};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[1]};
          word-break: break-word;
        }
        
        .job-source {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
          word-break: break-all;
          margin-bottom: ${oracleTheme.spacing[1]};
        }
        
        .job-timing {
          font-size: ${oracleTheme.typography.sizes.xs};
          color: ${oracleTheme.colors.stardustGray};
        }
        
        .job-actions {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .status-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }
        
        .status-processing .status-icon {
          animation: spin 2s linear infinite;
        }
        
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
          white-space: nowrap;
        }
        
        .status-queued { 
          background: rgba(156, 163, 175, 0.2);
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .status-processing { 
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
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .overall-progress {
          margin-bottom: ${oracleTheme.spacing[3]};
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .progress-label {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .progress-percentage {
          font-size: ${oracleTheme.typography.sizes.sm};
          font-weight: ${oracleTheme.typography.weights.medium};
          color: ${oracleTheme.colors.crystallineWhite};
        }
        
        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: ${oracleTheme.borders.radius.full};
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: ${oracleTheme.colors.primaryGradient};
          border-radius: ${oracleTheme.borders.radius.full};
          transition: width 0.5s ease;
        }
        
        .stages-list {
          display: flex;
          flex-direction: column;
          gap: ${oracleTheme.spacing[2]};
          margin-top: ${oracleTheme.spacing[4]};
          padding-top: ${oracleTheme.spacing[4]};
          border-top: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .stage-item {
          display: flex;
          align-items: center;
          padding: ${oracleTheme.spacing[2]} ${oracleTheme.spacing[3]};
          background: rgba(15, 15, 35, 0.3);
          border-radius: ${oracleTheme.borders.radius.lg};
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .stage-item.active {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        
        .stage-item.completed {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        
        .stage-item.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .stage-icon {
          width: 16px;
          height: 16px;
          margin-right: ${oracleTheme.spacing[3]};
          flex-shrink: 0;
        }
        
        .stage-pending .stage-icon { color: ${oracleTheme.colors.stardustGray}; }
        .stage-active .stage-icon { 
          color: ${oracleTheme.colors.processing}; 
          animation: spin 2s linear infinite;
        }
        .stage-completed .stage-icon { color: ${oracleTheme.colors.emeraldWisdom}; }
        .stage-error .stage-icon { color: ${oracleTheme.colors.crimsonWarning}; }
        
        .stage-details {
          flex: 1;
          min-width: 0;
        }
        
        .stage-name {
          font-size: ${oracleTheme.typography.sizes.sm};
          font-weight: ${oracleTheme.typography.weights.medium};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[0.5]};
        }
        
        .stage-description {
          font-size: ${oracleTheme.typography.sizes.xs};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .stage-progress {
          margin-left: auto;
          font-size: ${oracleTheme.typography.sizes.xs};
          color: ${oracleTheme.colors.stardustGray};
          min-width: fit-content;
          padding-left: ${oracleTheme.spacing[2]};
        }
        
        .metadata-section {
          margin-top: ${oracleTheme.spacing[4]};
          padding-top: ${oracleTheme.spacing[4]};
          border-top: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: ${oracleTheme.spacing[3]};
          margin-bottom: ${oracleTheme.spacing[3]};
        }
        
        .metadata-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: ${oracleTheme.spacing[2]};
          background: rgba(99, 102, 241, 0.05);
          border-radius: ${oracleTheme.borders.radius.base};
        }
        
        .metadata-value {
          font-size: ${oracleTheme.typography.sizes.sm};
          font-weight: ${oracleTheme.typography.weights.semibold};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[1]};
        }
        
        .metadata-label {
          font-size: ${oracleTheme.typography.sizes.xs};
          color: ${oracleTheme.colors.moonbeamSilver};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .frameworks-section {
          margin-top: ${oracleTheme.spacing[3]};
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
        
        .error-section {
          margin-top: ${oracleTheme.spacing[4]};
          padding: ${oracleTheme.spacing[3]};
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: ${oracleTheme.borders.radius.lg};
        }
        
        .error-title {
          font-size: ${oracleTheme.typography.sizes.sm};
          font-weight: ${oracleTheme.typography.weights.medium};
          color: ${oracleTheme.colors.crimsonWarning};
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .error-message {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
          word-break: break-word;
        }
      `}</style>

      {/* Header */}
      <div className="status-header">
        <ChartBarIcon className="header-icon" />
        <div className="header-title">Processing Oracle</div>
        <div className="header-subtitle">
          Real-time content processing status
        </div>
      </div>

      {/* Job List */}
      <div className="job-list">
        {filteredJobs.map((job) => {
          const JobIcon = getJobIcon(job.type);
          const StatusIcon = getStatusIcon(job.status);
          const isExpanded = expandedJobs.has(job.id);
          const overallProgress = calculateOverallProgress(job);

          return (
            <div 
              key={job.id} 
              className={`job-item ${job.status} job-type-${job.type}`}
              onClick={() => toggleJobExpansion(job.id)}
            >
              {/* Job Header */}
              <div className="job-header">
                <div className="job-info">
                  <JobIcon className={`job-type-icon job-type-${job.type}`} />
                  <div className="job-details">
                    <div className="job-name">{job.name}</div>
                    <div className="job-source">{job.source}</div>
                    <div className="job-timing">
                      Started {formatDuration(job.startTime)} ago
                      {job.endTime && ` • Took ${formatDuration(job.startTime, job.endTime)}`}
                    </div>
                  </div>
                </div>

                <div className="job-actions">
                  <StatusIcon 
                    className={`status-icon status-${job.status}`} 
                    style={{ color: getStatusColor(job.status) }}
                  />
                  <span className={`status-badge status-${job.status}`}>
                    {job.status}
                  </span>
                  
                  {job.status === 'completed' && job.contentId && (
                    <button
                      type="button"
                      className="action-button"
                      title="View Content"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (job.contentId) {
                          onJobView(job.id, job.contentId);
                        }
                      }}
                    >
                      <EyeIcon width={16} height={16} />
                    </button>
                  )}
                  
                  {(job.status === 'completed' || job.status === 'error') && (
                    <button
                      type="button"
                      className="action-button remove-button"
                      title="Remove Job"
                      onClick={(e) => {
                        e.stopPropagation();
                        onJobRemove(job.id);
                      }}
                    >
                      <XMarkIcon width={16} height={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              {(job.status === 'processing' || job.status === 'queued') && (
                <div className="progress-section">
                  <div className="overall-progress">
                    <div className="progress-header">
                      <span className="progress-label">Overall Progress</span>
                      <span className="progress-percentage">
                        {Math.round(overallProgress)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stages List (Expanded) */}
              {isExpanded && job.stages.length > 0 && (
                <div className="stages-list">
                  {job.stages.map((stage) => {
                    const StageStatusIcon = getStageStatusIcon(stage.status);
                    
                    return (
                      <div 
                        key={stage.id} 
                        className={`stage-item stage-${stage.status}`}
                      >
                        <StageStatusIcon className={`stage-icon stage-${stage.status}`} />
                        <div className="stage-details">
                          <div className="stage-name">{stage.name}</div>
                          <div className="stage-description">{stage.description}</div>
                        </div>
                        {stage.status === 'active' && (
                          <div className="stage-progress">
                            {Math.round(stage.progress)}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Metadata Section (Expanded & Completed) */}
              {isExpanded && job.metadata && job.status === 'completed' && (
                <div className="metadata-section">
                  <div className="metadata-grid">
                    {job.metadata.fileSize && (
                      <div className="metadata-item">
                        <div className="metadata-value">
                          {formatFileSize(job.metadata.fileSize)}
                        </div>
                        <div className="metadata-label">Size</div>
                      </div>
                    )}
                    
                    {job.metadata.wordCount && (
                      <div className="metadata-item">
                        <div className="metadata-value">
                          {job.metadata.wordCount.toLocaleString()}
                        </div>
                        <div className="metadata-label">Words</div>
                      </div>
                    )}
                    
                    {job.metadata.quality && (
                      <div className="metadata-item">
                        <div className="metadata-value">
                          {Math.round(job.metadata.quality)}%
                        </div>
                        <div className="metadata-label">Quality</div>
                      </div>
                    )}
                    
                    {job.metadata.chapters && (
                      <div className="metadata-item">
                        <div className="metadata-value">
                          {job.metadata.chapters}
                        </div>
                        <div className="metadata-label">Chapters</div>
                      </div>
                    )}
                    
                    {job.metadata.duration && (
                      <div className="metadata-item">
                        <div className="metadata-value">
                          {job.metadata.duration}
                        </div>
                        <div className="metadata-label">Duration</div>
                      </div>
                    )}
                  </div>
                  
                  {job.metadata.frameworks && job.metadata.frameworks.length > 0 && (
                    <div className="frameworks-section">
                      <div className="metadata-label">Detected Frameworks:</div>
                      <div className="frameworks-list">
                        {job.metadata.frameworks.map((framework, index) => (
                          <span key={index} className="framework-tag">
                            {framework}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Section */}
              {job.error && job.status === 'error' && (
                <div className="error-section">
                  <div className="error-title">Processing Error</div>
                  <div className="error-message">{job.error}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingStatusDisplay;