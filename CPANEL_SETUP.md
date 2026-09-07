# ELSMITH cPanel Setup

The repository now contains a mobile-first booking scheduler, a functional Contact form, and server-side PHP endpoints. The frontend never contains SMTP credentials. Before publishing, complete the following server configuration in cPanel.

## 1. Upload the project

Upload the website files to the cPanel document root, including `api/`, `booking_ui.js`, `booking_ui.css`, `site_responsive.css`, `.htaccess`, and the existing compiled assets. PHP must be enabled for the account.

## 2. Create the private PHP configuration

Copy `api/config.example.php` to `api/config.php` on the server only. Do not commit `api/config.php` to GitHub. Set the values as follows:

| Setting | Production value |
|---|---|
| `smtp_host` | `mail.elsmithconsulting.com` |
| `smtp_port` | `465` |
| `smtp_username` | `info@elsmithconsulting.com` |
| `smtp_password` | The private password for the mailbox, entered only in cPanel/server storage |
| `from_email` | `info@elsmithconsulting.com` |
| `from_name` | `ELSMITH Consulting Website` |
| `notification_email` | `info@elsmithconsulting.com` |
| `timezone` | `Africa/Lagos` |
| `app_secret` | A long, random, private value generated for this installation |

The SMTP connection uses authenticated SSL/TLS on port 465. The notification recipient is the ELSMITH mailbox, and visitor email addresses are used as `Reply-To` values.

## 3. Prepare private booking storage

Create a `storage` directory in the project root on the server with permissions that allow the PHP process to write to it. The application creates `bookings.json` and rate-limit files there. The root `.htaccess` denies direct web access to `/storage/`; do not remove that rule.

## 4. Verify the public endpoints

After configuration, confirm that the following endpoints respond over HTTPS:

| Endpoint | Purpose |
|---|---|
| `/api/csrf.php` | Creates a session-bound CSRF token |
| `/api/availability.php` | Returns configurable available dates and times |
| `/api/availability.php?date=YYYY-MM-DD` | Returns available slots for one date |
| `/api/contact.php` | Receives and emails Contact form enquiries |
| `/api/booking.php` | Validates, stores, and emails booking requests |

The availability defaults are Monday through Friday, 9:00 AM to 5:00 PM WAT, 60-minute appointments, and a 15-minute buffer. Blocked dates can be added in `config.php` as an optional `blocked_dates` array using `YYYY-MM-DD` values.

## 5. Security requirements

Use HTTPS for the live site. Keep `api/config.php` outside version control, restrict its permissions, and never paste its contents into frontend files. The endpoints include server-side required-field and email validation, CSRF validation, a honeypot field, basic IP-based rate limiting, server-side availability checks, duplicate-slot protection, sanitized email headers, and generic public error messages.

## 6. Frontend behavior

The scheduler is full-screen or comfortably scrollable on small screens and becomes a centered dialog on larger screens. It includes date, time, details, review, loading, success, error, Escape-key, focus, and close states. The full website includes a responsive navigation drawer, fluid typography, mobile-first section spacing, single-column mobile grids, responsive forms, accessible focus states, reduced-motion support, and tablet/desktop refinements.
