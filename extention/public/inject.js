const loadingButtonContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loader animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

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
    chrome.storage.local.get(["user"], (result) => {
      if (!result.user) {
        window.location.href = "https://www.memfree.me/login";
      } else {
        const message = {
          action: "sendURL",
          data: {
            urls: [window.location.href],
            userId: result.user.id,
          },
        };

        button.innerHTML = loadingButtonContent;

        chrome.runtime.sendMessage(message, (response) => {
          console.log("response:", response);
          if (response.ok) {
            alert(
              "This web page indexed successfully! You can now search its content on https://www.memfree.me."
            );
          } else {
            alert("Failed to index web pages, please try again");
          }
          button.innerHTML = svgButtonContent;
        });
      }
    });
  };

  document.body.appendChild(button);
})();

window.addEventListener("message", (event) => {
  if (event.source !== window) {
    return;
  }
  console.log("event.data", event.data);
  const user = event.data.user;
  const hostname = window.location.hostname;

  console.log("user", user);
  console.log("hostname", hostname);

  if (user && (hostname === "localhost" || hostname === "memfree.me")) {
    chrome.storage.local.set({ user }, () => {});
  }
});
