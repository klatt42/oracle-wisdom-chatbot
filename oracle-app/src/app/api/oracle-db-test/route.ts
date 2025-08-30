import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    function_execution: {
      started: true,
      environment_check: {},
      supabase_connection: {},
      table_existence: {},
      data_verification: {},
      query_testing: {}
    }
  };

  console.log('🔍 ORACLE DATABASE DIAGNOSTIC - Starting comprehensive test...');

  try {
    // Step 1: Environment Variables Check
    console.log('Step 1: Environment Variables Check');
    diagnostics.function_execution.environment_check = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      supabase_url_value: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      all_required_present: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    };

    // Step 2: Supabase Connection Test
    console.log('Step 2: Supabase Connection Test');
    try {
      // Test basic connection
      const connectionStart = Date.now();
      const { data: pingData, error: pingError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
      
      const connectionTime = Date.now() - connectionStart;
      
      diagnostics.function_execution.supabase_connection = {
        connection_successful: !pingError,
        connection_time_ms: connectionTime,
        error: pingError?.message || null,
        available_tables: pingData?.map(t => t.table_name) || [],
        table_count: pingData?.length || 0
      };

      console.log('Supabase Connection Result:', diagnostics.function_execution.supabase_connection);

    } catch (connError) {
      diagnostics.function_execution.supabase_connection = {
        connection_successful: false,
        error: connError instanceof Error ? connError.message : String(connError),
        exception_thrown: true
      };
    }

    // Step 3: Check if hormozi_wisdom table exists
    console.log('Step 3: Check hormozi_wisdom table existence');
    try {
      const tableCheckStart = Date.now();
      const { data: tableData, error: tableError } = await supabaseAdmin
        .from('hormozi_wisdom')
        .select('id')
        .limit(1);
      
      const tableCheckTime = Date.now() - tableCheckStart;
      
      diagnostics.function_execution.table_existence = {
        table_exists: !tableError,
        check_time_ms: tableCheckTime,
        error: tableError?.message || null,
        can_access_table: !!tableData || tableData === null // null means empty table, which is still accessible
      };

      console.log('Table Existence Check:', diagnostics.function_execution.table_existence);

    } catch (tableError) {
      diagnostics.function_execution.table_existence = {
        table_exists: false,
        error: tableError instanceof Error ? tableError.message : String(tableError),
        exception_thrown: true
      };
    }

    // Step 4: Data Verification (if table exists)
    console.log('Step 4: Data Verification');
    if (diagnostics.function_execution.table_existence && 
        'table_exists' in diagnostics.function_execution.table_existence && 
        diagnostics.function_execution.table_existence.table_exists) {
      try {
        // Count total rows
        const countStart = Date.now();
        const { data: countData, error: countError, count } = await supabaseAdmin
          .from('hormozi_wisdom')
          .select('*', { count: 'exact', head: true });
        
        const countTime = Date.now() - countStart;
        
        // Get sample data
        const { data: sampleData, error: sampleError } = await supabaseAdmin
          .from('hormozi_wisdom')
          .select('id, content, source, topic, framework')
          .limit(3);

        diagnostics.function_execution.data_verification = {
          row_count: count || 0,
          count_query_time_ms: countTime,
          count_error: countError?.message || null,
          sample_data: sampleData || [],
          sample_error: sampleError?.message || null,
          has_content: (count || 0) > 0,
          expected_139_rows: count === 139,
          sample_content_preview: sampleData?.map(row => ({
            id: row.id,
            content_preview: row.content?.substring(0, 100) + '...',
            source: row.source,
            topic: row.topic,
            framework: row.framework
          })) || []
        };

        console.log('Data Verification:', diagnostics.function_execution.data_verification);

      } catch (dataError) {
        diagnostics.function_execution.data_verification = {
          error: dataError instanceof Error ? dataError.message : String(dataError),
          exception_thrown: true
        };
      }
    } else {
      diagnostics.function_execution.data_verification = {
        skipped: true,
        reason: 'Table does not exist'
      };
    }

    // Step 5: Query Testing (test search functions)
    console.log('Step 5: Query Testing');
    if (diagnostics.function_execution.table_existence && 
        'table_exists' in diagnostics.function_execution.table_existence && 
        diagnostics.function_execution.table_existence.table_exists &&
        diagnostics.function_execution.data_verification &&
        'has_content' in diagnostics.function_execution.data_verification &&
        diagnostics.function_execution.data_verification.has_content) {
      
      try {
        // Test basic text search
        const queryStart = Date.now();
        const { data: queryData, error: queryError } = await supabaseAdmin
          .from('hormozi_wisdom')
          .select('id, content, source, topic')
          .textSearch('content', 'business')
          .limit(2);
        
        const queryTime = Date.now() - queryStart;

        // Test RPC function if exists
        let rpcResult = null;
        let rpcError = null;
        try {
          const { data: rpcData, error: rpcErr } = await supabaseAdmin
            .rpc('search_hormozi_wisdom', {
              query_text: 'scaling business',
              match_threshold: 0.7,
              match_count: 2
            });
          rpcResult = rpcData;
          rpcError = rpcErr;
        } catch (err) {
          rpcError = err instanceof Error ? err.message : String(err);
        }

        diagnostics.function_execution.query_testing = {
          text_search_successful: !queryError,
          text_search_time_ms: queryTime,
          text_search_error: queryError?.message || null,
          text_search_results: queryData?.length || 0,
          rpc_function_available: !rpcError,
          rpc_function_error: rpcError,
          rpc_results_count: Array.isArray(rpcResult) ? rpcResult.length : 0,
          search_functionality: !queryError ? 'working' : 'failed'
        };

        console.log('Query Testing:', diagnostics.function_execution.query_testing);

      } catch (queryError) {
        diagnostics.function_execution.query_testing = {
          error: queryError instanceof Error ? queryError.message : String(queryError),
          exception_thrown: true
        };
      }
    } else {
      diagnostics.function_execution.query_testing = {
        skipped: true,
        reason: 'No table or no data to query'
      };
    }

    // Final Assessment
    const connectionOk = diagnostics.function_execution.supabase_connection && 
                        'connection_successful' in diagnostics.function_execution.supabase_connection &&
                        diagnostics.function_execution.supabase_connection.connection_successful;
    
    const tableExists = diagnostics.function_execution.table_existence && 
                       'table_exists' in diagnostics.function_execution.table_existence &&
                       diagnostics.function_execution.table_existence.table_exists;
    
    const hasContent = diagnostics.function_execution.data_verification && 
                      'has_content' in diagnostics.function_execution.data_verification &&
                      diagnostics.function_execution.data_verification.has_content;

    const finalAssessment = {
      database_ready: connectionOk && tableExists && hasContent,
      main_issues: [] as string[],
      next_steps: [] as string[]
    };

    if (!connectionOk) {
      finalAssessment.main_issues.push('Supabase connection failed');
      finalAssessment.next_steps.push('Check environment variables and Supabase project status');
    }

    if (!tableExists) {
      finalAssessment.main_issues.push('hormozi_wisdom table does not exist');
      finalAssessment.next_steps.push('Run database schema creation SQL');
    }

    if (!hasContent) {
      finalAssessment.main_issues.push('No data in hormozi_wisdom table');
      finalAssessment.next_steps.push('Populate table with Hormozi wisdom content');
    }

    if (finalAssessment.database_ready) {
      finalAssessment.next_steps.push('Test Oracle API routes with real data');
    }

    console.log('🎯 DIAGNOSTIC COMPLETE - Assessment:', finalAssessment);

    return NextResponse.json({
      status: 'Oracle Database Diagnostic Complete',
      overall_status: finalAssessment.database_ready ? 'READY' : 'NEEDS_SETUP',
      diagnostics,
      assessment: finalAssessment,
      debug_info: {
        function_runtime: 'nodejs',
        execution_environment: 'netlify_serverless',
        supabase_client: 'admin_service_role'
      }
    });

  } catch (globalError) {
    console.error('❌ DIAGNOSTIC FAILED:', globalError);
    
    return NextResponse.json({
      status: 'Oracle Database Diagnostic Failed', 
      error: globalError instanceof Error ? globalError.message : String(globalError),
      diagnostics,
      debug_info: {
        function_crashed: true,
        crash_point: 'global_exception_handler'
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Use GET method for database diagnostics',
    available_endpoints: {
      'GET /api/oracle-db-test': 'Run comprehensive database diagnostics'
    }
  });
}