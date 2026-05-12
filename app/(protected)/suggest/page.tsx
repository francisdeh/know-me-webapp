"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";
import { ALL_CATEGORIES, CATEGORY_LABELS, DEPTH_CONFIG } from "@/lib/questions";
import type { Category, DepthLevel } from "@/lib/types";

const DEPTHS: DepthLevel[] = ["light", "medium", "deep"];

export default function SuggestPage() {
	const { user } = useAuth();
	const [category, setCategory] = useState<Category>("faith");
	const [depth, setDepth] = useState<DepthLevel>("light");
	const [text, setText] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!user || !text.trim()) return;

		setSubmitting(true);
		setError(null);
		try {
			await addDoc(collection(db, "questions"), {
				text: text.trim(),
				category,
				depth,
				suggestedBy: user.uid,
				createdAt: serverTimestamp(),
			});
			setText("");
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
		} catch (err) {
			console.error(err);
			setError("Failed to submit. Please try again.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col pb-20 md:pb-8 px-4 pt-6">
			<h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Suggest a Question</h1>
			<p className="mb-6 text-sm text-gray-500 dark:text-lavender">
				Your question goes live immediately for everyone to use.
			</p>

			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				{/* Category */}
				<div className="flex flex-col gap-1.5">
					<label htmlFor="category" className="text-sm font-medium text-gray-900 dark:text-white">
						Category
					</label>
					<select
						id="category"
						value={category}
						onChange={(e) => setCategory(e.target.value as Category)}
						className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-primary dark:border-white/10 dark:bg-violet-900 dark:text-brand-bg"
					>
						{ALL_CATEGORIES.map((cat) => (
							<option key={cat} value={cat}>
								{CATEGORY_LABELS[cat]}
							</option>
						))}
					</select>
				</div>

				{/* Depth */}
				<fieldset className="flex flex-col gap-1.5 border-0 p-0 m-0">
					<legend className="text-sm font-medium text-gray-900 dark:text-white">Depth</legend>
					<div className="flex gap-2">
						{DEPTHS.map((d) => {
							const config = DEPTH_CONFIG[d];
							const active = depth === d;
							return (
								<button
									key={d}
									type="button"
									onClick={() => setDepth(d)}
									className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2.5 text-sm font-medium transition-all active:scale-95 ${
										active
											? ""
											: "border-gray-300 text-gray-500 dark:border-white/20 dark:text-gray-400"
									}`}
									style={
										active
											? {
													backgroundColor: config.lightBg,
													color: config.text,
													borderColor: config.text,
												}
											: undefined
									}
								>
									{config.icon} {config.label}
								</button>
							);
						})}
					</div>
				</fieldset>

				{/* Question text */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="question-text"
						className="text-sm font-medium text-gray-900 dark:text-white"
					>
						Question
					</label>
					<textarea
						id="question-text"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Write your question here…"
						rows={4}
						required
						className="resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-brand-primary dark:border-white/10 dark:bg-violet-900 dark:text-brand-bg dark:placeholder-gray-400"
					/>
				</div>

				{error && <p className="text-sm text-danger">{error}</p>}

				{success && (
					<div className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-success dark:bg-green-900/20">
						<CheckCircle size={16} />
						Question added to the bank!
					</div>
				)}

				<button
					type="submit"
					disabled={submitting || !text.trim()}
					className="min-h-12 rounded-full bg-brand-primary font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
					style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #8B5CF6 100%)" }}
				>
					{submitting ? "Submitting…" : "Submit Question"}
				</button>
			</form>
		</div>
	);
}
