// src/screens/Swipe/streamingProviderUtils.ts

import { STREAMING_NAME_TO_ID } from "./Components/FilterButton";
import type { StreamingServiceKey } from "../../types";

/**
 * Maps our Firestore keys → the EXACT UI label from FilterButton.
 * This is used ONLY for converting user subscriptions → TMDB provider IDs.
 */
export const USER_STREAMING_KEY_TO_LABEL: Record<
  StreamingServiceKey,
  keyof typeof STREAMING_NAME_TO_ID
> = {
  netflix: "Netflix",
  hulu: "Hulu",
  prime: "Prime Video",
  disney: "Disney+",
  max: "Max",
  apple_tv: "Apple TV+",
  peacock: "Peacock",

  // 🔹 FilterButton uses "Paramount Plus"
  // TMDB search uses numeric ID — that's what we care about here.
  paramount: "Paramount Plus",
};

/**
 * Pattern-based mapping for PROVIDER NAME MATCHING in details API.
 * TMDB returns variant names like:
 *  - "Paramount+ Amazon Channel"
 *  - "Paramount Plus Essential"
 *  - "Paramount Plus Premium"
 *  - "Peacock Premium"
 *
 * We want to match them using substring + lowercase.
 */
export const SERVICE_KEY_TO_NAME_PATTERNS: Record<StreamingServiceKey, string[]> = {
  netflix: ["netflix"],
  hulu: ["hulu"],
  prime: ["amazon prime", "prime video"],
  disney: ["disney+"],
  max: ["max", "hbo max"],
  apple_tv: ["apple tv"],
  peacock: ["peacock"],

  // 🔥 All Paramount+ variants observed on TMDB
  paramount: [
    "paramount+",
    "paramount plus",
    "paramount+ amazon channel",
    "paramount plus essential",
    "paramount plus premium",
  ],
};

/**
 * Convert user.streaming_services (Firestore array of StreamingServiceKey)
 * → TMDB watch provider numeric IDs used in discover queries.
 */
export function userServicesToProviderIds(
  userServices?: StreamingServiceKey[] | null
): number[] {
  if (!userServices || userServices.length === 0) return [];

  const ids = new Set<number>();

  for (const key of userServices) {
    const label = USER_STREAMING_KEY_TO_LABEL[key]; // e.g., "Paramount Plus"
    const providerId = STREAMING_NAME_TO_ID[label]; // e.g., 531

    if (providerId) ids.add(providerId);
  }

  return [...ids];
}
