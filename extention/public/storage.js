export async function setItem(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function getItem(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}

export async function getUserId() {
  const user = await getItem("user");
  return user && user.id ? user.id : null;
}

export async function incrementItem(key, incrementBy = 1) {
  return getItem(key).then((currentValue) => {
    const newValue = (currentValue || 0) + incrementBy;
    return setItem(key, newValue).then(() => newValue);
  });
}
