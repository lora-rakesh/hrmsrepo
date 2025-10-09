import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PayslipData {
  employee: {
    full_name: string;
    employee_id: string;
    job_title_name?: string;
    department_name?: string;
  };
  month: number;
  year: number;
  gross_salary: string;
  total_deductions: string;
  net_salary: string;
  working_days: number;
  present_days: number;
  earnings: Array<{ name: string; amount: string }>;
  deductions: Array<{ name: string; amount: string }>;
}

export const generatePayslipPDF = async (payslipData: PayslipData): Promise<void> => {
  // Create a temporary div for the payslip content
  const payslipElement = document.createElement('div');
  payslipElement.style.position = 'absolute';
  payslipElement.style.left = '-9999px';
  payslipElement.style.width = '800px';
  payslipElement.style.padding = '40px';
  payslipElement.style.backgroundColor = 'white';
  payslipElement.style.fontFamily = 'Arial, sans-serif';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  // Sample earnings and deductions
  const earnings = [
    { name: 'Basic Salary', amount: (parseFloat(payslipData.gross_salary) * 0.6).toFixed(2) },
    { name: 'HRA', amount: (parseFloat(payslipData.gross_salary) * 0.25).toFixed(2) },
    { name: 'Special Allowance', amount: (parseFloat(payslipData.gross_salary) * 0.15).toFixed(2) },
  ];

  const deductions = [
    { name: 'Income Tax', amount: (parseFloat(payslipData.total_deductions) * 0.6).toFixed(2) },
    { name: 'PF Contribution', amount: (parseFloat(payslipData.total_deductions) * 0.3).toFixed(2) },
    { name: 'Insurance', amount: (parseFloat(payslipData.total_deductions) * 0.1).toFixed(2) },
  ];

  payslipElement.innerHTML = `
    <div style="border: 2px solid #333; padding: 20px;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #333; font-size: 24px;">Brands Elevate Solutions</h1>
        <p style="margin: 5px 0; color: #666;">123 Business Street, Tech City, TC 12345</p>
        <h2 style="margin: 15px 0 0 0; color: #333; font-size: 20px;">PAYSLIP</h2>
        <p style="margin: 5px 0; color: #666;">For the month of ${monthNames[payslipData.month - 1]} ${payslipData.year}</p>
      </div>

      <!-- Employee Details -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="width: 48%;">
          <h3 style="margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Employee Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${payslipData.employee.full_name}</p>
          <p style="margin: 5px 0;"><strong>Employee ID:</strong> ${payslipData.employee.employee_id}</p>
          <p style="margin: 5px 0;"><strong>Designation:</strong> ${payslipData.employee.job_title_name || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Department:</strong> ${payslipData.employee.department_name || 'N/A'}</p>
        </div>
        <div style="width: 48%;">
          <h3 style="margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Pay Period</h3>
          <p style="margin: 5px 0;"><strong>Month/Year:</strong> ${monthNames[payslipData.month - 1]} ${payslipData.year}</p>
          <p style="margin: 5px 0;"><strong>Working Days:</strong> ${payslipData.working_days}</p>
          <p style="margin: 5px 0;"><strong>Present Days:</strong> ${payslipData.present_days}</p>
          <p style="margin: 5px 0;"><strong>LOP Days:</strong> ${payslipData.working_days - payslipData.present_days}</p>
        </div>
      </div>

      <!-- Salary Details -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <!-- Earnings -->
        <div style="width: 48%;">
          <h3 style="margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Earnings</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Component</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${earnings.map(earning => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${earning.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(earning.amount)}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">Total Earnings</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(payslipData.gross_salary)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Deductions -->
        <div style="width: 48%;">
          <h3 style="margin: 0 0 10px 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Deductions</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Component</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${deductions.map(deduction => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${deduction.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(deduction.amount)}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px;">Total Deductions</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(payslipData.total_deductions)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Net Salary -->
      <div style="border: 2px solid #333; padding: 15px; background-color: #f0f8ff; text-align: center;">
        <h2 style="margin: 0; color: #333;">NET SALARY: ${formatCurrency(payslipData.net_salary)}</h2>
        <p style="margin: 5px 0; color: #666; font-style: italic;">
          (${numberToWords(parseFloat(payslipData.net_salary))} only)
        </p>
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
        <p>This is a computer-generated payslip and does not require a signature.</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `;

  document.body.appendChild(payslipElement);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(payslipElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Download the PDF
    const fileName = `Payslip_${payslipData.employee.employee_id}_${monthNames[payslipData.month - 1]}_${payslipData.year}.pdf`;
    pdf.save(fileName);

  } finally {
    // Clean up
    document.body.removeChild(payslipElement);
  }
};

// Helper function to convert number to words (simplified)
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];

  if (num === 0) return 'Zero';

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = convertIntegerToWords(integerPart, ones, teens, tens, thousands);
  
  if (decimalPart > 0) {
    result += ` and ${decimalPart}/100`;
  }
  
  return result + ' Dollars';
}

function convertIntegerToWords(num: number, ones: string[], teens: string[], tens: string[], thousands: string[]): string {
  if (num === 0) return '';
  
  let result = '';
  let thousandIndex = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      const chunkWords = convertChunkToWords(chunk, ones, teens, tens);
      result = chunkWords + (thousands[thousandIndex] ? ' ' + thousands[thousandIndex] : '') + (result ? ' ' + result : '');
    }
    num = Math.floor(num / 1000);
    thousandIndex++;
  }
  
  return result;
}

function convertChunkToWords(num: number, ones: string[], teens: string[], tens: string[]): string {
  let result = '';
  
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  
  if (hundreds > 0) {
    result += ones[hundreds] + ' Hundred';
  }
  
  if (remainder >= 10 && remainder < 20) {
    result += (result ? ' ' : '') + teens[remainder - 10];
  } else {
    const tensDigit = Math.floor(remainder / 10);
    const onesDigit = remainder % 10;
    
    if (tensDigit > 0) {
      result += (result ? ' ' : '') + tens[tensDigit];
    }
    
    if (onesDigit > 0) {
      result += (result ? ' ' : '') + ones[onesDigit];
    }
  }
  
  return result;
}