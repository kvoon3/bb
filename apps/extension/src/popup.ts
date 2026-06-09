import "./style.css";

const status = document.querySelector<HTMLParagraphElement>("#status");

chrome.runtime.sendMessage({ type: "status" }, (response?: { connected: boolean; daemonUrl: string }) => {
  if (!status) {
    return;
  }

  if (!response) {
    status.textContent = "Background worker is not available.";
    return;
  }

  status.textContent = response.connected ? `Connected to ${response.daemonUrl}` : `Waiting for ${response.daemonUrl}`;
});
