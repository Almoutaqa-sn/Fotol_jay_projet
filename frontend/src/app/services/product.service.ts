import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map, filter, finalize } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Product } from '../interfaces/product.interface';
import { environment } from '../../environments/environment';

export type { Product };


interface ProductResponse {
  message: string;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Get published products (for public view)
  getPublishedProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/published`);
  }

  // Search published products
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }

  // Get seller's products
  getSellerProducts(): Observable<Product[]> {
    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token'));
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`);

    return this.http.get<Product[]>(`${this.apiUrl}/seller`, { headers }).pipe(
      tap(products => console.log('Fetched products:', products)),
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout(); // Clear invalid token
        }
        return throwError(() => error);
      })
    );
  }

  // Create a new product
  createProduct(formData: FormData): Observable<Product> {
    let headers = this.getHeaders();
    headers = headers.delete('Content-Type');
    
    return this.http.post<ProductResponse>(`${this.apiUrl}/create`, formData, {
      headers
    }).pipe(
      map(response => response.product),
      tap(product => console.log('Product creation successful:', product)),
      catchError(error => {
        console.error('Product creation error:', error);
        return throwError(() => error);
      })
    );
  }

  // Delete a product
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`, { headers: this.getHeaders() });
  }

  // Get pending products (admin)
  getPendingProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/pending`, { headers: this.getHeaders() });
  }

  // Approve product (admin)
  approveProduct(productId: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${productId}/approve`, {}, { headers: this.getHeaders() });
  }

  // Reject product (admin)
  rejectProduct(id: number): Observable<any> {
    return this.http.post(
        `${this.apiUrl}/${id}/reject`, 
        {},
        { headers: this.getHeaders() }
    ).pipe(
        tap(response => console.log('Product rejected:', response)),
        catchError(error => {
            console.error('Error rejecting product:', error);
            return throwError(() => error);
        })
    );
  }

  // Get product stats (admin)
  getProductStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, { headers: this.getHeaders() });
  }

  // Get a product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      tap(product => console.log('Fetched product:', product)),
      catchError(error => {
        console.error('Error fetching product:', error);
        return throwError(() => error);
      })
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      tap(product => console.log('Fetched product:', product)),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching product:', error);
        return throwError(() => 
          error.status === 404 ? 'Produit non trouvé' : 'Erreur lors du chargement du produit'
        );
      }),
      finalize(() => console.log('Product fetch complete'))
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Une erreur s\'est produite:', error);
    return throwError(() => error.message || 'Une erreur est survenue');
  }
}


