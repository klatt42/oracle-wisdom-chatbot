/**
 * Oracle Content Library Management Dashboard
 * Dr. Sarah Hook + Elena Execution - Phase 3.5 Oracle Content Management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { oracleTheme, getMysticalShadow, mysticalAnimations } from '../../../styles/oracle-theme';

// Icons
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  StarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ContentItem {
  id: string;
  title: string;
  type: 'file' | 'url' | 'youtube';
  source: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  metadata: {
    wordCount?: number;
    characterCount?: number;
    quality?: number;
    author?: string;
    createdDate?: Date;
    framework?: string[];
    businessRelevance?: {
      overallScore: number;
      frameworkRelevance: Record<string, number>;
      topicCategories: Record<string, number>;
    };
    extractedText?: string;
    summary?: string;
    tags?: string[];
  };
}

interface FilterOptions {
  type: 'all' | 'file' | 'url' | 'youtube';
  framework: string;
  quality: 'all' | 'high' | 'medium' | 'low';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'date' | 'quality' | 'relevance' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface ContentLibraryDashboardProps {
  onContentView: (contentId: string) => void;
  onContentEdit: (contentId: string) => void;
  onContentDelete: (contentId: string) => void;
  onContentDownload: (contentId: string) => void;
}

const ContentLibraryDashboard: React.FC<ContentLibraryDashboardProps> = ({
  onContentView,
  onContentEdit,
  onContentDelete,
  onContentDownload
}) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    framework: 'all',
    quality: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Load content items
  useEffect(() => {
    loadContentItems();
  }, []);

  // Apply filters and search function
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...contentItems];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.metadata.summary?.toLowerCase().includes(query) ||
        item.metadata.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        item.metadata.framework?.some(fw => fw.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    // Apply framework filter
    if (filters.framework !== 'all') {
      filtered = filtered.filter(item =>
        item.metadata.framework?.includes(filters.framework)
      );
    }

    // Apply quality filter
    if (filters.quality !== 'all') {
      const qualityRanges = {
        high: [80, 100],
        medium: [60, 80],
        low: [0, 60]
      };
      const [min, max] = qualityRanges[filters.quality];
      filtered = filtered.filter(item => {
        const quality = item.metadata.quality || 0;
        return quality >= min && quality < max;
      });
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const ranges = {
        today: 1,
        week: 7,
        month: 30,
        year: 365
      };
      const days = ranges[filters.dateRange];
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(item => item.uploadedAt >= cutoff);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'date':
          aValue = a.uploadedAt.getTime();
          bValue = b.uploadedAt.getTime();
          break;
        case 'quality':
          aValue = a.metadata.quality || 0;
          bValue = b.metadata.quality || 0;
          break;
        case 'relevance':
          aValue = a.metadata.businessRelevance?.overallScore || 0;
          bValue = b.metadata.businessRelevance?.overallScore || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          aValue = a.uploadedAt.getTime();
          bValue = b.uploadedAt.getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [contentItems, searchQuery, filters]);

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch();
  }, [contentItems, searchQuery, filters, applyFiltersAndSearch]);

  const loadContentItems = async () => {
    try {
      setLoading(true);
      
      // Call Oracle content library API
      const response = await fetch('/api/oracle-content/library', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('oracle_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load content library');
      }

      const result = await response.json();
      setContentItems(result.data.items || []);
      
    } catch (error) {
      console.error('Error loading content library:', error);
      // Mock data for development
      setContentItems([
        {
          id: '1',
          title: 'Advanced Business Scaling Strategies',
          type: 'file',
          source: 'business-scaling.pdf',
          uploadedAt: new Date('2024-01-15'),
          status: 'completed',
          metadata: {
            wordCount: 5420,
            quality: 92,
            author: 'Alex Hormozi',
            framework: ['Grand Slam Offer', 'Scaling Systems'],
            businessRelevance: {
              overallScore: 88,
              frameworkRelevance: { 'Grand Slam Offer': 85, 'Scaling Systems': 90 },
              topicCategories: { strategy: 95, operations: 85, marketing: 70 }
            },
            summary: 'Comprehensive guide on scaling business operations...',
            tags: ['scaling', 'strategy', 'operations']
          }
        },
        {
          id: '2',
          title: 'The Ultimate Marketing Funnel Blueprint',
          type: 'url',
          source: 'https://example.com/marketing-funnel',
          uploadedAt: new Date('2024-01-10'),
          status: 'completed',
          metadata: {
            wordCount: 3200,
            quality: 85,
            framework: ['Core Four', 'Value Ladder'],
            businessRelevance: {
              overallScore: 82,
              frameworkRelevance: { 'Core Four': 88, 'Value Ladder': 75 },
              topicCategories: { marketing: 92, sales: 78, strategy: 85 }
            },
            summary: 'Step-by-step funnel optimization strategies...',
            tags: ['funnel', 'marketing', 'conversion']
          }
        },
        {
          id: '3',
          title: 'Customer Acquisition Masterclass',
          type: 'youtube',
          source: 'https://youtube.com/watch?v=example',
          uploadedAt: new Date('2024-01-05'),
          status: 'completed',
          metadata: {
            wordCount: 8500,
            quality: 78,
            framework: ['LTV/CAC', 'Core Four'],
            businessRelevance: {
              overallScore: 75,
              frameworkRelevance: { 'LTV/CAC': 82, 'Core Four': 68 },
              topicCategories: { marketing: 85, finance: 75, strategy: 80 }
            },
            summary: 'Comprehensive training on customer acquisition...',
            tags: ['acquisition', 'ltv', 'cac', 'metrics']
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'file': return CloudArrowUpIcon;
      case 'url': return GlobeAltIcon;
      case 'youtube': return VideoCameraIcon;
      default: return DocumentTextIcon;
    }
  };

  const getQualityColor = (quality?: number) => {
    if (!quality) return oracleTheme.colors.stardustGray;
    if (quality >= 80) return oracleTheme.colors.emeraldWisdom;
    if (quality >= 60) return oracleTheme.colors.etherealGold;
    return oracleTheme.colors.amberAlert;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    const currentPageItems = filteredItems
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map(item => item.id);
    setSelectedItems(new Set(currentPageItems));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const deleteSelectedItems = async () => {
    if (selectedItems.size === 0) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedItems.size} item(s)?`
    );
    
    if (confirmDelete) {
      for (const itemId of selectedItems) {
        await onContentDelete(itemId);
      }
      clearSelection();
      loadContentItems();
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const availableFrameworks = [...new Set(
    contentItems.flatMap(item => item.metadata.framework || [])
  )];

  return (
    <div className="content-library-dashboard">
      <style jsx>{`
        ${mysticalAnimations.fadeInUp}
        ${mysticalAnimations.pulseGlow}
        ${mysticalAnimations.shimmer}
        
        .content-library-dashboard {
          font-family: ${oracleTheme.typography.bodyFont};
        }
        
        .dashboard-header {
          background: ${oracleTheme.variants.card.mystical.background};
          backdrop-filter: ${oracleTheme.variants.card.mystical.backdropFilter};
          border: ${oracleTheme.variants.card.mystical.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          padding: ${oracleTheme.spacing[8]};
          margin-bottom: ${oracleTheme.spacing[8]};
          box-shadow: ${getMysticalShadow('light')};
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: ${oracleTheme.spacing[6]};
        }
        
        .header-info {
          flex: 1;
          min-width: 300px;
        }
        
        .header-icon {
          width: 40px;
          height: 40px;
          color: ${oracleTheme.colors.mysticalPurple};
          margin-bottom: ${oracleTheme.spacing[3]};
        }
        
        .header-title {
          font-family: ${oracleTheme.typography.displayFont};
          font-size: ${oracleTheme.typography.sizes['3xl']};
          font-weight: ${oracleTheme.typography.weights.bold};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .header-subtitle {
          font-size: ${oracleTheme.typography.sizes.lg};
          color: ${oracleTheme.colors.moonbeamSilver};
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: ${oracleTheme.spacing[4]};
          margin-top: ${oracleTheme.spacing[4]};
        }
        
        .stat-item {
          text-align: center;
          padding: ${oracleTheme.spacing[3]};
          background: rgba(99, 102, 241, 0.1);
          border-radius: ${oracleTheme.borders.radius.lg};
        }
        
        .stat-value {
          font-size: ${oracleTheme.typography.sizes.xl};
          font-weight: ${oracleTheme.typography.weights.bold};
          color: ${oracleTheme.colors.etherealGold};
          margin-bottom: ${oracleTheme.spacing[1]};
        }
        
        .stat-label {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .controls-section {
          background: ${oracleTheme.variants.card.ethereal.background};
          backdrop-filter: ${oracleTheme.variants.card.ethereal.backdropFilter};
          border: ${oracleTheme.variants.card.ethereal.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          padding: ${oracleTheme.spacing[6]};
          margin-bottom: ${oracleTheme.spacing[6]};
          box-shadow: ${getMysticalShadow('light')};
        }
        
        .search-bar {
          position: relative;
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .search-input {
          width: 100%;
          padding: ${oracleTheme.spacing[4]} ${oracleTheme.spacing[4]} ${oracleTheme.spacing[4]} ${oracleTheme.spacing[12]};
          background: rgba(15, 15, 35, 0.6);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: ${oracleTheme.borders.radius.lg};
          color: ${oracleTheme.colors.crystallineWhite};
          font-size: ${oracleTheme.typography.sizes.base};
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .search-input:focus {
          outline: none;
          border-color: ${oracleTheme.colors.mysticalPurple};
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }
        
        .search-input::placeholder {
          color: ${oracleTheme.colors.stardustGray};
        }
        
        .search-icon {
          position: absolute;
          left: ${oracleTheme.spacing[4]};
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: ${oracleTheme.spacing[4]};
        }
        
        .controls-left {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[4]};
          flex-wrap: wrap;
        }
        
        .controls-right {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[3]};
        }
        
        .filter-toggle {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
          padding: ${oracleTheme.spacing[2]} ${oracleTheme.spacing[4]};
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: ${oracleTheme.borders.radius.lg};
          color: ${oracleTheme.colors.mysticalPurple};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.normal};
        }
        
        .filter-toggle:hover {
          background: rgba(99, 102, 241, 0.2);
        }
        
        .filter-toggle.active {
          background: rgba(99, 102, 241, 0.3);
        }
        
        .bulk-actions {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .selection-info {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
          margin-right: ${oracleTheme.spacing[3]};
        }
        
        .action-button {
          padding: ${oracleTheme.spacing[2]} ${oracleTheme.spacing[3]};
          border: none;
          border-radius: ${oracleTheme.borders.radius.base};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.fast};
          font-size: ${oracleTheme.typography.sizes.sm};
          font-weight: ${oracleTheme.typography.weights.medium};
        }
        
        .action-button.primary {
          background: rgba(99, 102, 241, 0.2);
          color: ${oracleTheme.colors.mysticalPurple};
        }
        
        .action-button.danger {
          background: rgba(239, 68, 68, 0.2);
          color: ${oracleTheme.colors.crimsonWarning};
        }
        
        .action-button:hover {
          transform: translateY(-1px);
        }
        
        .filters-panel {
          margin-top: ${oracleTheme.spacing[4]};
          padding: ${oracleTheme.spacing[4]};
          background: rgba(15, 15, 35, 0.3);
          border-radius: ${oracleTheme.borders.radius.lg};
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: ${oracleTheme.spacing[4]};
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .filter-label {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.crystallineWhite};
          font-weight: ${oracleTheme.typography.weights.medium};
        }
        
        .filter-select {
          padding: ${oracleTheme.spacing[2]} ${oracleTheme.spacing[3]};
          background: rgba(15, 15, 35, 0.6);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: ${oracleTheme.borders.radius.base};
          color: ${oracleTheme.colors.crystallineWhite};
          font-size: ${oracleTheme.typography.sizes.sm};
        }
        
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: ${oracleTheme.spacing[6]};
          margin-bottom: ${oracleTheme.spacing[8]};
        }
        
        .content-item {
          background: ${oracleTheme.variants.card.ethereal.background};
          backdrop-filter: ${oracleTheme.variants.card.ethereal.backdropFilter};
          border: ${oracleTheme.variants.card.ethereal.border};
          border-radius: ${oracleTheme.borders.radius.xl};
          padding: ${oracleTheme.spacing[6]};
          transition: all ${oracleTheme.transitions.normal};
          cursor: pointer;
          position: relative;
          animation: fadeInUp 0.3s ease-out;
        }
        
        .content-item:hover {
          box-shadow: ${getMysticalShadow('medium')};
          transform: translateY(-4px);
        }
        
        .content-item.selected {
          border-color: ${oracleTheme.colors.mysticalPurple};
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }
        
        .item-checkbox {
          position: absolute;
          top: ${oracleTheme.spacing[3]};
          left: ${oracleTheme.spacing[3]};
          width: 20px;
          height: 20px;
          accent-color: ${oracleTheme.colors.mysticalPurple};
        }
        
        .item-header {
          display: flex;
          align-items: flex-start;
          gap: ${oracleTheme.spacing[3]};
          margin-bottom: ${oracleTheme.spacing[4]};
          padding-left: ${oracleTheme.spacing[8]};
        }
        
        .type-icon {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          margin-top: ${oracleTheme.spacing[1]};
        }
        
        .type-file { color: ${oracleTheme.colors.etherealGold}; }
        .type-url { color: ${oracleTheme.colors.mysticalPurple}; }
        .type-youtube { color: ${oracleTheme.colors.crimsonWarning}; }
        
        .item-info {
          flex: 1;
          min-width: 0;
        }
        
        .item-title {
          font-size: ${oracleTheme.typography.sizes.lg};
          font-weight: ${oracleTheme.typography.weights.semibold};
          color: ${oracleTheme.colors.crystallineWhite};
          margin-bottom: ${oracleTheme.spacing[2]};
          line-height: 1.4;
          word-break: break-word;
        }
        
        .item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: ${oracleTheme.spacing[3]};
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
          margin-bottom: ${oracleTheme.spacing[3]};
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[1]};
        }
        
        .quality-badge {
          display: flex;
          align-items: center;
          gap: ${oracleTheme.spacing[1]};
          padding: ${oracleTheme.spacing[1]} ${oracleTheme.spacing[2]};
          border-radius: ${oracleTheme.borders.radius.base};
          font-size: ${oracleTheme.typography.sizes.xs};
          font-weight: ${oracleTheme.typography.weights.medium};
        }
        
        .item-summary {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.stardustGray};
          margin-bottom: ${oracleTheme.spacing[4]};
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .frameworks-list {
          display: flex;
          flex-wrap: wrap;
          gap: ${oracleTheme.spacing[2]};
          margin-bottom: ${oracleTheme.spacing[4]};
        }
        
        .framework-tag {
          padding: ${oracleTheme.spacing[1]} ${oracleTheme.spacing[2]};
          background: rgba(99, 102, 241, 0.2);
          color: ${oracleTheme.colors.mysticalPurple};
          border-radius: ${oracleTheme.borders.radius.base};
          font-size: ${oracleTheme.typography.sizes.xs};
          font-weight: ${oracleTheme.typography.weights.medium};
        }
        
        .item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .upload-date {
          font-size: ${oracleTheme.typography.sizes.xs};
          color: ${oracleTheme.colors.stardustGray};
        }
        
        .action-buttons {
          display: flex;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .icon-button {
          padding: ${oracleTheme.spacing[2]};
          border: none;
          border-radius: ${oracleTheme.borders.radius.base};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.fast};
          background: rgba(99, 102, 241, 0.1);
          color: ${oracleTheme.colors.mysticalPurple};
        }
        
        .icon-button:hover {
          background: rgba(99, 102, 241, 0.2);
          transform: scale(1.1);
        }
        
        .icon-button.danger {
          background: rgba(239, 68, 68, 0.1);
          color: ${oracleTheme.colors.crimsonWarning};
        }
        
        .icon-button.danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: ${oracleTheme.spacing[4]};
          margin-top: ${oracleTheme.spacing[8]};
        }
        
        .pagination-info {
          font-size: ${oracleTheme.typography.sizes.sm};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .pagination-controls {
          display: flex;
          gap: ${oracleTheme.spacing[2]};
        }
        
        .page-button {
          padding: ${oracleTheme.spacing[2]} ${oracleTheme.spacing[3]};
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: ${oracleTheme.borders.radius.base};
          background: rgba(99, 102, 241, 0.1);
          color: ${oracleTheme.colors.mysticalPurple};
          cursor: pointer;
          transition: all ${oracleTheme.transitions.fast};
          font-size: ${oracleTheme.typography.sizes.sm};
        }
        
        .page-button:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.2);
        }
        
        .page-button.active {
          background: ${oracleTheme.colors.mysticalPurple};
          color: ${oracleTheme.colors.crystallineWhite};
        }
        
        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .empty-state {
          text-align: center;
          padding: ${oracleTheme.spacing[16]};
          color: ${oracleTheme.colors.moonbeamSilver};
        }
        
        .empty-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto ${oracleTheme.spacing[4]};
          opacity: 0.5;
        }
        
        .empty-title {
          font-size: ${oracleTheme.typography.sizes.xl};
          font-weight: ${oracleTheme.typography.weights.semibold};
          margin-bottom: ${oracleTheme.spacing[2]};
        }
        
        .empty-subtitle {
          font-size: ${oracleTheme.typography.sizes.base};
        }
      `}</style>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <SparklesIcon className="header-icon" />
            <h1 className="header-title">Oracle Library</h1>
            <p className="header-subtitle">
              Your collection of wisdom, insights, and business knowledge
            </p>
            
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{contentItems.length}</div>
                <div className="stat-label">Total Items</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {contentItems.reduce((sum, item) => sum + (item.metadata.wordCount || 0), 0).toLocaleString()}
                </div>
                <div className="stat-label">Total Words</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {Math.round(contentItems.reduce((sum, item) => sum + (item.metadata.quality || 0), 0) / Math.max(contentItems.length, 1))}%
                </div>
                <div className="stat-label">Avg Quality</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{availableFrameworks.length}</div>
                <div className="stat-label">Frameworks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        {/* Search Bar */}
        <div className="search-bar">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, content, frameworks, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Controls Row */}
        <div className="controls-row">
          <div className="controls-left">
            <button
              type="button"
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon width={16} height={16} />
              Filters
            </button>
            
            {selectedItems.size > 0 && (
              <div className="bulk-actions">
                <span className="selection-info">
                  {selectedItems.size} selected
                </span>
                <button
                  type="button"
                  className="action-button primary"
                  onClick={selectAllItems}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="action-button primary"
                  onClick={clearSelection}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="action-button danger"
                  onClick={deleteSelectedItems}
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
          
          <div className="controls-right">
            <span className="selection-info">
              Showing {paginatedItems.length} of {filteredItems.length} items
            </span>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Type</label>
                <select
                  className="filter-select"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="all">All Types</option>
                  <option value="file">Files</option>
                  <option value="url">Web Pages</option>
                  <option value="youtube">YouTube Videos</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Framework</label>
                <select
                  className="filter-select"
                  value={filters.framework}
                  onChange={(e) => setFilters(prev => ({ ...prev, framework: e.target.value }))}
                >
                  <option value="all">All Frameworks</option>
                  {availableFrameworks.map(framework => (
                    <option key={framework} value={framework}>{framework}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Quality</label>
                <select
                  className="filter-select"
                  value={filters.quality}
                  onChange={(e) => setFilters(prev => ({ ...prev, quality: e.target.value as any }))}
                >
                  <option value="all">All Quality</option>
                  <option value="high">High (80%+)</option>
                  <option value="medium">Medium (60-80%)</option>
                  <option value="low">Low (&lt;60%)</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Date Range</label>
                <select
                  className="filter-select"
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <select
                  className="filter-select"
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                >
                  <option value="date">Upload Date</option>
                  <option value="quality">Quality Score</option>
                  <option value="relevance">Business Relevance</option>
                  <option value="title">Title</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Order</label>
                <select
                  className="filter-select"
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="empty-state">
          <ArrowPathIcon className="empty-icon" />
          <div className="empty-title">Loading Library...</div>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="empty-state">
          <DocumentTextIcon className="empty-icon" />
          <div className="empty-title">No Content Found</div>
          <div className="empty-subtitle">
            {filteredItems.length === 0 && contentItems.length === 0
              ? "Upload your first piece of content to get started"
              : "Try adjusting your search or filters"}
          </div>
        </div>
      ) : (
        <>
          <div className="content-grid">
            {paginatedItems.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              const isSelected = selectedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`content-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => !isSelected && onContentView(item.id)}
                >
                  <input
                    type="checkbox"
                    className="item-checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="item-header">
                    <TypeIcon className={`type-icon type-${item.type}`} />
                    <div className="item-info">
                      <h3 className="item-title">{item.title}</h3>
                      <div className="item-meta">
                        <div className="meta-item">
                          <DocumentTextIcon width={16} height={16} />
                          {item.metadata.wordCount?.toLocaleString() || 0} words
                        </div>
                        <div className="meta-item">
                          <CalendarIcon width={16} height={16} />
                          {formatDate(item.uploadedAt)}
                        </div>
                        {item.metadata.quality && (
                          <div 
                            className="quality-badge"
                            style={{ 
                              background: `${getQualityColor(item.metadata.quality)}20`,
                              color: getQualityColor(item.metadata.quality)
                            }}
                          >
                            <StarIcon width={12} height={12} />
                            {Math.round(item.metadata.quality)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.metadata.summary && (
                    <div className="item-summary">
                      {item.metadata.summary}
                    </div>
                  )}

                  {item.metadata.framework && item.metadata.framework.length > 0 && (
                    <div className="frameworks-list">
                      {item.metadata.framework.map((framework, index) => (
                        <span key={index} className="framework-tag">
                          {framework}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="item-actions">
                    <div className="upload-date">
                      Uploaded {formatDate(item.uploadedAt)}
                    </div>
                    
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="icon-button"
                        title="View Content"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContentView(item.id);
                        }}
                      >
                        <EyeIcon width={16} height={16} />
                      </button>
                      
                      <button
                        type="button"
                        className="icon-button"
                        title="Edit Content"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContentEdit(item.id);
                        }}
                      >
                        <PencilIcon width={16} height={16} />
                      </button>
                      
                      <button
                        type="button"
                        className="icon-button"
                        title="Download Content"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContentDownload(item.id);
                        }}
                      >
                        <ArrowDownTrayIcon width={16} height={16} />
                      </button>
                      
                      <button
                        type="button"
                        className="icon-button danger"
                        title="Delete Content"
                        onClick={(e) => {
                          e.stopPropagation();
                          onContentDelete(item.id);
                        }}
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
              <div className="pagination-controls">
                <button
                  className="page-button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  First
                </button>
                <button
                  className="page-button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      className={`page-button ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  className="page-button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
                <button
                  className="page-button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContentLibraryDashboard;