import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "consentkeys",
      name: "ConsentKeys",
      type: "oidc",
      clientId: process.env.CONSENTKEYS_CLIENT_ID!,
      clientSecret: process.env.CONSENTKEYS_CLIENT_SECRET!,
      issuer: process.env.CONSENTKEYS_ISSUER || "https://api.consentkeys.com",
      authorization: {
        url: "https://api.consentkeys.com/auth",
        params: { scope: "openid profile email" },
      },
      token: { url: "https://api.consentkeys.com/token" },
      userinfo: "https://api.consentkeys.com/userinfo",
      jwks_endpoint: "https://api.consentkeys.com/.well-known/jwks.json",
      client: { token_endpoint_auth_method: "client_secret_post" },
      profile(profile) {
        return { id: profile.sub, name: profile.name, email: profile.email };
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
