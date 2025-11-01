import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  asset_name = '';
  asset_type = '';
  units = 0;
  purchase_price = 0;
  current_price = 0;
  message = '';
  analytics: any = null;
  investments: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchInvestments();
  }

  fetchInvestments() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    console.log('Fetching investments...');

    this.http.get<any>(`${environment.apiBaseUrl}/investments`, { headers })
      .subscribe({
        next: (data) => {
          console.log('Investments received:', data);
          this.investments = data.investments || data;
        },
        error: (err) => {
          console.error('Error fetching investments:', err);
        }
      });
  }

  addInvestment() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const body = {
      asset_name: this.asset_name,
      asset_type: this.asset_type,
      units: this.units,
      purchase_price: this.purchase_price,
      current_price: this.current_price
    };

    this.http.post<any>(`${environment.apiBaseUrl}/investments`, body, { headers })
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.analytics = res.analytics;
          this.fetchInvestments();
        },
        error: (err) => {
          this.message = 'Error adding investment';
          console.error(err);
        }
      });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
