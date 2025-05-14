import { useRouter, usePathname } from "next/navigation";
import { HiOutlineCollection } from "react-icons/hi";

export default function Menu() {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = pathname.startsWith("/collections");
  return (
    <div className="w-48 bg-white border-r border-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-900">
        <div className="text-xl font-bold text-black">LOGO</div>
      </div>
      <div className="p-4 border-b border-gray-900 text-sm font-medium text-black">MENÜ</div>
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => router.push("/collections")}
              className={`flex items-center w-full p-2 rounded-md transition font-semibold ${isActive ? "bg-gray-900 text-white" : "bg-black text-white hover:bg-gray-100"}`}
            >
              <HiOutlineCollection className="h-5 w-5 mr-2" />
              Collections
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
} 