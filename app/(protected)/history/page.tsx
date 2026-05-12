"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { CategoryBadge } from "@/components/session/CategoryBadge";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useUserSessions } from "@/hooks/useUserSessions";

function formatDate(ms: number) {
	return new Date(ms).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function HistoryPage() {
	const { user } = useAuth();
	const { sessions, loading } = useUserSessions(user?.uid ?? null);

	return (
		<div className="flex flex-col pb-20 md:pb-8 px-4 pt-6">
			<h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">History</h1>
			<p className="mb-6 text-sm text-gray-500 dark:text-lavender">Your completed sessions.</p>

			{loading ? (
				<div className="flex justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
				</div>
			) : sessions.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<p className="text-3xl">📖</p>
					<p className="font-semibold text-gray-900 dark:text-white">No sessions yet</p>
					<p className="text-sm text-gray-500 dark:text-lavender">
						Completed sessions will appear here.
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-3">
					{sessions.map((session) => {
						const partnerId = session.players.find((p) => p !== user?.uid);
						const partnerName = partnerId
							? (session.playerNames[partnerId] ?? "Unknown")
							: "Unknown";
						const partnerAvatar = partnerId ? session.playerAvatars[partnerId] : null;
						const endedMs = session.endedAt?.toMillis() ?? session.createdAt?.toMillis() ?? 0;

						return (
							<Link
								key={session.code}
								href={`/history/${session.code}`}
								className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all active:scale-[0.99] dark:border-white/10 dark:bg-violet-900"
							>
								<div className="flex items-center gap-3">
									<PlayerAvatar src={partnerAvatar ?? ""} name={partnerName} size={40} />
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-gray-900 dark:text-white truncate">
											{partnerName.split(" ")[0]}
										</p>
										<p className="text-xs text-gray-400">
											{formatDate(endedMs)} · {session.answeredQuestionIds.length} questions
										</p>
										<p className="text-xs font-mono text-gray-400">{session.code}</p>
									</div>
									<span className="text-gray-300 dark:text-white/20">→</span>
								</div>
								<div className="flex flex-wrap gap-1.5">
									{session.settings.categories.slice(0, 4).map((cat) => (
										<CategoryBadge key={cat} category={cat} />
									))}
									{session.settings.categories.length > 4 && (
										<span className="text-xs text-gray-400">
											+{session.settings.categories.length - 4} more
										</span>
									)}
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
