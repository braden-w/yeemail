import { Logo } from "@/components/Logo";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { checkAuth } from "@/lib/auth/utils";
import TrpcProvider from "@/lib/trpc/Provider";
import { cookies } from "next/headers";
import Link from "next/link";
export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	await checkAuth();
	return (
		<main>
			<TrpcProvider cookies={cookies().toString()}>
				<div className="flex h-screen flex-col">
					<header className="sticky top-0 z-50 flex min-h-14 w-full items-center border-border/40 bg-background/95 px-4 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
						<Logo />
						<nav className="ml-auto flex gap-4 sm:gap-6">
							<Link
								className="font-medium text-sm underline-offset-4 hover:underline"
								href="/sign-in"
							>
								Sign In
							</Link>
						</nav>
					</header>
					<div className="flex flex-1">
						<Sidebar />
						<main className="flex-1 overflow-y-auto p-8 pt-2 md:p-8">
							<Navbar />
							{children}
						</main>
					</div>
				</div>
			</TrpcProvider>

			<Toaster richColors />
		</main>
	);
}
