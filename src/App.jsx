import { useState, useEffect, useCallback } from "react";

// ─── PDF Generation (pure JS, no library needed) ─────────────
function generatePDFContent(data, name) {
  const lines = [];
  lines.push(`WORKBOOK DIKLAT — CUSTOMER FOCUS FOR BUSINESS GROWTH`);
  lines.push(`Jasa Raharja Wilayah Jambi`);
  lines.push(`Nama: ${name}`);
  lines.push(`Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`);
  lines.push(`${"─".repeat(60)}`);

  const sesiLabels = [
    "SESI 1 — Transformasi Pola Pikir Strategis",
    "SESI 2 — Growth Leadership",
    "SESI 3 — Service Excellence",
    "SESI 4 — Budaya Sinergis AKHLAK",
  ];

  Object.entries(data).forEach(([sesiKey, sesiData]) => {
    const idx = parseInt(sesiKey.replace("sesi", "")) - 1;
    lines.push(`\n${sesiLabels[idx]}`);
    lines.push(`${"─".repeat(40)}`);
    Object.entries(sesiData).forEach(([key, val]) => {
      if (val && typeof val === "string" && val.trim()) {
        lines.push(`${key.replace(/_/g, " ").toUpperCase()}:`);
        lines.push(`  ${val.trim()}`);
        lines.push("");
      }
    });
  });

  lines.push(`\n${"═".repeat(60)}`);
  lines.push(`ACTION PLAN 90 HARI — ${name.toUpperCase()}`);
  lines.push(`${"═".repeat(60)}`);

  const ap = data.sesi4 || {};
  const apSections = [
    ["KOMITMEN NILAI HARMONIS", ap.harmonis_komitmen],
    ["KOMITMEN NILAI KOLABORATIF", ap.kolaboratif_komitmen],
    ["TARGET 30 HARI — Tim & Komunikasi", ap.target30_tim],
    ["TARGET 30 HARI — Pelayanan", ap.target30_pelayanan],
    ["TARGET 30 HARI — Kolaborasi Instansi", ap.target30_instansi],
    ["TARGET 60 HARI — Perubahan Sistem/Proses", ap.target60_sistem],
    ["TARGET 60 HARI — Indikator Kemajuan Budaya", ap.target60_indikator],
    ["TARGET 90 HARI — Keberlanjutan Tanpa Kehadiran Saya", ap.target90_sustainability],
    ["TANDA KEBERHASILAN 90 HARI", ap.target90_success],
    ["KOMITMEN PUBLIK SAYA", ap.komitmen_publik],
  ];

  apSections.forEach(([label, val]) => {
    if (val && val.trim()) {
      lines.push(`\n${label}:`);
      lines.push(`  ${val.trim()}`);
    }
  });

  return lines.join("\n");
}

