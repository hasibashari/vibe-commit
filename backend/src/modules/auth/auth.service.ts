import db from '../../db/database.js';
import crypto from 'node:crypto';
import { UserService } from '../user/user.service.js';
import { JwtUtil } from './jwt.util.js';

export class AuthService {
  // Hash password using PBKDF2 with SHA-512 for secure, native, zero-dependency hashing
  static hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  static verifyPassword(password: string, storedValue: string): boolean {
    const parts = storedValue.split(':');
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const inputHash = this.hashPassword(password, salt);
    return hash === inputHash;
  }

  static async register(username: string, password: string) {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername || password.length < 4) {
      throw new Error('Username tidak boleh kosong dan Password minimal 4 karakter');
    }

    // Check if username already exists
    const existingRes = await db.query('SELECT id FROM accounts WHERE LOWER(username) = $1', [normalizedUsername]);
    const existing = existingRes.rows[0];
    if (existing) {
      throw new Error('Username sudah digunakan');
    }

    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(password, salt);
    const passwordHash = `${salt}:${hash}`;

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      // Create auth account
      await client.query('INSERT INTO accounts (id, username, password_hash) VALUES ($1, $2, $3)', [
        id,
        username,
        passwordHash
      ]);

      // Initialize game stats in the users table via UserService.getUser
      // This creates the corresponding user record automatically!
      await UserService.getUser(id, client);
      
      // Update name to match the registered username (instead of 'Explorer')
      await client.query('UPDATE users SET name = $1 WHERE id = $2', [username, id]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return { id, username };
  }

  static async login(username: string, password: string) {
    const normalizedUsername = username.trim().toLowerCase();
    const accountRes = await db.query('SELECT * FROM accounts WHERE LOWER(username) = $1', [normalizedUsername]);
    const account: any = accountRes.rows[0];
    
    if (!account) {
      throw new Error('Username atau Password salah');
    }

    const isValid = this.verifyPassword(password, account.password_hash);
    if (!isValid) {
      throw new Error('Username atau Password salah');
    }

    const token = JwtUtil.sign({ id: account.id, username: account.username });
    return { id: account.id, username: account.username, token };
  }

  static async loginAsGuest() {
    const randSuffix = crypto.randomBytes(3).toString('hex');
    const guestUsername = `Guest_${randSuffix}`;
    const id = `guest_${randSuffix}`;
    
    // We create a dummy account for guest to prevent constraint violations
    const salt = crypto.randomBytes(16).toString('hex');
    const dummyPasswordHash = `${salt}:${crypto.randomUUID()}`;

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      await client.query('INSERT INTO accounts (id, username, password_hash) VALUES ($1, $2, $3)', [
        id,
        guestUsername,
        dummyPasswordHash
      ]);

      await UserService.getUser(id, client);
      await client.query('UPDATE users SET name = $1, title = $2 WHERE id = $3', [
        guestUsername,
        'Guest Operative',
        id
      ]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const token = JwtUtil.sign({ id, username: guestUsername });
    return { id, username: guestUsername, token };
  }
}
