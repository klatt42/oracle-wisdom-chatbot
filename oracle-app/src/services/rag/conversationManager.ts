/**
 * Oracle Conversation Context Manager
 * Elena Execution - Multi-turn conversation context management for Oracle RAG system
 * Maintains business context and framework continuity across Oracle sessions
 */

import { 
  BusinessQueryClassification, 
  HormoziFramework, 
  IndustryVertical, 
  BusinessLifecycleStage,
  UserIntent 
} from '../../types/businessIntelligence';

// Core Conversation Interfaces
export interface ConversationTurn {
  turn_id: string;
  timestamp: string;
  user_query: string;
  processed_query?: {
    intent: UserIntent;
    frameworks_mentioned: HormoziFramework[];
    financial_metrics: string[];
    complexity_level: string;
  };
  oracle_response_summary: string;
  key_concepts: string[];
  frameworks_discussed: HormoziFramework[];
  implementation_actions_mentioned: boolean;
  follow_up_potential: number; // 0-1 score
  resolution_status: 'incomplete' | 'partial' | 'complete' | 'requires_follow_up';
}

export interface ConversationThread {
  thread_id: string;
  primary_topic: string;
  frameworks_involved: HormoziFramework[];
  business_context: {
    industry?: IndustryVertical;
    business_stage?: BusinessLifecycleStage;
    pain_points: string[];
    goals: string[];
  };
  turns: ConversationTurn[];
  thread_summary: string;
  active_concepts: Map<string, number>; // concept -> relevance score
  unresolved_questions: string[];
  implementation_progress: {
    discussed_actions: string[];
    completed_actions: string[];
    pending_actions: string[];
  };
}

export interface ConversationSession {
  session_id: string;
  user_id?: string;
  created_at: string;
  last_activity: string;
  session_context: {
    user_expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    primary_business_focus: string;
    learned_preferences: {
      response_style: string;
      detail_level: string;
      framework_preferences: HormoziFramework[];
    };
  };
  active_threads: ConversationThread[];
  session_summary: {
    total_turns: number;
    primary_frameworks_discussed: HormoziFramework[];
    key_insights_provided: string[];
    implementation_guidance_given: string[];
    outstanding_questions: string[];
  };
  context_tokens_used: number;
  max_context_tokens: number;
}

export interface ContextInjectionStrategy {
  strategy_name: string;
  relevant_turns: ConversationTurn[];
  framework_continuity: {
    previously_discussed: HormoziFramework[];
    context_bridging: string[];
    reference_resolution: Map<string, string>;
  };
  business_continuity: {
    ongoing_pain_points: string[];
    established_goals: string[];
    implementation_context: string[];
  };
  token_budget: {
    allocated_tokens: number;
    priority_content: string[];
    summarized_content: string[];
  };
}

export interface ContextSummarizationConfig {
  summarization_trigger: {
    token_threshold: number;
    turn_count_threshold: number;
    time_threshold_hours: number;
  };
  preservation_priorities: {
    framework_discussions: number;
    implementation_actions: number;
    unresolved_questions: number;
    business_context: number;
  };
  compression_strategies: {
    concept_clustering: boolean;
    temporal_decay: boolean;
    relevance_filtering: boolean;
  };
}

// Conversation Management Service
export class OracleConversationManager {
  private sessions: Map<string, ConversationSession> = new Map();
  private contextualizationConfig: ContextSummarizationConfig;

  constructor() {
    this.contextualizationConfig = {
      summarization_trigger: {
        token_threshold: 60000,
        turn_count_threshold: 15,
        time_threshold_hours: 24
      },
      preservation_priorities: {
        framework_discussions: 0.9,
        implementation_actions: 0.85,
        unresolved_questions: 0.8,
        business_context: 0.75
      },
      compression_strategies: {
        concept_clustering: true,
        temporal_decay: true,
        relevance_filtering: true
      }
    };
  }

