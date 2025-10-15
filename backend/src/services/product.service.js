import prisma from '../prismaClient.js';
import { sendNotification } from './notification.service.js'; // à créer pour gérer notifications

// Créer un produit (status = pending)
export async function createProduct({ sellerId, title, description, price, images }) {
    const product = await prisma.product.create({
        data: {
            sellerId,
            title,
            description,
            price,
            status: 'pending',
            images: {
                create: images.map(img => ({
                    url: img.url,
                    filename: img.filename,
                    capturedAt: img.capturedAt
                }))
            }
        },
        include: { images: true }
    });
    return product;
}

// Approuver un produit (admin)
export async function approveProduct(productId) {
    const approvedAt = new Date();
    const publishedAt = new Date();
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    const product = await prisma.product.update({
        where: { id: productId },
        data: { status: 'published', approvedAt, publishedAt, expireAt }
    });

    // Notification 24h avant expiration
    scheduleExpirationNotification(product);

    return product;
}

// Supprimer ou marquer produit comme deleted
export async function deleteProduct(productId) {
    return prisma.product.update({
        where: { id: productId },
        data: { status: 'deleted' }
    });
}

// Rejeter un produit
export async function rejectProduct(productId) {
    return prisma.product.update({
        where: { id: productId },
        data: { 
            status: 'deleted',
            rejectedAt: new Date()
        }
    });
}

// Récupérer tous les produits publiés
export async function getPublishedProducts() {
    return prisma.product.findMany({
        where: { status: 'published' },
        include: { images: true, seller: true }
    });
}

// Scheduler 24h avant expiration
import { scheduleNotification } from '../utils/scheduler.js';
function scheduleExpirationNotification(product) {
    const notifTime = new Date(product.expireAt.getTime() - 24*60*60*1000);
    scheduleNotification(notifTime, async () => {
        await sendNotification(product.sellerId, 'expiration', { productId: product.id, title: product.title });
    });
}
