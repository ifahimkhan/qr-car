import Link from "next/link";
import { Home, Car, User } from "lucide-react";

type Tab = "home" | "cars" | "account";

const TABS = [
  { id: "home" as Tab, href: "/dashboard", Icon: Home, label: "Home" },
  { id: "cars" as Tab, href: "/dashboard/vehicles", Icon: Car, label: "Cars" },
  { id: "account" as Tab, href: "#", Icon: User, label: "Account" },
] as const;

export function TabBar({ active }: { active: Tab }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 max-w-sm mx-auto bg-white border-t border-gray-100 flex">
      {TABS.map(({ id, href, Icon, label }) => (
        <Link
          key={id}
          href={href}
          className={`flex-1 flex flex-col items-center py-3 ${id === active ? "text-black" : "text-gray-400"}`}
        >
          <Icon size={20} />
          <span className="text-[11px] mt-0.5">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
