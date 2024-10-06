"use client";
import type { CompleteSuggestedEvent } from "@/lib/db/schema/suggestedEvents";
import { trpc } from "@/lib/trpc/client";
import SuggestedEventModal from "./SuggestedEventModal";

export default function SuggestedEventList({
	suggestedEvents,
}: { suggestedEvents: CompleteSuggestedEvent[] }) {
	const { data: s } = trpc.suggestedEvents.getSuggestedEvents.useQuery(
		undefined,
		{
			initialData: { suggestedEvents },
			refetchOnMount: false,
		},
	);

	if (s.suggestedEvents.length === 0) {
		return <EmptyState />;
	}

	return (
		<ul>
			{s.suggestedEvents.map((suggestedEvent) => (
				<SuggestedEvent
					suggestedEvent={suggestedEvent}
					key={suggestedEvent.id}
				/>
			))}
		</ul>
	);
}

const SuggestedEvent = ({
	suggestedEvent,
}: { suggestedEvent: CompleteSuggestedEvent }) => {
	return (
		<li className="my-2 flex justify-between">
			<div className="w-full">
				<div>{suggestedEvent.title}</div>
			</div>
			<SuggestedEventModal suggestedEvent={suggestedEvent} />
		</li>
	);
};

const EmptyState = () => {
	return (
		<div className="text-center">
			<h3 className="mt-2 font-semibold text-secondary-foreground text-sm">
				No suggested events
			</h3>
			<p className="mt-1 text-muted-foreground text-sm">
				Get started by creating a new suggested event.
			</p>
			<div className="mt-6">
				<SuggestedEventModal emptyState={true} />
			</div>
		</div>
	);
};
