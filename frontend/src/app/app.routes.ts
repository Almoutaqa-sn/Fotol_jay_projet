import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { ProductsComponent } from './products/products.component';
import { VendorProductsComponent } from './vendor/products.component';
import { AdminDashboardComponent } from './admin/dashboard.component';
import { ProductDetails } from './pages/public/product-details/product-details';
import { Home } from './pages/public/home/home';
import { authGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent },
  {
    path: 'product-details/:id',
    component: ProductDetails
  },
  { path: 'vendor/products', component: VendorProductsComponent, canActivate: [authGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];
