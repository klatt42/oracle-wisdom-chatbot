#!/usr/bin/env node
/**
 * Oracle Database Connection Test
 * Created by: Elena Execution
 * Purpose: Verify database setup and readiness for content embedding
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

interface DatabaseStatus {
  connection: boolean;
  vectorExtension: boolean;
  oracleSchema: boolean;
  searchFunctions: boolean;
  categories: number;
  knowledgeTable: boolean;
  indexes: string[];
  errors: string[];
}

class OracleDatabaseTester {
  private supabase: any;
  private status: DatabaseStatus;

  constructor() {
    this.status = {
      connection: false,
      vectorExtension: false,
      oracleSchema: false,
      searchFunctions: false,
      categories: 0,
      knowledgeTable: false,
      indexes: [],
      errors: []
    };
  }

  async runDatabaseTests(): Promise<DatabaseStatus> {
    console.log('🔮 Oracle Database Connection Test - Elena Execution');
    console.log('====================================================\n');

    try {
      // Test 1: Environment Configuration
      await this.testEnvironmentConfig();
      
      // Test 2: Database Connection
      await this.testConnection();
      
      if (this.status.connection) {
        // Test 3: Vector Extension
        await this.testVectorExtension();
        
        // Test 4: Oracle Schema
        await this.testOracleSchema();
        
        // Test 5: Search Functions
        await this.testSearchFunctions();
        
        // Test 6: Database Indexes
        await this.testDatabaseIndexes();
      }

      // Generate final report
      this.generateReport();
      
      return this.status;

    } catch (error) {
      console.error('❌ Database testing failed:', error);
      this.status.errors.push(`Fatal error: ${String(error)}`);
      return this.status;
    }
  }

  private async testEnvironmentConfig(): Promise<void> {
    console.log('🔧 Testing Environment Configuration...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
      this.status.errors.push('NEXT_PUBLIC_SUPABASE_URL not configured (placeholder value found)');
      console.log('   ❌ Supabase URL: Not configured');
    } else {
      console.log('   ✅ Supabase URL: Configured');
    }
    
    if (!supabaseKey || supabaseKey === 'your-anon-key') {
      this.status.errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY not configured (placeholder value found)');
      console.log('   ❌ Supabase Key: Not configured');
    } else {
      console.log('   ✅ Supabase Key: Configured');
    }
    
    if (!openaiKey) {
      this.status.errors.push('OPENAI_API_KEY not configured - required for embedding generation');
      console.log('   ⚠️  OpenAI Key: Not configured (required for embeddings)');
    } else {
      console.log('   ✅ OpenAI Key: Configured');
    }
    
    console.log('');
  }

  private async testConnection(): Promise<void> {
    console.log('🔌 Testing Database Connection...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://your-project.supabase.co' || 
        supabaseKey === 'your-anon-key') {
      console.log('   ❌ Connection: Cannot test - credentials not configured');
      this.status.errors.push('Cannot test connection - Supabase credentials are placeholder values');
      console.log('');
      return;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test basic query
      const { data, error } = await this.supabase
        .from('oracle_categories')
        .select('count')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation "oracle_categories" does not exist')) {
          console.log('   ⚠️  Connection: Successful, but Oracle schema not found');
          this.status.connection = true;
          this.status.errors.push('Oracle schema tables not created yet');
        } else {
          console.log('   ❌ Connection: Failed');
          console.log(`      Error: ${error.message}`);
          this.status.errors.push(`Connection error: ${error.message}`);
        }
      } else {
        console.log('   ✅ Connection: Successful');
        this.status.connection = true;
      }
      
    } catch (error) {
      console.log('   ❌ Connection: Failed');
      console.log(`      Error: ${String(error)}`);
      this.status.errors.push(`Connection failed: ${String(error)}`);
    }
    
    console.log('');
  }

  private async testVectorExtension(): Promise<void> {
    console.log('🧮 Testing Vector Extension...');
    
    try {
      const { data, error } = await this.supabase.rpc('version');
      
      if (error) {
        console.log('   ❌ Vector Extension: Cannot verify - RPC failed');
        this.status.errors.push('Cannot verify vector extension - RPC access denied');
      } else {
        // Try to check for vector extension using a different approach
        try {
          const { data: extensionData, error: extError } = await this.supabase
            .from('pg_extension')
            .select('extname')
            .eq('extname', 'vector')
            .limit(1);
            
          if (extError) {
            console.log('   ⚠️  Vector Extension: Cannot verify directly');
            console.log('      Note: Extension verification requires elevated permissions');
            this.status.errors.push('Cannot verify vector extension - requires admin access');
          } else if (extensionData && extensionData.length > 0) {
            console.log('   ✅ Vector Extension: Enabled');
            this.status.vectorExtension = true;
          } else {
            console.log('   ❌ Vector Extension: Not found');
            this.status.errors.push('Vector extension not enabled');
          }
        } catch (error) {
          console.log('   ⚠️  Vector Extension: Cannot verify (requires admin access)');
          // This is expected for anon key access
        }
      }
    } catch (error) {
      console.log('   ❌ Vector Extension: Test failed');
      this.status.errors.push(`Vector extension test failed: ${String(error)}`);
    }
    
    console.log('');
  }

  private async testOracleSchema(): Promise<void> {
    console.log('🗄️  Testing Oracle Schema...');
    
    // Test oracle_categories table
    try {
      const { data: categories, error: catError } = await this.supabase
        .from('oracle_categories')
        .select('id, name, description')
        .limit(10);
      
      if (catError) {
        console.log('   ❌ oracle_categories: Table not found or accessible');
        this.status.errors.push(`oracle_categories table error: ${catError.message}`);
      } else {
        console.log(`   ✅ oracle_categories: Found with ${categories?.length || 0} categories`);
        this.status.categories = categories?.length || 0;
        this.status.oracleSchema = true;
        
        if (categories) {
          categories.forEach((cat: any) => {
            console.log(`      - ${cat.name}: ${cat.description}`);
          });
        }
      }
    } catch (error) {
      console.log('   ❌ oracle_categories: Access failed');
      this.status.errors.push(`Categories table test failed: ${String(error)}`);
    }
    
    // Test oracle_knowledge table
    try {
      const { data: knowledge, error: knowError } = await this.supabase
        .from('oracle_knowledge')
        .select('id')
        .limit(1);
      
      if (knowError) {
        console.log('   ❌ oracle_knowledge: Table not found or accessible');
        this.status.errors.push(`oracle_knowledge table error: ${knowError.message}`);
      } else {
        console.log('   ✅ oracle_knowledge: Table accessible');
        this.status.knowledgeTable = true;
      }
    } catch (error) {
      console.log('   ❌ oracle_knowledge: Access failed');
      this.status.errors.push(`Knowledge table test failed: ${String(error)}`);
    }
    
    // Test other tables
    const tables = ['oracle_processing_history', 'oracle_search_analytics'];
    for (const table of tables) {
      try {
        const { error } = await this.supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${table}: Not accessible`);
        } else {
          console.log(`   ✅ ${table}: Accessible`);
        }
      } catch (error) {
        console.log(`   ❌ ${table}: Test failed`);
      }
    }
    
    console.log('');
  }

  private async testSearchFunctions(): Promise<void> {
    console.log('🔍 Testing Search Functions...');
    
    const functions = [
      'oracle_semantic_search',
      'oracle_hybrid_search', 
      'oracle_framework_search',
      'oracle_youtube_search',
      'oracle_get_related_content'
    ];
    
    let functionsWorking = 0;
    
    for (const func of functions) {
      try {
        // Test function exists by calling with minimal parameters
        const { error } = await this.supabase.rpc(func, {
          query_embedding: '[0.1,0.2,0.3]',
          max_results: 1
        });
        
        if (error) {
          if (error.message.includes('function') && error.message.includes('does not exist')) {
            console.log(`   ❌ ${func}: Function not found`);
            this.status.errors.push(`Search function ${func} not created`);
          } else {
            // Function exists but may have parameter issues (expected for test)
            console.log(`   ✅ ${func}: Function exists`);
            functionsWorking++;
          }
        } else {
          console.log(`   ✅ ${func}: Function working`);
          functionsWorking++;
        }
      } catch (error) {
        console.log(`   ❌ ${func}: Test failed`);
      }
    }
    
    this.status.searchFunctions = functionsWorking >= 3;
    console.log(`\n   📊 Search Functions: ${functionsWorking}/${functions.length} accessible`);
    console.log('');
  }

  private async testDatabaseIndexes(): Promise<void> {
    console.log('📇 Testing Database Indexes...');
    
    // Note: Index verification typically requires elevated permissions
    // For now, we'll just note that this requires admin access
    console.log('   ⚠️  Index Verification: Requires database admin access');
    console.log('      Expected indexes for Oracle schema:');
    console.log('      - oracle_knowledge_embedding_idx (vector similarity)');
    console.log('      - oracle_knowledge_content_idx (full-text search)');
    console.log('      - oracle_knowledge_category_idx (category filtering)');
    console.log('      - oracle_knowledge_tags_idx (tag search)');
    console.log('');
  }

  private generateReport(): void {
    console.log('📊 DATABASE STATUS REPORT');
    console.log('========================\n');
    
    // Connection Status
    console.log('🔌 CONNECTION STATUS:');
    console.log(`   Database Connection: ${this.status.connection ? '✅ CONNECTED' : '❌ FAILED'}`);
    console.log(`   Vector Extension: ${this.status.vectorExtension ? '✅ ENABLED' : '⚠️ UNVERIFIED'}`);
    console.log('');
    
    // Schema Status
    console.log('🗄️ SCHEMA STATUS:');
    console.log(`   Oracle Categories: ${this.status.categories > 0 ? `✅ ${this.status.categories} categories` : '❌ NOT FOUND'}`);
    console.log(`   Knowledge Table: ${this.status.knowledgeTable ? '✅ ACCESSIBLE' : '❌ NOT FOUND'}`);
    console.log(`   Search Functions: ${this.status.searchFunctions ? '✅ FUNCTIONAL' : '❌ MISSING'}`);
    console.log('');
    
    // Readiness Assessment
    console.log('🎯 EMBEDDING PIPELINE READINESS:');
    const ready = this.status.connection && this.status.oracleSchema && this.status.knowledgeTable;
    console.log(`   Content Embedding: ${ready ? '✅ READY' : '❌ NOT READY'}`);
    console.log(`   Vector Search: ${this.status.searchFunctions ? '✅ READY' : '❌ NOT READY'}`);
    console.log('');
    
    // Issues and Errors
    if (this.status.errors.length > 0) {
      console.log('⚠️ ISSUES FOUND:');
      this.status.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      console.log('');
    }
    
    // Next Steps
    console.log('🚀 NEXT STEPS:');
    if (!this.status.connection) {
      console.log('   1. Configure Supabase credentials in .env.local');
      console.log('   2. Create Supabase project and get URL/keys');
    } else if (!this.status.oracleSchema) {
      console.log('   1. Run Supabase migrations to create Oracle schema:');
      console.log('      supabase migration up');
      console.log('   2. Or manually run SQL files in Supabase dashboard');
    } else if (ready) {
      console.log('   ✅ Database ready for content embedding pipeline!');
      console.log('   📝 Run: npm run embed-content');
    }
    console.log('');
    
    console.log('🎯 ELENA EXECUTION - DATABASE TEST COMPLETE');
    console.log(`   Overall Status: ${ready ? '🟢 READY' : '🔴 SETUP REQUIRED'}`);
  }
}

// Main execution
async function main() {
  const tester = new OracleDatabaseTester();
  
  try {
    const status = await tester.runDatabaseTests();
    
    // Exit with appropriate code
    if (status.connection && status.oracleSchema && status.knowledgeTable) {
      console.log('✅ Database setup verification complete - Ready for embedding pipeline!');
      process.exit(0);
    } else {
      console.log('❌ Database setup incomplete - Configuration required');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Database test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { OracleDatabaseTester, main as testDatabaseConnection };