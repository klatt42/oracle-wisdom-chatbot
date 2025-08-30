/**
 * Oracle Database Debug Script
 * Elena Execution - Verify actual database state and connectivity
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 ORACLE DATABASE DEBUG - Elena Execution');
console.log('='.repeat(60));

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ CRITICAL: Missing Supabase credentials');
  console.log('SUPABASE_URL:', supabaseUrl ? 'Found' : 'MISSING');
  console.log('SERVICE_KEY:', supabaseServiceKey ? 'Found' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function debugDatabase() {
  try {
    console.log('🔍 TESTING DATABASE CONNECTIVITY...');
    console.log('');

    // Test 1: Basic connection
    console.log('1. Testing basic Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('hormozi_wisdom')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ CONNECTION FAILED:', connectionError);
      return false;
    }
    console.log('✅ Connection successful');

    // Test 2: Verify table exists and get row count
    console.log('');
    console.log('2. Checking hormozi_wisdom table...');
    const { count, error: countError } = await supabase
      .from('hormozi_wisdom')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ TABLE ACCESS FAILED:', countError);
      return false;
    }
    
    console.log(`📊 Row count: ${count} rows`);
    if (count === 0) {
      console.log('⚠️  TABLE IS EMPTY - Population may have failed');
    } else {
      console.log('✅ Table contains data');
    }

    // Test 3: Sample data retrieval
    console.log('');
    console.log('3. Retrieving sample data...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('hormozi_wisdom')
      .select('id, content, topic, framework')
      .limit(3);

    if (sampleError) {
      console.error('❌ SAMPLE DATA RETRIEVAL FAILED:', sampleError);
    } else {
      console.log(`📋 Sample entries (${sampleData.length} rows):`);
      sampleData.forEach((row, index) => {
        console.log(`   ${index + 1}. Topic: ${row.topic}`);
        console.log(`      Framework: ${row.framework}`);
        console.log(`      Content: ${row.content.substring(0, 100)}...`);
        console.log('');
      });
    }

    // Test 4: Category breakdown
    console.log('4. Analyzing category distribution...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('hormozi_wisdom')
      .select('topic');

    if (categoryError) {
      console.error('❌ CATEGORY ANALYSIS FAILED:', categoryError);
    } else {
      const breakdown = {};
      categoryData.forEach(row => {
        breakdown[row.topic] = (breakdown[row.topic] || 0) + 1;
      });
      
      console.log('📊 Category breakdown:');
      Object.entries(breakdown).forEach(([topic, count]) => {
        console.log(`   ${topic}: ${count} entries`);
      });
    }

    // Test 5: Check search functions
    console.log('');
    console.log('5. Testing search functions...');
    
    try {
      const { data: searchTest, error: searchError } = await supabase
        .rpc('search_hormozi_wisdom', {
          query_text: 'Grand Slam Offer',
          match_count: 2
        });

      if (searchError) {
        console.error('❌ SEARCH FUNCTION FAILED:', searchError.message);
        console.log('🔧 This may indicate missing search functions');
      } else {
        console.log(`✅ Search function works - found ${searchTest.length} results`);
        if (searchTest.length > 0) {
          console.log('📋 Search results:');
          searchTest.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.content.substring(0, 80)}...`);
            console.log(`      Similarity: ${result.similarity}`);
          });
        }
      }
    } catch (funcError) {
      console.error('❌ SEARCH FUNCTION ERROR:', funcError.message);
    }

    // Test 6: Check table schema
    console.log('');
    console.log('6. Verifying table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('hormozi_wisdom')
      .select('*')
      .limit(1);

    if (!schemaError && schemaData.length > 0) {
      console.log('✅ Table schema verification:');
      const columns = Object.keys(schemaData[0]);
      console.log(`📋 Columns (${columns.length}):`, columns.join(', '));
      
      // Check for required columns
      const requiredColumns = ['content', 'topic', 'framework', 'success_metrics', 'related_concepts'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      if (missingColumns.length > 0) {
        console.log('⚠️  Missing required columns:', missingColumns.join(', '));
      } else {
        console.log('✅ All required columns present');
      }
    }

    return count > 0;

  } catch (error) {
    console.error('❌ CRITICAL DATABASE ERROR:', error);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Execute debug
debugDatabase()
  .then((success) => {
    console.log('');
    console.log('='.repeat(60));
    if (success) {
      console.log('✅ DATABASE DEBUG COMPLETE - Database appears functional');
    } else {
      console.log('❌ DATABASE DEBUG COMPLETE - Issues detected');
    }
    console.log('='.repeat(60));
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 DEBUG SCRIPT FAILED:', error);
    process.exit(1);
  });