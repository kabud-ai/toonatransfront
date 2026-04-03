import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAYMENT_METHOD_LABELS = {
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
  check: 'Chèque',
  credit_card: 'Carte bancaire',
  other: 'Autre',
};

const STATUS_LABELS = {
  draft: 'Brouillon',
  confirmed: 'Confirmé',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

export default function InvoicePrint({ order, companyName = 'ProducFlow' }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Facture ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; font-size: 13px; }
          .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #0ea5e9; }
          .company-name { font-size: 26px; font-weight: 700; color: #0ea5e9; letter-spacing: -0.5px; }
          .company-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
          .invoice-title { text-align: right; }
          .invoice-title h1 { font-size: 22px; font-weight: 700; color: #0f172a; }
          .invoice-title .num { font-size: 14px; color: #64748b; margin-top: 4px; }
          .invoice-title .date { font-size: 12px; color: #94a3b8; margin-top: 2px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
          .meta-box h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 10px; }
          .meta-box p { font-size: 13px; color: #1e293b; margin-bottom: 4px; }
          .meta-box .label { color: #64748b; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          thead tr { background: #0ea5e9; color: #fff; }
          thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          thead th:not(:first-child) { text-align: right; }
          tbody tr { border-bottom: 1px solid #f1f5f9; }
          tbody tr:nth-child(even) { background: #f8fafc; }
          tbody td { padding: 10px 12px; font-size: 13px; color: #334155; }
          tbody td:not(:first-child) { text-align: right; }
          .totals { display: flex; justify-content: flex-end; margin-bottom: 28px; }
          .totals-box { width: 260px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; border-bottom: 1px solid #f1f5f9; }
          .totals-row.total { font-size: 16px; font-weight: 700; color: #0f172a; border-bottom: none; padding-top: 10px; border-top: 2px solid #0ea5e9; margin-top: 6px; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #dcfce7; color: #166534; }
          .notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #92400e; margin-bottom: 24px; }
          .footer { text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 12px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .invoice { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">${content}</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const fmt = (n) => (n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (d) => { try { return format(new Date(d), 'dd MMMM yyyy', { locale: fr }); } catch { return d || '-'; } };

  return (
    <>
      <Button size="sm" variant="outline" onClick={handlePrint} className="border-sky-300 text-sky-700 hover:bg-sky-50">
        <Printer className="h-4 w-4 mr-1" />Imprimer Facture
      </Button>

      {/* Contenu caché utilisé pour l'impression */}
      <div ref={printRef} style={{ display: 'none' }}>
        {/* En-tête */}
        <div className="header">
          <div>
            <div className="company-name">{companyName}</div>
            <div className="company-sub">Système de Gestion Industrielle</div>
          </div>
          <div className="invoice-title">
            <h1>FACTURE</h1>
            <div className="num">{order.order_number}</div>
            <div className="date">
              Émise le {fmtDate(order.order_date)}
              {order.delivery_date && ` · Livraison : ${fmtDate(order.delivery_date)}`}
            </div>
            <div style={{ marginTop: '8px' }}>
              <span className="status-badge">{STATUS_LABELS[order.status] || order.status}</span>
            </div>
          </div>
        </div>

        {/* Infos client & commande */}
        <div className="meta">
          <div className="meta-box">
            <h3>Facturé à</h3>
            <p style={{ fontWeight: 600, fontSize: '14px' }}>{order.customer_name}</p>
            {order.customer_email && <><span className="label">Email :</span> <p>{order.customer_email}</p></>}
            {order.customer_phone && <><span className="label">Tél :</span> <p>{order.customer_phone}</p></>}
            {order.customer_address && <><span className="label">Adresse :</span> <p>{order.customer_address}</p></>}
          </div>
          <div className="meta-box">
            <h3>Détails commande</h3>
            <span className="label">Entrepôt source</span>
            <p>{order.warehouse_name}</p>
            {order.payment_method && (
              <><span className="label">Mode de paiement</span><p>{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}</p></>
            )}
            <span className="label">Statut paiement</span>
            <p>{order.payment_status === 'paid' ? '✅ Payé' : order.payment_status === 'partial' ? '⚠️ Partiel' : '❌ Non payé'}</p>
          </div>
        </div>

        {/* Tableau produits */}
        <table>
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Réf. / SKU</th>
              <th>Quantité</th>
              <th>Prix Unit. HT</th>
              <th>Remise</th>
              <th>Total HT</th>
            </tr>
          </thead>
          <tbody>
            {(order.lines || []).map((line, i) => (
              <tr key={i}>
                <td>{line.product_name}</td>
                <td>{line.product_sku || '-'}</td>
                <td>{line.quantity} {line.unit}</td>
                <td>{fmt(line.unit_price)} €</td>
                <td>{line.discount || 0}%</td>
                <td style={{ fontWeight: 600 }}>{fmt(line.total_price)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="totals">
          <div className="totals-box">
            <div className="totals-row">
              <span>Sous-total HT</span>
              <span>{fmt(order.subtotal)} €</span>
            </div>
            <div className="totals-row">
              <span>TVA ({order.tax_rate || 0}%)</span>
              <span>{fmt(order.tax_amount)} €</span>
            </div>
            <div className="totals-row total">
              <span>Total TTC</span>
              <span>{fmt(order.total_amount)} €</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="notes">
            <strong>Notes :</strong> {order.notes}
          </div>
        )}

        {/* Pied de page */}
        <div className="footer">
          <p>Merci de votre confiance — {companyName}</p>
          <p style={{ marginTop: '4px' }}>Document généré le {fmtDate(new Date().toISOString())}</p>
        </div>
      </div>
    </>
  );
}