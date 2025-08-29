#!/usr/bin/env node
/**
 * Environment Configuration Verification
 * Created by: AI IDE Agent
 * Purpose: Verify .env.local configuration without exposing sensitive values
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EnvConfigStatus {
  fileExists: boolean;
  supabaseUrl: {
    present: boolean;
    isPlaceholder: boolean;
    isValidFormat: boolean;
    maskedValue?: string;
  };
  supabaseAnonKey: {
    present: boolean;
    isPlaceholder: boolean;
    isValidFormat: boolean;
    maskedValue?: string;
  };
  supabaseServiceKey: {
    present: boolean;
    isPlaceholder: boolean;
    isValidFormat: boolean;
    maskedValue?: string;
  };
  openaiKey: {
    present: boolean;
    isPlaceholder: boolean;
    isValidFormat: boolean;
    maskedValue?: string;
  };
  anthropicKey: {
    present: boolean;
    isPlaceholder: boolean;
    isValidFormat: boolean;
    maskedValue?: string;
  };
  formattingIssues: string[];
  overallStatus: 'ready' | 'partial' | 'incomplete';
}

class EnvConfigVerifier {
  private envFilePath: string;
  private status: EnvConfigStatus;

  constructor() {
    this.envFilePath = join(process.cwd(), '.env.local');
    this.status = {
      fileExists: false,
      supabaseUrl: { present: false, isPlaceholder: false, isValidFormat: false },
      supabaseAnonKey: { present: false, isPlaceholder: false, isValidFormat: false },
      supabaseServiceKey: { present: false, isPlaceholder: false, isValidFormat: false },
      openaiKey: { present: false, isPlaceholder: false, isValidFormat: false },
      anthropicKey: { present: false, isPlaceholder: false, isValidFormat: false },
      formattingIssues: [],
      overallStatus: 'incomplete'
    };
  }

  async verifyConfiguration(): Promise<EnvConfigStatus> {
    console.log('🔧 Environment Configuration Verification - AI IDE Agent');
    console.log('========================================================\n');

    // Check if .env.local exists
    await this.checkFileExists();
    
    if (this.status.fileExists) {
      // Read and parse environment file
      await this.parseEnvFile();
      
      // Verify each configuration
      await this.verifySupabaseUrl();
      await this.verifySupabaseAnonKey();
      await this.verifySupabaseServiceKey();
      await this.verifyOpenAIKey();
      await this.verifyAnthropicKey();
      
      // Check formatting issues
      await this.checkFormatting();
      
      // Determine overall status
      this.determineOverallStatus();
    }

    // Generate report
    this.generateReport();
    
    return this.status;
  }

  private async checkFileExists(): Promise<void> {
    console.log('📁 Checking .env.local file...');
    
    this.status.fileExists = existsSync(this.envFilePath);
    
    if (this.status.fileExists) {
      console.log('   ✅ .env.local file found');
    } else {
      console.log('   ❌ .env.local file not found');
      console.log('      Expected location: .env.local');
    }
    
    console.log('');
  }

  private async parseEnvFile(): Promise<void> {
    try {
      const envContent = readFileSync(this.envFilePath, 'utf-8');
      const lines = envContent.split('\n');
      
      console.log(`📋 Parsing environment file (${lines.length} lines)...\n`);
      
      // We'll parse each variable individually for better validation
      
    } catch (error) {
      console.error('❌ Failed to read .env.local file:', error);
      this.status.formattingIssues.push('Unable to read .env.local file');
    }
  }

  private getEnvValue(key: string): string | null {
    try {
      const envContent = readFileSync(this.envFilePath, 'utf-8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (trimmedLine.startsWith('#') || trimmedLine === '') continue;
        
        // Look for our key
        if (trimmedLine.startsWith(`${key}=`)) {
          let value = trimmedLine.substring(key.length + 1);
          
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          return value;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private maskSensitiveValue(value: string, showPrefix: number = 8, showSuffix: number = 4): string {
    if (value.length <= showPrefix + showSuffix) {
      return '*'.repeat(value.length);
    }
    
    const prefix = value.substring(0, showPrefix);
    const suffix = value.substring(value.length - showSuffix);
    const middleLength = value.length - showPrefix - showSuffix;
    
    return `${prefix}${'*'.repeat(middleLength)}${suffix}`;
  }

  private async verifySupabaseUrl(): Promise<void> {
    console.log('🔗 Verifying NEXT_PUBLIC_SUPABASE_URL...');
    
    const value = this.getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
    
    this.status.supabaseUrl.present = value !== null;
    
    if (!value) {
      console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL: Not found');
      return;
    }
    
    // Check if it's a placeholder
    const placeholders = [
      'https://your-project.supabase.co',
      'your_supabase_project_url',
      'your-supabase-url'
    ];
    
    this.status.supabaseUrl.isPlaceholder = placeholders.some(placeholder => 
      value.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    // Check format
    const isValidFormat = value.startsWith('https://') && 
                         value.includes('.supabase.co') && 
                         value.length > 30;
                         
    this.status.supabaseUrl.isValidFormat = isValidFormat;
    
    // Create masked value
    if (!this.status.supabaseUrl.isPlaceholder) {
      this.status.supabaseUrl.maskedValue = this.maskSensitiveValue(value, 12, 6);
    } else {
      this.status.supabaseUrl.maskedValue = value;
    }
    
    if (this.status.supabaseUrl.isPlaceholder) {
      console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL: Placeholder value detected');
      console.log(`      Value: ${value}`);
    } else if (!isValidFormat) {
      console.log('   ⚠️  NEXT_PUBLIC_SUPABASE_URL: Invalid format');
      console.log(`      Value: ${this.status.supabaseUrl.maskedValue}`);
    } else {
      console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL: Properly configured');
      console.log(`      Value: ${this.status.supabaseUrl.maskedValue}`);
    }
    
    console.log('');
  }

  private async verifySupabaseAnonKey(): Promise<void> {
    console.log('🔑 Verifying NEXT_PUBLIC_SUPABASE_ANON_KEY...');
    
    const value = this.getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    this.status.supabaseAnonKey.present = value !== null;
    
    if (!value) {
      console.log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Not found');
      return;
    }
    
    // Check if it's a placeholder
    const placeholders = [
      'your-anon-key',
      'your_supabase_anon_key',
      'your-supabase-anon-key'
    ];
    
    this.status.supabaseAnonKey.isPlaceholder = placeholders.some(placeholder => 
      value.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    // Check format (Supabase anon keys are typically long JWT tokens)
    const isValidFormat = value.length > 100 && 
                         value.includes('.') && 
                         !value.includes(' ');
                         
    this.status.supabaseAnonKey.isValidFormat = isValidFormat;
    
    // Create masked value
    if (!this.status.supabaseAnonKey.isPlaceholder) {
      this.status.supabaseAnonKey.maskedValue = this.maskSensitiveValue(value, 12, 8);
    } else {
      this.status.supabaseAnonKey.maskedValue = value;
    }
    
    if (this.status.supabaseAnonKey.isPlaceholder) {
      console.log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: Placeholder value detected');
      console.log(`      Value: ${value}`);
    } else if (!isValidFormat) {
      console.log('   ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY: Invalid format');
      console.log(`      Value: ${this.status.supabaseAnonKey.maskedValue}`);
    } else {
      console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Properly configured');
      console.log(`      Value: ${this.status.supabaseAnonKey.maskedValue}`);
    }
    
    console.log('');
  }

  private async verifySupabaseServiceKey(): Promise<void> {
    console.log('🔐 Verifying SUPABASE_SERVICE_ROLE_KEY...');
    
    const value = this.getEnvValue('SUPABASE_SERVICE_ROLE_KEY');
    
    this.status.supabaseServiceKey.present = value !== null;
    
    if (!value) {
      console.log('   ⚠️  SUPABASE_SERVICE_ROLE_KEY: Not found (optional)');
      return;
    }
    
    // Check if it's a placeholder
    const placeholders = [
      'your-service-role-key',
      'your_supabase_service_role_key',
      'your-supabase-service-key'
    ];
    
    this.status.supabaseServiceKey.isPlaceholder = placeholders.some(placeholder => 
      value.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    // Check format
    const isValidFormat = value.length > 100 && 
                         value.includes('.') && 
                         !value.includes(' ');
                         
    this.status.supabaseServiceKey.isValidFormat = isValidFormat;
    
    // Create masked value
    if (!this.status.supabaseServiceKey.isPlaceholder) {
      this.status.supabaseServiceKey.maskedValue = this.maskSensitiveValue(value, 12, 8);
    } else {
      this.status.supabaseServiceKey.maskedValue = value;
    }
    
    if (this.status.supabaseServiceKey.isPlaceholder) {
      console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY: Placeholder value detected');
      console.log(`      Value: ${value}`);
    } else if (!isValidFormat) {
      console.log('   ⚠️  SUPABASE_SERVICE_ROLE_KEY: Invalid format');
      console.log(`      Value: ${this.status.supabaseServiceKey.maskedValue}`);
    } else {
      console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY: Properly configured');
      console.log(`      Value: ${this.status.supabaseServiceKey.maskedValue}`);
    }
    
    console.log('');
  }

  private async verifyOpenAIKey(): Promise<void> {
    console.log('🤖 Verifying OPENAI_API_KEY...');
    
    const value = this.getEnvValue('OPENAI_API_KEY');
    
    this.status.openaiKey.present = value !== null;
    
    if (!value) {
      console.log('   ❌ OPENAI_API_KEY: Not found (required for embeddings)');
      return;
    }
    
    // Check if it's a placeholder
    const placeholders = [
      'your-openai-api-key',
      'your_openai_api_key',
      'sk-your-key'
    ];
    
    this.status.openaiKey.isPlaceholder = placeholders.some(placeholder => 
      value.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    // Check format (OpenAI keys start with sk- and are specific length)
    const isValidFormat = value.startsWith('sk-') && 
                         value.length >= 20 && 
                         !value.includes(' ');
                         
    this.status.openaiKey.isValidFormat = isValidFormat;
    
    // Create masked value
    if (!this.status.openaiKey.isPlaceholder) {
      this.status.openaiKey.maskedValue = this.maskSensitiveValue(value, 8, 4);
    } else {
      this.status.openaiKey.maskedValue = value;
    }
    
    if (this.status.openaiKey.isPlaceholder) {
      console.log('   ❌ OPENAI_API_KEY: Placeholder or invalid value');
      console.log(`      Value: ${value}`);
    } else if (!isValidFormat) {
      console.log('   ⚠️  OPENAI_API_KEY: Invalid format');
      console.log(`      Value: ${this.status.openaiKey.maskedValue}`);
      console.log('      Expected: sk-... format');
    } else {
      console.log('   ✅ OPENAI_API_KEY: Properly configured');
      console.log(`      Value: ${this.status.openaiKey.maskedValue}`);
    }
    
    console.log('');
  }

  private async verifyAnthropicKey(): Promise<void> {
    console.log('🧠 Verifying ANTHROPIC_API_KEY...');
    
    const value = this.getEnvValue('ANTHROPIC_API_KEY');
    
    this.status.anthropicKey.present = value !== null;
    
    if (!value) {
      console.log('   ⚠️  ANTHROPIC_API_KEY: Not found (optional for Oracle chat)');
      return;
    }
    
    // Check if it's a placeholder
    const placeholders = [
      'your-anthropic-api-key',
      'your_anthropic_api_key'
    ];
    
    this.status.anthropicKey.isPlaceholder = placeholders.some(placeholder => 
      value.toLowerCase().includes(placeholder.toLowerCase())
    );
    
    // Check format (Anthropic keys start with sk-ant-)
    const isValidFormat = value.startsWith('sk-ant-') && 
                         value.length > 20 && 
                         !value.includes(' ');
                         
    this.status.anthropicKey.isValidFormat = isValidFormat;
    
    // Create masked value
    if (!this.status.anthropicKey.isPlaceholder) {
      this.status.anthropicKey.maskedValue = this.maskSensitiveValue(value, 12, 4);
    } else {
      this.status.anthropicKey.maskedValue = value;
    }
    
    if (this.status.anthropicKey.isPlaceholder) {
      console.log('   ⚠️  ANTHROPIC_API_KEY: Placeholder value');
      console.log(`      Value: ${value}`);
    } else if (!isValidFormat) {
      console.log('   ⚠️  ANTHROPIC_API_KEY: Invalid format');
      console.log(`      Value: ${this.status.anthropicKey.maskedValue}`);
      console.log('      Expected: sk-ant-... format');
    } else {
      console.log('   ✅ ANTHROPIC_API_KEY: Properly configured');
      console.log(`      Value: ${this.status.anthropicKey.maskedValue}`);
    }
    
    console.log('');
  }

  private async checkFormatting(): Promise<void> {
    console.log('📋 Checking formatting issues...');
    
    try {
      const envContent = readFileSync(this.envFilePath, 'utf-8');
      const lines = envContent.split('\n');
      
      lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (trimmedLine.startsWith('#') || trimmedLine === '') return;
        
        // Check for common formatting issues
        if (line !== trimmedLine && trimmedLine.includes('=')) {
          this.status.formattingIssues.push(`Line ${lineNumber}: Leading/trailing whitespace detected`);
        }
        
        if (trimmedLine.includes('=') && trimmedLine.split('=').length > 2) {
          this.status.formattingIssues.push(`Line ${lineNumber}: Multiple = signs detected`);
        }
        
        if (trimmedLine.includes('=') && !trimmedLine.split('=')[1]) {
          this.status.formattingIssues.push(`Line ${lineNumber}: Empty value detected`);
        }
      });
      
      if (this.status.formattingIssues.length === 0) {
        console.log('   ✅ No formatting issues detected');
      } else {
        console.log(`   ⚠️  ${this.status.formattingIssues.length} formatting issue(s) detected`);
        this.status.formattingIssues.forEach(issue => {
          console.log(`      - ${issue}`);
        });
      }
      
    } catch (error) {
      this.status.formattingIssues.push('Unable to check file formatting');
    }
    
    console.log('');
  }

  private determineOverallStatus(): void {
    const requiredConfigs = [
      this.status.supabaseUrl,
      this.status.supabaseAnonKey,
      this.status.openaiKey
    ];
    
    const allConfigured = requiredConfigs.every(config => 
      config.present && !config.isPlaceholder && config.isValidFormat
    );
    
    const partialConfigured = requiredConfigs.some(config => 
      config.present && !config.isPlaceholder && config.isValidFormat
    );
    
    if (allConfigured) {
      this.status.overallStatus = 'ready';
    } else if (partialConfigured) {
      this.status.overallStatus = 'partial';
    } else {
      this.status.overallStatus = 'incomplete';
    }
  }

  private generateReport(): void {
    console.log('📊 ENVIRONMENT CONFIGURATION REPORT');
    console.log('===================================\n');
    
    // File status
    console.log('📁 FILE STATUS:');
    console.log(`   .env.local exists: ${this.status.fileExists ? '✅ YES' : '❌ NO'}`);
    console.log('');
    
    if (!this.status.fileExists) {
      console.log('🚨 CRITICAL: .env.local file not found');
      console.log('   Create .env.local from .env.example template');
      console.log('');
      return;
    }
    
    // Configuration status
    console.log('⚙️  CONFIGURATION STATUS:');
    
    // Required configurations
    console.log('\n   Required Configurations:');
    console.log(`   ├─ Supabase URL: ${this.getConfigStatus(this.status.supabaseUrl)}`);
    console.log(`   ├─ Supabase Anon Key: ${this.getConfigStatus(this.status.supabaseAnonKey)}`);
    console.log(`   └─ OpenAI API Key: ${this.getConfigStatus(this.status.openaiKey)}`);
    
    // Optional configurations
    console.log('\n   Optional Configurations:');
    console.log(`   ├─ Supabase Service Key: ${this.getConfigStatus(this.status.supabaseServiceKey, true)}`);
    console.log(`   └─ Anthropic API Key: ${this.getConfigStatus(this.status.anthropicKey, true)}`);
    
    // Overall status
    console.log('\n🎯 OVERALL STATUS:');
    const statusEmoji = {
      'ready': '🟢',
      'partial': '🟡', 
      'incomplete': '🔴'
    };
    const statusText = {
      'ready': 'READY FOR DATABASE CONNECTION',
      'partial': 'PARTIAL CONFIGURATION',
      'incomplete': 'SETUP REQUIRED'
    };
    
    console.log(`   ${statusEmoji[this.status.overallStatus]} ${statusText[this.status.overallStatus]}`);
    
    // Next steps
    console.log('\n🚀 NEXT STEPS:');
    if (this.status.overallStatus === 'ready') {
      console.log('   ✅ Configuration complete - ready to test database connection');
      console.log('   📝 Run: npm run test-database');
    } else if (this.status.overallStatus === 'partial') {
      console.log('   ⚠️  Complete missing configurations');
      this.printMissingConfigs();
    } else {
      console.log('   🔧 Configure required environment variables');
      console.log('   📋 Use .env.example as template');
      this.printMissingConfigs();
    }
    
    // Formatting issues
    if (this.status.formattingIssues.length > 0) {
      console.log('\n⚠️  FORMATTING ISSUES:');
      this.status.formattingIssues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
    }
    
    console.log('\n🎯 AI IDE AGENT - CONFIGURATION VERIFICATION COMPLETE');
  }

  private getConfigStatus(config: any, optional: boolean = false): string {
    if (!config.present) {
      return optional ? '⚪ NOT SET (optional)' : '❌ MISSING';
    } else if (config.isPlaceholder) {
      return '🟡 PLACEHOLDER';
    } else if (!config.isValidFormat) {
      return '🟠 INVALID FORMAT';
    } else {
      return '✅ CONFIGURED';
    }
  }

  private printMissingConfigs(): void {
    const missing = [];
    
    if (!this.status.supabaseUrl.present || this.status.supabaseUrl.isPlaceholder) {
      missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!this.status.supabaseAnonKey.present || this.status.supabaseAnonKey.isPlaceholder) {
      missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    if (!this.status.openaiKey.present || this.status.openaiKey.isPlaceholder) {
      missing.push('OPENAI_API_KEY');
    }
    
    if (missing.length > 0) {
      console.log('   🔧 Configure these variables:');
      missing.forEach(key => {
        console.log(`      - ${key}`);
      });
    }
  }
}

// Main execution
async function main() {
  const verifier = new EnvConfigVerifier();
  
  try {
    const status = await verifier.verifyConfiguration();
    
    // Exit with appropriate code
    if (status.overallStatus === 'ready') {
      process.exit(0);
    } else {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Environment verification failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { EnvConfigVerifier, main as verifyEnvConfig };