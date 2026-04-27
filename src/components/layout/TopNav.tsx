"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

interface TopNavProps {
  userName: string | null | undefined;
  userEmail: string;
  role: string | null;
}

export function TopNav({ userName, userEmail, role }: TopNavProps) {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400 capitalize">
          {role?.toLowerCase() ?? ""}
        </span>
        <div className="relative group">
          <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-xs">
              {(userName ?? userEmail).charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block">{userName ?? userEmail}</span>
          </button>
          <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 w-48 hidden group-hover:block z-10">
            <Link
              href="/dashboard/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
