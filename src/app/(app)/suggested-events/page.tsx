import SuggestedEventList from "@/components/suggestedEvents/SuggestedEventList";
import NewSuggestedEventModal from "@/components/suggestedEvents/SuggestedEventModal";
import { api } from "@/lib/trpc/api";

export default async function SuggestedEvents() {
	const { suggestedEvents } =
		await api.suggestedEvents.getSuggestedEvents.query();

	return (
		<main>
			<div className="flex justify-between">
				<h1 className="my-2 font-semibold text-2xl">Suggested Events</h1>
				<NewSuggestedEventModal />
			</div>
			<SuggestedEventList suggestedEvents={suggestedEvents} />
		</main>
	);
}
