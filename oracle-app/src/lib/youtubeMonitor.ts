import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import type { ProcessingResult, ExtractedVideoContent } from './youtubeTranscriptExtractor';
import type { BatchProcessingResult } from './youtubeProcessor';

// Interface for processing history
export interface ProcessingHistory {
  runs: ProcessingRun[];
  totalVideosProcessed: number;
  totalChunksGenerated: number;
  averageProcessingTime: number;
  lastRunAt: string;
  successRate: number;
}

export interface ProcessingRun {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalFiles: number;
  successfulExtractions: number;
  failedExtractions: number;
  totalChunks: number;
  errors: string[];
  topicDistribution: Record<string, number>;
  frameworkDistribution: Record<string, number>;
}

// Interface for video processing status
export interface VideoStatus {
  videoId: string;
  url: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastAttempt: string;
  attempts: number;
  chunks: number;
  error?: string;
  extractedContent?: Partial<ExtractedVideoContent>;
}

// YouTube processing monitor
export class YouTubeProcessingMonitor {
  private historyFile: string;
  private statusFile: string;
  private logFile: string;

  constructor(outputDir: string = 'temp/transcripts') {
    this.historyFile = join(outputDir, 'processing_history.json');
    this.statusFile = join(outputDir, 'video_status.json');
    this.logFile = join(outputDir, 'processing.log');
  }

  // Start monitoring a batch processing run
  startBatchRun(): string {
    const runId = `run_${Date.now()}`;
    this.log(`🚀 Starting batch processing run: ${runId}`);
    return runId;
  }

  // Complete monitoring of batch processing run
  completeBatchRun(runId: string, result: BatchProcessingResult): void {
    const endTime = new Date().toISOString();
    const duration = result.summary.processingTime;

    const run: ProcessingRun = {
      id: runId,
      startTime: new Date(Date.now() - duration).toISOString(),
      endTime,
      duration,
      totalFiles: result.totalFiles,
      successfulExtractions: result.successfulExtractions,
      failedExtractions: result.failedExtractions,
      totalChunks: result.totalChunksProcessed,
      errors: result.errors,
      topicDistribution: result.summary.topicDistribution,
      frameworkDistribution: result.summary.frameworkDistribution
    };

    // Update processing history
    this.updateProcessingHistory(run);
    
    // Update video statuses
    result.results.forEach(r => this.updateVideoStatus(r));

    this.log(`✅ Completed batch processing run: ${runId}`);
    this.log(`📊 Results: ${result.successfulExtractions}/${result.totalFiles} successful, ${result.totalChunksProcessed} chunks generated`);
  }

  // Update video processing status
  updateVideoStatus(result: ProcessingResult): void {
    const statuses = this.loadVideoStatuses();
    
    const status: VideoStatus = {
      videoId: result.videoId,
      url: result.filePath || `https://youtube.com/watch?v=${result.videoId}`,
      title: result.videoId, // Will be enhanced with actual title
      status: result.success ? 'completed' : 'failed',
      lastAttempt: new Date().toISOString(),
      attempts: (statuses[result.videoId]?.attempts || 0) + 1,
      chunks: result.chunksProcessed,
      error: result.error
    };

    statuses[result.videoId] = status;
    this.saveVideoStatuses(statuses);
  }

  // Get processing statistics
  getProcessingStats(): {
    history: ProcessingHistory;
    recentRuns: ProcessingRun[];
    failedVideos: VideoStatus[];
    successfulVideos: VideoStatus[];
  } {
    const history = this.loadProcessingHistory();
    const statuses = this.loadVideoStatuses();

    const recentRuns = history.runs
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);

    const statusArray = Object.values(statuses);
    const failedVideos = statusArray.filter(v => v.status === 'failed');
    const successfulVideos = statusArray.filter(v => v.status === 'completed');