function downloadTextAsPDF(content, filename) {
  // Create a printable HTML page and trigger print-to-PDF
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${filename}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'IBM Plex Sans', sans-serif; background: #fff; color: #0B2545; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { border-bottom: 3px solid #C9A84C; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 18px; font-weight: 700; color: #0B2545; }
  .header p { font-size: 13px; color: #64748B; margin-top: 4px; }
  .section { margin-bottom: 28px; }
  .section-title { font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; color: #C9A84C; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; padding: 6px 10px; background: #0B2545; }
  .field { margin-bottom: 14px; }
  .field-label { font-size: 10px; font-weight: 600; color: #64748B; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .field-value { font-size: 13px; color: #0F172A; line-height: 1.6; padding: 8px 12px; background: #F4F6FB; border-left: 3px solid #2E5FA3; }
  .action-plan { margin-top: 32px; border-top: 3px solid #0B2545; padding-top: 24px; }
  .action-plan-title { font-size: 20px; font-weight: 700; color: #0B2545; margin-bottom: 6px; }
  .action-plan-sub { font-size: 12px; color: #64748B; margin-bottom: 20px; }
  .ap-field { margin-bottom: 16px; }
  .ap-label { font-size: 10px; font-weight: 600; color: #C9A84C; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .ap-value { font-size: 13px; color: #0F172A; line-height: 1.6; padding: 10px 14px; background: #F4F6FB; border-left: 3px solid #C9A84C; white-space: pre-wrap; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #CBD5E1; font-size: 10px; color: #94A3B8; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
${content}
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename + ".html";
  a.click();
  URL.revokeObjectURL(url);
}

function generatePDFHTML(data, name) {
  const sesiConfig = [
    { key: "sesi1", title: "Transformasi Pola Pikir Strategis", num: "01", color: "#2E5FA3", light: "#EFF6FF" },
    { key: "sesi2", title: "Growth Leadership",                  num: "02", color: "#0D6E8A", light: "#F0F9FF" },
    { key: "sesi3", title: "Service Excellence",                 num: "03", color: "#7C3AED", light: "#F5F3FF" },
    { key: "sesi4", title: "Budaya Sinergis AKHLAK",             num: "04", color: "#065F46", light: "#F0FDF4" },
  ];

  const fieldLabels = {
    pct_operasional:"% Waktu Operasional", pct_problem:"% Problem Solving", pct_strategis:"% Waktu Strategis",
    diskusi1:"Hal yang bisa didelegasikan", diskusi2:"5 jam strategis untuk",
    gap_swdkllj:"Gap SWDKLLJ yang belum optimal", hambatan:"Hambatan utama", instansi_kol:"Instansi kolaborasi",
    tindakan30:"Tindakan 30 hari", dampak_pendapatan:"Dampak pendapatan", insight_s1:"Insight Strategis Sesi 1",
    pct_adaptif:"% Tim Adaptif", pct_menunggu:"% Tim Menunggu", pct_resisten:"% Tim Resisten",
    gap_swdkllj_s2:"Gap SWDKLLJ & Pattern Data", hambatan_data:"Hambatan Data", keputusan_data:"Keputusan Berbasis Data",
    strategi_polres:"Strategi Polres/Polsek", strategi_pemda:"Strategi Pemda", strategi_rs:"Strategi RS Mitra",
    insight_s2:"Insight Growth Leadership",
    pelayanan_terbaik:"Pelayanan Terbaik yang Diingat", pelayanan_terburuk:"Pelayanan Terburuk yang Diingat",
    skor_kecepatan:"Skor Kecepatan (1-5)", skor_kemudahan:"Skor Kemudahan (1-5)", skor_empati:"Skor Empati (1-5)",
    prioritas_perbaikan:"Prioritas Perbaikan Utama",
    standar_kecepatan:"Standar Kecepatan", standar_kemudahan:"Standar Kemudahan",
    standar_empati:"Standar Empati", standar_followup:"Standar Follow-up",
    akhlak_terapkan:"Nilai AKHLAK Paling Diterapkan", akhlak_menantang:"Nilai AKHLAK Paling Menantang", akhlak_pilihan:"Nilai AKHLAK Pilihan Saya", akhlak_pilihan_komitmen:"Aksi Konkret Nilai AKHLAK Pilihan",
    hambatan_komunikasi:"Hambatan Komunikasi", hambatan_proses:"Hambatan Proses",
    hambatan_perilaku:"Hambatan Perilaku", hambatan_sistem:"Hambatan Sistem",
    harmonis_komitmen:"Komitmen Harmonis", kolaboratif_komitmen:"Komitmen Kolaboratif",
    target30_tim:"Target 30 Hari — Tim", target30_pelayanan:"Target 30 Hari — Pelayanan",
    target30_instansi:"Target 30 Hari — Kolaborasi Instansi",
    target60_sistem:"Target 60 Hari — Sistem/Proses", target60_indikator:"Target 60 Hari — Indikator Kemajuan",
    target90_sustainability:"Target 90 Hari — Keberlanjutan", target90_success:"Tanda Keberhasilan 90 Hari",
    komitmen_publik:"Komitmen Publik",
  };

  // Group insight fields separately for highlight treatment
  const insightKeys = new Set(["insight_s1", "insight_s2", "prioritas_perbaikan", "komitmen_publik"]);

  let sectionsHTML = "";
  sesiConfig.forEach(({ key, title, num, color, light }, idx) => {
    const sesiData = data[key] || {};
    const entries = Object.entries(sesiData).filter(([, v]) => v && String(v).trim());
    if (!entries.length) return;

    const fieldsHTML = entries.map(([k, v]) => {
      const isInsight = insightKeys.has(k);
      const label = fieldLabels[k] || k.replace(/_/g, " ");
      return isInsight
        ? `<div class="field field-insight" style="border-left-color:${color};background:${light}">
             <div class="field-label" style="color:${color}">${label}</div>
             <div class="field-value-insight">${String(v).replace(/\n/g, "<br>")}</div>
           </div>`
        : `<div class="field">
             <div class="field-label">${label}</div>
             <div class="field-value" style="border-left-color:${color}">${String(v).replace(/\n/g, "<br>")}</div>
           </div>`;
    }).join("");

    sectionsHTML += `
    <div class="sesi-block${idx > 0 ? " page-break" : ""}">
      <div class="sesi-header" style="background:${color}">
        <div class="sesi-header-num">${num}</div>
        <div class="sesi-header-title">SESI ${num} — ${title}</div>
        <div class="sesi-header-badge">CUSTOMER FOCUS FOR BUSINESS GROWTH</div>
      </div>
      <div class="sesi-body" style="border-color:${color}20">
        ${fieldsHTML}
      </div>
    </div>`;
  });

  // Action Plan fields grouped by phase
  const ap = data.sesi4 || {};
  const apPhases = [
    {
      label: "KOMITMEN NILAI", color: "#0B2545", bg: "#F8FAFC",
      fields: [
        ["harmonis_komitmen",    "Nilai HARMONIS yang Akan Diperkuat",   "#16A34A"],
        ["kolaboratif_komitmen", "Nilai KOLABORATIF yang Akan Diperkuat","#9F1239"],
      ]
    },
    {
      label: "TARGET 30 HARI", color: "#2E5FA3", bg: "#EFF6FF",
      fields: [
        ["target30_tim",      "Tim & Komunikasi",     "#2E5FA3"],
        ["target30_pelayanan","Pelayanan",             "#2E5FA3"],
        ["target30_instansi", "Kolaborasi Instansi",  "#2E5FA3"],
      ]
    },
    {
      label: "TARGET 60 HARI", color: "#0D6E8A", bg: "#F0F9FF",
      fields: [
        ["target60_sistem",    "Perubahan Sistem/Proses",    "#0D6E8A"],
        ["target60_indikator", "Indikator Kemajuan Budaya",  "#0D6E8A"],
      ]
    },
    {
      label: "TARGET 90 HARI", color: "#065F46", bg: "#F0FDF4",
      fields: [
        ["target90_sustainability","Keberlanjutan Tanpa Kehadiran Saya","#065F46"],
        ["target90_success",       "Tanda Keberhasilan 90 Hari",        "#065F46"],
      ]
    },
  ];

  let apHTML = "";
  apPhases.forEach(({ label, color, bg, fields }) => {
    const phaseFields = fields
      .filter(([k]) => ap[k] && ap[k].trim())
      .map(([k, lbl, col]) => `
        <div class="ap-field">
          <div class="ap-field-label" style="color:${col}">${lbl}</div>
          <div class="ap-field-value" style="border-left-color:${col}">${ap[k].replace(/\n/g,"<br>")}</div>
        </div>`).join("");
    if (!phaseFields) return;
    apHTML += `
    <div class="ap-phase" style="background:${bg};border-left:4px solid ${color}">
      <div class="ap-phase-label" style="color:${color}">${label}</div>
      ${phaseFields}
    </div>`;
  });

  // Komitmen publik as highlight
  const publik = ap.komitmen_publik;
  if (publik && publik.trim()) {
    apHTML += `
    <div class="ap-publik">
      <div class="ap-publik-label">KOMITMEN PUBLIK</div>
      <div class="ap-publik-text">${publik.replace(/\n/g,"<br>")}</div>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Workbook — ${name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'IBM Plex Sans',Arial,sans-serif;background:#fff;color:#0B2545;
     padding:32px 36px;max-width:780px;margin:0 auto;font-size:13px}

/* ── DOC HEADER ── */
.doc-header{display:flex;justify-content:space-between;align-items:flex-end;
            padding-bottom:14px;margin-bottom:28px;border-bottom:3px solid #C9A84C}
.doc-header-left{}
.doc-title{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;
           color:#94A3B8;font-family:'IBM Plex Mono',monospace;margin-bottom:4px}
.doc-subtitle{font-size:18px;font-weight:700;color:#0B2545;line-height:1.2}
.doc-org{font-size:12px;color:#C9A84C;font-weight:600;margin-top:2px}
.doc-header-right{text-align:right}
.doc-name{font-size:16px;font-weight:700;color:#0B2545}
.doc-date{font-size:11px;color:#94A3B8;margin-top:2px}
.doc-colorbar{display:flex;gap:3px;margin-bottom:10px}
.doc-colorbar-item{height:4px;border-radius:2px;flex:1}

/* ── SESI BLOCK ── */
.sesi-block{margin-bottom:28px}
.page-break{page-break-before:always;padding-top:28px}
.sesi-header{display:flex;align-items:center;gap:12px;
             padding:10px 16px;border-radius:8px 8px 0 0;color:#fff}
.sesi-header-num{font-family:'IBM Plex Mono',monospace;font-size:22px;font-weight:600;
                  opacity:.4;line-height:1;flex-shrink:0}
.sesi-header-title{font-size:13px;font-weight:700;letter-spacing:.3px;flex:1}
.sesi-header-badge{font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:1.5px;
                    text-transform:uppercase;opacity:.6;flex-shrink:0}
.sesi-body{border:1px solid #E2E8F0;border-top:none;border-radius:0 0 8px 8px;
           padding:14px 16px;background:#fff}

/* ── FIELDS ── */
.field{margin-bottom:10px;page-break-inside:avoid}
.field-label{font-size:9px;font-weight:700;color:#94A3B8;letter-spacing:1.5px;
             text-transform:uppercase;margin-bottom:4px;
             font-family:'IBM Plex Mono',monospace}
.field-value{font-size:12px;color:#1E293B;line-height:1.65;padding:7px 10px 7px 12px;
             background:#F8FAFC;border-left:3px solid #CBD5E1}
.field-insight{padding:10px 12px;border-left:3px solid;border-radius:0 6px 6px 0;
               margin-bottom:10px;page-break-inside:avoid}
.field-value-insight{font-size:12.5px;color:#1E293B;line-height:1.7;font-weight:500;margin-top:4px}

/* ── ACTION PLAN HEADER ── */
.ap-header-block{page-break-before:always;padding-top:28px;margin-bottom:20px}
.ap-header-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:600;
                    letter-spacing:3px;text-transform:uppercase;color:#C9A84C;margin-bottom:6px}
.ap-header-title{font-size:22px;font-weight:700;color:#0B2545;margin-bottom:4px}
.ap-header-sub{font-size:11px;color:#64748B}
.ap-header-rule{height:3px;background:linear-gradient(90deg,#0B2545,#2E5FA3,#C9A84C);
                margin-top:14px;border-radius:2px}

/* ── ACTION PLAN PHASES ── */
.ap-phase{padding:12px 14px;border-radius:6px;margin-bottom:12px;page-break-inside:avoid}
.ap-phase-label{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:700;
                letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
.ap-field{margin-bottom:9px;page-break-inside:avoid}
.ap-field-label{font-size:9px;font-weight:700;color:#64748B;letter-spacing:1px;
                text-transform:uppercase;margin-bottom:3px;font-family:'IBM Plex Mono',monospace}
.ap-field-value{font-size:12px;color:#1E293B;line-height:1.65;padding:7px 10px 7px 12px;
                background:rgba(255,255,255,.8);border-left:3px solid}

/* ── KOMITMEN PUBLIK ── */
.ap-publik{background:#0B2545;border-radius:8px;padding:16px 18px;
           margin-top:16px;page-break-inside:avoid}
.ap-publik-label{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:700;
                  letter-spacing:2px;text-transform:uppercase;color:#C9A84C;margin-bottom:8px}
.ap-publik-text{font-size:13px;color:#fff;line-height:1.7;font-style:italic}

/* ── FOOTER ── */
.doc-footer{margin-top:32px;padding-top:12px;border-top:1px solid #E2E8F0;
            display:flex;justify-content:space-between;font-size:10px;color:#94A3B8;
            page-break-inside:avoid}

@media print{
  body{padding:15px 20px}
  @page{size:A4 portrait;margin:12mm 15mm}
  .page-break{page-break-before:always}
  .ap-header-block{page-break-before:always}
  .field{page-break-inside:avoid}
  .ap-field{page-break-inside:avoid}
  .ap-phase{page-break-inside:avoid}
  .ap-publik{page-break-inside:avoid}
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
</style>
</head>
<body>

<div class="doc-header">
  <div class="doc-header-left">
    <div class="doc-colorbar">
      ${["#2E5FA3","#0D6E8A","#7C3AED","#065F46","#16A34A","#9F1239"]
        .map(c=>`<div class="doc-colorbar-item" style="background:${c}"></div>`).join("")}
    </div>
    <div class="doc-title">Performa Consulting</div>
    <div class="doc-subtitle">Workbook Diklat</div>
    <div class="doc-org">Customer Focus for Business Growth — Jasa Raharja Wilayah Jambi</div>
  </div>
  <div class="doc-header-right">
    <div class="doc-name">${name}</div>
    <div class="doc-date">${new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</div>
  </div>
</div>

${sectionsHTML}

<div class="ap-header-block">
  <div class="ap-header-eyebrow">★ Output Utama Diklat</div>
  <div class="ap-header-title">Action Plan 90 Hari</div>
  <div class="ap-header-sub">Komitmen perubahan yang akan diimplementasikan di Wilayah Jambi</div>
  <div class="ap-header-rule"></div>
</div>

${apHTML || '<p style="color:#94A3B8;font-style:italic;font-size:12px">Action Plan belum diisi.</p>'}

<div class="doc-footer">
  <span>Performa Consulting  |  Rono Jatmiko</span>
  <span>Dicetak: ${new Date().toLocaleDateString("id-ID")}</span>
</div>

</body>
</html>`;
}

// ─── Data structure ───────────────────────────────────────────
const STORAGE_KEY = "jr_workbook_v1";
const emptyData = {
  sesi1: { pct_operasional:"", pct_problem:"", pct_strategis:"", diskusi1:"", diskusi2:"",
           gap_swdkllj:"", hambatan:"", instansi_kol:"", tindakan30:"", dampak_pendapatan:"", insight_s1:"" },
  sesi2: { pct_adaptif:"", pct_menunggu:"", pct_resisten:"", gap_swdkllj_s2:"",
           hambatan_data:"", keputusan_data:"", strategi_polres:"", strategi_pemda:"",
           strategi_rs:"", insight_s2:"" },
  sesi3: { pelayanan_terbaik:"", pelayanan_terburuk:"", skor_kecepatan:"", skor_kemudahan:"",
           skor_empati:"", prioritas_perbaikan:"", standar_kecepatan:"", standar_kemudahan:"",
           standar_empati:"", standar_followup:"" },
  sesi4: { akhlak_terapkan:"", akhlak_menantang:"", akhlak_pilihan:"", akhlak_pilihan_komitmen:"", hambatan_komunikasi:"", hambatan_proses:"",
           hambatan_perilaku:"", hambatan_sistem:"", harmonis_komitmen:"", kolaboratif_komitmen:"",
           target30_tim:"", target30_pelayanan:"", target30_instansi:"", target60_sistem:"",
           target60_indikator:"", target90_sustainability:"", target90_success:"", komitmen_publik:"" },
};

// ─── Components ───────────────────────────────────────────────
const colors = {
  s1: "#2E5FA3", s2: "#0D6E8A", s3: "#7C3AED", s4: "#065F46",
  gold: "#C9A84C", navy: "#0B2545",
};

function Field({ label, value, onChange, rows = 2, placeholder = "Tulis jawaban Anda..." }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748B",
                      letterSpacing:"1px", textTransform:"uppercase", marginBottom:6,
                      fontFamily:"'IBM Plex Mono', monospace" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{ width:"100%", padding:"10px 14px", fontSize:14, lineHeight:1.6,
                 border:"1.5px solid #CBD5E1", borderRadius:6, resize:"vertical",
                 fontFamily:"'IBM Plex Sans', sans-serif", color:"#0F172A",
                 background:"#F8FAFC", outline:"none", transition:"border-color .15s",
                 boxSizing:"border-box" }}
        onFocus={e => e.target.style.borderColor = colors.gold}
        onBlur={e => e.target.style.borderColor = "#CBD5E1"}
      />
    </div>
  );
}

function ScoreField({ label, value, onChange, max = 5 }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748B",
                      letterSpacing:"1px", textTransform:"uppercase", marginBottom:8,
                      fontFamily:"'IBM Plex Mono', monospace" }}>
        {label}
      </label>
      <div style={{ display:"flex", gap:8 }}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onChange(String(n))}
            style={{ width:40, height:40, borderRadius:8, border:"2px solid",
                     borderColor: value === String(n) ? colors.navy : "#CBD5E1",
                     background: value === String(n) ? colors.navy : "#F8FAFC",
                     color: value === String(n) ? "#fff" : "#64748B",
                     fontSize:15, fontWeight:700, cursor:"pointer", transition:"all .15s",
                     fontFamily:"'IBM Plex Mono', monospace" }}>
            {n}
          </button>
        ))}
        {value && <span style={{ alignSelf:"center", fontSize:12, color:"#64748B",
                                  fontFamily:"'IBM Plex Mono', monospace" }}>
          → {["","Buruk","Kurang","Cukup","Baik","Sangat Baik"][parseInt(value)]}
        </span>}
      </div>
    </div>
  );
}

