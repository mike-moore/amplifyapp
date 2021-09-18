const aws = require('aws-sdk');
const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["TWILIO_ACCOUNT_SID","TWILIO_AUTH_TOKEN","TWILIO_PHONE_NUMBER"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();


const client = require('twilio')(
  'ACcfcfc89713b9c606086be57628a2e016',
  '79c7127390f01a8d15b3e6524bb170a7'
);

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  }, 
        body: JSON.stringify(Parameters),
    };
    return response;
};
