import jsPDF from 'jspdf';

export const generateAuditReport = async (data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Rapport d\'Audit ERP', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Summary Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Résumé Exécutif', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const summaryData = [
    `Total Entités: ${data.totalEntities || 0}`,
    `Total Enregistrements: ${data.totalRecords || 0}`,
    `Période d'analyse: ${data.period || 'N/A'}`,
  ];

  summaryData.forEach(line => {
    doc.text(line, 25, yPos);
    yPos += 6;
  });

  yPos += 10;

  // Manufacturing Section
  if (data.manufacturing) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Production & Fabrication', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Ordres de fabrication: ${data.manufacturing.totalOrders || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Ordres complétés: ${data.manufacturing.completedOrders || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`En cours: ${data.manufacturing.inProgressOrders || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Taux de complétion: ${data.manufacturing.completionRate || 0}%`, 25, yPos);
    yPos += 10;
  }

  // Quality Section
  if (data.quality) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Contrôle Qualité', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total inspections: ${data.quality.totalInspections || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Taux de réussite: ${data.quality.passRate || 0}%`, 25, yPos);
    yPos += 5;
    doc.text(`Inspections en attente: ${data.quality.pendingInspections || 0}`, 25, yPos);
    yPos += 10;
  }

  // Inventory Section
  if (data.inventory) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Inventaire & Stock', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Articles en stock: ${data.inventory.totalItems || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Valeur totale: $${(data.inventory.totalValue || 0).toLocaleString()}`, 25, yPos);
    yPos += 5;
    doc.text(`Articles en rupture: ${data.inventory.lowStockItems || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Entrepôts actifs: ${data.inventory.activeWarehouses || 0}`, 25, yPos);
    yPos += 10;
  }

  // Materials Section
  if (data.materials) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Matières Premières', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total matières: ${data.materials.totalMaterials || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Stock total: ${(data.materials.totalStock || 0).toLocaleString()}`, 25, yPos);
    yPos += 5;
    doc.text(`Matières en alerte: ${data.materials.lowStockMaterials || 0}`, 25, yPos);
    yPos += 10;
  }

  // Recipes Section
  if (data.recipes) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Recettes & Formules', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total recettes: ${data.recipes.totalRecipes || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Recettes actives: ${data.recipes.activeRecipes || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Coût moyen: $${(data.recipes.avgCost || 0).toFixed(2)}`, 25, yPos);
    yPos += 10;
  }

  // Users Section
  if (data.users) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Utilisateurs & Accès', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total utilisateurs: ${data.users.totalUsers || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Administrateurs: ${data.users.adminUsers || 0}`, 25, yPos);
    yPos += 5;
    doc.text(`Utilisateurs réguliers: ${data.users.regularUsers || 0}`, 25, yPos);
    yPos += 10;
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} sur ${pageCount} - Rapport généré automatiquement`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc;
};

export const downloadAuditReport = async (data, filename = 'rapport_audit_erp') => {
  const doc = await generateAuditReport(data);
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};