document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("processBookmarksButton");
  const progressBar = document.querySelector(".progress-bar");
  const progress = document.getElementById("progress");
  const progressText = document.getElementById("progress-text");
  const resultInfo = document.getElementById("result-info");

  function updateProgress() {
    chrome.storage.local.get(["progress", "totalUrlsIndexed"], (storage) => {
      const progressPercentage = storage.progress || 0;
      const totalUrlsIndexed = storage.totalUrlsIndexed || 0;

      progress.style.width = `${progressPercentage}%`;
      progressText.textContent = `Index Progress: ${progressPercentage}%`;

      resultInfo.textContent = `${totalUrlsIndexed} Bookmark Indexed`;

      if (progressPercentage > 0) {
        progressBar.style.display = "block";
        button.disabled = true;
      } else {
        progressBar.style.display = "none";
      }

      if (progressPercentage === 100) {
        button.disabled = false;
      }
    });
  }
  updateProgress();

  function resetProgressInStorage(callback) {
    chrome.storage.local.set({ progress: 0 }, callback);
  }

  button.addEventListener("click", () => {
    button.disabled = true;
    progressBar.style.display = "block";

    chrome.runtime.sendMessage({ action: "processBookmarks" }, (response) => {
      if (response.status !== "success") {
        logToBackground("Failed to initiate bookmark processing.");
        button.disabled = false;
      } else {
        logToBackground("Bookmarks processing initiated.");
      }
    });

    resetProgressInStorage(() => {
      updateProgress();
    });

    checkAndUpdateProgress();
  });

  chrome.storage.local.get(["user"], (result) => {
    if (result.user) {
      showUserInfo(result.user);
    } else {
      fetch("https://www.memfree.me/api/auth/session")
        .then((response) => response.json())
        .then((data) => {
          if (!data || !data.user) {
            showLoginButton();
          } else {
            chrome.storage.local.set({ user: data.user }, () => {
              showUserInfo(data.user);
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching user session:", error);
        });
    }
  });

  function checkAndUpdateProgress() {
    const intervalId = setInterval(() => {
      chrome.storage.local.get(["progress"], (storage) => {
        const progressPercentage = storage.progress || 0;
        progress.style.width = `${progressPercentage}%`;
        progressText.textContent = `Index Progress: ${progressPercentage}%`;

        if (progressPercentage >= 100) {
          clearInterval(intervalId);
          button.disabled = false;
        }
      });
    }, 1000);
  }

  function showLoginButton() {
    document.getElementById("login-button").style.display = "inline-block";
    document.getElementById("login-button").addEventListener("click", () => {
      window.open("https://www.memfree.me/login", "_blank");
    });
  }

  function showUserInfo(user) {
    const userInfoDiv = document.getElementById("user-info");
    userInfoDiv.innerHTML = `
            <p>Welcome: ${user.name}</p>`;
  }
});

function logToBackground(message) {
  chrome.runtime.sendMessage({ action: "log", message: message });
}
