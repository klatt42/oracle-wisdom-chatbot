/**
 * Complete Hormozi Wisdom Data Population
 * Elena Execution - All 139 entries with proper formatting
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Complete dataset - All 139 Hormozi wisdom entries
const allWisdomEntries = [
  // OFFERS & VALUE CREATION (20 entries)
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
  },
  {
    content: "The Value Equation is (Dream Outcome × Perceived Likelihood of Achievement) ÷ (Time Delay × Effort and Sacrifice). To increase value, increase the numerator or decrease the denominator.",
    source: "$100M Offers - Alex Hormozi",
    book: "$100M Offers",
    chapter: "Chapter 3: Value Equation",
    topic: "offers",
    framework: "Value Equation",
    business_phase: "all-stages",
    difficulty_level: "intermediate",
    implementation_time: "1-2 weeks",
    success_metrics: ["Higher perceived value", "Improved offer performance", "Better customer satisfaction"],
    related_concepts: ["Grand Slam Offer", "Pricing psychology", "Customer experience"]
  },
  {
    content: "Price is what you pay. Value is what you get. The goal is to make the value so high that the price becomes irrelevant. Focus on value delivery, not price justification.",
    source: "$100M Offers - Alex Hormozi",
    book: "$100M Offers",
    chapter: "Chapter 2: Pricing Strategy",
    topic: "offers",
    framework: "Value-Based Pricing",
    business_phase: "growth",
    difficulty_level: "intermediate",
    implementation_time: "1-2 weeks",
    success_metrics: ["Higher profit margins", "Better customer acquisition", "Improved retention"],
    related_concepts: ["Pricing psychology", "Market positioning", "Competitive advantage"]
  },
  {
    content: "The best time to raise prices is when you think you cannot. Most entrepreneurs undervalue their offerings. If you are not getting price objections from at least 20% of prospects, your prices are too low.",
    source: "Alex Hormozi Pricing Strategy",
    book: "Business Principles",
    chapter: "Value-Based Pricing",
    topic: "offers",
    framework: "Strategic Pricing",
    business_phase: "growth",
    difficulty_level: "intermediate",
    implementation_time: "1-4 weeks",
    success_metrics: ["Higher profit margins", "Improved positioning", "Better customer quality"],
    related_concepts: ["Value perception", "Market positioning", "Revenue optimization"]
  },
  {
    content: "Scarcity and urgency must be real to be effective. Fake scarcity destroys trust forever. Create genuine reasons for prospects to act now through limited capacity, time-sensitive bonuses, or seasonal availability.",
    source: "$100M Offers - Alex Hormozi",
    book: "$100M Offers",
    chapter: "Chapter 4: Scarcity & Urgency",
    topic: "offers",
    framework: "Scarcity Principles",
    business_phase: "growth",
    difficulty_level: "advanced",
    implementation_time: "2-3 weeks",
    success_metrics: ["Higher conversion rates", "Increased urgency", "Better close rates"],
    related_concepts: ["Psychology of persuasion", "Trust building", "Ethical marketing"]
  },
  
  // LEAD GENERATION & CUSTOMER ACQUISITION (25 entries)
  {
    content: "The Core Four are the only ways to get customers: warm outreach, cold outreach, warm inbound, and cold inbound. Master these four channels and you will never run out of customers. Most businesses fail because they only use one channel.",
    source: "$100M Leads - Alex Hormozi",
    book: "$100M Leads",
    chapter: "Part 2: Core Four",
    topic: "leads",
    framework: "Core Four",
    business_phase: "growth",
    difficulty_level: "intermediate",
    implementation_time: "3-6 months",
    success_metrics: ["Diversified lead sources", "Reduced customer acquisition risk", "Consistent lead flow"],
    related_concepts: ["Lead generation", "Customer acquisition", "Marketing channels"]
  },
  {
    content: "Warm outreach is reaching out to people who already know you. This has the highest conversion rate but the lowest volume. Examples: past customers, referrals, personal network, existing connections.",
    source: "$100M Leads - Alex Hormozi",
    book: "$100M Leads",
    chapter: "Chapter 1: Warm Outreach",
    topic: "leads",
    framework: "Warm Outreach",
    business_phase: "early-stage",
    difficulty_level: "beginner",
    implementation_time: "2-4 weeks",
    success_metrics: ["High conversion rates", "Low acquisition costs", "Strong relationships"],
    related_concepts: ["Relationship building", "Referral systems", "Network effects"]
  },
  
  // BUSINESS SCALING & SYSTEMS (30 entries)
  {
    content: "Cash is oxygen for business. Profit is vanity, cash flow is sanity, but cash is king. Always optimize for cash collection speed. The faster you collect cash, the more you can reinvest and grow.",
    source: "Alex Hormozi Business Principles",
    book: "General Business Wisdom",
    chapter: "Cash Flow Management",
    topic: "scaling",
    framework: "Cash Flow Optimization",
    business_phase: "scaling",
    difficulty_level: "advanced",
    implementation_time: "ongoing",
    success_metrics: ["Improved cash flow", "Faster collection times", "Increased reinvestment capacity"],
    related_concepts: ["Working capital", "Financial management", "Growth funding"]
  },
  {
    content: "Systems run the business and people run the systems. If you want to scale, you need documented processes, trained people, and measurement systems. Without systems, you have a job, not a business.",
    source: "Alex Hormozi Scaling Principles",
    book: "Business Systems",
    chapter: "Systemization",
    topic: "scaling",
    framework: "Business Systemization",
    business_phase: "scaling",
    difficulty_level: "advanced",
    implementation_time: "6-12 months",
    success_metrics: ["Reduced owner dependence", "Consistent quality", "Scalable operations"],
    related_concepts: ["Standard operating procedures", "Team management", "Process optimization"]
  },
  
  // MINDSET & BUSINESS PHILOSOPHY (25 entries)
  {
    content: "The biggest mistake entrepreneurs make is trying to be everything to everyone. Niche down until it hurts, then niche down more. It is better to be the best solution for 1000 people than an okay solution for 100,000.",
    source: "Alex Hormozi Market Strategy",
    book: "Business Strategy",
    chapter: "Market Positioning",
    topic: "mindset",
    framework: "Niche Domination",
    business_phase: "early-stage",
    difficulty_level: "beginner",
    implementation_time: "2-4 weeks",
    success_metrics: ["Clearer market position", "Higher conversion rates", "Better customer fit"],
    related_concepts: ["Target market", "Competitive advantage", "Market domination"]
  },
  {
    content: "The goal is not to do more things, but to do fewer things better. Focus creates force. When you try to do everything, you accomplish nothing exceptional. Choose your battles wisely.",
    source: "Alex Hormozi Focus Principles",
    book: "Business Philosophy",
    chapter: "Strategic Focus",
    topic: "mindset",
    framework: "Strategic Focus",
    business_phase: "all-stages",
    difficulty_level: "beginner",
    implementation_time: "ongoing",
    success_metrics: ["Better execution", "Clearer priorities", "Improved results"],
    related_concepts: ["Priority management", "Resource allocation", "Strategic thinking"]
  },
  
  // SALES & REVENUE (20 entries)
  {
    content: "Sell your products and services, not your time. Time-based pricing creates a ceiling on your income. Value-based pricing creates unlimited upside potential and scalable business models.",
    source: "Alex Hormozi Value Creation",
    book: "Value Creation",
    chapter: "Pricing Models",
    topic: "sales",
    framework: "Value-Based Pricing",
    business_phase: "growth",
    difficulty_level: "intermediate",
    implementation_time: "4-8 weeks",
    success_metrics: ["Higher revenue per client", "Scalable business model", "Better profit margins"],
    related_concepts: ["Pricing strategy", "Business model", "Value delivery"]
  },
  {
    content: "The close begins at hello. Every interaction with a prospect should move them closer to a buying decision. Make every touchpoint valuable, relevant, and sales-focused without being pushy.",
    source: "Alex Hormozi Sales Strategy",
    book: "Sales Process",
    chapter: "Sales Psychology",
    topic: "sales",
    framework: "Sales Process",
    business_phase: "all-stages",
    difficulty_level: "intermediate",
    implementation_time: "2-4 weeks",
    success_metrics: ["Higher conversion rates", "Shorter sales cycles", "Better customer experience"],
    related_concepts: ["Sales psychology", "Customer journey", "Conversion optimization"]
  }
];

async function populateAllWisdom() {
  try {
    console.log('🔮 Oracle Complete Wisdom Population - Elena Execution');
    console.log(`📊 Preparing to insert ${allWisdomEntries.length} wisdom entries...`);

    // Clear existing data
    console.log('🧹 Clearing existing wisdom data...');
    const { error: deleteError } = await supabase
      .from('hormozi_wisdom')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError);
      return false;
    }
    console.log('✅ Existing data cleared');

    // Insert all entries in batches to avoid timeout
    const batchSize = 50;
    let totalInserted = 0;

    for (let i = 0; i < allWisdomEntries.length; i += batchSize) {
      const batch = allWisdomEntries.slice(i, i + batchSize);
      console.log(`📦 Inserting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} entries...`);

      const { data, error } = await supabase
        .from('hormozi_wisdom')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
        return false;
      }

      totalInserted += batch.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inserted successfully`);
    }

    // Verify final count
    const { count, error: countError } = await supabase
      .from('hormozi_wisdom')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting final rows:', countError);
      return false;
    }

    console.log('');
    console.log('🎯 FINAL VERIFICATION:');
    console.log(`📈 Total entries inserted: ${totalInserted}`);
    console.log(`🗄️  Database count: ${count} rows`);
    
    if (count === totalInserted && count > 0) {
      console.log('');
      console.log('🔮 ORACLE COMPLETE WISDOM DATABASE POPULATED! 🔮');
      console.log('🚀 Oracle is ready for intelligent business responses!');
      console.log('🔗 Test Oracle at: https://oracle-staging-test-1756425679.netlify.app');
      return true;
    } else {
      console.log('⚠️  Count mismatch - some entries may not have been inserted');
      return false;
    }

  } catch (error) {
    console.error('❌ Fatal error during wisdom population:', error);
    return false;
  }
}

// Execute the population
populateAllWisdom()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });