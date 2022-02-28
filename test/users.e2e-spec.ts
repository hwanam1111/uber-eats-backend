import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';
const TEST_USER = {
  email: 'dev_email@naver.com',
  password: 'testpassword1',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            createAccount(input: {
              email: "${TEST_USER.email}",
              password: "${TEST_USER.password}",
              role: Client
            }) {
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const { ok, error } = res.body.data.createAccount;
          expect(ok).toBe(true);
          expect(error).toBeNull();
        });
    });

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
            createAccount(input: {
              email: "${TEST_USER.email}",
              password: "${TEST_USER.password}",
              role: Client
            }) {
              ok
              error
            }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const { ok, error } = res.body.data.createAccount;
          expect(ok).toBe(false);
          expect(error).toBe('There is a user with that email already');
        });
    });
  });

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input: { 
                email: "${TEST_USER.email}", 
                password: "${TEST_USER.password}"
              }) {
                error
                ok
                token
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const { ok, error, token } = res.body.data.login;
          expect(ok).toBeTruthy();
          expect(error).toBeNull();
          expect(token).toEqual(expect.any(String));

          jwtToken = token;
        });
    });

    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input: { 
                email: "email@test.com", 
                password: "password"
              }) {
                error
                ok
                token
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const { ok, error, token } = res.body.data.login;
          expect(ok).toBeFalsy();
          expect(error).toBe('User not found');
          expect(token).toBeNull();
        });
    });
  });

  describe('userProfile', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await userRepository.find();
      userId = user.id;
    });

    it("should see a user's profile", () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            query {
              userProfile(userId: ${userId}) {
                ok
                error
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            ok,
            error,
            user: { id },
          } = res.body.data.userProfile;

          expect(ok).toBeTruthy();
          expect(error).toBeNull();
          expect(id).toBe(userId);
        });
    });

    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            query {
              userProfile(userId: 1000) {
                ok
                error
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const { ok, error, user } = res.body.data.userProfile;

          expect(ok).toBeFalsy();
          expect(error).toBe('User Not Found');
          expect(user).toBeNull();
        });
    });

    it('should fail if not verify jwt token', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', '')
        .send({
          query: `
            query {
              userProfile(userId: ${userId}) {
                ok
                error
                user {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const { statusCode, message } =
            res.body.errors[0].extensions.response;

          expect(statusCode).toBe(403);
          expect(message).toBe('Forbidden resource');
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            query {
              me {
                email
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const { email } = res.body.data.me;

          expect(email).toBe(TEST_USER.email);
        });
    });

    it('should not allow logged out user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            query {
              me {
                email
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const { statusCode, message } =
            res.body.errors[0].extensions.response;

          expect(statusCode).toBe(403);
          expect(message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    it('should change email', () => {
      const NEW_EMAIL = 'chagne@email.com';

      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', jwtToken)
        .send({
          query: `
            mutation {
              editProfile(input: {
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const { ok, error } = res.body.data.editProfile;

          expect(ok).toBeTruthy();
          expect(error).toBeNull();
        });
    });
  });

  it.todo('verifyEmail');
});
