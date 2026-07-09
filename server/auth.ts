import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'ai_mock_platform_jwt_ultra_secret_key_2026';

/**
 * Creates and signs a standard JWT token (Header.Payload.Signature) with HS256 HMAC.
 */
export function signToken(payload: { id: string; email: string; role: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  
  // Set expiration to 7 days from now
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
  const encodedPayload = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64url');
    
  return `${signatureInput}.${signature}`;
}

/**
 * Verifies a JWT token signature and checks for expiration. Returns the payload or null.
 */
export function verifyToken(token: string): { id: string; email: string; role: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    
    // Check if token has expired
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
