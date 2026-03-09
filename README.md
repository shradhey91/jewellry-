# Aparra - Next.js E-Commerce Platform

Welcome to the Aparra project, a modern, feature-rich e-commerce platform built with Next.js and a powerful stack of modern technologies. This document serves as a comprehensive guide for developers to understand, run, and contribute to the project.

> **⚠️ IMPORTANT: DATABASE STATUS ⚠️**
>
> This application currently runs on a **local, file-based database system** located in `src/lib/server/data/`. This system is intended for **local development and prototyping only**.
>
> **It is NOT suitable for a production environment.** It is insecure, does not scale, and can lead to data loss.
>
> Before deploying this application to the public, you **must** migrate to a robust database like PostgreSQL, MySQL, or MongoDB.

## 1. Tech Stack

This project is built with a specific, modern technology stack.

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit)
-   **Database**: Local file-based system (for development)
-   **Payment Gateway**: Razorpay & Cashfree

---

## 2. Project Structure

The codebase is organized to separate concerns and improve maintainability. Here's an overview of the key directories:

-   **/src/app/**: The core of the Next.js application, containing all routes and pages.
-   **/src/components/**: Reusable React components.
-   **/src/lib/server/**: Server-only code, including the database API (`db.ts`), application logic API (`api.ts`), and server actions.
-   **/src/ai/**: All Genkit-related code.
-   **/src/auth/**: Authentication-related components, hooks, and server actions.
-   **/scripts/**: Utility scripts for data management.

---

## 3. Getting Started

Follow these steps to get the project running locally.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation & Setup

1.  **Clone the repository and install dependencies**:
    ```bash
    git clone <repository-url>
    cd <project-folder>
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file in the root of the project with your API keys and configuration:
    ```
    # Add your environment variables here
    ```

3.  **Run the Development Server**:
    The application will run using the local file-based database by default.
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

**Admin Credentials**:
- **Email**: `admin@aparra.com`
- **Password**: `password`

---

## 4. Key Features & Implementation

### 4.1. Admin Panel
A comprehensive dashboard for managing the store, including product and order management, discount creation, and extensive appearance customization for multiple homepage and product page themes.

### 4.2. Storefront
-   **Dynamic Theming**: Supports multiple, visually distinct themes for both the homepage and product detail pages, all manageable from the admin panel.
-   **Advanced Navigation**: Features a multi-level mega menu with promotional content, built with a drag-and-drop interface in the admin panel.
-   **Product Discovery**: Includes global product search, a "compare products" feature, and a persistent wishlist.
-   **Secure Checkout**: A single-page checkout integrated with Cashfree, supporting guest and logged-in user flows.

### 4.3. Authentication
-   **Customer Login**: A secure OTP-based login system using the customer's phone number.
-   **Admin Login**: Separate email and password-based login for administrators.
-   **Password Reset**: Admins can use a "Forgot Password" flow that sends a secure, time-limited reset link via email.

### 4.4. AI Integration (Genkit)
-   **Product Description Generator**: Automatically generates compelling, SEO-friendly product descriptions.
-   **Dynamic Pricing Assistant**: Provides AI-powered suggestions for manual price overrides based on market context.
