import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "hono/cookie";
import { 
  CreateTicketSchema, 
  TicketStatusSchema,
  User
} from "@/shared/types";
import z from "zod";

// Extend Env interface
interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

// Extend Hono context
declare module 'hono' {
  interface ContextVariableMap {
    user?: User;
  }
}

const app = new Hono<{ Bindings: Env }>();

// JWT Configuration
const JWT_COOKIE_NAME = 'auth_token';

// Web Crypto API utilities for Cloudflare Workers
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

async function createJWT(payload: any, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + (7 * 24 * 60 * 60); // 7 days

  const jwtPayload = {
    ...payload,
    iat: now,
    exp: exp
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(jwtPayload)).replace(/[+/]/g, c => c === '+' ? '-' : '_').replace(/=/g, '');
  
  const signatureInput = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/[+/]/g, c => c === '+' ? '-' : '_')
    .replace(/=/g, '');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function verifyJWT(token: string, secret: string): Promise<any> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  
  // Verify signature
  const encoder = new TextEncoder();
  const signatureInput = `${headerB64}.${payloadB64}`;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signature = Uint8Array.from(
    atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(signatureB64.length + (4 - signatureB64.length % 4) % 4, '=')),
    c => c.charCodeAt(0)
  );

  const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(signatureInput));
  
  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // Decode payload
  const payload = JSON.parse(
    atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(payloadB64.length + (4 - payloadB64.length % 4) % 4, '='))
  );

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const token = getCookie(c, JWT_COOKIE_NAME);
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET || JWT_SECRET);
    const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(payload.userId).first();
    
    if (!user || !user.is_active) {
      return c.json({ error: 'User not found or inactive' }, 401);
    }
    
    c.set('user', user as User);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// Enable CORS
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ============= AUTH ENDPOINTS =============

