"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/profile", label: "My Profile", icon: "👤" },
  { href: "/dashboard/colleges", label: "College Search", icon: "🎓" },
  { href: "/dashboard/match", label: "My Matches", icon: "⭐", roles: ["STUDENT"] },
  { href: "/dashboard/applications", label: "Applications", icon: "📋" },
  { href: "/dashboard/messages", label: "Messages", icon: "💬" },
  { href: "/dashboard/schedule", label: "Schedule", icon: "📅" },
  { href: "/dashboard/students", label: "Students", icon: "👥", roles: ["ADVISOR", "ADMIN"] },
];

interface SidebarProps {
  role: Role | null;
  orgName: string;
}

export function Sidebar({ role, orgName }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="p-4 border-b">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          Workspace
        </p>
        <p className="font-semibold text-gray-900 truncate">{orgName}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
