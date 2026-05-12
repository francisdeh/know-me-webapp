import Image from "next/image";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BottomNav } from "@/components/ui/BottomNav";
import { SideNav } from "@/components/ui/SideNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute>
			<div className="flex min-h-screen">
				<SideNav />
				<div className="flex min-w-0 flex-1 flex-col">
					{/* Mobile-only top header */}
					<header className="flex items-center justify-between border-b border-gray-100 px-6 py-3 dark:border-white/10 md:hidden">
						<Link href="/home" className="flex items-center gap-2 active:opacity-70">
							<Image src="/favicon.svg" alt="KnowMe" width={28} height={28} />
							<span className="text-lg font-bold text-brand-primary">KnowMe</span>
						</Link>
						<ThemeToggle />
					</header>
					<main className="flex flex-1 flex-col pb-nav-safe md:pb-0">
						<div className="mx-auto w-full max-w-2xl flex-1 flex flex-col">{children}</div>
					</main>
					<BottomNav />
				</div>
			</div>
		</ProtectedRoute>
	);
}
