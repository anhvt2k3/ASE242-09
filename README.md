# Room Management System (ROMS) - Frontend

This repository contains the frontend application for the Room Management System, a web-based solution for managing room bookings and schedules.

## Technologies

- **ReactJS** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework

## Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or newer)
- npm (v7 or newer)
- Backend API server running (default: https://localhost:7288)

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/anhvt2k3/ASE242-09.git
   cd roms-fe
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   # Update VITE_BE_DOMAIN if your backend is running on a different URL
   ```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5173/

## Features

- Campus, building, and room filtering
- Weekly and daily schedule views
- Room booking management
- Responsive design for desktop and mobile

## API Configuration

The frontend is configured to proxy API requests to the backend server. By default, it points to https://localhost:7288.

You can modify this in `vite.config.ts`:

## Additional Information

- The application uses HTTPS for the proxy connection to the backend
- Default port is 5173, but can be configured in `vite.config.ts`
- Authentication is handled via JWT tokens

## Troubleshooting

- If you encounter CORS issues, ensure the backend is properly configured to accept requests from your frontend origin
- SSL certificate verification is disabled for local development; enable it for production
