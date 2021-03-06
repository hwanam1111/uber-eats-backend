import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions, MailVar } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    mailVars?: MailVar[],
  ): Promise<boolean> {
    const { apiKey, domainName } = this.options;
    const form = new FormData();
    form.append('from', `우버이츠 클론코딩 <mailgun@${domainName}>`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);
    mailVars.forEach((mailVar) =>
      form.append(`v:${mailVar.key}`, mailVar.value),
    );

    try {
      await got.post(`https://api.mailgun.net/v3/${domainName}/messages`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString(
            'base64',
          )}`,
        },
        body: form,
      });

      return true;
    } catch (err) {
      // console.log(err);
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail(
      email,
      'Verify your email',
      'uber-eats-verify-email-account',
      [
        {
          key: 'code',
          value: code,
        },
        {
          key: 'username',
          value: email,
        },
        {
          key: 'hostname',
          value: process.env.HOST_URL,
        },
      ],
    );
  }
}
