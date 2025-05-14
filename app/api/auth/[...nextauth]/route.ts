import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

const AUTH_TOKEN = "grIf9e7YTSSP3J8LLdI0LwodIDZ1qn";
const DEFAULT_USERNAME = "ogsandemirkaya@gmail.com";
const DEFAULT_PASSWORD = "grIf9e7YTSSP3J8LLdI0LwodIDZ1qn";
const NEXTAUTH_SECRET = "secilstore-frontend-case-study-secret-key";
const API_URL = "https://maestro-api-dev.secil.biz"; 

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("NextAuth: Login isteği yapılıyor...");
          console.log("Kullanıcı adı:", credentials?.username);
          
  
          const res = await fetch(`${API_URL}/Auth/Login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": AUTH_TOKEN 
            },
            body: JSON.stringify({
              username: credentials?.username || DEFAULT_USERNAME,
              password: credentials?.password || DEFAULT_PASSWORD,
            }),
          });

          const data = await res.json();
          console.log("Login API Yanıtı alındı");

          if (data.status === 0 && data.data) {
            console.log("Login başarılı, token alındı");
            return {
              id: "1",
              name: "Frontend Developer",
              email: credentials?.username,
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            };
          } else {
            console.error("Login başarısız:", data.message || "Bilinmeyen hata");
            throw new Error(data.message || "Giriş başarısız");
          }
        } catch (error) {
          console.error("Authorization hatası:", error);
          throw new Error("Giriş başarısız: " + (error as Error).message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback: Kullanıcı bilgileri token'a ekleniyor");
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback: Token bilgileri oturuma ekleniyor");
      session.user = session.user || {};
      if (token) {
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, 
  },
  secret: NEXTAUTH_SECRET,
  debug: false,
});

export { handler as GET, handler as POST }; 