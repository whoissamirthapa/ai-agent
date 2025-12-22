const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatWindow = document.getElementById("chat-window");
const typingIndicator = document.getElementById("typing-indicator");

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
    // const response = await getMockResponse(message);
    const response = await fetch("http://localhost:8080/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message }),
    });
    const data = await response.json();
    const aiText = data.reply;
    appendMessage("ai", aiText);
  } catch (error) {
    appendMessage("ai", "Sorry, I'm having trouble connecting to the server.");
  } finally {
    typingIndicator.classList.add("hidden");
  }
});

// Simulating an API for demonstration
function getMockResponse(msg) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `I received your message: "${msg}". This is a simulated response from the AI.`
      );
    }, 1500);
  });
}
