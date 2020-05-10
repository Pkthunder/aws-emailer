import path = require('path');
import cdk = require('@aws-cdk/core');
import iam = require('@aws-cdk/aws-iam');
import lambda = require('@aws-cdk/aws-lambda');
import sqs = require('@aws-cdk/aws-sqs');
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';

export class JDevEmailer extends cdk.Construct {
  readonly queue: sqs.Queue;

  constructor(parent: cdk.Construct, id: string) {
    super(parent, id);

    this.queue = new sqs.Queue(this, 'jdev-emailer-queue', {
      queueName: 'jdev-emailer-queue'
    });

    const lambdaRole = new iam.Role(this, 'jdev-emailer-lambda-role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        sqsPermissions: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'sqs:*'
              ],
              effect: iam.Effect.ALLOW,
              resources: [this.queue.queueArn]
            })
          ]
        }),
        sesPermissions: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'ses:*'
              ],
              effect: iam.Effect.ALLOW,
              resources: ['*']
            })
          ]
        }),
        vpcPermissions: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'ec2:CreateNetworkInterface',
                'ec2:DescribeNetworkInterface',
                'ec2:DeleteNetworkInterface'
              ],
              effect: iam.Effect.ALLOW,
              resources: ['*']
            })
          ]
        }),
        logsPermissions: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
                'logs:DescribeLogStreams',
                'logs:*'
              ],
              effect: iam.Effect.ALLOW,
              resources: ['*']
            })
          ]
        })
      }
    });

    const lambdaProps = {
      code: new lambda.AssetCode(path.join(__dirname, '..', 'lambda')),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      role: lambdaRole
    };

    const emailerLambda = new lambda.Function(this, 'jdev-emailer-lambda', lambdaProps);

    emailerLambda.addEventSource(new SqsEventSource(this.queue));
  }

  get queueUrl () {
    return this.queue.queueUrl;
  }

  get queueArn () {
    return this.queue.queueArn;
  }
}

export default JDevEmailer;
