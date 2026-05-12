import {
	arrayUnion,
	collection,
	doc,
	getDocs,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { eligibleDepths } from "@/lib/questions";
import type { CurrentQuestion, QuestionDoc, SessionSettings } from "@/lib/types";

export async function fetchEligibleQuestions(
	settings: SessionSettings,
	excludeIds: string[]
): Promise<QuestionDoc[]> {
	if (settings.categories.length === 0) return [];

	const depths = eligibleDepths(settings.depth);
	const q = query(collection(db, "questions"), where("category", "in", settings.categories));
	const snap = await getDocs(q);

	return snap.docs
		.map((d) => ({ id: d.id, ...d.data() }) as QuestionDoc)
		.filter((question) => depths.includes(question.depth) && !excludeIds.includes(question.id));
}

export async function drawQuestion(
	code: string,
	settings: SessionSettings,
	answeredIds: string[]
): Promise<"ok" | "no_questions"> {
	const eligible = await fetchEligibleQuestions(settings, answeredIds);
	if (eligible.length === 0) return "no_questions";

	const question = eligible[Math.floor(Math.random() * eligible.length)];

	await updateDoc(doc(db, "sessions", code), {
		currentQuestion: {
			questionId: question.id,
			text: question.text,
			category: question.category,
			depth: question.depth,
			drawnAt: serverTimestamp(),
			answers: {},
			revealed: false,
		},
	});

	return "ok";
}

export async function submitAnswer(
	code: string,
	userId: string,
	answerText: string,
	partnerAlreadyAnswered: boolean
): Promise<void> {
	const update: Record<string, unknown> = {
		[`currentQuestion.answers.${userId}`]: {
			text: answerText,
			submittedAt: serverTimestamp(),
		},
	};

	if (partnerAlreadyAnswered) {
		update["currentQuestion.revealed"] = true;
	}

	await updateDoc(doc(db, "sessions", code), update);
}

export async function revealAnswers(code: string): Promise<void> {
	await updateDoc(doc(db, "sessions", code), {
		"currentQuestion.revealed": true,
	});
}

export async function advanceTurn(
	code: string,
	currentTurnUid: string,
	otherUid: string,
	currentQuestion: CurrentQuestion
): Promise<void> {
	const historyEntry = {
		questionId: currentQuestion.questionId,
		questionText: currentQuestion.text,
		category: currentQuestion.category,
		drawnBy: currentTurnUid,
		answers: Object.fromEntries(
			Object.entries(currentQuestion.answers).map(([uid, a]) => [uid, a.text])
		),
		drawnAt: currentQuestion.drawnAt,
	};

	await setDoc(doc(db, "sessions", code, "history", currentQuestion.questionId), historyEntry);

	await updateDoc(doc(db, "sessions", code), {
		answeredQuestionIds: arrayUnion(currentQuestion.questionId),
		currentQuestion: null,
		currentTurn: otherUid,
	});
}

export async function endSession(
	code: string,
	currentQuestion: CurrentQuestion | null,
	drawnBy: string
): Promise<void> {
	if (currentQuestion) {
		const historyEntry = {
			questionId: currentQuestion.questionId,
			questionText: currentQuestion.text,
			category: currentQuestion.category,
			drawnBy,
			answers: Object.fromEntries(
				Object.entries(currentQuestion.answers).map(([uid, a]) => [uid, a.text])
			),
			drawnAt: currentQuestion.drawnAt,
		};
		await setDoc(doc(db, "sessions", code, "history", currentQuestion.questionId), historyEntry);
	}

	await updateDoc(doc(db, "sessions", code), {
		status: "ended",
		endedAt: serverTimestamp(),
		...(currentQuestion
			? { answeredQuestionIds: arrayUnion(currentQuestion.questionId), currentQuestion: null }
			: {}),
	});
}
