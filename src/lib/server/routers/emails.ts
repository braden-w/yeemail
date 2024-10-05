import { getEmailById, getEmails } from "@/lib/api/emails/queries";
import { publicProcedure, router } from "@/lib/server/trpc";
import {
  emailIdSchema,
  insertEmailParams,
  updateEmailParams,
} from "@/lib/db/schema/emails";
import { createEmail, deleteEmail, updateEmail } from "@/lib/api/emails/mutations";

export const emailsRouter = router({
  getEmails: publicProcedure.query(async () => {
    return getEmails();
  }),
  getEmailById: publicProcedure.input(emailIdSchema).query(async ({ input }) => {
    return getEmailById(input.id);
  }),
  createEmail: publicProcedure
    .input(insertEmailParams)
    .mutation(async ({ input }) => {
      return createEmail(input);
    }),
  updateEmail: publicProcedure
    .input(updateEmailParams)
    .mutation(async ({ input }) => {
      return updateEmail(input.id, input);
    }),
  deleteEmail: publicProcedure
    .input(emailIdSchema)
    .mutation(async ({ input }) => {
      return deleteEmail(input.id);
    }),
});
