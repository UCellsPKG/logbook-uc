(function () {
  "use strict";

  // Active tab is held in a JS variable, not localStorage.
  let activeTab = "para";

  // Active language: "bi" (default), "ko", or "en". Held in a JS variable.
  let activeLang = "bi";

  // Localized strings for content the JS generates dynamically.
  // Bilingual (bi) format mirrors the form labels: Korean / English.
  const STRINGS = {
    requiredField: {
      ko: "필수 입력",
      en: "Required",
      bi: "Required / 필수 입력",
    },
    durationLabel: {
      ko: "지속시간",
      en: "Duration",
      bi: "지속시간 / Duration",
    },
    durationUnit: {
      ko: "분",
      en: "min",
      bi: "min",
    },
    durationPlaceholder: {
      ko: "—",
      en: "—",
      bi: "—",
    },
    recoveryBeforeShort: {
      ko: "복구가 발생보다 빠름",
      en: "recovery is before occurrence",
      bi: "recovery is before occurrence",
    },
    recoveryBeforeError: {
      ko: "복구 시간은 발생 시간 이후여야 합니다.",
      en: "Recovery time must be at or after occurrence time.",
      bi: "Recovery time must be at or after occurrence time.",
    },
    statusSubmitting: {
      ko: "⏳ 제출 중…",
      en: "⏳ Submitting…",
      bi: "⏳ Submitting…",
    },
    statusSuccess: {
      ko: "✅ Sheet에 저장되고 Teams에 전송되었습니다",
      en: "✅ Saved to Sheet & posted to Teams",
      bi: "✅ Saved to Sheet & posted to Teams",
    },
    statusFailPrefix: {
      ko: "⚠️ 저장 실패 — 수동으로 복사하여 Adam에게 알리세요",
      en: "⚠️ Save failed — copy text manually and notify Adam",
      bi: "⚠️ Save failed — copy text manually and notify Adam",
    },
    statusInfoNoBackend: {
      ko: "ℹ️ 백엔드 미설정 — 아래 텍스트를 복사해 수동으로 공유하세요.",
      en: "ℹ️ Backend not configured — copy text below to share manually.",
      bi: "ℹ️ Backend not configured — copy text below to share manually.",
    },
  };

  function t(key) {
    const entry = STRINGS[key];
    if (!entry) return "";
    return entry[activeLang] != null ? entry[activeLang] : entry.bi;
  }

  // ----- Helpers -----

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Returns "YYYY-MM-DDTHH:MM" in local time, suitable for datetime-local inputs.
  function nowLocalDateTimeString() {
    const d = new Date();
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  }

  // Converts a datetime-local value ("YYYY-MM-DDTHH:MM") to "YYYY-MM-DD HH:MM".
  function formatDateTime(value) {
    if (!value) return "";
    return value.replace("T", " ").slice(0, 16);
  }

  // Returns minutes between two datetime-local strings, or null if either missing.
  function diffMinutes(startStr, endStr) {
    if (!startStr || !endStr) return null;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    return Math.round((end - start) / 60000);
  }

  // ----- Dropdown population -----

  function populateSelect(selectEl, options, placeholder) {
    selectEl.innerHTML = "";
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = placeholder || "— Select —";
    blank.disabled = true;
    blank.selected = true;
    selectEl.appendChild(blank);

    options.forEach(function (opt) {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      selectEl.appendChild(o);
    });
  }

  function populateAllDropdowns() {
    const d = CONFIG.dropdowns;

    // Para Change tab
    populateSelect(document.getElementById("para-line"), d.line);
    populateSelect(document.getElementById("para-machine"), d.machine);
    populateSelect(document.getElementById("para-assy"), d.assy);
    populateUnitFor("para");

    // Downtime tab
    populateSelect(document.getElementById("dt-type"), d.type);
    populateSelect(document.getElementById("dt-line"), d.line);
    populateSelect(document.getElementById("dt-machine"), d.machine);
    populateSelect(document.getElementById("dt-assy"), d.assy);
    populateUnitFor("dt");
  }

  // Cascading: read the chosen machine from the {prefix}-machine select and
  // repopulate {prefix}-unit from CONFIG.dropdowns.machineUnits[machine].
  // Until a machine is picked the unit select is rendered disabled.
  function populateUnitFor(prefix) {
    const machineEl = document.getElementById(`${prefix}-machine`);
    const unitEl = document.getElementById(`${prefix}-unit`);
    const machine = machineEl ? machineEl.value : "";
    const map = (CONFIG.dropdowns && CONFIG.dropdowns.machineUnits) || {};
    const units = map[machine] || [];
    populateSelect(unitEl, units);
    unitEl.disabled = !machine;
  }

  // ----- Header / title from config -----

  function applyHeader() {
    document.getElementById("app-title").textContent = CONFIG.appTitle;
    document.getElementById("app-subtitle").textContent = CONFIG.appSubtitle;
    document.getElementById("site-label").textContent = CONFIG.site;
    document.title = CONFIG.appTitle;
  }

  // ----- Datetime defaults -----

  function setDefaultDateTimes(scope) {
    const now = nowLocalDateTimeString();
    if (!scope || scope === "para") {
      document.getElementById("para-change-time").value = now;
    }
    if (!scope || scope === "downtime") {
      document.getElementById("dt-occurrence").value = now;
      document.getElementById("dt-recovery").value = now;
      updateDuration();
    }
  }

  // ----- Tab switching -----

  function setActiveTab(tabName) {
    activeTab = tabName;

    document.querySelectorAll(".tab-button").forEach(function (btn) {
      const isActive = btn.dataset.tab === tabName;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    const paraPanel = document.getElementById("tab-para");
    const dtPanel = document.getElementById("tab-downtime");
    paraPanel.hidden = tabName !== "para";
    dtPanel.hidden = tabName !== "downtime";
    paraPanel.classList.toggle("active", tabName === "para");
    dtPanel.classList.toggle("active", tabName === "downtime");

    // Hide any prior result panel when switching tabs.
    hideResultPanel();
  }

  // ----- Validation -----

  function clearFieldError(form, name) {
    const field = form.querySelector(`[name="${name}"]`);
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    if (field) field.classList.remove("invalid");
    if (errorEl) {
      errorEl.classList.remove("visible");
      errorEl.textContent = "";
    }
  }

  function showFieldError(form, name, message) {
    const field = form.querySelector(`[name="${name}"]`);
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    if (field) field.classList.add("invalid");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  }

  function clearAllErrors(form) {
    form.querySelectorAll("[name]").forEach(function (el) {
      clearFieldError(form, el.name);
    });
  }

  function validateRequired(form) {
    let firstInvalid = null;
    let allValid = true;
    form.querySelectorAll("[required]").forEach(function (el) {
      const value = (el.value || "").trim();
      if (!value) {
        showFieldError(form, el.name, t("requiredField"));
        if (!firstInvalid) firstInvalid = el;
        allValid = false;
      }
    });
    if (firstInvalid) firstInvalid.focus();
    return allValid;
  }

  // ----- Duration calculation (Downtime tab) -----

  function updateDuration() {
    const occurrenceEl = document.getElementById("dt-occurrence");
    const recoveryEl = document.getElementById("dt-recovery");
    const durationEl = document.getElementById("dt-duration");
    const form = document.getElementById("form-downtime");

    const minutes = diffMinutes(occurrenceEl.value, recoveryEl.value);
    const label = t("durationLabel");
    const unit = t("durationUnit");

    if (minutes === null) {
      durationEl.textContent = `${label}: ${t("durationPlaceholder")} ${unit}`;
      durationEl.classList.remove("error");
      clearFieldError(form, "recovery_time");
      return null;
    }

    if (minutes < 0) {
      durationEl.textContent = `${label}: ${minutes} ${unit} — ${t("recoveryBeforeShort")}`;
      durationEl.classList.add("error");
      showFieldError(form, "recovery_time", t("recoveryBeforeError"));
      return minutes;
    }

    durationEl.textContent = `${label}: ${minutes} ${unit}`;
    durationEl.classList.remove("error");
    clearFieldError(form, "recovery_time");
    return minutes;
  }

  // ----- Kakao text builders -----

  function buildParaChangeText(data) {
    return [
      "🔧 [UC PKG Para 변경 / Parameter Change]",
      "━━━━━━━━━━━━━━━━━━━",
      `📍 Site: ${data.site} | 호기: ${data.line}`,
      `🏭 ${data.machine} > ${data.unit} > ${data.assy}`,
      "",
      `📝 변경 Para: ${data.param}`,
      `   이전값: ${data.previous_value}`,
      `   변경값: ${data.new_value}`,
      "",
      `💬 사유: ${data.reason}`,
      "",
      `👤 ${data.changed_by} @ ${formatDateTime(data.change_time)}`,
    ].join("\n");
  }

  function buildDowntimeText(data) {
    return [
      `🚨 [UC PKG 부동 / Downtime — ${data.type}]`,
      "━━━━━━━━━━━━━━━━━━━",
      `📍 Site: ${data.site} | 호기: ${data.line}`,
      `🏭 ${data.machine} > ${data.unit} > ${data.assy}`,
      "",
      `⏰ 발생: ${formatDateTime(data.occurrence_time)}`,
      `✅ 복구: ${formatDateTime(data.recovery_time)}`,
      `⏱️ Duration: ${data.duration_minutes} min`,
      "",
      `🔍 현상: ${data.symptom}`,
      `❓ 원인: ${data.cause}`,
      `🛠️ 조치: ${data.countermeasure}`,
      "",
      `👤 ${data.technician}`,
    ].join("\n");
  }

  // ----- Payload assembly -----

  function readForm(form) {
    const data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = typeof value === "string" ? value.trim() : value;
    });
    return data;
  }

  // ----- Result panel -----

  function showStatus(kind, message) {
    const banner = document.getElementById("status-banner");
    banner.classList.remove("success", "error", "info");
    banner.classList.add("visible", kind);
    banner.textContent = message;
  }

  function hideResultPanel() {
    document.getElementById("result-panel").hidden = true;
    const banner = document.getElementById("status-banner");
    banner.classList.remove("visible", "success", "error", "info");
    banner.textContent = "";
    document.getElementById("kakao-text").textContent = "";
    resetCopyButton();
  }

  function showResultPanel(kakaoText) {
    document.getElementById("kakao-text").textContent = kakaoText;
    document.getElementById("result-panel").hidden = false;
    resetCopyButton();
    // Scroll into view so the user sees the formatted message.
    document
      .getElementById("result-panel")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetCopyButton() {
    const btn = document.getElementById("copy-button");
    btn.classList.remove("copied");
    btn.textContent = "📋 Copy to Clipboard";
  }

  // ----- Backend POST -----

  async function postToBackend(payload) {
    const res = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Apps Script web apps redirect; default fetch follows redirects.
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    if (!json.ok) {
      throw new Error(json.error || "Backend reported failure");
    }
    return json;
  }

  // ----- Submit handlers -----

  async function handleSubmit(formType, form, event) {
    event.preventDefault();
    clearAllErrors(form);

    const baseValid = validateRequired(form);

    let durationMinutes = null;
    if (formType === "downtime") {
      durationMinutes = updateDuration();
      if (durationMinutes !== null && durationMinutes < 0) {
        // updateDuration already showed inline error.
        return;
      }
    }

    if (!baseValid) return;

    const data = readForm(form);
    const payload = Object.assign(
      {
        formType: formType,
        site: CONFIG.site,
        client_timestamp: new Date().toISOString(),
      },
      data
    );

    let kakaoText;
    if (formType === "para_change") {
      payload.site = CONFIG.site;
      kakaoText = buildParaChangeText(payload);
    } else {
      payload.duration_minutes = durationMinutes;
      kakaoText = buildDowntimeText(payload);
    }

    showResultPanel(kakaoText);

    if (!CONFIG.apiUrl) {
      showStatus("info", t("statusInfoNoBackend"));
      return;
    }

    showStatus("info", t("statusSubmitting"));

    try {
      await postToBackend(payload);
      showStatus("success", t("statusSuccess"));
    } catch (err) {
      showStatus("error", `${t("statusFailPrefix")} (${err.message})`);
    }
  }

  // ----- Reset / new entry -----

  function resetActiveTab() {
    const formId = activeTab === "para" ? "form-para" : "form-downtime";
    const form = document.getElementById(formId);
    form.reset();
    clearAllErrors(form);
    populateAllDropdowns();
    setDefaultDateTimes(activeTab);
    hideResultPanel();
  }

  // ----- Clipboard -----

  async function copyKakaoText() {
    const text = document.getElementById("kakao-text").textContent;
    const btn = document.getElementById("copy-button");
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers / file:// without permission.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      btn.classList.add("copied");
      btn.textContent = "✓ Copied";
      setTimeout(resetCopyButton, 1800);
    } catch (err) {
      btn.textContent = "Copy failed — select & copy manually";
    }
  }

  // ----- Language switcher -----

  function setActiveLang(lang) {
    if (lang !== "ko" && lang !== "en" && lang !== "bi") return;
    activeLang = lang;

    // Body class drives the CSS show/hide rules for .ko / .en / .sep spans.
    document.body.classList.remove("lang-ko", "lang-en", "lang-bi");
    document.body.classList.add(`lang-${lang}`);

    // Update html[lang] for assistive tech / browser hints.
    document.documentElement.lang =
      lang === "en" ? "en" : lang === "ko" ? "ko" : "ko";

    // Highlight the active language button.
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    // Re-render any JS-generated text so it picks up the new language.
    updateDuration();
    refreshVisibleErrorMessages();
  }

  // If validation errors are currently visible, re-render their text in the
  // newly selected language.
  function refreshVisibleErrorMessages() {
    document.querySelectorAll(".error-text.visible").forEach(function (el) {
      // Only refresh the generic "Required" helper; leave duration's specific
      // recovery-before-occurrence message to updateDuration().
      if (el.dataset.errorFor && el.dataset.errorFor !== "recovery_time") {
        el.textContent = t("requiredField");
      }
    });
  }

  // ----- Wire it all up -----

  function init() {
    applyHeader();
    populateAllDropdowns();
    setDefaultDateTimes();

    document.querySelectorAll(".tab-button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setActiveTab(btn.dataset.tab);
      });
    });

    // Cascading Machine → Unit (per tab).
    document
      .getElementById("para-machine")
      .addEventListener("change", function () {
        populateUnitFor("para");
      });
    document
      .getElementById("dt-machine")
      .addEventListener("change", function () {
        populateUnitFor("dt");
      });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setActiveLang(btn.dataset.lang);
      });
    });

    document
      .getElementById("form-para")
      .addEventListener("submit", function (e) {
        handleSubmit("para_change", this, e);
      });

    document
      .getElementById("form-downtime")
      .addEventListener("submit", function (e) {
        handleSubmit("downtime", this, e);
      });

    // Live-clear errors as the user types/changes a field.
    document.querySelectorAll(".entry-form [name]").forEach(function (el) {
      el.addEventListener("input", function () {
        clearFieldError(el.form, el.name);
      });
      el.addEventListener("change", function () {
        clearFieldError(el.form, el.name);
      });
    });

    document
      .getElementById("dt-occurrence")
      .addEventListener("input", updateDuration);
    document
      .getElementById("dt-recovery")
      .addEventListener("input", updateDuration);

    document.querySelectorAll('[data-action="new-entry"]').forEach(function (btn) {
      btn.addEventListener("click", resetActiveTab);
    });

    document.getElementById("copy-button").addEventListener("click", copyKakaoText);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
