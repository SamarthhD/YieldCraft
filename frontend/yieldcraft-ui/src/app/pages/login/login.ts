import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  loginUser() {
    const body = { email: this.email, password: this.password };

    this.http.post<any>(`${environment.apiBaseUrl}/auth/login`, body)
      .subscribe({
        next: (res) => {
          // Check if login actually succeeded
          if (res.token) {
            localStorage.setItem('token', res.token);
            this.message = 'Login successful! Redirecting...';
            setTimeout(() => this.router.navigate(['/dashboard']), 1000);
          } else {
            // If no token in response → invalid credentials
            this.message = res.error || 'Invalid email or password';
          }
        },
        error: (err) => {
          // Handle server or network errors gracefully
          if (err.status === 401) {
            this.message = 'Invalid credentials. Please try again.';
          } else if (err.status === 0) {
            this.message = 'Server not reachable. Please try again later.';
          } else {
            this.message = err.error?.message || 'Login failed. Try again.';
          }
        }
      });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
