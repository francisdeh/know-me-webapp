"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AIReflectionCard } from "@/components/session/AIReflectionCard";
import { CategoryBadge } from "@/components/session/CategoryBadge";
import { DepthBadge } from "@/components/session/DepthBadge";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useSession } from "@/hooks/useSession";
import { useSessionHistory } from "@/hooks/useSessionHistory";

const SESSION_DEPTH_TO_DISPLAY: Record<string, "light" | "medium" | "deep"> = {
	light: "light",
	mixed: "medium",
	deep: "deep",
};

export default function HistoryDetailPage() {
	const { code } = useParams<{ code: string }>();
	const router = useRouter();
	const { user } = useAuth();
	const { session, loading: sessionLoading } = useSession(code);
	const { entries, loading: historyLoading } = useSessionHistory(code);

	const loading = sessionLoading || historyLoading;

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
				<p className="text-gray-500 dark:text-lavender">Session not found.</p>
				<button
					type="button"
					onClick={() => router.replace("/history")}
					className="rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary"
				>
					Back to History
				</button>
			</div>
		);
	}

	const depthLevel = SESSION_DEPTH_TO_DISPLAY[session.settings.depth];
	const endedMs = session.endedAt?.toMillis() ?? session.createdAt?.toMillis() ?? 0;
	const dateLabel = new Date(endedMs).toLocaleDateString(undefined, {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	return (
		<div className="flex flex-col pb-20 px-4 pt-4 gap-5">
			<button
				type="button"
				onClick={() => router.back()}
				className="flex items-center gap-1 text-sm text-brand-primary"
			>
				← Back
			</button>

			{/* Hero */}
			<div
				className="rounded-3xl p-5 text-center"
				style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)" }}
			>
				<div className="mb-3 flex justify-center -space-x-3">
					{Object.entries(session.playerAvatars).map(([uid, url]) => (
						<PlayerAvatar
							key={uid}
							src={url}
							name={session.playerNames[uid] ?? "Player"}
							size={48}
							className="ring-2 ring-white"
						/>
					))}
				</div>
				<p className="font-bold text-white text-lg mb-0.5">
					{Object.values(session.playerNames)
						.map((n) => n.split(" ")[0])
						.join(" & ")}
				</p>
				<p className="text-sm text-white/80">
					{dateLabel} · {session.answeredQuestionIds.length} questions
				</p>
				<p className="mt-1 font-mono text-xs text-white/50">{code}</p>
			</div>

			{/* Session settings */}
			<div className="flex flex-wrap gap-1.5 items-center">
				{session.settings.categories.map((cat) => (
					<CategoryBadge key={cat} category={cat} />
				))}
				<DepthBadge depth={depthLevel} />
			</div>

			{/* AI Reflection */}
			{session.aiReflection && <AIReflectionCard content={session.aiReflection.content} />}

			{/* Q&A list */}
			{entries.length > 0 && (
				<div className="flex flex-col gap-4">
					<p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
						Questions & Answers
					</p>
					{entries.map((entry, i) => (
						<div
							key={entry.questionId}
							className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-violet-900"
						>
							<p className="mb-1 text-xs text-gray-400">#{i + 1}</p>
							<p className="mb-3 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
								{entry.questionText}
							</p>
							<div className="flex flex-col gap-2">
								{session.players.map((uid) => {
									const name = session.playerNames[uid]?.split(" ")[0] ?? "Player";
									const answer = entry.answers[uid];
									const isMe = uid === user?.uid;
									return (
										<div key={uid}>
											<p className="text-xs font-medium text-gray-400 mb-0.5">
												{isMe ? "You" : name}
											</p>
											<p className="text-sm text-gray-900 dark:text-white">
												{answer ?? <span className="italic text-gray-400">No answer</span>}
											</p>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			)}

			{entries.length === 0 && (
				<p className="text-center text-sm text-gray-400 py-8">No answers recorded.</p>
			)}
		</div>
	);
}
