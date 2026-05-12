"use client";

import { Clock, Home, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
	{ href: "/home", label: "Home", icon: Home },
	{ href: "/questions", label: "Browse", icon: Search },
	{ href: "/suggest", label: "Suggest", icon: Plus },
	{ href: "/history", label: "History", icon: Clock },
];

export function BottomNav() {
	const pathname = usePathname();

	// Session pages are a full-screen experience — no nav chrome
	if (pathname.startsWith("/session/")) return null;

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white dark:border-white/10 dark:bg-violet-950 md:hidden">
			<div className="flex items-center justify-around px-2 pt-2 pb-safe">
				{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
					const active = pathname === href || pathname.startsWith(`${href}/`);
					return (
						<Link
							key={href}
							href={href}
							className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
								active
									? "text-brand-primary"
									: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
							}`}
						>
							<Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
							<span className="text-xs font-medium">{label}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
