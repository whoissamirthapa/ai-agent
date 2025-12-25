import { aiAPI, db } from "./api.js";
import { role, type } from "./db.js";

const consensusTriggerContainer = document.getElementById(
  "agent-trigger-container"
);

const items = ["Consensus"];
let activeTriggerItem = "";
let isTriggerPanelOpen = false;

const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatWindow = document.getElementById("chat-window");
const typingIndicator = document.getElementById("typing-indicator");
const viewTriggerBtns = document.getElementById("view-trigger-btns");
const agentTriggerItems = document.querySelectorAll(
  '[data-group="agent-trigger-items"]'
);

agentTriggerItems.forEach((triggerItem) => {
  const triggerEl = triggerItem.getAttribute("data-value");
  const key = triggerEl.toUpperCase();
  if (!key) {
    console.error("Data value is required");
    return;
  }
  triggerItem.querySelector("button")?.addEventListener("click", function (e) {
    e.preventDefault();
    if (activeTriggerItem) {
      activeTriggerItem = "";
    }
    triggerItem.classList.add("hidden");
  });
  triggerItem.addEventListener("click", function (e) {
    e.preventDefault();
    activeTriggerItem = key;
  });
});
function generateTriggerItem(
  name,
  { selectable = true, closable = false, selected = false }
) {
  const div = document.createElement("div");
  div.className = `
    w-fit relative py-1 px-3 rounded-xl text-sm cursor-pointer
    ${
      selected
        ? "bg-blue-300/40 border-blue-400"
        : "bg-blue-100/20 border-blue-100"
    }
    border
  `;
  div.setAttribute("data-value", name);
  div.innerHTML = `<div>${name}</div>`;
  // select item
  if (selectable) {
    div.addEventListener("click", () => {
      activeTriggerItem = name;
      renderSelectedItems();
    });
  }
  // close button
  if (closable) {
    const btn = document.createElement("button");
    btn.className =
      "absolute -top-2 right-0 bg-blue-200/40 hover:bg-blue-200/90 rounded-full px-1";
    btn.innerHTML = `<i class="fa-solid fa-xmark text-red-600 text-sm"></i>`;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      activeTriggerItem = "";
      renderSelectedItems();
    });
    div.appendChild(btn);
  }
  return div;
}
viewTriggerBtns.addEventListener("click", (e) => {
  e.preventDefault();
  isTriggerPanelOpen = !isTriggerPanelOpen;
  consensusTriggerContainer.innerHTML = "";
  if (isTriggerPanelOpen) {
    // show all items (unselected)
    items.forEach((item) => {
      const isSelected = activeTriggerItem === item;
      consensusTriggerContainer.appendChild(
        generateTriggerItem(item, {
          selectable: true,
          closable: isSelected,
          selected: isSelected,
        })
      );
    });
  }
});
function renderSelectedItems() {
  consensusTriggerContainer.innerHTML = "";
  isTriggerPanelOpen = false;
  if (activeTriggerItem) {
    consensusTriggerContainer.appendChild(
      generateTriggerItem(activeTriggerItem, {
        selectable: false,
        closable: true,
        selected: true,
      })
    );
  }
}

