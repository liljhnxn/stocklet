import { http, createConfig, cookieStorage, createStorage } from "wagmi";
import { botchainTestnet, hardhatLocalhost } from "./chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [botchainTestnet, hardhatLocalhost],
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
    [botchainTestnet.id]: http("https://rpc.bohr.life"),
    [hardhatLocalhost.id]: http("http://127.0.0.1:8545"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

