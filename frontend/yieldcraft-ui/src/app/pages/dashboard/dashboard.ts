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

import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexPlotOptions
} from 'ng-apexcharts';

export interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
}

export interface BarChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  colors: string[];
}

export interface DonutChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  colors: string[];
  plotOptions: ApexPlotOptions;
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

  // Pie chart for portfolio distribution
  pieChartOptions: PieChartOptions = {
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

  // Bar chart for gain/loss comparison
  barChartOptions: BarChartOptions = {
    series: [{
      name: 'Gain/Loss',
      data: []
    }],
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        distributed: true
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: [],
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Amount (₹)'
      }
    },
    colors: []
  };

  // Donut chart for investment value distribution
  donutChartOptions: DonutChartOptions = {
    series: [0],
    chart: {
      type: 'donut',
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
    legend: { position: 'bottom' },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Value',
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `₹${total.toFixed(2)}`;
              }
            }
          }
        }
      }
    }
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
        this.updateCharts();
      },
      error: (err) => console.error('Error fetching investments:', err)
    });
  }

  updateCharts(): void {
    if (!this.investments.length) {
      this.pieChartOptions = {
        ...this.pieChartOptions,
        series: [0],
        labels: ['No Data']
      };
      this.donutChartOptions = {
        ...this.donutChartOptions,
        series: [0],
        labels: ['No Data']
      };
      this.barChartOptions = {
        ...this.barChartOptions,
        series: [{ name: 'Gain/Loss', data: [] }],
        xaxis: { ...this.barChartOptions.xaxis, categories: [] }
      };
      return;
    }

    // Pie Chart: Portfolio distribution by asset type
    const groupedByType: Record<string, number> = {};
    for (const inv of this.investments) {
      groupedByType[inv.asset_type] = (groupedByType[inv.asset_type] || 0) + inv.units * inv.current_price;
    }
    this.pieChartOptions = {
      ...this.pieChartOptions,
      series: Object.values(groupedByType),
      labels: Object.keys(groupedByType)
    };

    // Donut Chart: Individual investment values
    const investmentValues = this.investments.map(inv => inv.units * inv.current_price);
    const investmentNames = this.investments.map(inv => inv.asset_name);
    this.donutChartOptions = {
      ...this.donutChartOptions,
      series: investmentValues,
      labels: investmentNames
    };

    // Bar Chart: Gain/Loss per investment
    const gainLossData = this.investments.map(inv => {
      const purchaseValue = inv.units * inv.purchase_price;
      const currentValue = inv.units * inv.current_price;
      return currentValue - purchaseValue;
    });
    
    const colors = gainLossData.map(val => val >= 0 ? '#00E396' : '#FF4560');
    
    this.barChartOptions = {
      ...this.barChartOptions,
      series: [{
        name: 'Gain/Loss',
        data: gainLossData
      }],
      xaxis: { ...this.barChartOptions.xaxis, categories: investmentNames },
      colors: colors
    };
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