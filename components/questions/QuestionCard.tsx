import { CategoryBadge } from "@/components/session/CategoryBadge";
import { DepthBadge } from "@/components/session/DepthBadge";
import type { QuestionDoc } from "@/lib/types";

type Props = {
	question: QuestionDoc;
};

export function QuestionCard({ question }: Props) {
	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-violet-900">
			<div className="mb-3 flex items-start justify-between gap-2">
				<CategoryBadge category={question.category} />
				<DepthBadge depth={question.depth} />
			</div>
			<p className="text-sm leading-relaxed text-gray-900 dark:text-white">{question.text}</p>
		</div>
	);
}
