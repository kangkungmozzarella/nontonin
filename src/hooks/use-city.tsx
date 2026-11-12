import React from "react";
import { localStorage, StorageKeys } from "@helpers/local-storage";
import { CITIES } from "@common/api/mock/data";
import type { City } from "@api-hooks/cities/model";

interface CityContextValue {
  city: City | null; // null until the user picks one or location resolves it
  setCityId: (id: string) => void;
}

const CityContext = React.createContext<CityContextValue>({ city: null, setCityId: () => {} });

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [cityId, setId] = React.useState(() => localStorage.getItem(StorageKeys.city));

  const setCityId = React.useCallback((id: string) => {
    localStorage.setItem(StorageKeys.city, id);
    setId(id);
  }, []);

  const value = React.useMemo(
    () => ({ city: CITIES.find((c) => c.id === cityId) ?? null, setCityId }),
    [cityId, setCityId],
  );
  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export const useCity = () => React.useContext(CityContext);
