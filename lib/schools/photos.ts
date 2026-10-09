// Descriptions for the photos in public/images/. Every photo on the site has
// one. Photos used as darkened backgrounds say so (Kris Hagel, 2026-10-09;
// DECISIONS 64). Wording follows design/assets/photos/CREDITS.md.

export const photoDescriptions: Record<string, string> = {
  "/images/ghhs-friday-night.jpg": "a cheer led from the track at a Gig Harbor home football game",
  "/images/ghhs-fishbowl-crowd.jpg": "the Gig Harbor student section at the Fish Bowl",
  "/images/ghhs-runners.jpg": "the Gig Harbor girls cross country team at a track meet",
  "/images/phs-osprey.jpg": "an osprey in flight over the Peninsula ballfield light tower",
  "/images/phs-team.jpg": "a group of Peninsula football players at Roy Anderson Field",
};

/** Alt text for a photo shown as a darkened background behind text. */
export function backgroundAlt(src: string): string {
  const description = photoDescriptions[src];
  if (!description) throw new Error(`No description for ${src}; add one to lib/schools/photos.ts`);
  return `Darkened background photo: ${description}`;
}
