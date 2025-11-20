import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  totalRevenue: number;
  avgRevenuePerUser: number;
  conversionRate: number;
  cacheSavings: number;
  batchSavings: number;
  routingSavings: number;
  avgEngagementRate: number;
  avgSessionDuration: number;
  dailyActiveUsers: number;
}

/**
 * Export platform metrics as CSV
 */
export const exportAsCSV = (metrics: PlatformMetrics, filename: string = 'admin-analytics') => {
  const csvData = [
    ['Metric', 'Value'],
    ['Total Users', metrics.totalUsers],
    ['Active Users', metrics.activeUsers],
    ['Total Analyses', metrics.totalAnalyses],
    ['Total Revenue', `£${metrics.totalRevenue.toLocaleString()}`],
    ['Avg Revenue Per User', `£${metrics.avgRevenuePerUser.toFixed(2)}`],
    ['Conversion Rate', `${metrics.conversionRate.toFixed(1)}%`],
    ['Cache Savings', `£${metrics.cacheSavings.toLocaleString()}`],
    ['Batch Savings', `£${metrics.batchSavings.toLocaleString()}`],
    ['Routing Savings', `£${metrics.routingSavings.toLocaleString()}`],
    ['Avg Engagement Rate', `${metrics.avgEngagementRate.toFixed(1)}%`],
    ['Avg Session Duration', `${metrics.avgSessionDuration} mins`],
    ['Daily Active Users', metrics.dailyActiveUsers],
  ];

  const csvContent = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export platform metrics as Excel
 */
export const exportAsExcel = (metrics: PlatformMetrics, filename: string = 'admin-analytics') => {
  const worksheetData = [
    ['MuslimSoulmate.ai - Platform Analytics'],
    ['Generated on', new Date().toLocaleString()],
    [],
    ['Metric', 'Value'],
    ['Total Users', metrics.totalUsers],
    ['Active Users', metrics.activeUsers],
    ['Total Analyses', metrics.totalAnalyses],
    ['Total Revenue', `£${metrics.totalRevenue.toLocaleString()}`],
    ['Avg Revenue Per User', `£${metrics.avgRevenuePerUser.toFixed(2)}`],
    ['Conversion Rate', `${metrics.conversionRate.toFixed(1)}%`],
    [],
    ['Cost Savings Breakdown'],
    ['Cache Savings', `£${metrics.cacheSavings.toLocaleString()}`],
    ['Batch Savings', `£${metrics.batchSavings.toLocaleString()}`],
    ['Routing Savings', `£${metrics.routingSavings.toLocaleString()}`],
    [],
    ['Engagement Metrics'],
    ['Avg Engagement Rate', `${metrics.avgEngagementRate.toFixed(1)}%`],
    ['Avg Session Duration', `${metrics.avgSessionDuration} mins`],
    ['Daily Active Users', metrics.dailyActiveUsers],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Platform Metrics');

  // Set column widths
  worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

  XLSX.writeFile(workbook, `${filename}-${Date.now()}.xlsx`);
};

/**
 * Export platform metrics as PDF
 */
export const exportAsPDF = (metrics: PlatformMetrics, filename: string = 'admin-analytics') => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MuslimSoulmate.ai', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Platform Analytics Report', 105, 30, { align: 'center' });
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 40, { align: 'center' });
  
  let yPos = 55;
  
  // User Metrics Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('User Metrics', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const userMetrics = [
    ['Total Users:', metrics.totalUsers.toLocaleString()],
    ['Active Users:', metrics.activeUsers.toLocaleString()],
    ['Daily Active Users:', metrics.dailyActiveUsers.toLocaleString()],
    ['Total Analyses:', metrics.totalAnalyses.toLocaleString()],
  ];
  
  userMetrics.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.text(value, 100, yPos);
    yPos += 8;
  });
  
  yPos += 5;
  
  // Revenue Metrics Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Revenue Metrics', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const revenueMetrics = [
    ['Total Revenue:', `£${metrics.totalRevenue.toLocaleString()}`],
    ['Avg Revenue Per User:', `£${metrics.avgRevenuePerUser.toFixed(2)}`],
    ['Conversion Rate:', `${metrics.conversionRate.toFixed(1)}%`],
  ];
  
  revenueMetrics.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.text(value, 100, yPos);
    yPos += 8;
  });
  
  yPos += 5;
  
  // Cost Savings Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cost Savings Breakdown', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const savingsMetrics = [
    ['Cache Savings:', `£${metrics.cacheSavings.toLocaleString()}`],
    ['Batch Savings:', `£${metrics.batchSavings.toLocaleString()}`],
    ['Routing Savings:', `£${metrics.routingSavings.toLocaleString()}`],
    ['Total Savings:', `£${(metrics.cacheSavings + metrics.batchSavings + metrics.routingSavings).toLocaleString()}`],
  ];
  
  savingsMetrics.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.text(value, 100, yPos);
    yPos += 8;
  });
  
  yPos += 5;
  
  // Engagement Metrics Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Engagement Metrics', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const engagementMetrics = [
    ['Avg Engagement Rate:', `${metrics.avgEngagementRate.toFixed(1)}%`],
    ['Avg Session Duration:', `${metrics.avgSessionDuration} mins`],
  ];
  
  engagementMetrics.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.text(value, 100, yPos);
    yPos += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Confidential - Admin Only', 105, 280, { align: 'center' });
  
  doc.save(`${filename}-${Date.now()}.pdf`);
};
