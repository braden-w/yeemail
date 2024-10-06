"use client";
import type { CompleteSavedEvent } from "@/lib/db/schema/savedEvents";
import { trpc } from "@/lib/trpc/client";
import SavedEventModal from "./SavedEventModal";

export default function SavedEventList({
	savedEvents,
}: { savedEvents: CompleteSavedEvent[] }) {
	const { data: s } = trpc.savedEvents.getSavedEvents.useQuery(undefined, {
		initialData: { savedEvents },
		refetchOnMount: false,
	});

	if (s.savedEvents.length === 0) {
		return <EmptyState />;
	}

	return (
		<ul>
			{s.savedEvents.map((savedEvent) => (
				<SavedEvent savedEvent={savedEvent} key={savedEvent.savedEvent.id} />
			))}
		</ul>
	);
}

const SavedEvent = ({ savedEvent }: { savedEvent: CompleteSavedEvent }) => {
	return (
		<li className="my-2 flex justify-between">
			<div className="w-full">
				<div>{savedEvent.savedEvent.title}</div>
			</div>
			<SavedEventModal savedEvent={savedEvent.savedEvent} />
		</li>
	);
};

const EmptyState = () => {
	return (
		<div className="text-center">
			<h3 className="mt-2 font-semibold text-secondary-foreground text-sm">
				No saved events
			</h3>
			<p className="mt-1 text-muted-foreground text-sm">
				Get started by creating a new saved event.
			</p>
			<div className="mt-6">
				<SavedEventModal emptyState={true} />
			</div>
		</div>
	);
};
