export interface Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface ProductImage {
  id: number;
  url: string;
  productId: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  status: 'pending' | 'published' | 'deleted';
  createdAt: string;
  updatedAt: string;
  sellerId: number;
  seller?: Seller;
  images: ProductImage[];
  approvedAt?: string;
  publishedAt?: string;
  expireAt?: string;
}