// Function to append messages to UI
function appendMessage(role, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className =
    role === "user" ? "flex justify-end" : "flex justify-start";

  const innerDiv = document.createElement("div");
  innerDiv.className =
    role === "user"
      ? "max-w-[80%] bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none shadow-md"
      : "max-w-[80%] bg-white border border-slate-200 text-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm";

  innerDiv.textContent = text;
  msgDiv.appendChild(innerDiv);
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
// Handle Form Submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";

  typingIndicator.classList.remove("hidden");
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const doc = await db.handleSave({ role: role.user, data: message });
    const response = await aiAPI.task[activeTriggerItem || "Chat"](message);
    const aiData = response.reply;
    await db.handleSave({
      qId: doc.qId,
      role: role.assistant,
      type: typeof aiData === "object" ? type.consensus : type.chat,
      data:
        typeof aiData === "object"
          ? { ...(aiData ?? {}), title: message }
          : aiData,
    });
    if (typeof aiData === "object") {
      renderConsensus(aiData);
      return;
    }
    appendMessage("ai", aiData);
  } catch (error) {
    console.error(error);
    appendMessage("ai", "Sorry, I'm having trouble connecting to the server.");
  } finally {
    typingIndicator.classList.add("hidden");
  }
});
function renderConsensus(data) {
  // HTML for the Trade-offs grid
  const tradeOffsHTML = (data["Direct Trade-offs & Clashes"] || [])
    .map(
      (item) => `
        <div class="bg-white border border-slate-200 p-6 rounded-xl hover:shadow-md transition-all">
            <h4 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                ${item["Point of Conflict"] ?? "n/a"}
            </h4>
            <p class="text-slate-600 text-sm leading-relaxed">${
              item["Explain both sides"] ?? "n/a"
            }</p>
        </div>
    `
    )
    .join("");
  // HTML for "Proceed if" list
  const proceedListHTML = (data["Decision Framework"]?.["Proceed if"] || [])
    .map(
      (text) => `
        <li class="flex gap-3 text-slate-700 text-sm leading-snug">
            <i class="fas fa-arrow-right mt-1 text-emerald-500"></i>
            <span>${text ?? "n/a"}</span>
        </li>
    `
    )
    .join("");
  // HTML for "Wait/Avoid if" list
  const avoidListHTML = (data["Decision Framework"]?.["Wait/Avoid if"] || [])
    .map(
      (text) => `
        <li class="flex gap-3 text-slate-700 text-sm leading-snug">
            <i class="fas fa-arrow-right mt-1 text-rose-500"></i>
            <span>${text ?? "n/a"}</span>
        </li>
    `
    )
    .join("");
  // Supporting Evidence Table
  const evidenceHTML = (data["Supporting Evidence"] || [])
    .map(
      (item) => `
    <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
        <td class="py-4 px-4 text-sm text-emerald-700 font-medium">${
          item.Pro ?? "—"
        }</td>
        <td class="py-4 px-4 text-sm text-rose-700 font-medium">${
          item.Con ?? "—"
        }</td>
        <td class="py-4 px-4 text-sm text-slate-600 italic border-l border-slate-100">${
          item.Evidence
        }</td>
    </tr>
  `
    )
    .join("");
  // Risk Analysis
  const riskHTML = (data["Risk & Uncertainty Analysis"] || [])
    .map((risk) => {
      const badgeColor = (val) =>
        val === "High"
          ? "bg-rose-100 text-rose-700"
          : val === "Medium"
          ? "bg-amber-100 text-amber-700"
          : "bg-emerald-100 text-emerald-700";
      return `
      <div class="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <span class="font-bold text-slate-800 text-sm">${risk.Risk}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${badgeColor(
              risk.Likelihood
            )}">Likelihood: ${risk.Likelihood}</span>
            <span class="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${badgeColor(
              risk.Impact
            )}">Impact: ${risk.Impact}</span>
          </div>
      </div>
    `;
    })
    .join("");
  // Alternative Options
  const alternativesHTML = (data["Alternative Options"] || [])
    .map(
      (alt) => `
    <div class="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-xl">
        <h5 class="font-bold text-blue-900">${alt.Option}</h5>
        <p class="text-sm text-blue-800/80 mt-1">${alt.Explanation}</p>
    </div>
  `
    )
    .join("");
  // Scenario Analysis
  const scenariosHTML = (data["Scenario Analysis"] || [])
    .map(
      (s) => `
    <div class="bg-slate-800 text-slate-200 p-5 rounded-xl">
        <div class="text-xs font-bold text-slate-400 uppercase mb-2">Scenario</div>
        <div class="text-white font-semibold mb-3">${s.Scenario}</div>
        <div class="text-sm text-slate-400 border-t border-slate-700 pt-3 italic">
            <span class="text-blue-400 font-bold">Effect:</span> ${s["Effect on Pros/Cons"]}
        </div>
    </div>
  `
    )
    .join("");
  // Next Steps Table
  const nextStepsHTML = (data["Next Steps"] || [])
    .map(
      (step) => `
    <tr class="border-b border-slate-200 last:border-0">
        <td class="py-3 px-2 font-semibold text-slate-800 text-sm">${
          step.Action
        }</td>
        <td class="py-3 px-2 text-slate-600 text-sm">${
          step.Responsible ?? "TBD"
        }</td>
        <td class="py-3 px-2 text-slate-500 text-sm font-mono">${
          step.Timeline ?? "—"
        }</td>
    </tr>
  `
    )
    .join("");
  // Construct the full Template
  const consensusTemplate = `
    <div class="mx-auto mb-8 animate-in fade-in duration-500">
        <header class="mb-12 border-b border-slate-200 pb-8">
            <div class="flex items-center gap-4 mb-4">
                <div class="bg-slate-600 text-white px-4 py-2 rounded-lg shadow-lg text-3xl">
                    <i class="fa-regular fa-lightbulb"></i>
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">${
                  data?.title ?? "n/a"
                }</h1>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-800">
                <h2 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Executive Summary</h2>
                <p class="text-slate-700 leading-relaxed text-lg italic font-light">${
                  data["Executive Summary"] ?? "n/a"
                }</p>
            </div>
        </header>
        ${
          data["Direct Trade-offs & Clashes"]?.length
            ? `<section class="mb-16">
              <h3 class="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <i class="fas fa-balance-scale text-blue-600"></i>
                Direct Trade-offs & Clashes
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${tradeOffsHTML}
              </div>
            </section>`
            : ""
        }
        <section class="mb-16">
            <h3 class="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <i class="fas fa-route text-emerald-600"></i> Strategic Decision Framework
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 transition-transform hover:scale-[1.01]">
                    <div class="flex items-center gap-3 mb-6 text-emerald-700"><i class="fas fa-check-circle text-2xl"></i><h4 class="text-xl font-bold">Proceed If</h4></div>
                    <ul class="space-y-4">${proceedListHTML || "n/a"}</ul>
                </div>
                <div class="bg-rose-50 border border-rose-100 rounded-2xl p-8 transition-transform hover:scale-[1.01]">
                    <div class="flex items-center gap-3 mb-6 text-rose-700"><i class="fas fa-exclamation-triangle text-2xl"></i><h4 class="text-xl font-bold">Wait / Avoid If</h4></div>
                    <ul class="space-y-4">${avoidListHTML || "n/a"}</ul>
                </div>
            </div>
        </section>
        <section class="mb-16 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 class="font-bold text-slate-800 flex items-center gap-2"><i class="fas fa-microscope text-indigo-500"></i> Supporting Evidence</h3>
            </div>
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest">
                        <th class="py-3 px-4 font-bold">Pro</th>
                        <th class="py-3 px-4 font-bold">Con</th>
                        <th class="py-3 px-4 font-bold">Evidence Reference</th>
                    </tr>
                </thead>
                <tbody>${evidenceHTML}</tbody>
            </table>
        </section>
        <section class="mb-16">
            <h3 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <i class="fas fa-shield-virus text-rose-600"></i> Risk & Uncertainty Analysis
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${riskHTML}</div>
        </section>
        <div class="flex flex-col lg:flex-row gap-12 mb-16">
            ${
              alternativesHTML?.length
                ? `<section class="w-full">
                <h3 class="text-2xl font-bold text-slate-800 mb-6">Alternative Options</h3>
                <div class="space-y-4">${alternativesHTML}</div>
            </section>`
                : ""
            }
            <section class="w-full">
                <h3 class="text-2xl font-bold text-slate-800 mb-6 text-emerald-700">Actionable Recommendations</h3>
                <div class="bg-emerald-900 text-emerald-50 p-6 rounded-2xl shadow-xl">
                    <ul class="space-y-4">
                        ${(data["Actionable Recommendations"] || [])
                          .map(
                            (rec) => `
                            <li class="flex gap-3 items-start border-b border-emerald-800 pb-3 last:border-0">
                                <i class="fas fa-bolt mt-1 text-emerald-400"></i>
                                <span class="text-sm leading-relaxed">${rec}</span>
                            </li>
                        `
                          )
                          .join("")}
                    </ul>
                </div>
            </section>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div class="lg:col-span-2 space-y-4">
                <h3 class="text-2xl font-bold text-slate-800 mb-2">Scenario Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${scenariosHTML}</div>
            </div>
            <div class="bg-white border-2 border-slate-900 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                <div class="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Consensus Score</div>
                <div class="text-6xl font-black text-slate-900 mb-4">${
                  data["Consensus Score"]?.Score ?? 0
                }%</div>
                <div class="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                    <div class="bg-slate-900 h-full" style="width: ${
                      data["Consensus Score"]?.Score ?? 0
                    }%"></div>
                </div>
                <p class="text-sm text-slate-600 italic">${
                  data["Consensus Score"]?.Explanation ?? ""
                }</p>
            </div>
        </div>
        <section class="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 pt-12">
            <div>
                <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <i class="fas fa-question-circle text-orange-500"></i> Unresolved Questions
                </h4>
                <ul class="space-y-2">
                    ${(data["Open Questions"] || [])
                      .map(
                        (q) =>
                          `<li class="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg">• ${q}</li>`
                      )
                      .join("")}
                </ul>
            </div>
            <div>
                <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <i class="fas fa-tasks text-blue-600"></i> Next Steps
                </h4>
                <table class="w-full">
                    <tbody class="divide-y divide-slate-100">${nextStepsHTML}</tbody>
                </table>
            </div>
        </section>
    </div>
    `;
  // Create container and append
  const consensusDiv = document.createElement("div");
  consensusDiv.className =
    "w-full px-4 md:px-8 bg-slate-50 border-b border-slate-200";
  consensusDiv.innerHTML = consensusTemplate;
  chatWindow.appendChild(consensusDiv);
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
}

window.document.addEventListener("DOMContentLoaded", async () => {
  const response = await db.loadData();
  chatWindow.innerHTML = "";
  const grouped = response.reduce((acc, item) => {
    acc[item.qId] ||= [];
    acc[item.qId].push(item);
    return acc;
  }, {});
  const result = Object.values(grouped)
    .flatMap((items) => {
      if (items.length === 1) return items;
      const [a, b] = items;
      return a.role === role.user ? [a, b] : [b, a];
    })
    .sort((a, b) => a.createdAt - b.createdAt);
  result.forEach((v) => {
    if (v.type === type.chat || v.role === role.user) {
      appendMessage(v.role.toLowerCase(), v.data);
      return;
    }
    renderConsensus(v.data);
  });
});
