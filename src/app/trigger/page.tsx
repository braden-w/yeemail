"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export default function LandingPage() {
	const [date, setDate] = useState<Date>();

	return (
		<div className="flex min-h-screen flex-col">
			<header className="flex h-14 items-center px-4 lg:px-6">
				<Link className="flex items-center justify-center" href="#">
					<MountainIcon className="h-6 w-6" />
					<span className="sr-only">Acme Inc</span>
				</Link>
				<nav className="ml-auto flex gap-4 sm:gap-6">
					<Link
						className="font-medium text-sm underline-offset-4 hover:underline"
						href="#features"
					>
						Features
					</Link>
					<Link
						className="font-medium text-sm underline-offset-4 hover:underline"
						href="/sign-in"
					>
						Sign In
					</Link>
				</nav>
			</header>
			<main className="flex-1">
				<section className="w-full py-6 sm:py-12 md:py-24 lg:py-32 xl:py-48">
					<div className="container px-4 md:px-6">
						<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
							<div className="mx-auto aspect-video overflow-hidden rounded-xl bg-neutral-100 object-cover sm:w-full lg:order-last lg:aspect-square dark:bg-neutral-800" />
							<div className="flex flex-col justify-center space-y-4">
								<div className="space-y-2">
									<h1 className="font-bold text-3xl tracking-tighter sm:text-5xl xl:text-6xl/none">
										The complete platform <br />
										for building the Web
									</h1>
									<p className="max-w-[600px] text-neutral-500 md:text-xl dark:text-neutral-400">
										Give your team the toolkit to stop configuring and start
										innovating. Securely build, deploy, and scale the best web
										experiences.
									</p>
								</div>
								<div className="flex flex-col gap-2 min-[400px]:flex-row">
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant={"outline"}
												className={cn(
													"w-[280px] justify-start text-left font-normal",
													!date && "text-muted-foreground",
												)}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{date ? format(date, "PPP") : <span>Pick a date</span>}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={date}
												onSelect={setDate}
												initialFocus
											/>
										</PopoverContent>
									</Popover>

									<Link
										className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-900 px-8 font-medium text-neutral-50 text-sm shadow transition-colors hover:bg-neutral-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:focus-visible:ring-neutral-300 dark:hover:bg-neutral-50/90"
										href="#"
									>
										Get Started
									</Link>
									<Link
										className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-200 bg-white px-8 font-medium text-sm shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:focus-visible:ring-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
										href="#"
									>
										Contact Sales
									</Link>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
				<p className="text-neutral-500 text-xs dark:text-neutral-400">
					© 2024 Acme Inc. All rights reserved.
				</p>
				<nav className="flex gap-4 sm:ml-auto sm:gap-6">
					<Link className="text-xs underline-offset-4 hover:underline" href="#">
						Terms of Service
					</Link>
					<Link className="text-xs underline-offset-4 hover:underline" href="#">
						Privacy
					</Link>
				</nav>
			</footer>
		</div>
	);
}

function MountainIcon(props: any) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m8 3 4 8 5-5 5 15H2L8 3z" />
		</svg>
	);
}
