#!/usr/bin/env node
/**
 * Complete Oracle System Test
 * Created by: Elena Execution
 * Purpose: Test database connection, schema deployment, and embedding pipeline readiness
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

interface SystemTestResult {
  environment: {
    configured: boolean;
    issues: string[];
  };
  database: {
    connected: boolean;
    vectorExtension: boolean;
    schemaDeployed: boolean;
    tablesAccessible: boolean;
    functionsDeployed: boolean;
    error?: string;
  };
  embedding: {
    openaiConfigured: boolean;
    pipelineReady: boolean;
    testEmbedding?: boolean;
    error?: string;
  };
  migration: {
    needed: boolean;
    files: string[];
    canDeploy: boolean;
  };
  overall: 'ready' | 'partial' | 'blocked';
  nextSteps: string[];
}

class OracleSystemTester {
  private supabase: any;
  private openai: OpenAI | null = null;
  private result: SystemTestResult;

  constructor() {
    this.result = {
      environment: { configured: false, issues: [] },
      database: { 
        connected: false, 
        vectorExtension: false, 
        schemaDeployed: false, 
        tablesAccessible: false, 
        functionsDeployed: false 
      },
      embedding: { 
        openaiConfigured: false, 
        pipelineReady: false 
      },
      migration: { 
        needed: false, 
        files: [], 
        canDeploy: false 
      },
      overall: 'blocked',
      nextSteps: []
    };
  }

  async runCompleteTest(): Promise<SystemTestResult> {
    console.log('🔮 Oracle System Complete Test - Elena Execution');
    console.log('=================================================\n');

    // Step 1: Environment Configuration Test
    await this.testEnvironmentConfig();
    
    // Step 2: Database Connection Test (if env configured)
    if (this.result.environment.configured) {
      await this.testDatabaseConnection();
      
      // Step 3: Schema Deployment Test (if connected)
      if (this.result.database.connected) {
        await this.testSchemaDeployment();
        
        // Step 4: Embedding Pipeline Test
        await this.testEmbeddingPipeline();
      }
    }
    
    // Step 5: Migration Analysis
    await this.analyzeMigrationStatus();
    
    // Step 6: Generate Comprehensive Report
    this.generateSystemReport();
    
    return this.result;
  }

  private async testEnvironmentConfig(): Promise<void> {
    console.log('🔧 Testing Environment Configuration...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Check Supabase URL
    if (!supabaseUrl || supabaseUrl.includes('your-project')) {
      this.result.environment.issues.push('NEXT_PUBLIC_SUPABASE_URL not configured');
      console.log('   ❌ Supabase URL: Not configured');
    } else {
      console.log('   ✅ Supabase URL: Configured');
    }
    
    // Check Supabase Key
    if (!supabaseKey || supabaseKey.includes('your-') || supabaseKey.length < 50) {
      this.result.environment.issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured');
      console.log('   ❌ Supabase Key: Not configured');
    } else {
      console.log('   ✅ Supabase Key: Configured');
    }
    
    // Check OpenAI Key
    if (!openaiKey || !openaiKey.startsWith('sk-')) {
      this.result.environment.issues.push('OPENAI_API_KEY not configured');
      console.log('   ❌ OpenAI Key: Not configured');
    } else {
      this.result.embedding.openaiConfigured = true;
      console.log('   ✅ OpenAI Key: Configured');
    }
    
    this.result.environment.configured = this.result.environment.issues.length === 0;
    
    if (!this.result.environment.configured) {
      console.log('\n⚠️  Environment configuration incomplete. Cannot proceed with database tests.');
      this.provideConfigurationGuidance();
    }
    
    console.log('');
  }

  private provideConfigurationGuidance(): void {
    console.log('📋 CONFIGURATION SETUP GUIDE:');
    console.log('=============================');
    
    console.log('\n1. 🏗️  Create Supabase Project:');
    console.log('   - Go to https://supabase.com');
    console.log('   - Click "New Project"');
    console.log('   - Choose organization and region');
    console.log('   - Wait for project to initialize (~2 minutes)');
    
    console.log('\n2. 🔑 Get Supabase Credentials:');
    console.log('   - Go to Project Settings → API');
    console.log('   - Copy "Project URL" and "anon public" key');
    
    console.log('\n3. 🤖 Get OpenAI API Key:');
    console.log('   - Go to https://platform.openai.com/api-keys');
    console.log('   - Create new secret key');
    
    console.log('\n4. ⚙️  Update .env.local:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]');
    console.log('   OPENAI_API_KEY=sk-[your-openai-key]');
    
    console.log('\n5. 🔄 Re-run this test:');
    console.log('   npm run test-database');
    console.log('');
  }

  private async testDatabaseConnection(): Promise<void> {
    console.log('🔌 Testing Database Connection...');
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      this.supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test basic connection with a simple query
      const { data, error } = await this.supabase
        .from('pg_tables')
        .select('tablename')
        .limit(1);
      
      if (error) {
        this.result.database.error = error.message;
        console.log('   ❌ Connection: Failed');
        console.log(`      Error: ${error.message}`);
        
        if (error.message.includes('Invalid API key')) {
          console.log('      💡 Check: Verify your Supabase anon key is correct');
        } else if (error.message.includes('not found')) {
          console.log('      💡 Check: Verify your Supabase URL is correct');
        }
      } else {
        this.result.database.connected = true;
        console.log('   ✅ Connection: Successful');
      }
      
    } catch (error) {
      this.result.database.error = String(error);
      console.log('   ❌ Connection: Failed');
      console.log(`      Error: ${String(error)}`);
    }
    
    console.log('');
  }

  private async testSchemaDeployment(): Promise<void> {
    console.log('🗄️  Testing Oracle Schema Deployment...');
    
    // Test oracle_categories table
    try {
      const { data: categories, error: catError } = await this.supabase
        .from('oracle_categories')
        .select('id, name')
        .limit(1);
      
      if (catError) {
        if (catError.message.includes('does not exist')) {
          console.log('   ⚠️  oracle_categories: Table not found - Schema needs deployment');
          this.result.migration.needed = true;
        } else {
          console.log(`   ❌ oracle_categories: Access error - ${catError.message}`);
        }
      } else {
        console.log('   ✅ oracle_categories: Accessible');
        this.result.database.tablesAccessible = true;
      }
    } catch (error) {
      console.log('   ❌ oracle_categories: Test failed');
    }
    
    // Test oracle_knowledge table
    try {
      const { data: knowledge, error: knowError } = await this.supabase
        .from('oracle_knowledge')
        .select('id')
        .limit(1);
      
      if (knowError) {
        if (!knowError.message.includes('does not exist')) {
          console.log(`   ❌ oracle_knowledge: ${knowError.message}`);
        }
      } else {
        console.log('   ✅ oracle_knowledge: Accessible');
        this.result.database.schemaDeployed = true;
      }
    } catch (error) {
      // Expected if schema not deployed
    }
    
    // Test search functions
    if (this.result.database.schemaDeployed) {
      try {
        const { error: funcError } = await this.supabase.rpc('oracle_semantic_search', {
          query_embedding: '[0.1]',
          max_results: 1
        });
        
        if (funcError) {
          if (funcError.message.includes('function') && funcError.message.includes('does not exist')) {
            console.log('   ⚠️  Search Functions: Not deployed');
            this.result.migration.needed = true;
          } else {
            // Function exists but parameters might be wrong (expected)
            console.log('   ✅ Search Functions: Deployed');
            this.result.database.functionsDeployed = true;
          }
        } else {
          console.log('   ✅ Search Functions: Functional');
          this.result.database.functionsDeployed = true;
        }
      } catch (error) {
        console.log('   ⚠️  Search Functions: Cannot verify');
      }
    }
    
    console.log('');
  }

  private async testEmbeddingPipeline(): Promise<void> {
    console.log('🤖 Testing Embedding Pipeline...');
    
    if (!this.result.embedding.openaiConfigured) {
      console.log('   ❌ OpenAI: Not configured');
      return;
    }
    
    try {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      
      // Test embedding generation
      const testResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'Test embedding for Oracle system'
      });
      
      if (testResponse.data[0].embedding.length === 1536) {
        this.result.embedding.testEmbedding = true;
        this.result.embedding.pipelineReady = 
          this.result.database.schemaDeployed && 
          this.result.database.functionsDeployed;
        
        console.log('   ✅ OpenAI: Connection successful');
        console.log('   ✅ Embedding: 1536-dimension vector generated');
        
        if (this.result.embedding.pipelineReady) {
          console.log('   ✅ Pipeline: Ready for content processing');
        } else {
          console.log('   ⚠️  Pipeline: Awaiting database schema deployment');
        }
      }
      
    } catch (error: any) {
      this.result.embedding.error = error.message;
      console.log('   ❌ OpenAI: Connection failed');
      console.log(`      Error: ${error.message}`);
      
      if (error.message.includes('Incorrect API key')) {
        console.log('      💡 Check: Verify your OpenAI API key is correct');
      } else if (error.message.includes('quota')) {
        console.log('      💡 Check: OpenAI account usage limits');
      }
    }
    
    console.log('');
  }

  private async analyzeMigrationStatus(): Promise<void> {
    console.log('📋 Analyzing Migration Requirements...');
    
    const migrationDir = join(process.cwd(), 'supabase', 'migrations');
    const migrationFiles = [
      '001_enable_vector_extension.sql',
      '002_create_oracle_knowledge_schema.sql',
      '003_create_vector_search_functions.sql'
    ];
    
    this.result.migration.canDeploy = this.result.database.connected;
    
    for (const file of migrationFiles) {
      const filePath = join(migrationDir, file);
      if (existsSync(filePath)) {
        this.result.migration.files.push(file);
        console.log(`   ✅ ${file}: Available`);
      } else {
        console.log(`   ❌ ${file}: Missing`);
      }
    }
    
    if (this.result.migration.needed) {
      console.log('\n   📝 Migration Required: Oracle schema not deployed');
      if (this.result.migration.canDeploy) {
        console.log('   🚀 Ready to deploy: All migration files available');
      } else {
        console.log('   ⏸️  Cannot deploy: Database connection required');
      }
    } else if (this.result.database.schemaDeployed) {
      console.log('   ✅ Schema Status: Already deployed');
    }
    
    console.log('');
  }

  private generateSystemReport(): void {
    console.log('📊 ORACLE SYSTEM STATUS REPORT');
    console.log('===============================\n');
    
    // Environment Status
    console.log('⚙️  ENVIRONMENT:');
    if (this.result.environment.configured) {
      console.log('   ✅ Configuration: Complete');
    } else {
      console.log('   🔴 Configuration: Incomplete');
      this.result.environment.issues.forEach(issue => {
        console.log(`      • ${issue}`);
      });
    }
    
    // Database Status  
    console.log('\n🗄️ DATABASE:');
    console.log(`   Connection: ${this.result.database.connected ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   Schema: ${this.result.database.schemaDeployed ? '✅ Deployed' : '⚠️ Needs Deployment'}`);
    console.log(`   Functions: ${this.result.database.functionsDeployed ? '✅ Available' : '⚠️ Needs Deployment'}`);
    
    if (this.result.database.error) {
      console.log(`   Error: ${this.result.database.error}`);
    }
    
    // Embedding Status
    console.log('\n🤖 EMBEDDING PIPELINE:');
    console.log(`   OpenAI: ${this.result.embedding.openaiConfigured ? '✅ Configured' : '❌ Not Configured'}`);
    console.log(`   Test Embedding: ${this.result.embedding.testEmbedding ? '✅ Successful' : '❌ Failed'}`);
    console.log(`   Pipeline: ${this.result.embedding.pipelineReady ? '✅ Ready' : '⚠️ Not Ready'}`);
    
    // Overall Status
    this.determineOverallStatus();
    console.log('\n🎯 OVERALL STATUS:');
    const statusEmoji = { 'ready': '🟢', 'partial': '🟡', 'blocked': '🔴' };
    const statusText = { 
      'ready': 'SYSTEM READY', 
      'partial': 'PARTIAL SETUP', 
      'blocked': 'SETUP REQUIRED' 
    };
    console.log(`   ${statusEmoji[this.result.overall]} ${statusText[this.result.overall]}`);
    
    // Next Steps
    console.log('\n🚀 NEXT STEPS:');
    this.generateNextSteps();
    this.result.nextSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    
    console.log('\n🔮 ELENA EXECUTION - ORACLE SYSTEM TEST COMPLETE');
  }

  private determineOverallStatus(): void {
    if (this.result.environment.configured && 
        this.result.database.connected && 
        this.result.database.schemaDeployed && 
        this.result.embedding.openaiConfigured) {
      this.result.overall = 'ready';
    } else if (this.result.database.connected || this.result.embedding.openaiConfigured) {
      this.result.overall = 'partial';
    } else {
      this.result.overall = 'blocked';
    }
  }

  private generateNextSteps(): void {
    this.result.nextSteps = [];
    
    if (!this.result.environment.configured) {
      this.result.nextSteps.push('Configure Supabase project and API keys in .env.local');
      this.result.nextSteps.push('Add OpenAI API key to .env.local');
      return;
    }
    
    if (!this.result.database.connected) {
      this.result.nextSteps.push('Fix database connection - verify credentials');
      return;
    }
    
    if (this.result.migration.needed) {
      this.result.nextSteps.push('Deploy Oracle schema using Supabase migrations');
      this.result.nextSteps.push('Run: Copy SQL from migration files to Supabase SQL Editor');
    }
    
    if (!this.result.embedding.openaiConfigured) {
      this.result.nextSteps.push('Configure OpenAI API key for embedding generation');
    }
    
    if (this.result.overall === 'ready') {
      this.result.nextSteps.push('✅ Ready to run: npm run embed-content');
      this.result.nextSteps.push('✅ Ready to process Elena\'s organized content');
    }
  }
}

// Main execution
async function main() {
  const tester = new OracleSystemTester();
  
  try {
    const result = await tester.runCompleteTest();
    
    // Exit with appropriate code
    if (result.overall === 'ready') {
      console.log('\n✅ System ready for content embedding!');
      process.exit(0);
    } else if (result.overall === 'partial') {
      console.log('\n⚠️  System partially configured - see next steps above');
      process.exit(1);
    } else {
      console.log('\n❌ System setup required - see configuration guide above');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 System test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { OracleSystemTester, main as testOracleSystem };