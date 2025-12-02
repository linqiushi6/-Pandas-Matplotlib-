import { EnergyDataPoint, Region } from '../types';

// Simulating a CSV dataset loaded into a DataFrame
const RAW_DATA: EnergyDataPoint[] = [];

const REGIONS: Region[] = ['World', 'North America', 'Europe', 'Asia Pacific'];

// Generate realistic-looking data trends (2000-2024)
// This simulates "Loading and Cleaning Data"
REGIONS.forEach(region => {
  for (let year = 2000; year <= 2024; year++) {
    const progress = year - 2000;
    
    let solarBase = 0;
    let windBase = 0;
    let coalBase = 0;
    let gasBase = 0;
    
    // Region specific modifiers to make data interesting
    if (region === 'World') {
      solarBase = Math.pow(progress, 2.5) * 2;
      windBase = Math.pow(progress, 2.2) * 5;
      coalBase = 8000 + (progress * 50) - (progress > 15 ? (progress - 15) * 100 : 0);
      gasBase = 5000 + (progress * 100);
    } else if (region === 'Europe') {
      solarBase = Math.pow(progress, 2.3) * 3;
      windBase = Math.pow(progress, 2.1) * 8;
      coalBase = 2000 - (progress * 60); // Dropping fast
      gasBase = 1500 + (progress * 10);
    } else if (region === 'Asia Pacific') {
      solarBase = Math.pow(progress, 2.8) * 1.5; // Exploding growth late
      windBase = Math.pow(progress, 2.4) * 3;
      coalBase = 4000 + (progress * 150); // Still rising
      gasBase = 1000 + (progress * 80);
    } else {
      // North America
      solarBase = Math.pow(progress, 2.4) * 2.5;
      windBase = Math.pow(progress, 2.0) * 6;
      coalBase = 2500 - (progress * 80);
      gasBase = 2000 + (progress * 120); // Fracking boom simulation
    }

    // Add some noise
    const noise = (val: number) => val + (Math.random() * val * 0.05);

    const solar = Math.max(0, noise(solarBase));
    const wind = Math.max(0, noise(windBase));
    const hydro = Math.max(0, noise(region === 'World' ? 3000 + progress * 20 : 800));
    const coal = Math.max(0, noise(coalBase));
    const gas = Math.max(0, noise(gasBase));
    const oil = Math.max(0, noise(region === 'World' ? 10000 + progress * 50 : 3000));

    // CO2 calculation approximation (simplified)
    // Coal is dirtiest, then Oil, then Gas
    const co2 = (coal * 1.0) + (oil * 0.8) + (gas * 0.5);

    RAW_DATA.push({
      year,
      region,
      solar: Math.round(solar),
      wind: Math.round(wind),
      hydro: Math.round(hydro),
      coal: Math.round(coal),
      gas: Math.round(gas),
      oil: Math.round(oil),
      co2: Math.round(co2)
    });
  }
});

// "Pandas-like" utility functions
export const DataService = {
  getAvailableRegions: (): Region[] => REGIONS,

  filterByRegion: (region: Region): EnergyDataPoint[] => {
    return RAW_DATA.filter(d => d.region === region);
  },

  // Simulates df.groupby().sum() or similar aggregations
  getLatestStats: (region: Region) => {
    const regionData = RAW_DATA.filter(d => d.region === region);
    const latest = regionData[regionData.length - 1];
    
    const totalRenewables = latest.solar + latest.wind + latest.hydro;
    const totalFossil = latest.coal + latest.gas + latest.oil;
    const total = totalRenewables + totalFossil;

    return {
      year: latest.year,
      totalRenewables,
      totalFossil,
      renewablesShare: (totalRenewables / total) * 100,
      co2: latest.co2
    };
  },

  // Prepare data for "Stackplot" equivalent (Area Chart)
  getStackPlotData: (region: Region) => {
    return RAW_DATA.filter(d => d.region === region).map(d => ({
      year: d.year,
      "Fossil Fuels (Coal, Oil, Gas)": d.coal + d.gas + d.oil,
      "Clean Energy (Solar, Wind, Hydro)": d.solar + d.wind + d.hydro
    }));
  },

  // Prepare data for "Line Plot" equivalent
  getDetailedMixData: (region: Region) => {
    return RAW_DATA.filter(d => d.region === region).map(d => ({
      year: d.year,
      Solar: d.solar,
      Wind: d.wind,
      Coal: d.coal,
      Gas: d.gas
    }));
  }
};
