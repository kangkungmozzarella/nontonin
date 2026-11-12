import { Platform, useWindowDimensions } from "react-native";

// On the web the app renders in a centred phone-width column (see WebShell in
// app.tsx), so layouts must size themselves to that column instead of the
// whole browser window. On native this is just the window size.
export const WEB_MAX_WIDTH = 480;

export function useAppDimensions() {
  const win = useWindowDimensions();
  if (Platform.OS !== "web" || win.width <= WEB_MAX_WIDTH) return { width: win.width, height: win.height, left: 0 };
  return { width: WEB_MAX_WIDTH, height: win.height, left: (win.width - WEB_MAX_WIDTH) / 2 };
}
