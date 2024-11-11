import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const email = this.configService.get<string>('linkedin.email');
    const password = this.configService.get<string>('linkedin.password');

    if (!email || !password) {
      throw new UnauthorizedException('LinkedIn credentials not configured');
    }

    return true;
  }
}