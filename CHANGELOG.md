```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog:
https://keepachangelog.com/en/1.1.0/

---

## [1.0.0] - 2026-05-15

### Added

- Initial release
- Display BIMI logos in Thunderbird message headers
- Support for `BIMI-Indicator` SVG logos
- Verification of `Authentication-Results`
- Require `bimi=pass`
- Require `policy.authority=pass`
- Verification that `header.d=` matches the `From:` domain
- RFC5322 folded header support
- Thunderbird 128 compatibility
- Custom Thunderbird WebExtension experiment API
- Sender avatar replacement with BIMI logo display

### Security

- Added validation checks before displaying BIMI logos
- Added domain consistency verification between `header.d=` and `From:`
- Added protections against incomplete BIMI authentication conditions

### Notes

- This add-on relies on authentication results provided by the receiving mail server
- Independent VMC/DNS cryptographic verification is not implemented
```
