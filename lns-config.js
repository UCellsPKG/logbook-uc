// Logbook UC — LnS Configuration
// Edit this file to update LnS dropdown values, then commit + push.
// GitHub Pages will auto-redeploy in ~1 minute.
//
// Section/unit hierarchy seeded from POONGSAN GM JV Stacking install manual
// (chapter 5, slides 191-308) and 신진엠텍 GM JV LAMI ESP / LAMI-MONOCELL
// install manuals (chapter 3). Pending engineer review (May 2026).

const CONFIG = {
  // Same Cloudflare Worker as the PKG page. Submissions are tagged with
  // `process` so the two logbooks stay independently filterable on export
  // (see worker/src/index.js + the &process= filter on /export).
  apiUrl: "https://logbook-uc.ucellspkg.workers.dev",

  processLabel: "LnS",
  appTitle: "UC LnS 파라변경이력 부동내역 양식",
  appSubtitle: "Ultium Cells LnS — Parameter Change & Downtime Log",
  site: "UC1-Lordstown",

  dropdowns: {
    // LnS: 10 main lines × 3 sub-lines each = 30 호기.
    line: [
      "1-1", "1-2", "1-3",
      "2-1", "2-2", "2-3",
      "3-1", "3-2", "3-3",
      "4-1", "4-2", "4-3",
      "5-1", "5-2", "5-3",
      "6-1", "6-2", "6-3",
      "7-1", "7-2", "7-3",
      "8-1", "8-2", "8-3",
      "9-1", "9-2", "9-3",
      "10-1", "10-2", "10-3"
    ],

    // 8-section structure: ESP-Loader + LAMI + the 6 STK subsystems split out
    // (D-Stacking → LMS → HalfCell → Taper → Inspection → Unloader). Process
    // flow runs roughly in this order from infeed to outfeed.
    section: [
      "ESP - Loader",
      "LAMI",
      "D-Stacking",
      "LMS",
      "HalfCell",
      "Taper",
      "Inspection",
      "Unloader"
    ],

    // Cascading: Unit options filter based on the selected Section.
    sectionUnits: {

      "ESP - Loader": [
        // 신진엠텍 GM JV LAMI ESP — chapter 3 (Layout & Part Names)
        "Hoist Unit",
        "Unwinding Unit",
        "Guide Roller Unit",
        "Auto Splicing Unit",
        "Manual Splicing Unit",
        "Dancer Unit",
        "Idle Roller Unit",
        "Feeding Roll Stopper Unit",
        "Touch Monitor Unit"
      ],

      "LAMI": [
        // 신진엠텍 GM JV LAMI-MONOCELL — chapter 3 (Layout & Part Names)
        "Unwinder",
        "Splicing Unit",
        "EPC Unit",
        "Dancer Roll",
        "Feeding Roll",
        "Nip Roll (Align)",
        "Suction Conveyor",
        "Suction Blowing Unit",
        "Sepa Sealing Unit",
        "Lami Roll Unit",
        "Inspection Conveyor",
        "Inspection Nip Roll",
        "Vision Test Unit",
        "Short Test Unit",
        "Cutter Unit",
        "Final Cutter Unit",
        "Final C/V",
        "Guide Roll"
      ],

      "D-Stacking": [
        // POONGSAN GM JV Stacking — chapter 5.1.1-5.1.12
        "[Lower] Cell. Loading C/V",
        "[Upper] Cell. Loading C/V",
        "[01],[02] Cell. NG BOX",
        "Cell. Lower Separator Vision",
        "Cell. Pusher",
        "[01/A]~[03/B] Cell. Gripper",
        "Cell. Align Vision",
        "Cell Align Table",
        "Table Transfer Linear",
        "Cell. Stack Vision",
        "Stacked Cell. Transfer",
        "Stacked Cell. Gripper"
      ],

      "LMS": [
        // POONGSAN GM JV Stacking — chapter 5.1.13-5.1.22
        "Stacked Cell. Shuttle (#1~#16)",
        "[01]~[05] LMS. Stacked Cell Clamp Air Supply",
        "Shuttle. In Lift",
        "Shuttle. Out Lift",
        "Shuttle. Blow & Suction Cleaner",
        "Shuttle. Buffer01",
        "Shuttle. Buffer02",
        "Stacked Cell. NG Pick & Place",
        "Stacked Cell. NG BOX",
        "Stacked Cell. Rotate"
      ],

      "HalfCell": [
        // POONGSAN GM JV Stacking — chapter 5.1.23-5.1.34
        "[A]~[C] Half Cell. Magazine",
        "Half Cell. Vibrator",
        "Half Cell. Pick & Place",
        "Half Cell. Thickness Inspector",
        "Half Cell. Rotate",
        "[A] Half Cell. NG Box",
        "[B] Half Cell. NG Box",
        "Half Cell. Buffer Table",
        "Half Cell. Vision NG Box",
        "Half Cell. Scara Robot",
        "Half Cell. Vision",
        "Half Cell. LMS Vision"
      ],

      "Taper": [
        // POONGSAN GM JV Stacking — chapter 5.1.35-5.1.41
        "Stacked Cell. Press",
        "[01]~[06] Tape.",
        "[01]~[06] Tape. Upper Clamp",
        "[01]~[06] Tape. Lower Clamp",
        "[01]~[06] Tape. Tape Supply",
        "[01]~[06] Tape. Cutter",
        "NG Tape. Receiver"
      ],

      "Inspection": [
        // POONGSAN GM JV Stacking — chapter 5.1.42-5.1.56
        "[01] Taped Cell. Pick & Place",
        "[Upper/Lower] Taped Cell. Vision",
        "[4-Side] Taped Cell. Vision",
        "Taped Cell. Rotating Table",
        "Taped Cell. Pick & Place",
        "Taped Cell. Weight Inspector",
        "Taped Cell. Rotate",
        "Taped Cell. Shuttle",
        "Taped Cell. Short, Thickness Inspector",
        "[01] Cell. BCR",
        "[02] Cell. BCR",
        "NG Taped Cell. Transfer",
        "[01]~[04] NG BOX",
        "NG Box Transfer",
        "OK Taped Cell. Transfer"
      ],

      "Unloader": [
        // POONGSAN GM JV Stacking — chapter 5.1.57-5.1.67
        "Taped Cell. Conveyor",
        "Taped Cell. Align",
        "Taped Cell. Pick & Place",
        "[01]~[02] Taped Cell. Lift",
        "[01]~[02] Tray(Empty). Conveyor",
        "Tray(Empty). Conveyor",
        "Tray. Conveyor",
        "[A]~[B] Tray. Lift",
        "Tray. Cleaner",
        "Tray. Conveyor Free Roller",
        "Tray(Empty). Conveyor Free Roller"
      ]
    },

    // LnS has no Anode/Cathode split (unlike PKG's Tab Welder). Empty array
    // means the field stays hidden — app.js's updateAcVisibility only shows
    // the AC field when Section === "Tab Welder", which doesn't exist here.
    anodeCathode: [],

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
      "Heater / Heating Element",
      "Vacuum Pump",
      "Cooling System",
      "Robot / Pick & Place Mech",
      "Lami Roll / Heated Roll",
      "Cutter / Knife",
      "Tape Supply",
      "Shuttle / LMS",
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
