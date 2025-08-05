# Financial Tracker Frontend

A modern React TypeScript frontend for personal financial management, featuring authentication, responsive design, and Turkish language support.

## Features

- **Authentication System**: JWT-based login/register with secure token management
- **Responsive Design**: Mobile-first design with TailwindCSS
- **TypeScript**: Full type safety throughout the application
- **Form Validation**: Client-side validation with React Hook Form and Yup
- **Protected Routes**: Route-based authentication guards
- **Modern UI**: Clean, accessible components with loading states
- **Turkish Language Support**: Turkish text and error messages
- **API Integration**: Axios-based HTTP client with interceptors

## Tech Stack

- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Styling and responsive design
- **React Hook Form** - Form handling
- **Yup** - Form validation
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, Card)
│   ├── forms/           # Form components (LoginForm, RegisterForm)
│   └── layout/          # Layout components (ProtectedRoute)
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication state management
├── pages/               # Page components
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Dashboard and main app pages
├── services/           # API services and HTTP client
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on https://localhost:7093

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.development .env.local
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## API Integration

The frontend connects to the ASP.NET Core backend API with the following endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

The Axios client is configured with:
- Base URL: `https://localhost:7093/api`
- JWT token interceptors
- Error handling and transformation
- Turkish error messages

## Authentication Flow

1. User submits login/register form
2. Credentials sent to backend API
3. JWT token received and stored in localStorage
4. Token automatically included in subsequent API requests
5. Token decoded to extract user information
6. Protected routes accessible only with valid token

## Features Implemented

### Authentication System
- [x] JWT token management
- [x] Login form with validation
- [x] Register form with validation
- [x] Protected routes
- [x] Automatic token refresh handling
- [x] Turkish language support

### UI Components
- [x] Responsive Button component
- [x] Input component with validation states
- [x] Card components for layout
- [x] Loading states and error handling
- [x] Form validation with user-friendly messages

### Dashboard
- [x] Basic dashboard layout
- [x] User welcome section
- [x] Quick actions for future features
- [x] Responsive design for mobile and desktop

## Development Guidelines

### Component Structure
- Use functional components with TypeScript
- Implement proper error boundaries
- Follow React best practices for state management
- Use custom hooks for reusable logic

### Styling
- TailwindCSS utility classes
- Responsive design patterns
- Consistent color scheme and typography
- Accessible design principles

### Error Handling
- API errors transformed to user-friendly messages
- Form validation with field-specific errors
- Loading states for better UX
- Turkish error messages

## Future Enhancements

- Transaction management (CRUD operations)
- Category management
- Budget tracking and visualization
- Charts and analytics
- Export functionality
- Dark mode support
- Offline capability

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code structure and naming conventions
2. Ensure TypeScript types are properly defined
3. Test on multiple screen sizes
4. Follow Turkish language conventions for user-facing text
5. Maintain accessibility standards
