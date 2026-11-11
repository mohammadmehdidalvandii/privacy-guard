# Privacy Guard

**Privacy Guard** is a Chrome extension that helps you monitor browser privacy, detect potential network leaks, and manage built-in Chrome protection settings.

It provides privacy analysis tools and protection controls through a simple popup interface.

## Features

### VPN Monitoring
- Monitor your public IP address.
- View network information, including country, city, ISP, ASN, and timezone.
- Detect unexpected public IP changes.
- Identify potential VPN usage based on network information.

### WebRTC Leak Analysis
- Analyze WebRTC behavior.
- Detect potential local and public IP address leaks.
- Review WebRTC-related privacy information.

### DNS Leak Test
- Run DNS leak tests.
- Identify DNS servers visible during network requests.
- Review DNS-related privacy information.

### Browser Fingerprinting
- Analyze browser characteristics that may contribute to browser fingerprinting.
- Review collected fingerprint information.

### Geolocation Analysis
- Analyze browser geolocation behavior.
- Review location-related privacy information.

### Timezone Consistency Analysis
- Compare the browser's timezone with the timezone associated with the public IP address.
- Detect potential timezone mismatches.

### Protection Controls
Manage supported Chrome privacy settings:

- WebRTC IP handling policy.
- Third-party cookies.
- Geolocation access.

### Protection Profiles
Apply predefined protection configurations:

- Basic
- Advanced
- Custom Location
- Strict

### Global Switch
Temporarily pause Privacy Guard's internal operations.

When disabled:
- Background monitoring and privacy scans are paused.
- Extension-managed Chrome protection overrides are cleared.
- The extension popup remains accessible.

When enabled again, previously saved protection settings are restored.

> The Global Switch pauses Privacy Guard's functionality; it does not disable or uninstall the Chrome extension itself.

### Built-in Guide
Access an integrated guide explaining the extension's features and protection controls.

## Tech Stack

- **Platform:** Chrome Extension Manifest V3
- **Frontend:** React 19, TypeScript 6
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS v4
- **UI:** Base UI and shadcn-style components
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Validation:** Zod
- **Forms:** React Hook Form
- **Icons:** Lucide React

## Requirements

Before installing or developing Privacy Guard, make sure you have:

- Google Chrome
- Node.js
- npm

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd privacy-guard
```

If you already have the project locally, skip this step.

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Extension

```bash
npm run build
```

Vite generates the production-ready extension files inside the `dist` directory.

### 4. Open Chrome Extensions

Open Google Chrome and navigate to:

```text
chrome://extensions
```

### 5. Enable Developer Mode

Enable **Developer mode** using the toggle in the top-right corner of the Extensions page.

### 6. Load the Extension

1. Click **Load unpacked**.
2. Navigate to your project directory.
3. Select the `dist` folder.
4. Chrome will load Privacy Guard as an unpacked extension.

### 7. Pin Privacy Guard

Click the Extensions icon in Chrome's toolbar and pin Privacy Guard for easier access.

The extension is now ready to use.

## Development

### Start the Development Server

```bash
npm run dev
```

This starts the Vite development server for frontend development.

> The Vite development server does not install or run the Chrome extension. To test the extension in Chrome, build the project and load the `dist` directory.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Preview

```bash
npm run preview
```

## Updating the Extension

Whenever you make changes to the source code:

1. Run the production build:

   ```bash
   npm run build
   ```

2. Open `chrome://extensions`.
3. Find Privacy Guard.
4. Click the **Reload** button.

Chrome will load the updated files from the `dist` directory.

## Permissions

Privacy Guard requests the following Chrome permissions:

| Permission | Purpose |
|---|---|
| `storage` | Store extension settings and protection preferences. |
| `alarms` | Schedule periodic VPN monitoring. |
| `privacy` | Read and manage supported Chrome privacy settings. |
| `activeTab` | Access the active tab when required by extension functionality. |
| `scripting` | Support browser scripting functionality. |
| `contentSettings` | Manage supported website content settings, including geolocation. |

### Host Permissions

The extension also uses access to the following services:

| Host | Purpose |
|---|---|
| `api.ipify.org` | Retrieve the public IP address. |
| `ipapi.co` | Retrieve IP-based network and location information. |
| `dnsleak.dev` | Support DNS leak testing. |
| `*.t.dnsleak.dev` | Support DNS leak test requests. |

## Privacy & Limitations

- IP-based location and network information may be approximate or inaccurate.
- Timezone analysis detects inconsistencies; it does not change or spoof the operating system or browser timezone.
- Browser fingerprinting analysis identifies relevant browser characteristics but does not eliminate fingerprinting.
- Protection controls manage supported Chrome settings and do not guarantee complete protection against every privacy or network leak.
- VPN detection is based on available network indicators and cannot guarantee that a VPN is active or correctly configured.
- Privacy Guard is a privacy monitoring and protection utility, not a complete anonymity solution.

## License

No license has been specified yet.