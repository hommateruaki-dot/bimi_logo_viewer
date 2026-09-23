var { ExtensionCommon } =
  ChromeUtils.importESModule(
    "resource://gre/modules/ExtensionCommon.sys.mjs"
  );

var Services =
  globalThis.Services;

function getMessageWindow(nativeTab) {

  //
  // 3ペイン
  //
  if (
    nativeTab.mode &&
    nativeTab.mode.name === "mail3PaneTab"
  ) {

    try {

      return nativeTab.chromeBrowser
        .contentWindow
        .messageBrowser
        .contentWindow;

    } catch (e) {

      console.log(
        "[BIMI_LOGO]mail3PaneTab access failed",
        e
      );

    }
  }

  //
  // 単独メッセージタブ
  //
  if (
    nativeTab.mode &&
    nativeTab.mode.name === "mailMessageTab"
  ) {

    try {

      return nativeTab.chromeBrowser
        .contentWindow;

    } catch (e) {

      console.log(
        "[BIMI_LOGO]mailMessageTab access failed",
        e
      );

    }
  }

  return null;
}

var bimiHeader =
  class extends ExtensionCommon.ExtensionAPI {

    getAPI(context) {

      return {

        bimiHeader: {

          async setBimiLogo(
            tabId,
            base64svg
          ) {

            try {

              //
              // tab取得
              //
              const tab =
                context.extension.tabManager
                  .get(tabId);

              if (!tab) {

                console.log(
                  "[BIMI_LOGO]tab not found"
                );

                return;
              }

              //
              // message window取得
              //
              const win =
                getMessageWindow(
                  tab.nativeTab
                );

              if (!win) {

                console.log(
                  "[BIMI_LOGO]message window not found"
                );

                return;
              }

              console.log(
                "[BIMI_LOGO]MESSAGE WINDOW FOUND"
              );

              const doc =
                win.document;

              //
              // avatar探索
              //
              let avatar =
                doc.querySelector(
                  ".recipient-avatar"
                );

              if (!avatar) {

                avatar =
                  doc.querySelector(
                    ".sender-avatar"
                  );
              }

              if (!avatar) {

                avatar =
                  doc.querySelector(
                    ".avatar"
                  );
              }

              //
              // expandedfromRow 内を探索
              //
              if (!avatar) {

                const fromRow =
                  doc.getElementById(
                    "expandedfromRow"
                  );

                if (fromRow) {

                  avatar =
                    fromRow.querySelector(
                      ".recipient-avatar"
                    );

                  if (!avatar) {

                    avatar =
                      fromRow.querySelector(
                        ".sender-avatar"
                      );
                  }

                  if (!avatar) {

                    avatar =
                      fromRow.querySelector(
                        ".avatar"
                      );
                  }

                  if (!avatar) {

                    avatar =
                      fromRow.querySelector(
                        "img"
                      );
                  }
                }
              }

              //
              // 最後のfallback
              //
              if (!avatar) {

                avatar =
                  doc.querySelector(
                    "img"
                  );
              }

              console.log(
                "[BIMI_LOGO]AVATAR:",
                avatar
              );

              if (!avatar) {

                console.log(
                  "[BIMI_LOGO]avatar not found"
                );

                return;
              }

              //
              // 元文字を非表示
              //
              avatar.textContent = "";

              avatar.style.color =
                "transparent";

              avatar.style.fontSize =
                "0px";

              avatar.style.lineHeight =
                "0px";

              avatar.style.textIndent =
                "-9999px";

              avatar.style.setProperty(
                "--avatar-text-color",
                "transparent"
              );

              //
              // background-imageでBIMI表示
              //
              avatar.style.backgroundImage =
                `url(data:image/svg+xml;base64,${base64svg})`;

              avatar.style.backgroundSize =
                "cover";

              avatar.style.backgroundRepeat =
                "no-repeat";

              avatar.style.backgroundPosition =
                "center";

              //
              // Thunderbird既存CSS維持
              //
              avatar.style.display =
                "";

              avatar.style.alignItems =
                "";

              avatar.style.justifyContent =
                "";

              avatar.style.padding =
                "";

              avatar.style.overflow =
                "";

              //
              // aria
              //
              avatar.setAttribute(
                "aria-label",
                "BIMI Logo"
              );

              console.log(
                "[BIMI_LOGO]BIMI logo applied as background-image"
              );

            } catch (e) {

              console.error(
                "Experiment error:",
                e
              );

            }
          }
        }
      };
    }
  };