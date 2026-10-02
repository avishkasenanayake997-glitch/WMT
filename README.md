# CampusConnect – Lost & Found Management System

**SLIIT SE2020 — Web and Mobile Technologies**  
**BSc (Hons) in Software Engineering | Year 2 Semester 2 — 2026**

---

## 1. Project Overview
**CampusConnect** is a small, complete, understandable full-stack mobile application developed for university environments. The system enables students to report, search, and claim lost and found possessions across campus, while providing authorized administrators with mobile-native review tools to verify claims and update item statuses.

The application strictly fulfills the SE2020 individual assignment specifications:
- **Clean Architecture**: 3-tier structure (React Native client -> Express.js REST API -> MongoDB Atlas).
- **Core Relational Modeling**: `Item` (Primary Entity) and `Claim` (Related Entity) with Mongoose references and population.
- **Real Business Logic**: Strict backend enforcement of all 7 assignment domain rules.
- **Security & RBAC**: `bcryptjs` password hashing and JWT Bearer token authentication.
- **Image Handling**: Multer file uploads with MIME validation, size limits (<= 5MB), and static hosting.
- **Academic Clarity**: Clean JavaScript, intuitive state management, and full viva explainability.

---

## 2. Problem Statement
At large university campuses like SLIIT, personal belongings (student ID cards, laptops, chargers, books, keys, calculators, and wallets) are frequently misplaced. Traditional lost-and-found practices rely on physical noticeboards, security desk logbooks, or unofficial social media groups, resulting in:
1. Low recovery rates due to fragmented information.
2. Inability to verify legitimate ownership of recovered items.
3. High administrative burden on campus security desks.
4. Complete lack of transparent status tracking for students.

CampusConnect solves this by providing a unified, role-aware mobile platform with clear ownership verification and status lifecycles.

---

## 3. Objectives
1. Provide a central mobile database for reporting both lost and found belongings on campus.
2. Implement complete CRUD operations on the primary entity (`Item`) and related entity (`Claim`).
3. Enforce relational integrity between User, Item, and Claim using Mongoose object references.
4. Execute real business logic rules at the API layer (e.g. claim locking, status transitions).
5. Deliver a professional, responsive mobile user interface with React Native.
6. Provide a deployed cloud backend connected to MongoDB Atlas.

---

## 4. Features
- **User Authentication**: Secure registration, login, JWT storage in `AsyncStorage`, and auto-login.
- **Role-Based Access Control**:
  - **Students**: Report lost/found items, edit own reports, submit ownership claims with proof, track claim status, and cancel pending claims.
  - **Administrators**: Review pending claims inside the mobile app, approve/reject claims, audit item registries, and update item statuses.
- **Item Discovery & Filtering**: Search bar, category filters, and segmented pills (`All`, `Lost`, `Found`).
- **Complete CRUD Operations**: Create, read, update, and delete for both `Item` and `Claim`.
- **Image Upload**: Upload item photographs from device gallery, stored on disk and served statically.
- **Viva Demo Quick-Fill**: One-tap demo buttons on the login screen for instant examiner testing.

---

## 5. Technology Stack

