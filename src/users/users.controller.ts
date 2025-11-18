import { Body, Controller, Post, Get, Patch, Param, Query, Delete, NotFoundException, Session, BadRequestException, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { CurrentUser } from './decorators/current-user.decorator';
// import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
// import { AuthGuard } from '../../src/guards/auth.guard';
import { AuthGuard } from '../guards/auth.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
// import { Serialize } from '../../src/interceptors/serialize.interceptor';
@Serialize(UserDto)
@Controller('auth')
// @UseInterceptors(CurrentUserInterceptor)
export class UsersController {
    constructor(
        private userService: UsersService,
        private authService: AuthService
    ) {}

    // @Get('/whoami')
    // whoAmI(@Session() session: any) {
    //     const userEnity = this.userService.findOne(session.userId);
    //     if (!userEnity) throw new BadRequestException('you are logged out');

    //     return userEnity
    // }

    @Get('/whoami')
    @UseGuards(AuthGuard)
    whoAmI(@CurrentUser() user: User) {
        return user;
    }

    // @Get('/colors')
    // getColor(@Session() session: any) {
    //     return session.color;
    // }

    // @Get('/colors/:color')
    // setColor(@Param('color') color: string, @Session() session: any) {
    //     session.color = color;
    // }

    @Post('/signup')
    async createUser(@Body() body: CreateUserDto, @Session() session: any) {
        // this.userService.create(body.email, body.password);
         const userEnity = await this.authService.signUp(body.email, body.password);
         session.userId = userEnity.id;
         return userEnity;
    }

    @Post('/signin')
    async signin(@Body() body: CreateUserDto, @Session() session: any) {
        // this.userService.create(body.email, body.password);
         const userEnity = await this.authService.signIn(body.email, body.password);
         session.userId = userEnity.id;
         return userEnity;
    }

    @Post('/signout')
    async signout(@Session() session: any) {
        session.userId = null;
    }

    // @UseInterceptors(new SerializeInterceptor(UserDto))
    // @Serialize(UserDto)
    @Get('/:id')
    async findUser(@Param('id') id: string) {
        console.log("hanlder is running");
        const user = await this.userService.findOne(parseInt(id));
        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    @Get()
    findAllUsers(@Query('email') email: string) {
        return this.userService.find(email);
    }

    @Delete('/:id')
    removeUser(@Param('id') id: string) {
        return this.userService.remove(parseInt(id));
    }

    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.userService.update(parseInt(id), body);
    }
}
