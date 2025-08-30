import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

// Essential Alex Hormozi wisdom content for immediate Oracle functionality
const HORMOZI_WISDOM_CONTENT = [
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
    content: "The Value Equation is (Dream Outcome × Perceived Likelihood of Achievement) ÷ (Time Delay × Effort and Sacrifice). To increase value, increase the numerator (what they get and likelihood they believe they'll get it) or decrease the denominator (how long it takes and how difficult it is).",
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
    content: "The Core Four are the only ways to get customers: warm outreach, cold outreach, warm inbound, and cold inbound. Master these four channels and you'll never run out of customers. Most businesses fail because they only use one channel.",
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
  {
    content: "The best time to raise prices is when you think you can't. Most entrepreneurs undervalue their offerings. If you're not getting price objections from at least 20% of prospects, your prices are too low.",
    source: "Alex Hormozi Pricing Strategy",
    book: "Pricing Principles",
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
    content: "Customer lifetime value (LTV) divided by customer acquisition cost (CAC) should be at least 3:1. If it's less, you have a business model problem. If it's more than 10:1, you're probably not spending enough on acquisition.",
    source: "Alex Hormozi Unit Economics",
    book: "Business Metrics",
    chapter: "Unit Economics",
    topic: "scaling",
    framework: "LTV:CAC Ratio",
    business_phase: "growth",
    difficulty_level: "advanced",
    implementation_time: "ongoing",
    success_metrics: ["Profitable unit economics", "Sustainable growth", "Clear ROI"],
    related_concepts: ["Customer lifetime value", "Customer acquisition cost", "Unit economics"]
  },
  {
    content: "The biggest mistake entrepreneurs make is trying to be everything to everyone. Niche down until it hurts, then niche down more. It's better to be the best solution for 1000 people than an okay solution for 100,000.",
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
    content: "Sell your products and services, not your time. Time-based pricing creates a ceiling on your income. Value-based pricing creates unlimited upside potential.",
    source: "Alex Hormozi Value Creation",
    book: "Value Creation",
    chapter: "Pricing Models",
    topic: "offers",
    framework: "Value-Based Pricing",
    business_phase: "growth", 
    difficulty_level: "intermediate",
    implementation_time: "4-8 weeks",
    success_metrics: ["Higher revenue per client", "Scalable business model", "Better profit margins"],
    related_concepts: ["Pricing strategy", "Business model", "Value delivery"]
  },
  {
    content: "The goal is not to do more things, but to do fewer things better. Focus creates force. When you try to do everything, you accomplish nothing exceptional.",
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
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('🔮 Oracle Knowledge Population - Adding Hormozi wisdom...');
    
    const results = [];
    const errors = [];
    let successCount = 0;

    // Try to insert wisdom content into hormozi_wisdom table
    for (const wisdom of HORMOZI_WISDOM_CONTENT) {
      try {
        const { data, error } = await supabaseAdmin
          .from('hormozi_wisdom')
          .insert([wisdom])
          .select();

        if (error) {
          errors.push({ 
            content: wisdom.content.substring(0, 50) + '...',
            error: error.message 
          });
        } else {
          results.push({
            content: wisdom.content.substring(0, 50) + '...',
            success: true,
            id: data?.[0]?.id
          });
          successCount++;
        }
      } catch (err) {
        errors.push({
          content: wisdom.content.substring(0, 50) + '...',
          error: String(err)
        });
      }
    }

    // If direct insert fails, provide manual SQL
    if (errors.length === HORMOZI_WISDOM_CONTENT.length) {
      // All inserts failed, table probably doesn't exist
      return NextResponse.json({
        success: false,
        message: 'hormozi_wisdom table does not exist - manual database setup required',
        manual_setup_required: true,
        sql_to_run: `
-- Run this SQL in your Supabase SQL Editor first:

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create hormozi_wisdom table
CREATE TABLE IF NOT EXISTS hormozi_wisdom (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  book TEXT,
  chapter TEXT,
  topic TEXT,
  framework TEXT,
  business_phase TEXT,
  difficulty_level TEXT,
  implementation_time TEXT,
  success_metrics TEXT[],
  related_concepts TEXT[],
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Then call this API endpoint again to populate content
        `,
        errors
      });
    }

    console.log(`✅ Successfully populated ${successCount} Hormozi wisdom entries`);

    return NextResponse.json({
      success: true,
      message: `Oracle knowledge base populated with ${successCount} Hormozi wisdom entries`,
      populated_count: successCount,
      total_attempted: HORMOZI_WISDOM_CONTENT.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      next_steps: [
        'Test Oracle chat functionality',
        'Verify wisdom is accessible via /api/oracle',
        'Check search functionality'
      ]
    });

  } catch (error) {
    console.error('Oracle population error:', error);
    return NextResponse.json({
      success: false,
      error: 'Population failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: 'Oracle Knowledge Population',
    description: 'POST to this endpoint to populate the database with essential Hormozi wisdom',
    content_ready: HORMOZI_WISDOM_CONTENT.length,
    status: 'Ready to populate Oracle knowledge base'
  });
}