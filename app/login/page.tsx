"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DEFAULT_USERNAME = "ogsandemirkaya@gmail.com";
const DEFAULT_PASSWORD = "grIf9e7YTSSP3J8LLdI0LwodIDZ1qn";

export default function Login() {
  const [username, setUsername] = useState(DEFAULT_USERNAME);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Giriş yapılıyor...");
      console.log("Giriş bilgileri:", { username, password });
      
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      console.log("Giriş sonucu:", result);

      if (result?.error) {
        setError(`Giriş başarısız: ${result.error}`);
        console.error("Giriş hatası:", result.error);
      } else {
        console.log("Giriş başarılı, koleksiyonlar sayfasına yönlendiriliyor...");
        router.push("/collections");
      }
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-neutral-900 p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">Seçil Store</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white"
            >
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-black text-white px-3 py-2 shadow-sm focus:border-white focus:outline-none focus:ring-white placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white"
            >
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-700 bg-black text-white px-3 py-2 shadow-sm focus:border-white focus:outline-none focus:ring-white placeholder-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
} 