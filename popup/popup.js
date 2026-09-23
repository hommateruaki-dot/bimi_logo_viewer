function setText(id, value, cls = "") {

  const el =
    document.getElementById(id);

  if (!el) {
    return;
  }

  el.textContent =
    value || "-";

  el.className =
    "v " + cls;
}

function decodeMimeWord(str) {

  return str.replace(
    /=\?([^?]+)\?([BQbq])\?([^?]*)\?=/g,
    (match, charset, encoding, text) => {

      try {

        if (
          encoding.toUpperCase() === "B"
        ) {

          const binary =
            atob(text);

          const bytes =
            Uint8Array.from(
              binary,
              c => c.charCodeAt(0)
            );

          return new TextDecoder(
            charset
          ).decode(bytes);
        }

        if (
          encoding.toUpperCase() === "Q"
        ) {

          text =
            text
              .replace(/_/g, " ")
              .replace(
                /=([A-F0-9]{2})/gi,
                (_, hex) =>
                  String.fromCharCode(
                    parseInt(hex, 16)
                  )
              );

          const bytes =
            Uint8Array.from(
              text,
              c => c.charCodeAt(0)
            );

          return new TextDecoder(
            charset
          ).decode(bytes);
        }

      } catch (e) {

        console.error(
          "Decode error:",
          e
        );
      }

      return match;
    }
  );
}

