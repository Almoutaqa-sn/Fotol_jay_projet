import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js'; // ton client Prisma
import dotenv from 'dotenv';
import { Message } from '../enum/message.js';

dotenv.config();

// Hasher le mot de passe
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Vérifier le mot de passe
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// Générer un token JWT
export function generateToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

// Créer un utilisateur (admin ou vendeur)
export async function registerUser({ name, email, phone, password, role = "seller" }) {
    const hashedPassword = await hashPassword(password);
    return prisma.user.create({
        data: {
            name,
            email,
            phone,
            password: hashedPassword,
            role
        }
    });
}


export async function loginUser({ email, password }) {
    console.log('Looking for user with email:', email);
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('User found:', user ? 'yes' : 'no');
    if (!user) throw new Error(Message.USER_NOT_FOUND);
    const isValid = await comparePassword(password, user.password);
    console.log('Password valid:', isValid);
    if (!isValid) throw new Error(Message.INVALID_CREDENTIALS);
    const token = generateToken(user);
    return { user, token };
}
