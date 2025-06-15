const SNIPPETS = {
  greeting: "Hello, I hope you're doing well.",
  signature: "Best regards,\nJohn Doe",
  emailTemplate: "Dear [Name],\n\nThank you for reaching out...\n\nSincerely,\nJohn"
};

chrome.runtime.onInstalled.addListener(() => {
  // Parent menu
  chrome.contextMenus.create({
    id: "pasteSnippet",
    title: "Paste Snippet",
    contexts: ["editable"]
  });

  // Submenus
  for (const [key, value] of Object.entries(SNIPPETS)) {
    chrome.contextMenus.create({
      id: `pasteSnippet_${key}`,
      parentId: "pasteSnippet",
      title: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), // format title
      contexts: ["editable"]
    });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const snippetId = info.menuItemId.replace("pasteSnippet_", "");
  const snippetText = SNIPPETS[snippetId];

  if (!snippetText) return;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (text) => {
      const active = document.activeElement;
      if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT" || active.isContentEditable)) {
        if (active.isContentEditable) {
          document.execCommand('insertText', false, text);
        } else {
          const start = active.selectionStart;
          const end = active.selectionEnd;
          const current = active.value;
          active.value = current.slice(0, start) + text + current.slice(end);
          active.selectionStart = active.selectionEnd = start + text.length;
        }
      }
    },
    args: [snippetText]
  });
});