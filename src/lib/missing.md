# Missing Features & Future Improvements

This document lists key features and technical improvements that are currently missing from the project. It can serve as a roadmap for future development.

## Critical Pre-Production Requirements

1.  **Full Database Integration:** The application currently runs on a mock, file-based database system which is **not suitable for production**. It is insecure, does not scale, and can lead to data loss. This is the most critical issue to address before the application goes live. Before deploying, you must migrate to a robust database like PostgreSQL, MySQL, or MongoDB by rewriting the data access layer in `src/lib/server/api.ts` and `src/lib/server/db.ts`.

## Admin & Operational Features

2.  **Enforced User Roles:** The "Roles & Permissions" page allows for configuration, but the permissions set for roles like "Moderator" or "Designer" are not actually enforced throughout the admin panel. Currently, only the "admin" role has special access via middleware.

## Technical & Infrastructure

3.  **Transactional Emails:** The system sends order confirmation and admin password reset emails. However, it still lacks other crucial notifications like shipping updates or customer-facing account alerts (e.g., OTP via email as a fallback).
4.  **Transactional WhatsApp Messages:** The project has a WhatsApp chat widget but lacks a system for sending transactional WhatsApp messages for order confirmations or shipping updates.
5.  **Robust Image Handling:** While images are used via a local upload system, there is no system for automatic optimization, resizing, or serving images from a dedicated Content Delivery Network (CDN) for faster load times.
