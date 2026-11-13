import { config } from "../../config";

export const devModeSlug = (value: string): string => {
  const mode = config.app.env.toLowerCase();
  return mode === "development" || mode === "dev"
    ? `${value}_dev`
    : value;
};
