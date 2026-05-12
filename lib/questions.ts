import type { Category, DepthLevel, SessionDepth } from "@/lib/types";

export const CATEGORY_LABELS: Record<Category, string> = {
	faith: "Faith & Spirituality",
	family: "Family & Roots",
	marriage: "Marriage & Future",
	career: "Career & Purpose",
	growth: "Personal Growth",
	interests: "Interests & Lifestyle",
	money: "Money & Finances",
	health: "Health & Fitness",
	intimacy: "Love & Intimacy",
	world: "World & Big Thinking",
	fun: "Fun & Random",
};

export const ALL_CATEGORIES: Category[] = [
	"faith",
	"family",
	"marriage",
	"career",
	"growth",
	"interests",
	"money",
	"health",
	"intimacy",
	"world",
	"fun",
];

type BadgeColours = {
	lightBg: string;
	text: string;
	darkBg: string;
};

export const CATEGORY_COLOURS: Record<Category, BadgeColours> = {
	faith: { lightBg: "#EDE9FE", text: "#6C3FE8", darkBg: "#4C1D95" },
	family: { lightBg: "#FEF3C7", text: "#D97706", darkBg: "#78350F" },
	marriage: { lightBg: "#FCE7F3", text: "#DB2777", darkBg: "#831843" },
	career: { lightBg: "#DBEAFE", text: "#2563EB", darkBg: "#1E3A5F" },
	growth: { lightBg: "#D1FAE5", text: "#059669", darkBg: "#064E3B" },
	interests: { lightBg: "#FEE2E2", text: "#DC2626", darkBg: "#7F1D1D" },
	money: { lightBg: "#FEF9C3", text: "#854D0E", darkBg: "#713F12" },
	health: { lightBg: "#DCFCE7", text: "#16A34A", darkBg: "#14532D" },
	intimacy: { lightBg: "#FFF1F2", text: "#E11D48", darkBg: "#881337" },
	world: { lightBg: "#F3F4F6", text: "#374151", darkBg: "#1F2937" },
	fun: { lightBg: "#FFF7ED", text: "#EA580C", darkBg: "#7C2D12" },
};

export const DEPTH_CONFIG: Record<
	DepthLevel,
	{ label: string; icon: string; lightBg: string; text: string; darkBg: string }
> = {
	light: { label: "Light", icon: "🌤", lightBg: "#D1FAE5", text: "#059669", darkBg: "#064E3B" },
	medium: { label: "Medium", icon: "🌥", lightBg: "#FEF3C7", text: "#D97706", darkBg: "#78350F" },
	deep: { label: "Deep", icon: "⛈", lightBg: "#FCE7F3", text: "#DB2777", darkBg: "#831843" },
};

/** Returns which depth levels are eligible for a given session depth setting */
export function eligibleDepths(sessionDepth: SessionDepth): DepthLevel[] {
	if (sessionDepth === "light") return ["light"];
	if (sessionDepth === "mixed") return ["light", "medium"];
	return ["light", "medium", "deep"];
}
