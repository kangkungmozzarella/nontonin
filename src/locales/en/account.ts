import type id from "../id/account";

const account: typeof id = {
  tickets: {
    title: "My tickets",
    upcoming: "Upcoming",
    past: "History",
    empty: "No tickets yet",
    emptyDesc: "Tickets you buy will show up here.",
    browse: "Find a film",
    showQr: "Show this code at the studio door",
    code: "Booking code",
    previewSeat: "See the view from my seat",
    paidWith: "Paid with {{method}}",
    total: "Total",
    date: "Date",
    time: "Time",
  },
  profile: {
    guest: "Guest",
    guestDesc: "Your tickets are saved on this device",
    stats: "{{count}} tickets bought",
    language: "Language",
    city: "City",
    about: "About Nontonin",
    replayOnboarding: "Show the app intro again",
    clearData: "Delete all demo data",
    clearConfirm: "All tickets and settings will be removed from this device.",
    version: "Version {{v}}",
  },
  about: {
    title: "About",
    desc: "Nontonin is a cinema ticketing app with a 3D seat preview. Before you buy, you can see what the screen looks like from the seat you pick.",
    creditTitle: "Design inspiration",
    credit: "The 3D seat preview in this app is inspired by the \"{{concept}}\" UI/UX concept by {{designer}}.",
    openOriginal: "See the original work",
    disclaimer: "Every cinema, film and poster in this app is fictional and made for the demo.",
    disclaimerTmdb: "The cinemas, showtimes and payments in this app are fictional and made for the demo.",
    tmdb: "Film data and images are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.",
    builtWith: "Built with Expo, React Native and Three.js",
  },
};

export default account;
