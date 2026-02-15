import 'dotenv/config';
import { authOptions } from './src/lib/auth-config';

async function testNextAuthConfig() {
  try {
    console.log('🔍 Testing NextAuth Configuration...\n');

    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('  NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing');
    console.log('  NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Missing');
    console.log('');

    // Check authOptions structure
    console.log('🔧 NextAuth Configuration:');
    console.log('  Providers:', authOptions.providers.length);
    console.log('  Session strategy:', authOptions.session?.strategy);
    console.log('  Session maxAge:', authOptions.session?.maxAge, 'seconds');
    console.log('  Debug mode:', authOptions.debug);
    console.log('  Sign-in page:', authOptions.pages?.signIn);
    console.log('  JWT callback:', typeof authOptions.callbacks?.jwt);
    console.log('  Session callback:', typeof authOptions.callbacks?.session);
    console.log('');

    // Test the authorize function directly
    console.log('🧪 Testing authorize function directly...\n');

    const testCredentials = {
      email: 'test@example.com',
      password: 'test123',
    };

    console.log('Testing with:', testCredentials.email);

    const provider = authOptions.providers[0];
    if ('authorize' in provider && provider.authorize) {
      // Capture console.error to see what error is being caught
      const originalError = console.error;
      let capturedError: any = null;
      console.error = (...args: any[]) => {
        capturedError = args;
        originalError(...args);
      };

      const result = await provider.authorize(testCredentials, {} as any);

      // Restore console.error
      console.error = originalError;

      if (result) {
        console.log('✅ Authorize function returned user:');
        console.log('   ID:', result.id);
        console.log('   Email:', result.email);
        console.log('   Name:', result.name);
        console.log('   Role:', (result as any).role);
      } else {
        console.log('❌ Authorize function returned null');
        if (capturedError) {
          console.log('\n🔍 Captured error details:');
          console.log(capturedError);
        }
      }
    }

    console.log('\n✅ NextAuth configuration test completed');
  } catch (error) {
    console.error('❌ NextAuth test failed:', error);
    process.exit(1);
  }
}

testNextAuthConfig();
