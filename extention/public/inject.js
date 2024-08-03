const loadingButtonContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="memfree-loader animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

(function () {
  if (document.getElementById("send-url-button")) return;

  const button = document.createElement("button");
  button.id = "send-url-button";
  button.className = "flot-btn";

  const svgNamespace = "http://www.w3.org/2000/svg";
  const svgButtonContent = `
    <svg xmlns="${svgNamespace}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark-plus">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
      <line x1="12" x2="12" y1="7" y2="13"/>
      <line x1="15" x2="9" y1="10" y2="10"/>
    </svg>
  `;

  button.innerHTML = svgButtonContent;

  button.addEventListener("mousedown", function (e) {
    e.preventDefault();

    let startY = e.clientY - button.offsetTop;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    function onMouseMove(e) {
      let newTop = e.clientY - startY;

      newTop = Math.min(
        Math.max(0, newTop),
        window.innerHeight - button.offsetHeight
      );

      button.style.top = newTop + "px";
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  });

  button.onclick = function () {
    if (button.disabled) return;
    button.disabled = true;

    try {
      chrome.storage.local.get(["user"], function (result) {
        if (!result.user) {
          window.location.href = "https://www.memfree.me/login";
        } else {
          const message = {
            action: "sendURL",
            data: {
              url: window.location.href,
              userId: result.user.id,
            },
          };

          button.innerHTML = loadingButtonContent;

          extractMarkdown(window.location.href)
            .then(function (markdown) {
              message.data.markdown = markdown;
              message.data.title = document.title;

              return chrome.runtime.sendMessage(message);
            })
            .then(function (response) {
              console.log("response:", response);
              if (response.ok) {
                showAlert(
                  'This Web Page Indexed successfully! <br>You can now AI Search and Ask its content on <a href="https://memfree.me" target="_blank">MemFree</a>'
                );
              } else {
                showAlert("Failed to index web pages, please try again");
              }
            })
            .catch(function (error) {
              console.error(
                "Error extracting markdown or sending message:",
                error
              );
              showAlert("Failed to extract content, please try again");
            })
            .finally(function () {
              button.innerHTML = svgButtonContent;
              button.disabled = false;
            });
        }
      });
    } catch (error) {
      console.error("Error sending URL:", error);
      button.disabled = false;
    }
  };

  document.body.appendChild(button);

  const alertContainer = document.createElement("div");
  alertContainer.id = "custom-alert-container";
  alertContainer.innerHTML = `
    <div id="custom-alert">
      <div id="custom-alert-content">
        <p id="custom-alert-message"></p>
        <button id="custom-alert-ok">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(alertContainer);

  function showAlert(message) {
    const alertContainer = document.getElementById("custom-alert-container");
    const alertMessage = document.getElementById("custom-alert-message");
    alertMessage.innerHTML = message;
    alertContainer.style.display = "flex";

    const alertOkButton = document.getElementById("custom-alert-ok");
    alertOkButton.onclick = function () {
      alertContainer.style.display = "none";
    };
  }
})();

function extractMarkdown(baseUrl) {
  return new Promise((resolve, reject) => {
    try {
      const turndownService = new TurndownService();
      const rules = [
        {
          name: "truncate-svg",
          filter: "svg",
          replacement: () => "",
        },
        {
          name: "header",
          filter: ["h1", "h2", "h3"],
          replacement: (content, node) => {
            const level = node.tagName.toLowerCase();
            const prefix = "#".repeat(parseInt(level[1]));
            return `${prefix} ${content}\n\n`;
          },
        },
        {
          name: "absolute-image-paths",
          filter: "img",
          replacement: (content, node) => {
            const src = node.getAttribute("src");
            if (src) {
              const absoluteSrc = new URL(src, baseUrl).href;
              return `![${node.getAttribute("alt") || ""}](${absoluteSrc})`;
            }
            return "";
          },
        },
      ];

      rules.forEach((rule) => turndownService.addRule(rule.name, rule));

      const reader = new Readability(document.cloneNode(true), {
        charThreshold: 0,
        keepClasses: true,
        nbTopCandidates: 10,
      });
      const article = reader.parse();
      const markdown = turndownService.turndown(article?.content || "");
      resolve(markdown);
    } catch (error) {
      console.error("Error extracting markdown:", error);
      reject(error);
    }
  });
}

window.addEventListener("message", (event) => {
  if (event.source !== window) {
    return;
  }
  const user = event.data.user;
  const hostname = window.location.hostname;
  if (user && (hostname === "localhost" || hostname === "www.memfree.me")) {
    chrome.storage.local.set({ user }, () => {});
  }
});