    return {
      history,
      recentRuns,
      failedVideos,
      successfulVideos
    };
  }

  // Generate processing report
  generateReport(): string {
    const stats = this.getProcessingStats();
    const { history, recentRuns, failedVideos, successfulVideos } = stats;

    let report = '🔮 ORACLE YOUTUBE PROCESSING REPORT\n';
    report += '=====================================\n\n';

    // Overall statistics
    report += '📊 OVERALL STATISTICS\n';
    report += '---------------------\n';
    report += `Total Processing Runs: ${history.runs.length}\n`;
    report += `Total Videos Processed: ${history.totalVideosProcessed}\n`;
    report += `Total Wisdom Chunks Generated: ${history.totalChunksGenerated}\n`;
    report += `Average Processing Time: ${(history.averageProcessingTime / 1000).toFixed(2)}s\n`;
    report += `Success Rate: ${(history.successRate * 100).toFixed(1)}%\n`;
    report += `Last Run: ${history.lastRunAt}\n\n`;

    // Recent runs
    if (recentRuns.length > 0) {
      report += '📈 RECENT PROCESSING RUNS\n';
      report += '-------------------------\n';
      recentRuns.forEach((run, index) => {
        const date = new Date(run.startTime).toLocaleString();
        const successRate = run.totalFiles > 0 ? (run.successfulExtractions / run.totalFiles * 100).toFixed(1) : '0';
        report += `${index + 1}. ${date} - ${run.successfulExtractions}/${run.totalFiles} successful (${successRate}%) - ${run.totalChunks} chunks\n`;
      });
      report += '\n';
    }

    // Content distribution
    const latestRun = recentRuns[0];
    if (latestRun && Object.keys(latestRun.topicDistribution).length > 0) {
      report += '📋 CONTENT TOPIC DISTRIBUTION\n';
      report += '-----------------------------\n';
      Object.entries(latestRun.topicDistribution)
        .sort((a, b) => b[1] - a[1])
        .forEach(([topic, count]) => {
          report += `${topic}: ${count}\n`;
        });
      report += '\n';
    }

    // Successful videos
    if (successfulVideos.length > 0) {
      report += `✅ SUCCESSFUL EXTRACTIONS (${successfulVideos.length})\n`;
      report += '--------------------------------\n';
      successfulVideos
        .sort((a, b) => b.chunks - a.chunks)
        .slice(0, 10)
        .forEach(video => {
          const date = new Date(video.lastAttempt).toLocaleDateString();
          report += `${video.videoId} - ${video.chunks} chunks (${date})\n`;
        });
      
      if (successfulVideos.length > 10) {
        report += `... and ${successfulVideos.length - 10} more\n`;
      }
      report += '\n';
    }

    // Failed videos
    if (failedVideos.length > 0) {
      report += `❌ FAILED EXTRACTIONS (${failedVideos.length})\n`;
      report += '----------------------------\n';
      failedVideos.forEach(video => {
        const date = new Date(video.lastAttempt).toLocaleDateString();
        report += `${video.videoId} - ${video.error || 'Unknown error'} (${date})\n`;
      });
      report += '\n';
    }

    // Recommendations
    report += '💡 RECOMMENDATIONS\n';
    report += '-------------------\n';
    
    if (history.successRate < 0.8) {
      report += '• Success rate below 80% - check YouTube transcript availability\n';
    }
    
    if (failedVideos.length > 0) {
      report += `• ${failedVideos.length} videos failed - consider manual review or retry\n`;
    }
    
    if (history.totalChunksGenerated < 100) {
      report += '• Low chunk count - consider processing more content for better Oracle coverage\n';
    }

    if (history.runs.length > 0) {
      const avgChunksPerVideo = history.totalChunksGenerated / history.totalVideosProcessed;
      if (avgChunksPerVideo < 10) {
        report += '• Average chunks per video is low - videos may be short or lack substantial content\n';
      }
    }

    report += '• Regular processing recommended to keep Oracle knowledge current\n\n';

    report += '🔮 Oracle Enhanced with YouTube Wisdom\n';

    return report;
  }

  // Save processing report to file
  saveReport(): string {
    const report = this.generateReport();
    const reportFile = join(this.getOutputDir(), 'processing_report.txt');
    
    try {
      writeFileSync(reportFile, report, 'utf-8');
      this.log(`📄 Processing report saved to: ${reportFile}`);
      return reportFile;
    } catch (error) {
      this.log(`❌ Error saving report: ${error}`);
      throw error;
    }
  }

  // Retry failed video processing
  getFailedVideosForRetry(maxAttempts: number = 3): VideoStatus[] {
    const statuses = this.loadVideoStatuses();
    return Object.values(statuses).filter(
      v => v.status === 'failed' && v.attempts < maxAttempts
    );
  }

  // Private helper methods
  private updateProcessingHistory(run: ProcessingRun): void {
    const history = this.loadProcessingHistory();
    
    history.runs.push(run);
    history.totalVideosProcessed += run.successfulExtractions;
    history.totalChunksGenerated += run.totalChunks;
    history.lastRunAt = run.endTime;

    // Calculate averages
    const totalDuration = history.runs.reduce((sum, r) => sum + r.duration, 0);
    history.averageProcessingTime = totalDuration / history.runs.length;

    const totalSuccess = history.runs.reduce((sum, r) => sum + r.successfulExtractions, 0);
    const totalAttempts = history.runs.reduce((sum, r) => sum + r.totalFiles, 0);
    history.successRate = totalAttempts > 0 ? totalSuccess / totalAttempts : 0;

    this.saveProcessingHistory(history);
  }

  private loadProcessingHistory(): ProcessingHistory {
    try {
      if (existsSync(this.historyFile)) {
        const data = readFileSync(this.historyFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.log(`⚠️  Error loading processing history: ${error}`);
    }

    return {
      runs: [],
      totalVideosProcessed: 0,
      totalChunksGenerated: 0,
      averageProcessingTime: 0,
      lastRunAt: new Date().toISOString(),
      successRate: 0
    };
  }

  private saveProcessingHistory(history: ProcessingHistory): void {
    try {
      const dir = this.getOutputDir();
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      writeFileSync(this.historyFile, JSON.stringify(history, null, 2), 'utf-8');
    } catch (error) {
      this.log(`❌ Error saving processing history: ${error}`);
    }
  }

  private loadVideoStatuses(): Record<string, VideoStatus> {
    try {
      if (existsSync(this.statusFile)) {
        const data = readFileSync(this.statusFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      this.log(`⚠️  Error loading video statuses: ${error}`);
    }

    return {};
  }

  private saveVideoStatuses(statuses: Record<string, VideoStatus>): void {
    try {
      const dir = this.getOutputDir();
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      writeFileSync(this.statusFile, JSON.stringify(statuses, null, 2), 'utf-8');
    } catch (error) {
      this.log(`❌ Error saving video statuses: ${error}`);
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    
    try {
      const dir = this.getOutputDir();
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      appendFileSync(this.logFile, logEntry, 'utf-8');
    } catch (error) {
      console.warn(`Could not write to log file: ${error}`);
    }
  }

  private getOutputDir(): string {
    return dirname(this.historyFile);
  }
}

// Global monitor instance
let globalMonitor: YouTubeProcessingMonitor | null = null;

export function getProcessingMonitor(outputDir?: string): YouTubeProcessingMonitor {
  if (!globalMonitor || outputDir) {
    globalMonitor = new YouTubeProcessingMonitor(outputDir);
  }
  return globalMonitor;
}