export type CinemaTier = "regular" | "premiere";

export interface Cinema {
  id: string;
  cityId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  tier: CinemaTier;
  studios: number;
}
