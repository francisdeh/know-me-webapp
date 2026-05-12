"use client";

import { Clock, Home, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
	{ href: "/home", label: "Home", icon: Home },
	{ href: "/questions", label: "Browse", icon: Search },
	{ href: "/suggest", label: "Suggest", icon: Plus },
	{ href: "/history", label: "History", icon: Clock },
];

export function SideNav() {
	const pathname = usePathname();

	if (pathname.startsWith("/session/")) return null;

	return (
		<aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col border-r border-gray-100 dark:border-white/10">
			<div className="sticky top-0 flex h-screen flex-col px-3 py-6">
				<Link href="/home" className="mb-6 flex items-center gap-2 px-2 active:opacity-70">
					<Image src="/favicon.svg" alt="KnowMe" width={28} height={28} />
					<span className="text-lg font-bold text-brand-primary">KnowMe</span>
				</Link>

				<nav className="flex flex-col gap-1">
					{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
						const active = pathname === href || pathname.startsWith(`${href}/`);
						return (
							<Link
								key={href}
								href={href}
								className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
									active
										? "bg-brand-light text-brand-primary dark:bg-violet-900 dark:text-lavender"
										: "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-violet-900/50 dark:hover:text-white"
								}`}
							>
								<Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
								{label}
							</Link>
						);
					})}
				</nav>

				<div className="mt-auto px-2">
					<ThemeToggle />
				</div>
			</div>
		</aside>
	);
}
