import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

const API_KEY = 'apiKey';
const DOMAIN_NAME = 'domainName';
const FROM_EMAIL = 'fromEmail';

jest.mock('got', () => {});

jest.mock('form-data', () => {
  return {
    append: jest.fn(),
  };
});

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

      jest.spyOn(service, 'sendEmail').mockImplementation();
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
});
