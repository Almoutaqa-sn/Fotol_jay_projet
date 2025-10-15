import { PrismaClient, Role, ProductStatus, NotificationType } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Hash passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const sellerPassword = await bcrypt.hash("seller123", 10);

  // --- USERS ---
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      phone: "0000000000",
      password: adminPassword,
      role: Role.admin,
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      name: "Seller One",
      email: "seller1@example.com",
      phone: "1111111111",
      password: sellerPassword,
      role: Role.seller,
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      name: "Seller Two",
      email: "seller2@example.com",
      phone: "2222222222",
      password: sellerPassword,
      role: Role.seller,
    },
  });

  // --- PRODUCTS ---
  const product1 = await prisma.product.create({
    data: {
      sellerId: seller1.id,
      title: "Super Laptop",
      description: "A powerful laptop for developers",
      price: 1200,
      status: ProductStatus.published,
      publishedAt: new Date(),
      expireAt: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      images: {
        create: [
          {
            url: "https://example.com/laptop1.jpg",
            filename: "laptop1.jpg",
          },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sellerId: seller2.id,
      title: "Gaming Mouse",
      description: "RGB mouse with high DPI",
      price: 60,
      status: ProductStatus.pending,
      images: {
        create: [
          {
            url: "https://example.com/mouse1.jpg",
            filename: "mouse1.jpg",
          },
        ],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      sellerId: seller1.id,
      title: "Mechanical Keyboard",
      description: "Tactile keyboard with customizable keys",
      price: 150,
      status: ProductStatus.rejected,
      images: {
        create: [
          {
            url: "https://example.com/keyboard1.jpg",
            filename: "keyboard1.jpg",
          },
        ],
      },
    },
  });

  // --- NOTIFICATIONS ---
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        type: NotificationType.general,
        payload: { message: "Welcome Admin!" },
      },
      {
        userId: seller1.id,
        type: NotificationType.approval,
        payload: { message: "Your product Super Laptop was approved!" },
      },
      {
        userId: seller2.id,
        type: NotificationType.expiration,
        payload: { message: "Your product Gaming Mouse will expire soon!" },
      },
    ],
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
