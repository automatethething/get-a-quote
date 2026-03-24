import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "consentkeys",
      name: "ConsentKeys",
      type: "oidc",
      issuer: process.env.CONSENTKEYS_ISSUER ?? "https://api.consentkeys.com",
      clientId: process.env.CONSENTKEYS_CLIENT_ID!,
      clientSecret: process.env.CONSENTKEYS_CLIENT_SECRET!,
      authorization: { params: { scope: "openid profile email" } },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username ?? profile.sub,
          email: profile.email,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) { token.id = user.id; token.name = user.name; token.email = user.email; }
      if (account?.access_token) token.accessToken = account.access_token;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});
