// Initialize with current date
document.addEventListener('DOMContentLoaded', function() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('issueDate').value = today;
  
  // Set expiry date to 30 days from now
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  document.getElementById('expiryDate').value = expiryDate.toISOString().split('T')[0];
});

function addProductRow() {
  const productList = document.getElementById('product-list');
  const rows = productList.querySelectorAll('.product-row');
  
  const row = document.createElement('div');
  row.classList.add('product-row');
  row.innerHTML = `
    <input type="text" placeholder="Description" class="desc" required>
    <input type="number" placeholder="Quantity" class="qty" min="1" value="1" required>
    <input type="number" placeholder="Price (SGD)" class="price" min="0" step="0.01" required>
    <button type="button" class="remove-btn" onclick="removeProductRow(this)">×</button>
  `;
  
  productList.appendChild(row);
  
  // Enable remove button on all rows if more than one exists
  if (rows.length >= 1) {
    rows.forEach(r => {
      const btn = r.querySelector('.remove-btn');
      if (btn) btn.disabled = false;
    });
  }
}

function removeProductRow(button) {
  const row = button.closest('.product-row');
  const productList = document.getElementById('product-list');
  
  if (productList.querySelectorAll('.product-row').length > 1) {
    row.remove();
    
    // Disable remove button if only one row left
    if (productList.querySelectorAll('.product-row').length === 1) {
      productList.querySelector('.remove-btn').disabled = true;
    }
  }
}

