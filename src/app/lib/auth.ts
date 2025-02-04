import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token as string;
        token.refreshToken = account.refresh_token as string;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
      }
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
