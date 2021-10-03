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
    let requestBody = JSON.parse(JSON.stringify(event.body));
    let responseBody = {
      success: false
    };
    console.log(requestBody);
    let response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify(responseBody)
    };
    // Load secret twilio API auth params.
    const { Parameters } = await (new aws.SSM())
      .getParameters({
        Names: ["TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_NOTIFY_SERVICE_SID"].map(secretName => process.env[secretName]),
        WithDecryption: true,
    }).promise();
    TWILIO_ACCOUNT_SID = Parameters[0].Value
    TWILIO_AUTH_TOKEN = Parameters[1].Value
    TWILIO_NOTIFY_SERVICE_SID = Parameters[2].Value
    // Instantiate twilio client API
    const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN); 
    // Use twilio notification service to send many SMS messages in one API call
    const service = twilio.notify.services(TWILIO_NOTIFY_SERVICE_SID);
    console.log(requestBody.recipients);
    console.log(typeof requestBody.recipients);
    // Create an sms binding for each recipient
    const bindings = requestBody.recipients.map(recipient => {
      return JSON.stringify({ binding_type: 'sms', address: recipient });
    });
    console.log('Sending the following SMS message : ' + requestBody.message);
    console.log('Sending to recipients : ' + requestBody.recipients);
    // Send messages out using our twilio notification service
    return service.notifications
      .create({
            toBinding: bindings,
            body: requestBody.message,
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
