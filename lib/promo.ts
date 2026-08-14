import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

const DEADLINE_KEY = "oddlytics_offer_deadline_v1";
const OFFER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** A real countdown to a real, persisted deadline — doesn't silently reset to fake urgency on refresh. */
export function getOfferDeadline(): number {
  const existing = readLocalStorage<number | null>(DEADLINE_KEY, null);
  if (existing && existing > Date.now()) return existing;
  const deadline = Date.now() + OFFER_WINDOW_MS;
  writeLocalStorage(DEADLINE_KEY, deadline);
  return deadline;
}
