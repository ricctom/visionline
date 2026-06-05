require('dotenv').config();
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const rawUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const dbPath = rawUrl.replace('file:', '');
const absolutePath = path.isAbsolute(dbPath) ? dbPath : path.join(__dirname, '../../', dbPath);
const adapter = new PrismaBetterSqlite3({ url: `file:${absolutePath}` });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
