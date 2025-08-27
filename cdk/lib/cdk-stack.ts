import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class McpZendeskStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda Function for MCP Zendesk Server
    const mcpZendeskFunction = new lambda.Function(this, 'McpZendeskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../dist'),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_ENV: 'production',
        // Zendesk環境変数は外部から設定（Systems Manager Parameter Store等）
        ZENDESK_SUBDOMAIN: process.env.ZENDESK_SUBDOMAIN || '',
        ZENDESK_USERNAME: process.env.ZENDESK_USERNAME || '',
        ZENDESK_API_TOKEN: process.env.ZENDESK_API_TOKEN || '',
        ZENDESK_ALLOW_USER_EMAIL: 'true',
      },
      description: 'MCP Zendesk Server - Stateless HTTP Transport for LibreChat integration',
    });

    // Function URL設定（認証なし）
    const functionUrl = mcpZendeskFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.GET, lambda.HttpMethod.POST, lambda.HttpMethod.OPTIONS],
        allowedHeaders: ['*'],
        allowCredentials: false,
      },
    });

    // Output values
    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: functionUrl.url,
      description: 'MCP Zendesk Server Function URL',
      exportName: 'McpZendeskFunctionUrl',
    });

    new cdk.CfnOutput(this, 'FunctionName', {
      value: mcpZendeskFunction.functionName,
      description: 'Lambda Function Name',
      exportName: 'McpZendeskFunctionName',
    });
  }
}
