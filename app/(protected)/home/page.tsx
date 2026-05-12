"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CategoryBadge } from "@/components/session/CategoryBadge";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { createSession, joinSession } from "@/lib/firestore";
import { ALL_CATEGORIES, DEPTH_CONFIG } from "@/lib/questions";
import type { Category, SessionDepth } from "@/lib/types";

type View = "home" | "create" | "join";
type DepthOption = { value: SessionDepth; label: string; icon: string; desc: string };

const DEPTH_OPTIONS: DepthOption[] = [
	{ value: "light", icon: "🌤", label: "Light", desc: "Fun, casual, low-stakes" },
	{ value: "mixed", icon: "🌥", label: "Mixed", desc: "Light and medium questions" },
	{ value: "deep", icon: "⛈", label: "Deep", desc: "All levels including vulnerable" },
];

export default function HomePage() {
	const { user } = useAuth();
	const router = useRouter();

	const [view, setView] = useState<View>("home");

	// Create session state
	const [selectedCategories, setSelectedCategories] = useState<Category[]>(["faith", "fun"]);
	const [selectedDepth, setSelectedDepth] = useState<SessionDepth>("mixed");
	const [questionLimit, setQuestionLimit] = useState<number | null>(10);
	const [skipAnswered, setSkipAnswered] = useState(true);
	const [creating, setCreating] = useState(false);
	const [createError, setCreateError] = useState<string | null>(null);

	// Join session state
	const [joinCode, setJoinCode] = useState("");
	const [joining, setJoining] = useState(false);
	const [joinError, setJoinError] = useState<string | null>(null);

	function toggleCategory(cat: Category) {
		setSelectedCategories((prev) =>
			prev.includes(cat) ? (prev.length > 1 ? prev.filter((c) => c !== cat) : prev) : [...prev, cat]
		);
	}

	async function handleCreate() {
		if (!user || selectedCategories.length === 0) return;
		setCreating(true);
		setCreateError(null);
		try {
			const code = await createSession(user.uid, user.displayName ?? "", user.photoURL ?? "", {
				categories: selectedCategories,
				depth: selectedDepth,
				questionLimit,
				skipAnswered,
			});
			router.push(`/session/${code}`);
		} catch {
			setCreateError("Failed to create session. Please try again.");
			setCreating(false);
		}
	}

	async function handleJoin(e: React.FormEvent) {
		e.preventDefault();
		if (!user || !joinCode.trim()) return;
		setJoining(true);
		setJoinError(null);

		const result = await joinSession(
			joinCode.trim(),
			user.uid,
			user.displayName ?? "",
			user.photoURL ?? ""
		);

		if (result.success) {
			router.push(`/session/${joinCode.trim().toUpperCase()}`);
		} else {
			const messages: Record<string, string> = {
				not_found: "Room code not found. Check the code and try again.",
				full: "This session already has two players.",
				ended: "This session has already ended.",
			};
			setJoinError(messages[result.error] ?? "Something went wrong.");
			setJoining(false);
		}
	}

	if (view === "create") {
		return (
			<div className="flex flex-col pb-24 px-4 pt-6">
				<button
					type="button"
					onClick={() => setView("home")}
					className="mb-6 flex items-center gap-1 text-sm text-brand-primary"
				>
					← Back
				</button>

				<h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">
					Set up your session
				</h1>
				<p className="mb-6 text-sm text-gray-500 dark:text-lavender">
					Choose what you want to explore together.
				</p>

				{/* Category selection */}
				<div className="mb-6">
					<p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
						Categories <span className="text-gray-400 font-normal">(select at least one)</span>
					</p>
					<div className="flex flex-wrap gap-2">
						{ALL_CATEGORIES.map((cat) => {
							const active = selectedCategories.includes(cat);
							return (
								<button
									key={cat}
									type="button"
									onClick={() => toggleCategory(cat)}
									className={`transition-all active:scale-95 ${active ? "opacity-100" : "opacity-40"}`}
								>
									<CategoryBadge
										category={cat}
										className={`px-3 py-1.5 text-sm cursor-pointer ${active ? "ring-2 ring-offset-1 ring-brand-primary" : ""}`}
									/>
								</button>
							);
						})}
					</div>
				</div>

				{/* Depth selection */}
				<div className="mb-8">
					<p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Question depth</p>
					<div className="flex flex-col gap-2">
						{DEPTH_OPTIONS.map((opt) => {
							const active = selectedDepth === opt.value;
							const config = DEPTH_CONFIG[opt.value === "mixed" ? "medium" : opt.value];
							return (
								<button
									key={opt.value}
									type="button"
									onClick={() => setSelectedDepth(opt.value)}
									className="flex items-center gap-3 rounded-2xl border p-4 text-left transition-all active:scale-[0.99]"
									style={
										active
											? {
													borderColor: config.text,
													backgroundColor: config.lightBg,
												}
											: { borderColor: "#E5E7EB" }
									}
								>
									<span className="text-2xl">{opt.icon}</span>
									<div>
										<p
											className="text-sm font-semibold"
											style={active ? { color: config.text } : { color: "#374151" }}
										>
											{opt.label}
										</p>
										<p className="text-xs text-gray-500">{opt.desc}</p>
									</div>
									{active && (
										<span className="ml-auto text-sm" style={{ color: config.text }}>
											✓
										</span>
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Question limit */}
				<div className="mb-8">
					<p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
						Number of questions
					</p>
					<div className="flex flex-wrap gap-2">
						{([5, 10, 15, 20, null] as (number | null)[]).map((n) => {
							const active = questionLimit === n;
							return (
								<button
									key={String(n)}
									type="button"
									onClick={() => setQuestionLimit(n)}
									className={`rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
										active
											? "border-brand-primary bg-brand-primary text-white"
											: "border-gray-200 text-gray-600 dark:border-white/20 dark:text-gray-300"
									}`}
								>
									{n === null ? "Unlimited" : n}
								</button>
							);
						})}
					</div>
				</div>

				{/* Skip repeated questions */}
				<div className="mb-8">
					<p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
						Previously asked questions
					</p>
					<div className="flex gap-2">
						{(
							[
								{ value: true, label: "Skip repeats" },
								{ value: false, label: "Allow repeats" },
							] as { value: boolean; label: string }[]
						).map((opt) => {
							const active = skipAnswered === opt.value;
							return (
								<button
									key={String(opt.value)}
									type="button"
									onClick={() => setSkipAnswered(opt.value)}
									className={`rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
										active
											? "border-brand-primary bg-brand-primary text-white"
											: "border-gray-200 text-gray-600 dark:border-white/20 dark:text-gray-300"
									}`}
								>
									{opt.label}
								</button>
							);
						})}
					</div>
				</div>

				{createError && <p className="mb-4 text-sm text-danger">{createError}</p>}

				<button
					type="button"
					onClick={handleCreate}
					disabled={creating || selectedCategories.length === 0}
					className="min-h-12 rounded-full font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
					style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #8B5CF6 100%)" }}
				>
					{creating ? "Creating…" : "Create Session"}
				</button>
			</div>
		);
	}

	if (view === "join") {
		return (
			<div className="flex flex-col pb-24 px-4 pt-6">
				<button
					type="button"
					onClick={() => setView("home")}
					className="mb-6 flex items-center gap-1 text-sm text-brand-primary"
				>
					← Back
				</button>

				<h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Join a session</h1>
				<p className="mb-6 text-sm text-gray-500 dark:text-lavender">
					Enter the code your partner shared with you.
				</p>

				<form onSubmit={handleJoin} className="flex flex-col gap-4">
					<input
						type="text"
						value={joinCode}
						onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
						placeholder="e.g. GRACE-42"
						maxLength={12}
						className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center text-xl font-bold tracking-widest outline-none focus:border-brand-primary dark:border-white/10 dark:bg-violet-900 dark:text-brand-bg dark:placeholder-gray-500"
					/>

					{joinError && <p className="text-center text-sm text-danger">{joinError}</p>}

					<button
						type="submit"
						disabled={joining || joinCode.trim().length < 4}
						className="min-h-12 rounded-full font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
						style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #8B5CF6 100%)" }}
					>
						{joining ? "Joining…" : "Join Session"}
					</button>
				</form>
			</div>
		);
	}

	return (
		<div className="flex flex-col pb-24 px-4 pt-8">
			{/* Header */}
			<Link href="/profile" className="mb-8 flex items-center gap-3 active:opacity-70">
				<PlayerAvatar
					src={user?.photoURL ?? ""}
					name={user?.displayName ?? user?.email ?? "?"}
					size={48}
					className="ring-2 ring-brand-light"
				/>
				<div>
					<p className="text-xs text-gray-500 dark:text-lavender">Welcome back</p>
					<p className="font-semibold text-gray-900 dark:text-white">
						{user?.displayName?.split(" ")[0]}
					</p>
				</div>
			</Link>

			{/* Hero */}
			<div
				className="mb-8 rounded-3xl p-6 text-white"
				style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)" }}
			>
				<h1 className="mb-1 text-2xl font-bold">KnowMe</h1>
				<p className="text-sm opacity-90">
					A space to genuinely know each other — one question at a time.
				</p>
			</div>

			{/* Actions */}
			<div className="flex flex-col gap-3">
				<button
					type="button"
					onClick={() => setView("create")}
					className="min-h-14 rounded-2xl font-semibold text-white transition-all active:scale-[0.98]"
					style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #8B5CF6 100%)" }}
				>
					<span className="text-lg">+ </span>Create Session
				</button>

				<button
					type="button"
					onClick={() => setView("join")}
					className="min-h-14 rounded-2xl border border-brand-primary font-semibold text-brand-primary transition-all active:scale-[0.98] dark:border-lavender dark:text-lavender"
				>
					Join with a Code
				</button>
			</div>

			{/* Category preview */}
			<div className="mt-8">
				<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
					Topics you can explore
				</p>
				<div className="flex flex-wrap gap-2">
					{ALL_CATEGORIES.map((cat) => (
						<CategoryBadge key={cat} category={cat} />
					))}
				</div>
			</div>
		</div>
	);
}
