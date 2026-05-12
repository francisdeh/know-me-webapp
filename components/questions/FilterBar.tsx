"use client";

import { Search, X } from "lucide-react";
import { ALL_CATEGORIES, CATEGORY_COLOURS, CATEGORY_LABELS, DEPTH_CONFIG } from "@/lib/questions";
import type { Category, DepthLevel } from "@/lib/types";

type Props = {
	selectedCategories: Category[];
	selectedDepths: DepthLevel[];
	search: string;
	onCategoryToggle: (category: Category) => void;
	onDepthToggle: (depth: DepthLevel) => void;
	onSearchChange: (value: string) => void;
};

const ALL_DEPTHS: DepthLevel[] = ["light", "medium", "deep"];

export function FilterBar({
	selectedCategories,
	selectedDepths,
	search,
	onCategoryToggle,
	onDepthToggle,
	onSearchChange,
}: Props) {
	return (
		<div className="flex flex-col gap-3 px-4 py-3">
			{/* Search */}
			<div className="relative">
				<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search questions…"
					className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition-colors focus:border-brand-primary dark:border-white/10 dark:bg-violet-900 dark:text-brand-bg dark:placeholder-gray-400"
				/>
				{search && (
					<button
						type="button"
						onClick={() => onSearchChange("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						<X size={14} />
					</button>
				)}
			</div>

			{/* Depth chips */}
			<div className="flex gap-2">
				{ALL_DEPTHS.map((depth) => {
					const config = DEPTH_CONFIG[depth];
					const active = selectedDepths.includes(depth);
					return (
						<button
							key={depth}
							type="button"
							onClick={() => onDepthToggle(depth)}
							className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
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

			{/* Category chips — horizontal scroll */}
			<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
				{ALL_CATEGORIES.map((cat) => {
					const colours = CATEGORY_COLOURS[cat];
					const active = selectedCategories.includes(cat);
					return (
						<button
							key={cat}
							type="button"
							onClick={() => onCategoryToggle(cat)}
							className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-all active:scale-95 ${
								active
									? ""
									: "border-gray-300 text-gray-500 dark:border-white/20 dark:text-gray-400"
							}`}
							style={
								active
									? {
											backgroundColor: colours.lightBg,
											color: colours.text,
											borderColor: colours.text,
										}
									: undefined
							}
						>
							{CATEGORY_LABELS[cat]}
						</button>
					);
				})}
			</div>
		</div>
	);
}