function generatePreview() {
  const form = document.getElementById('invoiceForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const invoiceNo = document.getElementById('invoiceNo').value;
  const issueDate = formatDate(document.getElementById('issueDate').value);
  const expiryDate = formatDate(document.getElementById('expiryDate').value);
  const customerName = document.getElementById('customerName').value;
  const customerAddress = document.getElementById('customerAddress').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const customerEmail = document.getElementById('customerEmail').value;
  const po = document.getElementById('po').value;
  const remarks = document.getElementById('remarks').value;
  const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
  const taxRegistration = document.getElementById('taxRegistration').value;
  const taxInclusive = document.getElementById('taxInclusive').checked;

  const descs = document.querySelectorAll('.desc');
  const qtys = document.querySelectorAll('.qty');
  const prices = document.querySelectorAll('.price');

  let productHTML = `
    <table class="preview-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantity</th>
          <th>Unit Price (SGD)</th>
          <th>Total (SGD)</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  let subtotal = 0;

  for (let i = 0; i < descs.length; i++) {
    const desc = descs[i].value;
    const qty = parseFloat(qtys[i].value) || 0;
    const price = parseFloat(prices[i].value) || 0;
    const lineTotal = qty * price;
    subtotal += lineTotal;
    
    productHTML += `
      <tr>
        <td>${desc}</td>
        <td>${qty}</td>
        <td>${price.toFixed(2)}</td>
        <td>${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  }
  
  // Calculate tax and grand total
  let taxAmount = 0;
  let grandTotal = subtotal;
  
  if (taxRate > 0) {
    if (taxInclusive) {
      // Calculate tax amount from inclusive prices
      taxAmount = subtotal - (subtotal / (1 + taxRate / 100));
      grandTotal = subtotal; // Already includes tax
    } else {
      // Calculate tax amount to be added
      taxAmount = subtotal * (taxRate / 100);
      grandTotal = subtotal + taxAmount;
    }
  }
  
  productHTML += `
      <tr class="subtotal-row">
        <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
        <td><strong>SGD ${subtotal.toFixed(2)}</strong></td>
      </tr>
  `;
  
  if (taxRate > 0) {
    productHTML += `
      <tr class="tax-row">
        <td colspan="3" style="text-align: right;">
          <strong>GST (${taxRate}%)${taxInclusive ? ' (Included)' : ''}:</strong>
          ${taxRegistration ? `<br><small>GST Reg No: ${taxRegistration}</small>` : ''}
        </td>
        <td><strong>SGD ${taxAmount.toFixed(2)}</strong></td>
      </tr>
    `;
  }
  
  productHTML += `
      <tr class="grandtotal-row">
        <td colspan="3" style="text-align: right;"><strong>Total Amount:</strong></td>
        <td><strong>SGD ${grandTotal.toFixed(2)}</strong></td>
      </tr>
    </tbody>
  </table>
  `;

  document.getElementById('previewContent').innerHTML = `
    <div class="info-box">
      <div class="company-box">
        <h3>From</h3>
        <p><strong>S&R ENGINEERING and RENOVATION PTE LTD</strong></p>
        <p>Manager: Shafikul Islam</p>
        <p>Phone: +65 9074 4822</p>
        <p>Email: srengineeringandrenovationptel@gmail.com</p>
        <p>UEN: 202432744G</p>
        <p>113 Eunos ave 3 #07-14, RM-03<br>
        Gordon Industrial Building<br>
        Singapore 409838</p>
      </div>
      
      <div class="customer-box">
        <h3>Bill To</h3>
        <p><strong>${customerName}</strong></p>
        <p>${customerAddress.replace(/\n/g, '<br>')}</p>
        <p>Phone: ${customerPhone}</p>
        <p>Email: ${customerEmail}</p>
        ${po ? `<p>Purchase Order: ${po}</p>` : ''}
      </div>
    </div>
    
    <div class="invoice-meta">
      <div><strong>Invoice Number:</strong> ${invoiceNo}</div>
      <div><strong>Issue Date:</strong> ${issueDate}</div>
      ${expiryDate ? `<div><strong>Due Date:</strong> ${expiryDate}</div>` : ''}
    </div>
    
    ${productHTML}
    
    ${remarks ? `<div class="payment-info"><strong>Remarks:</strong><p>${remarks}</p></div>` : ''}
    
    <div class="payment-info">
      <h4>Payment Information</h4>
      <p>UOB Bank, Account No: 7153002995<br>
      Account Name: S&R ENGINEERING and RENOVATION PTE LTD</p>
    </div>
  `;
  
  document.getElementById('preview').style.display = 'block';
  window.scrollTo({
    top: document.getElementById('preview').offsetTop,
    behavior: 'smooth'
  });
}

async function generatePDF() {
  // First generate preview to validate form
  generatePreview();
  
  const form = document.getElementById('invoiceForm');
  if (!form.checkValidity()) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm'
  });

  // Set document properties
  doc.setProperties({
    title: `Invoice ${document.getElementById('invoiceNo').value}`,
    subject: 'Invoice',
    author: 'S&R Engineering',
    keywords: 'invoice, billing',
    creator: 'S&R Engineering Invoice Generator'
  });

    // Add company logo to PDF (top-right corner)
  try {
    const logoImg = document.getElementById('companyLogo');
    if (logoImg && logoImg.src) {
      const logoData = await getBase64Image(logoImg);
      // Add logo to top-right (position: x=150, y=10, width=40, height=auto)
      doc.addImage(logoData, 'PNG', 157, -4, 40, 0); // 0 maintains aspect ratio
    }
  } catch (error) {
    console.error('Could not add logo to PDF:', error);
  }

  // Set styles
  const primaryColor = [220, 53, 69];
  const lightGray = [248, 249, 250];
  const borderGray = [238, 238, 238];
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text("INVOICE", 105, 20, { align: 'center' });
  
  // Info box background (matches preview)
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(15, 30, 180, 50, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(15, 30, 180, 50);
  
  // Company Information (Left side - 85mm width)
doc.setFontSize(12);
doc.setTextColor(0, 0, 0);
doc.setFont(undefined, 'bold');
doc.text("From:", 20, 35);
doc.setFont(undefined, 'normal');

const companyInfo = [
  "Manager: Shafikul Islam",
  "Phone: +65 9074 4822",
  "Email: srengineeringandrenovationptel@gmail.com"
];

let companyY = 40;
companyInfo.forEach(line => {
  doc.text(line, 20, companyY);
  companyY += 5;
});

// Add company name in bold
doc.setFont(undefined, 'bold');
doc.text("S&R ENGINEERING and RENOVATION PTE LTD", 20, companyY);
companyY += 5;

// Continue with remaining info in normal weight
doc.setFont(undefined, 'normal');
const companyInfoRemaining = [
  "UEN: 202432744G",
  "113 Eunos ave 3 #07-14, RM-03",
  "Gordon Industrial Building",
  "Singapore 409838"
];

companyInfoRemaining.forEach(line => {
  doc.text(line, 20, companyY);
  companyY += 5;
});

doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]); // Light gray color
doc.setLineWidth(0.5); // Thin line
doc.line(119, 30, 119, 80); // x, y_start, x, y_end

// Customer Information (Right side - starts at 110mm)
const customerName = document.getElementById('customerName').value;
const customerAddress = document.getElementById('customerAddress').value;
const customerPhone = document.getElementById('customerPhone').value;
const customerEmail = document.getElementById('customerEmail').value;
const po = document.getElementById('po').value;

doc.setFont(undefined, 'bold');
doc.text("Bill To:", 122, 35);
doc.setFont(undefined, 'normal');
doc.text(customerName, 122, 40);

let customerY = 45;

// Add phone and email first
doc.text(`Phone: ${customerPhone}`, 122, customerY); customerY += 5;
doc.text(`Email: ${customerEmail}`, 122, customerY); customerY += 5;

// Add purchase order if exists
if (po) {
  doc.text(`Purchase Order: ${po}`, 122, customerY); customerY += 5;
}

doc.setFont(undefined, 'bold');
doc.text("Address:", 122, customerY); customerY += 5;
doc.setFont(undefined, 'normal');

