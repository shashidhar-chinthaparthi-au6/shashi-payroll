# Payroll System - Development Setup

## Quick Start

### 1. Start the Server
```bash
cd server
npm install
npm run seed-users  # Create default users
npm run dev         # Start server
```

### 2. Start the Client
```bash
cd client
npm install
npm start          # Start React app
```

### 3. Access the Application
- **Web App**: http://localhost:3000
- **API**: http://localhost:5000

## Default Users

The system comes with pre-configured users for testing:

### Super Admin
- **Email**: admin@payroll.com
- **Password**: admin123
- **Access**: Full system access, manage all organizations

### Organization Managers
- **Email**: john@company1.com
- **Password**: manager123
- **Access**: Manage Company 1, employees, payroll, attendance

- **Email**: sarah@company2.com
- **Password**: manager123
- **Access**: Manage Company 2, employees, payroll, attendance

### Employees
- **Email**: mike@company1.com
- **Password**: employee123
- **Access**: Mark attendance, view payslips, apply leaves

- **Email**: lisa@company1.com
- **Password**: employee123
- **Access**: Mark attendance, view payslips, apply leaves

### Contractor
- **Email**: alex@contractor.com
- **Password**: contractor123
- **Access**: Mark attendance, view invoices, apply leaves

## Development Features

### Registration System
- **URL**: `/register`
- **Features**: Create new users with proper role assignment
- **Roles**: Super Admin, Organization Manager, Employee

### Development Users Page
- **URL**: `/dev-users` (when logged in as admin)
- **Features**: 
  - View all default users with credentials
  - Copy credentials to clipboard
  - Quick login buttons
  - Register new users
  - Manage existing users

### Quick Login
- Click "Quick Login" buttons on dev-users page
- Or use direct URLs: `/login?email=admin@payroll.com&password=admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register/admin` - Register admin
- `POST /api/auth/register/client` - Register organization manager
- `POST /api/auth/register/employee` - Register employee

### Organizations
- `GET /api/shops/all` - Get all organizations (admin only)
- `POST /api/shops` - Create organization
- `GET /api/shops/:id` - Get organization details
- `PATCH /api/shops/:id` - Update organization
- `DELETE /api/shops/:id` - Delete organization

### Users
- `GET /api/users/all` - Get all users (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Database Models

### Core Models
- **User**: Authentication and roles
- **Organization**: Business entities
- **Employee**: Employee records
- **Attendance**: Daily attendance tracking
- **Payslip**: Salary records
- **Leave**: Leave applications

### Relationships
- User → Organization (manager relationship)
- Employee → Organization (belongs to)
- Employee → User (login account)
- Attendance → Employee
- Payslip → Employee
- Leave → Employee

## Development Commands

```bash
# Server commands
cd server
npm run dev          # Start development server
npm run seed-users   # Create default users
npm run drop-db      # Clear database
npm test            # Run tests

# Client commands
cd client
npm start           # Start React app
npm run build       # Build for production
npm test           # Run tests
```

## Testing Scenarios

### 1. Super Admin Flow
1. Login as admin@payroll.com
2. Create new organizations
3. Assign organization managers
4. View global analytics
5. Manage all users

### 2. Organization Manager Flow
1. Login as john@company1.com
2. Add employees to organization
3. Manage attendance
4. Process payroll
5. Approve leaves

### 3. Employee Flow
1. Login as mike@company1.com
2. Mark daily attendance
3. View payslips
4. Apply for leaves
5. View attendance history

### 4. Contractor Flow
1. Login as alex@contractor.com
2. Mark attendance for assignments
3. View contractor invoices
4. Apply for leaves
5. View assignment history

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure MongoDB is running
2. **Authentication Errors**: Check JWT_SECRET in .env
3. **CORS Issues**: Verify API_URL in client config
4. **Port Conflicts**: Change ports in package.json if needed

### Reset Database
```bash
cd server
npm run drop-db
npm run seed-users
```

## Next Steps

1. Complete attendance management features
2. Implement payroll processing
3. Add leave management system
4. Create reporting dashboard
5. Build mobile app features
