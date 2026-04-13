import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(private dataSource: DataSource) {}

  async findAll() {
    try {
      const result = await this.dataSource.query(
        'SELECT * FROM active_call ORDER BY createdat DESC',
      );
      return result;
    } catch (error) {
      console.error('Error fetching calls:', error.message);
      return [];
    }
  }

  async updateStatus(id: string, status: string) {
    await this.dataSource.query(
      `UPDATE active_call SET status = $1, updatedat = NOW() WHERE id = $2`,
      [status, id],
    );
    return { success: true };
  }

  @Cron('*/5 * * * *')
  async checkOverdueCalls() {
    this.logger.log('Checking for overdue calls...');

    try {
      // Update overdue calls
      await this.dataSource.query(`
        UPDATE active_call 
        SET status = 'OVERDUE', updatedat = NOW()
        WHERE status NOT IN ('COMPLETED', 'OVERDUE') 
        AND duedate < NOW()
      `);

      // Get all overdue calls
      const overdueCalls = await this.dataSource.query(`
        SELECT * FROM active_call WHERE status = 'OVERDUE'
      `);

      if (overdueCalls.length === 0) {
        this.logger.log('No overdue calls found');
        return;
      }

      this.logger.warn(`Found ${overdueCalls.length} overdue call(s)`);

      // Send notifications to ADMIN users
      for (const call of overdueCalls) {
        await this.dataSource.query(`
          INSERT INTO notifications (id, userid, title, message, type, isread, createdat)
          SELECT gen_random_uuid(), u.id, 'Kechikkan chaqiruv!', 
          'Bemor ' || $1 || ' uchun 24 soat o''tdi!', 'OVERDUE_ALERT', false, NOW()
          FROM users u WHERE u.role = 'ADMIN'
          ON CONFLICT DO NOTHING
        `, [call.patientname]);
      }

      this.logger.log(`Notifications sent for ${overdueCalls.length} overdue call(s)`);
    } catch (error) {
      this.logger.error('Error checking overdue calls:', error.message);
    }
  }
}
