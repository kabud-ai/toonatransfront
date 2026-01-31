import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, event } = await req.json();

    // Check if this is a low stock situation
    if (!data || data.quantity > data.min_stock_alert) {
      return Response.json({ 
        success: true, 
        message: 'Stock level is adequate, no notification needed' 
      });
    }

    // Get all admin users to notify
    const users = await base44.asServiceRole.entities.User.list();
    const adminUsers = users.filter(u => u.role === 'admin');

    if (adminUsers.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No admin users to notify' 
      });
    }

    // Send email to each admin
    const emailPromises = adminUsers.map(admin => 
      base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `⚠️ Alerte Stock Bas: ${data.product_name || 'Produit'}`,
        body: `
          <h2>Alerte de Stock Bas</h2>
          <p>Le niveau de stock suivant nécessite votre attention :</p>
          <ul>
            <li><strong>Produit:</strong> ${data.product_name || 'Non spécifié'}</li>
            <li><strong>SKU:</strong> ${data.product_sku || 'N/A'}</li>
            <li><strong>Entrepôt:</strong> ${data.warehouse_name || 'Non spécifié'}</li>
            <li><strong>Quantité actuelle:</strong> ${data.quantity}</li>
            <li><strong>Seuil minimum:</strong> ${data.min_stock_alert}</li>
            <li><strong>Quantité disponible:</strong> ${data.available_quantity || 0}</li>
          </ul>
          <p><strong>Action recommandée:</strong> Vérifier les suggestions de réapprovisionnement et créer une commande d'achat si nécessaire.</p>
        `
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Low stock notification sent to ${adminUsers.length} admin(s)`,
      notified: adminUsers.map(u => u.email)
    });

  } catch (error) {
    console.error('Error sending low stock notification:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});