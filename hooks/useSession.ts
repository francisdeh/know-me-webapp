"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import type { SessionDoc } from "@/lib/types";

export function useSession(code: string | null) {
	const [session, setSession] = useState<SessionDoc | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!code) {
			setLoading(false);
			return;
		}

		const ref = doc(db, "sessions", code.toUpperCase());
		const unsubscribe = onSnapshot(ref, (snap) => {
			setSession(snap.exists() ? (snap.data() as SessionDoc) : null);
			setLoading(false);
		});

		return unsubscribe;
	}, [code]);

	return { session, loading };
}
