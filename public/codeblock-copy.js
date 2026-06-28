(() => {
  const WRAPPER_CLASS = "group relative my-4";

  var pending = false;
  function scheduleEnhance() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      enhanceBlocks();
    });
  }

  scheduleEnhance();
  document.addEventListener("astro:after-swap", scheduleEnhance);

  function makeCopyButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "text-accent/40 hover:text-tertiary flex h-6 w-6 items-center justify-center rounded-[4px] transition-colors shrink-0";
    btn.setAttribute("aria-label", "Copy code");

    btn.innerHTML =
      '<div class="relative h-3.5 w-3.5">' +
      '<span class="copy-wrap" style="position:absolute;inset:0;display:inline-flex;align-items:center;justify-content:center;transform:scale(1);transition:transform 150ms cubic-bezier(0.23,1,0.32,1);transform-origin:center">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:1;transition:opacity 150ms cubic-bezier(0.23,1,0.32,1)">' +
      '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>' +
      "</svg>" +
      "</span>" +
      '<span class="check-wrap" style="position:absolute;inset:0;display:inline-flex;align-items:center;justify-content:center;transform:scale(0.4);transition:transform 150ms cubic-bezier(0.23,1,0.32,1);transform-origin:center">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0;transition:opacity 150ms cubic-bezier(0.23,1,0.32,1)">' +
      '<path d="M20 6 9 17l-5-5"/>' +
      "</svg>" +
      "</span>" +
      "</div>";

    var copyWrap = btn.querySelector(".copy-wrap");
    var copySvg = copyWrap.querySelector("svg");
    var checkWrap = btn.querySelector(".check-wrap");
    var checkSvg = checkWrap.querySelector("svg");
    var timeout;

    btn.addEventListener("click", function () {
      var pre = btn.closest(".group");
      if (!pre) return;
      var text = pre.querySelector("pre")?.textContent || "";
      navigator.clipboard.writeText(text.trim()).then(function () {
        clearTimeout(timeout);
        copyWrap.style.transform = "scale(0.4)";
        copySvg.style.opacity = "0";
        checkWrap.style.transform = "scale(1)";
        checkSvg.style.opacity = "1";
        btn.setAttribute("aria-label", "Copied");
        timeout = setTimeout(function () {
          copyWrap.style.transform = "scale(1)";
          copySvg.style.opacity = "1";
          checkWrap.style.transform = "scale(0.4)";
          checkSvg.style.opacity = "0";
          btn.setAttribute("aria-label", "Copy code");
        }, 2000);
      });
    });
    return btn;
  }

  function enhanceBlocks() {
    var blocks = document.querySelectorAll(
      "pre.astro-code:not([data-copy-ready])",
    );

    blocks.forEach(function (pre) {
      /* Bail if detached from DOM (ClientRouter timing) */
      if (!pre.parentNode) return;

      var title = pre.getAttribute("data-title") || null;
      if (!title) {
        var firstLine = pre.querySelector(".line:first-child");
        if (firstLine) {
          var text = firstLine.textContent || "";
          var match = text.match(
            /^\s*(?:\/\/|#|--|\/\*)\s*(.+?)(?:\s*\*\/)?\s*$/,
          );
          if (match) {
            title = match[1];
            firstLine.remove();
          }
        }
      }

      var wrapper = document.createElement("div");
      wrapper.className = WRAPPER_CLASS;
      pre.parentNode.insertBefore(wrapper, pre);

      if (title) {
        pre.setAttribute("data-has-header", "true");
        var header = document.createElement("div");
        header.className =
          "flex h-10 items-center border-b border-dashed border-accent/20 bg-muted/40 px-4 font-mono text-xs tracking-wider";
        header.innerHTML =
          '<span class="text-accent/50 shrink-0">' + title + "</span>";
        wrapper.appendChild(header);
      }

      var copyBtn = makeCopyButton();
      copyBtn.classList.add("absolute", "right-3", "z-10", "h-8", "w-8");
      if (title) {
        copyBtn.style.top = "3.25rem";
      } else {
        copyBtn.classList.add("top-3");
      }
      wrapper.appendChild(copyBtn);

      wrapper.appendChild(pre);

      /* Mark done only after everything succeeded */
      pre.setAttribute("data-copy-ready", "true");

      if (title) {
        var code = pre.querySelector("code");
        if (code) {
          var children = [].slice.call(code.childNodes);
          for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (
              child.nodeType === Node.TEXT_NODE &&
              !child.textContent?.trim()
            ) {
              child.remove();
              continue;
            }
            if (
              child.nodeType === Node.ELEMENT_NODE &&
              child.matches(".line") &&
              !child.textContent?.trim()
            ) {
              child.remove();
              continue;
            }
            break;
          }
        }
      }
    });
  }
})();