### Mobile Frontend
- **Framework**: React Native with Expo
- **Language**: JavaScript (ES6+)
- **Components**: Functional Components with React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`)
- **Navigation**: React Navigation v6 (Stack Navigator + Bottom Tab Navigator)
- **Local Storage**: `@react-native-async-storage/async-storage`
- **Networking**: `axios` with Bearer token interceptor
- **Media**: `expo-image-picker`

### Backend REST API
- **Platform**: Node.js
- **Framework**: Express.js
- **Database ODM**: Mongoose v8
- **Authentication**: `jsonwebtoken` (JWT) + `bcryptjs`
- **File Upload**: `multer`
- **CORS**: `cors` middleware

### Database
- **Provider**: MongoDB Atlas (Cloud Replica Set)

### Cloud Hosting
- **Backend API**: Render / Railway (with automatic health check endpoint `/api/health`)

---

## 6. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React Native App                     │
│         (Expo / React Native Functional UI)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Navigation   │  │ Context      │  │ Components   │  │
│  │ (Auth & App) │  │ (AuthContext)│  │ & Screens    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         └─────────────────┼─────────────────┘          │
│                           ▼                            │
│                 Axios API Service                      │
│            (JWT Bearer Interceptors)                   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST JSON + Multipart
                            ▼
┌────────────────────────────────────────────────────────┐
│                Express.js REST API                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Middleware: CORS, Auth (JWT), Admin, Multer, Log │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Controllers: authController, itemController,     │  │
│  │              claimController                     │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Business Logic: Rules 1 - 7 Enforcement          │  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Mongoose Models: User, Item, Claim               │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │ TLS Connection
                            ▼
┌────────────────────────────────────────────────────────┐
│                  MongoDB Atlas                         │
│   [Users Collection] [Items Collection] [Claims Coll]  │
└────────────────────────────────────────────────────────┘
```

---

## 7. Database Schemas & Entity Relationships

### Relational Model
```
  ┌──────────────┐
  │     User     │
  ├──────────────┤
  │ _id          │
  │ name         │
  │ email        │
  │ password     │
  │ isAdmin      │
  └──────┬───────┘
         │
         │ 1:N (reportedBy)
         ▼
  ┌──────────────┐          1:N (itemId)          ┌──────────────┐
  │     Item     │◄───────────────────────────────┤    Claim     │
  ├──────────────┤                                ├──────────────┤
  │ _id          │                                │ _id          │
  │ title        │                                │ itemId (FK)  │──┐
  │ description  │                                │ userId (FK)  │  │
  │ category     │                                │ message      │  │
  │ location     │                                │ claimDate    │  │
  │ dateReported │                                │ status       │  │
  │ itemType     │                                └──────┬───────┘  │
  │ image        │                                       │          │
  │ status       │                                       │ (userId) │
  │ reportedBy   │◄──────────────────────────────────────┴──────────┘
  └──────────────┘
```

### 1. User Schema (`backend/models/User.js`)
- `_id`: ObjectId
- `name`: String, required
- `email`: String, required, unique
- `password`: String, required, hashed with bcrypt (salt rounds = 10)
- `isAdmin`: Boolean, default: false
- `createdAt` / `updatedAt`: Timestamps

### 2. Item Schema (`backend/models/Item.js`) - Primary Entity
- `_id`: ObjectId
- `title`: String, required
- `description`: String, required
- `category`: Enum (`Electronics`, `Documents`, `Clothing`, `Accessories`, `Other`)
- `location`: String, required
- `dateReported`: Date, default: Date.now
- `itemType`: Enum (`Lost`, `Found`), required
- `image`: String (URL or `/uploads/...`)
- `status`: Enum (`Active`, `Claimed`, `Resolved`), default: `Active`
- `reportedBy`: ObjectId reference to `User`, required
- `createdAt` / `updatedAt`: Timestamps

### 3. Claim Schema (`backend/models/Claim.js`) - Related Entity
- `_id`: ObjectId
- `itemId`: ObjectId reference to `Item`, required
- `userId`: ObjectId reference to `User`, required
- `message`: String, required (proof of ownership)
- `claimDate`: Date, default: Date.now
- `status`: Enum (`Pending`, `Approved`, `Rejected`, `Cancelled`), default: `Pending`
- `createdAt` / `updatedAt`: Timestamps

---

## 8. Business Logic Rules (Rules 1 - 7)

All domain rules are enforced at the **backend controller layer**:

1. **RULE 1 — Only Found Items Can Be Claimed**:
   Claims submitted for items with `itemType !== "Found"` are rejected with HTTP 400 (`"Only found items can be claimed."`).
2. **RULE 2 — Item Must Be Active**:
   Claims submitted for items with `status !== "Active"` are rejected with HTTP 400.
