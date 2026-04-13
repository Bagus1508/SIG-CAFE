import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Login",
      // 1. Menentukan input apa saja yang muncul di form default NextAuth
      credentials: {
        username: { label: "Username", type: "text", placeholder: "masukkan username" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 2. Logika Verifikasi
        // Di sini Anda biasanya melakukan query ke database (Prisma/PostgreSQL/Laravel API)
        
        // Contoh data dummy untuk tes:
        const user = { id: "1", name: "Admin User", username: "admin", password: "123" }

        if (
          credentials?.username === user.username && 
          credentials?.password === user.password
        ) {
          // Jika cocok, kembalikan objek user (data ini akan disimpan di session)
          return { id: user.id, name: user.name, email: user.username }
        }
        
        // Jika salah, kembalikan null (akan muncul pesan error di halaman login)
        return null
      }
    }),
  ],
  pages: {
    signIn: '/login', // Ini wajib agar NextAuth tidak pakai form bawaan
  },
  // 3. Pengaturan Session
  session: {
    strategy: "jwt", // Menggunakan JSON Web Token
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }