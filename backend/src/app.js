import express from 'express';
import path from 'path';
import cors from 'cors';

const app = express();

// Configuration de base
app.use(cors());
app.use(express.json());

// Configuration des uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// ...existing middleware and routes...

export default app;