import { getSidebar } from "./sidebar.js";

// Remove the hardcoded sidebar constant and replace with a function
export function getFormattedSidebar() {
  const sidebar = getSidebar();
  if (!sidebar) {
    throw new Error('Sidebar content not available');
  }
  return sidebar;
}

export function getFindGuideParamsPrompt() {
  return `
    This is the path to the technical documentation to create actions from.
    To get the steps list, you need to pass the guideLink to the BuildOnBase getGuide tool.
    From the user prompt, find the most relevant guide from the sidebar of the docs website.
    The sidebar list can be found here:
    ${getFormattedSidebar()}
    Find the path of the guide in the sidebar and pass it as guideLink by adding https://docs.base.org to the getStepsList tool.
  
    For example, if the user wants to create a sign and verify component, the guideLink should be https://docs.base.org/identity/smart-wallet/guides/signing-and-verifying-messages
  
    You will find that in the sidebar list, the guide is under the "Smart Wallet" section.
    `;
}

export const testingPrompt = (code: string) => {
  return `
  Here are some good examples of wagmi config files:
  ${wagmiConfigExample1}
  ${wagmiConfigExample2}

  Here are some good examples of sign and verify components:
  ${signAndVerifyComponentExample}
  ${signAndVerifyComponentExample2}

  I gave another LLM a task to create a wagmi config file and a sign and verify component.
  Here is the code they created:
  ${code}

  Please look at the code examples and score the code from 0 to 10 on the following criteria:
  - Is the code a good example of a wagmi config file?
  - Is the code a good example of a sign and verify component?
  - Is the code easy to understand?
  - Is the code easy to maintain?
  - Is the code easy to test?
  - Is the code easy to deploy?
  `;
};

const wagmiConfigExample1 = `
import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const cbWalletConnector = coinbaseWallet({
  appName: "Wagmi Smart Wallet",
  preference: "smartWalletOnly",
});

export const config = createConfig({
  chains: [baseSepolia],
  // turn off injected provider discovery
  multiInjectedProviderDiscovery: false,
  connectors: [cbWalletConnector],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});
`;

const wagmiConfigExample2 = `
'use client';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { useMemo } from 'react';
import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { NEXT_PUBLIC_WC_PROJECT_ID } from './config';

export function useWagmiConfig() {
  const projectId = NEXT_PUBLIC_WC_PROJECT_ID ?? '';
  if (!projectId) {
    const providerErrMessage =
      'To connect to all Wallets you need to provide a NEXT_PUBLIC_WC_PROJECT_ID env variable';
    throw new Error(providerErrMessage);
  }

  return useMemo(() => {
    const connectors = connectorsForWallets(
      [
        {
          groupName: 'Recommended Wallet',
          wallets: [coinbaseWallet],
        },
        {
          groupName: 'Other Wallets',
          wallets: [rainbowWallet, metaMaskWallet],
        },
      ],
      {
        appName: 'onchainkit',
        projectId,
      },
    );

    const wagmiConfig = createConfig({
      chains: [base, baseSepolia],
      // turn off injected provider discovery
      multiInjectedProviderDiscovery: false,
      connectors,
      ssr: true,
      transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
      },
    });

    return wagmiConfig;
  }, [projectId]);
}
`;

const signAndVerifyComponentExample = `
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Hex } from "viem";
import { useAccount, usePublicClient, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export function SignMessage() {
  const account = useAccount();
  const client = usePublicClient();
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const { signMessage } = useSignMessage({
    mutation: { onSuccess: (sig) => setSignature(sig) },
  });
  const message = useMemo(() => {
    return new SiweMessage({
      domain: document.location.host,
      address: account.address,
      chainId: account.chainId,
      uri: document.location.origin,
      version: "1",
      statement: "Smart Wallet SIWE Example",
      nonce: "12345678",
    });
  }, []);

  const [valid, setValid] = useState<boolean | undefined>(undefined);

  const checkValid = useCallback(async () => {
    if (!signature || !account.address || !client) return;

    client
      .verifyMessage({
        address: account.address,
        message: message.prepareMessage(),
        signature,
      })
      .then((v) => setValid(v));
  }, [signature, account]);

  useEffect(() => {
    checkValid();
  }, [signature, account]);

  return (
    <div>
      <h2>Sign Message (Sign In with Ethereum)</h2>
      <button
        onClick={() => signMessage({ message: message.prepareMessage() })}
      >
        Sign
      </button>
      <p>{}</p>
      {signature && <p>Signature: {signature}</p>}
      {valid != undefined && <p> Is valid: {valid.toString()} </p>}
    </div>
  );
}
`;

const signAndVerifyComponentExample2 = `
import { useCallback, useEffect, useState } from "react";
import type { Hex } from "viem";
import { useAccount, useConnect, usePublicClient, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/wagmi";

export function ConnectAndSIWE() {
  const { connect } = useConnect({
    mutation: {
      onSuccess: (data) => {
        const address = data.accounts[0];
        const chainId = data.chainId;
        const m = new SiweMessage({
          domain: document.location.host,
          address,
          chainId,
          uri: document.location.origin,
          version: "1",
          statement: "Smart Wallet SIWE Example",
          nonce: "12345678",
        });
        setMessage(m);
        signMessage({ message: m.prepareMessage() });
      },
    },
  });
  const account = useAccount();
  const client = usePublicClient();
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const { signMessage } = useSignMessage({
    mutation: { onSuccess: (sig) => setSignature(sig) },
  });
  const [message, setMessage] = useState<SiweMessage | undefined>(undefined);

  const [valid, setValid] = useState<boolean | undefined>(undefined);

  const checkValid = useCallback(async () => {
    if (!signature || !account.address || !client || !message) return;

    client
      .verifyMessage({
        address: account.address,
        message: message.prepareMessage(),
        signature,
      })
      .then((v) => setValid(v));
  }, [signature, account]);

  useEffect(() => {
    checkValid();
  }, [signature, account]);

  useEffect(() => {});

  return (
    <div>
      <button onClick={() => connect({ connector: cbWalletConnector })}>
        Connect + SIWE
      </button>
      <p>{}</p>
      {valid != undefined && <p> Is valid: {valid.toString()} </p>}
    </div>
  );
}
`;


