import { z } from 'zod';

// Schéma pour l'image
const imageSchema = z.object({
  url: z.string().url('URL invalide'),
  filename: z.string().min(1, 'Nom de fichier requis'),
  capturedAt: z.string().min(1, 'Date de capture requise') // ou z.coerce.date() si Date
});

// Schéma pour créer un produit
export const createProductSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être positif'),
  images: z.array(imageSchema).min(1, 'Au moins une image est requise')
});