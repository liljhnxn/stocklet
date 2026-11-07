import { http, createConfig, createStorage } from "wagmi";
import { botchain, hardhatLocalhost } from "./chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [botchain, hardhatLocalhost],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  ssr: true,
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
  transports: {
    [botchain.id]: http("https://rpc.botchain.ai"),
    [hardhatLocalhost.id]: http("http://127.0.0.1:8545"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
