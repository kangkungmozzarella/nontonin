import React from "react";
import * as Location from "expo-location";
import { CITIES } from "@common/api/mock/data";
import { haversineKm } from "@helpers/format";
import type { City } from "@api-hooks/cities/model";

export type Coords = { lat: number; lng: number };
type Status = "unknown" | "granted" | "denied";

interface LocationContextValue {
  coords: Coords | null;
  status: Status;
  // Asks for permission if needed and returns a fix, or null if unavailable
  request: () => Promise<Coords | null>;
}

const LocationContext = React.createContext<LocationContextValue>({
  coords: null,
  status: "unknown",
  request: async () => null,
});

async function readPosition(): Promise<Coords | null> {
  const last = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60_000 });
  const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  return pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : null;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = React.useState<Coords | null>(null);
  const [status, setStatus] = React.useState<Status>("unknown");

  // If permission was granted in an earlier session, read the position quietly
  React.useEffect(() => {
    Location.getForegroundPermissionsAsync()
      .then(async (p) => {
        if (p.granted) {
          setStatus("granted");
          setCoords(await readPosition());
        } else if (!p.canAskAgain) setStatus("denied");
      })
      .catch(() => {});
  }, []);

  const request = React.useCallback(async () => {
    try {
      const p = await Location.requestForegroundPermissionsAsync();
      if (!p.granted) {
        setStatus("denied");
        return null;
      }
      setStatus("granted");
      const c = await readPosition();
      setCoords(c);
      return c;
    } catch {
      return null;
    }
  }, []);

  const value = React.useMemo(() => ({ coords, status, request }), [coords, status, request]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useUserLocation = () => React.useContext(LocationContext);

export function nearestCity(c: Coords): City {
  return CITIES.reduce((best, city) => (haversineKm(c, city) < haversineKm(c, best) ? city : best));
}
