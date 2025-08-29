# Oracle Database Schema Deployment Guide
**Elena Execution - Complete Migration Instructions**

## 🎯 Deployment Overview
This guide will deploy the complete Oracle database schema to Supabase, enabling:
- Vector embeddings storage and search
- Knowledge base organization  
- YouTube content integration
- Advanced search functions
- Analytics tracking

---

## 📋 Pre-Deployment Checklist

**✅ Environment Configuration**
```bash
npm run verify-env
```
Ensure all required credentials are configured:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
- ✅ OPENAI_API_KEY
- ✅ ANTHROPIC_API_KEY

---

## 🚀 Schema Deployment Steps

### Step 1: Access Supabase SQL Editor
1. Go to [supabase.com](https://supabase.com)
2. Login to your project
3. Navigate to **SQL Editor** in sidebar
4. Click **"New Query"**

### Step 2: Execute Complete Migration Script
**Copy and paste the complete contents of `deploy_oracle_schema.sql` into the Supabase SQL Editor:**

The script contains all 3 migrations in proper order:
- 🔧 **Migration 001**: Enable vector extension
- 🗄️ **Migration 002**: Create knowledge schema (tables, indexes, triggers)  
- 🔍 **Migration 003**: Create vector search functions

### Step 3: Execute the Script
1. **Paste** the entire `deploy_oracle_schema.sql` content
2. Click **"RUN"** button
3. **Wait** for completion (may take 30-60 seconds)
4. **Verify** no errors in output

### Step 4: Verify Deployment
Run the verification script locally:
```bash
npm run verify-schema
```

**Expected Success Output:**
```
🔮 Oracle Schema Deployment Verification - Elena Execution
==========================================================

🧪 Test 1: Verifying vector extension...
   ✅ Vector extension enabled

🗄️ Test 2: Verifying table creation...
   ✅ All tables created
   • oracle_categories: ✅
   • oracle_knowledge: ✅  
   • oracle_processing_history: ✅
   • oracle_search_analytics: ✅

📋 Test 3: Verifying categories population...
   ✅ Categories populated
   • hormozi-wisdom: Core Alex Hormozi philosophy, mindset, and harsh truths
   • business-frameworks: Financial metrics, LTV/CAC, sales systems, and business equations
   • implementation-guides: Step-by-step processes, blueprints, and how-to content
   • success-patterns: Case studies, proven strategies, and documented results
   • youtube-transcripts: Processed YouTube video content with timestamp citations

🔍 Test 4: Verifying search functions...
   ✅ Search functions created
   • oracle_semantic_search()
   • oracle_hybrid_search()
   • oracle_framework_search()
   • oracle_get_related_content()
   • oracle_youtube_search()
   • oracle_log_search()
   • oracle_get_search_analytics()

🔐 Test 5: Verifying permissions...
   ✅ Read permissions working

🧮 Test 6: Testing vector operations...
   ⚠️ Vector operations ready (requires test data for full verification)

📊 ORACLE SCHEMA DEPLOYMENT REPORT
==================================

🟢 DEPLOYMENT STATUS: SUCCESSFUL
✅ All core components verified
✅ Database schema ready for content processing
✅ Vector search infrastructure operational

🚀 NEXT STEPS:
   1. Process knowledge base content
   2. Generate and store vector embeddings
   3. Test end-to-end Oracle chat functionality

📝 RECOMMENDED COMMANDS:
   npm run embed-content   # Process knowledge base
   npm run test-oracle     # Test complete system

🎯 ELENA EXECUTION - SCHEMA VERIFICATION COMPLETE
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**❌ Vector Extension Error**
```
ERROR: extension "vector" is not available
```
**Solution:** Enable vector extension in Supabase:
1. Go to **Database** → **Extensions**
2. Find **"vector"** extension
3. Click **"Enable"**
4. Re-run migration script

**❌ Permission Denied**
```
ERROR: permission denied for schema public
```  
**Solution:** Check Supabase service role:
1. Verify you're using **SQL Editor** (not API)
2. Ensure project has proper permissions
3. Try refreshing browser and re-running

**❌ Table Already Exists**
```
ERROR: relation "oracle_categories" already exists
```
**Solution:** Migration script uses `IF NOT EXISTS` - this is safe to ignore

**❌ Function Creation Failed**
```
ERROR: function oracle_semantic_search does not exist
```
**Solution:**
1. Ensure vector extension is enabled first
2. Check all migration scripts ran in order
3. Verify no syntax errors in functions

---

## 📊 Database Schema Overview

### Tables Created:
- **`oracle_categories`**: Knowledge organization (5 default categories)
- **`oracle_knowledge`**: Vector embeddings and content storage  
- **`oracle_processing_history`**: Processing session tracking
- **`oracle_search_analytics`**: Search performance metrics

### Functions Created:
- **`oracle_semantic_search`**: Vector similarity search with filtering
- **`oracle_hybrid_search`**: Combined vector + text search
- **`oracle_framework_search`**: Business framework-specific search
- **`oracle_get_related_content`**: Find similar content
- **`oracle_youtube_search`**: YouTube content with timestamps  
- **`oracle_log_search`**: Search analytics tracking
- **`oracle_get_search_analytics`**: Performance reporting

### Indexes Optimized For:
- 🔍 Vector similarity search (ivfflat)
- 📝 Full-text search (GIN)
- 🏷️ Tag and category filtering
- 📺 YouTube content lookup
- 📊 Analytics queries

---

## ✅ Success Verification

**After successful deployment, you should be able to:**
- ✅ Query `oracle_categories` table (5 rows)
- ✅ Call `oracle_semantic_search()` function  
- ✅ Insert test data into `oracle_knowledge`
- ✅ Run vector similarity operations

**Test Database Connection:**
```bash
npm run test-database
```

**Expected Output After Schema Deployment:**
```
🔮 Oracle Database Connection Test - Elena Execution
====================================================

🔧 Testing Environment Configuration...
   ✅ Supabase URL: Configured
   ✅ Supabase Key: Configured
   ✅ OpenAI Key: Configured

🔌 Testing Database Connection...
   ✅ Connection: Successful

📊 DATABASE STATUS REPORT
========================

🔌 CONNECTION STATUS:
   Database Connection: ✅ SUCCESS
   Vector Extension: ✅ ENABLED

🗄️ SCHEMA STATUS:
   Oracle Categories: ✅ READY (5 categories)
   Knowledge Table: ✅ READY (0 records)
   Search Functions: ✅ OPERATIONAL

🎯 EMBEDDING PIPELINE READINESS:
   Content Embedding: ✅ READY
   Vector Search: ✅ READY

🚀 NEXT STEPS:
   1. Process knowledge base content: npm run embed-content
   2. Test Oracle chat system: npm run test-oracle

🎯 ELENA EXECUTION - DATABASE TEST COMPLETE
   Overall Status: 🟢 READY FOR CONTENT PROCESSING
```

---

## 🎯 Post-Deployment Actions

1. **Process Knowledge Base:**
   ```bash
   npm run embed-content
   ```

2. **Test Complete Oracle System:**
   ```bash
   npm run test-oracle
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

**🎯 Elena Execution - Oracle Database Schema Deployment Complete**

*The Oracle wisdom infrastructure is now ready for Alex Hormozi's business knowledge processing and vector-powered insights.*