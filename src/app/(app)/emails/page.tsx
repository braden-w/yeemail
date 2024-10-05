import EmailList from "@/components/emails/EmailList";
import NewEmailModal from "@/components/emails/EmailModal";
import { checkAuth } from "@/lib/auth/utils";
import { api } from "@/lib/trpc/api";

export default async function Emails() {
	await checkAuth();
	const { emails } = await api.emails.getEmails.query();

	return (
		<main>
			<div className="flex justify-between">
				<h1 className="my-2 font-semibold text-2xl">Emails</h1>
				<NewEmailModal />
			</div>
			<EmailList emails={emails} />
		</main>
	);
}