3. **RULE 3 — Prevent Duplicate Active Claims**:
   A student cannot submit a second `Pending` claim for the same item. If one exists, the server returns HTTP 409 Conflict (`"You already have a pending claim for this item."`).
4. **RULE 4 — Approving a Claim**:
   When an administrator approves a pending claim:
   - `Claim.status` -> `Approved`
   - `Item.status` -> `Claimed`
   - Other pending claims for this item are automatically marked `Rejected`.
5. **RULE 5 — Rejecting a Claim**:
   When an administrator rejects a claim:
   - `Claim.status` -> `Rejected`
   - `Item.status` remains `Active` (other students can still submit claims).
6. **RULE 6 — Cancelling a Claim**:
   When a student cancels their own pending claim:
   - `Claim.status` -> `Cancelled`
   - `Item.status` remains `Active`.
7. **RULE 7 — Claimed Item Locking**:
   Once an item is marked `Claimed`, new claim attempts are blocked by Rule 2 and return HTTP 400.

---

## 9. API Endpoint Reference Table

| Method | Endpoint | Auth | Role | Request Body | Description |
|---|---|---|---|---|---|
| `GET` | `/api/health` | No | Public | None | Health check & uptime |
| `POST` | `/api/auth/register` | No | Public | `{ name, email, password, isAdmin? }` | Register new user |
| `POST` | `/api/auth/login` | No | Public | `{ email, password }` | Login & receive JWT |
| `GET` | `/api/auth/me` | Yes | Any | None | Fetch current profile |
| `GET` | `/api/items` | Yes | Any | Query: `?type=Lost\|Found&category=...` | Read all items with filters |
| `GET` | `/api/items/:id` | Yes | Any | None | Read single item details |
| `POST` | `/api/items` | Yes | Any | `multipart/form-data` | Create item report with photo |
| `PUT` | `/api/items/:id` | Yes | Owner / Admin | `multipart/form-data` | Update item report |
| `DELETE` | `/api/items/:id` | Yes | Owner / Admin | None | Delete item & related claims |
| `GET` | `/api/claims` | Yes | Any | Query: `?status=Pending` | User views own claims; Admin views all |
| `GET` | `/api/claims/:id` | Yes | Owner / Admin | None | Read claim details |
| `POST` | `/api/claims` | Yes | Student | `{ itemId, message }` | Submit ownership claim |
| `PUT` | `/api/claims/:id/status` | Yes | Admin Only | `{ status: "Approved" \| "Rejected" }` | Review claim decision |
| `PUT` | `/api/claims/:id/cancel` | Yes | Owner Only | None | Cancel pending claim |
| `DELETE` | `/api/claims/:id` | Yes | Owner / Admin | None | Delete claim record |

---

## 10. Complete List of 14 Mobile Screens

1. **SplashScreen**: Session verification and redirection.
2. **LoginScreen**: Email/password authentication with viva demo quick-fill.
3. **RegisterScreen**: Account registration with validation.
4. **HomeScreen**: Campus portal dashboard, live statistics, quick actions, and recent reports.
5. **ItemListScreen**: Searchable, filterable list of all campus items with status badges.
6. **ItemDetailsScreen**: Comprehensive item view with conditional "Claim" action.
7. **CreateItemScreen**: Form to report lost/found items with camera/gallery photo upload.
8. **EditItemScreen**: Form to modify existing reports and replace photos.
9. **CreateClaimScreen**: Form to submit ownership proof on found items.
10. **MyClaimsScreen**: Personal claim tracking with status badges.
11. **ClaimDetailsScreen**: Full claim inspection with cancellation capability.
12. **AdminClaimsScreen**: In-app administrative review dashboard with Approve/Reject dialogs.
13. **AdminItemManagementScreen**: In-app registry to audit, resolve, and delete reports.
14. **ProfileScreen**: User credentials, summary counters, health indicator, and logout.

---

## 11. Installation & Local Setup

### Prerequisites
- Node.js (v18.x or newer)
- npm or yarn
- Expo Go app on your physical mobile device (or Android Emulator / iOS Simulator)

