import ExcelJS from 'exceljs';
import { exportBookings, parseFilters } from '@/lib/server/booking-list';
import { route, requireStaff } from '@/lib/server/api';
import { STATUS_META, SOURCES, chargedQty, todayIST } from '@/lib/booking-rules';

export const dynamic = 'force-dynamic';

const NAVY = 'FF0E2A47';
const STATUS_FILL: Record<string, string> = {
  awaiting_payment: 'FFFEF3C7', payment_review: 'FFDDF0FC', confirmed: 'FFD1FAE5', completed: 'FFE5E7EB', cancelled: 'FFFEE2E2',
};

/** Formatted Excel export: frozen coloured header, column widths, ₹ number formats, status colours, totals row. */
export const GET = route(async (req: Request) => {
  const s = await requireStaff();
  const rows = await exportBookings(parseFilters(req.url), s);

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Movie Bash';
  const ws = wb.addWorksheet('Bookings', { views: [{ state: 'frozen', ySplit: 1 }] });

  ws.columns = [
    { header: 'Booking ID', key: 'ref', width: 16 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Time', key: 'time', width: 20 },
    { header: 'Branch', key: 'branch', width: 18 },
    { header: 'Theatre', key: 'theatre', width: 18 },
    { header: 'Special person', key: 'special', width: 20 },
    { header: 'Booked by', key: 'name', width: 20 },
    { header: 'WhatsApp', key: 'phone', width: 14 },
    { header: 'Occasion', key: 'occasion', width: 16 },
    { header: 'Package', key: 'package', width: 12 },
    { header: 'Guests', key: 'guests', width: 8 },
    { header: 'Extra persons', key: 'extra', width: 9 },
    { header: 'Extra hours', key: 'xh', width: 8 },
    { header: 'Cake', key: 'cake', width: 22 },
    { header: 'Add-ons / extras', key: 'items', width: 36 },
    { header: 'Discount', key: 'discount', width: 11 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Paid', key: 'paid', width: 12 },
    { header: 'Balance', key: 'balance', width: 12 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Booking via', key: 'source', width: 12 },
    { header: 'Notes', key: 'notes', width: 30 },
    { header: 'Created', key: 'created', width: 18 },
  ];

  for (const r of rows as any[]) {
    const items = (r.items || []).map((i: any) => `${i.name} ×${i.qty}${chargedQty(i) < i.qty ? ` (${i.qty - chargedQty(i)} incl.)` : ''}`).join(', ');
    const row = ws.addRow({
      ref: r.ref, date: new Date(`${r.booking_date}T00:00:00`), time: r.slot_label, branch: r.branch_name, theatre: r.theatre_name,
      special: r.special_person_name, name: r.customer_name, phone: r.whatsapp || r.phone, occasion: r.occasion, package: r.package_name,
      guests: r.guests, extra: r.extra_persons, xh: r.extra_hours, cake: r.cake_name, items, discount: r.discount, total: r.total, paid: r.amount_paid,
      balance: r.total - r.amount_paid, status: STATUS_META[r.status]?.label || r.status,
      source: SOURCES.find((x) => x.value === r.source)?.label || r.source, notes: r.notes,
      created: new Date(r.created_at),
    });
    row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STATUS_FILL[r.status] || 'FFFFFFFF' } };
    if (r.total - r.amount_paid > 0 && r.status !== 'cancelled') row.getCell('balance').font = { bold: true, color: { argb: 'FFB45309' } };
  }

  // Header styling
  const header = ws.getRow(1);
  header.height = 24;
  header.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  });

  // Number formats & alignment
  const money = '"₹"#,##0';
  for (const key of ['discount', 'total', 'paid', 'balance']) ws.getColumn(key).numFmt = money;
  ws.getColumn('date').numFmt = 'dd-mmm-yyyy';
  ws.getColumn('created').numFmt = 'dd-mmm-yyyy hh:mm';
  for (const key of ['guests', 'extra', 'xh', 'status', 'date']) ws.getColumn(key).alignment = { horizontal: 'center', vertical: 'top' };
  for (const key of ['items', 'notes', 'cake']) ws.getColumn(key).alignment = { wrapText: true, vertical: 'top' };
  ws.eachRow((row, n) => {
    if (n === 1) return;
    row.eachCell((c) => { c.border = { bottom: { style: 'thin', color: { argb: 'FFE7DFD1' } } }; });
    if (n % 2 === 0) row.eachCell((c) => { if (!c.fill || (c.fill as any).fgColor?.argb === undefined) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBF7EF' } }; });
  });

  // Totals row
  if (rows.length) {
    const last = ws.rowCount;
    const total = ws.addRow({ ref: 'TOTAL', items: `${rows.length} bookings` });
    for (const key of ['discount', 'total', 'paid', 'balance']) {
      const col = ws.getColumn(key).letter;
      total.getCell(key).value = { formula: `SUM(${col}2:${col}${last})` };
    }
    total.eachCell((c) => { c.font = { bold: true }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDF0FC' } }; });
  }
  ws.autoFilter = { from: 'A1', to: { row: 1, column: ws.columnCount } };

  const buffer = await wb.xlsx.writeBuffer();
  return new Response(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="moviebash-bookings-${todayIST()}.xlsx"`,
    },
  });
});
