import express from 'express';
import prisma from '../prismaClient.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware.js';
import { createProduct, approveProduct, deleteProduct, getPublishedProducts, rejectProduct } from '../services/product.service.js';
import { cameraUploadMiddleware } from '../middlewares/upload.middleware.js';
import { createProductSchema } from '../validators/product.validator.js';
import { Message } from '../enum/message.js';
import multer from 'multer';
import path from 'path';


const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Approuver un produit (admin)
router.post('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await approveProduct(parseInt(req.params.id));
        res.json({ message: Message.PRODUCT_APPROVED, product });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Rejeter un produit (admin)
router.post('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await rejectProduct(parseInt(req.params.id));
        res.json({ message: 'Produit rejeté', product });
    } catch (err) {
        console.error('Error rejecting product:', err);
        res.status(400).json({ error: err.message });
    }
});

// Supprimer un produit
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await deleteProduct(parseInt(req.params.id));
        res.json({ message: Message.PRODUCT_DELETED, product });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Lister produits publiés (tous)
router.get('/published', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                status: 'published'
            },
            include: {
                images: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json(products);
    } catch (error) {
        console.error('Error fetching published products:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

// Lister produits du vendeur connecté
router.get('/seller', authMiddleware, async (req, res) => {
    try {
        console.log('Fetching products for seller:', req.user.id);
        const products = await prisma.product.findMany({
            where: { sellerId: req.user.id },
            include: { 
                images: true,
                seller: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        console.log(`Found ${products.length} products for seller ${req.user.id}`);
        res.json(products);
    } catch (err) {
        console.error('Error fetching seller products:', err);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des produits',
            details: err.message 
        });
    }
});

// Lister produits en attente (admin)
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { status: 'pending' },
            include: { images: true, seller: true }
        });
        res.json(products);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Statistiques des produits (admin)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalProducts = await prisma.product.count();
        const pendingProducts = await prisma.product.count({ where: { status: 'pending' } });
        const approvedProducts = await prisma.product.count({ where: { status: 'published' } });
        const rejectedProducts = await prisma.product.count({ where: { status: 'deleted' } });
        res.json({ totalProducts, pendingProducts, approvedProducts, rejectedProducts });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Créer un produit (vendeur)
router.post('/create', authMiddleware, upload.array('images'), async (req, res) => {
    try {
        console.log('Received request:', {
            body: req.body,
            files: req.files,
            user: req.user
        });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Au moins une image est requise' });
        }

        const { title, description, price } = req.body;

        if (!title || !description || !price) {
            return res.status(400).json({ 
                error: 'Tous les champs sont requis',
                received: { title, description, price }
            });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const images = req.files.map(file => ({
            url: `${baseUrl}/uploads/${file.filename}`,
            filename: file.filename,
            capturedAt: new Date().toISOString()
        }));

        const product = await createProduct({
            title,
            description,
            price: parseFloat(price),
            sellerId: req.user.id,
            images
        });

        res.status(201).json({ 
            message: 'Produit créé avec succès',
            product 
        });
    } catch (err) {
        console.error('Product creation error:', err);
        res.status(400).json({ 
            error: err.message,
            details: err.stack
        });
    }
});

// Search published products
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 3) {
      return res.status(400).json({ error: 'Search term must be at least 3 characters long' });
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'published',
        OR: [
          {
            title: {
              contains: q
            }
          },
          {
            description: {
              contains: q
            }
          }
        ]
      },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(req.params.id)
      },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