  // Session Management
  async initializeSession(
    sessionId: string, 
    userId?: string,
    initialContext?: {
      expertise_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      business_focus?: string;
      industry?: IndustryVertical;
      business_stage?: BusinessLifecycleStage;
    }
  ): Promise<ConversationSession> {
    const session: ConversationSession = {
      session_id: sessionId,
      user_id: userId,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      session_context: {
        user_expertise_level: initialContext?.expertise_level || 'intermediate',
        primary_business_focus: initialContext?.business_focus || 'general_business_growth',
        learned_preferences: {
          response_style: 'mystical',
          detail_level: 'standard',
          framework_preferences: []
        }
      },
      active_threads: [],
      session_summary: {
        total_turns: 0,
        primary_frameworks_discussed: [],
        key_insights_provided: [],
        implementation_guidance_given: [],
        outstanding_questions: []
      },
      context_tokens_used: 0,
      max_context_tokens: 80000
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<ConversationSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  // Conversation Turn Processing
  async processConversationTurn(
    sessionId: string,
    userQuery: string,
    queryClassification: BusinessQueryClassification,
    oracleResponseSummary: string,
    frameworksDiscussed: HormoziFramework[],
    implementationActionsMentioned: boolean
  ): Promise<{
    updated_session: ConversationSession;
    context_strategy: ContextInjectionStrategy;
    requires_summarization: boolean;
  }> {
    let session = await this.getSession(sessionId);
    if (!session) {
      session = await this.initializeSession(sessionId);
    }

    // Create conversation turn
    const conversationTurn: ConversationTurn = {
      turn_id: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      user_query: userQuery,
      processed_query: {
        intent: queryClassification.classified_intent.primary_intent,
        frameworks_mentioned: queryClassification.business_context.framework_relevance.map(fr => fr.framework),
        financial_metrics: queryClassification.business_context.financial_focus || [],
        complexity_level: queryClassification.query_complexity.overall_complexity
      },
      oracle_response_summary: oracleResponseSummary,
      key_concepts: this.extractKeyConcepts(userQuery, oracleResponseSummary),
      frameworks_discussed: frameworksDiscussed,
      implementation_actions_mentioned: implementationActionsMentioned,
      follow_up_potential: this.calculateFollowUpPotential(queryClassification, oracleResponseSummary),
      resolution_status: this.determineResolutionStatus(queryClassification, implementationActionsMentioned)
    };

    // Determine thread assignment
    const threadAssignment = await this.assignToThread(session, conversationTurn, queryClassification);
    
    // Update session
    session.last_activity = new Date().toISOString();
    session.session_summary.total_turns++;
    
    // Update thread
    threadAssignment.thread.turns.push(conversationTurn);
    this.updateThreadSummary(threadAssignment.thread, conversationTurn);
    this.updateSessionSummary(session, conversationTurn);
    this.updateUserPreferences(session, queryClassification);

    // Calculate context tokens
    session.context_tokens_used = this.calculateContextTokens(session);

    // Determine if summarization is needed
    const requiresSummarization = this.shouldTriggerSummarization(session);

    if (requiresSummarization) {
      await this.performContextSummarization(session);
    }

    // Generate context injection strategy
    const contextStrategy = await this.generateContextStrategy(session, conversationTurn, queryClassification);

    this.sessions.set(sessionId, session);

    return {
      updated_session: session,
      context_strategy: contextStrategy,
      requires_summarization: requiresSummarization
    };
  }

  // Context Strategy Generation
  private async generateContextStrategy(
    session: ConversationSession,
    currentTurn: ConversationTurn,
    queryClassification: BusinessQueryClassification
  ): Promise<ContextInjectionStrategy> {
    const relevantTurns = this.selectRelevantTurns(session, queryClassification, 8);
    const frameworkContinuity = this.analyzeFrameworkContinuity(relevantTurns, currentTurn);
    const businessContinuity = this.analyzeBusinessContinuity(session, queryClassification);
    
    const tokenBudget = this.calculateTokenBudget(session, relevantTurns);

    return {
      strategy_name: `context_strategy_${currentTurn.turn_id}`,
      relevant_turns: relevantTurns,
      framework_continuity: frameworkContinuity,
      business_continuity: businessContinuity,
      token_budget: tokenBudget
    };
  }

  private selectRelevantTurns(
    session: ConversationSession, 
    queryClassification: BusinessQueryClassification,
    maxTurns: number
  ): ConversationTurn[] {
    const allTurns = session.active_threads.flatMap(thread => thread.turns);
    const queryFrameworks = queryClassification.business_context.framework_relevance.map(fr => fr.framework);
    const queryIntent = queryClassification.classified_intent.primary_intent;

    // Score turns by relevance
    const scoredTurns = allTurns.map(turn => ({
      turn,
      relevance_score: this.calculateTurnRelevance(turn, queryFrameworks, queryIntent)
    }));

    // Sort by relevance and recency
    scoredTurns.sort((a, b) => {
      const relevanceDiff = b.relevance_score - a.relevance_score;
      if (Math.abs(relevanceDiff) < 0.1) {
        // If relevance is similar, prefer more recent
        return new Date(b.turn.timestamp).getTime() - new Date(a.turn.timestamp).getTime();
      }
      return relevanceDiff;
    });

    return scoredTurns.slice(0, maxTurns).map(st => st.turn);
  }

  private calculateTurnRelevance(
    turn: ConversationTurn,
    queryFrameworks: HormoziFramework[],
    queryIntent: UserIntent
  ): number {
    let score = 0;

    // Framework overlap
    const frameworkOverlap = turn.frameworks_discussed.filter(f => queryFrameworks.includes(f)).length;
    score += frameworkOverlap * 0.3;

    // Intent similarity
    if (turn.processed_query?.intent === queryIntent) {
      score += 0.25;
    }

    // Implementation continuity
    if (turn.implementation_actions_mentioned) {
      score += 0.2;
    }

    // Unresolved questions
    if (turn.resolution_status === 'incomplete' || turn.resolution_status === 'requires_follow_up') {
      score += 0.15;
    }

    // Recency bonus (decay over time)
    const hoursAgo = (Date.now() - new Date(turn.timestamp).getTime()) / (1000 * 60 * 60);
    const recencyBonus = Math.exp(-hoursAgo / 24) * 0.1; // Exponential decay with 24-hour half-life
    score += recencyBonus;

    return Math.min(score, 1.0);
  }

  private analyzeFrameworkContinuity(
    relevantTurns: ConversationTurn[],
    currentTurn: ConversationTurn
  ): {
    previously_discussed: HormoziFramework[];
    context_bridging: string[];
    reference_resolution: Map<string, string>;
  } {
    const previouslyDiscussed = Array.from(new Set(
      relevantTurns.flatMap(turn => turn.frameworks_discussed)
    ));

    const contextBridging = this.generateFrameworkBridges(previouslyDiscussed, currentTurn.frameworks_discussed);
    const referenceResolution = this.buildReferenceMap(relevantTurns);

    return {
      previously_discussed: previouslyDiscussed,
      context_bridging: contextBridging,
      reference_resolution: referenceResolution
    };
  }

  private analyzeBusiness Continuity(
    session: ConversationSession,
    queryClassification: BusinessQueryClassification
  ): {
    ongoing_pain_points: string[];
    established_goals: string[];
    implementation_context: string[];
  } {
    const ongoingPainPoints = Array.from(new Set(
      session.active_threads.flatMap(thread => thread.business_context.pain_points)
    ));

    const establishedGoals = Array.from(new Set(
      session.active_threads.flatMap(thread => thread.business_context.goals)
    ));

    const implementationContext = Array.from(new Set(
      session.active_threads.flatMap(thread => thread.implementation_progress.discussed_actions)
    ));

    return {
      ongoing_pain_points: ongoingPainPoints,
      established_goals: establishedGoals,
      implementation_context: implementationContext
    };
  }

  // Thread Management
  private async assignToThread(
    session: ConversationSession,
    turn: ConversationTurn,
    classification: BusinessQueryClassification
  ): Promise<{ thread: ConversationThread; is_new_thread: boolean }> {
    // Find most relevant existing thread
    const mostRelevantThread = this.findMostRelevantThread(session.active_threads, turn, classification);

    if (mostRelevantThread && this.shouldContinueThread(mostRelevantThread, turn, classification)) {
      return { thread: mostRelevantThread, is_new_thread: false };
    }

    // Create new thread
    const newThread: ConversationThread = {
      thread_id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      primary_topic: this.derivePrimaryTopic(turn, classification),
      frameworks_involved: turn.frameworks_discussed,
      business_context: {
        industry: session.session_context.primary_business_focus as IndustryVertical,
        pain_points: this.extractPainPoints(turn.user_query),
        goals: this.extractGoals(turn.user_query)
      },
      turns: [],
      thread_summary: '',
      active_concepts: new Map(),
      unresolved_questions: [],
      implementation_progress: {
        discussed_actions: [],
        completed_actions: [],
        pending_actions: []
      }
    };

    session.active_threads.push(newThread);
    return { thread: newThread, is_new_thread: true };
  }

  private findMostRelevantThread(
    threads: ConversationThread[],
    turn: ConversationTurn,
    classification: BusinessQueryClassification
  ): ConversationThread | null {
    if (threads.length === 0) return null;

    const queryFrameworks = classification.business_context.framework_relevance.map(fr => fr.framework);
    
    let bestThread: ConversationThread | null = null;
    let bestScore = 0;

    for (const thread of threads) {
      let score = 0;

      // Framework overlap
      const frameworkOverlap = thread.frameworks_involved.filter(f => queryFrameworks.includes(f)).length;
      score += frameworkOverlap * 0.4;

      // Topic similarity
      const topicSimilarity = this.calculateTopicSimilarity(thread.primary_topic, turn.user_query);
      score += topicSimilarity * 0.3;

      // Recent activity bonus
      const lastTurn = thread.turns[thread.turns.length - 1];
      if (lastTurn) {
        const hoursAgo = (Date.now() - new Date(lastTurn.timestamp).getTime()) / (1000 * 60 * 60);
        if (hoursAgo < 2) score += 0.2; // Recent activity bonus
        else if (hoursAgo < 24) score += 0.1;
      }

      // Unresolved questions bonus
      if (thread.unresolved_questions.length > 0) {
        score += 0.1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestThread = thread;
      }
    }

    return bestScore > 0.3 ? bestThread : null; // Minimum relevance threshold
  }

  // Context Summarization
  private shouldTriggerSummarization(session: ConversationSession): boolean {
    const config = this.contextualizationConfig.summarization_trigger;
    
    return (
      session.context_tokens_used > config.token_threshold ||
      session.session_summary.total_turns > config.turn_count_threshold ||
      this.getSessionAgeHours(session) > config.time_threshold_hours
    );
  }

  private async performContextSummarization(session: ConversationSession): Promise<void> {
    const priorities = this.contextualizationConfig.preservation_priorities;
    
    // Identify content to preserve vs. summarize
    const preserveContent: ConversationTurn[] = [];
    const summarizeContent: ConversationTurn[] = [];

    for (const thread of session.active_threads) {
      for (const turn of thread.turns) {
        let preservationScore = 0;

        // Framework discussion priority
        if (turn.frameworks_discussed.length > 0) {
          preservationScore += priorities.framework_discussions;
        }

        // Implementation actions priority
        if (turn.implementation_actions_mentioned) {
          preservationScore += priorities.implementation_actions;
        }

        // Unresolved questions priority
        if (turn.resolution_status === 'incomplete' || turn.resolution_status === 'requires_follow_up') {
          preservationScore += priorities.unresolved_questions;
        }

        // Recency factor
        const hoursAgo = (Date.now() - new Date(turn.timestamp).getTime()) / (1000 * 60 * 60);
        if (hoursAgo < 24) preservationScore += 0.2;

        if (preservationScore > 0.7) {
          preserveContent.push(turn);
        } else {
          summarizeContent.push(turn);
        }
      }
    }

    // Perform summarization
    const summarizedContent = await this.summarizeTurns(summarizeContent);
    
    // Update session with summarized content
    await this.applySummarization(session, preserveContent, summarizedContent);
  }

  private async summarizeTurns(turns: ConversationTurn[]): Promise<{
    summarized_concepts: Map<string, string>;
    key_insights: string[];
    implementation_progress: string[];
    outstanding_questions: string[];
  }> {
    // Cluster similar concepts
    const conceptClusters = this.clusterConcepts(turns);
    
    // Extract key insights
    const keyInsights = this.extractKeyInsights(turns);
    
    // Summarize implementation progress
    const implementationProgress = this.summarizeImplementationProgress(turns);
    
    // Identify outstanding questions
    const outstandingQuestions = this.identifyOutstandingQuestions(turns);

    return {
      summarized_concepts: conceptClusters,
      key_insights: keyInsights,
      implementation_progress: implementationProgress,
      outstanding_questions: outstandingQuestions
    };
  }

  // Context Injection for Current Query
  async generateContextForQuery(
    sessionId: string,
    currentQuery: string,
    queryClassification: BusinessQueryClassification,
    tokenBudget: number = 15000
  ): Promise<{
    relevant_context: string;
    framework_continuity: string[];
    business_continuity: string[];
    reference_resolution: string[];
    token_usage: number;
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return {
        relevant_context: '',
        framework_continuity: [],
        business_continuity: [],
        reference_resolution: [],
        token_usage: 0
      };
    }

    const strategy = await this.generateContextStrategy(
      session,
      {
        turn_id: 'current',
        timestamp: new Date().toISOString(),
        user_query: currentQuery,
        oracle_response_summary: '',
        key_concepts: [],
        frameworks_discussed: queryClassification.business_context.framework_relevance.map(fr => fr.framework),
        implementation_actions_mentioned: false,
        follow_up_potential: 0,
        resolution_status: 'incomplete'
      } as ConversationTurn,
      queryClassification
    );

    const contextContent = this.assembleContextContent(strategy, tokenBudget);
    
    return {
      relevant_context: contextContent.formatted_context,
      framework_continuity: contextContent.framework_bridges,
      business_continuity: contextContent.business_bridges,
      reference_resolution: Array.from(strategy.framework_continuity.reference_resolution.values()),
      token_usage: contextContent.estimated_tokens
    };
  }

  // Utility Methods
  private extractKeyConcepts(userQuery: string, oracleResponse: string): string[] {
    const text = `${userQuery} ${oracleResponse}`;
    const concepts = [];
    
    // Extract business concepts using regex patterns
    const patterns = [
      /\b(LTV|CAC|conversion|revenue|profit|margin|ROI|ROAS)\b/gi,
      /\b(lead generation|sales|marketing|operations|customer service)\b/gi,
      /\b(Grand Slam Offer|Core Four|value ladder|irresistible offer)\b/gi,
      /\b(scaling|growth|optimization|acquisition|retention)\b/gi
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        concepts.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return Array.from(new Set(concepts)).slice(0, 10);
  }

  private calculateFollowUpPotential(
    classification: BusinessQueryClassification,
    responseContent: string
  ): number {
    let potential = 0;

    // Complex queries have higher follow-up potential
    if (classification.query_complexity.overall_complexity === 'complex') potential += 0.3;
    else if (classification.query_complexity.overall_complexity === 'moderate') potential += 0.2;

    // Implementation queries often need follow-up
    if (classification.classified_intent.primary_intent === 'implementation_guidance') potential += 0.25;

    // Questions about frameworks often lead to deeper discussions
    if (classification.business_context.framework_relevance.length > 0) potential += 0.2;

    // Partial responses suggest follow-up needed
    if (responseContent.includes('partially') || responseContent.includes('depends') || responseContent.includes('consider')) {
      potential += 0.25;
    }

    return Math.min(potential, 1.0);
  }

  private determineResolutionStatus(
    classification: BusinessQueryClassification,
    implementationMentioned: boolean
  ): 'incomplete' | 'partial' | 'complete' | 'requires_follow_up' {
    if (classification.query_complexity.overall_complexity === 'complex' && !implementationMentioned) {
      return 'incomplete';
    }
    
    if (classification.classified_intent.primary_intent === 'implementation_guidance') {
      return implementationMentioned ? 'partial' : 'requires_follow_up';
    }
    
    if (classification.classified_intent.primary_intent === 'strategy_planning') {
      return 'requires_follow_up';
    }
    
    return 'complete';
  }

  private calculateContextTokens(session: ConversationSession): number {
    let tokens = 0;
    
    for (const thread of session.active_threads) {
      for (const turn of thread.turns) {
        // Rough estimation: 4 characters per token
        tokens += Math.ceil((turn.user_query.length + turn.oracle_response_summary.length) / 4);
      }
      tokens += Math.ceil(thread.thread_summary.length / 4);
    }
    
    tokens += Math.ceil(JSON.stringify(session.session_summary).length / 4);
    
    return tokens;
  }

  private updateThreadSummary(thread: ConversationThread, turn: ConversationTurn): void {
    // Update active concepts
    for (const concept of turn.key_concepts) {
      const currentScore = thread.active_concepts.get(concept) || 0;
      thread.active_concepts.set(concept, currentScore + 0.1);
    }

    // Add unresolved questions
    if (turn.resolution_status === 'incomplete' || turn.resolution_status === 'requires_follow_up') {
      thread.unresolved_questions.push(turn.user_query);
    }

    // Update implementation progress
    if (turn.implementation_actions_mentioned) {
      const actionSummary = this.extractActionSummary(turn.oracle_response_summary);
      thread.implementation_progress.discussed_actions.push(actionSummary);
    }

    // Regenerate thread summary
    thread.thread_summary = this.generateThreadSummary(thread);
  }

  private updateSessionSummary(session: ConversationSession, turn: ConversationTurn): void {
    // Update frameworks discussed
    for (const framework of turn.frameworks_discussed) {
      if (!session.session_summary.primary_frameworks_discussed.includes(framework)) {
        session.session_summary.primary_frameworks_discussed.push(framework);
      }
    }

    // Update key insights
    const insights = this.extractInsights(turn.oracle_response_summary);
    session.session_summary.key_insights_provided.push(...insights);

    // Update implementation guidance
    if (turn.implementation_actions_mentioned) {
      const guidance = this.extractImplementationGuidance(turn.oracle_response_summary);
      session.session_summary.implementation_guidance_given.push(guidance);
    }

    // Update outstanding questions
    if (turn.resolution_status !== 'complete') {
      session.session_summary.outstanding_questions.push(turn.user_query);
    }

    // Keep lists manageable
    session.session_summary.key_insights_provided = session.session_summary.key_insights_provided.slice(-20);
    session.session_summary.implementation_guidance_given = session.session_summary.implementation_guidance_given.slice(-15);
    session.session_summary.outstanding_questions = session.session_summary.outstanding_questions.slice(-10);
  }

  private updateUserPreferences(session: ConversationSession, classification: BusinessQueryClassification): void {
    // Learn framework preferences
    const mentionedFrameworks = classification.business_context.framework_relevance.map(fr => fr.framework);
    for (const framework of mentionedFrameworks) {
      if (!session.session_context.learned_preferences.framework_preferences.includes(framework)) {
        session.session_context.learned_preferences.framework_preferences.push(framework);
      }
    }

    // Adapt detail level based on query complexity
    if (classification.query_complexity.overall_complexity === 'complex' && 
        session.session_context.learned_preferences.detail_level === 'brief') {
      session.session_context.learned_preferences.detail_level = 'standard';
    }
  }

  // Helper methods for various operations
  private shouldContinueThread(
    thread: ConversationThread,
    turn: ConversationTurn,
    classification: BusinessQueryClassification
  ): boolean {
    const frameworkOverlap = thread.frameworks_involved.some(f => turn.frameworks_discussed.includes(f));
    const topicSimilarity = this.calculateTopicSimilarity(thread.primary_topic, turn.user_query) > 0.3;
    const hasUnresolvedQuestions = thread.unresolved_questions.length > 0;

    return frameworkOverlap || topicSimilarity || hasUnresolvedQuestions;
  }

  private derivePrimaryTopic(turn: ConversationTurn, classification: BusinessQueryClassification): string {
    if (turn.frameworks_discussed.length > 0) {
      return `${turn.frameworks_discussed[0]}_discussion`;
    }
    
    if (classification.classified_intent.primary_intent) {
      return classification.classified_intent.primary_intent.replace(/_/g, ' ');
    }
    
    return 'general_business_guidance';
  }

  private calculateTopicSimilarity(topic1: string, topic2: string): number {
    // Simple keyword-based similarity
    const words1 = topic1.toLowerCase().split(/\s+/);
    const words2 = topic2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(w => words2.includes(w));
    const union = Array.from(new Set([...words1, ...words2]));
    return intersection.length / union.length;
  }

  private extractPainPoints(query: string): string[] {
    const painPatterns = [
      /struggling with/gi,
      /problem with/gi,
      /difficulty/gi,
      /challenge/gi,
      /not working/gi,
      /failing/gi
    ];

    const painPoints = [];
    for (const pattern of painPatterns) {
      if (pattern.test(query)) {
        painPoints.push(query.slice(0, 100)); // Simplified extraction
      }
    }

    return painPoints;
  }

  private extractGoals(query: string): string[] {
    const goalPatterns = [
      /want to/gi,
      /need to/gi,
      /trying to/gi,
      /goal is/gi,
      /looking to/gi,
      /hoping to/gi
    ];

    const goals = [];
    for (const pattern of goalPatterns) {
      if (pattern.test(query)) {
        goals.push(query.slice(0, 100)); // Simplified extraction
      }
    }

    return goals;
  }

  private generateFrameworkBridges(
    previousFrameworks: HormoziFramework[],
    currentFrameworks: HormoziFramework[]
  ): string[] {
    const bridges = [];
    
    for (const current of currentFrameworks) {
      for (const previous of previousFrameworks) {
        if (current !== previous) {
          bridges.push(`Previously discussed ${previous}, now exploring ${current} - these frameworks complement each other`);
        }
      }
    }
    
    return bridges.slice(0, 3); // Limit bridges
  }

  private buildReferenceMap(turns: ConversationTurn[]): Map<string, string> {
    const references = new Map<string, string>();
    
    for (const turn of turns) {
      if (turn.oracle_response_summary.includes('as we discussed')) {
        references.set('previous_discussion', turn.oracle_response_summary.slice(0, 200));
      }
      
      if (turn.implementation_actions_mentioned) {
        references.set('implementation_context', turn.oracle_response_summary.slice(0, 200));
      }
    }
    
    return references;
  }

  private calculateTokenBudget(
    session: ConversationSession,
    relevantTurns: ConversationTurn[]
  ): {
    allocated_tokens: number;
    priority_content: string[];
    summarized_content: string[];
  } {
    const maxTokens = Math.min(15000, session.max_context_tokens - session.context_tokens_used);
    const priorityContent = [];
    const summarizedContent = [];
    
    // Allocate tokens by priority
    let usedTokens = 0;
    
    for (const turn of relevantTurns) {
      const turnTokens = Math.ceil((turn.user_query.length + turn.oracle_response_summary.length) / 4);
      
      if (usedTokens + turnTokens < maxTokens * 0.8) {
        priorityContent.push(turn.oracle_response_summary);
        usedTokens += turnTokens;
      } else {
        summarizedContent.push(turn.oracle_response_summary.slice(0, 100) + '...');
        usedTokens += 25; // Estimated tokens for summary
      }
    }
    
    return {
      allocated_tokens: usedTokens,
      priority_content: priorityContent,
      summarized_content: summarizedContent
    };
  }

  private assembleContextContent(
    strategy: ContextInjectionStrategy,
    tokenBudget: number
  ): {
    formatted_context: string;
    framework_bridges: string[];
    business_bridges: string[];
    estimated_tokens: number;
  } {
    const contextParts = [];
    const frameworkBridges = strategy.framework_continuity.context_bridging;
    const businessBridges = Array.from(strategy.framework_continuity.reference_resolution.values());
    
    // Format relevant turns
    contextParts.push('## Previous Conversation Context');
    for (const turn of strategy.relevant_turns.slice(0, 5)) {
      contextParts.push(`**User Query**: ${turn.user_query}`);
      contextParts.push(`**Oracle Guidance**: ${turn.oracle_response_summary.slice(0, 300)}...`);
      contextParts.push('---');
    }
    
    // Add business continuity
    if (strategy.business_continuity.ongoing_pain_points.length > 0) {
      contextParts.push('## Ongoing Business Context');
      contextParts.push(`**Pain Points**: ${strategy.business_continuity.ongoing_pain_points.slice(0, 3).join(', ')}`);
      contextParts.push(`**Goals**: ${strategy.business_continuity.established_goals.slice(0, 3).join(', ')}`);
    }
    
    const formattedContext = contextParts.join('\n\n');
    const estimatedTokens = Math.ceil(formattedContext.length / 4);
    
    return {
      formatted_context: formattedContext.slice(0, tokenBudget * 4), // Truncate if needed
      framework_bridges: frameworkBridges,
      business_bridges: businessBridges,
      estimated_tokens: Math.min(estimatedTokens, tokenBudget)
    };
  }

  private getSessionAgeHours(session: ConversationSession): number {
    return (Date.now() - new Date(session.created_at).getTime()) / (1000 * 60 * 60);
  }

  // Placeholder methods for summarization operations
  private clusterConcepts(turns: ConversationTurn[]): Map<string, string> {
    const concepts = new Map<string, string>();
    const allConcepts = turns.flatMap(turn => turn.key_concepts);
    
    // Simple clustering by grouping similar concepts
    const businessConcepts = allConcepts.filter(c => ['revenue', 'profit', 'ltv', 'cac'].includes(c));
    const frameworkConcepts = allConcepts.filter(c => ['offer', 'value', 'core', 'four'].includes(c));
    
    if (businessConcepts.length > 0) {
      concepts.set('financial_metrics', `Discussed: ${businessConcepts.join(', ')}`);
    }
    
    if (frameworkConcepts.length > 0) {
      concepts.set('hormozi_frameworks', `Applied: ${frameworkConcepts.join(', ')}`);
    }
    
    return concepts;
  }

  private extractKeyInsights(turns: ConversationTurn[]): string[] {
    const insights = [];
    
    for (const turn of turns) {
      if (turn.oracle_response_summary.includes('key insight') || 
          turn.oracle_response_summary.includes('important to note') ||
          turn.oracle_response_summary.includes('critical factor')) {
        insights.push(turn.oracle_response_summary.slice(0, 150));
      }
    }
    
    return insights.slice(0, 5);
  }

  private summarizeImplementationProgress(turns: ConversationTurn[]): string[] {
    return turns
      .filter(turn => turn.implementation_actions_mentioned)
      .map(turn => this.extractActionSummary(turn.oracle_response_summary))
      .slice(0, 8);
  }

  private identifyOutstandingQuestions(turns: ConversationTurn[]): string[] {
    return turns
      .filter(turn => turn.resolution_status === 'incomplete' || turn.resolution_status === 'requires_follow_up')
      .map(turn => turn.user_query.slice(0, 100))
      .slice(0, 5);
  }

  private async applySummarization(
    session: ConversationSession,
    preserveContent: ConversationTurn[],
    summarizedContent: any
  ): Promise<void> {
    // Create new threads with preserved content
    const newThreads: ConversationThread[] = [];
    
    // Group preserved content by thread
    const threadGroups = new Map<string, ConversationTurn[]>();
    for (const turn of preserveContent) {
      const threadId = this.findTurnThread(session, turn);
      if (!threadGroups.has(threadId)) {
        threadGroups.set(threadId, []);
      }
      threadGroups.get(threadId)!.push(turn);
    }
    
    // Create summary threads
    for (const [threadId, turns] of threadGroups) {
      const originalThread = session.active_threads.find(t => t.thread_id === threadId);
      if (originalThread) {
        const summarizedThread: ConversationThread = {
          ...originalThread,
          turns: turns,
          thread_summary: `${originalThread.thread_summary}\n\nSUMMARY: ${JSON.stringify(summarizedContent).slice(0, 300)}`
        };
        newThreads.push(summarizedThread);
      }
    }
    
    session.active_threads = newThreads;
    session.context_tokens_used = this.calculateContextTokens(session);
  }

  private findTurnThread(session: ConversationSession, turn: ConversationTurn): string {
    for (const thread of session.active_threads) {
      if (thread.turns.some(t => t.turn_id === turn.turn_id)) {
        return thread.thread_id;
      }
    }
    return 'unknown';
  }

  private generateThreadSummary(thread: ConversationThread): string {
    const conceptsList = Array.from(thread.active_concepts.keys()).slice(0, 5).join(', ');
    const frameworksList = thread.frameworks_involved.slice(0, 3).join(', ');
    
    return `Thread discussing ${thread.primary_topic} with focus on ${frameworksList}. Key concepts: ${conceptsList}. ${thread.turns.length} turns, ${thread.unresolved_questions.length} unresolved questions.`;
  }

  private extractActionSummary(responseContent: string): string {
    const actionKeywords = ['implement', 'create', 'build', 'establish', 'develop', 'launch'];
    
    for (const keyword of actionKeywords) {
      const index = responseContent.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        return responseContent.slice(index, index + 100);
      }
    }
    
    return responseContent.slice(0, 80);
  }

  private extractInsights(responseContent: string): string[] {
    const insightPatterns = [
      /key insight:([^.]+)/gi,
      /important to note:([^.]+)/gi,
      /critical factor:([^.]+)/gi
    ];
    
    const insights = [];
    for (const pattern of insightPatterns) {
      const matches = responseContent.match(pattern);
      if (matches) {
        insights.push(...matches.slice(0, 2));
      }
    }
    
    return insights;
  }

  private extractImplementationGuidance(responseContent: string): string {
    const guidanceKeywords = ['step', 'phase', 'stage', 'implement', 'execute'];
    
    for (const keyword of guidanceKeywords) {
      const index = responseContent.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        return responseContent.slice(index, index + 150);
      }
    }
    
    return 'Implementation guidance provided';
  }
}