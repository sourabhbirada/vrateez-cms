import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "vrateez.s3.ap-south-1.amazonaws.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.s3.*.amazonaws.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "www.shutterstock.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
