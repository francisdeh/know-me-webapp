"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CategoryBadge } from "@/components/session/CategoryBadge";
import { DepthBadge } from "@/components/session/DepthBadge";
import {
	advanceTurn,
	drawQuestion,
	endSession,
	revealAnswers,
	submitAnswer,
} from "@/lib/gameFirestore";
import type { SessionDoc } from "@/lib/types";

type Props = {
	session: SessionDoc;
	code: string;
};

export function ActiveGame({ session, code }: Props) {
	const { user } = useAuth();
	const [drawing, setDrawing] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [advancing, setAdvancing] = useState(false);
	const [ending, setEnding] = useState(false);
	const [answerText, setAnswerText] = useState("");

	if (!user) return null;

	const uid = user.uid;
	const currentQ = session.currentQuestion;
	const isMyTurn = session.currentTurn === uid;
	const partnerId = session.players.find((p) => p !== uid) ?? "";
	const partnerName = session.playerNames[session.currentTurn]?.split(" ")[0] ?? "Your partner";
	const myAnswer = currentQ?.answers?.[uid];
	const partnerAnswer = currentQ?.answers?.[partnerId];

	async function handleDraw() {
		if (drawing) return;
		setDrawing(true);
		const limit = session.settings.questionLimit;
		if (limit !== null && session.answeredQuestionIds.length >= limit) {
			await endSession(code, null, uid);
			return;
		}
		const allExcluded = [...session.answeredQuestionIds, ...(session.excludedQuestionIds ?? [])];
		const result = await drawQuestion(code, session.settings, allExcluded);
		if (result === "no_questions") {
			await endSession(code, null, uid);
		}
		setDrawing(false);
	}

	async function handleSubmitAnswer() {
		if (!answerText.trim() || submitting) return;
		setSubmitting(true);
		await submitAnswer(code, uid, answerText.trim(), !!partnerAnswer);
		setAnswerText("");
		setSubmitting(false);
	}

	async function handleReveal() {
		await revealAnswers(code);
	}

	async function handleAdvance() {
		if (advancing || !currentQ) return;
		setAdvancing(true);
		await advanceTurn(code, session.currentTurn, partnerId, currentQ);
		setAdvancing(false);
	}

	async function handleEndSession() {
		if (ending) return;
		setEnding(true);
		await endSession(code, currentQ, session.currentTurn);
		setEnding(false);
	}

	const turnBadge = (
		<div className="flex items-center justify-between w-full mb-2">
			<span
				className={`rounded-full px-3 py-1 text-sm font-medium ${
					isMyTurn
						? "bg-brand-primary text-white"
						: "bg-gray-100 text-gray-500 dark:bg-violet-900 dark:text-lavender"
				}`}
			>
				{isMyTurn ? "Your turn" : `${partnerName}'s turn`}
			</span>
			<span className="text-xs text-gray-400">
				{session.answeredQuestionIds.length}
				{session.settings.questionLimit !== null ? `/${session.settings.questionLimit}` : ""}{" "}
				answered
			</span>
		</div>
	);

	const endButton = (
		<button
			type="button"
			onClick={handleEndSession}
			disabled={ending}
			className="text-sm text-center text-gray-400 underline dark:text-gray-500"
		>
			{ending ? "Ending…" : "End Session"}
		</button>
	);

	// — No active question —
	if (!currentQ) {
		if (isMyTurn) {
			return (
				<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
					{turnBadge}
					<div>
						<p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
							It's your turn!
						</p>
						<p className="text-sm text-gray-500 dark:text-lavender">
							Draw a question to start this round.
						</p>
					</div>
					<button
						type="button"
						onClick={handleDraw}
						disabled={drawing}
						className="min-h-16 w-full max-w-xs rounded-3xl text-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50"
						style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)" }}
					>
						{drawing ? "Drawing…" : "Draw a Question"}
					</button>
					{endButton}
				</div>
			);
		}

		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
				{turnBadge}
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
					<p className="text-sm text-gray-500 dark:text-lavender">
						Waiting for {partnerName} to draw a question…
					</p>
				</div>
				{endButton}
			</div>
		);
	}

	// — Active question —
	const questionCard = (
		<div className="animate-fade-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-violet-900">
			<div className="mb-3 flex items-center justify-between">
				<CategoryBadge category={currentQ.category} />
				<DepthBadge depth={currentQ.depth} />
			</div>
			<p className="text-lg font-semibold leading-snug text-gray-900 dark:text-white">
				{currentQ.text}
			</p>
		</div>
	);

	// Revealed — show both answers
	if (currentQ.revealed) {
		return (
			<div className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-4">
				{turnBadge}
				{questionCard}
				<div className="flex flex-col gap-3">
					{session.players.map((uid, i) => {
						const answer = currentQ.answers[uid];
						const name = session.playerNames[uid]?.split(" ")[0] ?? "Player";
						const isMe = uid === user.uid;
						return (
							<div
								key={uid}
								className="animate-fade-up rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-violet-900"
								style={{ animationDelay: `${i * 80}ms` }}
							>
								<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
									{isMe ? "You" : name}
								</p>
								<p className="text-sm text-gray-900 dark:text-white">
									{answer?.text ?? (
										<span className="italic text-gray-400">No answer submitted</span>
									)}
								</p>
							</div>
						);
					})}
				</div>
				<button
					type="button"
					onClick={handleAdvance}
					disabled={advancing}
					className="min-h-12 rounded-full font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
					style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #8B5CF6 100%)" }}
				>
					{advancing ? "Saving…" : "Next Question →"}
				</button>
				{endButton}
			</div>
		);
	}

	// Not revealed — answer input or waiting state
	return (
		<div className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-4">
			{turnBadge}
			{questionCard}

			{!myAnswer ? (
				// Answer input
				<div className="flex flex-col gap-3">
					<textarea
						value={answerText}
						onChange={(e) => setAnswerText(e.target.value)}
						placeholder="Type your answer…"
						rows={4}
						className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-sm outline-none focus:border-brand-primary dark:border-white/10 dark:bg-violet-900 dark:text-white dark:placeholder-gray-500"
					/>
					<button
						type="button"
						onClick={handleSubmitAnswer}
						disabled={submitting || !answerText.trim()}
						className="min-h-12 rounded-full font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
						style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #8B5CF6 100%)" }}
					>
						{submitting ? "Submitting…" : "Submit Answer"}
					</button>
				</div>
			) : (
				// Answered — waiting for reveal
				<div className="flex flex-col gap-3">
					<div className="rounded-2xl bg-brand-light p-4 dark:bg-violet-900/50">
						<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
							Your answer
						</p>
						<p className="text-sm text-gray-900 dark:text-white">{myAnswer.text}</p>
					</div>

					{!partnerAnswer ? (
						<div className="flex items-center justify-center gap-2 py-2">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
							<p className="text-sm text-gray-500 dark:text-lavender">
								Waiting for {session.playerNames[partnerId]?.split(" ")[0] ?? "partner"} to answer…
							</p>
						</div>
					) : null}

					{/* Manual reveal for the turn player after both have answered */}
					{isMyTurn && (
						<button
							type="button"
							onClick={handleReveal}
							className="min-h-12 rounded-full font-semibold text-white transition-all active:scale-95"
							style={{ background: "linear-gradient(135deg, #6C3FE8 0%, #F472B6 100%)" }}
						>
							Reveal Answers
						</button>
					)}
				</div>
			)}
		</div>
	);
}
