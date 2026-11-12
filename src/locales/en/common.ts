import type id from "../id/common";

const common: typeof id = {
  back: "Back",
  next: "Next",
  cancel: "Cancel",
  close: "Close",
  retry: "Try again",
  seeAll: "See all",
  change: "Change",
  done: "Done",
  errorTitle: "Couldn't load data",
  errorDesc: "Check your connection and try again.",
  today: "Today",
  tomorrow: "Tomorrow",
  studio: "Studio {{n}}",
  studios_one: "{{count}} studio",
  studios_other: "{{count}} studios",
  tabs: { home: "Home", cinemas: "Cinemas", tickets: "Tickets", profile: "Profile" },
  tier: { premiere: "Premiere", regular: "Regular" },
  rating: { SU: "All ages", "13+": "13 and over", "17+": "17 and over" },
  genre: {
    adventure: "Adventure",
    drama: "Drama",
    thriller: "Thriller",
    crime: "Crime",
    family: "Family",
    horror: "Horror",
    "sci-fi": "Sci-fi",
    romance: "Romance",
  },
  onboarding: {
    slides: [
      {
        title: "Every cinema in your city, in one app",
        desc: "Pick a city, compare showtimes at nearby cinemas and book without the queue.",
      },
      {
        title: "See the screen before you sit down",
        desc: "Tap any seat and get the view of the screen from that spot in 3D.",
      },
      {
        title: "Your ticket, right in your hand",
        desc: "Show the QR code at the studio door. No printing, no fuss.",
      },
    ],
    skip: "Skip",
    start: "Get started",
  },
  city: {
    title: "Choose a city",
    search: "Search cities",
    useLocation: "Use my location",
    detecting: "Finding your location…",
    cinemas_one: "{{count}} cinema",
    cinemas_other: "{{count}} cinemas",
    nearest: "Nearest",
    noResult: "No city found",
  },
  location: {
    title: "Find cinemas near you",
    desc: "Let Nontonin use your location to pick your city and sort cinemas by distance.",
    allow: "Allow location",
    manual: "Choose a city myself",
    denied: "Location permission denied. Choose a city manually.",
    detected: "Location found: {{city}}",
    failed: "Couldn't read your location. Choose a city manually.",
  },
  promo: {
    dismissToday: "Don't show again today",
    cta: { feature: "Try it now", discount: "See films", premiere: "See details" },
  },
};

export default common;
