export const DRAWER_LINK_PREFIX = "drawer://";

export function buildGroupLink(groupId: string): string {
  return `${DRAWER_LINK_PREFIX}group/${groupId}`;
}

export function buildSegmentLink(segmentId: string): string {
  return `${DRAWER_LINK_PREFIX}segment/${segmentId}`;
}

export function isDrawerLink(href: string): boolean {
  return href.startsWith(DRAWER_LINK_PREFIX);
}

export type DrawerLinkTarget =
  | { type: "group"; groupId: string }
  | { type: "segment"; segmentId: string };

export function parseDrawerLink(href: string): DrawerLinkTarget | null {
  if (!isDrawerLink(href)) return null;

  const path = href.slice(DRAWER_LINK_PREFIX.length);
  const groupMatch = /^group\/([^/]+)$/.exec(path);
  if (groupMatch) {
    return { type: "group", groupId: groupMatch[1] };
  }

  const segmentMatch = /^segment\/([^/]+)$/.exec(path);
  if (segmentMatch) {
    return { type: "segment", segmentId: segmentMatch[1] };
  }

  return null;
}
