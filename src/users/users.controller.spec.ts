import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUserService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUserService = {
      findOne: (id: number) => {
        return Promise.resolve({id, email: 'asas@sd.pl', password: 'ssas'} as User)
      },
      find: (email: string) => {
        return Promise.resolve([{id: 121, email, password: 'sasas'}] as User[])
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      signIn: (email: string, password: string) => {
        return Promise.resolve({id: 1, email, password} as User)
      },
      // signUp: () => {},
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUser returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('asdf@asdf.com')
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('asdf@asdf.com');
  });

  it('findAllUse returns a single user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUserService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns a user', async () => {
    const session = {userId: -10};
    const user = await controller.signin(
      {email: 'sasa@x.pl', password: 'asasas'},
      session
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
