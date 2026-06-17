# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately by emailing
[daniel@curran.io](mailto:daniel@curran.io).

**Do not open a public issue —** please give us time to address it before
disclosure.

You should receive a response within 48 hours. If you don't, follow up to
ensure we received your message.

## Scope

This tool fetches and processes content from GameFAQs URLs. It does not make
network requests to any other service. Security-relevant issues include:

- Command injection via crafted URLs or CLI arguments
- Path traversal via output file paths
- Malicious content injection in generated markdown

## Supported Versions

Only the latest release on the `main` branch receives security patches.
