import { DataTableDemo } from "./components/DataTable";

export default function SuggestedEvents() {
	return (
		<div className="flex min-h-screen flex-col">
			<main className="flex-1">
				<section className="w-full py-6 sm:py-12 md:py-24">
					<div className="container px-4 md:px-6">
						<h1 className="mb-6 font-bold text-3xl tracking-tighter sm:text-4xl">
							Suggested Events
						</h1>
						<DataTableDemo />
					</div>
				</section>
			</main>
			<footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
				<p>© 2024 YEEMail. All rights reserved.</p>
			</footer>
		</div>
	);
}
