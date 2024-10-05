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
};

export default nextConfig;
