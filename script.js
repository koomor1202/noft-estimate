const PAGE_OPTIONS = [
  { id: "page-1", label: "1ページ", pages: 1, totalPrice: 100000, description: "基本制作費のみ。" },
  { id: "page-2", label: "2ページ", pages: 2, totalPrice: 130000, description: "1ページ追加。" },
  { id: "page-3", label: "3ページ", pages: 3, totalPrice: 160000, description: "2ページ追加。" },
  { id: "page-4", label: "4ページ", pages: 4, totalPrice: 190000, description: "3ページ追加。" },
  { id: "page-5", label: "5ページ", pages: 5, totalPrice: 220000, description: "4ページ追加。" }
];

const FEATURES = [
  { id: "cms", label: "CMS追加（お知らせ / ブログ以外の更新枠）", price: 30000, description: "基本制作費に含まれる簡易CMS以外の更新枠を追加します。" },
  { id: "custom-code", label: "カスタムコード実装（標準機能ではできない特別な実装）", price: 50000, description: "標準機能では難しい見せ方や機能を追加します。" },
  { id: "animation", label: "アニメーション実装（動きのある演出）", price: 30000, description: "スクロール時の動きや印象的な演出を追加します。" }
];

const ADDONS = [
  { id: "page-add", label: "追加ページ（5ページを超える場合）", price: 30000, kind: "quantity", unitLabel: "ページ", description: "5ページを超える場合や、さらにページ数を増やしたい場合に使います。" },
  { id: "cms-model", label: "CMS追加 1モデル（更新枠をさらに追加）", price: 30000, kind: "quantity", unitLabel: "モデル", description: "実績、スタッフ、導入事例など別の更新枠を増やす場合です。" },
  { id: "copy-simple", label: "コピーライティング（文章の簡易整理）", price: 10000, kind: "toggle", exclusiveGroup: "copy", description: "短いテキストや見出しの整理向けです。" },
  { id: "copy-full", label: "コピーライティング（文章の全体設計）", price: 50000, kind: "toggle", exclusiveGroup: "copy", description: "全体の文章構成やセクションごとの文章設計を含みます。" }
];

const EXTRAS = [
  { id: "custom-domain", label: "独自ドメインを利用する（オリジナルURLで公開）", price: 0, kind: "toggle", description: "選択するとSTUDIO利用料が自動反映されます。", note: "2ページまで Mini / 3ページ以上 Personal" },
  { id: "domain-new", label: "新規ドメイン取得を希望する（.com / .net / .site など）", price: 770, kind: "toggle", description: "ドメインの種類により料金は変動します。参考: .com 770円/年〜、.net 1,848円/年〜。ムームードメイン参考価格、別途サービス維持調整費あり。", note: "年額の目安" }
];

const BASE_PRODUCTION_FEE = 100000;
const STUDIO_MINI_YEARLY = 7080;
const STUDIO_PERSONAL_YEARLY = 14280;
const TAX_RATE = 0.1;
const LINE_URL = "https://lin.ee/6EH465r";
const CONTACT_URL = "https://noft-designworks.com/contact";

const state = {
  pageOptionId: PAGE_OPTIONS[0].id,
  featureSelections: {},
  addonSelections: {},
  extraSelections: {}
};

const elements = {
  pageCountList: document.getElementById("pageCountList"),
  featureList: document.getElementById("featureList"),
  addonList: document.getElementById("addonList"),
  extraList: document.getElementById("extraList"),
  summaryPlan: document.getElementById("summaryPlan"),
  summaryTotal: document.getElementById("summaryTotal"),
  summaryMeta: document.getElementById("summaryMeta"),
  stickySummaryPlan: document.getElementById("stickySummaryPlan"),
  stickySummaryTotal: document.getElementById("stickySummaryTotal"),
  breakdownList: document.getElementById("breakdownList"),
  customerName: document.getElementById("customerName"),
  customerCompany: document.getElementById("customerCompany"),
  customerMessage: document.getElementById("customerMessage"),
  toast: document.getElementById("toast"),
  resultPanel: document.getElementById("resultPanel"),
  stickySummary: document.getElementById("stickySummary")
};

