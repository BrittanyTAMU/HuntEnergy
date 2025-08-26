// Load .env
require("dotenv").config();


//web server
const express = require("express");
//middleware to parse JSON 
const bodyParser = require("body-parser");
//twilio client library
const twilio = require("twilio");
//connection to aws connect and maybe SES
const AWS = require("aws-sdk");
//allows frontend/backend requests
const cors = require("cors");
const PORT = 5000

const app = express();
app.use(cors());//enable cross origin req
app.use(bodyParser.json());//parse incoming JSON body

//extract the aws connect setting from environment bc idk WHYYY its not working...idk if its my .env file or config, this will help me
const {
    CONNECT_INSTANCE_ID,
    CONNECT_FLOW_ID,
    CONNECT_NUMBER
  } = process.env;

  //immediately check if aws connect config is missing, if not, fail immediately
  if (!CONNECT_INSTANCE_ID || !CONNECT_FLOW_ID || !CONNECT_NUMBER) {
    console.error("AWS Connect variables missing in .env:");
    console.error("CONNECT_INSTANCE_ID=" + CONNECT_INSTANCE_ID);
    console.error("CONNECT_FLOW_ID=" + CONNECT_FLOW_ID);
    console.error("CONNECT_NUMBER=" + CONNECT_NUMBER);
    throw new Error("Missing AWS Connect variables in .env");
  }

// SMS setup using twilio, verify the cred exist before using client
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.error("Twilio environment variables missing!!");
}
//intialize twilio client for SMS
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// AWS Setup-> config aws sdk region (must match AWS Connect instance, mine was us-west found in the url or arn)
AWS.config.update({ region: "us-west-2" });
// const ses = new AWS.SES();//not doing it for this MVP
const connect = new AWS.Connect();//connect lient for outbound calls

//env debugging, print key env to make sure nting is missing(useful in dev, not prod)
// console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "Loaded" : "Missing!");
// console.log("TWILIO_NUMBER:", process.env.TWILIO_NUMBER || "Missing");
// console.log("ALERT_PHONE:", process.env.ALERT_PHONE || "Missing");
// console.log("CONNECT_INSTANCE_ID:", process.env.CONNECT_INSTANCE_ID || "Missing");
// console.log("CONNECT_FLOW_ID:", process.env.CONNECT_FLOW_ID || "Missing");
// console.log("CONNECT_NUMBER:", process.env.CONNECT_NUMBER || "Missing");

// Incident Endpoint 
app.post("/incident", async (req, res) => {
  const { message, severity, userPhone  } = req.body;//from body form in UI

  console.log("Received incident:", req.body);

  try {
    //(not doing it for this MVP, but can uncomment if needed) ...Send email via SES
    // await ses.sendEmail({
    //   Source: process.env.SES_EMAIL,
    //   Destination: { ToAddresses: [process.env.ALERT_EMAIL] },
    //   Message: {
    //     Subject: { Data: "New Incident Reported" },
    //     Body: { Text: { Data: message } }
    //   }
    // }).promise();
    // console.log("Email sent");

    // Send SMS via Twilio
    if (!process.env.TWILIO_NUMBER || !process.env.ALERT_PHONE) {
      throw new Error("Twilio numbers are not defined in .env");
    }
    await client.messages.create({
      body: `Incident reported: ${message}`,//SMS content
      from: process.env.TWILIO_NUMBER,//Must be Twilioverified number
      to: process.env.ALERT_PHONE//Recipient(must be verified in twilio acct)
    });
    console.log("SMS sent");

    //Escalation: Trigger AWS Connect call only for High severity reports
    if (severity === "High") {
        //debugging
      if (!process.env.CONNECT_INSTANCE_ID || !process.env.CONNECT_FLOW_ID || !process.env.CONNECT_NUMBER) {
        throw new Error("AWS Connect variables missing in .env");
      }

      await connect.startOutboundVoiceContact({
        DestinationPhoneNumber: process.env.ALERT_PHONE,//who gets called
        ContactFlowId: process.env.CONNECT_FLOW_ID,//flow to run in aws connect
        InstanceId: process.env.CONNECT_INSTANCE_ID,//connect instance
        SourcePhoneNumber: process.env.CONNECT_NUMBER//caller ID from aws connect
      }).promise();
      console.log("AWS Connect call triggered");
    }

    res.json({ success: true, msg: "Incident reported successfully!" });
  } catch (err) {
    console.error("Error reporting incident:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

//start server on localhost:5000
app.listen(5000, () => console.log(`Server running on ${PORT}, you better go catch it!`));
