// Logbook UC — Configuration
// Edit this file to update dropdown values, then commit + push.
// GitHub Pages will auto-redeploy in ~1 minute.

const CONFIG = {
  // Set after deploying the Cloudflare Worker
  // (cd worker && npm run deploy → copy the URL from output)
  apiUrl: "",

  appTitle: "UC PKG 파라변경이력 부동내역 양식",
  appSubtitle: "Ultium Cells PKG — Parameter Change & Downtime Log",
  site: "UC1-Lordstown",

  dropdowns: {
    line: [
      "1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2", "5-1", "5-2",
      "6-1", "6-2", "7-1", "7-2", "8-1", "8-2", "9-1", "9-2", "10-1", "10-2"
    ],

    machine: [
      "TW — Tab Welder",
      "PC — Pouch / Cell Ass'y",
      "EL — EL Filling & V-Sealer"
    ],

    // Cascading: Unit options filter based on the selected Machine.
    // Source: LGES Operation Manual sections 3.1.1-3.1.96
    machineUnits: {

      "TW — Tab Welder": [
        // Stacked Tray Loader (3.1.1-3.1.6)
        "Stacked Tray Loader — Stacked Tray Conveyor",
        "Stacked Tray Loader — Stacked Tray Diverter",
        "Stacked Tray Loader — Stacked Tray Separator",
        "Stacked Tray Loader — Tray (Empty) Stacker",
        "Stacked Tray Loader — Box Aligner",
        "Stacked Tray Loader — Stacked Tray Barcode Reader",
        // Cell Loader IN (3.1.7-3.1.12)
        "Cell Loader — Cell Pick & Place (#2-Cell)",
        "Cell Loader — Cell Conveyor",
        "Cell Loader — Cell Aligner",
        "Cell Loader — Corner Sealing",
        "Cell Loader — Cell Pick & Place (#LMS In)",
        "Cell Loader — Cell Buffer Stage",
        // Tab Welder (3.1.13-3.1.28)
        "Tab Welder — Cell Carrier (#Pallet) [#1~30]",
        "Tab Welder — LMS Track",
        "Tab Welder — Air Joint & Carrier Clamp",
        "Tab Welder — Carrier Lift [1,2]",
        "Tab Welder — Cell Aligner",
        "Tab Welder — Tab Pre Welder",
        "Tab Welder — Tab Cutter",
        "Tab Welder — Lead Welder",
        "Tab Welder — Tab/Lead Bead Press",
        "Tab Welder — Lead Tape Attacher",
        "Tab Welder — Lead Tape Press",
        "Tab Welder — Lead Tape Vision",
        "Tab Welder — Cell Pick & Place (#180º Turn)",
        "Tab Welder — Cell Short Checker",
        "Tab Welder — Cell Blower & Suction",
        "Tab Welder — Cell Carrier Blow & Suction",
        // Lead Supplier (3.1.29-3.1.39)
        "Lead Supplier — Lead Pallet Pick & Place",
        "Lead Supplier — Lead Pallet Lift",
        "Lead Supplier — Lead Pallet Table",
        "Lead Supplier — Lead Pallet (Used) Table",
        "Lead Supplier — Lead Buffer Shuttle",
        "Lead Supplier — Lead Pick & Place [02C] (#1)",
        "Lead Supplier — Lead 2매 분리 / Separator",
        "Lead Supplier — Lead Pick & Place [02B] (#2)",
        "Lead Supplier — Lead Align Shuttle",
        "Lead Supplier — Lead Align Vision",
        "Lead Supplier — Lead Pick & Place [01A] (#3)",
        // Cell Loader OUT (3.1.40-3.1.45)
        "Cell Loader — Cell Pick & Place (#LMS Out)",
        "Cell Loader — NG Cell Pick & Place [A,B]",
        "Cell Loader — Cell Shuttle (#3-cell)",
        "Cell Loader — NG Cell Table",
        "Cell Loader — Buffer Table (#3-Cell)",
        "Cell Loader — Cell Aligner (#Mecha Align)"
      ],

      "PC — Pouch / Cell Ass'y": [
        // Al Forming (3.1.46-3.1.59)
        "Al Forming — Al Sheet Unwinder",
        "Al Forming — Al Sheet Splicer (Manual)",
        "Al Forming — Al Sheet Feeder",
        "Al Forming — Al Sheet Accumulator",
        "Al Forming — Al Sheet Dancer Roll",
        "Al Forming — Al Sheet Slit Cutter",
        "Al Forming — Pouch Clamp [1,2] (Before/After Forming Press)",
        "Al Forming — Al Sheet Forming Press",
        "Al Forming — Al Sheet Pouch Crack",
        "Al Forming — Pouch Cutter (#Al Sheet Cutter)",
        "Al Forming — Pouch Feeder (#Al Sheet Feeder)",
        "Al Forming — Pouch Embossing Vision",
        "Al Forming — Pouch Align Table",
        "Al Forming — Pouch Pick & Place [1,2]",
        // Cell Ass'y (3.1.60-3.1.69)
        "Cell Ass'y — Pouch Shuttle [1]",
        "Cell Ass'y — Pouch Shuttle [2]",
        "Cell Ass'y — Pouch Top Cutter [A,B]",
        "Cell Ass'y — Cell Pick & Place",
        "Cell Ass'y — Pouch Folding Table",
        "Cell Ass'y — Pouch Folding Knife",
        "Cell Ass'y — Pouch Shuttle [3]",
        "Cell Ass'y — Pouch Sealer [A,B]",
        "Cell Ass'y — Pouch 2nd Sealer [A,B]",
        "Cell Ass'y — Lead Vision"
      ],

      "EL — EL Filling & V-Sealer": [
        // EL Filling & V-Sealer (3.1.70-3.1.96)
        "EL Filling — Cell Pick & Place (Pallet In)",
        "EL Filling — Cell Pick & Place",
        "EL Filling — Cell Align & Rotating Table",
        "EL Filling — Cell Pick & Place [02] (#2-Cell, Pallet In)",
        "EL Filling — NG Table [01]",
        "EL Filling — NG Pick & Place [01] (#2-Cell)",
        "EL Filling — Carrier Shifter [01] (#El In)",
        "EL Filling — Carrier Shifter [02] (#EL Out)",
        "EL Filling — Carrier Shuttle [A] (#Transfer)",
        "EL Filling — Carrier Shuttle [B] (#Transfer)",
        "EL Filling — Pouch Barcode Printer [01a]",
        "EL Filling — Pouch Barcode Reader [01A] (Before Filling)",
        "EL Filling — Weight Inspector [01A] (Before Filling)",
        "EL Filling — EL Filler [A]",
        "EL Filling — Weight Inspector [02A] (After Filling)",
        "EL Filling — Carrier Lift [A] (#Sealer)",
        "EL Filling — Vacuum Chamber / Vacuum Sealer [A]",
        "EL Filling — Cell IR Checker [A]",
        "EL Filling — EL Sub Tank [A]",
        "EL Filling — NG Table [02]",
        "EL Filling — NG Pick & Place [02] (#2-Cell)",
        "EL Filling — Cell Pick & Place [01] (EL Out)",
        "EL Filling — Cell Conveyor (#Pitch)",
        "EL Filling — Cell Pick & Place [02] (#Tray In)",
        "EL Filling — Tray (Empty) Conveyor",
        "EL Filling — Stacked Tray Conveyor",
        "EL Filling — Tray Shift (Cell Unloader Out)"
      ]
    },

    // Component types — limited dropdown for queryable downtime data
    assy: [
      "Cylinder",
      "Sensor",
      "Servo Motor",
      "Geared Motor",
      "Stepper Motor",
      "Bearing",
      "Cable / Wiring",
      "PLC / Controller",
      "HMI",
      "Power Supply",
      "Drive / VFD",
      "Vision System",
      "Pneumatic Valve",
      "Solenoid",
      "Pneumatic Cylinder",
      "Conveyor / Belt",
      "Chain / Sprocket",
      "Limit Switch",
      "Welder Power Supply",
      "Heater / Heating Element",
      "Vacuum Pump",
      "Cooling System",
      "Robot / Pick & Place Mech",
      "Frame / Mechanical",
      "Software / Logic",
      "Network / Comms",
      "Other"
    ],

    type: [
      "BM — Breakdown Maintenance",
      "PD — Production Defect",
      "PM — Preventive Maintenance",
      "잼 / Jam",
      "파단 / Break",
      "생산준비 / Production Prep"
    ]
  }
};
