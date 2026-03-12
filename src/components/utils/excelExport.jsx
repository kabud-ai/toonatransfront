// Utility functions for Excel/CSV export

export const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  const headers = Object.keys(data[0]);

  const escapeXml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const headerRow = headers.map(h => `<th>${escapeXml(h)}</th>`).join('');
  const rows = data.map(row =>
    `<tr>${headers.map(h => `<td>${escapeXml(row[h])}</td>`).join('')}</tr>`
  ).join('');

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Export</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
    <body><table border="1"><thead><tr>${headerRow}</tr></thead><tbody>${rows}</tbody></table></body>
    </html>`;

  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xls`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas, quotes, or newlines
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    data.push(obj);
  }

  return data;
};

export const exportProductionReport = (plans, filename = 'rapport_production') => {
  const reportData = plans.map(plan => ({
    'Produit': plan.product_name || '',
    'Recette': plan.recipe_title || '',
    'Quantité': plan.quantity || 0,
    'Coût': plan.cost || 0,
    'Statut': plan.status || '',
    'Date Prévue': plan.planned_date || '',
    'Date Terminé': plan.completed_date || '',
    'Créé le': plan.created_date || ''
  }));
  
  exportToCSV(reportData, filename);
};

export const exportStockReport = (materials, filename = 'rapport_stock') => {
  const reportData = materials.map(mat => ({
    'Code': mat.code || '',
    'Nom': mat.name || '',
    'Stock': mat.instock || 0,
    'Unité': mat.unity || '',
    'Densité': mat.density || '',
    'Description': mat.description || '',
    'Créé le': mat.created_date || ''
  }));
  
  exportToCSV(reportData, filename);
};