function SectionCard({ title, color, children }) {
  return (
    <div style={{ marginBottom:28, borderRadius:12, overflow:"hidden",
                  boxShadow:"0 2px 12px rgba(11,37,69,.08)" }}>
      <div style={{ background:color, padding:"12px 18px", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11, fontWeight:600,
                       color:"#fff", letterSpacing:"2px", textTransform:"uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ background:"#fff", padding:"20px 18px" }}>
        {children}
      </div>
    </div>
  );
}

function ProgressBar({ completed, total, color }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div style={{ marginTop:4 }}>
      <div style={{ height:4, background:"#E2E8F0", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color,
                      borderRadius:2, transition:"width .4s ease" }} />
      </div>
      <span style={{ fontSize:10, color:"#94A3B8", fontFamily:"'IBM Plex Mono', monospace" }}>
        {completed}/{total} diisi
      </span>
    </div>
  );
}

// ─── SESI COMPONENTS ─────────────────────────────────────────

function Sesi1({ data, onChange }) {
  const u = (k) => (v) => onChange("sesi1", k, v);
  return (
    <div>
      <p style={{ color:"#64748B", fontSize:14, marginBottom:24, lineHeight:1.7 }}>
        Sesi ini membantu Anda mengidentifikasi pola pikir saat ini dan menemukan
        peluang strategis untuk wilayah Jambi.
      </p>

      <SectionCard title="Refleksi Pembuka — Distribusi Waktu Anda" color={colors.s1}>
        <p style={{ fontSize:13, color:"#64748B", marginBottom:16, fontStyle:"italic" }}>
          Dalam 1 minggu kerja terakhir, berapa % waktu Anda untuk masing-masing kategori?
          (Total harus ≈ 100%)
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:8 }}>
          {[["pct_operasional","Operasional Harian","Laporan, rapat, administrasi"],
            ["pct_problem","Problem Solving","Mengatasi masalah mendesak"],
            ["pct_strategis","Strategis","Berpikir peluang & pengembangan"]
          ].map(([k, label, sub]) => (
            <div key={k} style={{ textAlign:"center" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748B",
                            letterSpacing:"1px", textTransform:"uppercase",
                            fontFamily:"'IBM Plex Mono', monospace", marginBottom:4 }}>
                {label}
              </div>
              <div style={{ fontSize:10, color:"#94A3B8", marginBottom:8 }}>{sub}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <input type="number" min="0" max="100" value={data[k]}
                  onChange={e => u(k)(e.target.value)}
                  style={{ width:64, padding:"8px 10px", fontSize:18, fontWeight:700,
                           textAlign:"center", border:"2px solid #CBD5E1", borderRadius:8,
                           fontFamily:"'IBM Plex Mono', monospace", color:colors.s1,
                           background:"#F8FAFC", outline:"none" }}
                  placeholder="0" />
                <span style={{ fontSize:14, color:"#64748B", fontWeight:700 }}>%</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Diskusi Berpasangan" color={colors.s1}>
        <Field label="1. Apa 1 hal yang selama ini Anda kerjakan secara operasional, padahal bisa didelegasikan atau disistematisasi?"
          value={data.diskusi1} onChange={u("diskusi1")} rows={3}
          placeholder="Contoh: laporan harian yang bisa dibuat template..." />
        <Field label="2. Jika Anda punya 5 jam EKSTRA per minggu khusus untuk berpikir strategis, apa yang pertama kali akan Anda lakukan untuk wilayah Jambi?"
          value={data.diskusi2} onChange={u("diskusi2")} rows={3}
          placeholder="Contoh: menganalisis data SWDKLLJ per ruas jalan..." />
      </SectionCard>

      <SectionCard title="Worksheet — Analisis Potensi Strategis Wilayah Jambi" color={colors.s1}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="1. Segmen/area SWDKLLJ yang paling belum optimal?" value={data.gap_swdkllj} onChange={u("gap_swdkllj")} rows={3} />
          <Field label="4. Tindakan strategis dalam 30 hari ke depan?" value={data.tindakan30} onChange={u("tindakan30")} rows={3} />
          <Field label="2. Hambatan utama yang Anda lihat?" value={data.hambatan} onChange={u("hambatan")} rows={3} />
          <Field label="5. Jika berhasil, dampaknya terhadap pendapatan wilayah?" value={data.dampak_pendapatan} onChange={u("dampak_pendapatan")} rows={3} />
          <Field label="3. Instansi mana yang bisa diajak kolaborasi?" value={data.instansi_kol} onChange={u("instansi_kol")} rows={3} />
        </div>
      </SectionCard>

      <SectionCard title="Insight Kunci Sesi 1" color={colors.navy}>
        <Field label="Peluang strategis terbesar saya di Jambi adalah..." value={data.insight_s1} onChange={u("insight_s1")} rows={2}
          placeholder="Tulis dalam 1-2 kalimat yang kuat..." />
      </SectionCard>
    </div>
  );
}

function Sesi2({ data, onChange }) {
  const u = (k) => (v) => onChange("sesi2", k, v);
  return (
    <div>
      <p style={{ color:"#64748B", fontSize:14, marginBottom:24, lineHeight:1.7 }}>
        Sesi ini membangun kapabilitas Anda memimpin perubahan, membaca data strategis,
        dan membangun koordinasi efektif lintas instansi.
      </p>

      <SectionCard title="Refleksi — Respons Tim Terhadap Perubahan" color={colors.s2}>
        <p style={{ fontSize:13, color:"#64748B", marginBottom:16, fontStyle:"italic" }}>
          Dari pengalaman Anda, estimasi % tim Anda dalam menghadapi perubahan:
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {[["pct_adaptif","Adaptif","Proaktif mencari cara baru","#16A34A"],
            ["pct_menunggu","Menunggu","Tidak bergerak sampai diperintah","#E8A020"],
            ["pct_resisten","Resisten","Menolak atau diam-diam tidak jalankan","#DC2626"]
          ].map(([k, label, sub, col]) => (
            <div key={k} style={{ textAlign:"center" }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:col,
                            margin:"0 auto 6px" }} />
              <div style={{ fontSize:11, fontWeight:700, color:col, letterSpacing:"1px",
                            textTransform:"uppercase", fontFamily:"'IBM Plex Mono', monospace",
                            marginBottom:4 }}>
                {label}
              </div>
              <div style={{ fontSize:10, color:"#94A3B8", marginBottom:8 }}>{sub}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <input type="number" min="0" max="100" value={data[k]}
                  onChange={e => u(k)(e.target.value)}
                  style={{ width:64, padding:"8px 10px", fontSize:18, fontWeight:700,
                           textAlign:"center", border:`2px solid ${col}`, borderRadius:8,
                           fontFamily:"'IBM Plex Mono', monospace", color:col,
                           background:"#F8FAFC", outline:"none" }}
                  placeholder="0" />
                <span style={{ fontSize:14, color:"#64748B", fontWeight:700 }}>%</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Worksheet — Analisis Data SWDKLLJ & IW" color={colors.s2}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Pola yang Anda lihat dari data 3 bulan terakhir?" value={data.gap_swdkllj_s2} onChange={u("gap_swdkllj_s2")} rows={3} />
          <Field label="Satu keputusan yang akan Anda ambil berdasarkan data?" value={data.keputusan_data} onChange={u("keputusan_data")} rows={3} />
          <Field label="Hambatan data yang paling sering Anda hadapi?" value={data.hambatan_data} onChange={u("hambatan_data")} rows={3} />
        </div>
      </SectionCard>

      <SectionCard title="Worksheet — Strategi Koordinasi Instansi" color={colors.s2}>
        <Field label="Strategi pendekatan Polres/Polsek yang paling efektif?" value={data.strategi_polres} onChange={u("strategi_polres")} rows={3} />
        <Field label="Strategi pendekatan Pemda/Bupati?" value={data.strategi_pemda} onChange={u("strategi_pemda")} rows={3} />
        <Field label="Strategi kolaborasi RS Mitra?" value={data.strategi_rs} onChange={u("strategi_rs")} rows={3} />
      </SectionCard>

      <SectionCard title="Insight Kunci Sesi 2" color={colors.navy}>
        <Field label="Sebagai Growth Leader, satu komitmen saya untuk 7 hari ke depan adalah..."
          value={data.insight_s2} onChange={u("insight_s2")} rows={2}
          placeholder="Spesifik, terukur, realistis..." />
      </SectionCard>
    </div>
  );
}

function Sesi3({ data, onChange }) {
  const u = (k) => (v) => onChange("sesi3", k, v);
  return (
    <div>
      <p style={{ color:"#64748B", fontSize:14, marginBottom:24, lineHeight:1.7 }}>
        Sesi ini membangun standar pelayanan prima — dari kecepatan santunan,
        penanganan kasus sensitif, hingga kepercayaan publik.
      </p>

      <SectionCard title="Refleksi — Pengalaman Pelayanan" color={colors.s3}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div>
            <div style={{ height:4, background:"#16A34A", borderRadius:2, marginBottom:12 }} />
            <Field label="Pelayanan TERBAIK yang pernah Anda berikan / terima (apa yang membuatnya luar biasa?)"
              value={data.pelayanan_terbaik} onChange={u("pelayanan_terbaik")} rows={4} />
          </div>
          <div>
            <div style={{ height:4, background:"#DC2626", borderRadius:2, marginBottom:12 }} />
            <Field label="Pelayanan TERBURUK yang pernah Anda alami (apa yang paling mengecewakan?)"
              value={data.pelayanan_terburuk} onChange={u("pelayanan_terburuk")} rows={4} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Audit Service Excellence Wilayah Jambi" color={colors.s3}>
        <p style={{ fontSize:13, color:"#64748B", marginBottom:16, fontStyle:"italic" }}>
          Nilai kondisi pelayanan wilayah Anda saat ini (1=Buruk, 5=Sangat Baik):
        </p>
        <ScoreField label="Waktu respons pertama kepada korban/ahli waris"
          value={data.skor_kecepatan} onChange={u("skor_kecepatan")} />
        <ScoreField label="Kejelasan panduan dokumen & prosedur klaim"
          value={data.skor_kemudahan} onChange={u("skor_kemudahan")} />
        <ScoreField label="Kemampuan empati staf saat menghadapi keluarga"
          value={data.skor_empati} onChange={u("skor_empati")} />
        <Field label="Prioritas perbaikan utama yang paling mendesak:"
          value={data.prioritas_perbaikan} onChange={u("prioritas_perbaikan")} rows={2} />
      </SectionCard>

      <SectionCard title="Standar Pelayanan Wilayah — Hasil Diskusi" color={colors.s3}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Standar KECEPATAN (waktu respons, verifikasi, eskalasi)"
            value={data.standar_kecepatan} onChange={u("standar_kecepatan")} rows={4}
            placeholder="Waktu respons pertama: ___ jam&#10;Waktu verifikasi dokumen: ___ hari&#10;Batas eskalasi ke KaCab: ___ jam" />
          <Field label="Standar KEMUDAHAN (checklist, kontak, panduan)"
            value={data.standar_kemudahan} onChange={u("standar_kemudahan")} rows={4}
            placeholder="Checklist dokumen standar: ...&#10;Nomor kontak darurat: ...&#10;Panduan digital: ..." />
          <Field label="Standar EMPATI (kalimat pembuka, larangan, protokol)"
            value={data.standar_empati} onChange={u("standar_empati")} rows={4}
            placeholder="Kalimat pembuka wajib: '...'&#10;Yang TIDAK boleh diucapkan: '...'&#10;Protokol saat korban menangis: ..." />
          <Field label="Standar FOLLOW-UP (waktu, cara, feedback)"
            value={data.standar_followup} onChange={u("standar_followup")} rows={4}
            placeholder="Follow-up pertama: ___ jam setelah klaim&#10;Follow-up pasca selesai: ___ hari&#10;Cara meminta feedback: ..." />
        </div>
      </SectionCard>
    </div>
  );
}

function Sesi4({ data, onChange }) {
  const u = (k) => (v) => onChange("sesi4", k, v);
  const akhlakValues = [
    { key: "Amanah", label: "AMANAH", color: "#2E5FA3" },
    { key: "Kompeten", label: "KOMPETEN", color: "#0D6E8A" },
    { key: "Harmonis", label: "HARMONIS", color: "#16A34A" },
    { key: "Loyal", label: "LOYAL", color: "#7C3AED" },
    { key: "Adaptif", label: "ADAPTIF", color: "#E8A020" },
    { key: "Kolaboratif", label: "KOLABORATIF", color: "#9F1239" },
  ];
  return (
    <div>
      <p style={{ color:"#64748B", fontSize:14, marginBottom:24, lineHeight:1.7 }}>
        Sesi terakhir. Output utama: Action Plan 90 Hari yang akan Anda implementasikan
        di Wilayah Jambi setelah diklat ini.
      </p>

      <SectionCard title="Refleksi — Nilai AKHLAK" color={colors.s4}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
          {akhlakValues.map(av => (
            <div key={av.key} style={{ padding:"10px 12px", border:`2px solid ${av.color}20`,
                                       borderRadius:8, background:"#F8FAFC" }}>
              <div style={{ fontSize:10, fontWeight:700, color:av.color,
                            fontFamily:"'IBM Plex Mono', monospace",
                            letterSpacing:"1px", marginBottom:2 }}>
                {av.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Nilai yang paling sering saya terapkan (& alasannya):"
            value={data.akhlak_terapkan} onChange={u("akhlak_terapkan")} rows={3} />
          <Field label="Nilai yang paling menantang untuk saya jalankan konsisten (& alasannya):"
            value={data.akhlak_menantang} onChange={u("akhlak_menantang")} rows={3} />
        </div>
      </SectionCard>

      <SectionCard title="Komitmen Nilai AKHLAK Pilihan Saya" color={colors.s4}>
        <p style={{ fontSize:13, color:"#64748B", marginBottom:16, fontStyle:"italic" }}>
          Selain Harmonis & Kolaboratif, tuliskan 1 nilai AKHLAK yang paling
          ingin Anda perkuat secara personal beserta aksi konkretnya.
        </p>
        <Field label="Nilai AKHLAK yang saya pilih (Amanah / Kompeten / Loyal / Adaptif):"
          value={data.akhlak_pilihan} onChange={u("akhlak_pilihan")} rows={1}
          placeholder="Contoh: Kompeten" />
        <Field label="Aksi konkret yang akan saya lakukan untuk nilai tersebut:"
          value={data.akhlak_pilihan_komitmen} onChange={u("akhlak_pilihan_komitmen")} rows={3}
          placeholder="Contoh: Saya akan mengikuti 1 webinar kepemimpinan per bulan dan membagikan learningnya ke tim..." />
      </SectionCard>
      <SectionCard title="Diagnosa Hambatan Internal Tim" color={colors.s4}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Hambatan KOMUNIKASI — informasi apa yang sering tersumbat?"
            value={data.hambatan_komunikasi} onChange={u("hambatan_komunikasi")} rows={3} />
          <Field label="Hambatan PROSES — SOP apa yang menimbulkan friksi antar unit?"
            value={data.hambatan_proses} onChange={u("hambatan_proses")} rows={3} />
          <Field label="Hambatan PERILAKU — kebiasaan apa yang bertentangan dengan AKHLAK?"
            value={data.hambatan_perilaku} onChange={u("hambatan_perilaku")} rows={3} />
          <Field label="Hambatan SISTEM — kebijakan apa yang tidak sengaja menghambat kolaborasi?"
            value={data.hambatan_sistem} onChange={u("hambatan_sistem")} rows={3} />
        </div>
      </SectionCard>

      {/* ── ACTION PLAN 90 HARI ── */}
      <div style={{ margin:"8px 0 4px", padding:"14px 18px",
                    background:`linear-gradient(135deg, ${colors.s4}, #0D6E8A)`,
                    borderRadius:"12px 12px 0 0" }}>
        <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11, fontWeight:600,
                      color:colors.gold, letterSpacing:"3px", textTransform:"uppercase",
                      marginBottom:4 }}>
          ★ OUTPUT UTAMA DIKLAT
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:"#fff" }}>Action Plan 90 Hari</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,.7)", marginTop:2 }}>
          Isi dengan jujur dan spesifik — ini yang akan Anda implementasikan di Jambi.
        </div>
      </div>

      <div style={{ background:"#fff", borderRadius:"0 0 12px 12px", padding:"20px 18px",
                    boxShadow:"0 4px 20px rgba(11,37,69,.12)", marginBottom:28 }}>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
          <div style={{ padding:"14px 16px", borderRadius:8, border:"2px solid #16A34A20",
                        background:"#F0FDF4" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#16A34A",
                          fontFamily:"'IBM Plex Mono', monospace", letterSpacing:"1px",
                          textTransform:"uppercase", marginBottom:8 }}>
              Komitmen Nilai HARMONIS
            </div>
            <Field label="Yang akan saya perkuat secara konkret:"
              value={data.harmonis_komitmen} onChange={u("harmonis_komitmen")} rows={3} />
          </div>
          <div style={{ padding:"14px 16px", borderRadius:8, border:"2px solid #9F123920",
                        background:"#FFF1F2" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#9F1239",
                          fontFamily:"'IBM Plex Mono', monospace", letterSpacing:"1px",
                          textTransform:"uppercase", marginBottom:8 }}>
              Komitmen Nilai KOLABORATIF
            </div>
            <Field label="Yang akan saya perkuat secara konkret:"
              value={data.kolaboratif_komitmen} onChange={u("kolaboratif_komitmen")} rows={3} />
          </div>
        </div>

        {/* 30 days */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ height:2, flex:1, background:`linear-gradient(90deg, ${colors.s1}, transparent)` }} />
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11, fontWeight:700,
                           color:colors.s1, letterSpacing:"2px", whiteSpace:"nowrap" }}>
              TARGET 30 HARI
            </span>
            <div style={{ height:2, flex:1, background:`linear-gradient(270deg, ${colors.s1}, transparent)` }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <Field label="Tim & Komunikasi" value={data.target30_tim} onChange={u("target30_tim")} rows={3} />
            <Field label="Pelayanan" value={data.target30_pelayanan} onChange={u("target30_pelayanan")} rows={3} />
            <Field label="Kolaborasi Instansi" value={data.target30_instansi} onChange={u("target30_instansi")} rows={3} />
          </div>
        </div>

        {/* 60 days */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ height:2, flex:1, background:`linear-gradient(90deg, ${colors.s2}, transparent)` }} />
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11, fontWeight:700,
                           color:colors.s2, letterSpacing:"2px", whiteSpace:"nowrap" }}>
              TARGET 60 HARI
            </span>
            <div style={{ height:2, flex:1, background:`linear-gradient(270deg, ${colors.s2}, transparent)` }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="Perubahan sistem/proses yang akan diimplementasikan" value={data.target60_sistem} onChange={u("target60_sistem")} rows={3} />
            <Field label="Indikator kemajuan budaya kerja tim" value={data.target60_indikator} onChange={u("target60_indikator")} rows={3} />
          </div>
        </div>

        {/* 90 days */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ height:2, flex:1, background:`linear-gradient(90deg, ${colors.s4}, transparent)` }} />
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11, fontWeight:700,
                           color:colors.s4, letterSpacing:"2px", whiteSpace:"nowrap" }}>
              TARGET 90 HARI
            </span>
            <div style={{ height:2, flex:1, background:`linear-gradient(270deg, ${colors.s4}, transparent)` }} />
          </div>
          <Field label="Bagaimana saya memastikan budaya ini berjalan meski saya tidak selalu hadir?"
            value={data.target90_sustainability} onChange={u("target90_sustainability")} rows={3} />
          <Field label="Tanda keberhasilan 90 hari — apa yang akan berbeda di tim, pelayanan, dan pendapatan wilayah?"
            value={data.target90_success} onChange={u("target90_success")} rows={3} />
        </div>

        {/* Public commitment */}
        <div style={{ padding:"16px", background:`${colors.navy}08`, borderRadius:8,
                      border:`2px solid ${colors.gold}40` }}>
          <div style={{ fontSize:11, fontWeight:700, color:colors.gold,
                        fontFamily:"'IBM Plex Mono', monospace", letterSpacing:"1px",
                        textTransform:"uppercase", marginBottom:8 }}>
            Komitmen Publik Saya
          </div>
          <Field label="Kalimat komitmen yang saya nyatakan di depan rekan-rekan KaCab:"
            value={data.komitmen_publik} onChange={u("komitmen_publik")} rows={2}
            placeholder='"Saya berkomitmen untuk..."' />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [activeSesi, setActiveSesi] = useState(1);
  const [workData, setWorkData] = useState(emptyData);
  const [saved, setSaved] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
        if (parsed.data) setWorkData({ ...emptyData, ...parsed.data });
      }
    } catch {}
  }, []);

  // Auto-save
  const save = useCallback((data, n) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: n, data }));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {}
  }, []);

  const handleChange = useCallback((sesi, key, value) => {
    setWorkData(prev => {
      const next = { ...prev, [sesi]: { ...prev[sesi], [key]: value } };
      save(next, name);
      return next;
    });
  }, [name, save]);

  const handleStart = () => {
    if (!nameInput.trim()) return;
    const n = nameInput.trim();
    setName(n);
    save(workData, n);
  };

  const handleReset = () => {
    if (window.confirm("Reset semua data? Ini tidak bisa dibatalkan.")) {
      localStorage.removeItem(STORAGE_KEY);
      setName(""); setNameInput(""); setWorkData(emptyData); setActiveSesi(1);
    }
  };

  const handleDownload = () => {
    const html = generatePDFHTML(workData, name);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Workbook_${name.replace(/\s+/g,"_")}_JasaRaharja.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowComplete(true);
  };

  // Count filled fields per sesi
  const countFilled = (sesiKey) => {
    const d = workData[sesiKey] || {};
    return Object.values(d).filter(v => v && String(v).trim()).length;
  };
  const totalFields = { sesi1:11, sesi2:10, sesi3:10, sesi4:16 };

  const sesiConfig = [
    { num:1, label:"Transformasi Pola Pikir", color:colors.s1, key:"sesi1" },
    { num:2, label:"Growth Leadership",       color:colors.s2, key:"sesi2" },
    { num:3, label:"Service Excellence",      color:colors.s3, key:"sesi3" },
    { num:4, label:"Budaya AKHLAK",           color:colors.s4, key:"sesi4" },
  ];

  // ── Login screen ──
  if (!name) {
    return (
      <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, #0B2545 0%, #1A3A6B 50%, #0D6E8A 100%)`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'IBM Plex Sans', sans-serif", padding:24 }}>
        <div style={{ background:"rgba(255,255,255,.97)", borderRadius:20, padding:"48px 40px",
                      maxWidth:460, width:"100%", boxShadow:"0 24px 80px rgba(0,0,0,.3)" }}>
          {/* Logo area */}
          <div style={{ marginBottom:32 }}>
            <div style={{ display:"flex", gap:3, marginBottom:16 }}>
              {["#2E5FA3","#0D6E8A","#16A34A","#9F1239","#E8A020","#7C3AED"].map((c,i) => (
                <div key={i} style={{ flex:1, height:5, background:c, borderRadius:2 }} />
              ))}
            </div>
            <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, fontWeight:600,
                          color:"#94A3B8", letterSpacing:"3px", textTransform:"uppercase",
                          marginBottom:8 }}>
              PERFORMA CONSULTING
            </div>
            <h1 style={{ fontSize:26, fontWeight:700, color:"#0B2545", lineHeight:1.2 }}>
              Workbook Diklat
            </h1>
            <p style={{ fontSize:16, color:"#C9A84C", fontWeight:600, marginTop:4 }}>
              Customer Focus for Business Growth
            </p>
            <p style={{ fontSize:13, color:"#64748B", marginTop:6, lineHeight:1.5 }}>
              Jasa Raharja Wilayah Jambi
            </p>
          </div>

          {/* Name input */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748B",
                            letterSpacing:"2px", textTransform:"uppercase",
                            fontFamily:"'IBM Plex Mono', monospace", marginBottom:8 }}>
              Nama Lengkap Anda
            </label>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleStart()}
              placeholder="Ketik nama Anda..."
              style={{ width:"100%", padding:"14px 16px", fontSize:16,
                       border:"2px solid #CBD5E1", borderRadius:10, outline:"none",
                       fontFamily:"'IBM Plex Sans', sans-serif", color:"#0B2545",
                       transition:"border-color .15s", boxSizing:"border-box" }}
              onFocus={e => e.target.style.borderColor = "#C9A84C"}
              onBlur={e => e.target.style.borderColor = "#CBD5E1"}
              autoFocus
            />
          </div>

          <button onClick={handleStart} disabled={!nameInput.trim()}
            style={{ width:"100%", padding:"14px", fontSize:15, fontWeight:700,
                     background: nameInput.trim() ? "#0B2545" : "#CBD5E1",
                     color:"#fff", border:"none", borderRadius:10, cursor: nameInput.trim() ? "pointer" : "not-allowed",
                     fontFamily:"'IBM Plex Sans', sans-serif", letterSpacing:".5px",
                     transition:"all .15s" }}>
            Mulai Workbook →
          </button>

          {/* Features */}
          <div style={{ marginTop:28, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[["4 Sesi Interaktif","Sesuai kurikulum diklat"],
              ["Auto-save","Tersimpan otomatis di browser"],
              ["Worksheet Digital","Isi langsung saat sesi berlangsung"],
              ["Export Action Plan","Download di akhir Sesi 4"]
            ].map(([title, sub]) => (
              <div key={title} style={{ padding:"10px 12px", background:"#F8FAFC",
                                        borderRadius:8, border:"1px solid #E2E8F0" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#0B2545",
                              fontFamily:"'IBM Plex Mono', monospace" }}>{title}</div>
                <div style={{ fontSize:10, color:"#94A3B8", marginTop:2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Complete screen ──
  if (showComplete) {
    return (
      <div style={{ minHeight:"100vh", background:`linear-gradient(135deg, #0B2545, #065F46)`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"'IBM Plex Sans', sans-serif", padding:24 }}>
        <div style={{ background:"rgba(255,255,255,.97)", borderRadius:20, padding:"48px 40px",
                      maxWidth:520, width:"100%", textAlign:"center",
                      boxShadow:"0 24px 80px rgba(0,0,0,.3)" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
          <h2 style={{ fontSize:28, fontWeight:700, color:"#0B2545", marginBottom:8 }}>
            Selamat, Pak {name}!
          </h2>
          <p style={{ fontSize:16, color:"#C9A84C", fontWeight:600, marginBottom:16 }}>
            Diklat Customer Focus for Business Growth
          </p>
          <p style={{ fontSize:14, color:"#64748B", lineHeight:1.6, marginBottom:28 }}>
            Workbook & Action Plan 90 Hari Anda sudah diunduh.
            Buka file HTML tersebut di browser dan gunakan Ctrl+P untuk mencetak atau simpan sebagai PDF.
          </p>
          <div style={{ background:"#F0FDF4", borderRadius:10, padding:"16px 20px",
                        border:"2px solid #16A34A30", marginBottom:28, textAlign:"left" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#16A34A",
                          fontFamily:"'IBM Plex Mono', monospace", letterSpacing:"1px",
                          textTransform:"uppercase", marginBottom:8 }}>
              Langkah Selanjutnya
            </div>
            {["Buka file HTML yang diunduh, lalu Print → Save as PDF",
              "Bagikan insights utama kepada tim Anda pekan ini",
              "Check-in dengan fasilitator dalam 30 hari",
              "Evaluasi progress Action Plan di hari ke-30, 60, dan 90"
            ].map((s, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"#16A34A",
                              color:"#fff", fontSize:10, fontWeight:700, display:"flex",
                              alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {i+1}
                </div>
                <span style={{ fontSize:13, color:"#064E3B", lineHeight:1.5 }}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => { setShowComplete(false); setActiveSesi(4); }}
              style={{ flex:1, padding:"12px", fontSize:14, fontWeight:600,
                       background:"#F8FAFC", color:"#0B2545", border:"2px solid #CBD5E1",
                       borderRadius:10, cursor:"pointer" }}>
              Kembali ke Workbook
            </button>
            <button onClick={handleDownload}
              style={{ flex:1, padding:"12px", fontSize:14, fontWeight:700,
                       background:"#0B2545", color:"#fff", border:"none",
                       borderRadius:10, cursor:"pointer" }}>
              Unduh Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main workbook ──
  const sesi = sesiConfig[activeSesi - 1];
  const filledAll = sesiConfig.every(sc => countFilled(sc.key) > 0);

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9",
                  fontFamily:"'IBM Plex Sans', sans-serif" }}>

      {/* Top nav */}
      <div style={{ background:"#0B2545", position:"sticky", top:0, zIndex:100,
                    boxShadow:"0 2px 12px rgba(0,0,0,.2)" }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 20px",
                      display:"flex", alignItems:"center", gap:16, height:56 }}>
          <div style={{ flex:1 }}>
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, fontWeight:600,
                           color:"#C9A84C", letterSpacing:"2px", textTransform:"uppercase" }}>
              WORKBOOK DIKLAT
            </span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,.6)", marginLeft:8 }}>
              {name}
            </span>
          </div>
          {saved && (
            <span style={{ fontSize:11, color:"#4ADE80",
                           fontFamily:"'IBM Plex Mono', monospace" }}>
              ✓ tersimpan
            </span>
          )}
          <button onClick={handleReset}
            style={{ fontSize:11, color:"rgba(255,255,255,.4)", background:"none",
                     border:"none", cursor:"pointer", fontFamily:"'IBM Plex Sans', sans-serif" }}>
            Reset
          </button>
        </div>

        {/* Sesi tabs */}
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 20px",
                      display:"flex", gap:2, paddingBottom:0 }}>
          {sesiConfig.map(sc => (
            <button key={sc.num} onClick={() => setActiveSesi(sc.num)}
              style={{ flex:1, padding:"10px 8px", fontSize:11, fontWeight:600,
                       border:"none", cursor:"pointer", transition:"all .15s",
                       fontFamily:"'IBM Plex Mono', monospace", letterSpacing:".5px",
                       borderRadius:"6px 6px 0 0",
                       background: activeSesi === sc.num ? sc.color : "rgba(255,255,255,.08)",
                       color: activeSesi === sc.num ? "#fff" : "rgba(255,255,255,.5)",
                       borderBottom: activeSesi === sc.num ? `3px solid ${colors.gold}` : "3px solid transparent",
                     }}>
              <div>S{sc.num}</div>
              <div style={{ fontSize:9, marginTop:1, opacity:.8 }}>{sc.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sesi header */}
      <div style={{ background:sesi.color, padding:"20px", color:"#fff" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10, fontWeight:600,
                        color:colors.gold, letterSpacing:"2px", textTransform:"uppercase",
                        marginBottom:4 }}>
            SESI {sesi.num} — {sesiConfig[activeSesi-1].label.toUpperCase()}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              {["Transformasi Pola Pikir Strategis","Growth Leadership",
                "Service Excellence","Budaya Sinergis AKHLAK"][activeSesi-1] }
            </div>
            <ProgressBar
              completed={countFilled(sesi.key)}
              total={totalFields[sesi.key]}
              color={colors.gold}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"24px 20px 40px" }}>
        {activeSesi === 1 && <Sesi1 data={workData.sesi1} onChange={handleChange} />}
        {activeSesi === 2 && <Sesi2 data={workData.sesi2} onChange={handleChange} />}
        {activeSesi === 3 && <Sesi3 data={workData.sesi3} onChange={handleChange} />}
        {activeSesi === 4 && <Sesi4 data={workData.sesi4} onChange={handleChange} />}

        {/* Navigation */}
        <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginTop:32, gap:12 }}>
          <button onClick={() => setActiveSesi(p => Math.max(1, p-1))}
            disabled={activeSesi === 1}
            style={{ padding:"12px 24px", fontSize:14, fontWeight:600, borderRadius:10,
                     border:"2px solid #CBD5E1", background:"#fff", color:"#64748B",
                     cursor: activeSesi === 1 ? "not-allowed" : "pointer",
                     opacity: activeSesi === 1 ? .4 : 1 }}>
            ← Sesi Sebelumnya
          </button>

          {activeSesi === 4 ? (
            <button onClick={handleDownload}
              style={{ padding:"14px 32px", fontSize:15, fontWeight:700, borderRadius:10,
                       background:`linear-gradient(135deg, #C9A84C, #E8A020)`,
                       color:"#0B2545", border:"none", cursor:"pointer",
                       boxShadow:"0 4px 16px rgba(201,168,76,.4)" }}>
              ★ Download Workbook & Action Plan
            </button>
          ) : (
            <button onClick={() => setActiveSesi(p => Math.min(4, p+1))}
              style={{ padding:"12px 24px", fontSize:14, fontWeight:600, borderRadius:10,
                       border:"none", background:sesi.color, color:"#fff",
                       cursor:"pointer" }}>
              Sesi Berikutnya →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}