import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { authMiddleware, adminMiddleware } from './middlewares/auth.middleware.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';

const app = express();
app.use(cors({
  origin: ['http://localhost:4200'],
  credentials: true
}));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);

app.get('/admin/dashboard', authMiddleware, adminMiddleware, (req, res) => {
    res.json({ message: 'Bienvenue Admin !' });
});

app.listen(3000, () => console.log('🚀 Backend démarré sur http://localhost:3000'));


process.on('uncaughtException', (err) => {
  
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
