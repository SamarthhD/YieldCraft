import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import { environment } from '../../../environments/environment';
type ApexChart = {
  type: string;
  width?: number;
};

type ApexResponsive = {
  breakpoint: number;
  options: {
    chart: { width?: number };
    legend: { position: string };
  };
};

type ChartOptions = {
  series: number[];
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, NgApexchartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
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

  // ApexChart Config
  chartOptions: Partial<ChartOptions> | any = {
    series: [],
    chart: {
      type: 'pie',
      width: 380
    },
    labels: [],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 300 },
          legend: { position: 'bottom' }
        }
      }
    ]
  };

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

    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any>(`${environment.apiBaseUrl}/investments`, { headers })
      .subscribe({
        next: (data) => {
          this.investments = data.investments || data;
          this.updateChart();
        },
        error: (err) => {
          console.error('Error fetching investments:', err);
        }
      });
  }

  updateChart() {
    if (!this.investments.length) return;
    const grouped: Record<string, number> = {};

    this.investments.forEach(inv => {
      grouped[inv.asset_type] = (grouped[inv.asset_type] || 0) + (inv.units * inv.current_price);
    });

    this.chartOptions.series = Object.values(grouped);
    this.chartOptions.labels = Object.keys(grouped);
  }

  addInvestment() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
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
