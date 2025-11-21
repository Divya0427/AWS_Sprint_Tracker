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

