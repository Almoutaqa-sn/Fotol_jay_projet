import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrls: []
})
export class NavigationComponent {
  menuOpen = false;
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get isLoggedIn(): boolean {
    return this.isBrowser ? this.authService.isLoggedIn() : false;
  }

  get userRole(): string | null {
    return this.isBrowser ? this.authService.getUserRole() : null;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  getNavClass(): string {
    if (this.isBrowser) {
      const currentUrl = this.router.url;
      console.log('Current URL for nav class:', currentUrl); // Debug log
      if (this.userRole === 'seller' && currentUrl.includes('/vendor/products')) {
        return 'bg-yellow-600';
      }
      if (currentUrl.includes('/products') || currentUrl.includes('/product/')) {
        return 'bg-yellow-600';
      }
    }
    return 'bg-gold-600';
  }
}