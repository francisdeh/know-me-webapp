import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "KnowMe",
	description:
		"A turn-based question game for two people to explore values, goals, and life vision together.",
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
		],
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

// Inline script runs before React hydration — defaults to dark unless user has explicitly chosen light.
const themeInitScript = `(function(){try{var t=localStorage.getItem('knowme-theme');if(t!=='light')document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${inter.className} h-full`} suppressHydrationWarning>
			<body className="min-h-full flex flex-col antialiased">
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: intentional theme-init script */}
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
