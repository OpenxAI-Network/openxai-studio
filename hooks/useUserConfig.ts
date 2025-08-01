import { useMemo } from "react";

function extractUserConfig({ config }: { config: string }) {
  return config
    .split("# START USER CONFIG")
    .at(1)
    ?.split("# END USER CONFIG")
    .at(0)
    ?.split("\n")
    .slice(1, -1)
    .join("\n");
}

export function useUserConfig({ config }: { config?: string }) {
  return useMemo(
    () => (config ? extractUserConfig({ config }) : undefined),
    [config]
  );
}