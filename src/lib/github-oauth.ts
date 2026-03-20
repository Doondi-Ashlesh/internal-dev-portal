/**
 * GitHub OAuth reuses the active github.com browser session. Clearing the NextAuth
 * session alone is not enough to offer another GitHub user on the next authorize
 * hop; redirecting via github.com/logout ends that session first.
 *
 * @param returnToAbsoluteUrl — Where GitHub should send the user after logout (typically `/login` on this app).
 */
export function getGithubWebLogoutUrl(returnToAbsoluteUrl: string): string {
  const url = new URL("https://github.com/logout");
  url.searchParams.set("return_to", returnToAbsoluteUrl);
  return url.toString();
}
