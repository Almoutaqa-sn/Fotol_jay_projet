import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: []
})
export class LoginComponent {
  loginData = { email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        // Token and user are already stored in AuthService.login()
        const userRole = this.authService.getUserRole();
        if (userRole === 'admin') {
          this.router.navigate(['/']);
        } else if (userRole === 'seller') {
          this.router.navigate(['/vendor/products']);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
      }
    });
  }
}