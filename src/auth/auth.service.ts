import { 
  Body, 
  ConflictException, 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException, 
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { RoleService } from '../role/role.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService
  ){
    
  }
  async register(
    @Body() {name, email, password, role}: RegisterDto
  ) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
  
      const existingRole = await this.roleService.findByName(role);
      if (!existingRole) {
        throw new NotFoundException('Role not found');
      }

      try{
       const user = await this.usersService.create({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: existingRole
      });
      
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }


  } 

 async login(
  @Body() {email, password}: LoginDto
 ) {
    const user = await this.usersService.findByEmail(email);
 
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role['name']
  };

  
  const token = await this.jwtService.signAsync(payload);

  return {
    access_token: token,
    user
  };
  } 

  async profile(
    {email, role}: {email: string, role: string}
  ) {
   return await this.usersService.findByEmail(email);
  }
}
