"use client";

import { deleteUser, GoogleAuthProvider, reauthenticateWithPopup, signOut } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { auth, db } from "@/lib/firebase";

export default function ProfilePage() {
	const { user } = useAuth();
	const router = useRouter();
	const [logoutState, setLogoutState] = useState<"idle" | "confirm" | "signingOut">("idle");
	const [deleteState, setDeleteState] = useState<"idle" | "confirm" | "deleting">("idle");
	const [error, setError] = useState<string | null>(null);

	if (!user) return null;

	const currentUser = user;

	async function handleConfirmSignOut() {
		setLogoutState("signingOut");
		setError(null);
		try {
			await signOut(auth);
			router.replace("/login");
		} catch {
			setError("Failed to sign out. Please try again.");
			setLogoutState("idle");
		}
	}

	async function handleConfirmDelete() {
		setDeleteState("deleting");
		setError(null);
		try {
			const provider = new GoogleAuthProvider();
			await reauthenticateWithPopup(currentUser, provider);
			await deleteDoc(doc(db, "users", currentUser.uid));
			await deleteUser(currentUser);
			router.replace("/login");
		} catch (err: unknown) {
			const code = (err as { code?: string }).code;
			if (code === "auth/popup-closed-by-user") {
				setDeleteState("confirm");
			} else {
				setError("Could not delete account. Please try again.");
				setDeleteState("idle");
			}
		}
	}

	return (
		<div className="flex flex-col px-4 pt-8 pb-24">
			<h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>

			{/* Avatar + info */}
			<div className="mb-8 flex flex-col items-center gap-4">
				<PlayerAvatar
					src={currentUser.photoURL ?? ""}
					name={currentUser.displayName ?? currentUser.email ?? "?"}
					size={88}
					className="ring-4 ring-brand-light"
				/>
				<div className="text-center">
					<p className="text-xl font-bold text-gray-900 dark:text-white">
						{currentUser.displayName ?? "—"}
					</p>
					<p className="text-sm text-gray-500 dark:text-lavender">{currentUser.email}</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex flex-col gap-3">
				{/* Sign Out */}
				{logoutState === "idle" && (
					<button
						type="button"
						onClick={() => setLogoutState("confirm")}
						className="min-h-12 rounded-full border border-brand-primary font-semibold text-brand-primary transition-all active:scale-95 dark:border-lavender dark:text-lavender"
					>
						Sign Out
					</button>
				)}

				{(logoutState === "confirm" || logoutState === "signingOut") && (
					<div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-violet-900/40">
						<p className="mb-3 text-sm text-gray-700 dark:text-lavender">
							Are you sure you want to sign out?
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setLogoutState("idle")}
								disabled={logoutState === "signingOut"}
								className="min-h-10 flex-1 rounded-full border border-gray-300 text-sm font-semibold text-gray-600 transition-all active:scale-95 disabled:opacity-40 dark:border-white/20 dark:text-gray-300"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirmSignOut}
								disabled={logoutState === "signingOut"}
								className="min-h-10 flex-1 rounded-full border border-brand-primary text-sm font-semibold text-brand-primary transition-all active:scale-95 disabled:opacity-50 dark:border-lavender dark:text-lavender"
							>
								{logoutState === "signingOut" ? "Signing out…" : "Yes, sign out"}
							</button>
						</div>
					</div>
				)}

				{/* Delete Account */}
				{deleteState === "idle" && logoutState === "idle" && (
					<button
						type="button"
						onClick={() => setDeleteState("confirm")}
						className="min-h-12 rounded-full text-sm font-semibold text-danger transition-all active:scale-95"
					>
						Delete Account
					</button>
				)}

				{(deleteState === "confirm" || deleteState === "deleting") && (
					<div className="rounded-2xl border border-danger/30 bg-danger/5 p-4">
						<p className="mb-3 text-sm text-danger">
							This permanently deletes your account. Your session history stays in your partner's
							records. You'll re-authenticate with Google to confirm.
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setDeleteState("idle")}
								disabled={deleteState === "deleting"}
								className="min-h-10 flex-1 rounded-full border border-gray-300 text-sm font-semibold text-gray-600 transition-all active:scale-95 disabled:opacity-40 dark:border-white/20 dark:text-gray-300"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirmDelete}
								disabled={deleteState === "deleting"}
								className="min-h-10 flex-1 rounded-full bg-danger text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
							>
								{deleteState === "deleting" ? "Deleting…" : "Yes, delete"}
							</button>
						</div>
					</div>
				)}
			</div>

			{error && <p className="mt-4 text-center text-sm text-danger">{error}</p>}
		</div>
	);
}
