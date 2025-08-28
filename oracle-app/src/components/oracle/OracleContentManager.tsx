'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Upload, 
  File, 
  FileText, 
  Link, 
  Youtube, 
  BookOpen, 
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Zap,
  Database,
  Globe,
  Video,
  AlertCircle,
  RefreshCw,
  Archive,
  Star,
  TrendingUp
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'txt' | 'md' | 'url' | 'youtube';
  source: string;
  size?: number;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  wordCount?: number;
  extractedChunks?: number;
  embeddings?: number;
  framework?: string[];
  quality?: number;
  error?: string;
}

interface ProcessingStats {
  totalFiles: number;
  completedFiles: number;
  totalWordCount: number;
  totalChunks: number;
  totalEmbeddings: number;
  averageQuality: number;
}

export function OracleContentManager() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pdf' | 'docx' | 'txt' | 'md' | 'url' | 'youtube'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'uploading' | 'processing' | 'completed' | 'error'>('all');
  const [showUploadZone, setShowUploadZone] = useState(true);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    totalFiles: 0,
    completedFiles: 0,
    totalWordCount: 0,
    totalChunks: 0,
    totalEmbeddings: 0,
    averageQuality: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Simulate content processing
  const simulateProcessing = useCallback((itemId: string) => {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      
      if (progress >= 100) {
        setContentItems(prev => prev.map(item => 
          item.id === itemId 
            ? {
                ...item,
                status: 'completed',
                progress: 100,
                processedAt: new Date(),
                wordCount: Math.floor(Math.random() * 5000) + 500,
                extractedChunks: Math.floor(Math.random() * 50) + 10,
                embeddings: Math.floor(Math.random() * 100) + 20,
                quality: Math.floor(Math.random() * 30) + 70,
                framework: ['Grand Slam Offer', 'Core Four'][Math.floor(Math.random() * 2)] ? 
                  ['Grand Slam Offer'] : ['Core Four', 'Value Ladder']
              }
            : item
        ));
        clearInterval(progressInterval);
      } else {
        setContentItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, progress: Math.min(progress, 100) }
            : item
        ));
      }
    }, 200 + Math.random() * 300);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const supportedTypes = ['.pdf', '.docx', '.txt', '.md'];
    
    fileArray.forEach(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (supportedTypes.includes(fileExtension)) {
        const newItem: ContentItem = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: file.name,
          type: fileExtension.slice(1) as 'pdf' | 'docx' | 'txt' | 'md',
          source: file.name,
          size: file.size,
          uploadedAt: new Date(),
          status: 'uploading',
          progress: 0
        };

        setContentItems(prev => [...prev, newItem]);
        
        // Simulate upload progress
        let uploadProgress = 0;
        const uploadInterval = setInterval(() => {
          uploadProgress += Math.random() * 20 + 10;
          
          if (uploadProgress >= 100) {
            setContentItems(prev => prev.map(item => 
              item.id === newItem.id 
                ? { ...item, status: 'processing', progress: 0 }
                : item
            ));
            clearInterval(uploadInterval);
            // Start processing simulation
            setTimeout(() => simulateProcessing(newItem.id), 500);
          } else {
            setContentItems(prev => prev.map(item => 
              item.id === newItem.id 
                ? { ...item, progress: Math.min(uploadProgress, 100) }
                : item
            ));
          }
        }, 150);
      }
    });
  }, [simulateProcessing]);

  // Handle URL processing
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    const newItem: ContentItem = {
      id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `Web Article: ${urlInput}`,
      type: 'url',
      source: urlInput,
      uploadedAt: new Date(),
      status: 'processing',
      progress: 0
    };

    setContentItems(prev => [...prev, newItem]);
    setUrlInput('');
    
    // Start processing simulation
    setTimeout(() => simulateProcessing(newItem.id), 1000);
  };

  // Handle YouTube processing
  const handleYoutubeSubmit = async () => {
    if (!youtubeInput.trim()) return;
    
    const videoId = youtubeInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    const title = videoId ? `YouTube Video: ${videoId}` : `YouTube: ${youtubeInput}`;
    
    const newItem: ContentItem = {
      id: `youtube_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      type: 'youtube',
      source: youtubeInput,
      uploadedAt: new Date(),
      status: 'processing',
      progress: 0
    };

    setContentItems(prev => [...prev, newItem]);
    setYoutubeInput('');
    
    // Start processing simulation
    setTimeout(() => simulateProcessing(newItem.id), 1500);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Filter content items
  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Update processing stats
  useEffect(() => {
    const stats = contentItems.reduce((acc, item) => {
      acc.totalFiles++;
      if (item.status === 'completed') {
        acc.completedFiles++;
        acc.totalWordCount += item.wordCount || 0;
        acc.totalChunks += item.extractedChunks || 0;
        acc.totalEmbeddings += item.embeddings || 0;
        acc.averageQuality = (acc.averageQuality + (item.quality || 0)) / acc.completedFiles;
      }
      return acc;
    }, {
      totalFiles: 0,
      completedFiles: 0,
      totalWordCount: 0,
      totalChunks: 0,
      totalEmbeddings: 0,
      averageQuality: 0
    });
    
    setProcessingStats(stats);
  }, [contentItems]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Upload className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-400" />;
      case 'docx':
        return <File className="w-5 h-5 text-blue-400" />;
      case 'txt':
      case 'md':
        return <BookOpen className="w-5 h-5 text-green-400" />;
      case 'url':
        return <Globe className="w-5 h-5 text-purple-400" />;
      case 'youtube':
        return <Video className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="oracle-card p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Database className="w-10 h-10 text-yellow-400 oracle-glow" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <h1 className="oracle-title text-3xl font-bold bg-gradient-to-r from-yellow-400 to-blue-300 bg-clip-text text-transparent">
                ORACLE KNOWLEDGE FORGE
              </h1>
              <p className="oracle-text text-sm opacity-80">
                Channel wisdom into the Oracle's consciousness through mystical content ingestion
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadZone(!showUploadZone)}
            className="oracle-button-secondary px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showUploadZone ? 'Hide Upload' : 'Show Upload'}
          </button>
        </div>

        {/* Processing Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="oracle-card p-3 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Archive className="w-4 h-4 text-blue-400" />
              <span className="text-xs oracle-text opacity-80">Total Files</span>
            </div>
            <div className="text-lg font-bold text-blue-300 oracle-glow">
              {processingStats.totalFiles}
            </div>
          </div>
          <div className="oracle-card p-3 bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs oracle-text opacity-80">Processed</span>
            </div>
            <div className="text-lg font-bold text-green-300 oracle-glow">
              {processingStats.completedFiles}
            </div>
          </div>
          <div className="oracle-card p-3 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="text-xs oracle-text opacity-80">Word Count</span>
            </div>
            <div className="text-lg font-bold text-purple-300 oracle-glow">
              {processingStats.totalWordCount.toLocaleString()}
            </div>
          </div>
          <div className="oracle-card p-3 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs oracle-text opacity-80">Chunks</span>
            </div>
            <div className="text-lg font-bold text-yellow-300 oracle-glow">
              {processingStats.totalChunks.toLocaleString()}
            </div>
          </div>
          <div className="oracle-card p-3 bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-xs oracle-text opacity-80">Embeddings</span>
            </div>
            <div className="text-lg font-bold text-red-300 oracle-glow">
              {processingStats.totalEmbeddings.toLocaleString()}
            </div>
          </div>
          <div className="oracle-card p-3 bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-orange-400" />
              <span className="text-xs oracle-text opacity-80">Quality</span>
            </div>
            <div className="text-lg font-bold text-orange-300 oracle-glow">
              {processingStats.averageQuality.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      {showUploadZone && (
        <div className="oracle-card p-6 space-y-6">
          {/* File Upload */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragging 
                ? 'border-yellow-400 bg-yellow-400/10 transform scale-105' 
                : 'border-yellow-400/30 hover:border-yellow-400/50 hover:bg-yellow-400/5'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Upload className={`w-16 h-16 ${isDragging ? 'text-yellow-400 oracle-glow' : 'text-yellow-400/70'} transition-all`} />
                {isDragging && (
                  <div className="absolute inset-0 w-16 h-16 text-yellow-400 animate-ping opacity-30">
                    <Upload className="w-full h-full" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="oracle-title text-xl mb-2">
                  Drop Sacred Texts Here
                </h3>
                <p className="oracle-text opacity-80 mb-4">
                  Drag and drop your files, or click to select
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs oracle-text opacity-60">
                  <span className="px-2 py-1 bg-red-500/20 rounded">PDF</span>
                  <span className="px-2 py-1 bg-blue-500/20 rounded">DOCX</span>
                  <span className="px-2 py-1 bg-green-500/20 rounded">TXT</span>
                  <span className="px-2 py-1 bg-purple-500/20 rounded">MD</span>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* URL and YouTube Inputs */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* URL Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link className="w-5 h-5 text-purple-400" />
                <h3 className="oracle-title text-lg">Web Article Divination</h3>
              </div>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article..."
                  className="oracle-input flex-1 px-4 py-3"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="oracle-button px-6 py-3 disabled:opacity-50"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Invoke
                </button>
              </div>
            </div>

            {/* YouTube Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-400" />
                <h3 className="oracle-title text-lg">Video Wisdom Extraction</h3>
              </div>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="oracle-input flex-1 px-4 py-3"
                />
                <button
                  onClick={handleYoutubeSubmit}
                  disabled={!youtubeInput.trim()}
                  className="oracle-button px-6 py-3 disabled:opacity-50"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Extract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Library */}
      <div className="oracle-card p-6">
        {/* Library Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="oracle-title text-2xl">Sacred Knowledge Library</h2>
          <div className="oracle-text text-sm opacity-60">
            {filteredItems.length} items {filteredItems.length !== contentItems.length && `of ${contentItems.length} total`}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge..."
              className="oracle-input w-full pl-10 pr-4 py-2"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="oracle-input px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="docx">Word Documents</option>
            <option value="txt">Text Files</option>
            <option value="md">Markdown Files</option>
            <option value="url">Web Articles</option>
            <option value="youtube">YouTube Videos</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="oracle-input px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="uploading">Uploading</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Content Items */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4 opacity-50" />
              <p className="oracle-text opacity-60">
                {contentItems.length === 0 
                  ? 'No sacred texts have been channeled yet. Begin your knowledge ritual above.'
                  : 'No content matches your search criteria. Adjust your mystical filters.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="oracle-card p-4 hover:bg-blue-500/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Type Icon */}
                    <div className="flex-shrink-0">
                      {getTypeIcon(item.type)}
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="oracle-text font-medium truncate">
                          {item.title}
                        </h3>
                        {item.status === 'completed' && item.framework && (
                          <div className="flex gap-1">
                            {item.framework.map((fw, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 text-xs bg-yellow-400/20 text-yellow-300 rounded framework-tag"
                              >
                                {fw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs oracle-text opacity-60">
                        <span>{item.source}</span>
                        {item.size && <span>{formatFileSize(item.size)}</span>}
                        <span>{item.uploadedAt.toLocaleDateString()}</span>
                        {item.status === 'completed' && (
                          <>
                            {item.wordCount && <span>{item.wordCount.toLocaleString()} words</span>}
                            {item.quality && <span>{item.quality}% quality</span>}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className="text-sm oracle-text capitalize">{item.status}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      {(item.status === 'uploading' || item.status === 'processing') && (
                        <div className="w-24">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300 oracle-glow"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <div className="text-xs oracle-text opacity-60 mt-1">
                            {Math.round(item.progress)}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status === 'completed' && (
                        <>
                          <button className="p-2 hover:bg-blue-500/20 rounded transition-colors">
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          <button className="p-2 hover:bg-green-500/20 rounded transition-colors">
                            <Download className="w-4 h-4 text-green-400" />
                          </button>
                        </>
                      )}
                      {item.status === 'error' && (
                        <button className="p-2 hover:bg-yellow-500/20 rounded transition-colors">
                          <RefreshCw className="w-4 h-4 text-yellow-400" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-red-500/20 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {item.status === 'error' && item.error && (
                  <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-200">{item.error}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}