### Step 1: Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env` file (refer to `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=campusconnect_super_secret_jwt_key_2026_sliit_se2020
BASE_URL=http://localhost:5000
```

Seed initial sample data (Users, Items, Claims):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# or: npm start
```

Verify backend health:
```bash
curl http://localhost:5000/api/health
```

---

### Step 2: Mobile App Setup
```bash
cd ../mobile
npm install
```

Configure `mobile/src/config.js`:
- For **Hosted Backend**: Point `API_BASE_URL` to your Render URL.
- For **Physical Device (Expo Go)**: Point `API_BASE_URL` to your computer's Wi-Fi IP (e.g. `http://192.168.1.100:5000`).
- For **Android Emulator**: Use `http://10.0.2.2:5000`.

Start the Expo development server:
```bash
npx expo start
```
Scan the QR code using the **Expo Go** app on your phone.

---

## 12. Default Demo Accounts for Viva

| Role | University Email | Password | Access Rights |
|---|---|---|---|
| **Campus Admin** | `admin@sliit.lk` | `admin123` | Full administrative review, claim approval/rejection, item resolution |
| **Student 1** | `student@sliit.lk` | `student123` | Report items, submit claims, manage own reports |
| **Student 2** | `kasun@my.sliit.lk` | `kasun123` | Report items, submit claims |

*Tip: Tap the "Student" or "Admin" quick-fill buttons on the Login screen to autofill credentials instantly during evaluation.*

---

## 13. Deployment Instructions (Render.com)

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Set the following configuration:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add the Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusconnect?retryWrites=true&w=majority`
   - `JWT_SECRET`: `campusconnect_super_secret_jwt_key_2026_sliit_se2020`
   - `BASE_URL`: `https://your-app-name.onrender.com`
7. Click **Create Web Service**.
8. Copy the live service URL and paste it into `mobile/src/config.js` as `API_BASE_URL`.

---

## 14. Viva Preparation Notes & Key Concepts

### 1. Explain the Request-Response Flow
1. User interacts with a React Native Screen (e.g. submits a claim).
2. The component calls a service function (e.g. `claimService.createClaim`).
3. An Axios instance automatically retrieves the JWT token from `AsyncStorage` and attaches `Authorization: Bearer <token>`.
4. Express server receives the request:
   - `cors` and `express.json` parse headers and body.
   - `authMiddleware` validates the JWT token with `jwt.verify` and attaches `req.user`.
   - `validationMiddleware` verifies required fields.
   - `claimController` evaluates business logic rules (Rules 1 - 7).
   - Mongoose queries the MongoDB Atlas replica set.
5. Standardized response `{ success: true, message: "...", data: {...} }` is returned with appropriate HTTP status code (200, 201, 400, 403, 404, 409).
6. React Native state updates and re-renders the UI.

### 2. How are the Entity Relationships Implemented in MongoDB?
MongoDB stores data as collections of documents. In CampusConnect, `Claim` documents store the `_id` of the linked `Item` as an `ObjectId` with `ref: 'Item'`. When queries are executed, Mongoose's `.populate('itemId')` dynamically executes an internal lookup to join and return the full item object without data duplication.

### 3. Why are Business Rules Enforced on the Backend?
Client-side validation improves user experience, but can easily be bypassed by sending direct HTTP requests using tools like Postman or curl. By strictly enforcing rules in Express controllers, the application guarantees data integrity and security regardless of the client.

---

## 15. AI Assistance Declaration
In accordance with SLIIT academic integrity policies, generative AI (Google DeepMind Antigravity) was utilized as an assistive pair-programming tool for:
1. Drafting architectural planning and project plan documentation.
2. Generating boilerplate schema definitions and controller patterns.
3. Structuring React Navigation stacks and consistent styling palettes.

All design decisions, business logic rules, validations, and final implementations were reviewed, customized, and verified for compliance with the SE2020 assignment specification.
