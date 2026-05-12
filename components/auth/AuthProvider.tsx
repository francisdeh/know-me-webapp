"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import type { UserDoc } from "@/lib/types";

type AuthContextValue = {
	user: User | null;
	loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function useAuth() {
	return useContext(AuthContext);
}

async function syncUserDoc(user: User) {
	const ref = doc(db, "users", user.uid);
	const snap = await getDoc(ref);

	if (!snap.exists()) {
		const newUser: UserDoc = {
			uid: user.uid,
			displayName: user.displayName ?? "",
			email: user.email ?? "",
			photoURL: user.photoURL ?? "",
			createdAt: serverTimestamp() as UserDoc["createdAt"],
		};
		await setDoc(ref, newUser);
	} else {
		await updateDoc(ref, {
			displayName: user.displayName ?? "",
			photoURL: user.photoURL ?? "",
		});
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (firebaseUser) {
				await syncUserDoc(firebaseUser);
				setUser(firebaseUser);
			} else {
				setUser(null);
			}
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
