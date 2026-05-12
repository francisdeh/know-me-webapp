import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				// Google profile photos from OAuth sign-in
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
		],
	},
};

export default nextConfig;
