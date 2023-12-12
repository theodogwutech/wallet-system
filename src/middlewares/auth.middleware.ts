import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationProvider } from '../providers/AuthenticationProvider';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization header is required');
    }

    try {
      const decoded = await AuthenticationProvider.verifyJWT(token);

      if (decoded && decoded.id) {
        req.user = decoded;
      }

      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
