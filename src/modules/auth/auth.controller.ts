import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, RequestDeletionDto, CancelDeletionDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with Google ID token' })
  google(@Body('idToken') idToken: string) {
    return this.authService.loginWithGoogle(idToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current user' })
  logout(@Request() req: any) {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@Request() req: any) {
    return req.user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with code' })
  resetPassword(
    @Body('email') email: string,
    @Body('code') code: string,
    @Body('newPassword') newPass: string,
  ) {
    return this.authService.resetPassword(email, code, newPass);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  verifyEmail(@Body('email') email: string) {
    return this.authService.verifyEmail(email);
  }

  @Post('request-deletion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request account deletion (72h grace period)' })
  requestDeletion(@Body() dto: RequestDeletionDto) {
    this.logger.log(`POST /api/auth/request-deletion received for email: ${dto.email}`);
    return this.authService.requestDeletion(dto);
  }

  @Post('cancel-deletion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pending account deletion request' })
  cancelDeletion(@Body() dto: CancelDeletionDto) {
    this.logger.log(`POST /api/auth/cancel-deletion received for email: ${dto.email}`);
    return this.authService.cancelDeletion(dto);
  }

  @Post('deletion-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get deletion status for an account' })
  deletionStatus(@Body('email') email: string) {
    this.logger.log(`POST /api/auth/deletion-status received for email: ${email}`);
    return this.authService.getDeletionStatus(email);
  }
}
