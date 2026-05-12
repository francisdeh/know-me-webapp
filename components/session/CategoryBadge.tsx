import { CATEGORY_COLOURS, CATEGORY_LABELS } from "@/lib/questions";
import type { Category } from "@/lib/types";

type Props = {
	category: Category;
	className?: string;
};

export function CategoryBadge({ category, className = "" }: Props) {
	const colours = CATEGORY_COLOURS[category];

	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
			style={{
				backgroundColor: colours.lightBg,
				color: colours.text,
			}}
		>
			{CATEGORY_LABELS[category]}
		</span>
	);
}
