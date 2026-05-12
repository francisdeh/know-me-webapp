"use client";

import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import type { SessionDoc } from "@/lib/types";

export function useUserSessions(userId: string | null) {
	const [sessions, setSessions] = useState<SessionDoc[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) {
			setLoading(false);
			return;
		}

		const q = query(collection(db, "sessions"), where("players", "array-contains", userId));

		getDocs(q)
			.then((snap) => {
				const all = snap.docs.map((d) => d.data() as SessionDoc);
				const ended = all
					.filter((s) => s.status === "ended")
					.sort((a, b) => {
						const at = a.endedAt?.toMillis() ?? a.createdAt?.toMillis() ?? 0;
						const bt = b.endedAt?.toMillis() ?? b.createdAt?.toMillis() ?? 0;
						return bt - at;
					});
				setSessions(ended);
			})
			.finally(() => setLoading(false));
	}, [userId]);

	return { sessions, loading };
}
