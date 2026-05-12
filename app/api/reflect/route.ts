import Anthropic from "@anthropic-ai/sdk";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/adminFirebase";
import { CATEGORY_LABELS } from "@/lib/questions";
import type { Category, HistoryEntry, SessionDoc } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { code, idToken } = body as { code: string; idToken: string };

		if (!code || !idToken) {
			return NextResponse.json({ error: "Missing code or idToken" }, { status: 400 });
		}

		// Verify identity
		let uid: string;
		try {
			const decoded = await adminAuth.verifyIdToken(idToken);
			uid = decoded.uid;
		} catch {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const sessionRef = adminDb.collection("sessions").doc(code.toUpperCase());
		const sessionSnap = await sessionRef.get();

		if (!sessionSnap.exists) {
			return NextResponse.json({ error: "Session not found" }, { status: 404 });
		}

		const session = sessionSnap.data() as SessionDoc;

		if (!session.players.includes(uid)) {
			return NextResponse.json({ error: "Not a player in this session" }, { status: 403 });
		}

		// Return existing reflection if already generated
		if (session.aiReflection) {
			return NextResponse.json({ reflection: session.aiReflection.content });
		}

		// Read history
		const historySnap = await sessionRef.collection("history").orderBy("drawnAt", "asc").get();
		const history = historySnap.docs.map((d) => d.data() as HistoryEntry);

		if (history.length === 0) {
			return NextResponse.json({ error: "No questions answered yet" }, { status: 422 });
		}

		// Build prompt
		const playerNames = session.playerNames;
		const names = session.players.map((p) => playerNames[p]?.split(" ")[0] ?? "Player");
		const categoriesLabel = session.settings.categories
			.map((c: Category) => CATEGORY_LABELS[c])
			.join(", ");

		const qaLines = history
			.map((entry) => {
				const answers = session.players
					.map((p) => {
						const name = playerNames[p]?.split(" ")[0] ?? "Player";
						const text = entry.answers[p] ?? "(no answer)";
						return `${name}: ${text}`;
					})
					.join("\n");
				return `Q: ${entry.questionText}\n${answers}`;
			})
			.join("\n\n");

		const questionCount = history.length;
		const lengthGuide =
			questionCount <= 3
				? "Write 2–4 sentences total. Be direct and specific."
				: questionCount <= 6
					? "Write one short paragraph (4–6 sentences). Be specific and direct."
					: "Write two short paragraphs. Be specific and direct.";

		const prompt = `You are helping two people reflect on a short conversation from KnowMe, a turn-based question game. Categories explored: ${categoriesLabel}.

${names[0]} and ${names[1]} answered ${questionCount} question${questionCount === 1 ? "" : "s"}:

${qaLines}

${lengthGuide} Note 1–2 things that stand out — a contrast, a resonance, or something revealing. Speak directly to them as a pair. No generic advice, no padding.`;

		const maxTokens = questionCount <= 3 ? 150 : questionCount <= 6 ? 250 : 400;

		const message = await anthropic.messages.create({
			model: "claude-sonnet-4-6",
			max_tokens: maxTokens,
			messages: [{ role: "user", content: prompt }],
		});

		const content =
			message.content[0].type === "text" ? message.content[0].text : "Reflection unavailable.";

		await sessionRef.update({
			aiReflection: {
				content,
				generatedAt: FieldValue.serverTimestamp(),
				generatedBy: uid,
			},
		});

		return NextResponse.json({ reflection: content });
	} catch (err) {
		console.error("[/api/reflect]", err);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
