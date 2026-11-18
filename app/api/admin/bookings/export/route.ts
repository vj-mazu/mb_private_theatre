import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore, getDb } from '@/lib/db';
import { formatBookingSlotTime } from '@/lib/slot-engine';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Staff cannot export commercial financial data
  if (session.role === 'staff') {
    return NextResponse.json({ 
      success: false, 
      error: 'Access denied: Exporting booking records is restricted to administrators' 
    }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const branch = searchParams.get('branch');
  const status = searchParams.get('status');
  const format = (searchParams.get('format') || 'xlsx').toLowerCase();

  // Retrieve bookings from SQLite with DB joins, falling back to mockStore
  let list: any[] = [];
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT b.*,
             br.name as branch_name,
             th.name as theatre_name, th.emoji as theatre_emoji,
             ts.start_time as slot_start, ts.end_time as slot_end,
             oc.name as occasion_name
      FROM bookings b
      LEFT JOIN branches br ON b.branch_id = br.id
      LEFT JOIN theatres th ON b.theatre_id = th.id
      LEFT JOIN time_slots ts ON b.slot_id = ts.id
      LEFT JOIN occasions oc ON b.occasion_id = oc.id
      WHERE b.is_deleted = 0
      ORDER BY b.booking_date DESC, b.id DESC
    `).all();
    list = rows && rows.length > 0 ? rows : [...mockStore.bookings.filter((b: any) => b.is_deleted === 0)];
  } catch {
    list = mockStore.bookings.filter((b: any) => b.is_deleted === 0);
  }

  // Apply Role / Branch / Date / Status filters
  if (session.role === 'branch_manager' && session.branch_id) {
    list = list.filter((b: any) => b.branch_id === session.branch_id);
  } else if (branch && branch !== 'all') {
    list = list.filter((b: any) => b.branch_id === Number(branch));
  }

  if (date && date !== 'all') {
    list = list.filter((b: any) => b.booking_date === date);
  }

  if (status && status !== 'all') {
    list = list.filter((b: any) => b.status === status);
  }

  // Enrich any missing foreign data
  const enrichedList = list.map((b: any) => {
    const br = mockStore.branches.find((x: any) => x.id === b.branch_id);
    const th = mockStore.theatres.find((x: any) => x.id === b.theatre_id);
    const sl = mockStore.timeSlots.find((x: any) => x.id === b.slot_id);
    const extraHours = Math.max(0, Number(b.extra_hours || 0));
    const slotTime = b.slot_start && b.slot_end 
      ? formatBookingSlotTime(b.slot_start, b.slot_end, extraHours)
      : sl 
      ? formatBookingSlotTime(sl.start_time, sl.end_time, extraHours)
      : (b.slot_time || 'Showtime');

    return {
      ...b,
      booking_ref: b.booking_ref || `MB-${b.id}`,
      customer_name: b.customer_name || 'Guest',
      customer_phone: String(b.customer_phone || '').trim(),
      booking_date: b.booking_date,
      slot_time: slotTime,
      duration: `${2 + extraHours} Hours`,
      extra_hours: extraHours,
      branch_name: b.branch_name || br?.name || (b.branch_id === 2 ? 'BTM 2nd Stage' : 'Electronic City'),
      theatre_name: b.theatre_name || th?.name || 'Screen Suite',
      guests: Number(b.guests || 2),
      occasion_name: b.occasion_name || 'Celebration',
      total: Number(b.total || 0),
      advance_paid: Number(b.advance_paid || 0),
      balance: Number(b.balance || 0),
      status: b.status || 'confirmed',
      created_at: b.created_at || new Date().toISOString()
    };
  });

  const timestamp = new Date().toISOString().split('T')[0];

  // ---------------------------------------------------------------------------
  // CSV Export Format (with text-escaped phone to stop scientific notation 9.585E+09)
  // ---------------------------------------------------------------------------
  if (format === 'csv') {
    const headers = [
      'Booking Ref',
      'Customer Name',
      'Phone Number',
      'Date',
      'Showtime Slot',
      'Duration',
      'Extra Hours',
      'Branch',
      'Theatre',
      'Guests',
      'Occasion',
      'Total',
      'Paid',
      'Balance',
      'Status',
      'Created At'
    ];

    const rows = [headers.join(',')];

    enrichedList.forEach((b: any) => {
      // ="9585..." ensures Excel reads phone strictly as string rather than scientific notation
      const safePhone = `="${b.customer_phone}"`;
      rows.push([
        `"${b.booking_ref}"`,
        `"${b.customer_name.replace(/"/g, '""')}"`,
        safePhone,
        `"${b.booking_date}"`,
        `"${b.slot_time.replace(/"/g, '""')}"`,
        `"${b.duration}"`,
        b.extra_hours,
        `"${b.branch_name.replace(/"/g, '""')}"`,
        `"${b.theatre_name.replace(/"/g, '""')}"`,
        b.guests,
        `"${b.occasion_name.replace(/"/g, '""')}"`,
        b.total,
        b.advance_paid,
        b.balance,
        `"${b.status}"`,
        `"${b.created_at}"`
      ].join(','));
    });

    const csvContent = rows.join('\r\n');
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="movie_bash_bookings_${date || timestamp}.csv"`
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Professional Excel Workbook (.xlsx) with Colors, Alignment, Widths, Borders
  // ---------------------------------------------------------------------------
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Movie Bash Private Cinema';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Bookings Report', {
    views: [{ showGridLines: true }]
  });

  // 1. Title Banner (Row 1)
  worksheet.mergeCells('A1:P1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '🎬 MOVIE BASH — PRIVATE CINEMA BOOKINGS REPORT';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Deep Navy
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 36;

  // 2. Subtitle / Summary Banner (Row 2)
  worksheet.mergeCells('A2:P2');
  const subCell = worksheet.getCell('A2');
  const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const venueLabel = branch && branch !== 'all' ? (branch === '2' ? 'BTM 2nd Stage' : 'Electronic City') : 'All Branches';
  const dateLabel = date && date !== 'all' ? date : 'All Dates';
  subCell.value = `Exported on: ${nowIST} | Venue: ${venueLabel} | Filter Date: ${dateLabel} | Total Bookings: ${enrichedList.length}`;
  subCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF9A3412' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } }; // Light Amber
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 22;

  // Blank separator row (Row 3)
  worksheet.getRow(3).height = 8;

  // 3. Column Widths
  const columnWidths = [
    { key: 'ref', width: 22 },          // Col A: Booking Ref
    { key: 'name', width: 22 },         // Col B: Customer Name
    { key: 'phone', width: 18 },        // Col C: Phone Number
    { key: 'date', width: 14 },         // Col D: Date
    { key: 'slot', width: 28 },         // Col E: Showtime Slot
    { key: 'duration', width: 14 },     // Col F: Duration
    { key: 'extra_hours', width: 13 },  // Col G: Extra Hours
    { key: 'branch', width: 24 },       // Col H: Branch
    { key: 'theatre', width: 20 },      // Col I: Theatre
    { key: 'guests', width: 10 },       // Col J: Guests
    { key: 'occasion', width: 18 },     // Col K: Occasion
    { key: 'total', width: 16 },        // Col L: Total (₹)
    { key: 'paid', width: 16 },         // Col M: Paid (₹)
    { key: 'balance', width: 16 },      // Col N: Balance (₹)
    { key: 'status', width: 16 },       // Col O: Status
    { key: 'created_at', width: 22 }    // Col P: Created At
  ];
  columnWidths.forEach((col, idx) => {
    worksheet.getColumn(idx + 1).width = col.width;
  });

  // 4. Table Header Row (Row 4)
  const headerLabels = [
    'Booking Ref',
    'Customer Name',
    'Phone Number',
    'Date',
    'Showtime Slot',
    'Duration',
    'Extra Hours',
    'Branch / Venue',
    'Theatre / Screen',
    'Guests',
    'Occasion',
    'Total (₹)',
    'Paid (₹)',
    'Balance (₹)',
    'Status',
    'Created At'
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.values = headerLabels;
  headerRow.height = 30;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Dark Slate
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0F172A' } },
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FF334155' } }
    };
  });

  // 5. Data Rows (Starting at Row 5)
  let grandTotalSum = 0;
  let advancePaidSum = 0;
  let balanceSum = 0;

  enrichedList.forEach((b: any, index: number) => {
    const rowNum = 5 + index;
    const row = worksheet.getRow(rowNum);
    row.height = 24;

    grandTotalSum += b.total;
    advancePaidSum += b.advance_paid;
    balanceSum += b.balance;

    const isEven = index % 2 === 0;
    const defaultBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Clean zebra striping

    // Values assignment
    row.getCell(1).value = b.booking_ref;
    row.getCell(2).value = b.customer_name;
    // Explicit string formatting for Phone prevents Excel's scientific notation (9.585E+09)
    row.getCell(3).value = b.customer_phone;
    row.getCell(3).numFmt = '@';
    row.getCell(4).value = b.booking_date;
    row.getCell(5).value = b.slot_time;
    row.getCell(6).value = b.duration;
    row.getCell(7).value = b.extra_hours;
    row.getCell(8).value = b.branch_name;
    row.getCell(9).value = b.theatre_name;
    row.getCell(10).value = b.guests;
    row.getCell(11).value = b.occasion_name;
    row.getCell(12).value = b.total;
    row.getCell(13).value = b.advance_paid;
    row.getCell(14).value = b.balance;
    row.getCell(15).value = b.status.toUpperCase();
    row.getCell(16).value = b.created_at;

    // Formatting & Alignments
    for (let c = 1; c <= 16; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Alignment rules
      if ([1, 3, 4, 5, 6, 7, 10, 16].includes(c)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if ([2, 8, 9, 11].includes(c)) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else if ([12, 13, 14].includes(c)) {
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.numFmt = '₹#,##0';
      }
    }

    // Ref column bold styling
    row.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };

    // Status Badge Color Styling
    const statusCell = row.getCell(15);
    const st = String(b.status).toLowerCase();
    if (st === 'confirmed') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Light Green
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF15803D' } }; // Dark Green
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
    } else if (st === 'pending') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Light Amber
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB45309' } };
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
    } else if (st === 'cancelled') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Light Red
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB91C1C' } };
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  // 6. Summary Total Row (At the bottom)
  const summaryRowIndex = 5 + enrichedList.length;
  const summaryRow = worksheet.getRow(summaryRowIndex);
  summaryRow.height = 28;

  worksheet.mergeCells(`A${summaryRowIndex}:K${summaryRowIndex}`);
  const sumLabelCell = worksheet.getCell(`A${summaryRowIndex}`);
  sumLabelCell.value = `GRAND TOTAL (${enrichedList.length} BOOKINGS)`;
  sumLabelCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  sumLabelCell.alignment = { vertical: 'middle', horizontal: 'right' };

  summaryRow.getCell(12).value = grandTotalSum;
  summaryRow.getCell(12).numFmt = '₹#,##0';
  summaryRow.getCell(13).value = advancePaidSum;
  summaryRow.getCell(13).numFmt = '₹#,##0';
  summaryRow.getCell(14).value = balanceSum;
  summaryRow.getCell(14).numFmt = '₹#,##0';

  for (let c = 1; c <= 16; c++) {
    const cell = summaryRow.getCell(c);
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF475569' } },
      bottom: { style: 'double', color: { argb: 'FF0F172A' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  }

  // Generate buffer and send response
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as any, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="movie_bash_bookings_${date || timestamp}.xlsx"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
