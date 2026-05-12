"use client";

import { useState } from "react";
import { FilterBar } from "@/components/questions/FilterBar";
import { QuestionCard } from "@/components/questions/QuestionCard";
import { useQuestions } from "@/hooks/useQuestions";
import type { Category, DepthLevel } from "@/lib/types";

export default function QuestionsPage() {
	const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
	const [selectedDepths, setSelectedDepths] = useState<DepthLevel[]>([]);
	const [search, setSearch] = useState("");

	const { questions, loading } = useQuestions({
		categories: selectedCategories,
		depths: selectedDepths,
		search,
	});

	function toggleCategory(cat: Category) {
		setSelectedCategories((prev) =>
			prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
		);
	}

	function toggleDepth(depth: DepthLevel) {
		setSelectedDepths((prev) =>
			prev.includes(depth) ? prev.filter((d) => d !== depth) : [...prev, depth]
		);
	}

	return (
		<div className="flex flex-col pb-20">
			<div className="sticky top-0 z-10 border-b border-gray-100 bg-brand-bg dark:border-white/10 dark:bg-violet-950">
				<div className="px-4 pt-4">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h1>
					<p className="mt-0.5 text-sm text-gray-500 dark:text-lavender">
						{loading
							? "Loading…"
							: `${questions.length} question${questions.length !== 1 ? "s" : ""}`}
					</p>
				</div>
				<FilterBar
					selectedCategories={selectedCategories}
					selectedDepths={selectedDepths}
					search={search}
					onCategoryToggle={toggleCategory}
					onDepthToggle={toggleDepth}
					onSearchChange={setSearch}
				/>
			</div>

			<div className="px-4 py-4">
				{loading ? (
					<div className="flex justify-center py-12">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
					</div>
				) : questions.length === 0 ? (
					<div className="py-12 text-center">
						<p className="text-gray-400 dark:text-lavender">No questions match your filters.</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{questions.map((q) => (
							<QuestionCard key={q.id} question={q} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
