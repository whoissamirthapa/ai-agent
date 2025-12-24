import apis from "./api.js";

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
    const response = await apis.task[activeTriggerItem || "Chat"](message);
    const aiData = response.reply;
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
  const proceedListHTML = (data["Decision Framework"]["Proceed if"] || [])
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
  const avoidListHTML = (data["Decision Framework"]["Wait/Avoid if"] || [])
    .map(
      (text) => `
        <li class="flex gap-3 text-slate-700 text-sm leading-snug">
            <i class="fas fa-arrow-right mt-1 text-rose-500"></i>
            <span>${text ?? "n/a"}</span>
        </li>
    `
    )
    .join("");
  // Construct the full Template
  const consensusTemplate = `
    <div class="max-w-6xl mx-auto my-8 animate-in fade-in duration-500">
        <!-- Header & Executive Summary -->
        <header class="mb-12 border-b border-slate-200 pb-8">
            <div class="flex items-center gap-4 mb-4">
                <div class="bg-slate-900 text-white p-3 rounded-lg shadow-lg">
                    <i class="fas fa-atom text-2xl"></i>
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Nuclear Weapons Strategic Analysis</h1>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-800">
                <h2 class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Executive Summary</h2>
                <p class="text-slate-700 leading-relaxed text-lg italic font-light">
                    ${data["Executive Summary"] ?? "n/a"}
                </p>
            </div>
        </header>
        <!-- Direct Trade-offs Section -->
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
        <!-- Decision Framework Section -->
        <section>
            <h3 class="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2">
                <i class="fas fa-route text-emerald-600"></i>
                Strategic Decision Framework
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Proceed If -->
                <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 transition-transform hover:scale-[1.01]">
                    <div class="flex items-center gap-3 mb-6 text-emerald-700">
                        <i class="fas fa-check-circle text-2xl"></i>
                        <h4 class="text-xl font-bold">Proceed If</h4>
                    </div>
                    <ul class="space-y-4">
                        ${proceedListHTML?.length ? proceedListHTML : "n/a"}
                    </ul>
                </div>

                <!-- Avoid If -->
                <div class="bg-rose-50 border border-rose-100 rounded-2xl p-8 transition-transform hover:scale-[1.01]">
                    <div class="flex items-center gap-3 mb-6 text-rose-700">
                        <i class="fas fa-exclamation-triangle text-2xl"></i>
                        <h4 class="text-xl font-bold">Wait / Avoid If</h4>
                    </div>
                    <ul class="space-y-4">
                        ${avoidListHTML?.length ? avoidListHTML : "n/a"}
                    </ul>
                </div>
            </div>
        </section>
    </div>
    `;
  // Create container and append
  const consensusDiv = document.createElement("div");
  consensusDiv.className =
    "w-full p-4 md:p-8 bg-slate-50 border-b border-slate-200";
  consensusDiv.innerHTML = consensusTemplate;
  chatWindow.appendChild(consensusDiv);
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
}
