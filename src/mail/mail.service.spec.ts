import { Test } from '@nestjs/testing';
import * as FormData from 'form-data';
import got from 'got';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

const API_KEY = 'apiKey';
const DOMAIN_NAME = 'domainName';
const FROM_EMAIL = 'fromEmail';

jest.mock('got');
jest.mock('form-data');

describe('Mail Service', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: API_KEY,
            domainName: DOMAIN_NAME,
            fromEmail: FROM_EMAIL,
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);

    process.env = Object.assign(process.env, {
      HOST_URL: 'hostUrl',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: 'test@email.com',
        code: 'code',
      };

      jest.spyOn(service, 'sendEmail').mockImplementation(async () => true);
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        sendVerificationEmailArgs.email,
        'Verify your email',
        'uber-eats-verify-email-account',
        [
          {
            key: 'code',
            value: sendVerificationEmailArgs.code,
          },
          {
            key: 'username',
            value: sendVerificationEmailArgs.email,
          },
          {
            key: 'hostname',
            value: process.env.HOST_URL,
          },
        ],
      );
    });
  });

  describe('send email', () => {
    it('send email', async () => {
      const result = await service.sendEmail('to', 'subject', 'template', [
        { key: 'key', value: 'value' },
      ]);
      const formSpy = jest.spyOn(FormData.prototype, 'append');

      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${DOMAIN_NAME}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`api:${API_KEY}`).toString(
              'base64',
            )}`,
          },
          body: expect.any(Object),
        },
      );

      expect(result).toEqual(true);
    });

    it('fails on error', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });

      const result = await service.sendEmail('to', 'subject', 'template', []);
      expect(result).toEqual(false);
    });
  });
});
