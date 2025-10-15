export const Message = {
  // Messages de succès
  USER_CREATED: 'Utilisateur créé avec succès',
  LOGIN_SUCCESSFUL: 'Connexion réussie',
  PRODUCT_CREATED: 'Produit créé, en attente d\'approbation',
  PRODUCT_APPROVED: 'Produit approuvé et publié',
  PRODUCT_DELETED: 'Produit supprimé',

  // Messages d'erreur
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  INVALID_CREDENTIALS: 'Identifiants invalides',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
  INVALID_TOKEN: 'Token invalide',
  INVALID_DATA: 'Données invalides',
  MISSING_REQUIRED_FIELD: 'Champ requis manquant',
  INVALID_EMAIL: 'Email invalide',
  INVALID_PASSWORD: 'Mot de passe invalide',
  INVALID_PRICE: 'Prix invalide',
  PRODUCT_NOT_FOUND: 'Produit non trouvé',
  UNAUTHORIZED_ACTION: 'Action non autorisée',
  INTERNAL_SERVER_ERROR: 'Erreur interne du serveur',
  DATABASE_ERROR: 'Erreur de base de données'
};

// Énumération pour les rôles
export const Role = {
  SELLER: 'seller',
  ADMIN: 'admin'
};

// Énumération pour le statut des produits
export const ProductStatus = {
  PENDING: 'pending',
  PUBLISHED: 'published',
  DELETED: 'deleted'
};