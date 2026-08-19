import { canWriteEvents } from "./eventPermissions";

/** Same write roles as events: OWNER / ADMIN / AUTHOR (or SUPER_ADMIN). */
export const canWritePosts = canWriteEvents;
export const canCreatePost = canWriteEvents;
export const canEditPost = canWriteEvents;
export const canDeletePost = canWriteEvents;
