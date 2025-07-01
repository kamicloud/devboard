import { Injectable } from '@nestjs/common';
import { isEmpty } from '@nestjs/common/utils/shared.utils';
import AWS, { SSM } from 'aws-sdk';
import { GetParameterResult } from 'aws-sdk/clients/ssm';
import { CredentialsOptions } from 'aws-sdk/lib/credentials';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AwsSdkService {
  private static ssmClient: SSM;
  private static credentials;

  constructor(
    private readonly logger: Logger
  ) {
  }

  /**
   * load credentials from local.
   */
  public async loadLocalCredentials(): Promise<void> {
    AwsSdkService.credentials = await this.getCredentials().catch(err => {
      this.logger.log(err, 'AWS load local credentials ERROR');
    });

    this.logger.log(AwsSdkService.credentials, 'loadLocalCredentials');
  }

  public getSsmClient(): SSM {
    if (isEmpty(AwsSdkService.ssmClient)) {
      if (process.env.AWS_USE_ENV_CREDENTIALS == 'true') {
        AwsSdkService.credentials = new AWS.Credentials({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
      }

      AwsSdkService.ssmClient = new AWS.SSM({
        region: process.env.AWS_REGION,
        credentials: AwsSdkService.credentials
      });
    }

    return AwsSdkService.ssmClient;
  }

  public async getParameter(name: string, withDecryption = true): Promise<GetParameterResult> {
    return this.getSsmClient().getParameter({
      Name: name,
      WithDecryption: withDecryption
    }).promise();
  }

  public async getCredentials(): Promise<AWS.Credentials | CredentialsOptions> {
    return new Promise(((resolve, reject) => {
      AWS.config.getCredentials((err, credentials) => {
        err ? reject(err) : resolve(credentials);
      });
    }));
  }

  public getJiraToken(): Promise<GetParameterResult> {
    return this.getParameter('/SINCERELY/JIRA_TOKEN');
  }
}
