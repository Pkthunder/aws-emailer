const AWS = require('aws-sdk');

const ses = new AWS.SESV2();

const Charset = 'UTF-8';

const ensureArray = (val) => val instanceof Array ? val : [val];

const eventToSESParams = (obj) => {
  let content = {};
  if (obj.body) {
    content = {
      Simple: {
        Body: {
          Text: {
            Data: obj.body,
            Charset
          }
        },
        Subject: {
          Data: obj.subject,
          Charset,
        }
      }
    }
  }
  else if (obj.template) {
    // TODO: implement this
  }

  return {
    Content: {
      ...content,
    },
    Destination: {
      ToAddresses: ensureArray(obj.to),
      CcAddresses: ensureArray(obj.cc),
      BccAddresses: ensureArray(obj.bcc),
    },
    FromEmailAddress: obj.from || obj.as || process.env.DEFAULT_FROM_ADDRESS
  };
}

exports.handler = async (event) => {
  const emails = await Promise.all(event.Records.map(r => {
    const emailOpts = {...JSON.parse(r.body)}
    return ses.sendEmail(eventToSESParams(emailOpts)).promise();
  }));

  return {
    statusCode: 200,
    body: `${emails.length} sent`
  }
};