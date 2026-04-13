import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PatientsService {
  constructor(private dataSource: DataSource) {}

  async findAll() {
    return await this.dataSource.query(
      `SELECT * FROM patient ORDER BY "createdAt" DESC`,
    );
  }
}
