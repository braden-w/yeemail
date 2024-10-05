"use client";
import type { CompleteEmail } from "@/lib/db/schema/emails";
import { trpc } from "@/lib/trpc/client";
import EmailModal from "./EmailModal";

export default function EmailList({ emails }: { emails: CompleteEmail[] }) {
	const { data: e } = trpc.emails.getEmails.useQuery(undefined, {
		initialData: { emails },
		refetchOnMount: false,
	});

	if (e.emails.length === 0) {
		return <EmptyState />;
	}

	return (
		<ul>
			{e.emails.map((email) => (
				<Email email={email} key={email.id} />
			))}
		</ul>
	);
}

const Email = ({ email }: { email: CompleteEmail }) => {
	return (
		<li className="my-2 flex justify-between">
			<div className="w-full">
				<div>{email.subject}</div>
			</div>
			<EmailModal email={email} />
		</li>
	);
};

const EmptyState = () => {
	return (
		<div className="text-center">
			<h3 className="mt-2 font-semibold text-secondary-foreground text-sm">
				No emails
			</h3>
			<p className="mt-1 text-muted-foreground text-sm">
				Get started by creating a new email.
			</p>
			<div className="mt-6">
				<EmailModal emptyState={true} />
			</div>
		</div>
	);
};
