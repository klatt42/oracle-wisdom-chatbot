/**
 * Oracle Mystical File Upload Interface
 * Dr. Sarah Hook + Elena Execution - Phase 3.5 Oracle Content Management
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { oracleTheme, getMysticalShadow, mysticalAnimations } from '../../../styles/oracle-theme';

// Icons
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  FilmIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface FileUploadItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  preview?: string;
  contentId?: string;
}

interface FileUploadInterfaceProps {
  onFilesUploaded: (files: FileUploadItem[]) => void;
  onFileRemoved: (fileId: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
};

const FileUploadInterface: React.FC<FileUploadInterfaceProps> = ({
  onFilesUploaded,
  onFileRemoved,
  acceptedFileTypes = Object.keys(ACCEPTED_FILE_TYPES),
  maxFileSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: FileUploadItem[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending' as const,
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Start upload process
    await processFiles(newFiles);
  }, []);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = ACCEPTED_FILE_TYPES[type] || [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    maxFiles: maxFiles - uploadedFiles.length,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  const processFiles = async (files: FileUploadItem[]) => {
    setIsUploading(true);
    
    for (const fileItem of files) {
      try {
        // Update status to uploading
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading' } : f
        ));

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress } : f
          ));
        }

        // Create FormData for API call
        const formData = new FormData();
        formData.append('files', fileItem.file);
        formData.append('options', JSON.stringify({
          extractFrameworks: true,
          generateSummary: true,
          quality: 'high'
        }));

        // Call Oracle upload API
        const response = await fetch('/api/oracle-content/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('oracle_token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Update status to processing
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'processing',
            contentId: result.data.results[0]?.id
          } : f
        ));

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mark as completed
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'completed' } : f
        ));

      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ));
      }
    }

    setIsUploading(false);
    onFilesUploaded(uploadedFiles);
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemoved(fileId);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return PhotoIcon;
    if (file.type.startsWith('video/')) return FilmIcon;
    return DocumentTextIcon;
  };

  const getFileTypeLabel = (file: File) => {
    if (file.type.includes('pdf')) return 'PDF Document';
    if (file.type.includes('word')) return 'Word Document';
    if (file.type.includes('text')) return 'Text File';
    if (file.type.startsWith('image/')) return 'Image File';
    return 'Document';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="oracle-file-upload">
      <style jsx>{`
        ${mysticalAnimations.fadeInUp}
        ${mysticalAnimations.pulseGlow}
        ${mysticalAnimations.shimmer}
        
        .oracle-file-upload {
          font-family: ${oracleTheme.typography.bodyFont};
        }
        
        .upload-zone {
          background: ${oracleTheme.variants.card.mystical.background};
          backdrop-filter: ${oracleTheme.variants.card.mystical.backdropFilter};
          border: 2px dashed ${isDragActive ? oracleTheme.colors.etherealGold : 'rgba(99, 102, 241, 0.3)'};
          border-radius: ${oracleTheme.borders.radius.xl};
          box-shadow: ${getMysticalShadow('light')};
          transition: all ${oracleTheme.transitions.normal};
          position: relative;
          overflow: hidden;
        }
        
        .upload-zone:hover {
          border-color: ${oracleTheme.colors.mysticalPurple};
          box-shadow: ${getMysticalShadow('medium')};
          transform: translateY(-2px);
        }
        
        .upload-zone.drag-active {
          border-color: ${oracleTheme.colors.etherealGold};
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
          animation: pulseGlow 2s infinite;
        }
        
        .upload-zone.drag-accept {
          border-color: ${oracleTheme.colors.emeraldWisdom};
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%);
        }
        
        .upload-zone.drag-reject {
          border-color: ${oracleTheme.colors.crimsonWarning};
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.1) 100%);
        }
        
        .upload-content {
          padding: ${oracleTheme.spacing[12]};
          text-align: center;
          position: relative;
          z-index: 2;
        }
        
        .upload-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto ${oracleTheme.spacing[6]};
          color: ${oracleTheme.colors.mysticalPurple};
          opacity: 0.8;
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .upload-zone:hover .upload-icon {
          color: ${oracleTheme.colors.etherealGold};
          opacity: 1;
          transform: scale(1.1);
        }
        
        .upload-title {
          font-family: ${oracleTheme.typography.displayFont};
          font-size: ${oracleTheme.typography.sizes['2xl']};
          font-weight: ${oracleTheme.typography.weights.semibold};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .upload-subtitle {
          font-size: ${oracleTheme.typography.sizes.lg};
          color: ${oracleTheme.colors.moonbeamSilver};
          margin-bottom: ${oracleTheme.spacing[6]};
        }
        
        .upload-details {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.stardustGray};
          margin-bottom: ${oracleTheme.spacing[8]};
        }
        
        .mystical-button {
          background: ${oracleTheme.variants.button.primary.background};
          color: ${oracleTheme.variants.button.primary.color};
          border: none;
          border-radius: ${oracleTheme.borders.radius.lg};
          padding: ${oracleTheme.spacing[3]} ${oracleTheme.spacing[6]};
          font-size: ${oracleTheme.typography.sizes.base};
          font-weight: ${oracleTheme.typography.weights.medium};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.normal};
          box-shadow: ${oracleTheme.variants.button.primary.boxShadow};
        }
        
        .mystical-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
        }
        
        .mystical-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .file-list {
          margin-top: ${oracleTheme.spacing[8]};
          space-y: ${oracleTheme.spacing[4]};
        }
        
        .file-item {
          background: ${oracleTheme.variants.card.ethereal.background};
          backdrop-filter: ${oracleTheme.variants.card.ethereal.backdropFilter};
          border: ${oracleTheme.variants.card.ethereal.border};
          border-radius: ${oracleTheme.borders.radius.lg};
          padding: ${oracleTheme.spacing[4]};
          margin-bottom: ${oracleTheme.spacing[4]};
          animation: fadeInUp 0.3s ease-out;
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .file-item:hover {
          box-shadow: ${getMysticalShadow('medium')};
          transform: translateY(-1px);
        }
        
        .file-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .file-details {
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .file-icon {
          width: 24px;
          height: 24px;
          color: ${oracleTheme.colors.mysticalPurple};
          margin-right: ${oracleTheme.spacing[3]};
        }
        
        .file-meta {
          flex: 1;
        }
        
        .file-name {
          font-size: ${oracleTheme.typography.sizes.base};
          font-weight: ${oracleTheme.typography.weights.medium};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[1]};
          word-break: break-word;
        }
        
        .file-info-text {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
          display: flex;
          gap: ${oracleTheme.spacing[4]};
        }
        
        .file-actions {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .status-badge {
          padding: ${oracleTheme.spacing[1]} ${oracleTheme.spacing[2]};
          border-radius: ${oracleTheme.borders.radius.base};
          font-size: ${oracleTheme.typography.sizes.xs};
          font-weight: ${oracleTheme.typography.weights.medium};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-pending {
          background: rgba(156, 163, 175, 0.2);
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .status-uploading, .status-processing {
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
        
        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: ${oracleTheme.borders.radius.full};
          overflow: hidden;
          margin-top: ${oracleTheme.spacing[2]};
        }
        
        .progress-fill {
          height: 100%;
          background: ${oracleTheme.colors.primaryGradient};
          border-radius: ${oracleTheme.borders.radius.full};
          transition: width 0.3s ease;
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
        
        .preview-image {
          width: 48px;
          height: 48px;
          border-radius: ${oracleTheme.borders.radius.md};
          object-fit: cover;
          margin-right: ${oracleTheme.spacing[3]};
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        
        .error-message {
          color: ${oracleTheme.colors.crimsonWarning};
          font-size: ${oracleTheme.typography.sizes.sm};
          margin-top: ${oracleTheme.spacing[1]};
        }
      `}</style>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'drag-active' : ''} ${isDragAccept ? 'drag-accept' : ''} ${isDragReject ? 'drag-reject' : ''}`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="upload-content">
          <CloudArrowUpIcon className="upload-icon" />
          <h3 className="upload-title">
            {isDragActive ? 'Release to Upload' : 'Upload Sacred Texts'}
          </h3>
          <p className="upload-subtitle">
            Drag & drop your wisdom here, or click to select files
          </p>
          <div className="upload-details">
            <p>Supports: PDF, Word, Text, Images</p>
            <p>Maximum size: {formatFileSize(maxFileSize)} per file</p>
            <p>Up to {maxFiles} files at once</p>
          </div>
          <button 
            type="button" 
            className="mystical-button"
            disabled={isUploading || uploadedFiles.length >= maxFiles}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {isUploading ? 'Processing...' : 'Choose Files'}
          </button>
        </div>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="file-list">
          {uploadedFiles.map((fileItem) => {
            const FileIcon = getFileIcon(fileItem.file);
            
            return (
              <div key={fileItem.id} className="file-item">
                <div className="file-info">
                  <div className="file-details">
                    {fileItem.preview ? (
                      <img 
                        src={fileItem.preview} 
                        alt="Preview" 
                        className="preview-image" 
                      />
                    ) : (
                      <FileIcon className="file-icon" />
                    )}
                    <div className="file-meta">
                      <div className="file-name">{fileItem.file.name}</div>
                      <div className="file-info-text">
                        <span>{getFileTypeLabel(fileItem.file)}</span>
                        <span>{formatFileSize(fileItem.file.size)}</span>
                      </div>
                      {fileItem.error && (
                        <div className="error-message">{fileItem.error}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="file-actions">
                    <span className={`status-badge status-${fileItem.status}`}>
                      {fileItem.status}
                    </span>
                    
                    {fileItem.status === 'completed' && fileItem.contentId && (
                      <button
                        type="button"
                        className="action-button"
                        title="View Content"
                        onClick={() => {
                          // Navigate to content view
                          window.open(`/oracle/content/${fileItem.contentId}`, '_blank');
                        }}
                      >
                        <EyeIcon width={16} height={16} />
                      </button>
                    )}
                    
                    <button
                      type="button"
                      className="action-button remove-button"
                      title="Remove File"
                      onClick={() => removeFile(fileItem.id)}
                      disabled={fileItem.status === 'uploading'}
                    >
                      <XMarkIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
                
                {(fileItem.status === 'uploading' || fileItem.status === 'processing') && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${fileItem.progress}%` }}
                    />
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

export default FileUploadInterface;