import { useRouter } from "next/navigation";

export default function Navbar({ title }: { title: string }) {
  const router = useRouter();
  return (
    <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <button
        onClick={() => router.push("/login")}
        className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
      >
        Çıkış Yap
      </button>
    </div>
  );
} 