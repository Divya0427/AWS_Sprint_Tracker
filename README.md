# AWS Sprint Tracker (React + NodeJS + AWS Serverless)

A full-stack Sprint Management tool for engineering teams.  
Supports sprint setup, workload distribution, daily task updates, and Excel + CSV imports.

This project includes:
- React (Vite + TypeScript + Material UI)
- NodeJS Express mock backend (to be replaced with AWS Lambda)
- File upload (Excel/CSV)
- Workload calculation logic
- Role-based login (Cognito planned)

---

## 🚀 Features

### 1. Sprint Setup
- Upload Excel/CSV sprint sheet
- Parse and convert into normalized JSON
- Edit assignees, story points, target date, clarifications
- Add new protocols manually
- Download as CSV

### 2. My Work
- Filter by assignee, version, status
- Inline status updates
- Story point validation
- Export filtered view to CSV

### 3. Team Workload
- Summary of developer load
- Auto-color coding:
  - Green: balanced
  - Yellow: warning
  - Red: overload
- Total SP calculation per discipline

---

## 🧱 Project Structure
# My Notes
- difference between OIDC+cognito vs aws amplify+cognito
- NEW_PASSWORD_REQUIRED flow
- Authorization: Bearer vs session ID
- Amplify?
- RESTAPI vs HTTP API: real use cases
- IAM roles > permissions > attach policies vs create inline policies
- for postman body: [
  {
    "protocolKey": "P-1",
    "name": "Test Protocol",
    "uiAssignee": "Dev1",
    "uiSP": 3
  }
]
- for lambda test event: {
  "httpMethod": "POST",
  "body": "[{\"protocolKey\":\"P-1\",\"name\":\"Test Protocol\",\"uiAssignee\":\"Dev1\",\"uiSP\":3}]"
}
- Bearer eyJraWQiOiJLVG5aQlQrRUQrNFp4WnZVVHk5bDFKVnl4RkFabG9qMVgyT1U3K1o2SktFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MTAzZWQyYS0zMDAxLTcwNzMtYTU1Zi01NGZiN2Y0ZWMwOGIiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xX1VTWGNxOXZRQiIsImNsaWVudF9pZCI6IjQ0bWZ1OXZtYmQydWlzZDdramRscjQ1NW11Iiwib3JpZ2luX2p0aSI6IjdjZmIwMjRkLWNiOGQtNDMyNi05ZTQ1LTE1MWY2N2Q0MzliNCIsImV2ZW50X2lkIjoiZTk2NTE5YjYtNWM1Ni00NjRhLWI0MWUtMWZjNGRmOGIzMzUwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc2NDY2OTg3NSwiZXhwIjoxNzY0NjczNDc1LCJpYXQiOjE3NjQ2Njk4NzUsImp0aSI6ImE3Yzk0ZjU2LTVlNWItNDkxZC05YjY5LTUwZDI1OWMxNjE2ZCIsInVzZXJuYW1lIjoiNTEwM2VkMmEtMzAwMS03MDczLWE1NWYtNTRmYjdmNGVjMDhiIn0.IOG9VywZnfmavMZmfPBj5KOB716aBhQ65CZDUKSdIScC0yCke4SbH27-HHNXOnhSv5gWlC3XvS5AbhkVQ0GqmZRS5ymqpWrF-7tZ6oOmKldoS8e__V92ZoqushVrcKS9NWnF8jbR8_PKod5Ru_pmCvQgH8gqQBd7PY3y_tfvrMSxK9MEzUVcygM7KOYT4rbCFtUx3GUGMbAW4oV9c4xyOMCUiRAA3CYZ-8Cg5g8916ysP3DQMMOV9opfNA55L81cxowyPC_GAk3zRdYbyMosgtnVNFw8ainfIDqxU3IEuThcSxMX0YXD_fuau1SR4lXNSIWMPiYD-ZmvP2TnVcaxTA
- Real time project/hands on project basic blockers
- ACLs disabled
- OAC - Origin Access Control

 

