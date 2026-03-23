import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAccessTokenGuard } from './guards/jwt-access-token/jwt-access-token.guard';
import { Request } from 'express';
import { RequestWithUser } from './interfaces/interfaces';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }
  /**
   * Login with credentials and returns an access token
   * @param loginDto : email and password
   * 
   */
  @Post('login')
  @ApiOperation({ summary: 'Log in with credentials' })
  @ApiBody({
    description: 'Login credentials',
    type: LoginDto
  })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully. Returns an access token',
    schema: {
      example: {
        accessToken: 'jwt-access-token-example',
        user: {
          email: 'user@example.com',
          role: 'admin'
        }
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials'
  })
  async login(
    @Body() loginDto: LoginDto
  ) {
    return await this.authService.login(loginDto);
  }

  /**
  * Register a new user
  * @param registerDto : name,email, password and role
  */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    description: 'Data required to register a new user',
    type: RegisterDto
  })
  @ApiResponse({
    status: 200,
    description: 'User registered successfully',
    schema: {
      example: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'admin'
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(
    @Body() registerDto: RegisterDto
  ) {
    return await this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAccessTokenGuard)
  profile(
    @Req() req: RequestWithUser
  ) {
    return this.authService.profile({
      email: req.user.email,
      role: req.user.role
    });
  }
}
