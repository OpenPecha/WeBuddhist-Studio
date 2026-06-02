import type { GroupSocialLinkDTO } from "../api/groupsApi";

export function sameSortedIds(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((id, i) => id === sortedB[i]);
}

export function normalizeSocialLinksForCompare(
  links: GroupSocialLinkDTO[],
): GroupSocialLinkDTO[] {
  return [...links]
    .map((l) => ({ platform: l.platform, url: l.url.trim() }))
    .sort(
      (x, y) =>
        x.platform.localeCompare(y.platform) || x.url.localeCompare(y.url),
    );
}

export function sameSocialLinks(
  a: GroupSocialLinkDTO[],
  b: GroupSocialLinkDTO[],
): boolean {
  const na = normalizeSocialLinksForCompare(a);
  const nb = normalizeSocialLinksForCompare(b);
  if (na.length !== nb.length) return false;
  return na.every(
    (link, i) => link.platform === nb[i].platform && link.url === nb[i].url,
  );
}
