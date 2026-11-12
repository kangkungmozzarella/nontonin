import type id from "../id/home";

const home: typeof id = {
  greeting: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "Good night" },
  subtitle: "What are we watching today?",
  nowShowing: "Now showing",
  comingSoon: "Coming soon",
  nearby: "Cinemas near you",
  inCity: "Cinemas in {{city}}",
  releaseOn: "Opens {{date}}",
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
