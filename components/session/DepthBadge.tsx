import { DEPTH_CONFIG } from "@/lib/questions";
import type { DepthLevel } from "@/lib/types";

type Props = {
	depth: DepthLevel;
	className?: string;
};

export function DepthBadge({ depth, className = "" }: Props) {
	const config = DEPTH_CONFIG[depth];

	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
			style={{
				backgroundColor: config.lightBg,
				color: config.text,
			}}
		>
			{config.icon} {config.label}
		</span>
	);
}
