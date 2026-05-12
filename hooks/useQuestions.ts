"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import type { Category, DepthLevel, QuestionDoc } from "@/lib/types";

type Filters = {
	categories?: Category[];
	depths?: DepthLevel[];
	search?: string;
};

export function useQuestions(filters: Filters = {}) {
	const [questions, setQuestions] = useState<QuestionDoc[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const q = query(collection(db, "questions"), orderBy("createdAt", "asc"));
		const unsubscribe = onSnapshot(q, (snap) => {
			const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QuestionDoc);
			setQuestions(docs);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	const filtered = useMemo(() => {
		let result = questions;

		if (filters.categories && filters.categories.length > 0) {
			result = result.filter((q) => filters.categories?.includes(q.category));
		}

		if (filters.depths && filters.depths.length > 0) {
			result = result.filter((q) => filters.depths?.includes(q.depth));
		}

		if (filters.search?.trim()) {
			const term = filters.search.toLowerCase();
			result = result.filter((q) => q.text.toLowerCase().includes(term));
		}

		return result;
	}, [questions, filters.categories, filters.depths, filters.search]);

	return { questions: filtered, loading };
}
