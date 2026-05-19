import crypto from 'node:crypto';

// Use a fallback secret if process.env.JWT_SECRET is not set. In production, this must be set.
const JWT_SECRET = process.env.JWT_SECRET || 'vibe-commit-super-secret-key-12345';

function base64urlEncode(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function base64urlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf8');
}

export class JwtUtil {
  /**
   * Signs a payload into a JWT token using HS256 algorithm.
   */
  static sign(payload: Record<string, any>, expiresInSeconds = 7 * 24 * 60 * 60): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    
    const tokenPayload = { ...payload, exp };
    
    const encodedHeader = base64urlEncode(JSON.stringify(header));
    const encodedPayload = base64urlEncode(JSON.stringify(tokenPayload));
    
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
      
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verifies a JWT token. Returns the decoded payload if valid and unexpired, otherwise null.
   */
  static verify(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const [encodedHeader, encodedPayload, signature] = parts;
      
      // Re-calculate the expected signature
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
        
      if (signature !== expectedSignature) {
        return null;
      }
      
      const payload = JSON.parse(base64urlDecode(encodedPayload));
      
      // Check expiration time
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return null;
      }
      
      return payload;
    } catch {
      return null;
    }
  }
}
