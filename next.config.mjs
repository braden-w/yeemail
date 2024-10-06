import Icons from "unplugin-icons/webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	webpack: (config) => {
		config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
		config.plugins.push(
			Icons({
				compiler: "jsx",
				jsx: "react",
			}),
		);

		return config;
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
