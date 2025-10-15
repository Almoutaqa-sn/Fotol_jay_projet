import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../services/product.service';
import { NavigationComponent } from '../shared/navigation.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationComponent],
  templateUrl: './products.component.html',
  styleUrls: []
})
export class VendorProductsComponent implements OnInit {
  products: Product[] = [];
  newProduct = { title: '', description: '', price: 0 };
  showAddForm = false;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  userName: string = '';

  // Form properties
  productForm: any;
  selectedFiles: FileList | null = null;
  previewUrls: string[] = [];

  // Camera properties
  showCamera = false;
  capturedImage: string | null = null;
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  private stream: MediaStream | null = null;

  constructor(private productService: ProductService, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    console.log('Component initialized');
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const userRole = this.authService.getUserRole();
    if (userRole !== 'seller') {
      console.log('User is not a seller:', userRole);
      this.router.navigate(['/']);
      return;
    }

    // Get user name
    const user = this.authService.getUser();
    this.userName = user ? user.name : '';

    // Always load products on init (not just when empty)
    this.loadProducts();
  }

  loadProducts() {
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    this.error = null;
    console.log('Starting products load...', this.authService.getToken());

    this.productService.getSellerProducts().pipe(
      timeout(10000), // Timeout après 10 secondes
      catchError(err => {
        console.error('Load products error:', err);
        if (err.name === 'TimeoutError') {
          return of({ error: 'Le chargement a pris trop de temps' });
        }
        return of({ error: err.message });
      })
    ).subscribe({
      next: (response: any) => {
        if (response.error) {
          this.error = response.error;
          this.loading = false;
          return;
        }
        console.log('Products loaded:', response);
        this.products = Array.isArray(response) ? response : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Products load error:', err);
        this.loading = false;
        this.error = 'Erreur lors du chargement des produits';
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onAddProduct() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.successMessage = null;

    const formData = new FormData();
    formData.append('title', this.newProduct.title.trim());
    formData.append('description', this.newProduct.description.trim());
    formData.append('price', this.newProduct.price.toString());

    if (this.capturedImage) {
      // Convertir le base64 en blob
      fetch(this.capturedImage)
        .then(res => res.blob())
        .then(blob => {
          formData.append('images', blob, `product-${Date.now()}.jpg`);
          this.sendProductData(formData);
        })
        .catch(error => {
          console.error('Error converting image:', error);
          this.error = 'Erreur lors de la conversion de l\'image';
          this.loading = false;
        });
    } else {
      this.error = 'Une image est requise';
      this.loading = false;
    }
  }

  private validateForm(): boolean {
    if (!this.newProduct.title.trim()) {
      this.error = 'Le titre est requis';
      return false;
    }
    if (!this.newProduct.description.trim()) {
      this.error = 'La description est requise';
      return false;
    }
    if (this.newProduct.price <= 0) {
      this.error = 'Le prix doit être supérieur à 0';
      return false;
    }
    if (!this.capturedImage) {
      this.error = 'Une photo du produit est requise';
      return false;
    }
    return true;
  }

  private sendProductData(formData: FormData) {
    console.log('Sending product data');
    
    this.productService.createProduct(formData).subscribe({
      next: (response) => {
        console.log('Product created:', response);
        this.loading = false;
        this.successMessage = 'Produit ajouté avec succès! Il sera visible après validation.';
        this.resetForm();
        this.loadProducts(); // Recharger la liste
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de l\'ajout du produit';
      }
    });
  }

  private resetForm() {
    this.newProduct = { title: '', description: '', price: 0 };
    this.capturedImage = null;
    this.showAddForm = false;
  }

  onSubmit() {
    if (this.productForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const formData = new FormData();
    
    // Ajouter les champs du formulaire
    Object.keys(this.productForm.value).forEach(key => {
      formData.append(key, this.productForm.get(key)?.value);
    });

    // Ajouter les images
    if (this.selectedFiles) {
      Array.from(this.selectedFiles).forEach((file, index) => {
        formData.append('images', file);
      });
    }

    console.log('Form data entries:', Array.from(formData.entries()));

    this.productService.createProduct(formData).subscribe({
      next: (response) => {
        console.log('Product created:', response);
        this.loading = false;
        this.successMessage = 'Produit ajouté avec succès!';
        this.productForm.reset();
        this.selectedFiles = null;
        this.previewUrls = [];
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de l\'ajout du produit';
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  // Camera methods
  async openCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });
      this.showCamera = true;
      if (this.video) {
        this.video.nativeElement.srcObject = this.stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  }

  capturePhoto() {
    if (!this.video || !this.canvas) return;

    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedImage = canvas.toDataURL('image/jpeg', 0.8);
      this.closeCamera();
    }
  }

  closeCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.showCamera = false;
  }

  editProduct(product: Product) {
    // Implement edit
    console.log('Edit product', product);
  }

  deleteProduct(productId: number) {
    if (confirm('Supprimer ce produit ?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product', err);
        }
      });
    }
  }

  getPublishedCount(): number {
    return this.products.filter(p => p.status === 'published').length;
  }

  getPendingCount(): number {
    return this.products.filter(p => p.status === 'pending').length;
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

  handleImageError(event: any) {
    console.error('Image loading error:', event);
    event.target.src = 'assets/placeholder.jpg';
  }
}