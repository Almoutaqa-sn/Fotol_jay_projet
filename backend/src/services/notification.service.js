import prisma from '../prismaClient.js';

// Envoyer une notification à un utilisateur
export async function sendNotification(userId, type, payload) {
    return prisma.notification.create({
        data: {
            userId,
            type,
            payload,
        }
    });
}

// Récupérer les notifications d’un utilisateur
export async function getNotifications(userId) {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { sentAt: 'desc' }
    });
}

// Marquer notification comme lue
export async function markAsRead(notificationId) {
    return prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
    });
}
