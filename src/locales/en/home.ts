import type id from "../id/home";

const home: typeof id = {
  greeting: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "Good night" },
  subtitle: "What are we watching today?",
  nowShowing: "Now showing",
  comingSoon: "Coming soon",
  nearby: "Cinemas near you",
  inCity: "Cinemas in {{city}}",
  releaseOn: "Opens {{date}}",
  promo: {
    feature: { title: "See the screen from your seat", subtitle: "3D preview before you book {{film}}" },
    discount: { title: "Mon–Thu, 20% off", subtitle: "On every film at Nontonin Regular" },
    premiere: { subtitle: "Opens {{date}} · pre-sale opens soon" },
  },
  cinemas: {
    title: "Cinemas",
    subtitle_one: "{{count}} cinema in {{city}}",
    subtitle_other: "{{count}} cinemas in {{city}}",
    enableLocation: "Turn on location to see how far each cinema is",
    directions: "Directions",
    playing: "Now playing",
    nothing: "No showtimes at this cinema on that date.",
  },
};

export default home;
