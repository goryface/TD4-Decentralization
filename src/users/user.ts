import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

    // Variables pour stocker le dernier message reçu et envoyé
    let dernierMessageReçu: string | null = null;
    let dernierMessageEnvoyé: string | null = null;
  
    // Route GET pour récupérer le dernier message reçu
    _user.get("/getLastReceivedMessage", (req, res) => {
      res.json({ result: dernierMessageReçu });
    });
  
    // Route GET pour récupérer le dernier message envoyé
    _user.get("/getLastSentMessage", (req, res) => {
      res.json({ result: dernierMessageEnvoyé });
    });

  _user.get("/status", (req, res) => {res.send("live")});

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}