function initializeState() {
  state.pageOptionId = PAGE_OPTIONS[0].id;
  state.featureSelections = {};
  state.addonSelections = {};
  state.extraSelections = {};

  for (const item of FEATURES) {
    state.featureSelections[item.id] = false;
  }

  for (const item of ADDONS) {
    state.addonSelections[item.id] = item.kind === "quantity" ? 0 : false;
  }

  for (const item of EXTRAS) {
    state.extraSelections[item.id] = false;
  }
}

function yen(value) {
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
}

function getSelectedPageOption() {
  return PAGE_OPTIONS.find((item) => item.id === state.pageOptionId);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function buildPageCountCards() {
  elements.pageCountList.innerHTML = "";
  for (const item of PAGE_OPTIONS) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `plan-card${item.id === state.pageOptionId ? " is-active" : ""}`;
    card.innerHTML = `
      <span class="plan-card__chip">ページ数</span>
      <h3 class="plan-card__title">${item.label}</h3>
      <div class="plan-card__price">${yen(item.totalPrice)}</div>
      <p class="plan-card__lead">${item.description}</p>
    `;
    card.addEventListener("click", () => {
      state.pageOptionId = item.id;
      render();
    });
    elements.pageCountList.appendChild(card);
  }
}

function buildOptionRow(item, group, value, allItems) {
  const row = document.createElement("div");
  const isQuantity = item.kind === "quantity";
  const checked = isQuantity ? value > 0 : !!value;
  const domainLocked = item.id === "domain-new" && !state.extraSelections["custom-domain"];
  row.className = `option-row${checked ? " is-selected" : ""}${domainLocked ? " is-disabled" : ""}`;

  row.innerHTML = `
    <div class="option-row__main">
      <input class="option-row__check" type="checkbox" ${checked ? "checked" : ""} ${domainLocked ? "disabled" : ""}>
      <div>
        <h4 class="option-row__title">${item.label}</h4>
        <p class="option-row__desc">${item.description}</p>
      </div>
      <div class="option-row__price">
        ${yen(item.price)}
        <span class="option-row__price-sub">${item.note || (isQuantity ? `1${item.unitLabel}ごと` : "追加料金")}</span>
      </div>
    </div>
    ${isQuantity ? `
      <div class="option-row__qty">
        <button class="qty-btn" type="button" data-act="minus">-</button>
        <span class="qty-value">${value}</span>
        <button class="qty-btn" type="button" data-act="plus">+</button>
      </div>
    ` : ""}
  `;

  const checkbox = row.querySelector(".option-row__check");
  checkbox.addEventListener("change", (event) => {
    if (item.exclusiveGroup && event.target.checked) {
      for (const candidate of allItems) {
        if (candidate.exclusiveGroup === item.exclusiveGroup) {
          group[candidate.id] = false;
        }
      }
    }
    group[item.id] = isQuantity ? (event.target.checked ? 1 : 0) : event.target.checked;
    render();
  });

  if (isQuantity) {
    row.querySelector('[data-act="minus"]').addEventListener("click", () => {
      group[item.id] = Math.max(0, group[item.id] - 1);
      render();
    });
    row.querySelector('[data-act="plus"]').addEventListener("click", () => {
      group[item.id] += 1;
      render();
    });
  }

  return row;
}

function buildFeatureList() {
  elements.featureList.innerHTML = "";
  for (const item of FEATURES) {
    elements.featureList.appendChild(buildOptionRow(item, state.featureSelections, state.featureSelections[item.id], FEATURES));
  }
}

function buildAddonList() {
  elements.addonList.innerHTML = "";
  for (const item of ADDONS) {
    elements.addonList.appendChild(buildOptionRow(item, state.addonSelections, state.addonSelections[item.id], ADDONS));
  }
}

function buildExtraList() {
  elements.extraList.innerHTML = "";
  for (const item of EXTRAS) {
    elements.extraList.appendChild(buildOptionRow(item, state.extraSelections, state.extraSelections[item.id], EXTRAS));
  }
}

