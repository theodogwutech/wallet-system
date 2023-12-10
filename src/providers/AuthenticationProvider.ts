import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import Users from 'src/users/model/Users';

export class AuthenticationProvider {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static async generateJWT(user: Users): Promise<string> {
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  static async verifyJWT(token: string): Promise<any> {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}
