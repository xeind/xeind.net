(() => {
  const WRAPPER_CLASS = "group relative my-4";

  document.addEventListener("readystatechange", () => {
    if (document.readyState !== "interactive" && document.readyState !== "complete") return;
    enhanceBlocks();
  });

  /* Also run immediately in case DOM already loaded */
  if (document.readyState === "interactive" || document.readyState === "complete") {
    enhanceBlocks();
  }

  function makeCopyButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "text-accent/60 hover:text-tertiary flex h-6 w-6 items-center justify-center rounded-[4px] transition-colors shrink-0";
    btn.setAttribute("aria-label", "Copy code");
    btn.innerHTML = `<div class="relative h-3.5 w-3.5">
      <svg class="copy-icon transition-all duration-150 ease-out" style="opacity:1;transform:scale(1)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
      <svg class="check-icon absolute inset-0 transition-all duration-150 ease-out" style="opacity:0;transform:scale(0.4)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    </div>`;

    let timeout;
    btn.addEventListener("click", () => {
      const pre = btn.closest(".group")?.querySelector("pre");
      if (!pre) return;
      const text = pre.textContent || "";
      navigator.clipboard.writeText(text.trim()).then(() => {
        clearTimeout(timeout);
        const copyIcon = btn.querySelector(".copy-icon");
        const checkIcon = btn.querySelector(".check-icon");
        if (copyIcon instanceof SVGElement && checkIcon instanceof SVGElement) {
          copyIcon.style.opacity = "0";
          copyIcon.style.transform = "scale(0.4)";
          checkIcon.style.opacity = "1";
          checkIcon.style.transform = "scale(1)";
          btn.setAttribute("aria-label", "Copied");
        }
        timeout = setTimeout(() => {
          if (copyIcon instanceof SVGElement && checkIcon instanceof SVGElement) {
            copyIcon.style.opacity = "1";
            copyIcon.style.transform = "scale(1)";
            checkIcon.style.opacity = "0";
            checkIcon.style.transform = "scale(0.4)";
            btn.setAttribute("aria-label", "Copy code");
          }
        }, 2000);
      });
    });
    return btn;
  }

  function enhanceBlocks() {
    const blocks = document.querySelectorAll("pre.astro-code:not([data-copy-ready])");

    blocks.forEach((pre) => {
      pre.setAttribute("data-copy-ready", "true");

      /* ── Extract title from first line comment ── */
      let title = pre.getAttribute("data-title") || null;
      if (!title) {
        const firstLine = pre.querySelector(".line:first-child");
        if (firstLine) {
          const text = firstLine.textContent || "";
          const match = text.match(/^\s*(?:\/\/|#|--|\/\*)\s*(.+?)(?:\s*\*\/)?\s*$/);
          if (match) {
            title = match[1];
            firstLine.remove();
            const nextLine = pre.querySelector(".line:first-child");
            if (nextLine && !nextLine.textContent?.trim()) {
              nextLine.remove();
            }
          }
        }
      }

      /* ── Container wrapper ── */
      const wrapper = document.createElement("div");
      wrapper.className = WRAPPER_CLASS;
      pre.parentNode?.insertBefore(wrapper, pre);

      if (title) {
        /* ── Header bar ── */
        pre.setAttribute("data-has-header", "true");
        const header = document.createElement("div");
        header.className =
          "flex h-10 items-center border-b border-dashed border-accent/20 bg-muted/40 px-4 font-mono text-xs tracking-wider";
        header.innerHTML =
          '<span class="text-accent/50 shrink-0">' + title + "</span>";
        const copyBtn = makeCopyButton();
        copyBtn.classList.add("ml-auto");
        header.appendChild(copyBtn);
        wrapper.appendChild(header);
      } else {
        const copyBtn = makeCopyButton();
        copyBtn.className += " absolute top-3 right-3 z-10 h-8 w-8";
        wrapper.appendChild(copyBtn);
      }

      wrapper.appendChild(pre);
    });
  }
})();
