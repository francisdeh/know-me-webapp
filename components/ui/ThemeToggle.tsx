"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
	const { theme, toggle } = useTheme();

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
			className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition-colors hover:bg-brand-light dark:hover:bg-violet-900"
			suppressHydrationWarning
		>
			{theme === "dark" ? "☀️" : "🌙"}
		</button>
	);
}
