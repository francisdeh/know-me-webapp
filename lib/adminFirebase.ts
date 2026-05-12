import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function createAdminApp() {
	if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
		// Emulator ignores credentials — project ID is enough.
		return initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
	}

	const sa = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
	if (!sa) throw new Error("FIREBASE_ADMIN_SERVICE_ACCOUNT env var is required in production");
	return initializeApp({ credential: cert(JSON.parse(sa)) });
}

function getAdminApp() {
	return getApps().length > 0 ? getApps()[0] : createAdminApp();
}

export const adminDb = getFirestore(getAdminApp());
export const adminAuth = getAuth(getAdminApp());
