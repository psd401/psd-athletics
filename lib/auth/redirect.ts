/** Where to send someone after sign-in. Only Studio paths, so the sign-in
 *  page can't be used as an open redirect. */
export function safeNext(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || !/^\/studio(\/[\w\-/]*)?$/.test(value)) return "/studio";
  return value;
}
