export const COOKIE_NAME = "metadex_session";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

export const FORMATS = ["Standard", "Expanded"] as const;

export const EVENT_TYPES = [
  "Regional Championships",
  "International Championships",
  "Special Event",
  "League Cup",
  "League Challenge",
  "Local Tournament",
  "Other",
] as const;

export const COUNTRIES = [
  "United States",
  "Canada",
  "Brazil",
  "United Kingdom",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Japan",
  "Australia",
  "Other",
] as const;
