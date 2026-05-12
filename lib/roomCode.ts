import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const WORD_POOL = [
	"GRACE",
	"HOPE",
	"FAITH",
	"JOY",
	"PEACE",
	"LOVE",
	"TRUTH",
	"LIGHT",
	"FIRE",
	"ROCK",
	"RAIN",
	"BLOOM",
	"RISE",
	"REST",
	"SOUL",
	"BRIGHT",
	"STILL",
	"DEEP",
	"REAL",
	"TRUE",
];

function generate(): string {
	const word = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
	const num = String(Math.floor(Math.random() * 99) + 1).padStart(2, "0");
	return `${word}-${num}`;
}

export async function generateRoomCode(): Promise<string> {
	for (let attempts = 0; attempts < 10; attempts++) {
		const code = generate();
		const snap = await getDoc(doc(db, "sessions", code));
		if (!snap.exists()) return code;
	}
	// Fallback: append timestamp suffix to guarantee uniqueness
	return `${generate()}-${Date.now().toString(36).toUpperCase()}`;
}
