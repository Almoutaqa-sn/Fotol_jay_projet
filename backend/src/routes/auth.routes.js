import express from 'express';
import { registerUser, loginUser } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { Message } from '../enum/message.js';

const router = express.Router();


router.post('/register', async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const user = await registerUser(validatedData);
        res.json({ message: Message.USER_CREATED, user });
    } catch (err) {
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: Message.INVALID_DATA, details: err.errors });
        }
        res.status(400).json({ error: err.message });
    }
});


router.post('/login', async (req, res) => {
    
    
    try {
        console.log('Login request body:', req.body);
        const validatedData = loginSchema.parse(req.body);
        console.log('Validated data:', validatedData);
        const { user, token } = await loginUser(validatedData);
        res.json({ message: Message.LOGIN_SUCCESSFUL, user, token });
    } catch (err) {
        console.error('Login error:', err);
        if (err.name === 'ZodError') {
            return res.status(400).json({ error: Message.INVALID_DATA, details: err.errors });
        }
        res.status(400).json({ error: err.message });
    }
});

export default router;
