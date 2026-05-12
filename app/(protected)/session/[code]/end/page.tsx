"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AIReflectionCard } from "@/components/session/AIReflectionCard";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useSession } from "@/hooks/useSession";

export default function EndPage() {
	const { code } = useParams<{ code: string }>();
	const router = useRouter();
	const { user } = useAuth();
	const { session, loading } = useSession(code);
	const [reflectionError, setReflectionError] = useState<string | null>(null);
	const triggered = useRef(false);

	useEffect(() => {
		if (!user || !session || triggered.current) return;
		if (session.aiReflection) return; // already generated

		triggered.current = true;

		(async () => {
			try {
				const idToken = await user.getIdToken();
				const res = await fetch("/api/reflect", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ code: code.toUpperCase(), idToken }),
				});
				if (!res.ok) {
					const data = await res.json();
					setReflectionError(data.error ?? "Could not generate reflection.");
				}
				// On success, the onSnapshot in useSession picks up aiReflection automatically
			} catch {
				setReflectionError("Could not generate reflection.");
			}
		})();
	}, [user, session, code]);

	if (loading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
			</div>
		);
	}

	const players = session ? Object.entries(session.playerNames) : [];

	return (
		<div className="flex flex-1 flex-col px-4 pb-10 pt-6 gap-6">
			{/* Hero */}
			<div
				className="rounded-3xl p-6 text-center"
				style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)" }}
			>
				{session && (
					<div className="mb-4 flex justify-center -space-x-3">
						{Object.entries(session.playerAvatars).map(([uid, url]) => (
							<PlayerAvatar
								key={uid}
								src={url}
								name={session.playerNames[uid] ?? "Player"}
								size={52}
								className="ring-2 ring-white"
							/>
						))}
					</div>
				)}
				<p className="text-xl font-bold text-white mb-1">
					{players.map(([, name]) => name.split(" ")[0]).join(" & ")} — Session Complete
				</p>
				<p className="text-sm text-white/80">
					{session
						? `${session.answeredQuestionIds.length} questions explored`
						: "Great conversation!"}
				</p>
			</div>

			{/* AI Reflection */}
			{session?.aiReflection ? (
				<AIReflectionCard content={session.aiReflection.content} />
			) : reflectionError ? (
				<div className="rounded-2xl border border-danger/30 bg-red-50 p-4 text-sm text-danger dark:bg-red-900/20">
					{reflectionError}
				</div>
			) : (
				<div className="rounded-3xl bg-white p-6 shadow-sm dark:border dark:border-white/10 dark:bg-violet-900">
					<div className="mb-3 flex items-center gap-2">
						<span className="text-xl">✨</span>
						<p className="text-sm font-semibold text-brand-primary dark:text-lavender">
							AI Reflection
						</p>
					</div>
					<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-lavender">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
						Generating your reflection…
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="flex flex-col gap-3">
				<button
					type="button"
					onClick={() => router.push(`/history/${code}`)}
					className="min-h-12 rounded-full border border-brand-primary font-semibold text-brand-primary transition-all active:scale-95 dark:border-lavender dark:text-lavender"
				>
					View Session History
				</button>
				<button
					type="button"
					onClick={() => router.replace("/home")}
					className="min-h-12 rounded-full font-semibold text-white transition-all active:scale-95"
					style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #8B5CF6 100%)" }}
				>
					Back to Home
				</button>
			</div>
		</div>
	);
}
