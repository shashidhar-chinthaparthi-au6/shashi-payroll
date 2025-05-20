#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Starting API test flow..."

# 1. Register Admin
echo -e "\n${GREEN}1. Registering Admin...${NC}"
ADMIN_RESPONSE=$(curl -v -X POST http://localhost:3000/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"password"}')
echo $ADMIN_RESPONSE

# 2. Register Client
echo -e "\n${GREEN}2. Registering Client...${NC}"
CLIENT_RESPONSE=$(curl -v -X POST http://localhost:3000/api/auth/register/client \
  -H "Content-Type: application/json" \
  -d '{"name":"Client","email":"client@example.com","password":"password"}')
echo $CLIENT_RESPONSE

# 3. Login Admin
echo -e "\n${GREEN}3. Logging in Admin...${NC}"
ADMIN_LOGIN_RESPONSE=$(curl -v -X POST http://localhost:3000/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}')
echo $ADMIN_LOGIN_RESPONSE

# Extract admin token
ADMIN_TOKEN=$(echo $ADMIN_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Admin Token: $ADMIN_TOKEN"

# 4. Login Client
echo -e "\n${GREEN}4. Logging in Client...${NC}"
CLIENT_LOGIN_RESPONSE=$(curl -v -X POST http://localhost:3000/api/auth/login/client \
  -H "Content-Type: application/json" \
  -d '{"email":"client@example.com","password":"password"}')
echo $CLIENT_LOGIN_RESPONSE

# Extract client token
CLIENT_TOKEN=$(echo $CLIENT_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Client Token: $CLIENT_TOKEN"

# 5. Create a new shop (as client)
echo -e "\n${GREEN}5. Creating a new shop...${NC}"
SHOP_RESPONSE=$(curl -v -X POST http://localhost:3000/api/shops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "name": "Test Shop",
    "address": {
      "street": "123 Test St",
      "city": "Test City",
      "state": "TS",
      "zipCode": "12345"
    },
    "phone": "1234567890",
    "email": "testshop@example.com"
  }')
echo $SHOP_RESPONSE

# Extract shop ID
SHOP_ID=$(echo $SHOP_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Shop ID: $SHOP_ID"

# 6. Create a new employee
echo -e "\n${GREEN}6. Creating a new employee...${NC}"
EMPLOYEE_RESPONSE=$(curl -v -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "position": "Manager",
    "shop": "'$SHOP_ID'",
    "dailySalary": 1000
  }')
echo $EMPLOYEE_RESPONSE

# Extract employee ID
EMPLOYEE_ID=$(echo $EMPLOYEE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Employee ID: $EMPLOYEE_ID"

# 7. Manual check-in
echo -e "\n${GREEN}7. Performing manual check-in...${NC}"
CHECKIN_RESPONSE=$(curl -v -X POST http://localhost:3000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "employeeId": "'$EMPLOYEE_ID'",
    "shopId": "'$SHOP_ID'"
  }')
echo $CHECKIN_RESPONSE

# 8. Check-out
echo -e "\n${GREEN}8. Performing check-out...${NC}"
CHECKOUT_RESPONSE=$(curl -v -X POST http://localhost:3000/api/attendance/check-out \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "employeeId": "'$EMPLOYEE_ID'",
    "method": "manual"
  }')
echo $CHECKOUT_RESPONSE

# 9. Generate monthly payroll
echo -e "\n${GREEN}9. Generating monthly payroll...${NC}"
PAYROLL_RESPONSE=$(curl -v -X POST http://localhost:3000/api/payroll/generate/$SHOP_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{
    "month": 3,
    "year": 2024
  }')
echo $PAYROLL_RESPONSE

# Extract payroll ID
PAYROLL_ID=$(echo $PAYROLL_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Payroll ID: $PAYROLL_ID"

# 10. Generate payslip
echo -e "\n${GREEN}10. Generating payslip...${NC}"
PAYSLIP_RESPONSE=$(curl -v -X POST http://localhost:3000/api/payslips/generate \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "'$EMPLOYEE_ID'",
    "month": 3,
    "year": 2024
  }')
echo $PAYSLIP_RESPONSE

# Extract payslip ID
PAYSLIP_ID=$(echo $PAYSLIP_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Payslip ID: $PAYSLIP_ID"

# 11. Approve payslip
echo -e "\n${GREEN}11. Approving payslip...${NC}"
APPROVE_RESPONSE=$(curl -v -X POST http://localhost:3000/api/payslips/$PAYSLIP_ID/approve \
  -H "Authorization: Bearer $CLIENT_TOKEN")
echo $APPROVE_RESPONSE

echo -e "\n${GREEN}Test flow completed!${NC}" 