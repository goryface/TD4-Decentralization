const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let lastReceivedEncryptedMessage = null;
let lastReceivedDecryptedMessage = null;
let lastMessageDestination = null;

// Route to handle receiving messages
app.post('/receiveMessage', (req, res) => {
    const { encryptedMessage, decryptedMessage, destination } = req.body;
    lastReceivedEncryptedMessage = encryptedMessage;
    lastReceivedDecryptedMessage = decryptedMessage;
    lastMessageDestination = destination;
    res.sendStatus(200);
});

// Route to get the last received encrypted message
app.get('/getLastReceivedEncryptedMessage', (req, res) => {
    res.json({ result: lastReceivedEncryptedMessage });
});

// Route to get the last received decrypted message
app.get('/getLastReceivedDecryptedMessage', (req, res) => {
    res.json({ result: lastReceivedDecryptedMessage });
});

// Route to get the last message destination
app.get('/getLastMessageDestination', (req, res) => {
    res.json({ result: lastMessageDestination });
});

const PORT = process.env.PORT || 3000;

// Export app for testing purposes
module.exports = app;

// Start the server
if (!module.parent) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
