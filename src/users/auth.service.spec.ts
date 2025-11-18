import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUserService: Partial<UsersService>;

beforeEach(async () => {
        const users: User[] = [];

        fakeUserService = {
                find: (email: string) => {
                    const filteredUsers = users.filter(user => user.email === email);
                    return Promise.resolve(filteredUsers);
                },
                create: (email: string, password: string) => {
                    const user = ({id: Math.floor(Math.random() * 9999), email,password} as User);
                    users.push(user);
                    return Promise.resolve(user);
                }
        }

        const module = await Test.createTestingModule({
            providers: [
                AuthService, 
                {
                    provide: UsersService,
                    useValue: fakeUserService
                }
            ]
        }).compile();

        //DI Container crate an instance of AuthService with dependencies
        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        //Create a fake copy of the users service
        expect(service).toBeDefined();
    })

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signUp('asa@sas.pl','asdasdas');

        expect(user.password).not.toEqual('asdasdas');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    })

    it('throws an error if user signs up with email that is in use', async () => {
        // fakeUserService.find = () =>
        //     Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
        await service.signUp('asdf@asdf.com', 'asdf');

          await expect(service.signUp('asdf@asdf.com', 'asdf')).rejects.toThrow(
            BadRequestException,
          );

      });

      it('throws if signin is called with an unused email', async () => {
        await expect(
          service.signIn('asdflkj@asdlfkj.com', 'passdflkj'),
        ).rejects.toThrow(NotFoundException);
      });
    
      it('throws if an invalid password is provided', async () => {
        // fakeUserService.find = () =>
        //   Promise.resolve([
        //     { email: 'asdf@asdf.com', password: 'laskdjf' } as User,
        //   ]);
          await service.signUp('laskdjf@alskdfj.com', 'password');
        await expect(
          service.signIn('laskdjf@alskdfj.com', 'passowrd'),
        ).rejects.toThrow(BadRequestException);
      });

      it('sign in with correct email and password', async () => {
        await service.signUp('cos@pl.pl', 'haslo');
       
        const user = await service.signIn('cos@pl.pl', 'haslo');
        expect(user).toBeDefined();
      });
})
