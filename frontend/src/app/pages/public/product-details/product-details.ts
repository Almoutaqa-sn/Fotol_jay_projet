import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../../services/product.service';
import { NavigationComponent } from '../../../shared/navigation.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
  product: Product | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    console.log('ProductDetails component initialized');
    const productId = this.route.snapshot.params['id'];
    console.log('Product ID from route:', productId);
    if (productId) {
      this.loadProduct(productId);
    } else {
      console.error('No product ID found in route');
      this.error = 'ID de produit manquant';
      this.loading = false;
    }
  }

  loadProduct(productId: string) {
    this.loading = true;
    this.error = null;
    console.log('Loading product with ID:', productId);

    this.productService.getProductById(parseInt(productId)).subscribe({
      next: (product) => {
        console.log('Product loaded successfully:', product);
        this.product = product;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error = 'Erreur lors du chargement du produit';
        this.loading = false;
      }
    });
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

  goBack() {
    window.history.back();
  }
}
  


