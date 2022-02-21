import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';

const TEST_KEY = 'testKey';
const USER_ID = 1;

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'mock-jwt-token'),
    verify: jest.fn(() => ({
      id: USER_ID,
    })),
  };
});

describe('Jwt Service', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            privateKey: TEST_KEY,
          },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('return jwt token', async () => {
      const token = service.sign(USER_ID);

      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: USER_ID,
        },
        TEST_KEY,
      );
    });
  });

  describe('verify', () => {
    it('should return the decoded token', async () => {
      const decodedToken = service.verify('mock-jwt-token');

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith('mock-jwt-token', TEST_KEY);
      expect(decodedToken).toMatchObject({
        id: USER_ID,
      });
    });
  });
});
