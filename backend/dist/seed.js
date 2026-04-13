"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
    synchronize: true,
});
async function seed() {
    await AppDataSource.initialize();
    console.log('Database connected');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await AppDataSource.query(`
    INSERT INTO users (email, password, first_name, last_name, role, is_active)
    VALUES 
    ('admin@carelink.uz', '${hashedPassword}', 'Admin', 'CareLink', 'ADMIN', true),
    ('shifokor@carelink.uz', '${hashedPassword}', 'Jasur', 'Karimov', 'FAMILY_DOCTOR', true),
    ('hamshira@carelink.uz', '${hashedPassword}', 'Malika', 'Yusupova', 'NURSE', true)
    ON CONFLICT (email) DO NOTHING;
  `);
    console.log('Users done');
    await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS patient (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      "medId" VARCHAR UNIQUE,
      "firstName" VARCHAR,
      "lastName" VARCHAR,
      diagnosis VARCHAR,
      "riskLevel" VARCHAR DEFAULT 'MEDIUM',
      phone VARCHAR,
      address VARCHAR,
      "createdAt" TIMESTAMP DEFAULT now(),
      "updatedAt" TIMESTAMP DEFAULT now()
    );
    INSERT INTO patient ("medId", "firstName", "lastName", diagnosis, "riskLevel", phone, address)
    VALUES 
    ('MED-001', 'Akbar', 'Toshmatov', 'Yurak yetishmovchiligi', 'HIGH', '+998901234567', 'Toshkent'),
    ('MED-002', 'Gulnora', 'Rahimova', 'Qandli diabet', 'MEDIUM', '+998901234568', 'Toshkent'),
    ('MED-003', 'Sardor', 'Nazarov', 'Gipertoniya', 'HIGH', '+998901234569', 'Toshkent')
    ON CONFLICT ("medId") DO NOTHING;
  `);
    console.log('Patients done');
    await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY,
      userid UUID,
      title VARCHAR,
      message VARCHAR,
      type VARCHAR,
      isread BOOLEAN DEFAULT false,
      createdat TIMESTAMP DEFAULT NOW()
    );
  `);
    console.log('Notifications table done');
    await AppDataSource.destroy();
    console.log('Done!');
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map