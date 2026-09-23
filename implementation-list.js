// implementation.js

const { ExtensionCommon } =
  ChromeUtils.importESModule(
    "resource://gre/modules/ExtensionCommon.sys.mjs"
  );

const { ExtensionParent } =
  ChromeUtils.importESModule(
    "resource://gre/modules/ExtensionParent.sys.mjs"
  );

var bimiList =
  class extends ExtensionCommon.ExtensionAPI {

    getAPI(context) {

      return {

        bimiList: {

          async setThreadPaneBimiLogo(
            fromAddress,
            base64Logo
          ) {

            try {

              if (!globalThis.bimiThreadCache) {
                globalThis.bimiThreadCache =
                  new Map();
              }

              globalThis.bimiThreadCache.set(
                fromAddress.toLowerCase(),
                base64Logo
              );

              const recentWindow =
                ExtensionParent.apiManager
                  .global.windowTracker
                  .topWindow;

              if (!recentWindow) {
                console.log("[BIMI LIST]No mail window");
                return;
              }

              console.log("[BIMI LIST]THREAD WINDOW FOUND");

              const browser =
                recentWindow.document
                  .getElementById(
                    "mail3PaneTabBrowser1"
                  );

              if (!browser) {
                console.log(
                  "[BIMI LIST]mail3PaneTabBrowser1 not found"
                );
                return;
              }

              const doc =
                browser.contentDocument;

              if (!doc) {
                console.log(
                  "[BIMI LIST]contentDocument not found"
                );
                return;
              }

              if (
                !doc.getElementById(
                  "bimi-thread-style"
                )
              ) {

                const style =
                  doc.createElement(
                    "style"
                  );

                style.id =
                  "bimi-thread-style";

                style.textContent = `
                  .bimi-thread-icon {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    margin-right: 6px;
                    vertical-align: middle;
                    object-fit: contain;
                    background: white;
                    border: 1px solid #ccc;
                    flex-shrink: 0;
                  }
                `;

                doc.documentElement.appendChild(
                  style
                );
              }

              function extractEmailFromSender(
                sender
              ) {

                const title =
                  sender.getAttribute("title") ||
                  "";

                let match =
                  title.match(
                    /<([^>]+)>/
                  );

                if (match) {
                  return match[1]
                    .toLowerCase()
                    .trim();
                }

                match =
                  title.match(
                    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i
                  );

                if (match) {
                  return match[1]
                    .toLowerCase()
                    .trim();
                }

                return "";
              }

              function applyBimiToThread() {

                try {

                  const senders =
                    doc.querySelectorAll(
                      "span.sender"
                    );

                  for (const sender of senders) {

                    const email =
                      extractEmailFromSender(
                        sender
                      );

                    if (!email) {
                      continue;
                    }

                    const logo =
                      globalThis
                        .bimiThreadCache
                        .get(email);

                    if (!logo) {
                      continue;
                    }

                    const existing =
                      sender.querySelector(
                        ".bimi-thread-icon"
                      );

                    const src =
                      "data:image/svg+xml;base64," +
                      logo;

                    if (existing) {

                      if (existing.src !== src) {
                        existing.src = src;
                      }

                      continue;
                    }

                    const img =
                      doc.createElement(
                        "img"
                      );

                    img.className =
                      "bimi-thread-icon";

                    img.src = src;

                    sender.prepend(img);
                  }

                } catch (e) {

                  console.error(
                    "Thread BIMI error:",
                    e
                  );

                }
              }

              if (
                !doc.getElementById(
                  "bimi-thread-observer-active"
                )
              ) {

                const marker =
                  doc.createElement(
                    "div"
                  );

                marker.id =
                  "bimi-thread-observer-active";

                marker.style.display =
                  "none";

                doc.body.appendChild(
                  marker
                );

                let timer = null;

                const observer =
                  new recentWindow
                    .MutationObserver(
                      () => {

                        if (timer) {
                          recentWindow.clearTimeout(
                            timer
                          );
                        }

                        timer =
                          recentWindow.setTimeout(
                            () => {
                              applyBimiToThread();
                            },
                            100
                          );
                      }
                    );

                observer.observe(
                  doc.body,
                  {
                    childList: true,
                    subtree: true
                  }
                );
              }

              applyBimiToThread();

              console.log(
                "[BIMI LIST]Thread BIMI observer active"
              );

            } catch (e) {

              console.error(
                "Thread Pane Error:",
                e
              );

            }
          }
        }
      };
    }
  };