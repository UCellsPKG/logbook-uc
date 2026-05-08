// Logbook UC — Configuration
// Edit this file to update dropdown values, then commit + push.
// GitHub Pages will auto-redeploy in ~1 minute.

const CONFIG = {
  // Set after deploying the Cloudflare Worker
  // (cd worker && npm run deploy → copy the URL from output)
  apiUrl: "https://logbook-uc.ucellspkg.workers.dev",

  appTitle: "UC PKG 파라변경이력 부동내역 양식",
  appSubtitle: "Ultium Cells PKG — Parameter Change & Downtime Log",
  site: "UC1-Lordstown",

  dropdowns: {
    line: [
      "1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2", "5-1", "5-2",
      "6-1", "6-2", "7-1", "7-2", "8-1", "8-2", "9-1", "9-2", "10-1", "10-2"
    ],

    // 6-section structure refined by production engineering review — physical
    // line layout from infeed to outfeed.
    section: [
      "Loader",
      "Tab Welder",
      "Pouch Forming",
      "Cell Ass'y",
      "EL Filling",
      "Unloader"
    ],

    // Cascading: Unit options filter based on the selected Section.
    // Source: LGES Operation Manual sections 3.1.1-3.1.96, with subsystem
    // → section assignments per engineering review (Ansik Park, May 2026).
    sectionUnits: {

      "Loader": [
        // Stacked Tray Loader (3.1.1-3.1.6)
        "Stacked Tray Conveyor",
        "Stacked Tray Diverter",
        "Stacked Tray Separator",
        "Tray (Empty) Stacker",
        "Box Aligner",
        "Stacked Tray Barcode Reader"
      ],

      "Tab Welder": [
        // Cell Loader IN (3.1.7-3.1.12) — moved here per engineering review
        "Cell Pick & Place (#2-Cell)",
        "Cell Conveyor",
        "Cell Aligner (Loader)",
        "Corner Sealing",
        "Cell Pick & Place (#LMS In)",
        "Cell Buffer Stage",
        // Tab Welder (3.1.13-3.1.28)
        "Cell Carrier (#Pallet) [#1~30]",
        "LMS Track",
        "Air Joint & Carrier Clamp",
        "Carrier Lift [1,2]",
        "Cell Aligner",
        "Tab Pre Welder",
        "Tab Cutter",
        "Lead Welder",
        "Tab/Lead Bead Press",
        "Lead Tape Attacher",
        "Lead Tape Press",
        "Lead Tape Vision",
        "Cell Pick & Place (#180º Turn)",
        "Cell Short Checker",
        "Cell Blower & Suction",
        "Cell Carrier Blow & Suction",
        // Lead Supplier (3.1.29-3.1.39)
        "Lead Pallet Pick & Place",
        "Lead Pallet Lift",
        "Lead Pallet Table",
        "Lead Pallet (Used) Table",
        "Lead Buffer Shuttle",
        "Lead Pick & Place [02C] (#1)",
        "Lead 2매 분리 / Separator",
        "Lead Pick & Place [02B] (#2)",
        "Lead Align Shuttle",
        "Lead Align Vision",
        "Lead Pick & Place [01A] (#3)",
        // Cell Loader OUT (3.1.40) — only LMS Out moved here per review
        "Cell Pick & Place (#LMS Out)"
      ],

      "Pouch Forming": [
        // Al Forming (3.1.46-3.1.59)
        "Al Sheet Unwinder",
        "Al Sheet Splicer (Manual)",
        "Al Sheet Feeder",
        "Al Sheet Accumulator",
        "Al Sheet Dancer Roll",
        "Al Sheet Slit Cutter",
        "Pouch Clamp [1,2] (Before/After Forming Press)",
        "Al Sheet Forming Press",
        "Al Sheet Pouch Crack",
        "Pouch Cutter (#Al Sheet Cutter)",
        "Pouch Feeder (#Al Sheet Feeder)",
        "Pouch Embossing Vision",
        "Pouch Align Table",
        "Pouch Pick & Place [1,2]"
      ],

      "Cell Ass'y": [
        // Cell Ass'y (3.1.60-3.1.69)
        "Pouch Shuttle [1]",
        "Pouch Shuttle [2]",
        "Pouch Top Cutter [A,B]",
        "Cell Pick & Place",
        "Pouch Folding Table",
        "Pouch Folding Knife",
        "Pouch Shuttle [3]",
        "Pouch Sealer [A,B]",
        "Pouch 2nd Sealer [A,B]",
        "Lead Vision",
        // Cell Loader OUT (3.1.41-3.1.45) — moved here per engineering review
        "NG Cell Pick & Place [A,B]",
        "Cell Shuttle (#3-cell)",
        "NG Cell Table",
        "Buffer Table (#3-Cell)",
        "Cell Aligner (#Mecha Align)"
      ],

      "EL Filling": [
        // EL Filling & V-Sealer (3.1.70-3.1.93)
        "Cell Pick & Place (Pallet In)",
        "Cell Pick & Place",
        "Cell Align & Rotating Table",
        "Cell Pick & Place [02] (#2-Cell, Pallet In)",
        "NG Table [01]",
        "NG Pick & Place [01] (#2-Cell)",
        "Carrier Shifter [01] (#El In)",
        "Carrier Shifter [02] (#EL Out)",
        "Carrier Shuttle [A] (#Transfer)",
        "Carrier Shuttle [B] (#Transfer)",
        "Pouch Barcode Printer [01a]",
        "Pouch Barcode Reader [01A] (Before Filling)",
        "Weight Inspector [01A] (Before Filling)",
        "EL Filler [A]",
        "Weight Inspector [02A] (After Filling)",
        "Carrier Lift [A] (#Sealer)",
        "Vacuum Chamber / Vacuum Sealer [A]",
        "Cell IR Checker [A]",
        "EL Sub Tank [A]",
        "NG Table [02]",
        "NG Pick & Place [02] (#2-Cell)",
        "Cell Pick & Place [01] (EL Out)",
        "Cell Conveyor (#Pitch)",
        "Cell Pick & Place [02] (#Tray In)"
      ],

      "Unloader": [
        // EL Filling tail (3.1.94-3.1.96) — moved here per engineering review
        "Tray (Empty) Conveyor",
        "Stacked Tray Conveyor",
        "Tray Shift (Cell Unloader Out)"
      ]
    },

    // Conditional dropdown — appears only when Section === "Tab Welder".
    anodeCathode: ["Anode", "Cathode", "Both"],

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
