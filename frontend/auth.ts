import NextAuth from 'next-auth';
import { redis } from '@/lib/db';
import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { UpstashRedisAdapter } from '@auth/upstash-redis-adapter';

export const config = {
    adapter: UpstashRedisAdapter(redis),
    session: {
        strategy: 'jwt',
    },
    providers: [GitHub, Google],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, user, token }) {
            if (session.user) {
                if (token.sub) {
                    session.user.id = token.sub;
                }

                if (token.email) {
                    session.user.email = token.email;
                }

                session.user.name = token.name;
                session.user.image = token.picture;
            }

            return session;
        },

        async jwt({ token, user, account, profile, trigger }) {
            return token;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl;
        },

        async signIn({ user, account, profile, email, credentials }) {
            return true;
        },
    },
    debug: process.env.NODE_ENV !== 'production',
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);
