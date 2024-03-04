import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import { generateRsaKeyPair } from "../../src/crypto"; // Import the function to generate RSA key pairs
import { webcrypto } from "crypto";
import crypto from "crypto";

export type Node = { nodeId: number; pubKey: string; privateKey?: webcrypto.CryptoKey }; // Add privateKey field to Node type

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());
  const registeredNodes: Node[] = []; // Define registeredNodes array here

  // Route to handle registering nodes
  _registry.post("/registerNode", (req: Request<any, any, RegisterNodeBody>, res: Response<GetNodeRegistryBody>) => {
    const { nodeId, pubKey } = req.body;
    const newNode: Node = { nodeId, pubKey };
    registeredNodes.push(newNode);
    res.status(200).json({ nodes: registeredNodes });
  });

  // Route to handle getting private key of a node
  _registry.get("/getPrivateKey/:nodeId", async (req: Request, res: Response) => {
    const nodeId = parseInt(req.params.nodeId);
    const node = registeredNodes.find((n) => n.nodeId === nodeId);
    if (!node) {
      return res.status(404).json({ error: "Node not found" });
    }

    // Check if the private key is already generated
    if (node.privateKey) {
      return res.status(200).json({ result: node.privateKey });
    }

    // Generate RSA key pair for the node
    try {
      const { privateKey } = await generateRsaKeyPair();
      node.privateKey = privateKey; // Store the private key in the node object
      return res.status(200).json({ result: privateKey });
    } catch (error) {
      return res.status(500).json({ error: "Failed to generate key pair" });
    }
  });

  _registry.get("/status", (req, res) => {res.send("live")});

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
