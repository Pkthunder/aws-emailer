import cdk = require('@aws-cdk/core');
import sqs = require('@aws-cdk/aws-sqs');
export declare class JDevEmailer extends cdk.Construct {
    readonly queue: sqs.Queue;
    constructor(parent: cdk.Construct, id: string);
    get queueUrl(): string;
    get queueArn(): string;
}
export default JDevEmailer;
