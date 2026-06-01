export const UI_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Font Replace One Click</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f6fb;
        --panel: #ffffff;
        --text: #172033;
        --muted: #667085;
        --line: #d7deea;
        --primary: #126bfb;
        --primary-strong: #0b57d0;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: var(--bg);
        color: var(--text);
        font: 13px/1.5 Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
      }

      body {
        padding: 16px;
      }

      .shell {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 14px;
      }

      .section-block + .section-block {
        padding-top: 10px;
      }

      .section-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      h1,
      h2,
      p {
        margin: 0;
      }

      h1 {
        font-size: 18px;
        line-height: 1.2;
      }

      h2 {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted);
      }

      .intro {
        gap: 6px;
      }

      .intro p,
      .meta,
      .hint,
      .search-tip,
      .footer {
        color: var(--muted);
      }

      input,
      button {
        width: 100%;
        min-height: 38px;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: #fff;
        color: var(--text);
        padding: 0 12px;
        font: inherit;
      }

      input:focus {
        outline: none;
        border-color: #000;
      }

      button {
        cursor: pointer;
      }

      input:disabled,
      button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .primary {
        background: var(--primary);
        border-color: var(--primary);
        color: #fff;
        font-weight: 700;
      }

      .primary:hover:not(:disabled) {
        background: var(--primary-strong);
        border-color: var(--primary-strong);
      }

      .primary:disabled {
        background: #e6ebf5;
        border-color: #e6ebf5;
        color: #98a2b3;
        opacity: 1;
      }

      .search-select {
        position: relative;
      }

      .select-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        text-align: left;
      }

      .select-trigger-label {
        min-width: 0;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: 600;
      }

      .select-trigger-placeholder {
        color: var(--muted);
        font-weight: 400;
      }

      .select-trigger-icon {
        color: var(--muted);
        font-size: 12px;
        transition: transform 0.16s ease;
      }

      .search-select.open .select-trigger-icon {
        transform: rotate(180deg);
      }

      .search-dropdown {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        right: 0;
        z-index: 10;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 12px;
        box-shadow: 0 16px 32px rgba(23, 32, 51, 0.12);
        overflow: hidden;
      }

      .search-dropdown.hidden {
        display: none;
      }

      .dropdown-search-wrap {
        padding: 10px;
        border-bottom: 1px solid var(--line);
        background: #fff;
      }

      .dropdown-search-input {
        min-height: 36px;
      }

      .search-option-list {
        max-height: 220px;
        overflow: auto;
      }

      .search-option {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        min-height: 38px;
        padding: 8px 12px;
        border: 0;
        border-radius: 0;
        background: #fff;
        text-align: left;
      }

      .search-option:hover:not(:disabled),
      .search-option.active {
        background: #f3f6fc;
      }

      .search-option-main {
        min-width: 0;
        flex: 1;
      }

      .search-option-title {
        display: block;
        font-weight: 600;
      }

      .search-option-meta {
        display: block;
        font-size: 12px;
        color: var(--muted);
      }

      .search-check {
        color: var(--primary);
        font-weight: 700;
      }

      .search-empty {
        padding: 12px;
        color: var(--muted);
      }

      .search-tip {
        font-size: 12px;
        line-height: 1.45;
      }

      .font-list {
        max-height: 180px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .font-item {
        border: 0;
        border-radius: 12px;
        padding: 10px 12px;
        background: #f4f6fb;
      }

      .font-item strong {
        display: block;
      }

      .footer {
        text-align: center;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <section class="card intro">
        <h1>Replace Fonts</h1>
        <p>Select one or more frames, or any layers inside them, then replace a source font family across those frames with a target font family.</p>
      </section>

      <section class="card">
        <div class="section-block">
          <h2>Source Font</h2>
          <label class="search-select" id="sourceSelect">
            <button id="sourceFamily" class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
              <span id="sourceFamilyLabel" class="select-trigger-label select-trigger-placeholder">e.g. Inter</span>
              <span class="select-trigger-icon">▾</span>
            </button>
            <div id="sourceDropdown" class="search-dropdown hidden">
              <div class="dropdown-search-wrap">
                <input id="sourceSearchInput" class="dropdown-search-input" placeholder="Search fonts" autocomplete="off" />
              </div>
              <div id="sourceOptions" class="search-option-list"></div>
            </div>
          </label>
        </div>

        <div class="section-block">
          <h2>Target Font</h2>
          <label class="search-select" id="targetSelect">
            <button id="targetFamily" class="select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
              <span id="targetFamilyLabel" class="select-trigger-label select-trigger-placeholder">e.g. PingFang SC</span>
              <span class="select-trigger-icon">▾</span>
            </button>
            <div id="targetDropdown" class="search-dropdown hidden">
              <div class="dropdown-search-wrap">
                <input id="targetSearchInput" class="dropdown-search-input" placeholder="Search fonts" autocomplete="off" />
              </div>
              <div id="targetOptions" class="search-option-list"></div>
            </div>
          </label>
        </div>

        <div class="section-block">
          <button id="replace" class="primary">Replace All</button>
          <div class="search-tip">Continuous mode: after each replacement, the plugin will automatically move to the next pending source font in the current frame selection.</div>
        </div>
      </section>

      <section class="card">
        <h2>Font List</h2>
        <div id="fontList" class="font-list"></div>
      </section>

      <div class="footer">This version reads and replaces fonts in the currently selected frame set.</div>
    </div>

    <script>
      const sourceFamilyEl = document.getElementById("sourceFamily");
      const targetFamilyEl = document.getElementById("targetFamily");
      const sourceFamilyLabelEl = document.getElementById("sourceFamilyLabel");
      const targetFamilyLabelEl = document.getElementById("targetFamilyLabel");
      const sourceSearchInputEl = document.getElementById("sourceSearchInput");
      const targetSearchInputEl = document.getElementById("targetSearchInput");
      const sourceDropdownEl = document.getElementById("sourceDropdown");
      const targetDropdownEl = document.getElementById("targetDropdown");
      const sourceOptionsEl = document.getElementById("sourceOptions");
      const targetOptionsEl = document.getElementById("targetOptions");
      const fontListEl = document.getElementById("fontList");
      const replaceButton = document.getElementById("replace");

      let pluginState = null;
      let sourceOptions = [];
      let targetOptions = [];
      let sourceFamilyValue = "";
      let targetFamilyValue = "";
      let isBusy = false;

      function post(message) {
        parent.postMessage({ pluginMessage: message }, "*");
      }

      function updateReplaceButtonState() {
        const hasPluginState = !!pluginState;
        const hasInventory = hasPluginState && pluginState.inventoryFonts.length > 0;
        const sourceFamily = sourceFamilyValue.trim();
        const targetFamily = targetFamilyValue.trim();
        const sourceMatch = hasInventory ? findInventoryFamily(sourceFamily) : null;
        const targetMatch =
          hasPluginState && targetFamily
            ? pluginState.availableFonts.find((item) => item.family === targetFamily)
            : null;

        replaceButton.disabled = Boolean(
          isBusy ||
            !hasPluginState ||
            !hasInventory ||
            !sourceFamily ||
            !targetFamily ||
            !sourceMatch ||
            !targetMatch
        );
      }

      function setBusy(nextBusy) {
        isBusy = nextBusy;
        updateReplaceButtonState();
      }

      function normalizeKeyword(value) {
        return value.trim().toLowerCase();
      }

      function escapeHtml(value) {
        return value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function buildSearchOptions() {
        const families = pluginState ? pluginState.availableFonts : [];
        const inventory = pluginState ? pluginState.inventoryFonts : [];

        sourceOptions = inventory.map((font) => ({
          value: font.family,
          title: font.family,
          meta: ""
        }));

        targetOptions = families.map((font) => ({
          value: font.family,
          title: font.family,
          meta: font.styles.join("，")
        }));
      }

      function filterOptions(options, keyword) {
        const normalized = normalizeKeyword(keyword);
        if (!normalized) {
          return options;
        }

        return options.filter((item) => normalizeKeyword(item.value).includes(normalized));
      }

      function setDropdownState(config, isOpen) {
        config.dropdown.classList.toggle("hidden", !isOpen);
        config.select.classList.toggle("open", isOpen);
        config.trigger.setAttribute("aria-expanded", String(isOpen));
      }

      function hideDropdown(config) {
        setDropdownState(config, false);
      }

      function showDropdown(config) {
        setDropdownState(config, true);
      }

      function renderTriggerLabel(config) {
        const value = config.getValue().trim();
        config.label.textContent = value || config.placeholder;
        config.label.className = "select-trigger-label" + (value ? "" : " select-trigger-placeholder");
      }

      function renderSearchOptions(config) {
        const filtered = filterOptions(config.options, config.searchInput.value);
        config.panel.innerHTML = "";

        if (!filtered.length) {
          const empty = document.createElement("div");
          empty.className = "search-empty";
          empty.textContent = "No matching fonts";
          config.panel.appendChild(empty);
          return;
        }

        filtered.forEach((item) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "search-option" + (config.getValue().trim() === item.value ? " active" : "");
          button.innerHTML =
            '<span class="search-option-main">' +
            '<span class="search-option-title">' + escapeHtml(item.title) + "</span>" +
            (item.meta ? '<span class="search-option-meta">' + escapeHtml(item.meta) + "</span>" : "") +
            "</span>" +
            (config.getValue().trim() === item.value ? '<span class="search-check">✓</span>' : "");

          button.addEventListener("mousedown", (event) => {
            event.preventDefault();
            config.setValue(item.value);
            config.searchInput.value = "";
            renderSearchOptions(config);
            hideDropdown(config);
          });

          config.panel.appendChild(button);
        });
      }

      const sourceSearch = {
        select: document.getElementById("sourceSelect"),
        trigger: sourceFamilyEl,
        label: sourceFamilyLabelEl,
        searchInput: sourceSearchInputEl,
        dropdown: sourceDropdownEl,
        panel: sourceOptionsEl,
        placeholder: "e.g. Inter",
        getValue() {
          return sourceFamilyValue;
        },
        setValue(value) {
          sourceFamilyValue = value;
          renderTriggerLabel(this);
          updateReplaceButtonState();
        },
        get options() {
          return sourceOptions;
        }
      };

      const targetSearch = {
        select: document.getElementById("targetSelect"),
        trigger: targetFamilyEl,
        label: targetFamilyLabelEl,
        searchInput: targetSearchInputEl,
        dropdown: targetDropdownEl,
        panel: targetOptionsEl,
        placeholder: "e.g. PingFang SC",
        getValue() {
          return targetFamilyValue;
        },
        setValue(value) {
          targetFamilyValue = value;
          renderTriggerLabel(this);
          updateReplaceButtonState();
        },
        get options() {
          return targetOptions;
        }
      };

      function closeAllDropdowns() {
        hideDropdown(sourceSearch);
        hideDropdown(targetSearch);
      }

      function bindSearch(config) {
        config.trigger.addEventListener("click", () => {
          const willOpen = config.dropdown.classList.contains("hidden");
          closeAllDropdowns();
          if (willOpen) {
            renderSearchOptions(config);
            showDropdown(config);
            setTimeout(() => config.searchInput.focus(), 0);
          }
        });

        config.searchInput.addEventListener("focus", () => {
          renderSearchOptions(config);
          showDropdown(config);
        });

        config.searchInput.addEventListener("input", () => {
          renderSearchOptions(config);
          showDropdown(config);
        });

        config.searchInput.addEventListener("blur", () => {
          setTimeout(() => hideDropdown(config), 120);
        });
      }

      function findInventoryFamily(family) {
        return pluginState.inventoryFonts.find((item) => item.family === family) || null;
      }

      function renderFontList() {
        fontListEl.innerHTML = "";
        if (!pluginState || pluginState.inventoryFonts.length === 0) {
          const empty = document.createElement("div");
          empty.className = "font-item";
          empty.textContent = "No readable text nodes or fonts were found in the current frame selection.";
          fontListEl.appendChild(empty);
          return;
        }

        pluginState.inventoryFonts.forEach((font) => {
          const item = document.createElement("div");
          item.className = "font-item";
          const title = document.createElement("strong");
          title.textContent = font.family;
          item.appendChild(title);
          fontListEl.appendChild(item);
        });
      }

      function renderAll() {
        if (!pluginState) return;
        buildSearchOptions();
        renderFontList();

        const currentSourceFamily = sourceFamilyValue.trim();
        const currentTargetFamily = targetFamilyValue.trim();
        const sourceExists = pluginState.inventoryFonts.some((item) => item.family === currentSourceFamily);
        if ((!currentSourceFamily || !sourceExists) && pluginState.inventoryFonts.length > 0) {
          const nextSource = pluginState.inventoryFonts.find((item) => item.family !== currentTargetFamily);
          sourceFamilyValue = nextSource ? nextSource.family : pluginState.inventoryFonts[0].family;
        }
        if (!pluginState.inventoryFonts.length) {
          sourceFamilyValue = "";
        }

        const targetExists = pluginState.availableFonts.some((item) => item.family === targetFamilyValue.trim());
        if (!targetFamilyValue || !targetExists) {
          const defaultTarget = pluginState.availableFonts.find((item) => item.family === "PingFang SC");
          if (defaultTarget) {
            targetFamilyValue = defaultTarget.family;
          } else if (pluginState.availableFonts.length > 0) {
            targetFamilyValue = pluginState.availableFonts[0].family;
          } else {
            targetFamilyValue = "";
          }
        }

        renderTriggerLabel(sourceSearch);
        renderTriggerLabel(targetSearch);
        renderSearchOptions(sourceSearch);
        renderSearchOptions(targetSearch);
        updateReplaceButtonState();
      }

      function requestState() {
        setBusy(true);
        post({
          type: "get-state"
        });
      }

      function handleReplace() {
        const sourceFamily = sourceFamilyValue.trim();
        const targetFamily = targetFamilyValue.trim();
        if (!sourceFamily) {
          window.alert("Please select the source font family to replace.");
          return;
        }
        if (!targetFamily) {
          window.alert("Please select the target font family.");
          return;
        }

        const sourceMatch = findInventoryFamily(sourceFamily);
        if (!sourceMatch) {
          window.alert("The current frame selection does not contain that source font. Choose one from the font list or dropdown.");
          return;
        }

        const targetMatch = pluginState.availableFonts.find((item) => item.family === targetFamily);
        if (!targetMatch) {
          window.alert("The target font is not available. Choose one from the dropdown.");
          return;
        }

        setBusy(true);
        post({
          type: "replace-fonts",
          sourceFamily,
          targetFamily
        });
      }

      replaceButton.addEventListener("click", handleReplace);
      bindSearch(sourceSearch);
      bindSearch(targetSearch);

      document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element) || !target.closest(".search-select")) {
          closeAllDropdowns();
        }
      });

      window.onmessage = (event) => {
        if (!event || !event.data || typeof event.data !== "object" || !("pluginMessage" in event.data)) {
          return;
        }

        const message = event.data.pluginMessage;
        if (!message) return;

        if (message.type === "state-loaded") {
          pluginState = message.payload;
          setBusy(false);
          renderAll();
          return;
        }

        if (message.type === "replace-success") {
          setBusy(false);
          requestState();
          return;
        }

        if (message.type === "error") {
          setBusy(false);
        }
      };

      requestState();
    </script>
  </body>
</html>
`;
