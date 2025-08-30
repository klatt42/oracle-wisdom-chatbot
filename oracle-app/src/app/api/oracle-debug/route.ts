import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Oracle Database Debug - Starting diagnostic...');
    
    // Test 1: Check database connection and available tables
    console.log('Test 1: Database Connection & Available Tables');
    
    // Check what tables exist
    const { data: tablesData, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    console.log('Available tables:', tablesData?.map(t => t.table_name) || []);
    
    // Try to connect to hormozi_wisdom table
    const { data: connectionTest, error: connectionError } = await supabaseAdmin
      .from('hormozi_wisdom')
      .select('count')
      .single();
    
    if (connectionError) {
      console.log('❌ hormozi_wisdom table error:', connectionError);
    } else {
      console.log('✅ hormozi_wisdom table accessible');
    }

    // Test 2: Check table structure and content count
    console.log('Test 2: Table Content Count');
    const { data: countData, error: countError } = await supabaseAdmin
      .from('hormozi_wisdom')
      .select('id', { count: 'exact', head: true });
    
    const contentCount = countData?.length || 0;
    console.log('Content Count:', contentCount);

    // Test 3: Check available columns
    console.log('Test 3: Available Columns Check');
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('hormozi_wisdom')
      .select('*')
      .limit(1);
    
    const availableColumns = sampleData?.[0] ? Object.keys(sampleData[0]) : [];
    console.log('Available columns:', availableColumns);

    // Test 4: Try RPC function
    console.log('Test 4: RPC Function Test');
    let rpcResult = null;
    let rpcError = null;
    try {
      const { data: rpcData, error: rpcErr } = await supabaseAdmin
        .rpc('search_hormozi_wisdom', {
          query_text: 'business scaling',
          match_threshold: 0.7,
          match_count: 3
        });
      rpcResult = rpcData;
      rpcError = rpcErr;
    } catch (err) {
      rpcError = err;
    }

    // Test 5: Environment variables check
    const envCheck = {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      tests: {
        database_connection: {
          success: !connectionError,
          error: connectionError?.message || null,
          available_tables: tablesData?.map(t => t.table_name) || [],
          tables_error: tablesError?.message || null
        },
        content_count: {
          count: contentCount,
          error: countError?.message || null
        },
        table_structure: {
          available_columns: availableColumns,
          sample_data: sampleData?.[0] || null,
          error: sampleError?.message || null
        },
        rpc_function: {
          success: !rpcError,
          result: rpcResult,
          error: rpcError ? (rpcError instanceof Error ? rpcError.message : String(rpcError)) : null
        },
        environment_variables: envCheck
      },
      diagnostics: {
        database_accessible: !connectionError,
        content_available: contentCount > 0,
        expected_content_count: 139,
        content_match: contentCount === 139,
        rpc_functions_available: !rpcError
      },
      recommendations: []
    });

  } catch (error) {
    console.error('Oracle Debug Error:', error);
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}