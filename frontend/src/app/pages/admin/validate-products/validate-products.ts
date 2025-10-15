import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { NavigationComponent } from '../../../shared/navigation.component';

@Component({
  selector: 'app-validate-products',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  templateUrl: './validate-products.html',
  styleUrl: './validate-products.css'
})
export class ValidateProducts implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userRole = this.authService.getUserRole();
    if (userRole !== 'admin') {
      this.router.navigate(['/']);
      return;
    }

    this.loadPendingProducts();
  }

  loadPendingProducts() {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = null;

    this.productService.getPendingProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pending products:', err);
        this.loading = false;
        this.error = 'Erreur lors du chargement des produits en attente';
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  approveProduct(productId: number) {
    if (confirm('Êtes-vous sûr de vouloir approuver ce produit ?')) {
      this.productService.approveProduct(productId).subscribe({
        next: () => {
          this.loadPendingProducts(); // Recharger la liste
        },
        error: (err) => {
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
          this.loadPendingProducts(); // Recharger la liste
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
