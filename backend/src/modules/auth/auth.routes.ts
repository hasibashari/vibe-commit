import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service.js';

const router = Router();

router.post('/register', (req, res, next) => {
  try {
    const schema = z.object({
      username: z.string().min(2, 'Username minimal 2 karakter').max(30, 'Username maksimal 30 karakter'),
      password: z.string().min(4, 'Password minimal 4 karakter')
    });
    const { username, password } = schema.parse(req.body);
    
    const result = AuthService.register(username, password);
    res.json({ success: true, user: result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', (req, res, next) => {
  try {
    const schema = z.object({
      username: z.string(),
      password: z.string()
    });
    const { username, password } = schema.parse(req.body);

    const result = AuthService.login(username, password);
    res.json({ success: true, user: result });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/guest', (req, res, next) => {
  try {
    const result = AuthService.loginAsGuest();
    res.json({ success: true, user: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