// Split address into lines (max width 80mm) and add it last
const addressLines = doc.splitTextToSize(customerAddress, 80);
addressLines.forEach(line => {
  doc.text(line, 122, customerY);
  customerY += 5;
});


  // Invoice metadata box (matches preview)
  doc.setFillColor(255, 255, 255);
  doc.rect(15, 85, 180, 15, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(15, 85, 180, 15);
  
  const invoiceNo = document.getElementById('invoiceNo').value;
  const issueDate = formatDate(document.getElementById('issueDate').value);
  const expiryDate = formatDate(document.getElementById('expiryDate').value);
  
  // Calculate positions to prevent overlap
  const col1 = 20;
  const col2 = 78;
  const col3 = 128;
  
  doc.setFont(undefined, 'bold');
  doc.text("Invoice Number:", col1, 91);
  doc.text("Issue Date:", col2, 91);
  if (expiryDate) doc.text("Expiry Date:", col3, 91);
  
  doc.setFont(undefined, 'normal');
  doc.text(invoiceNo, col1 + 34, 91);
  doc.text(issueDate, col2 + 23, 91);
  if (expiryDate) doc.text(expiryDate, col3 + 25, 91);

  // Products table (matches preview)
  const descs = document.querySelectorAll('.desc');
  const qtys = document.querySelectorAll('.qty');
  const prices = document.querySelectorAll('.price');
  const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
  const taxRegistration = document.getElementById('taxRegistration').value;
  const taxInclusive = document.getElementById('taxInclusive').checked;

  const tableBody = [];
  let subtotal = 0;

  for (let i = 0; i < descs.length; i++) {
    const desc = descs[i].value;
    const qty = parseFloat(qtys[i].value) || 0;
    const price = parseFloat(prices[i].value) || 0;
    const lineTotal = qty * price;
    subtotal += lineTotal;
    tableBody.push([desc, qty, `S$ ${price.toFixed(2)}`, `S$ ${lineTotal.toFixed(2)}`]);
  }

  doc.autoTable({
    startY: 105,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableBody,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 }
    },
    margin: { left: 15 }
  });

  // Calculate tax and grand total
  let taxAmount = 0;
  let grandTotal = subtotal;
  
  if (taxRate > 0) {
    if (taxInclusive) {
      // Calculate tax amount from inclusive prices
      taxAmount = subtotal - (subtotal / (1 + taxRate / 100));
      grandTotal = subtotal; // Already includes tax
    } else {
      // Calculate tax amount to be added
      taxAmount = subtotal * (taxRate / 100);
      grandTotal = subtotal + taxAmount;
    }
  }

  // Subtotal, tax, and grand total rows
  let finalY = doc.lastAutoTable.finalY + 10;
  
  // Subtotal
  doc.setFont(undefined, 'bold');
  doc.text("Subtotal:", 150, finalY, { align: 'right' });
  doc.text(`S$ ${subtotal.toFixed(2)}`, 190, finalY, { align: 'right' });
  doc.setFont(undefined, 'normal');
  finalY += 5;
  
  // Tax row if applicable
  if (taxRate > 0) {
    doc.setFont(undefined, 'bold');
    doc.text(`GST (${taxRate}%)${taxInclusive ? ' (Included)' : ''}:`, 150, finalY, { align: 'right' });
    doc.text(`S$ ${taxAmount.toFixed(2)}`, 190, finalY, { align: 'right' });
    
    // Add GST registration number if provided
    if (taxRegistration) {
      finalY += 5;
      doc.setFontSize(8);
      doc.text(`GST Reg No: ${taxRegistration}`, 143, finalY, { align: 'right' });
      doc.setFontSize(10);
    }
    
    doc.setFont(undefined, 'normal');
    finalY += 7;
  }
  
  // Grand total
  doc.setFont(undefined, 'bold');
  doc.setFontSize(16);
  doc.text("Total Amount:", 150, finalY, { align: 'right' });
  doc.text(`S$ ${grandTotal.toFixed(2)}`, 190, finalY, { align: 'right' });
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  // Remarks (matches preview)
  finalY += 10;
  const remarks = document.getElementById('remarks').value;
  if (remarks) {
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(15, finalY, 180, 15, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(15, finalY, 180, 15);
    
    doc.setFont(undefined, 'bold');
    doc.text("Remarks:", 20, finalY + 5);
    doc.setFont(undefined, 'normal');
    const remarkLines = doc.splitTextToSize(remarks, 170);
    doc.text(remarkLines, 20, finalY + 10);
    finalY += 15 + (remarkLines.length * 5);
  }

  // Payment information (matches preview)
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(15, finalY, 180, 25, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(15, finalY, 180, 25);
  
  doc.setFont(undefined, 'bold');
  doc.text("Payment Information:", 20, finalY + 5);
  doc.setFont(undefined, 'normal');
  doc.text("Bank Name: UOB Bank", 20, finalY + 10);
  doc.text("Account No: 7153002995", 20, finalY + 15);
  doc.text("Account Name: S&R ENGINEERING and RENOVATION PTE LTD", 20, finalY + 20);

  // Footer
  finalY += 30;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Thank you for your business!", 105, finalY, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_${invoiceNo || po || 'Untitled'}.pdf`);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-SG', options);
}

function getBase64Image(img) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    resolve(canvas.toDataURL('image/png'));
  });
}