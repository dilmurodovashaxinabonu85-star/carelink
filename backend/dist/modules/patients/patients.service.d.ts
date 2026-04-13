import { DataSource } from 'typeorm';
export declare class PatientsService {
    private dataSource;
    constructor(dataSource: DataSource);
    findAll(): Promise<any>;
}
