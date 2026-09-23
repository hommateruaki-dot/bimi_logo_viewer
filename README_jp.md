````markdown
# Thunderbird BIMI Logo Viewer

Thunderbird のメール一覧 および メールヘッダ部分に BIMI ロゴを表示するアドオンです。  
This add-on displays BIMI logos in Thunderbird message list & message headers.

本アドオンは、メールヘッダ内の `BIMI-Indicator` 情報を利用して、送信者のロゴを Thunderbird 上に表示します。  
This add-on uses the `BIMI-Indicator` email header to display sender logos in Thunderbird.

ロゴは、メールヘッダの送信者アバター部分に表示されます。  
The logo is displayed in the sender avatar area of the message header.

---

# 主な機能 / Features

- Thunderbird のメールリスト および　メールヘッダに BIMI ロゴを表示  
  Display BIMI logos in Thunderbird message list & message headers

- `BIMI-Indicator` ヘッダに含まれる SVG ロゴを利用  
  Use SVG logos included in the `BIMI-Indicator` header

- `Authentication-Results` ヘッダを確認  
  Verify the `Authentication-Results` header

- `bimi=pass` を必須条件として確認  
  Require `bimi=pass`

- `policy.authority=pass` を必須条件として確認  
  Require `policy.authority=pass`

- `header.d=` と `From:` アドレスのドメイン一致確認  
  Verify that `header.d=` matches the `From:` domain

- RFC5322 folding header に対応  
  Support RFC5322 folded headers

- Thunderbird popup UI による BIMI 情報表示  
  Provide a popup UI for BIMI information display

- BIMI 状態や認証状態の可視化  
  Visualize BIMI authentication status

---

# Popup UI 機能 / Popup UI Features

アドオンアイコンをクリックすると、現在表示中メールの BIMI 情報を確認できます。  
Clicking the add-on icon displays BIMI information for the currently displayed email.

表示内容 / Displayed information:

ブランドロゴ /  BIMI logo display

ステータス / Status
  BIMI Indicator有無 / BIMI Indicator
  ブランドロゴ情報有無 / Logo
メッセージ情報 / Message
  タイトル / Subject
  送信者アドレス / From
送信ドメイン認証結果 / Authentication
  ヘッダFromドメイン / Header From Domain
  BIMI認証結果 / BIMI Status
  BIMI 証明書認証結果 / BIMI policy.authority
  BIMI header.d / BIMI header.d
  DMARC認証結果 / DMARC Status
  DMARC header.from / DMARC header.from
  DKIM認証結果 / DKIM Status
  DKIM header.d / DKIM header.d
  DKIM header.i / DKIM header.i
  SPF認証結果  / SPF Status
  SPF MailFromドメイン / SPF mailfrom
　ドメイン一致有無 / Domain match
BIMI Indicator情報 / BIMI Indicator
  ステータス / Status
  SVG取得 / SVG

これにより、BIMI が表示されない理由や認証状態を簡単に確認できます。  
This helps diagnose why a BIMI logo is not displayed and visualize authentication status.

---

# ロゴ表示条件 / Logo Display Conditions

本アドオンでは、以下すべての条件を満たした場合のみロゴを表示します。  
The BIMI logo is displayed only when all of the following conditions are satisfied.

---

## 1. BIMI-Indicator ヘッダが存在すること  
## 1. A BIMI-Indicator header exists

例 / Example:

```text
BIMI-Indicator: base64 encoded SVG data...
```

---

## 2. Authentication-Results に `bimi=pass` が含まれること  
## 2. Authentication-Results contains `bimi=pass`

例 / Example:

```text
Authentication-Results:
    bimi=pass
```

---

## 3. Authentication-Results に `policy.authority=pass` が含まれること  
## 3. Authentication-Results contains `policy.authority=pass`

例 / Example:

```text
policy.authority=pass
```

---

## 4. header.d と From ドメインが一致すること  
## 4. header.d matches the From domain

以下を確認しています。  
The add-on verifies that:

```text
header.d=
```

と / and

```text
From:
```

のメールアドレスドメインが一致すること。  
the domain part of the `From:` address match.

例 / Example:

```text
header.d=example.com
From: user@example.com
```

---

# Important Notes for List Display

# 一覧表示に関する重要事項

