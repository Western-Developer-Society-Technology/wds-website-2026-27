// Discover public events hosted or co-hosted by this account automatically.
export const LUMA_PROFILE_URL = "https://luma.com/user/wds";
export const EVENT_CACHE_TAG = "upcoming-events";
// Page regeneration reads the daily snapshot; it does not poll Luma.
export const EVENT_REFRESH_SECONDS = 6 * 60 * 60;
