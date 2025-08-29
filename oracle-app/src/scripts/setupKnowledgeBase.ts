#!/usr/bin/env node
import { processAllKnowledgeBase } from '../lib/documentProcessor';
import { initializeOracleDatabase } from '../lib/supabase';

async function setupOracleKnowledgeBase() {
  console.log('🔮 Setting up Oracle Knowledge Base...\n');

  try {
    // Step 1: Display database setup instructions
    console.log('📋 Step 1: Database Setup');
    console.log('Please run the following in your Supabase SQL Editor first:\n');
    initializeOracleDatabase();
    
    console.log('\n⚠️  After running the SQL commands above in Supabase, restart this script.');
    console.log('   Make sure to enable the vector extension and create all tables.');
    
    // Uncomment the following lines after database setup is complete
    // console.log('\n📚 Step 2: Processing Knowledge Base Documents...');
    // await processAllKnowledgeBase();
    
    // console.log('\n✅ Oracle Knowledge Base setup complete!');
    // console.log('🎯 Your Oracle is now ready with Alex Hormozi wisdom integration');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupOracleKnowledgeBase().then(() => {
    console.log('\n🌟 Oracle Knowledge Base initialization started!');
    console.log('   Follow the database setup instructions above to complete the process.');
  });
}

export { setupOracleKnowledgeBase };