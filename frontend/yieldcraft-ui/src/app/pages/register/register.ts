import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  registerUser() {
    const body = { name: this.name, email: this.email, password: this.password };

    this.http.post(`${environment.apiBaseUrl}/auth/register`, body)
      .subscribe({
        next: () => {
          this.message = 'Registration successful! Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.message = err.error?.error || 'Registration failed';
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
