"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import type { HistoryEntry } from "@/lib/types";

export function useSessionHistory(code: string | null) {
	const [entries, setEntries] = useState<HistoryEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!code) {
			setLoading(false);
			return;
		}

		const q = query(
			collection(db, "sessions", code.toUpperCase(), "history"),
			orderBy("drawnAt", "asc")
		);

		const unsubscribe = onSnapshot(q, (snap) => {
			setEntries(snap.docs.map((d) => d.data() as HistoryEntry));
			setLoading(false);
		});

		return unsubscribe;
	}, [code]);

	return { entries, loading };
}
