import { cookies } from "next/headers";
import { cache } from "react";

import { type Session, type User, Lucia } from "lucia";
import { db } from "@/lib/db/index";

import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessions, users } from "../db/schema/auth";
import { Google } from "arctic";
import { env } from "../env.mjs";

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === "production",
		},
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			email: attributes.email,
			name: attributes.name,
			googleId: attributes.google_id,
		};
	},
	getSessionAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseSessionAttributes
			google_access_token: attributes.google_access_token,
			google_refresh_token: attributes.google_refresh_token,
			google_access_token_expires_at: attributes.google_access_token_expires_at,
			google_id_token: attributes.google_id_token,
		};
	},
});

export const google = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	"http://localhost:3000/api/auth/callback/google",
);

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
	name: string;
	google_id: string;
}

interface DatabaseSessionAttributes {
	google_access_token: string;
	google_refresh_token: string | null;
	google_access_token_expires_at: Date;
	google_id_token: string;
}

export const validateRequest = cache(
	async (): Promise<
		{ user: User; session: Session } | { user: null; session: null }
	> => {
		const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
		if (!sessionId) {
			return {
				user: null,
				session: null,
			};
		}

		const result = await lucia.validateSession(sessionId);
		// next.js throws when you attempt to set cookie when rendering page
		try {
			if (result.session?.fresh) {
				const sessionCookie = lucia.createSessionCookie(result.session.id);
				cookies().set(
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes,
				);
			}
			if (!result.session) {
				const sessionCookie = lucia.createBlankSessionCookie();
				cookies().set(
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes,
				);
			}
		} catch {}
		return result;
	},
);
