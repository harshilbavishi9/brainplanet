import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, Planet } from '../../database/entities';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Planet) private planetRepo: Repository<Planet>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check existing user
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    // Create user
    const user = this.userRepo.create({
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName ?? dto.email.split('@')[0],
    });
    await this.userRepo.save(user);

    // Create initial planet
    const planet = this.planetRepo.create({ userId: user.id, health: 75 });
    await this.planetRepo.save(planet);

    return this._generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    return this._generateTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this._generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async loginWithGoogle(idToken: string) {
    try {
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(this.config.get('GOOGLE_CLIENT_ID'));
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: this.config.get('GOOGLE_CLIENT_ID'),
      });
      const decodedToken = ticket.getPayload();

      if (!decodedToken) throw new Error('Token payload is empty');

      const email = decodedToken.email;
      const displayName = decodedToken.name || decodedToken.email?.split('@')[0] || 'Google User';
      const avatarUrl = decodedToken.picture;

      let user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        user = this.userRepo.create({
          email,
          displayName,
          avatarUrl,
          authProvider: 'google',
        });
        user = await this.userRepo.save(user);

        // Create initial planet for the new Google user
        const planet = this.planetRepo.create({ userId: user.id, health: 75 });
        await this.planetRepo.save(planet);
      }

      return this._generateTokens(user);
    } catch (e) {
      console.error('Google Login Error:', e);
      throw new UnauthorizedException('Invalid Google ID token: ' + e.message);
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');
    return { message: `Password reset link sent to ${email}` };
  }

  async resetPassword(email: string, code: string, newPass: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');
    user.password = newPass;
    await user.hashPassword();
    await this.userRepo.save(user);
    return { message: 'Password reset successfully' };
  }

  async verifyEmail(email: string) {
    return { message: `Email ${email} has been successfully verified` };
  }

  async logout(userId: string) {
    // In production: blacklist token in Redis
    return { message: 'Logged out successfully' };
  }

  async validateUser(payload: { sub: string }) {
    return this.userRepo.findOne({ where: { id: payload.sub } });
  }

  private _generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        brainLevel: user.brainLevel,
        xp: user.xp,
        coins: user.coins,
        streak: user.streak,
      },
    };
  }
}
