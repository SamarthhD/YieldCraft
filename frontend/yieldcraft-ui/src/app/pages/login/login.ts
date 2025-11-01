import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin() {
    const body = { email: this.email, password: this.password };

    this.http.post<any>(`${environment.apiBaseUrl}/auth/login`, body)
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.message = 'Login successful! Redirecting...';
          setTimeout(() => this.router.navigate(['/dashboard']), 1000);
        },
        error: (err) => {
          this.message = err.error?.error || 'Invalid credentials or server error';
          console.error('Login error:', err);
        }
      });
  }
}
