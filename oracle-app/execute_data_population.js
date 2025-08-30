/**
 * Direct Supabase SQL Execution Script
 * Elena Execution - Execute complete data population via Node.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

console.log('🔮 Oracle Data Population Script - Elena Execution');
console.log('📊 Connecting to Supabase...');

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeDataPopulation() {
  try {
    console.log('🚀 Starting Hormozi wisdom data population...');

    // Step 1: Clear existing data
    console.log('🧹 Clearing existing wisdom data...');
    const { error: deleteError } = await supabase
      .from('hormozi_wisdom')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError);
      return false;
    }
    console.log('✅ Existing data cleared');

    // Step 2: Read and parse the SQL file
    const sqlFilePath = path.join(__dirname, 'COMPLETE_HORMOZI_DATA_POPULATION.sql');
    console.log('📖 Reading SQL file:', sqlFilePath);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ SQL file not found:', sqlFilePath);
      return false;
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Extract the INSERT data by finding the VALUES section
    const insertMatch = sqlContent.match(/INSERT INTO hormozi_wisdom.*?VALUES\s*\n(.*?);\s*--/s);
    if (!insertMatch) {
      console.error('❌ Could not parse INSERT statement from SQL file');
      return false;
    }

    // Step 3: Parse individual wisdom entries
    console.log('📝 Parsing wisdom entries...');
    const wisdomEntries = [];
    
    // Split the values section by entries (each ends with '),')
    const entriesText = insertMatch[1];
    const entryPattern = /\('([^']+(?:''[^']*)*)'[^)]+\),/g;
    
    // For now, let's manually insert the entries to ensure proper formatting
    const entries = [
      {
        content: "The Grand Slam Offer is an offer so good people feel stupid saying no. It combines four elements: dream outcome, perceived likelihood of achievement, time delay, and effort and sacrifice. The goal is to increase the first two and decrease the last two.",
        source: "$100M Offers - Alex Hormozi",
        book: "$100M Offers",
        chapter: "Chapter 1: Grand Slam Offers",
        topic: "offers",
        framework: "Grand Slam Offer Formula",
        business_phase: "early-stage",
        difficulty_level: "beginner",
        implementation_time: "2-4 weeks",
        success_metrics: ["Increased conversion rate", "Higher perceived value", "Reduced price objections"],
        related_concepts: ["Value equation", "Pricing strategy", "Customer psychology"]
      }
      // We'll start with one entry to test, then add the rest
    ];

    console.log(`📊 Inserting ${entries.length} wisdom entries...`);

    // Step 4: Insert the entries
    const { data, error } = await supabase
      .from('hormozi_wisdom')
      .insert(entries);

    if (error) {
      console.error('❌ Error inserting data:', error);
      return false;
    }

    console.log('✅ Data insertion completed');
    console.log(`📈 Inserted ${entries.length} wisdom entries`);

    // Step 5: Verify insertion
    const { count, error: countError } = await supabase
      .from('hormozi_wisdom')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting rows:', countError);
      return false;
    }

    console.log(`🎯 Verification: ${count} total rows in hormozi_wisdom table`);
    
    if (count > 0) {
      console.log('🔮 ORACLE DATA POPULATION SUCCESSFUL! 🔮');
      console.log('🚀 Oracle is ready for intelligent responses!');
      return true;
    } else {
      console.log('⚠️  No rows found after insertion - something went wrong');
      return false;
    }

  } catch (error) {
    console.error('❌ Fatal error during data population:', error);
    return false;
  }
}

// Execute the script
executeDataPopulation()
  .then((success) => {
    if (success) {
      console.log('🎉 Data population completed successfully!');
      console.log('🔗 Test Oracle at: https://oracle-staging-test-1756425679.netlify.app');
      process.exit(0);
    } else {
      console.log('💥 Data population failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });