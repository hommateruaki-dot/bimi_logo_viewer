# Thunderbird BIMI Logo Viewer

This add-on displays BIMI logos in Thunderbird message list & message headers.

This add-on uses the `BIMI-Indicator` email header to display sender logos in Thunderbird.

The logo is displayed in the sender avatar area of the message header.

---

# Features

- Display BIMI logos in Thunderbird message list & message headers
- Use SVG logos included in the `BIMI-Indicator` header
- Verify the `Authentication-Results` header
- Require `bimi=pass`
- Require `policy.authority=pass`
- Verify that `header.d=` matches the `From:` domain
- Support RFC5322 folded headers
- Provide a popup UI for BIMI information display
- Visualize BIMI authentication status

---

# Popup UI Features

Clicking the add-on icon displays BIMI information for the currently displayed email.

Displayed information:

- BIMI logo display
- Status
  - BIMI Indicator
  - Logo
- Message
  - Subject
  - From
- Authentication
  - Header From Domain
  - BIMI Status
  - BIMI policy.authority
  - BIMI header.d
  - DMARC Status
  - DMARC header.from
  - DKIM Status
  - DKIM header.d
  - DKIM header.i
  - SPF Status
  - SPF mailfrom
  - Domain match
- BIMI Indicator
  - Status
  - SVG
  
This helps diagnose why a BIMI logo is not displayed and visualize authentication status.

---

# Logo Display Conditions

The BIMI logo is displayed only when all of the following conditions are satisfied.

---

## 1. A BIMI-Indicator header exists

Example:

```text
BIMI-Indicator: base64 encoded SVG data...
```

---

## 2. Authentication-Results contains `bimi=pass`

Example:

```text
Authentication-Results:
    bimi=pass
```

---

## 3. Authentication-Results contains `policy.authority=pass`

Example:

```text
policy.authority=pass
```

---

## 4. header.d matches the From domain

The add-on verifies that:

```text
header.d=
```

and

```text
From:
```

the domain part of the `From:` address match.

Example:

```text
header.d=example.com
From: user@example.com
```

---
# Important Notes for List Display

This add-on is designed specifically for Thunderbird's message list / thread pane.

BIMI logos are displayed only for messages that have been processed by this add-on.

In the current implementation, BIMI information is collected when a message is displayed.
Therefore, messages that have not yet been selected or displayed may not immediately show BIMI logos in the list.

Logo matching depends on the sender address available in the Thunderbird message list UI.
If the sender address is not available in the list DOM, the logo may not be displayed even if BIMI information exists in the message headers.

---

# Security Notes

This add-on performs local verification checks based on received email headers.

Therefore, displayed logos should not be considered a complete security guarantee.

Improper logo display may occur in environments such as:

- Receiving mail servers do not remove forged `Authentication-Results`
- Forged `BIMI-Indicator` headers are preserved
- Mail services do not officially support BIMI
- Intermediate systems preserve invalid authentication headers
- Authentication results are not properly updated during forwarding

Because this add-on relies on headers already attached to received emails, reliability depends heavily on mail server implementation quality.

---

# Current Limitations

This add-on currently does NOT perform:

- Cryptographic VMC certificate validation
- BIMI DNS record lookup
- BIMI selector lookup
- SVG hash verification
- PEM certificate validation
- External BIMI record retrieval

This add-on relies on Authentication-Results headers added by the receiving mail server.

Authentication reliability therefore depends on the mail provider and receiving mail server implementation.

---

# Requirements

- Thunderbird 140+

---

# Installation

1. Open Thunderbird Add-ons Manager
2. Select "Debug Add-ons"
3. Load the folder containing `manifest.json` or load the `.xpi` file

---

# Example File Structure

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

# License

MIT License

---

# Third-Party Components

This add-on uses Thunderbird WebExtension APIs provided by Mozilla Thunderbird.

No external JavaScript libraries or third-party OSS frameworks are included.