import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../interfaces/product.interface';
import { NavigationComponent } from '../../../shared/navigation.component';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, NavigationComponent],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    if (!id) {
      this.error = 'ID du produit invalide';
      return;
    }

    this.loading = true;
    this.error = null;
    
    this.productService.getProduct(id).subscribe({
      next: (product) => {
        console.log('Product loaded:', product);
        this.product = product;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error = typeof err === 'string' ? err : 'Erreur lors du chargement du produit';
        this.loading = false;
      }
    });
  }

  contactSeller() {
    if(this.product?.seller?.phone) {
      // Formatter le numéro de téléphone pour WhatsApp (enlever les espaces et ajouter l'indicatif du pays si nécessaire)
      const phoneNumber = this.product.seller.phone.replace(/\s/g, '');
      const whatsappNumber = phoneNumber.startsWith('+') ? phoneNumber : `+221${phoneNumber}`;
      window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    }
  }

  getStatusClass(status: Product['status']): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: Product['status']): string {
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







