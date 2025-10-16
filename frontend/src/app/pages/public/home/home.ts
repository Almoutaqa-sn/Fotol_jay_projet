import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ProductService, Product } from '../../../services/product.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  showSellModal = false;
  sellerForm: FormGroup;
  registrationSuccess = false;
  registrationError = '';
  loading = false;
  pendingProducts: Product[] = [];
  publishedProducts: Product[] = [];
  isAdmin = false;
  isLoggedIn = false;
  userName = '';
  searchTerm = '';
  isSearching = false;
  searchTerms = new Subject<string>();
  noResults = false;
  currentPage = 1;
  itemsPerPage = 6;
  totalProducts = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {
    this.sellerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^7[0-9]{8}$|^78[0-9]{7}$|^77[0-9]{7}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.isAdmin = this.authService.getUserRole() === 'admin';
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userName = this.authService.getUserName() || '';
  }

  ngOnInit() {
    this.loading = true;
    this.loadPublishedProducts();
    if (this.isAdmin) {
      this.loadPendingProducts();
    }

    // Configuration de la recherche en temps réel
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      if (term.length >= 3) {
        this.isSearching = true;
        this.productService.searchProducts(term).subscribe({
          next: (products) => {
            this.publishedProducts = products;
            this.noResults = products.length === 0;
            this.isSearching = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Search error:', err);
            this.isSearching = false;
            this.noResults = true;
            this.cdr.detectChanges();
          }
        });
      } else {
        // Si moins de 3 caractères, recharger tous les produits
        this.loadPublishedProducts();
      }
    });
  }

  loadPublishedProducts() {
    this.loading = true;
    this.productService.getPublishedProducts().subscribe({
      next: (products: Product[]) => {
        // Trier les produits : premium en premier, puis par date de création décroissante
        const sortedProducts = products.sort((a, b) => {
          // Les produits premium en premier
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          // Puis trier par date de création (plus récent en premier)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        this.totalProducts = sortedProducts.length;
        // Pagination : afficher seulement les produits de la page actuelle
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.publishedProducts = sortedProducts.slice(startIndex, endIndex);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading published products', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPendingProducts() {
    this.loading = true;
    this.productService.getPendingProducts().subscribe({
      next: (products: Product[]) => {
        this.pendingProducts = products.slice(0, 8);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading pending products', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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

  onSearch(term: string) {
    this.searchTerm = term;
    this.searchTerms.next(term);

    if (term.length < 3) {
      this.noResults = false;
      this.loadPublishedProducts(); // Recharger tous les produits si recherche trop courte
      return;
    }
  }

  searchProducts() {
    if (this.searchTerm.length < 3) {
      return;
    }

    this.isSearching = true;
    this.noResults = false;

    this.productService.searchProducts(this.searchTerm).subscribe({
      next: (products) => {
        this.publishedProducts = products;
        this.noResults = products.length === 0;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isSearching = false;
        this.noResults = true;
        this.cdr.detectChanges();
      }
    });
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

  viewProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  approveProduct(productId: number) {
    this.loading = true;
    this.productService.approveProduct(productId).subscribe({
      next: () => {
        this.loadPendingProducts();
        this.loadPublishedProducts();
      },
      error: (err: any) => {
        console.error('Error approving product:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  rejectProduct(productId: number) {
    this.loading = true;
    this.productService.rejectProduct(productId).subscribe({
      next: () => {
        this.loadPendingProducts();
      },
      error: (err: any) => {
        console.error('Error rejecting product:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  markAsPremium(productId: number, event: Event) {
    event.preventDefault(); // Empêcher la propagation du clic
    event.stopPropagation(); // Empêcher la navigation

    this.loading = true;
    this.productService.markAsPremium(productId).subscribe({
      next: (updatedProduct) => {
        // Recharger tous les produits pour mettre à jour la pagination
        this.loadPublishedProducts();
      },
      error: (err) => {
        console.error('Error marking product as premium:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPublishedProducts();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPublishedProducts();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPublishedProducts();
    }
  }

  handleImageError(event: any) {
    console.error('Image loading error:', event);
    event.target.src = 'assets/placeholder.jpg';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    // Recharger la page pour mettre à jour l'état de l'authentification
    window.location.reload();
  }
}
