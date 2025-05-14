import Menu from "./Menu";
import Navbar from "./Navbar";

export default function CollectionsLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Menu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} />
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 