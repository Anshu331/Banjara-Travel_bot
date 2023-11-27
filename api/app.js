const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000; // Use the process.env.PORT for dynamic port assignment

// A unique identifier for the given session
const sessionId = uuid.v4();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to the next layer of middleware
  next();
});

app.post('/send-msg', async (req, res) => {
  try {
    const data = await runSample(req.body.MSG);
    res.send({ Reply: data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ Reply: 'An error occurred.' });
  }
});

/**
 * Send a query to the Dialogflow agent and return the query result.
 * @param {string} projectId The project to be used
 */
async function runSample(msg, projectId = 'banjara-eciq') {
  try {
    // Create a new session
    const sessionClient = new dialogflow.SessionsClient({
      keyFilename: './banjara-eciq-1b3a92c4d766.json',
    });
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the Dialogflow agent
          text: msg,
          // The language used by the client (en-US)
          languageCode: 'en-US',
        },
      },
    };

    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log('  No intent matched.');
    }

    return result.fulfillmentText;
  } catch (error) {
    console.error('Error in runSample:', error);
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});