import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product } from '../services/product.service';
import { NavigationComponent } from '../shared/navigation.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './products.component.html',
  styleUrls: []
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  searchTerm = '';

  constructor(private productService: ProductService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getPublishedProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    if (this.searchTerm.length >= 3) {
      this.productService.searchProducts(this.searchTerm).subscribe({
        next: (results) => {
          this.filteredProducts = results;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error searching products', err);
          this.filteredProducts = this.products;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.filteredProducts = this.products;
      this.cdr.detectChanges();
    }
  }

  viewProduct(productId: number) {
    // Navigate to product detail
    console.log('View product', productId);
    this.router.navigate(['/product-details', productId]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'published': return 'Publié';
      case 'deleted': return 'Supprimé';
      default: return status;
    }
  }
}