import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = ''; // <-- add this line

  constructor(private http: HttpClient) {}

  onLogin() {
    const body = { email: this.email, password: this.password };

    this.http.post<any>('http://localhost:3000/api/auth/login', body)
      .subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);
          this.message = 'Login successful';
        },
        error: (err) => {
          this.message = 'Invalid credentials or server error';
          console.error(err);
        }
      });
  }
}
