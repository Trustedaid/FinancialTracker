# 💰 Financial Tracker

[![.NET](https://img.shields.io/badge/.NET-9.0-blue.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.1.0-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A comprehensive full-stack financial tracking application built with modern technologies and clean architecture principles. Track your income, expenses, budgets, and financial goals with an intuitive and responsive interface.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **BCrypt password hashing** for enhanced security
- **Role-based authorization** for protected endpoints
- **Secure storage** for sensitive data

### 💳 Financial Management
- **Transaction tracking** with categorization and filtering
- **Budget management** with progress monitoring
- **Category-based organization** for better financial insights
- **Real-time balance calculations** and reporting
- **Date range filtering** for historical analysis

### 📊 Data Visualization
- **Interactive dashboards** with comprehensive charts
- **Budget vs actual spending** visualization
- **Category-wise expense breakdown** with pie charts
- **Trend analysis** with time-series charts
- **Financial KPIs** and metrics display

### 🎨 Modern UI/UX
- **Responsive design** optimized for all devices
- **Dark/Light theme** support with system preference detection
- **Smooth animations** and micro-interactions
- **Accessibility-first** design (WCAG 2.1 AA compliant)
- **Progressive Web App** capabilities

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │   React Web     │  │   .NET MAUI     │                 │
│  │   Frontend      │  │   Mobile App    │                 │
│  └─────────────────┘  └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                │
│              ASP.NET Core Web API                           │
│                  (Controllers)                             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Application Layer                           │
│         CQRS + MediatR + AutoMapper                        │
│     (Commands, Queries, DTOs, Validators)                  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Domain Layer                               │
│            (Entities, Interfaces)                          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│               Infrastructure Layer                          │
│       Entity Framework Core + SQL Server                   │
│           (Data Access, External Services)                 │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Framework**: ASP.NET Core 9.0 Web API
- **Database**: Entity Framework Core with SQL Server
- **Authentication**: JWT Bearer tokens
- **Patterns**: CQRS with MediatR
- **Validation**: FluentValidation
- **Logging**: Serilog
- **Documentation**: Swagger/OpenAPI
- **Password Hashing**: BCrypt.Net

### Frontend
- **Framework**: React 19.1.0 with TypeScript
- **State Management**: Redux Toolkit
- **UI Framework**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

### Mobile (Future)
- **.NET MAUI** for cross-platform mobile applications
- **MVVM Pattern** with CommunityToolkit.Mvvm
- **Charts**: Microcharts.Maui
- **Local Storage**: SQLite with offline support

### Testing
- **Unit Tests**: xUnit, Moq, FluentAssertions
- **Integration Tests**: ASP.NET Core Test Host
- **Entity Framework**: In-Memory provider for testing
- **Mock Data**: MockQueryable for Entity Framework mocking

## 🚀 Getting Started

### Prerequisites
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server) (or SQL Server Express/LocalDB)
- [Git](https://git-scm.com/)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/trustedaid/FinancialTracker.git
   cd financial-tracker
   ```

2. **Configure the database**
   ```bash
   # Update connection string in appsettings.json
   # Example connection string for LocalDB:
   "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=FinanceTrackerDb;Trusted_Connection=true;MultipleActiveResultSets=true"
   ```

3. **Install dependencies and run migrations**
   ```bash
   cd FinanceTracker.API
   dotnet restore
   dotnet ef database update
   ```

4. **Configure JWT settings**
   ```json
   {
     "Jwt": {
       "SecretKey": "your-super-secret-key-minimum-32-characters",
       "Issuer": "FinanceTrackerAPI",
       "Audience": "FinanceTrackerClient",
       "ExpiryHours": 24
     }
   }
   ```

5. **Run the API**
   ```bash
   dotnet run
   ```
   The API will be available at `https://localhost:5001` or `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd finance-tracker-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API base URL**
   ```typescript
   // In src/services/api.ts
   const API_BASE_URL = 'https://localhost:5001/api';
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
FinanceTracker/
├── FinanceTracker.API/              # Web API Controllers & Configuration
│   ├── Controllers/                 # API Controllers
│   ├── Middleware/                  # Custom Middleware
│   ├── Program.cs                   # Application startup
│   └── appsettings.json            # Configuration settings
├── FinanceTracker.Application/      # Business Logic Layer
│   ├── Features/                    # CQRS Commands & Queries
│   │   ├── Auth/                   # Authentication features
│   │   ├── Transactions/           # Transaction management
│   │   ├── Categories/             # Category management
│   │   └── Budgets/               # Budget management
│   ├── Common/                     # Shared DTOs & Mappings
│   └── Validators/                 # FluentValidation rules
├── FinanceTracker.Domain/           # Domain Entities & Interfaces
│   ├── Entities/                   # Domain entities
│   ├── Interfaces/                 # Domain interfaces
│   └── Common/                     # Base classes
├── FinanceTracker.Infrastructure/   # Data Access & External Services
│   ├── Data/                       # DbContext & Configurations
│   ├── Services/                   # External service implementations
│   └── Migrations/                 # EF Core migrations
├── FinanceTracker.Tests.Unit/       # Unit Tests
├── FinanceTracker.Tests.Integration/ # Integration Tests
└── finance-tracker-frontend/        # React Frontend
    ├── src/
    │   ├── components/             # Reusable UI components
    │   ├── pages/                  # Page components
    │   ├── services/               # API services
    │   ├── contexts/               # React contexts
    │   ├── hooks/                  # Custom hooks
    │   ├── types/                  # TypeScript type definitions
    │   └── utils/                  # Utility functions
    ├── public/                     # Static assets
    └── package.json               # Dependencies & scripts
```

## 🔌 API Documentation

The API follows RESTful conventions and includes Swagger documentation available at `/swagger` when running in development mode.

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Transaction Endpoints
- `GET /api/transactions` - Get transactions with filtering
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Category Endpoints
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Budget Endpoints
- `GET /api/budgets` - Get budgets with filtering
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

## 🧪 Testing

### Running Backend Tests
```bash
# Unit tests
dotnet test FinanceTracker.Tests.Unit

# Integration tests
dotnet test FinanceTracker.Tests.Integration

# All tests with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend Testing
```bash
cd finance-tracker-frontend
npm run test
```

## 🔧 Development

### Code Style & Guidelines
- **Backend**: Follow C# coding conventions and SOLID principles
- **Frontend**: ESLint configuration with TypeScript rules
- **Database**: Use EF Core migrations for schema changes
- **API**: RESTful design with proper HTTP status codes
- **Security**: Input validation, authorization checks, and secure data handling

### Adding New Features
1. **Backend**: Create command/query in Application layer
2. **Database**: Add migration if schema changes needed
3. **API**: Add controller endpoint
4. **Frontend**: Create service method and UI components
5. **Tests**: Add unit and integration tests

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
dotnet publish -c Release -o ./publish

# Docker deployment
docker build -t finance-tracker-api .
docker run -p 8080:80 finance-tracker-api
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to static hosting (Netlify, Vercel, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use descriptive commit messages

## 📋 Roadmap

- [ ] **Mobile Application** - .NET MAUI cross-platform app
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **Multi-currency Support** - International transactions
- [ ] **Bank Integration** - Automated transaction import
- [ ] **Expense Splitting** - Shared expenses with others
- [ ] **Investment Tracking** - Portfolio management
- [ ] **Receipt Scanner** - OCR for expense entry
- [ ] **Financial Goals** - Savings targets and progress
- [ ] **Reporting Engine** - Custom financial reports
- [ ] **API Rate Limiting** - Enhanced security features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/)
- UI components inspired by modern design systems
- Icons provided by [Lucide](https://lucide.dev/)
- Charts powered by [Chart.js](https://www.chartjs.org/)

## 📞 Support

If you have any questions or need help getting started:

- 📧 Email: erenoguz.developer@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Trustedaid/FinancialTracker/issues)
- 📖 Documentation: [Wiki](https://github.com/trustedaid/FinancialTracker/wiki)

---

**Made with ❤️ by [Eren OĞUZ]**