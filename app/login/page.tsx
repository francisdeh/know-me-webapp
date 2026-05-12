"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { auth, db } from "@/lib/firebase";

export default function LoginPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [signingIn, setSigningIn] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!loading && user) {
			router.replace("/home");
		}
	}, [user, loading, router]);

	async function handleGoogleSignIn() {
		setSigningIn(true);
		setError(null);
		try {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const firebaseUser = result.user;

			const ref = doc(db, "users", firebaseUser.uid);
			const snap = await getDoc(ref);

			if (!snap.exists()) {
				await setDoc(ref, {
					uid: firebaseUser.uid,
					displayName: firebaseUser.displayName ?? "",
					email: firebaseUser.email ?? "",
					photoURL: firebaseUser.photoURL ?? "",
					createdAt: serverTimestamp(),
				});
			} else {
				await updateDoc(ref, {
					displayName: firebaseUser.displayName ?? "",
					photoURL: firebaseUser.photoURL ?? "",
				});
			}

			router.replace("/home");
		} catch (err) {
			console.error(err);
			setError("Sign in failed. Please try again.");
		} finally {
			setSigningIn(false);
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
			</div>
		);
	}

	return (
		<div
			className="flex min-h-screen flex-col items-center justify-center gap-6 px-6"
			style={{
				background: "linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)",
			}}
		>
			<Image
				src="/knowme_logo.png"
				alt="KnowMe"
				width={280}
				height={132}
				priority
				className="drop-shadow-lg"
			/>
			<div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl dark:bg-violet-900">
				<div className="mb-8 text-center">
					<p className="text-sm text-gray-500 dark:text-lavender">
						A space to genuinely know each other.
					</p>
				</div>

				<button
					type="button"
					onClick={handleGoogleSignIn}
					disabled={signingIn}
					className="flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-brand-primary px-6 font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
				>
					{signingIn ? (
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
					) : (
						<GoogleIcon />
					)}
					{signingIn ? "Signing in…" : "Continue with Google"}
				</button>

				{error && <p className="mt-4 text-center text-sm text-danger">{error}</p>}

				<p className="mt-6 text-center text-xs text-gray-400 dark:text-lavender">
					By continuing, you agree to explore values and build connection.
				</p>
			</div>
		</div>
	);
}

function GoogleIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
			<path
				fill="#fff"
				d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
			/>
			<path
				fill="#fff"
				d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
			/>
			<path
				fill="#fff"
				d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
			/>
			<path
				fill="#fff"
				d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
			/>
		</svg>
	);
}
