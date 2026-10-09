// Subscribe links for an .ics feed (SPEC §4: Google, Apple, Outlook, ICS link).

export interface SubscribeLinks {
  https: string;
  webcal: string;
  google: string;
  outlook: string;
}

export function subscribeLinks(feedUrl: string, name: string): SubscribeLinks {
  const webcal = feedUrl.replace(/^https?:\/\//, "webcal://");
  return {
    https: feedUrl,
    webcal,
    // Google Calendar's "add by URL" takes the webcal address as cid.
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.office.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrl)}&name=${encodeURIComponent(name)}`,
  };
}
