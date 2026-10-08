// Global site data. Import it anywhere with `import { ... } from '../consts'`.

export const SITE_TITLE = "Josh Robinson";
export const SITE_DESCRIPTION =
  "Everyone says use AI. I'll show you how. I help businesses find where AI actually helps, build it, and train their teams. Book a short intro call.";
export const SITE_URL = "https://joshrobinson.com";
export const CONTACT_EMAIL = "hire@joshrobinson.com";
/** On-site booking page. It embeds this Cal.com event. */
export const BOOKING_PATH = "/book";
export const CAL_EVENT_URL = "https://cal.com/joshrobinson/intro";
export const CAL_LINK = "joshrobinson/intro";

export const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/hexorx" },
  { label: "LinkedIn", href: "https://linkedin.com/in/hexorx" },
];

/**
 * Sections that stay off the public site until Josh supplies the content.
 * Turn a flag on only after that content exists. Do not render TODO copy.
 */
export const showStatusPill = false;
export const showTestimonials = false;
export const showHeadshot = false;
export const showNewsletter = false;
export const showRealtorQuote = false;
export const showClientResults = false;
