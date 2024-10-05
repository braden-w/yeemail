import { google, lucia } from "@/lib/auth/lucia";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/auth";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { cookies } from "next/headers";
import { z } from "zod";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier = cookies().get("google_code_verifier")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
    return new Response(null, {
      status: 400
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    const googleUserUnparsed = await googleUserResponse.json();
    const googleUser = z.object({
      sub: z.string(),
      name: z.string(),
      given_name: z.string(),
      family_name: z.string(),
      picture: z.string(),
      email: z.string(),
    }).transform((data) => ({
      id: data.sub,
      email: data.email,
      name: data.name,
    })).parse(googleUserUnparsed);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.google_id, googleUser.id)
    })

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/"
        }
      });
    }

    const userId = generateId(15);
    await db.insert(users).values({
      id: userId,
      email: googleUser.email,
      name: googleUser.name,
      google_id: googleUser.id,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/"
      }
    });
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return new Response(null, {
        status: 400
      });
    }
    return new Response(null, {
      status: 500
    });
  }
}