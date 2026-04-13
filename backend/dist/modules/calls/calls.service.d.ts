import { DataSource } from 'typeorm';
export declare class CallsService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    findAll(): Promise<any>;
    updateStatus(id: string, status: string): Promise<{
        success: boolean;
    }>;
    checkOverdueCalls(): Promise<void>;
}
