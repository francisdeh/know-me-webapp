"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "knowme-theme";

export function useTheme() {
	const [theme, setTheme] = useState<Theme>("dark");
	// Skip the first run of the DOM-sync effect — the inline init script already
	// set the correct class before React hydrated, so we'd just cause a flash.
	const isFirstRender = useRef(true);

	// Read stored preference on mount and correct state if needed.
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		setTheme(stored === "light" || stored === "dark" ? stored : "dark");
	}, []);

	// Sync DOM class and persist preference, but skip the initial mount.
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

	return { theme, toggle };
}
