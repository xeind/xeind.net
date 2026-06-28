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
      "text-accent/40 hover:text-tertiary active:scale-[0.96] flex h-10 w-10 items-center justify-center rounded-[4px] transition-[color,transform] shrink-0 motion-reduce:transition-none";
    btn.setAttribute("aria-label", "Copy code");
    btn.setAttribute("data-hero-sfx", "click");
    btn.setAttribute("data-hero-sfx-hover", "");

    btn.innerHTML =
      '<div class="relative h-3.5 w-3.5">' +
      '<span class="copy-wrap" style="position:absolute;inset:0;display:inline-flex;align-items:center;justify-content:center;transform:scale(1);opacity:1;filter:blur(0px);transition:transform 180ms cubic-bezier(0.2,0,0,1),opacity 180ms cubic-bezier(0.2,0,0,1),filter 180ms cubic-bezier(0.2,0,0,1);transform-origin:center;will-change:transform,opacity,filter">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>' +
      "</svg>" +
      "</span>" +
      '<span class="check-wrap" style="position:absolute;inset:0;display:inline-flex;align-items:center;justify-content:center;transform:scale(0.25);opacity:0;filter:blur(4px);transition:transform 180ms cubic-bezier(0.2,0,0,1),opacity 180ms cubic-bezier(0.2,0,0,1),filter 180ms cubic-bezier(0.2,0,0,1);transform-origin:center;will-change:transform,opacity,filter">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20 6 9 17l-5-5"/>' +
      "</svg>" +
      "</span>" +
      "</div>";

    var copyWrap = btn.querySelector(".copy-wrap");
    var checkWrap = btn.querySelector(".check-wrap");
    var timeout;

    btn.addEventListener("click", function () {
      var pre = btn.closest(".group");
      if (!pre) return;
      var text = pre.querySelector("pre")?.textContent || "";
      navigator.clipboard.writeText(text.trim()).then(function () {
        clearTimeout(timeout);
        copyWrap.style.transform = "scale(0.25)";
        copyWrap.style.opacity = "0";
        copyWrap.style.filter = "blur(4px)";
        checkWrap.style.transform = "scale(1)";
        checkWrap.style.opacity = "1";
        checkWrap.style.filter = "blur(0px)";
        btn.setAttribute("aria-label", "Copied");
        timeout = setTimeout(function () {
          copyWrap.style.transform = "scale(1)";
          copyWrap.style.opacity = "1";
          copyWrap.style.filter = "blur(0px)";
          checkWrap.style.transform = "scale(0.25)";
          checkWrap.style.opacity = "0";
          checkWrap.style.filter = "blur(4px)";
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
      copyBtn.classList.add("absolute", "right-2", "z-10");
      if (title) {
        copyBtn.style.top = "2.875rem";
      } else {
        copyBtn.classList.add("top-2");
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
