import jsPDF from 'jspdf';

export const exportStockToPDF = (materials, filename = 'rapport_stock') => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Rapport de Stock', 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
  
  // Table headers
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  let y = 40;
  doc.text('Code', 14, y);
  doc.text('Matière Première', 40, y);
  doc.text('Stock', 120, y);
  doc.text('Unité', 145, y);
  doc.text('Densité', 170, y);
  
  // Line under headers
  doc.setLineWidth(0.5);
  doc.line(14, y + 2, 195, y + 2);
  
  // Table rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  y += 8;
  
  materials.forEach((mat, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(mat.code || '-', 14, y);
    const name = mat.name || '-';
    doc.text(name.length > 30 ? name.substring(0, 27) + '...' : name, 40, y);
    doc.text((mat.instock || 0).toFixed(2), 120, y);
    doc.text(mat.unity || '-', 145, y);
    doc.text(mat.density ? mat.density.toFixed(2) : '-', 170, y);
    
    y += 7;
  });
  
  // Summary
  y += 10;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFont(undefined, 'bold');
  doc.text(`Total: ${materials.length} matières premières`, 14, y);
  
  // Save
  doc.save(`${filename}.pdf`);
};

export const exportProductionToPDF = (plans, filename = 'rapport_production') => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Rapport de Production', 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);
  
  // Stats
  const planned = plans.filter(p => p.status === 'planned').length;
  const inProgress = plans.filter(p => p.status === 'in_progress').length;
  const completed = plans.filter(p => p.status === 'completed').length;
  const totalCost = plans.reduce((sum, p) => sum + (p.cost || 0), 0);
  
  doc.setFontSize(10);
  doc.text(`Planifié: ${planned} | En cours: ${inProgress} | Terminé: ${completed}`, 14, 36);
  doc.text(`Coût total: ${totalCost.toFixed(2)} €`, 14, 42);
  
  // Table headers
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  let y = 55;
  doc.text('Produit', 14, y);
  doc.text('Recette', 60, y);
  doc.text('Qté', 110, y);
  doc.text('Coût', 130, y);
  doc.text('Statut', 155, y);
  
  // Line under headers
  doc.setLineWidth(0.5);
  doc.line(14, y + 2, 195, y + 2);
  
  // Table rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  y += 8;
  
  plans.forEach((plan, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    const product = plan.product_name || '-';
    doc.text(product.length > 20 ? product.substring(0, 17) + '...' : product, 14, y);
    
    const recipe = plan.recipe_title || '-';
    doc.text(recipe.length > 20 ? recipe.substring(0, 17) + '...' : recipe, 60, y);
    
    doc.text((plan.quantity || 0).toString(), 110, y);
    doc.text((plan.cost || 0).toFixed(2), 130, y);
    doc.text(plan.status || '-', 155, y);
    
    y += 7;
  });
  
  // Save
  doc.save(`${filename}.pdf`);
};