This add-on is designed specifically for Thunderbird's message list / thread pane.  
このアドオンは Thunderbird のメール一覧（スレッドペイン）専用に設計されています。

BIMI logos are displayed only for messages that have been processed by this add-on.  
BIMI ロゴは、このアドオンで処理済みのメールに対してのみ表示されます。

In the current implementation, BIMI information is collected when a message is displayed.  
現在の実装では、メール表示時に BIMI 情報を取得しています。

Therefore, messages that have not yet been selected or displayed may not immediately show BIMI logos in the list.  
そのため、まだ選択・表示されていないメールでは、一覧に BIMI ロゴが表示されない場合があります。

Logo matching depends on the sender address available in the Thunderbird message list UI.  
ロゴ照合は Thunderbird の一覧 UI 上で取得可能な送信者アドレスに依存します。

If the sender address is not available in the list DOM, the logo may not be displayed even if BIMI information exists in the message headers.  
一覧 DOM 上で送信者アドレスが取得できない場合、メールヘッダに BIMI 情報が存在していてもロゴが表示されない場合があります。


---

# セキュリティ上の注意事項 / Security Notes

本アドオンは、受信済みメールヘッダに含まれる情報をもとにローカル判定を行っています。  
This add-on performs local verification checks based on received email headers.

そのため、ロゴ表示は完全な安全性を保証するものではありません。  
Therefore, displayed logos should not be considered a complete security guarantee.

以下のような環境では、不正なロゴが表示される可能性があります。  
Improper logo display may occur in environments such as:

- 受信メールサーバが偽装された `Authentication-Results` を除去していない場合  
  Receiving mail servers do not remove forged `Authentication-Results`

- 偽装された `BIMI-Indicator` を除去していない場合  
  Forged `BIMI-Indicator` headers are preserved

- BIMI 非対応のメールサービスである場合  
  Mail services do not officially support BIMI

- 中継サーバが不正な認証ヘッダを保持してしまう場合  
  Intermediate systems preserve invalid authentication headers

- メールゲートウェイや転送環境で認証結果が適切に更新されていない場合  
  Authentication results are not properly updated during forwarding

本アドオンは、受信時点でメールに付与されているヘッダ情報をそのまま利用しているため、メールサーバ側の実装品質に依存します。  
Because this add-on relies on headers already attached to received emails, reliability depends heavily on mail server implementation quality.

---

# 現在の制限事項 / Current Limitations

本アドオンは現在以下を実施していません。  
This add-on currently does NOT perform:

- VMC 証明書の暗号学的検証  
  Cryptographic VMC certificate validation

- BIMI DNS レコード取得  
  BIMI DNS record lookup

- BIMI セレクタ取得  
  BIMI selector lookup

- SVG ハッシュ検証  
  SVG hash verification

- PEM 証明書検証  
  PEM certificate validation

- 外部 BIMI レコード問い合わせ  
  External BIMI record retrieval

そのため、認証の信頼性はメールサービス側の実装に依存します。  
Authentication reliability therefore depends on the mail provider implementation.

---

# 推奨環境 / Requirements

- Thunderbird 140+

---

# インストール方法 / Installation

1. Thunderbird のアドオンマネージャを開く  
   Open Thunderbird Add-ons Manager

2. 「アドオンをデバッグ」を選択  
   Select "Debug Add-ons"

3. `manifest.json` を含むフォルダ、または `.xpi` を読み込む  
   Load the folder containing `manifest.json` or load the `.xpi` file

---

# ファイル構成例 / Example File Structure

```text
addon/
 ├ manifest.json
 ├ background.js
 ├ implementation-header.js
 ├ implementation-list.js
 ├ schema-header.json
 ├ schema-list.json
 ├ popup/
 │   ├ popup.html
 │   └ popup.js
 ├ icons/
 │   ├ icon-32.png
 │   ├ icon-64.png
 │   └ icon-128.png
 ├ LICENSE
 ├ README.md
 └ CHANGELOG.md
```

---

# ライセンス / License

MIT License

---

# サードパーティコンポーネント / Third-Party Components

本アドオンは Mozilla Thunderbird が提供する WebExtension API を利用しています。  
This add-on uses Thunderbird WebExtension APIs provided by Mozilla Thunderbird.

外部 JavaScript ライブラリや第三者 OSS フレームワークは含まれていません。  
No external JavaScript libraries or third-party OSS frameworks are included.
````
