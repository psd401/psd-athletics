/** The public site's origin, for links that leave the page (calendar feeds, .ics files). */
export const SITE_URL = (process.env.SITE_URL ?? "https://athletics.psd401.net").replace(/\/$/, "");
