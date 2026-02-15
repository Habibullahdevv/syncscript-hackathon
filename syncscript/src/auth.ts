import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
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

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ FAILED: Missing credentials');
            console.log('========================================\n');
            return null;
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          // Step 2: Query database
          console.log('\n📊 Step 2: Querying database...');
          console.log('   Looking for email:', email);

          const user = await prisma.user.findUnique({
            where: { email },
          });

          console.log('   User found:', !!user);
          if (user) {
            console.log('   User ID:', user.id);
            console.log('   User name:', user.name);
            console.log('   User role:', user.role);
            console.log('   Has password hash:', !!user.passwordHash);
          }

          if (!user || !user.passwordHash) {
            console.log('❌ FAILED: User not found or no password hash');
            console.log('========================================\n');
            return null;
          }

          // Step 3: Verify password
          console.log('\n🔑 Step 3: Verifying password...');
          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          console.log('   Password valid:', isValidPassword);

          if (!isValidPassword) {
            console.log('❌ FAILED: Invalid password');
            console.log('========================================\n');
            return null;
          }

          // Step 4: Return user object
          console.log('\n✅ Step 4: Authentication successful!');
          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            role: user.role,
          };
          console.log('   Returning user:', JSON.stringify(returnUser, null, 2));
          console.log('========================================\n');

          return returnUser;
        } catch (error) {
          console.error('\n❌❌❌ CRITICAL AUTH ERROR ❌❌❌');
          console.error('Error:', error);
          console.log('========================================\n');
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      console.log('\n🎫 JWT CALLBACK');
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        console.log('   Added to token - ID:', token.id, 'Role:', token.role);
      }
      return token;
    },
    session({ session, token }) {
      console.log('\n👤 SESSION CALLBACK');
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        console.log('   Session user:', session.user);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  debug: true,
});
