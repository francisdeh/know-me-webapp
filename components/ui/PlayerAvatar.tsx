"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
	src: string;
	name: string;
	size: number;
	className?: string;
};

export function PlayerAvatar({ src, name, size, className = "" }: Props) {
	const [error, setError] = useState(false);

	const initials = name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	if (!src || error) {
		return (
			<div
				className={`flex shrink-0 items-center justify-center rounded-full bg-brand-primary font-semibold text-white ${className}`}
				style={{ width: size, height: size, fontSize: Math.round(size * 0.35) }}
			>
				{initials}
			</div>
		);
	}

	return (
		<Image
			src={src}
			alt={name}
			width={size}
			height={size}
			className={`rounded-full ${className}`}
			onError={() => setError(true)}
		/>
	);
}
