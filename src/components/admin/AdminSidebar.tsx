"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package, ExternalLink, FileSpreadsheet, LogOut } from "lucide-react";

interface AdminSidebarProps {
  productCount: number;
  adminEmail: string;
  adminRole: string;
}

export function AdminSidebar({ productCount, adminEmail, adminRole }: AdminSidebarProps) {
  const router = useRouter();

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("ostaad_admin_session");
      localStorage.removeItem("ostaad_admin_session");
      localStorage.removeItem("ostaad_admin_active");
    } catch {
      // ignore
    }
    router.push("/admin-login");
  };

  const initials = adminEmail ? adminEmail.slice(0, 2).toUpperCase() : "AD";

  return (
    <aside className="w-full lg:w-[260px] bg-[#192C40] text-white flex flex-col fixed lg:top-0 lg:bottom-0 lg:left-0 z-40 border-b lg:border-b-0 lg:border-r border-white/10 p-4 lg:p-6 h-auto lg:h-screen">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 pb-4 lg:pb-5 border-b border-white/10 lg:mb-6">
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center">
          <Image
            src="/ostaad-logo.png"
            alt="Ostaad"
            width={32}
            height={32}
            className="w-full h-full object-cover scale-150"
          />
        </div>
        <span className="font-bold text-base tracking-tight text-white">OSTAAD</span>
        <span className="font-mono text-[9px] tracking-wider bg-[#A87545] text-white px-1.5 py-0.5 rounded uppercase ml-auto">
          Admin
        </span>
      </Link>

      <div className="hidden lg:block font-mono text-[10px] uppercase tracking-widest text-white/45 mb-2.5 px-2.5">
        Core Management
      </div>

      <ul className="flex lg:flex-col gap-1 list-none p-0 m-0 lg:mb-6 overflow-x-auto">
        <li>
          <a
            href="#products"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#23384F] text-white text-[13.5px] font-medium shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
          >
            <Package className="w-4 h-4 text-white/80 shrink-0" />
            <span className="hidden sm:inline">Products</span>
            <span className="font-mono text-[11px] bg-white/15 px-2 py-0.5 rounded-full ml-auto">
              {productCount}
            </span>
          </a>
        </li>
        <li>
          <Link
            href="/products"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/75 hover:text-white hover:bg-white/10 text-[13.5px] font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-white/80 shrink-0" />
            <span className="hidden sm:inline">Live Catalog</span>
          </Link>
        </li>
        <li>
          <Link
            href="/products/cement"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-white/75 hover:text-white hover:bg-white/10 text-[13.5px] font-medium transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-white/80 shrink-0" />
            <span className="hidden sm:inline">Spec Pages</span>
          </Link>
        </li>
      </ul>

      {/* Footer Profile */}
      <div className="hidden lg:flex mt-auto pt-4 border-t border-white/10 flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#A87545] text-white grid place-items-center font-semibold text-xs shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-white leading-tight truncate">
              {adminEmail || "admin@ostaad.in"}
            </span>
            <span className="font-mono text-[10px] text-white/50">
              {adminRole || "Super Admin"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
