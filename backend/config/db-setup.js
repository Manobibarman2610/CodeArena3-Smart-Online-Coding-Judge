'use strict';

/**
 * CODE ARENA — Automated Database Initialization & Seeding Script
 * Run: node config/db-setup.js or npm run db:setup
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function setupDatabase() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║        🚀  CODE ARENA DATABASE INITIALIZATION  🚀         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const host     = process.env.DB_HOST     || 'localhost';
  const port     = process.env.DB_PORT     || 3306;
  const user     = process.env.DB_USER     || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName   = process.env.DB_NAME     || 'codearena';

  console.log(`📡 Connecting to MySQL Server at ${host}:${port} as user '${user}'...`);

  let rootConn;
  try {
    rootConn = await mysql.createConnection({ host, port, user, password });
    console.log('✅ Connected to MySQL server successfully.');
  } catch (err) {
    console.error('❌ Failed to connect to MySQL server:', err.message);
    console.error('   Please ensure MySQL service is running and credentials in backend/.env are correct.');
    process.exit(1);
  }

  try {
    console.log(`\n1️⃣ Ensuring database '${dbName}' exists...`);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${dbName}' is ready.`);
  } catch (err) {
    console.error(`❌ Failed to create database '${dbName}':`, err.message);
    process.exit(1);
  } finally {
    await rootConn.end();
  }

  let dbConn;
  try {
    console.log(`\n2️⃣ Applying database schema from schema.sql...`);
    dbConn = await mysql.createConnection({
      host, port, user, password, database: dbName, multipleStatements: true
    });

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');

    await dbConn.query(schemaSql);
    console.log('✅ Database schema created successfully (16 tables + indexes).');
  } catch (err) {
    console.error('❌ Failed to apply database schema:', err.message);
    process.exit(1);
  } finally {
    if (dbConn) await dbConn.end();
  }

  console.log(`\n3️⃣ Populating seed data (Users, Problems, Contests, Assignments, Achievements)...`);
  try {
    execSync('node config/seed.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  } catch (err) {
    console.error('⚠️ Warning: seed.js returned non-zero status:', err.message);
  }

  console.log(`\n4️⃣ Populating 150 Practice Programs (5 Languages: C, C++, Java, Python, JS)...`);
  try {
    execSync('node config/seed_practice.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  } catch (err) {
    console.error('⚠️ Warning: seed_practice.js returned non-zero status:', err.message);
  }

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   ✨ CODE ARENA DATABASE SETUP COMPLETED SUCCESSFULLY! ✨  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
}

setupDatabase();
