import dotenv from "dotenv";
import { ethers } from "ethers";
import autocannon from "autocannon";

import { Params, Requests } from "./types";

dotenv.config();

const url = process.env.URL!;
const length = +process.env.LENGTH!;

const timeout = +process.env.TIMEOUT!;
const workers = +process.env.WORKERS!;
const duration = +process.env.DURATION!;
const pipelining = +process.env.PIPELINING!;
const connections = +process.env.CONNECTIONS!;

const setParams = async (): Promise<Params[]> => {
  const params: Params[] = [];

  for (let i = 0; i < length; i++) {
    const nonce = Math.floor(+new Date() / 1000);

    const data = {
      message: `Welcome to PureFI Dashboard!\nNonce: ${nonce}`,
      signature: "",
    };

    const randomWallet = ethers.Wallet.createRandom();
    data.signature = await randomWallet.signMessage(data.message);
    params.push(data);
  }

  return params;
};

const run = async () => {
  const params = await setParams();

  const requests: Requests[] = params.map((body) => ({
    method: "POST",
    body: JSON.stringify(body),
  }));

  autocannon(
    {
      url,
      timeout,
      workers,
      duration,
      headers: {
        "Content-Type": "application/json",
      },
      pipelining,
      connections,
      requests,
    },
    console.log
  );
};

run();
