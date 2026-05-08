// One-shot script: generate an Excel file of all current LnS Unit dropdown
// values, pre-filled with proposed Section mapping seeded from the install
// manuals. Run from the worker/ dir:
//   node gen-unit-list-lns.mjs

import ExcelJS from 'exceljs';

// [machine, subsystem, unit, proposedSection]
// Sources:
//   ESP   — 신진엠텍 GM JV LAMI ESP Install Manual (chapter 3)
//   LAMI  — 신진엠텍 GM JV LAMI-MONOCELL Install Manual (chapter 3)
//   STK   — POONGSAN GM JV Stacking Install Manual V1.0 (chapter 5.1.1-5.1.67)
const rows = [
  // ===== ESP — Electrode Supply (front of LAMI line) =====
  ["ESP — Electrode Supply", "ESP", "Hoist Unit", "ESP - Loader"],
  ["ESP — Electrode Supply", "ESP", "Unwinding Unit", "ESP - Loader"],
  ["ESP — Electrode Supply", "ESP", "Guide Roller Unit", "ESP - Loader"],
  ["ESP — Electrode Supply", "ESP", "Auto Splicing Unit", "ESP - Loader"],
  ["ESP — Electrode Supply", "ESP", "Manual Splicing Unit", "ESP - Loader"],
  ["ESP — Electrode Supply", "ESP", "Dancer Unit", "ESP - Loader"],
  ["ESP — Electrode Supply", "ESP", "Idle Roller Unit", "ESP - Loader"],
  ["ESP — Electrode Supply", "ESP", "Feeding Roll Stopper Unit", "ESP - Loader"],
  ["ESP — Electrode Supply", "ESP", "Touch Monitor Unit", "ESP - Loader"],

  // ===== LAMI — Lamination Monocell =====
  ["LAMI — Lamination Monocell", "LAMI", "Unwinder", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Splicing Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "EPC Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Dancer Roll", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Feeding Roll", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Nip Roll (Align)", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Suction Conveyor", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Suction Blowing Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Sepa Sealing Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Lami Roll Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Inspection Conveyor", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Inspection Nip Roll", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Vision Test Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Short Test Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Cutter Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Final Cutter Unit", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Final C/V", "LAMI"],
  ["LAMI — Lamination Monocell", "LAMI", "Guide Roll", "LAMI"],

  // ===== STK — Stacking =====
  // D-Stacking (5.1.1-5.1.12) → D-Stacking
  ["STK — Stacking", "D-Stacking", "[Lower] Cell. Loading C/V", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "[Upper] Cell. Loading C/V", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "[01],[02] Cell. NG BOX", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "Cell. Lower Separator Vision", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "Cell. Pusher", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "[01/A]~[03/B] Cell. Gripper", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "Cell. Align Vision", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "Cell Align Table", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "Table Transfer Linear", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "Cell. Stack Vision", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "Stacked Cell. Transfer", "D-Stacking"],
  ["STK — Stacking", "D-Stacking", "Stacked Cell. Gripper", "D-Stacking"],
  // LMS (5.1.13-5.1.22) → LMS
  ["STK — Stacking", "LMS", "Stacked Cell. Shuttle (#1~#16)", "LMS"],
  ["STK — Stacking", "LMS", "[01]~[05] LMS. Stacked Cell Clamp Air Supply", "LMS"],
  ["STK — Stacking", "LMS", "Shuttle. In Lift", "LMS"],
  ["STK — Stacking", "LMS", "Shuttle. Out Lift", "LMS"],
  ["STK — Stacking", "LMS", "Shuttle. Blow & Suction Cleaner", "LMS"],
  ["STK — Stacking", "LMS", "Shuttle. Buffer01", "LMS"],
  ["STK — Stacking", "LMS", "Shuttle. Buffer02", "LMS"],
  ["STK — Stacking", "LMS", "Stacked Cell. NG Pick & Place", "LMS"],
  ["STK — Stacking", "LMS", "Stacked Cell. NG BOX", "LMS"],
  ["STK — Stacking", "LMS", "Stacked Cell. Rotate", "LMS"],
  // HalfCell (5.1.23-5.1.34) → HalfCell
  ["STK — Stacking", "HalfCell", "[A]~[C] Half Cell. Magazine", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. Vibrator", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. Pick & Place", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. Thickness Inspector", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. Rotate", "HalfCell"],
  ["STK — Stacking", "HalfCell", "[A] Half Cell. NG Box", "HalfCell"],
  ["STK — Stacking", "HalfCell", "[B] Half Cell. NG Box", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. Buffer Table", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. Vision NG Box", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. Scara Robot", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. Vision", "HalfCell"],
  ["STK — Stacking", "HalfCell", "Half Cell. LMS Vision", "HalfCell"],
  // Taper (5.1.35-5.1.41) → Taper
  ["STK — Stacking", "Taper", "Stacked Cell. Press", "Taper"],
  ["STK — Stacking", "Taper", "[01]~[06] Tape.", "Taper"],
  ["STK — Stacking", "Taper", "[01]~[06] Tape. Upper Clamp", "Taper"],
  ["STK — Stacking", "Taper", "[01]~[06] Tape. Lower Clamp", "Taper"],
  ["STK — Stacking", "Taper", "[01]~[06] Tape. Tape Supply", "Taper"],
  ["STK — Stacking", "Taper", "[01]~[06] Tape. Cutter", "Taper"],
  ["STK — Stacking", "Taper", "NG Tape. Receiver", "Taper"],
  // Inspection (5.1.42-5.1.56) → Inspection
  ["STK — Stacking", "Inspection", "[01] Taped Cell. Pick & Place", "Inspection"],
  ["STK — Stacking", "Inspection", "[Upper/Lower] Taped Cell. Vision", "Inspection"],
  ["STK — Stacking", "Inspection", "[4-Side] Taped Cell. Vision", "Inspection"],
  ["STK — Stacking", "Inspection", "Taped Cell. Rotating Table", "Inspection"],
  ["STK — Stacking", "Inspection", "Taped Cell. Pick & Place", "Inspection"],
  ["STK — Stacking", "Inspection", "Taped Cell. Weight Inspector", "Inspection"],
  ["STK — Stacking", "Inspection", "Taped Cell. Rotate", "Inspection"],
  ["STK — Stacking", "Inspection", "Taped Cell. Shuttle", "Inspection"],
  ["STK — Stacking", "Inspection", "Taped Cell. Short, Thickness Inspector", "Inspection"],
  ["STK — Stacking", "Inspection", "[01] Cell. BCR", "Inspection"],
  ["STK — Stacking", "Inspection", "[02] Cell. BCR", "Inspection"],
  ["STK — Stacking", "Inspection", "NG Taped Cell. Transfer", "Inspection"],
  ["STK — Stacking", "Inspection", "[01]~[04] NG BOX", "Inspection"],
  ["STK — Stacking", "Inspection", "NG Box Transfer", "Inspection"],
  ["STK — Stacking", "Inspection", "OK Taped Cell. Transfer", "Inspection"],
  // Unloader (5.1.57-5.1.67) → Unloader
  ["STK — Stacking", "Unloader", "Taped Cell. Conveyor", "Unloader"],
  ["STK — Stacking", "Unloader", "Taped Cell. Align", "Unloader"],
  ["STK — Stacking", "Unloader", "Taped Cell. Pick & Place", "Unloader"],
  ["STK — Stacking", "Unloader", "[01]~[02] Taped Cell. Lift", "Unloader"],
  ["STK — Stacking", "Unloader", "[01]~[02] Tray(Empty). Conveyor", "Unloader"],
  ["STK — Stacking", "Unloader", "Tray(Empty). Conveyor", "Unloader"],
  ["STK — Stacking", "Unloader", "Tray. Conveyor", "Unloader"],
  ["STK — Stacking", "Unloader", "[A]~[B] Tray. Lift", "Unloader"],
  ["STK — Stacking", "Unloader", "Tray. Cleaner", "Unloader"],
  ["STK — Stacking", "Unloader", "Tray. Conveyor Free Roller", "Unloader"],
  ["STK — Stacking", "Unloader", "Tray(Empty). Conveyor Free Roller", "Unloader"],
];

const wb = new ExcelJS.Workbook();
wb.creator = 'Logbook UC';
wb.created = new Date();

// ===== Sheet 1: Instructions =====
const inst = wb.addWorksheet('Instructions');
inst.columns = [{ width: 110 }];
inst.getCell('A1').value = 'Logbook UC — LnS Unit List Review';
inst.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF003DA5' } };
inst.getCell('A2').value = '';
inst.getCell('A3').value = 'Adam asked you to review the Unit dropdown options for the LnS (Lamination & Stacking) parameter-change / downtime logger.';
inst.getCell('A4').value = 'The "Unit List" tab below has every current option, organized by source manual (ESP / LAMI / STK) and subsystem.';
inst.getCell('A5').value = '';
inst.getCell('A6').value = 'Please fill in / correct these columns:';
inst.getCell('A6').font = { bold: true };
inst.getCell('A7').value = '  • Proposed Section: which of the 8 sections this unit belongs to (ESP - Loader / LAMI / D-Stacking / LMS / HalfCell / Taper / Inspection / Unloader). Pre-filled with my best guess from the install manuals — please confirm or override. NOTE: LMS is currently its own section because it shuttles between D-Stacking, HalfCell, and Taper. Tell me if you would rather fold those LMS units into HalfCell or Taper.';
inst.getCell('A8').value = '  • Cleaned Unit Name: optionally suggest a shorter / cleaner name. Will be the value the engineer sees in the dropdown.';
inst.getCell('A9').value = '  • Add / Remove: mark rows to delete with "DELETE", or add new rows at the bottom with the same column structure. The current list pulls 9 ESP, 17 LAMI, 67 STK = ~93 units; flag duplicates between LAMI and STK if you spot any (e.g. multiple "Vision" units).';
inst.getCell('A10').value = '  • Line numbering: LnS uses 10 main lines × 3 sub-lines each = 30 호기 (1-1, 1-2, 1-3 .. 10-1, 10-2, 10-3). Flag in Notes if this is wrong.';
inst.getCell('A11').value = '  • Notes: anything else worth flagging.';
inst.getCell('A12').value = '';
inst.getCell('A13').value = 'Save and email back to Adam.';
inst.getCell('A13').font = { italic: true };
[3, 4, 7, 8, 9, 10, 11].forEach(r => { inst.getRow(r).alignment = { wrapText: true, vertical: 'top' }; });

// ===== Sheet 2: Unit List =====
const ws = wb.addWorksheet('Unit List', {
  views: [{ state: 'frozen', ySplit: 1 }],
});
ws.columns = [
  { header: 'Source Manual', key: 'machine', width: 30 },
  { header: 'Subsystem', key: 'subsystem', width: 16 },
  { header: 'Current Unit Name', key: 'unit', width: 50 },
  { header: 'Proposed Section', key: 'section', width: 18 },
  { header: 'Cleaned Unit Name (optional)', key: 'clean', width: 36 },
  { header: 'Add / Remove', key: 'addrm', width: 14 },
  { header: 'Notes', key: 'notes', width: 40 },
];

for (const [machine, subsystem, unit, section] of rows) {
  ws.addRow({ machine, subsystem, unit, section, clean: '', addrm: '', notes: '' });
}

// Style header row
const header = ws.getRow(1);
header.height = 24;
header.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
header.alignment = { horizontal: 'left', vertical: 'middle' };
header.eachCell(cell => {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003DA5' } };
  cell.border = { bottom: { style: 'thin', color: { argb: 'FF002A73' } } };
});

// Subtle banding by source manual for readability
let prevMachine = null;
let band = false;
ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
  if (rowNumber === 1) return;
  const machine = row.getCell(1).value;
  if (machine !== prevMachine) {
    band = !band;
    prevMachine = machine;
  }
  if (band) {
    row.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FA' } };
    });
  }
});

const out = '../Logbook UC - LnS Unit List for Engineer Review.xlsx';
await wb.xlsx.writeFile(out);
console.log(`Wrote ${rows.length} rows → ${out}`);