function calculateEstimate() {
  const pageOption = getSelectedPageOption();
  const breakdown = [];
  let subtotal = pageOption.totalPrice;

  breakdown.push({
    name: "基本制作費",
    detail: "1ページベース / お問い合わせフォーム・レスポンシブ対応・簡易CMS（お知らせ / ブログ）込み",
    amount: BASE_PRODUCTION_FEE
  });

  if (pageOption.pages > 1) {
    breakdown.push({
      name: "ページ追加",
      detail: `${pageOption.pages - 1}ページ追加`,
      amount: pageOption.totalPrice - BASE_PRODUCTION_FEE
    });
  }

  for (const item of FEATURES) {
    if (state.featureSelections[item.id]) {
      breakdown.push({ name: item.label, detail: "追加", amount: item.price });
      subtotal += item.price;
    }
  }

  for (const item of ADDONS) {
    const selection = state.addonSelections[item.id];
    if (item.kind === "quantity" && selection > 0) {
      const amount = selection * item.price;
      breakdown.push({ name: item.label, detail: `${selection}${item.unitLabel}`, amount });
      subtotal += amount;
    }
    if (item.kind === "toggle" && selection) {
      breakdown.push({ name: item.label, detail: "追加", amount: item.price });
      subtotal += item.price;
    }
  }

  if (state.extraSelections["custom-domain"]) {
    const studioFee = pageOption.pages <= 2 ? STUDIO_MINI_YEARLY : STUDIO_PERSONAL_YEARLY;
    const studioLabel = pageOption.pages <= 2 ? "STUDIO利用料 Mini" : "STUDIO利用料 Personal";
    const studioNote = pageOption.pages <= 2 ? "独自ドメイン利用 / 2ページまで" : "独自ドメイン利用 / 3ページ以上";
    breakdown.push({ name: studioLabel, detail: studioNote, amount: studioFee });
    subtotal += studioFee;
  }

  for (const item of EXTRAS) {
    if (item.id === "custom-domain") {
      continue;
    }
    if (state.extraSelections[item.id]) {
      breakdown.push({ name: item.label, detail: item.note, amount: item.price });
      subtotal += item.price;
    }
  }

  const tax = Math.round(subtotal * TAX_RATE);
  return {
    pageOption,
    breakdown,
    subtotal,
    tax,
    total: subtotal + tax
  };
}

function normalizeExtraSelections() {
  if (!state.extraSelections["custom-domain"]) {
    state.extraSelections["domain-new"] = false;
  }
}

function buildSummary() {
  const estimate = calculateEstimate();
  elements.summaryPlan.textContent = `基本制作費 / ${estimate.pageOption.label}`;
  elements.summaryTotal.textContent = yen(estimate.total);
  elements.summaryMeta.textContent = `税抜 ${yen(estimate.subtotal)} / 消費税 ${yen(estimate.tax)}`;
  elements.stickySummaryPlan.textContent = `${estimate.pageOption.label} / 税抜 ${yen(estimate.subtotal)}`;
  elements.stickySummaryTotal.textContent = yen(estimate.total);

  elements.breakdownList.innerHTML = "";
  for (const item of estimate.breakdown) {
    const row = document.createElement("div");
    row.className = "breakdown-item";
    row.innerHTML = `
      <div>
        <span>${item.name}</span>
        <span class="breakdown-item__meta">${item.detail}</span>
      </div>
      <div class="breakdown-item__price">${yen(item.amount)}</div>
    `;
    elements.breakdownList.appendChild(row);
  }
}

function buildEstimateText() {
  const estimate = calculateEstimate();
  const lines = [];
  const name = elements.customerName.value.trim();
  const company = elements.customerCompany.value.trim();
  const message = elements.customerMessage.value.trim();

  lines.push("NOFT Design Works 見積りシミュレーション");
  lines.push("");
  lines.push(`ページ数: ${estimate.pageOption.label}`);
  if (name) lines.push(`お名前: ${name}`);
  if (company) lines.push(`会社名 / 屋号: ${company}`);
  lines.push("");
  lines.push("内訳:");
  for (const item of estimate.breakdown) {
    lines.push(`- ${item.name} (${item.detail}) ${yen(item.amount)}`);
  }
  lines.push("");
  lines.push(`税抜合計: ${yen(estimate.subtotal)}`);
  lines.push(`消費税: ${yen(estimate.tax)}`);
  lines.push(`税込合計: ${yen(estimate.total)}`);
  if (message) {
    lines.push("");
    lines.push("相談内容:");
    lines.push(message);
  }
  lines.push("");
  lines.push("※本見積りは概算です。正式なお見積りはヒアリング後にご案内します。");
  return lines.join("\n");
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}

