import NextAuth from "next-auth";

const ckIssuer = (process.env.CONSENTKEYS_ISSUER ?? "https://api.consentkeys.com").trim();
const ckClientId = process.env.CONSENTKEYS_CLIENT_ID?.trim();
const ckClientSecret = process.env.CONSENTKEYS_CLIENT_SECRET?.trim();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "consentkeys",
      name: "ConsentKeys",
      type: "oidc",
      issuer: ckIssuer,
      clientId: ckClientId!,
      clientSecret: ckClientSecret!,
      authorization: {
        url: `${ckIssuer}/auth`,
        params: { scope: "openid profile email" },
      },
      token: {
        url: `${ckIssuer}/token`,
        params: { grant_type: "authorization_code" },
      },
      userinfo: `${ckIssuer}/userinfo`,
      jwks_endpoint: `${ckIssuer}/.well-known/jwks.json`,
      client: { token_endpoint_auth_method: "client_secret_post" },
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
