import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const timestamp = new Date().toISOString();
        console.log('\n========================================');
        console.log(`🔐 [${timestamp}] AUTH ATTEMPT STARTED`);
        console.log('========================================');

        try {
          // Step 1: Validate credentials exist
          console.log('📋 Step 1: Validating credentials...');
          console.log('   Email provided:', !!credentials?.email);
          console.log('   Password provided:', !!credentials?.password);
          console.log('   Email value:', credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ FAILED: Missing credentials');
            console.log('========================================\n');
            return null;
          }

          // Step 2: Query database
          console.log('\n📊 Step 2: Querying database...');
          console.log('   Looking for email:', credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log('   User found:', !!user);
          if (user) {
            console.log('   User ID:', user.id);
            console.log('   User name:', user.name);
            console.log('   User role:', user.role);
            console.log('   Has password hash:', !!user.passwordHash);
            console.log('   Password hash length:', user.passwordHash?.length || 0);
          }

          if (!user || !user.passwordHash) {
            console.log('❌ FAILED: User not found or no password hash');
            console.log('========================================\n');
            return null;
          }

          // Step 3: Verify password
          console.log('\n🔑 Step 3: Verifying password...');
          console.log('   Password length:', credentials.password.length);
          console.log('   Hash algorithm: bcrypt');

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          console.log('   Password valid:', isValidPassword);

          if (!isValidPassword) {
            console.log('❌ FAILED: Invalid password');
            console.log('========================================\n');
            return null;
          }

          // Step 4: Prepare return object
          console.log('\n✅ Step 4: Authentication successful!');
          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            role: user.role,
          };
          console.log('   Returning user object:');
          console.log('   ', JSON.stringify(returnUser, null, 2));
          console.log('========================================\n');

          return returnUser;
        } catch (error) {
          console.error('\n❌❌❌ CRITICAL AUTH ERROR ❌❌❌');
          console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
          console.error('Error message:', error instanceof Error ? error.message : String(error));
          console.error('Full error object:', error);
          if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack);
          }
          console.log('========================================\n');
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      console.log('\n🎫 JWT CALLBACK TRIGGERED');
      console.log('   Has user object:', !!user);
      console.log('   Current token keys:', Object.keys(token));

      // Add user.id and user.role to token on sign-in
      if (user) {
        console.log('   Adding user data to token:');
        console.log('   - User ID:', user.id);
        console.log('   - User role:', (user as any).role);
        token.id = user.id;
        token.role = (user as any).role;
      }

      console.log('   Final token keys:', Object.keys(token));
      console.log('   Token.id:', token.id);
      console.log('   Token.role:', token.role);
      return token;
    },
    session: async ({ session, token }) => {
      console.log('\n👤 SESSION CALLBACK TRIGGERED');
      console.log('   Token.id:', token.id);
      console.log('   Token.role:', token.role);
      console.log('   Session.user before:', session.user);

      // Add token.id and token.role to session object
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        console.log('   Session.user after:', session.user);
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true, // Enable debug mode
};
