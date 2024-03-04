import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import { symDecrypt, importSymKey, importPrvKey, rsaDecrypt, generateRsaKeyPair } from '../crypto';
import {webcrypto} from "crypto";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let decryptionKeyPair: { publicKey: webcrypto.CryptoKey, privateKey: webcrypto.CryptoKey } | null = await generateRsaKeyPair();
  let lastReceivedMessage: { encryptedMessage: string, destinationPort: number } | null = null;


// Route to get the last received encrypted message
  onionRouter.get('/getLastReceivedEncryptedMessage', (req, res) => {
    res.json({ result: lastReceivedMessage });
  });

  onionRouter.get('/getLastReceivedDecryptedMessage', async (req, res) => {
    if (lastReceivedMessage !== null && decryptionKeyPair?.privateKey !== null) {
      try {
        const decryptedMessage = await rsaDecrypt(lastReceivedMessage.encryptedMessage, decryptionKeyPair!.privateKey);
        res.json({ result: decryptedMessage });
      } catch (error) {
        res.status(500).json({ error: 'Failed to decrypt message.' });
      }
    } else {
      res.status(404).json({ result: null });
    }
  });

  onionRouter.get('/getLastMessageDestination', async (req, res) => {
    if (lastReceivedMessage !== null) {
      const { destinationPort } = lastReceivedMessage;
      res.json({ result: destinationPort });
    } else {
      res.status(404).json({ result: null });
    }
  });
  onionRouter.get("/status", (req, res) => {res.send("live");});

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
      `Onion router ${nodeId} is listening on port ${
        BASE_ONION_ROUTER_PORT + nodeId
      }`
    );
  });

  return server;
}
