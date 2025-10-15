import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  showSellModal = false;
  sellerForm: FormGroup;
  registrationSuccess = false;
  registrationError = '';
  loading = false; // Add this property
  pendingProducts: Product[] = [];
  publishedProducts: Product[] = [];

  get isAdmin(): boolean {
    return this.authService.getUserRole() === 'admin';
  }

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService, private productService: ProductService) {
    this.sellerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^7[0-9]{8}$|^78[0-9]{7}$|^77[0-9]{7}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.loading = true;
    this.loadPublishedProducts();
    this.loadPendingProducts();
  }

  loadPublishedProducts() {
    this.productService.getPublishedProducts().subscribe({
      next: (products: Product[]) => {
        this.publishedProducts = products.slice(0, 8);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading published products', err);
        this.loading = false;
      }
    });
  }

  loadPendingProducts() {
    if (this.authService.getUserRole() === 'admin') {
      this.loading = true;
      this.productService.getPendingProducts().subscribe({
        next: (products: Product[]) => {
          this.pendingProducts = products.slice(0, 8);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading pending products', err);
          this.loading = false;
        }
      });
    }
  }

  navigateToCategory(category: string) {
    // TODO: Implement category navigation
    console.log('Navigate to category:', category);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  searchProducts(searchTerm: string) {
    // TODO: Implement search functionality
    console.log('Search for:', searchTerm);
  }

  openSellModal() {
    this.showSellModal = true;
    this.registrationSuccess = false;
    this.registrationError = '';
  }

  closeSellModal() {
    this.showSellModal = false;
  }

  onSellerRegister() {
    if (this.sellerForm.valid) {
      this.registrationSuccess = false;
      this.registrationError = '';

      const sellerData = { ...this.sellerForm.value, role: 'seller' };
      this.authService.register(sellerData).subscribe({
        next: (response: any) => {
          console.log('Seller registration successful', response);
          this.registrationSuccess = true;
          this.registrationError = '';

          // Redirection automatique après 2 secondes
          setTimeout(() => {
            this.closeSellModal();
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (err: any) => {
          console.error('Seller registration failed', err);
          this.registrationError = err.error?.message || 'Erreur lors de la création du compte. Veuillez réessayer.';
          this.registrationSuccess = false;
        }
      });
    }
  }

  loginWithFacebook() {
    // TODO: Implement Facebook login
    console.log('Login with Facebook');
  }

  loginWithGoogle() {
    // TODO: Implement Google login
    console.log('Login with Google');
  }

  switchToLogin() {
    this.closeSellModal();
    this.router.navigate(['/auth/login']);
  }

  viewProduct(productId: number) {
    this.router.navigate(['/product-details', productId]);
  }

  approveProduct(productId: number) {
    if (confirm('Êtes-vous sûr de vouloir approuver ce produit ?')) {
      this.productService.approveProduct(productId).subscribe({
        next: () => {
          this.loadPublishedProducts(); // Recharger les produits approuvés
          this.loadPendingProducts(); // Recharger les produits en attente
        },
        error: (err: any) => {
          console.error('Error approving product:', err);
          alert('Erreur lors de l\'approbation du produit');
        }
      });
    }
  }

  rejectProduct(productId: number) {
    if (confirm('Êtes-vous sûr de vouloir rejeter ce produit ?')) {
      this.productService.rejectProduct(productId).subscribe({
        next: () => {
          this.loadPublishedProducts(); // Recharger les produits approuvés
          this.loadPendingProducts(); // Recharger les produits en attente
        },
        error: (err: any) => {
          console.error('Error rejecting product:', err);
          alert('Erreur lors du rejet du produit');
        }
      });
    }
  }

  handleImageError(event: any) {
    console.error('Image loading error:', event);
    event.target.src = 'assets/placeholder.jpg';
  }
}
