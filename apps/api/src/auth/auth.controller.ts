import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Iniciar login com Google' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback do Google OAuth' })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    
    const frontendUrl = process.env.APP_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${result.access_token}`,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter usuário atual' })
  async getMe(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      organizations: user.organizations?.map((uo: any) => ({
        id: uo.organization.id,
        name: uo.organization.name,
        slug: uo.organization.slug,
        role: uo.role,
      })),
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  async logout(@Res() res: Response) {
    res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login com email' })
  async loginWithEmail(@Body() body: { email: string }) {
    return this.authService.loginWithEmail(body.email);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async register(@Body() body: { name: string; email: string; company?: string }) {
    return this.authService.register(body);
  }
}
