================================================================================
CAMPUSCONNECT – LOST & FOUND MANAGEMENT SYSTEM
SLIIT SE2020: Web and Mobile Technologies (Year 2 Semester 2 - 2026)
BSc (Hons) in Software Engineering
================================================================================

PROJECT OVERVIEW:
CampusConnect is a lightweight, academic-compliant full-stack mobile application
designed for university campuses. It streamlines the reporting, browsing, and
claiming of lost and found belongings among students and campus authorities.

--------------------------------------------------------------------------------
1. STUDENT / SUBMISSION DETAILS
--------------------------------------------------------------------------------
Module Code:     SE2020 — Web and Mobile Technologies
Module Title:    Web and Mobile Technologies
Student Name:    Avishka Sahan
Student ID:      IT22371072
Repository:      https://github.com/avishkasenanayake997-glitch/WMT.git

--------------------------------------------------------------------------------
2. TECHNOLOGY STACK
--------------------------------------------------------------------------------
* Mobile Frontend:  React Native (JavaScript, Functional Components, Hooks)
* App Framework:    Expo (SDK 57, iOS / Android / Web support)
* Navigation:       React Navigation v6 (Stack + Bottom Tabs)
* Backend API:      Node.js & Express.js (RESTful architecture)
* Database ODM:     MongoDB Atlas & Mongoose v8
* Authentication:   JSON Web Tokens (JWT) & bcryptjs (10 salt rounds)
* File Upload:      Multer (Disk storage, MIME validation, 5MB limit)
* Local Storage:    @react-native-async-storage/async-storage

--------------------------------------------------------------------------------
3. ASSIGNMENT COMPLIANCE & BUSINESS LOGIC (RULES 1 - 7)
--------------------------------------------------------------------------------
The application strictly enforces all 7 domain rules at the Express API layer:
* RULE 1: Only Found items can be claimed (claims on Lost items return HTTP 400).
* RULE 2: Item must be in "Active" status to accept claims (HTTP 400).
* RULE 3: Duplicate active (Pending) claims for the same item are blocked (HTTP 409).
* RULE 4: Admin approval transitions Claim -> Approved and Item -> Claimed.
* RULE 5: Admin rejection transitions Claim -> Rejected while Item remains Active.
* RULE 6: User cancellation transitions Claim -> Cancelled while Item remains Active.
* RULE 7: Claimed items strictly lock out any subsequent claim submissions.

--------------------------------------------------------------------------------
4. DEFAULT DEMO CREDENTIALS (FOR VIVA EVALUATION)
--------------------------------------------------------------------------------
Use the one-tap Quick-Fill buttons on the Login screen, or enter:

* Campus Administrator:
  Email:    admin@sliit.lk
  Password: admin123
  Role:     isAdmin: true (Claim Review, Approve/Reject, Audit Registry)

* University Student:
  Email:    student@sliit.lk
  Password: student123
  Role:     isAdmin: false (Report Lost/Found, Submit Claims, Track Status)

* Secondary Student (for Multi-user testing):
  Email:    kasun@my.sliit.lk
  Password: kasun123

--------------------------------------------------------------------------------
5. QUICK START / EXECUTION INSTRUCTIONS
--------------------------------------------------------------------------------
Prerequisites: Node.js (v18+) and npm installed.

A. STARTING THE BACKEND API:
   1. Open terminal:
      cd backend
   2. Install dependencies (if not already done):
      npm install
   3. Seed demo data (Users, Items, Claims):
      npm run seed
   4. Start development server:
      npm run dev
      Backend runs on: http://localhost:5000
      Health check:    http://localhost:5000/api/health

B. STARTING THE FRONTEND (MOBILE & WEB):
   1. Open a second terminal:
      cd mobile
   2. Start Expo:
      npm start
   3. Options:
      * Press 'w' to launch directly in your Web Browser (http://localhost:8081).
      * Scan QR code with the Expo Go app on your iPhone or Android.
      * Press 'a' to open Android Emulator.

--------------------------------------------------------------------------------
6. SUBMISSION DIRECTORY CONTENTS
--------------------------------------------------------------------------------
* Problem_Statement.pdf          - Complete problem definition, objectives & scope
* System_Architecture_Diagram.png- 3-tier client/server/database architecture
* Database_Schema_Diagram.png    - Relational Entity Relationship diagram
* API_Endpoint_Table.pdf         - Full REST API specification and status codes
* Team_Responsibility.pdf        - Project deliverables & individual breakdown
* README.txt                     - This setup and submission reference file

================================================================================
END OF FILE
================================================================================
