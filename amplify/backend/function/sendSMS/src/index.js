/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_PHONE_NUMBER","TWILIO_NOTIFY_SERVICE_SID"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
const aws = require('aws-sdk');

exports.handler = async (event) => {
  let message = "";
  let recipients = [];
  let responseBody = {
    success: false
  };
  let response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    },
    body: JSON.stringify(responseBody)
  };
  // Print out the request for debugging
  console.log("request : " + JSON.stringify(event));
  // Unpack the event body message contents
  if (event.body) {
    let body;
    if (typeof event.body == 'string') {
      body = JSON.parse(event.body)
    } else {
      body = event.body
    }
    if (body.message)
      message = body.message;
    if (body.recipients)
      recipients = body.recipients;
  }
  console.log("message : " + message);
  console.log("recipients : " + recipients);
  // Load secret twilio API auth params.
  const { Parameters } = await (new aws.SSM())
    .getParameters({
      Names: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_NOTIFY_SERVICE_SID"].map(secretName => process.env[secretName]),
      WithDecryption: true,
    }).promise();
  TWILIO_ACCOUNT_SID = Parameters[0].Value
  TWILIO_AUTH_TOKEN = Parameters[1].Value
  TWILIO_NOTIFY_SERVICE_SID = Parameters[2].Value
  // Instantiate twilio client API
  const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  // Use twilio notification service to send many SMS messages in one API call
  const service = twilio.notify.services(TWILIO_NOTIFY_SERVICE_SID);
  // Create an sms binding for each recipient
  const bindings = recipients.map(recipient => {
    return JSON.stringify({ binding_type: 'sms', address: recipient });
  });
  console.log('Sending the following SMS message : ' + message);
  console.log('Sending to recipients : ' + recipients);
  // Send messages out using our twilio notification service
  return service.notifications
    .create({
      toBinding: bindings,
      body: message,
    })
    .then(notification => {
      console.log(notification);
      responseBody.success = true;
      response.body = JSON.stringify(responseBody);
      return response;
    })
    .catch(err => {
      console.log(err);
      return response;
    });
};
