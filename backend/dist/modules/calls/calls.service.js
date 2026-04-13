"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CallsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
let CallsService = CallsService_1 = class CallsService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(CallsService_1.name);
    }
    async findAll() {
        try {
            const result = await this.dataSource.query('SELECT * FROM active_call ORDER BY createdat DESC');
            return result;
        }
        catch (error) {
            console.error('Error fetching calls:', error.message);
            return [];
        }
    }
    async updateStatus(id, status) {
        await this.dataSource.query(`UPDATE active_call SET status = $1, updatedat = NOW() WHERE id = $2`, [status, id]);
        return { success: true };
    }
    async checkOverdueCalls() {
        this.logger.log('Checking for overdue calls...');
        try {
            await this.dataSource.query(`
        UPDATE active_call 
        SET status = 'OVERDUE', updatedat = NOW()
        WHERE status NOT IN ('COMPLETED', 'OVERDUE') 
        AND duedate < NOW()
      `);
            const overdueCalls = await this.dataSource.query(`
        SELECT * FROM active_call WHERE status = 'OVERDUE'
      `);
            if (overdueCalls.length === 0) {
                this.logger.log('No overdue calls found');
                return;
            }
            this.logger.warn(`Found ${overdueCalls.length} overdue call(s)`);
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
        }
        catch (error) {
            this.logger.error('Error checking overdue calls:', error.message);
        }
    }
};
exports.CallsService = CallsService;
__decorate([
    (0, schedule_1.Cron)('*/5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CallsService.prototype, "checkOverdueCalls", null);
exports.CallsService = CallsService = CallsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], CallsService);
//# sourceMappingURL=calls.service.js.map