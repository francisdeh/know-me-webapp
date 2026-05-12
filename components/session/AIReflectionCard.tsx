type Props = {
	content: string;
};

export function AIReflectionCard({ content }: Props) {
	return (
		<div className="rounded-3xl bg-white p-6 shadow-sm dark:border dark:border-white/10 dark:bg-violet-900">
			<div className="mb-3 flex items-center gap-2">
				<span className="text-xl">✨</span>
				<p className="text-sm font-semibold text-brand-primary dark:text-lavender">AI Reflection</p>
			</div>
			<p className="text-sm leading-relaxed text-gray-900 dark:text-white whitespace-pre-wrap">
				{content}
			</p>
		</div>
	);
}
