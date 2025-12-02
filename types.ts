export interface EnergyDataPoint {
  year: number;
  solar: number; // TWh
  wind: number; // TWh
  hydro: number; // TWh
  coal: number; // TWh
  gas: number; // TWh
  oil: number; // TWh
  co2: number; // Million Tonnes
  region: string;
}

export interface AggregatedStats {
  totalRenewables: number;
  totalFossil: number;
  renewablesShare: number;
}

export type Region = 'World' | 'North America' | 'Europe' | 'Asia Pacific';

export interface ChartInsight {
  title: string;
  content: string;
  trend: 'positive' | 'negative' | 'neutral';
}
