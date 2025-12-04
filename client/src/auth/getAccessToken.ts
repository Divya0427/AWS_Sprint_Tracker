import { fetchAuthSession } from "aws-amplify/auth";

export async function getAccessToken(): Promise<string> {
  const session = await fetchAuthSession();
  const tokens = session.tokens;

  if (!tokens || !tokens.idToken) {
    throw new Error("No id token available in session");
  }

  // TEMP: log what we're sending
  console.log("SESSION TOKENS:", session.tokens);
  console.log("USING ID TOKEN STRING:", tokens.idToken.toString());

  // ⚠️ IMPORTANT: return ID token, not access token
  return tokens.idToken.toString();
}
