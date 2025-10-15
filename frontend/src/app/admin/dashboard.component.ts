import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../services/product.service';
import { NavigationComponent } from '../shared/navigation.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class AdminDashboardComponent implements OnInit {
  stats = { totalProducts: 0, pendingProducts: 0, approvedProducts: 0, rejectedProducts: 0 };
  pendingProducts: Product[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadStats();
    this.loadPendingProducts();
  }

  loadStats() {
    if (this.authService.isLoggedIn()) {
      this.productService.getProductStats().subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => {
          console.error('Error loading stats', err);
          if (err.status === 401) {
            this.router.navigate(['/login']);
          }
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadPendingProducts() {
    this.loading = true;
    this.error = null;
    
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.productService.getPendingProducts().subscribe({
      next: (data) => {
        console.log('Pending products received:', data); // Debug log
        this.pendingProducts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching pending products:', err); // Debug log
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else {
          this.error = `Error loading products: ${err.message || 'Unknown error'}`;
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  approveProduct(productId: number) {
    this.productService.approveProduct(productId).subscribe({
      next: () => {
        this.loadStats();
        this.loadPendingProducts();
      },
      error: (err) => {
        console.error('Error approving product', err);
      }
    });
  }

  rejectProduct(productId: number) {
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.loadStats();
        this.loadPendingProducts();
      },
      error: (err) => {
        console.error('Error rejecting product', err);
      }
    });
  }
}