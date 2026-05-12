import type { Timestamp } from "firebase/firestore";

export type UserDoc = {
	uid: string;
	displayName: string;
	email: string;
	photoURL: string;
	createdAt: Timestamp;
};

export type DepthLevel = "light" | "medium" | "deep";
export type SessionDepth = "light" | "mixed" | "deep";

export type Category =
	| "faith"
	| "family"
	| "marriage"
	| "career"
	| "growth"
	| "interests"
	| "money"
	| "health"
	| "intimacy"
	| "world"
	| "fun";

export type QuestionDoc = {
	id: string;
	text: string;
	category: Category;
	depth: DepthLevel;
	suggestedBy: string;
	createdAt: Timestamp;
};

export type SessionSettings = {
	categories: Category[];
	depth: SessionDepth;
	questionLimit: number | null;
	skipAnswered: boolean;
};

export type Answer = {
	text: string;
	submittedAt: Timestamp;
};

export type CurrentQuestion = {
	questionId: string;
	text: string;
	category: Category;
	depth: DepthLevel;
	drawnAt: Timestamp;
	answers: Record<string, Answer>;
	revealed: boolean;
};

export type AIReflection = {
	content: string;
	generatedAt: Timestamp;
	generatedBy: string;
};

export type SessionDoc = {
	code: string;
	createdBy: string;
	players: string[];
	playerNames: Record<string, string>;
	playerAvatars: Record<string, string>;
	status: "waiting" | "active" | "ended";
	currentTurn: string;
	settings: SessionSettings;
	answeredQuestionIds: string[];
	excludedQuestionIds: string[];
	currentQuestion: CurrentQuestion | null;
	createdAt: Timestamp;
	endedAt: Timestamp | null;
	aiReflection: AIReflection | null;
};

export type HistoryEntry = {
	questionId: string;
	questionText: string;
	category: Category;
	drawnBy: string;
	answers: Record<string, string>;
	drawnAt: Timestamp;
};
