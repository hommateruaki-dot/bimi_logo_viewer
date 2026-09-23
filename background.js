browser.messageDisplay.onMessageDisplayed.addListener(
  async (tab, message) => {

    try {

      const raw =
        await browser.messages.getRaw(
          message.id
        );

      if (!raw) {
        return;
      }

      //
      // Authentication-Results取得
      //
      const authResultsMatch =
        raw.match(
          /^Authentication-Results:[\s\S]*?(?:\r?\n\r?\n)/mi
        );

      if (!authResultsMatch) {

        console.log(
          "[BIMI LOGO]Authentication-Results not found."
        );

        return;
      }

      const authResults =
        authResultsMatch[0];

      console.log(
        "[BIMI LOGO]Authentication-Results found."
      );

      //
      // bimi=pass 必須
      //
      if (
        !/bimi=pass/i.test(
          authResults
        )
      ) {

        console.log(
          "[BIMI LOGO]bimi=pass not found."
        );

        return;
      }

      //
      // policy.authority=pass 必須
      //
      if (
        !/policy\.authority=pass/i.test(
          authResults
        )
      ) {

        console.log(
          "[BIMI LOGO]policy.authority=pass not found."
        );

        return;
      }

      console.log(
        "[BIMI LOGO]BIMI authentication passed."
      );

      //
      // header.d 取得
      //
      const headerDMatch =
        authResults.match(
          /header\.d=([^\s;]+)/i
        );

      if (!headerDMatch) {

        console.log(
          "[BIMI LOGO]header.d not found."
        );

        return;
      }

      const headerD =
        headerDMatch[1]
          .toLowerCase()
          .trim();

      console.log(
        "[BIMI LOGO]header.d:",
        headerD
      );

      //
      // From取得（folding対応）
      //
      const fromMatch =
        raw.match(
          /^From:\s*([\s\S]*?)(?:\r?\n[A-Za-z\-]+:|\r?\n\r?\n)/mi
        );

      if (!fromMatch) {

        console.log(
          "[BIMI LOGO]From header not found."
        );

        return;
      }

      let fromHeader =
        fromMatch[1];

      //
      // folding解除
      //
      fromHeader =
        fromHeader.replace(
          /\r?\n\s+/g,
          " "
        );

      fromHeader =
        fromHeader.trim();

      console.log(
        "[BIMI LOGO]From:",
        fromHeader
      );

      //
      // メールアドレス抽出
      //
      const emailMatch =
        fromHeader.match(
          /<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i
        );

      if (!emailMatch) {

        console.log(
          "[BIMI LOGO]From address not found."
        );

        return;
      }

      const fromAddress =
        emailMatch[1]
          .toLowerCase()
          .trim();

      console.log(
        "[BIMI LOGO]From address:",
        fromAddress
      );

      //
      // Fromドメイン取得
      //
      const fromDomain =
        fromAddress.split("@")[1];

      if (!fromDomain) {

        console.log(
          "[BIMI LOGO]From domain not found."
        );

        return;
      }

      console.log(
        "[BIMI LOGO]From domain:",
        fromDomain
      );

      //
      // ドメイン一致確認
      //
      if (
        fromDomain !== headerD
      ) {

        console.log(
          "[BIMI LOGO]Domain mismatch:",
          fromDomain,
          headerD
        );

        return;
      }

      console.log(
        "[BIMI LOGO]Domain match passed."
      );

      //
      // BIMI-Indicator取得
      //
      const match = raw.match(
        /^BIMI-Indicator:\s*([\s\S]*?)(?:\r?\n[A-Za-z\-]+:|\r?\n\r?\n)/mi
      );

      if (!match) {

        console.log(
          "[BIMI LOGO]BIMI-Indicator not found."
        );

        return;
      }

      let base64Data =
        match[1];

      //
      // folding除去
      //
      base64Data =
        base64Data.replace(
          /\r?\n/g,
          ""
        );

      base64Data =
        base64Data.replace(
          /\s+/g,
          ""
        );

      console.log(
        "[BIMI LOGO]BIMI length:",
        base64Data.length
      );

      //
      // SVG確認
      //
      let svgText = "";

      try {

        svgText =
          atob(base64Data);

      } catch (e) {

        console.log(
          "[BIMI LOGO]Base64 decode failed."
        );

        return;
      }

      if (
        !svgText.includes("<svg")
      ) {

        console.log(
          "[BIMI LOGO]Not SVG."
        );

        return;
      }

      console.log(
        "[BIMI LOGO]SVG detected."
      );

      //
      // 詳細ヘッダ表示
      //
      await browser.bimiHeader.setBimiLogo(
        tab.id,
        base64Data
      );


      //
      // 一覧表示
      //
      await browser.bimiList.setThreadPaneBimiLogo(
        fromAddress,
        base64Data
      );

      console.log(
        "[BIMI LOGO]BIMI logo display completed."
      );

    } catch (e) {

      console.error(
        "BIMI processing error:",
        e
      );

    }

  }
);