(async () => {

  const loading =
    document.getElementById(
      "loading"
    );

  const content =
    document.getElementById(
      "content"
    );

  const errorBox =
    document.getElementById(
      "error"
    );

  function showError(message) {

    if (loading) {
      loading.hidden = true;
    }

    if (content) {
      content.hidden = true;
    }

    if (errorBox) {

      errorBox.textContent =
        message;

      errorBox.hidden =
        false;
    }
  }

  try {

    const tabs =
      await browser.mailTabs.query({
        active: true,
        currentWindow: true
      });

    if (!tabs.length) {
      showError("No active mail tab.");
      return;
    }

    const tab =
      tabs[0];

    const message =
      await browser.messageDisplay
        .getDisplayedMessage(
          tab.id
        );

    if (!message) {
      showError("No displayed message.");
      return;
    }

    const raw =
      await browser.messages.getRaw(
        message.id
      );

    if (!raw) {
      showError("Could not read message.");
      return;
    }

    //
    // Subject
    //
    const subjectMatch =
      raw.match(
        /^Subject:\s*([\s\S]*?)(?:\r?\n[A-Za-z\-]+:|\r?\n\r?\n)/mi
      );

    const subject =
      subjectMatch
        ? decodeMimeWord(
          subjectMatch[1]
            .replace(/\r?\n\s+/g, " ")
            .trim()
        )
        : "-";

    //
    // From
    //
    const fromMatch =
      raw.match(
        /^From:\s*([\s\S]*?)(?:\r?\n[A-Za-z\-]+:|\r?\n\r?\n)/mi
      );

    const fromHeader =
      fromMatch
        ? decodeMimeWord(
          fromMatch[1]
            .replace(/\r?\n\s+/g, " ")
            .trim()
        )
        : "-";

    const emailMatch =
      fromHeader.match(
        /<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i
      );

    const fromAddress =
      emailMatch
        ? emailMatch[1].toLowerCase()
        : "";

    const fromDomain =
      fromAddress.includes("@")
        ? fromAddress.split("@")[1]
        : "-";

    //
    // Authentication-Results
    //
    const authMatch =
      raw.match(
        /^Authentication-Results:[\s\S]*?(?:\r?\n\r?\n)/mi
      );

    const auth =
      authMatch
        ? authMatch[0]
        : "";

    //
    // BIMI
    //
    const bimiSectionMatch =
      auth.match(
        /bimi=.*?(?=;\s*(?:dmarc|dkim|spf|arc|sender-id)=|$)/is
      );

    const bimiSection =
      bimiSectionMatch
        ? bimiSectionMatch[0]
        : "";

    const bimiPass =
      /bimi=pass/i.test(bimiSection);

    const authorityPass =
      /policy\.authority=pass/i.test(bimiSection);

    const bimiHeaderDMatch =
      bimiSection.match(
        /header\.d\s*=\s*([^\s;]+)/i
      );

    const bimiHeaderD =
      bimiHeaderDMatch
        ? bimiHeaderDMatch[1].toLowerCase()
        : "-";


    function isSameOrSubDomain(
      childDomain,
      parentDomain
    ) {

      if (
        !childDomain ||
        !parentDomain ||
        childDomain === "-" ||
        parentDomain === "-"
      ) {
        return false;
      }

      childDomain =
        childDomain.toLowerCase();

      parentDomain =
        parentDomain.toLowerCase();

      return (
        childDomain === parentDomain ||
        childDomain.endsWith(
          "." + parentDomain
        )
      );
    }



    const domainMatch =
      isSameOrSubDomain(
        fromDomain,
        bimiHeaderD
      );

    //
    // DMARC
    //
    const dmarcPass =
      /dmarc=pass/i.test(auth);

    const dmarcSectionMatch =
      auth.match(
        /dmarc=.*?(?=;\s*(?:dkim|spf|arc|sender-id|bimi)=|$)/is
      );

    const dmarcSection =
      dmarcSectionMatch
        ? dmarcSectionMatch[0]
        : "";

    const headerFromMatch =
      dmarcSection.match(
        /header\.from\s*=\s*([^\s;]+)/i
      );

    const headerFrom =
      headerFromMatch
        ? headerFromMatch[1]
          .toLowerCase()
        : "-";

    //
    // DKIM
    //
    const dkimSectionMatch =
      auth.match(
        /dkim=.*?(?=;\s*(?:dmarc|spf|arc|sender-id|bimi)=|$)/is
      );

    const dkimSection =
      dkimSectionMatch
        ? dkimSectionMatch[0]
        : "";

    const dkimPass =
      /dkim=pass/i.test(dkimSection);

    const dkimHeaderDMatch =
      dkimSection.match(
        /header\.d\s*=\s*([^\s;]+)/i
      );

    const dkimHeaderD =
      dkimHeaderDMatch
        ? dkimHeaderDMatch[1].toLowerCase()
        : "-";

    const headerIMatch =
      dkimSection.match(
        /header\.i\s*=\s*("?[^"\s;]+"?)/i
      );

    const headerI =
      headerIMatch
        ? headerIMatch[1]
          .replace(/^"|"$/g, "")
          .toLowerCase()
        : "-";

    //
    // SPF
    //
    const spfPass =
      /spf=pass/i.test(auth);


    const mailFromMatch =
      auth.match(
        /smtp\.mailfrom=([^\s;]+)/i
      );

    const mailFrom =
      mailFromMatch
        ? mailFromMatch[1]
          .toLowerCase()
        : "-";

    //
    // BIMI-Indicator
    //
    const bimiMatch =
      raw.match(
        /^BIMI-Indicator:\s*([\s\S]*?)(?:\r?\n[A-Za-z\-]+:|\r?\n\r?\n)/mi
      );

    let base64Data =
      "";

    let svgValid =
      false;

    if (bimiMatch) {

      base64Data =
        bimiMatch[1]
          .replace(/\r?\n/g, "")
          .replace(/\s+/g, "");

      try {

        const svgText =
          atob(base64Data);

        svgValid =
          svgText.includes("<svg");

      } catch (e) {

        svgValid =
          false;
      }
    }

    //
    // Text display
    //
    setText(
      "subject",
      subject
    );

    setText(
      "from",
      fromHeader,
      "mono"
    );

    setText("bimi-headerd", bimiHeaderD, "mono");

    setText("dkim-headerd", dkimHeaderD, "mono");

    setText(
      "headeri",
      headerI,
      "mono"
    );

    setText(
      "headerfrom",
      headerFrom,
      "mono"
    );

    setText(
      "mailfrom",
      mailFrom,
      "mono"
    );

    setText(
      "from-domain",
      fromDomain,
      "mono"
    );

    setText(
      "bimi",
      bimiPass ? "PASS" : "FAIL",
      bimiPass ? "ok" : "bad"
    );

    setText(
      "authority",
      authorityPass ? "PASS" : "FAIL",
      authorityPass ? "ok" : "bad"
    );

    setText(
      "dmarc",
      dmarcPass ? "PASS" : "FAIL",
      dmarcPass ? "ok" : "bad"
    );

    setText(
      "dkim",
      dkimPass ? "PASS" : "FAIL",
      dkimPass ? "ok" : "bad"
    );

    setText(
      "spf",
      spfPass ? "PASS" : "FAIL",
      spfPass ? "ok" : "bad"
    );

    setText(
      "domain-match",
      domainMatch ? "PASS" : "FAIL",
      domainMatch ? "ok" : "bad"
    );

    setText(
      "status",
      bimiMatch ? "BIMI detected" : "No BIMI",
      bimiMatch ? "ok" : "warn"
    );

    setText(
      "svg-status",
      svgValid ? "Valid SVG" : "Invalid or missing",
      svgValid ? "ok" : "bad"
    );

    setText(
      "logo-status",
      svgValid ? "Available" : "Not available",
      svgValid ? "ok" : "bad"
    );

    setText(
      "bimi-size",
      base64Data
        ? String(base64Data.length) + " bytes"
        : "-"
    );

    //
    // Logo display
    //
    const logoEl =
      document.getElementById(
        "logo"
      );

    if (logoEl) {

      if (svgValid) {

        logoEl.src =
          "data:image/svg+xml;charset=utf-8;base64," +
          base64Data;

        logoEl.style.display =
          "block";

        logoEl.hidden =
          false;

      } else {

        logoEl.removeAttribute(
          "src"
        );

        logoEl.style.display =
          "none";
      }

      console.log(
        "logo src length:",
        logoEl.src.length
      );

      console.log(
        "logo hidden:",
        logoEl.hidden
      );

      console.log(
        "logo display:",
        logoEl.style.display
      );
    }

    if (loading) {
      loading.hidden = true;
    }

    if (content) {
      content.hidden = false;
    }

  } catch (e) {

    console.error(e);

    showError(
      e.message || String(e)
    );
  }

})();