async function copyEstimateText() {
  const text = buildEstimateText();
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const copied = fallbackCopyText(text);
      if (!copied) {
        throw new Error("Fallback copy failed.");
      }
    }
    showToast("見積り内容をコピーしました。");
    return true;
  } catch (error) {
    const copied = fallbackCopyText(text);
    if (copied) {
      showToast("見積り内容をコピーしました。");
      return true;
    }
    showToast("コピーに失敗しました。");
    return false;
  }
}

async function openLineFlow() {
  const copied = await copyEstimateText();
  if (!copied) {
    window.alert("自動コピーに失敗しました。先に「見積り内容をコピー」を押してから、LINEでご相談ください。");
    return;
  }
  showToast("見積り内容をコピーしました。LINEに貼り付けてご相談ください。");
  window.open(LINE_URL, "_blank", "noopener");
}

async function openContactFlow() {
  const copied = await copyEstimateText();
  if (!copied) {
    window.alert("自動コピーに失敗しました。先に「見積り内容をコピー」を押してから、お問い合わせへ進んでください。");
    return;
  }
  showToast("見積り内容をコピーしました。お問い合わせ欄に貼り付けてお送りください。");
  window.open(CONTACT_URL, "_blank", "noopener");
}

function fillPrintSheet() {
  const estimate = calculateEstimate();
  const now = new Date();
  const body = document.getElementById("printTableBody");

  body.innerHTML = "";
  for (const item of estimate.breakdown) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.detail}</td>
      <td>${yen(item.amount)}</td>
    `;
    body.appendChild(row);
  }

  document.getElementById("printDate").textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  document.getElementById("printTotal").textContent = yen(estimate.total);
  document.getElementById("printPlan").textContent = `${estimate.pageOption.label} / 税抜 ${yen(estimate.subtotal)} / 消費税 ${yen(estimate.tax)}`;
  document.getElementById("printMessage").textContent = buildEstimateText();
}

function downloadEstimatePdf() {
  fillPrintSheet();
  const sheet = document.getElementById("printSheet");
  sheet.classList.add("is-exporting");

  const options = {
    margin: 0,
    filename: `noft-estimate-${new Date().toISOString().slice(0, 10)}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  const pdfRunner = window.html2pdf ? window.html2pdf().set(options).from(sheet).save() : Promise.reject(new Error("html2pdf unavailable"));
  pdfRunner.finally(() => {
    sheet.classList.remove("is-exporting");
  }).catch(() => {
    showToast("PDF保存に失敗しました。");
  });
}

function resetAll() {
  initializeState();
  elements.customerName.value = "";
  elements.customerCompany.value = "";
  elements.customerMessage.value = "";
  render();
  showToast("内容をリセットしました。");
}

function render() {
  normalizeExtraSelections();
  buildPageCountCards();
  buildFeatureList();
  buildAddonList();
  buildExtraList();
  buildSummary();
}

function syncStickySummaryVisibility() {
  const rect = elements.resultPanel.getBoundingClientRect();
  const isNearResult = rect.top <= window.innerHeight * 0.7 && rect.bottom >= 0;
  elements.stickySummary.style.opacity = isNearResult ? "0" : "1";
  elements.stickySummary.style.transform = isNearResult ? "translateX(-50%) translateY(12px)" : "translateX(-50%) translateY(0)";
}

document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  downloadEstimatePdf();
});

document.getElementById("copyEstimateBtn").addEventListener("click", () => {
  copyEstimateText();
});

document.getElementById("lineBtn").addEventListener("click", () => {
  openLineFlow();
});

document.getElementById("contactBtn").addEventListener("click", () => {
  openContactFlow();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  resetAll();
});

document.getElementById("jumpToResultBtn").addEventListener("click", () => {
  elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

window.addEventListener("scroll", syncStickySummaryVisibility, { passive: true });
window.addEventListener("resize", syncStickySummaryVisibility);

initializeState();
render();
syncStickySummaryVisibility();
