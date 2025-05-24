#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API URL
API_URL="http://localhost:5000/api"

# Function to print section headers
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to make API calls and handle responses
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4

    if [ -z "$token" ]; then
        response=$(curl -s -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\n%{http_code}")
    else
        response=$(curl -s -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            -w "\n%{http_code}")
    fi

    # Split response into body and status code
    local body=$(echo "$response" | sed '$d')
    local status_code=$(echo "$response" | tail -n1)

    # Print status code for debugging
    echo "Status Code: $status_code"
    echo "$body"
}

# Function to extract value from JSON response
extract_value() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\":\"[^\"]*\"" | cut -d'"' -f4
}

# Function to extract token from login response
extract_token() {
    local json=$1
    echo "$json" | grep -o "\"token\":\"[^\"]*\"" | cut -d'"' -f4
}

# Function to extract user ID from response
extract_user_id() {
    local json=$1
    echo "$json" | grep -o "\"id\":\"[^\"]*\"" | cut -d'"' -f4
}

# Function to check if response contains success
check_success() {
    local response=$1
    if [[ $response == *"success\":true"* ]] || [[ $response == *"\"message\":\"OK\""* ]]; then
        echo -e "${GREEN}Success${NC}"
        return 0
    else
        echo -e "${RED}Failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Start testing flow
echo -e "${BLUE}Starting Employee Journey Test Flow${NC}"

# Check server health
print_header "0. Server Health Check"
health_response=$(curl -s http://localhost:5000/health)
if [[ $health_response == *"OK"* ]]; then
    echo -e "${GREEN}Server is healthy${NC}"
else
    echo -e "${RED}Server is not responding${NC}"
    echo "Response: $health_response"
    exit 1
fi

# 1. Register Employee
print_header "1. Employee Registration"
register_data="{\"name\":\"Test Employee\",\"email\":\"test.employee@example.com\",\"password\":\"Test@123\",\"firstName\":\"Test\",\"lastName\":\"Employee\",\"department\":\"IT\",\"position\":\"Software Engineer\"}"
register_response=$(make_request "POST" "/auth/register/employee" "$register_data")
check_success "$register_response"
user_id=$(extract_user_id "$register_response")
echo "User ID: $user_id"

# 2. Login
print_header "2. Employee Login"
login_data="{\"email\":\"test.employee@example.com\",\"password\":\"Test@123\"}"
login_response=$(make_request "POST" "/auth/login" "$login_data")
check_success "$login_response"
token=$(extract_token "$login_response")
echo "Token: $token"

# 3. Get Dashboard Data
print_header "3. Get Dashboard Data"
dashboard_response=$(make_request "GET" "/home/dashboard/$user_id" "" "$token")
check_success "$dashboard_response"

# 4. Mark Attendance
print_header "4. Mark Attendance"
attendance_data="{\"userId\":\"$user_id\"}"
attendance_response=$(make_request "POST" "/home/attendance/check-in" "$attendance_data" "$token")
check_success "$attendance_response"

# 5. Request Leave
print_header "5. Request Leave"
leave_data="{\"userId\":\"$user_id\",\"type\":\"casual\",\"startDate\":\"$(date -v+1d +%Y-%m-%d)\",\"endDate\":\"$(date -v+2d +%Y-%m-%d)\",\"reason\":\"Family function\"}"
leave_response=$(make_request "POST" "/leave/request" "$leave_data" "$token")
check_success "$leave_response"

# 6. Get Leave Balance
print_header "6. Get Leave Balance"
leave_balance_response=$(make_request "GET" "/leave/balance/$user_id" "" "$token")
check_success "$leave_balance_response"

# 7. Get Leave History
print_header "7. Get Leave History"
leave_history_response=$(make_request "GET" "/leave/history/$user_id" "" "$token")
check_success "$leave_history_response"

# 8. Get Attendance History
print_header "8. Get Attendance History"
current_month=$(date +%m)
current_year=$(date +%Y)
attendance_history_response=$(make_request "GET" "/attendance/employee/$user_id?startDate=$current_year-$current_month-01&endDate=$current_year-$current_month-31" "" "$token")
check_success "$attendance_history_response"

# 9. Get Monthly Attendance Summary
print_header "9. Get Monthly Attendance Summary"
attendance_summary_response=$(make_request "GET" "/attendance/monthly-summary/$user_id?month=$current_month&year=$current_year" "" "$token")
check_success "$attendance_summary_response"

# 10. Get Payslips
print_header "10. Get Payslips"
payslips_response=$(make_request "GET" "/payslips/employee/$user_id" "" "$token")
check_success "$payslips_response"

# 11. Check Out
print_header "11. Check Out"
checkout_data="{\"userId\":\"$user_id\"}"
checkout_response=$(make_request "POST" "/home/attendance/check-out" "$checkout_data" "$token")
check_success "$checkout_response"

# 12. Get Notifications
print_header "12. Get Notifications"
notifications_response=$(make_request "GET" "/notifications/$user_id" "" "$token")
check_success "$notifications_response"

echo -e "\n${GREEN}Test Flow Completed${NC}" 