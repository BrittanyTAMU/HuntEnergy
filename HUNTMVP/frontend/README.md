# Incident Reporter App

## Welcome to the Incident Reporter app! 
This is a quick MVP full-stack demo I've built to report incidents (like safety issues, alerts, or whatever you want). Theres not storage, DB, or auth. It supports multiple severity levels:

Low / Medium -> sends a message through Twilio SMS

High -> triggers an escalation via AWS Connect outbound call using a contact flow to an onsite engineer  (because some issues need an actual phone call).

## What’s Inside

Frontend -> React app with a simple form (incident message + severity dropdown).

Backend -> Node.js + Express server that takes the form data and decides what to do:

If severity = Low or Medium -> sends SMS via Twilio.

If severity = High -> calls AWS Connect API to start an outbound voice call.

So yeah, text for small issues, phone call for 'the building is on fire' issues.

## Tech Stack

React (frontend)

Express / Node.js (backend)

Twilio (for SMS alerts)

AWS Connect (for voice calls)

dotenv (to keep secrets secret)

## How to Run Locally

1. Clone the repo
git clone https://github.com/your-username/incident-reporter.git
cd incident-reporter

2. Install dependencies

Backend:

cd backend
npm install


Frontend:

cd ../frontend
npm install

3. Setup environment variables

Create a .env file in your backend folder with:

### Twilio
TWILIO_ACCOUNT_SID=your_sid_here # look at the dashboard
TWILIO_AUTH_TOKEN=your_auth_token_here # look at the dashboard
TWILIO_PHONE_NUMBER=+1234567890   # must be a verified Twilio number in the Twilio console

### AWS Connect
AWS_REGION=us-east-1
CONNECT_INSTANCE_ID=your_instance_id_here  The ARN looks like: arn:aws:connect:us-west-2:123456789012:instance/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

The Instance ID is the last segment after /instance/

CONNECT_FLOW_ID=your_contact_flow_id_here #The ARN looks like: arn:aws:connect:us-east-1:123456789012:instance/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/contact-flow/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. The Flow ID is the last segment after /contact-flow/
CONNECT_NUMBER=+1234567890   # phone number given to you by aws connect ...used to display as caller to the user


## Pro Tips:

Find InstanceId in your AWS Connect console (it’s the last bit in the ARN after /instance/).

ContactFlowId is the ID of your published contact flow (it’s the last bit in the ARN after /contact-flow/).

Make sure your AWS user/role has connect:StartOutboundVoiceContact permission.

4. Start servers

Backend:

cd backend
npm start


Frontend:

cd ../frontend
npm start


Your app should now be running on:

Frontend: http://localhost:3000

Backend: http://localhost:5000



## How It Works

Go to the UI.

Enter an incident message.

Choose severity:

Low/Medium → You’ll get a Twilio SMS.

High → Your phone will actually ring with an AWS Connect call.

Celebrate (or panic, depending on the incident).



## Testing

Test Twilio by putting your real phone number in the form.

Test AWS Connect by making sure your flow plays a message before hanging up or ignoring the call

## Common Pitfalls

If Twilio errors -> double-check that your From number is the same as your Twilio verified number. The To and From numbers should be different

If AWS Connect errors -> check your InstanceId, FlowId, and IAM permissions.

If the call hangs up instantly -> your contact flow probably ends right away. Add a Play Prompt block before disconnect.

## Future Ideas

Add database to save incident history.

Slack / Teams integration.

Email alerts for Medium severity.

Real-time dashboard.

## Final Notes

This project was built because I had some extra time at night and wanted to build something relevant and meaningful for the position I've applied for at Hunt Energy. It ties together SMS + voice calls for incident reporting.

Not production-ready (yet)

If you run into problems, it’s usually an .ENV variable or AWS permissions thing. Don’t rage quit, just grab some coffee and debug. 