// Register new user
app.post("/api/auth/register", zValidator('json', z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  role: z.enum(['korisnik', 'tehnicar', 'administracija']).default('korisnik')
})), async (c) => {
  const { email, password, full_name, role } = c.req.valid('json');

  try {
    // Check if user already exists
    const existingUser = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    
    if (existingUser) {
      return c.json({ error: "Korisnik s tim e-mailom već postoji" }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate user ID
    const userId = crypto.randomUUID();

    // Create user
    await c.env.DB.prepare(`
      INSERT INTO users (id, email, full_name, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).bind(userId, email, full_name, passwordHash, role).run();

    // Create JWT token
    const token = await createJWT({ userId }, c.env.JWT_SECRET || JWT_SECRET);
    
    // Set cookie
    setCookie(c, JWT_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    const user = await c.env.DB.prepare("SELECT id, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = ?").bind(userId).first();
    
    return c.json({ user }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: "Greška pri registraciji" }, 500);
  }
});

// Login user
app.post("/api/auth/login", zValidator('json', z.object({
  email: z.string().email(),
  password: z.string().min(1)
})), async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    // Find user
    const user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first() as any;
    
    if (!user || !user.is_active) {
      return c.json({ error: "Neispravni podaci za prijavu" }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return c.json({ error: "Neispravni podaci za prijavu" }, 401);
    }

    // Create JWT token
    const token = await createJWT({ userId: user.id }, c.env.JWT_SECRET || JWT_SECRET);
    
    // Set cookie
    setCookie(c, JWT_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: "Greška pri prijavi" }, 500);
  }
});

// Get current user
app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const { password_hash, ...userWithoutPassword } = user as any;
  return c.json(userWithoutPassword);
});

// Logout
app.post('/api/auth/logout', async (c) => {
  setCookie(c, JWT_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true });
});

// ============= LOCATIONS ENDPOINTS =============

app.get("/api/locations", authMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM locations WHERE is_active = 1 ORDER BY name"
  ).all();

  return c.json(results);
});

app.post("/api/locations", authMiddleware, zValidator('json', z.object({
  name: z.string().min(1),
  address: z.string().optional()
})), async (c) => {
  const user = c.get("user")!;

  if (user.role !== 'administracija') {
    return c.json({ error: "Nemate dozvolu za ovu akciju" }, 403);
  }

  const { name, address } = c.req.valid('json');

  const result = await c.env.DB.prepare(`
    INSERT INTO locations (name, address, is_active, created_at, updated_at)
    VALUES (?, ?, 1, datetime('now'), datetime('now'))
  `).bind(name, address || null).run();

  const location = await c.env.DB.prepare(
    "SELECT * FROM locations WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(location, 201);
});

// ============= MACHINES ENDPOINTS =============

app.get("/api/machines", authMiddleware, async (c) => {
  const locationId = c.req.query('location_id');
  
  let query = `
    SELECT m.*, l.name as location_name 
    FROM machines m 
    LEFT JOIN locations l ON m.location_id = l.id 
    WHERE m.is_active = 1
  `;
  
  const params = [];
  if (locationId) {
    query += " AND m.location_id = ?";
    params.push(locationId);
  }
  
  query += " ORDER BY m.machine_id";

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

// ============= TICKETS ENDPOINTS =============

app.get("/api/tickets", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const status = c.req.query('status');
  const urgency = c.req.query('urgency');
  const location_id = c.req.query('location_id');

  let query = `
    SELECT t.*, u.full_name as user_name, u.email as user_email,
           tech.full_name as technician_name, tech.email as technician_email,
           l.name as location_name
    FROM tickets t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN users tech ON t.technician_id = tech.id
    LEFT JOIN locations l ON t.location_id = l.id
    WHERE 1=1
  `;

  const params = [];

  // Role-based filtering
  if (user.role === 'korisnik') {
    query += " AND t.user_id = ?";
    params.push(user.id);
  } else if (user.role === 'tehnicar') {
    query += " AND (t.technician_id = ? OR t.technician_id IS NULL)";
    params.push(user.id);
  }

  // Additional filters
  if (status) {
    query += " AND t.status = ?";
    params.push(status);
  }

  if (urgency) {
    query += " AND t.urgency = ?";
    params.push(urgency);
  }

  if (location_id) {
    query += " AND t.location_id = ?";
    params.push(location_id);
  }

  query += " ORDER BY t.created_at DESC";

  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

app.post("/api/tickets", authMiddleware, zValidator('json', CreateTicketSchema), async (c) => {
  const user = c.get("user")!;
  const ticketData = c.req.valid('json');

  // Generate ticket number
  const ticketNumber = `T${Date.now()}`;

  const result = await c.env.DB.prepare(`
    INSERT INTO tickets (ticket_number, user_id, location_id, machine_id, title, description, status, urgency, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'nova', ?, datetime('now'), datetime('now'))
  `).bind(
    ticketNumber,
    user.id,
    ticketData.location_id,
    ticketData.machine_id,
    ticketData.title,
    ticketData.description,
    ticketData.urgency
  ).run();

  const ticket = await c.env.DB.prepare(`
    SELECT t.*, u.full_name as user_name, u.email as user_email,
           l.name as location_name
    FROM tickets t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN locations l ON t.location_id = l.id
    WHERE t.id = ?
  `).bind(result.meta.last_row_id).first();

  return c.json(ticket, 201);
});

app.get("/api/tickets/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const ticketId = c.req.param('id');

  let query = `
    SELECT t.*, u.full_name as user_name, u.email as user_email,
           tech.full_name as technician_name, tech.email as technician_email,
           l.name as location_name
    FROM tickets t
    LEFT JOIN users u ON t.user_id = u.id
    LEFT JOIN users tech ON t.technician_id = tech.id
    LEFT JOIN locations l ON t.location_id = l.id
    WHERE t.id = ?
  `;

  const params = [ticketId];

  // Role-based access control
  if (user.role === 'korisnik') {
    query += " AND t.user_id = ?";
    params.push(user.id);
  }

  const ticket = await c.env.DB.prepare(query).bind(...params).first();

  if (!ticket) {
    return c.json({ error: "Prijava nije pronađena" }, 404);
  }

  return c.json(ticket);
});

app.put("/api/tickets/:id/status", authMiddleware, zValidator('json', z.object({
  status: TicketStatusSchema
})), async (c) => {
  const user = c.get("user")!;
  const ticketId = c.req.param('id');
  const { status } = c.req.valid('json');

  // Only technicians and admins can change status
  if (user.role === 'korisnik') {
    return c.json({ error: "Nemate dozvolu za ovu akciju" }, 403);
  }

  await c.env.DB.prepare(`
    UPDATE tickets 
    SET status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).bind(status, ticketId).run();

  return c.json({ success: true });
});

app.put("/api/tickets/:id/assign", authMiddleware, zValidator('json', z.object({
  technician_id: z.string()
})), async (c) => {
  const user = c.get("user")!;
  const ticketId = c.req.param('id');
  const { technician_id } = c.req.valid('json');

  // Only technicians can assign to themselves, admins can assign to anyone
  if (user.role === 'tehnicar' && technician_id !== user.id) {
    return c.json({ error: "Možete preuzeti samo vlastite prijave" }, 403);
  } else if (user.role === 'korisnik') {
    return c.json({ error: "Nemate dozvolu za ovu akciju" }, 403);
  }

  await c.env.DB.prepare(`
    UPDATE tickets 
    SET technician_id = ?, status = 'u_tijeku', updated_at = datetime('now')
    WHERE id = ?
  `).bind(technician_id, ticketId).run();

  return c.json({ success: true });
});

// ============= COMMENTS ENDPOINTS =============

app.get("/api/tickets/:id/comments", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const ticketId = c.req.param('id');

  // Check if user has access to this ticket
  const ticket = await c.env.DB.prepare("SELECT user_id, technician_id FROM tickets WHERE id = ?").bind(ticketId).first();
  if (!ticket) {
    return c.json({ error: "Prijava nije pronađena" }, 404);
  }

  // Role-based access control for comments
  let query = `
    SELECT tc.*, u.full_name as user_name
    FROM ticket_comments tc
    LEFT JOIN users u ON tc.user_id = u.id
    WHERE tc.ticket_id = ?
  `;

  if (user.role === 'korisnik') {
    if (ticket.user_id !== user.id) {
      return c.json({ error: "Nemate dozvolu za pristup ovoj prijavi" }, 403);
    }
    query += " AND tc.is_internal = 0"; // Users can't see internal comments
  }

  query += " ORDER BY tc.created_at ASC";

  const { results } = await c.env.DB.prepare(query).bind(ticketId).all();
  return c.json(results);
});

app.post("/api/tickets/:id/comments", authMiddleware, zValidator('json', z.object({
  comment: z.string().min(1),
  is_internal: z.boolean().default(false)
})), async (c) => {
  const user = c.get("user")!;
  const ticketId = c.req.param('id');
  const { comment, is_internal } = c.req.valid('json');

  // Check if user has access to this ticket
  const ticket = await c.env.DB.prepare("SELECT user_id, technician_id FROM tickets WHERE id = ?").bind(ticketId).first();
  if (!ticket) {
    return c.json({ error: "Prijava nije pronađena" }, 404);
  }

  // Users can only comment on their own tickets and can't make internal comments
  if (user.role === 'korisnik') {
    if (ticket.user_id !== user.id) {
      return c.json({ error: "Nemate dozvolu za pristup ovoj prijavi" }, 403);
    }
    if (is_internal) {
      return c.json({ error: "Korisnici ne mogu dodavati interne komentare" }, 403);
    }
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO ticket_comments (ticket_id, user_id, comment, is_internal, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(ticketId, user.id, comment, is_internal ? 1 : 0).run();

  const newComment = await c.env.DB.prepare(`
    SELECT tc.*, u.full_name as user_name
    FROM ticket_comments tc
    LEFT JOIN users u ON tc.user_id = u.id
    WHERE tc.id = ?
  `).bind(result.meta.last_row_id).first();

  return c.json(newComment, 201);
});

export default app;
