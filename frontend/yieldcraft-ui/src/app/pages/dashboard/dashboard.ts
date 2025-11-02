import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { environment } from '../../../environments/environment';

// ApexCharts types
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend
} from 'ng-apexcharts';

export interface ChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    NgApexchartsModule
  ],
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
  displayedColumns: string[] = ['asset_name', 'asset_type', 'units', 'purchase_price', 'current_price'];

  // Non-optional chart config
  chartOptions: ChartOptions = {
    series: [0],
    chart: {
      type: 'pie',
      width: 380
    },
    labels: ['No Data'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 300 },
          legend: { position: 'bottom' }
        }
      }
    ],
    legend: { position: 'bottom' }
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchInvestments();
  }

  fetchInvestments(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any>(`${environment.apiBaseUrl}/investments`, { headers }).subscribe({
      next: (data) => {
        this.investments = data.investments || [];
        this.updateChart();
      },
      error: (err) => console.error('Error fetching investments:', err)
    });
  }

  updateChart(): void {
    if (!this.investments.length) {
      this.chartOptions.series = [0];
      this.chartOptions.labels = ['No Data'];
      return;
    }

    const grouped: Record<string, number> = {};
    for (const inv of this.investments) {
      grouped[inv.asset_type] = (grouped[inv.asset_type] || 0) + inv.units * inv.current_price;
    }

    this.chartOptions.series = Object.values(grouped);
    this.chartOptions.labels = Object.keys(grouped);
  }

  addInvestment(): void {
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

    this.http.post<any>(`${environment.apiBaseUrl}/investments`, body, { headers }).subscribe({
      next: (res) => {
        this.message = res.message || 'Investment added successfully!';
        this.analytics = res.analytics;
        this.fetchInvestments();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error adding investment:', err);
        this.message = 'Error adding investment';
      }
    });
  }

  resetForm(): void {
    this.asset_name = '';
    this.asset_type = '';
    this.units = 0;
    this.purchase_price = 0;
    this.current_price = 0;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
