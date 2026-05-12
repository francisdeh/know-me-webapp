import {
	arrayUnion,
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateRoomCode } from "@/lib/roomCode";
import type { SessionDoc, SessionSettings } from "@/lib/types";

export async function createSession(
	userId: string,
	displayName: string,
	photoURL: string,
	settings: SessionSettings
): Promise<string> {
	const code = await generateRoomCode();

	const session: Omit<SessionDoc, "endedAt" | "aiReflection"> = {
		code,
		createdBy: userId,
		players: [userId],
		playerNames: { [userId]: displayName },
		playerAvatars: { [userId]: photoURL },
		status: "waiting",
		currentTurn: userId,
		settings,
		answeredQuestionIds: [],
		excludedQuestionIds: [],
		currentQuestion: null,
		createdAt: serverTimestamp() as SessionDoc["createdAt"],
	};

	await setDoc(doc(db, "sessions", code), {
		...session,
		endedAt: null,
		aiReflection: null,
	});

	return code;
}

type JoinError = "not_found" | "full" | "already_joined" | "ended";

export async function joinSession(
	code: string,
	userId: string,
	displayName: string,
	photoURL: string
): Promise<{ success: true } | { success: false; error: JoinError }> {
	const ref = doc(db, "sessions", code.toUpperCase());
	const snap = await getDoc(ref);

	if (!snap.exists()) return { success: false, error: "not_found" };

	const session = snap.data() as SessionDoc;

	if (session.status === "ended") return { success: false, error: "ended" };
	if (session.players.includes(userId)) return { success: true }; // already in session
	if (session.players.length >= 2) return { success: false, error: "full" };

	let answeredQuestionIds: string[] = [];
	if (session.settings.skipAnswered) {
		const creatorId = session.createdBy;
		const histSnap = await getDocs(
			query(collection(db, "sessions"), where("players", "array-contains", creatorId))
		);
		const prevIds = histSnap.docs
			.filter(
				(d) =>
					d.id !== code &&
					d.data().status === "ended" &&
					(d.data().players as string[]).includes(userId)
			)
			.flatMap((d) => (d.data().answeredQuestionIds ?? []) as string[]);
		answeredQuestionIds = [...new Set(prevIds)];
	}

	await updateDoc(ref, {
		players: arrayUnion(userId),
		[`playerNames.${userId}`]: displayName,
		[`playerAvatars.${userId}`]: photoURL,
		status: "active",
		excludedQuestionIds: answeredQuestionIds,
	});

	return { success: true };
}

export async function getSession(code: string): Promise<SessionDoc | null> {
	const snap = await getDoc(doc(db, "sessions", code.toUpperCase()));
	if (!snap.exists()) return null;
	return snap.data() as SessionDoc;
}
