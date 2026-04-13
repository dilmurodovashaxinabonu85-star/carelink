import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("./enums/role.enum").Role;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("./enums/role.enum").Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    hashPassword(password: string): Promise<string>;
}
