const aws = require('aws-sdk');

exports.handler = async (event) => {
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
    // Create an sms binding for each recipient
    const bindings = event.recipients.map(recipient => {
      return JSON.stringify({ binding_type: 'sms', address: recipient });
    });
    // Send messages out using our twilio notification service
    return service.notifications
      .create({
            toBinding: bindings,
            body: event.message,
      })
      .then(notification => {
            console.log(notification);
      })
      .catch(err => {
            console.log(err);
      });
};
