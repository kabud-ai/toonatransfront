import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, event } = await req.json();

    // Only notify for new purchase orders that require approval
    if (event.type !== 'create' || !data || data.status !== 'pending') {
      return Response.json({ 
        success: true, 
        message: 'No approval notification needed' 
      });
    }

    // Get users with purchase order approval permission
    const roles = await base44.asServiceRole.entities.Role.list();
    const approverRoles = roles.filter(role => 
      role.permissions?.purchase_orders?.approve === true
    );

    if (approverRoles.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No roles with approval permission found' 
      });
    }

    // Get all users with approver roles
    const users = await base44.asServiceRole.entities.User.list();
    const approvers = users.filter(user => 
      approverRoles.some(role => role.code === user.role) || user.role === 'admin'
    );

    if (approvers.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No approver users found' 
      });
    }

    // Send email to each approver
    const emailPromises = approvers.map(approver => 
      base44.asServiceRole.integrations.Core.SendEmail({
        to: approver.email,
        subject: `📋 Nouveau Bon de Commande à Approuver: ${data.order_number || 'N/A'}`,
        body: `
          <h2>Nouveau Bon de Commande en Attente d'Approbation</h2>
          <p>Un nouveau bon de commande nécessite votre approbation :</p>
          <ul>
            <li><strong>Numéro:</strong> ${data.order_number || 'Non spécifié'}</li>
            <li><strong>Fournisseur:</strong> ${data.supplier_name || 'Non spécifié'}</li>
            <li><strong>Date de commande:</strong> ${data.order_date ? new Date(data.order_date).toLocaleDateString('fr-FR') : 'N/A'}</li>
            <li><strong>Total:</strong> ${data.total_amount ? `${data.total_amount.toFixed(2)} ${data.currency || ''}` : 'N/A'}</li>
            <li><strong>Nombre de lignes:</strong> ${data.lines?.length || 0}</li>
          </ul>
          <p><strong>Statut:</strong> En attente d'approbation</p>
          <p>Veuillez vous connecter à l'ERP pour examiner et approuver cette commande.</p>
        `
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Purchase order notification sent to ${approvers.length} approver(s)`,
      notified: approvers.map(u => u.email)
    });

  } catch (error) {
    console.error('Error sending purchase order notification:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});