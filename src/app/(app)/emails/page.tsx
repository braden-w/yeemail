import EmailList from "@/components/emails/EmailList";
import NewEmailModal from "@/components/emails/EmailModal";
import { api } from "@/lib/trpc/api";
import { checkAuth } from "@/lib/auth/utils";

export default async function Emails() {
  await checkAuth();
  const { emails } = await api.emails.getEmails.query();  

  return (
    <main>
      <div className="flex justify-between">
        <h1 className="font-semibold text-2xl my-2">Emails</h1>
        <NewEmailModal />
      </div>
      <EmailList emails={emails} />
    </main>
  );
}
