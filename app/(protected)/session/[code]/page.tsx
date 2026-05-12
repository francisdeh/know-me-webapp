"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ActiveGame } from "@/components/session/ActiveGame";
import { CategoryBadge } from "@/components/session/CategoryBadge";
import { DepthBadge } from "@/components/session/DepthBadge";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useSession } from "@/hooks/useSession";
import { joinSession } from "@/lib/firestore";
import { DEPTH_CONFIG } from "@/lib/questions";
import type { DepthLevel } from "@/lib/types";

const SESSION_DEPTH_TO_DISPLAY: Record<string, DepthLevel> = {
	light: "light",
	mixed: "medium",
	deep: "deep",
};

export default function SessionPage() {
	const { code } = useParams<{ code: string }>();
	const { user } = useAuth();
	const router = useRouter();
	const { session, loading } = useSession(code);
	const [joining, setJoining] = useState(false);
	const [joinError, setJoinError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!loading && session?.status === "ended") {
			router.replace(`/session/${code}/end`);
		}
	}, [session?.status, loading, code, router]);

	async function handleJoin() {
		if (!user || !session) return;
		setJoining(true);
		setJoinError(null);

		const result = await joinSession(code, user.uid, user.displayName ?? "", user.photoURL ?? "");

		if (!result.success) {
			const messages: Record<string, string> = {
				not_found: "Session not found.",
				full: "This session already has two players.",
				ended: "This session has already ended.",
			};
			setJoinError(messages[result.error] ?? "Something went wrong.");
			setJoining(false);
		}
		// On success the onSnapshot will update session.status → active
	}

	async function copyCode() {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	if (loading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
				<p className="text-center text-gray-500 dark:text-lavender">Session not found.</p>
				<button
					type="button"
					onClick={() => router.replace("/home")}
					className="rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary"
				>
					Back to Home
				</button>
			</div>
		);
	}

	const isPlayer = user ? session.players.includes(user.uid) : false;
	const depthLevel = SESSION_DEPTH_TO_DISPLAY[session.settings.depth];
	const depthConfig = DEPTH_CONFIG[depthLevel];

	// Player 1 waiting for Player 2
	if (isPlayer && session.status === "waiting") {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
				<div
					className="rounded-3xl p-6 w-full max-w-sm"
					style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)" }}
				>
					<p className="mb-1 text-sm font-medium text-white/80">Your room code</p>
					<p className="text-4xl font-bold tracking-widest text-white">{session.code}</p>
				</div>

				<button
					type="button"
					onClick={copyCode}
					className="rounded-full border border-brand-primary px-6 py-2.5 text-sm font-semibold text-brand-primary transition-all active:scale-95"
				>
					{copied ? "Copied!" : "Copy Code"}
				</button>

				<div className="flex flex-col items-center gap-2">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
					<p className="text-sm text-gray-500 dark:text-lavender">
						Waiting for your partner to join…
					</p>
				</div>

				<div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-violet-900">
					<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
						Session settings
					</p>
					<div className="mb-2 flex flex-wrap gap-1.5">
						{session.settings.categories.map((cat) => (
							<CategoryBadge key={cat} category={cat} />
						))}
					</div>
					<div
						className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
						style={{ backgroundColor: depthConfig.lightBg, color: depthConfig.text }}
					>
						{depthConfig.icon}{" "}
						{session.settings.depth.charAt(0).toUpperCase() + session.settings.depth.slice(1)}
					</div>
				</div>
			</div>
		);
	}

	// Not yet a player — join preview
	if (!isPlayer && session.status === "waiting") {
		const creatorName = Object.values(session.playerNames)[0] ?? "Someone";

		return (
			<div className="flex flex-1 flex-col pb-8 px-4 pt-6">
				<h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">You're invited</h1>
				<p className="mb-6 text-sm text-gray-500 dark:text-lavender">
					<span className="font-medium text-gray-900 dark:text-white">{creatorName}</span> wants to
					play a round of KnowMe with you.
				</p>

				{/* Session preview */}
				<div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-violet-900">
					<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
						What you'll explore
					</p>
					<div className="mb-3 flex flex-wrap gap-1.5">
						{session.settings.categories.map((cat) => (
							<CategoryBadge key={cat} category={cat} />
						))}
					</div>
					<DepthBadge depth={depthLevel} />
				</div>

				{/* Creator avatar */}
				<div className="mb-8 flex items-center gap-3 rounded-2xl bg-brand-light px-4 py-3 dark:bg-violet-900/50">
					{Object.entries(session.playerAvatars).map(([uid, url]) => (
						<PlayerAvatar
							key={uid}
							src={url}
							name={session.playerNames[uid] ?? "Player"}
							size={36}
						/>
					))}
					<p className="text-sm text-gray-900 dark:text-white">
						<span className="font-semibold">{creatorName}</span> is waiting for you
					</p>
				</div>

				{joinError && <p className="mb-4 text-sm text-danger">{joinError}</p>}

				<button
					type="button"
					onClick={handleJoin}
					disabled={joining}
					className="min-h-12 rounded-full font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
					style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)" }}
				>
					{joining ? "Joining…" : "Join Session"}
				</button>
			</div>
		);
	}

	// Active session
	if (session.status === "active") {
		return <ActiveGame session={session} code={code} />;
	}

	return null;
}
