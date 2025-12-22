// Tool functions to be used by the LLM
// [ACTUAL IMPLEMENTATION] These tool functions could be used to fetch data from a database or APIs
export async function getWeather(arg: { city: string }) {
  const { city } = arg;
  if (city.toLowerCase() === "london") return "22°C and cloudy";
  if (city.toLowerCase() === "new york") return "30°C and sunny";
  return "Unknown weather for this city";
}

export const getTime = async (args: { timezone: string }) => {
  return JSON.stringify({
    time: new Date().toLocaleTimeString(),
    zone: args.timezone,
  });
};

export const availableFunctions: Record<string, Function> = {
  getWeather,
  getTime,
};
