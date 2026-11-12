import React from "react";
import { useGetCinemas } from "@api-hooks/cinemas";
import { haversineKm } from "@helpers/format";
import { useUserLocation } from "./use-user-location";

// Cinemas in a city, closest first when the user's location is known
export function useCinemasNearby(cityId: string | undefined) {
  const query = useGetCinemas(cityId);
  const { coords } = useUserLocation();
  const items = React.useMemo(() => {
    const list = (cityId ? query.data : []) ?? [];
    const withDistance = list.map((cinema) => ({ cinema, distanceKm: coords ? haversineKm(coords, cinema) : null }));
    if (coords) withDistance.sort((a, b) => a.distanceKm! - b.distanceKm!);
    return withDistance;
  }, [query.data, coords, cityId]);
  return { ...query, items, hasLocation: !!coords };
}
