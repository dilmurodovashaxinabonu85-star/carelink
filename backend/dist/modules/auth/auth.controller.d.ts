import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("./enums/role.enum").Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
