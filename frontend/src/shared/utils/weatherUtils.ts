export type WeatherState = 'sunny' | 'overcast' | 'rainy' | 'default';

export const getWeatherState = (anxietyScore: number, sigmaVariance: number): WeatherState => {
  if (anxietyScore > 7) return 'rainy';
  if (anxietyScore <= 3 && sigmaVariance <= 1.2) return 'sunny';
  if (anxietyScore > 5 || sigmaVariance > 1.5) return 'overcast';
  return 'default';
};
