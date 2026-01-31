import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, old_data, event } = await req.json();

    // Only notify on status changes to 'failed' or 'pending'
    if (!data || !['failed', 'pending'].includes(data.status)) {
      return Response.json({ 
        success: true, 
        message: 'No notification needed for this status' 
      });
    }

    // For updates, check if status actually changed
    if (event.type === 'update' && old_data && old_data.status === data.status) {
      return Response.json({ 
        success: true, 
        message: 'Status unchanged, no notification needed' 
      });
    }

    // Get users with quality approval permission and admins
    const roles = await base44.asServiceRole.entities.Role.list();
    const qualityRoles = roles.filter(role => 
      role.permissions?.quality?.view === true || 
      role.permissions?.quality?.approve === true
    );

    const users = await base44.asServiceRole.entities.User.list();
    const qualityUsers = users.filter(user => 
      qualityRoles.some(role => role.code === user.role) || user.role === 'admin'
    );

    if (qualityUsers.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'No quality users found' 
      });
    }

    const statusEmoji = data.status === 'failed' ? '❌' : '⏳';
    const statusText = data.status === 'failed' ? 'Échouée' : 'En Attente';

    // Send email to quality team
    const emailPromises = qualityUsers.map(user => 
      base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: `${statusEmoji} Inspection Qualité ${statusText}: ${data.inspection_number || 'N/A'}`,
        body: `
          <h2>Alerte Inspection Qualité</h2>
          <p>Une inspection qualité nécessite votre attention :</p>
          <ul>
            <li><strong>Numéro d'inspection:</strong> ${data.inspection_number || 'Non spécifié'}</li>
            <li><strong>Statut:</strong> <span style="color: ${data.status === 'failed' ? 'red' : 'orange'};">${statusText}</span></li>
            <li><strong>Type:</strong> ${data.type || 'Non spécifié'}</li>
            <li><strong>Produit:</strong> ${data.product_name || 'Non spécifié'}</li>
            <li><strong>Numéro de lot:</strong> ${data.lot_number || 'N/A'}</li>
            <li><strong>Quantité inspectée:</strong> ${data.quantity_inspected || 0}</li>
            ${data.status === 'failed' ? `<li><strong>Quantité échouée:</strong> ${data.quantity_failed || 0}</li>` : ''}
            <li><strong>Inspecteur:</strong> ${data.inspector || 'Non spécifié'}</li>
            <li><strong>Date:</strong> ${data.inspection_date ? new Date(data.inspection_date).toLocaleDateString('fr-FR') : 'N/A'}</li>
          </ul>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          <p><strong>Action requise:</strong> ${data.status === 'failed' ? 'Traiter la non-conformité et décider des actions correctives.' : 'Compléter l\'inspection en cours.'}</p>
        `
      })
    );

    await Promise.all(emailPromises);

    return Response.json({ 
      success: true, 
      message: `Quality inspection notification sent to ${qualityUsers.length} user(s)`,
      notified: qualityUsers.map(u => u.email)
    });

  } catch (error) {
    console.error('Error sending quality inspection notification:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});