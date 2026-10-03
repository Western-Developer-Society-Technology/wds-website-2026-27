// Discover public events hosted or co-hosted by this account automatically.
export const LUMA_PROFILE_URL = "https://luma.com/user/wds";
export const EVENT_CACHE_TAG = "upcoming-events";
export const EVENT_IMAGE_PLACEHOLDER = "/images/events/placeholders/photo-placeholder.svg";
// Version 2 stores upcoming and archived events in the existing JSON row.
export const EVENT_SNAPSHOT_VERSION = 2;
// Page regeneration reads the daily snapshot; it does not poll Luma.
export const EVENT_REFRESH_SECONDS = 6 * 60 * 60;
