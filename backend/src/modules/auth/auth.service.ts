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

  static register(username: string, password: string) {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername || password.length < 4) {
      throw new Error('Username tidak boleh kosong dan Password minimal 4 karakter');
    }

    // Check if username already exists
    const existing = db.prepare('SELECT id FROM accounts WHERE LOWER(username) = ?').get(normalizedUsername);
    if (existing) {
      throw new Error('Username sudah digunakan');
    }

    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(password, salt);
    const passwordHash = `${salt}:${hash}`;

    db.transaction(() => {
      // Create auth account
      db.prepare('INSERT INTO accounts (id, username, password_hash) VALUES (?, ?, ?)').run(
        id,
        username,
        passwordHash
      );

      // Initialize game stats in the users table via UserService.getUser
      // This creates the corresponding user record automatically!
      UserService.getUser(id);
      
      // Update name to match the registered username (instead of 'Explorer')
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(username, id);
    })();

    return { id, username };
  }

  static login(username: string, password: string) {
    const normalizedUsername = username.trim().toLowerCase();
    const account: any = db.prepare('SELECT * FROM accounts WHERE LOWER(username) = ?').get(normalizedUsername);
    
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

  static loginAsGuest() {
    const randSuffix = crypto.randomBytes(3).toString('hex');
    const guestUsername = `Guest_${randSuffix}`;
    const id = `guest_${randSuffix}`;
    
    // We create a dummy account for guest to prevent constraint violations
    const salt = crypto.randomBytes(16).toString('hex');
    const dummyPasswordHash = `${salt}:${crypto.randomUUID()}`;

    db.transaction(() => {
      db.prepare('INSERT INTO accounts (id, username, password_hash) VALUES (?, ?, ?)').run(
        id,
        guestUsername,
        dummyPasswordHash
      );

      UserService.getUser(id);
      db.prepare('UPDATE users SET name = ?, title = ? WHERE id = ?').run(
        guestUsername,
        'Guest Operative',
        id
      );
    })();

    const token = JwtUtil.sign({ id, username: guestUsername });
    return { id, username: guestUsername, token };
  }
}
