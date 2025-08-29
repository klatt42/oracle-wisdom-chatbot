// test-openai.js
// Quick test to verify OpenAI API connectivity

require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAIConnection() {
  console.log('🧪 Testing OpenAI API Connection...');
  console.log('API Key (last 8 chars):', process.env.OPENAI_API_KEY?.slice(-8) || 'NOT FOUND');
  
  try {
    console.log('\n📡 Testing Chat Completion with gpt-3.5-turbo...');
    
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user", 
          content: "Say 'API connection successful!' if you can read this."
        }
      ],
      max_tokens: 50
    });

    console.log('✅ Chat Response:', chatResponse.choices[0].message.content);
    console.log('💰 Usage:', chatResponse.usage);
    
    // If chat works, test embedding model
    console.log('\n📊 Testing Embedding Model...');
    
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "Test embedding functionality",
    });
    
    console.log('✅ Embedding Response Length:', embeddingResponse.data[0].embedding.length);
    console.log('💰 Embedding Usage:', embeddingResponse.usage);
    console.log('\n🎉 Both chat and embedding models working!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'insufficient_quota') {
      console.log('💳 Issue: Insufficient credits - add billing to your OpenAI account');
    } else if (error.code === 'model_not_found') {
      console.log('🚫 Issue: Model not accessible - check project permissions');
    } else if (error.status === 401) {
      console.log('🔑 Issue: Invalid API key - verify key is correct');
    } else if (error.status === 403) {
      console.log('🚨 Issue: Access denied - check model permissions in project');
    }
  }
}

testOpenAIConnection();
