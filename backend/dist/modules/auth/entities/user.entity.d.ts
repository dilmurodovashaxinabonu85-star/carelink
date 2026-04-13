import { Role } from '../enums/role.enum';
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
