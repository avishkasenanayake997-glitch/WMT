# CampusConnect – Lost & Found Management System
## SE2020 — Web and Mobile Technologies (SLIIT)
**BSc (Hons) in Software Engineering | Year 2 Semester 2 — 2026**

---

## A. Project Overview
**CampusConnect** is a lightweight, academic-compliant full-stack mobile application designed for university campuses. It streamlines the reporting, browsing, and claiming of lost and found belongings among students and staff.

Built strictly according to the **SLIIT SE2020 Web and Mobile Technologies** assignment specifications, CampusConnect demonstrates clean software architecture, secure authentication, relational modeling in MongoDB, business logic enforcement at the backend API layer, file upload capabilities, and an intuitive mobile user experience using React Native.

---

## B. Problem Statement
In large academic institutions such as SLIIT, hundreds of personal items (student IDs, laptops, chargers, books, keys, calculators, and wallets) are misplaced daily. The traditional lost-and-found process relies on physical security notices, fragmented WhatsApp groups, or word-of-mouth reports. This results in:
1. Low recovery rates due to lack of a centralized campus repository.
2. Inability to verify legitimate ownership of recovered items.
3. High administrative overhead for campus security desks and student affairs.
4. Lack of transparent status tracking for owners searching for lost possessions.

CampusConnect solves this problem through a structured mobile platform where finders report items, losers search records, claimants submit verifiable claims, and administrators validate ownership before handover.

---

## C. Functional Requirements

### 1. User & Authentication Management
- **FR1.1**: User registration with Name, University Email, and Password.
- **FR1.2**: User login with email and password, returning a JSON Web Token (JWT).
- **FR1.3**: Role-based access control distinguishing Normal Users (Students) and Administrators (`isAdmin: true/false`).
- **FR1.4**: Token persistence on mobile devices via secure local storage (`AsyncStorage`).
- **FR1.5**: Secure logout and session clearance.

### 2. Item Management (Primary Entity - Complete CRUD)
- **FR2.1 (Create)**: Authenticated users can report an item as either `Lost` or `Found`, providing title, category, description, location, date, and an optional/required photograph.
- **FR2.2 (Read All)**: All users can browse active lost and found items with tabbed filtering (`All`, `Lost`, `Found`).
- **FR2.3 (Read One)**: Detailed view of any item, displaying all metadata, item status badge, reporter name, and full-resolution photograph.
- **FR2.4 (Update)**: The original reporting user or an administrator can update item details (e.g., description, location, date).
- **FR2.5 (Delete)**: The original reporting user or an administrator can remove an item listing.
- **FR2.6 (Image Upload)**: Multipart form data upload handled via Multer, validating file type (JPEG, PNG, WEBP) and size (<= 5MB).

### 3. Claim Management (Related Entity - Complete CRUD)
- **FR3.1 (Create)**: Authenticated users can submit a ownership claim for any active `Found` item with a detailed verification message.
- **FR3.2 (Read User Claims)**: Users can view their submitted claims and their statuses (`Pending`, `Approved`, `Rejected`, `Cancelled`).
- **FR3.3 (Read Admin Claims)**: Administrators can view all pending claims across all campus items.
- **FR3.4 (Update / Status Review)**: 
  - Administrators can review pending claims and change status to `Approved` or `Rejected`.
  - Claimants can cancel their own `Pending` claims.
- **FR3.5 (Delete)**: Claimants can delete or cancel their pending claims.

### 4. Business Logic Enforcement (Backend Level)
- **FR4.1**: Claims are restricted strictly to items of type `Found`. Claims on `Lost` items must return HTTP 400 Bad Request.
- **FR4.2**: Claims can only be filed against items whose status is `Active`. Claims on `Claimed` or `Resolved` items must return HTTP 400 Bad Request.
- **FR4.3**: A user cannot submit more than one `Pending` claim for the same item (Duplicate Claim Prevention returning HTTP 409 Conflict).
- **FR4.4**: Approving a claim automatically updates the claim status to `Approved` AND updates the associated item status to `Claimed`.
- **FR4.5**: Rejecting a claim updates the claim status to `Rejected` while keeping the item status `Active` for other claimants.
- **FR4.6**: Cancelling a claim updates the claim status to `Cancelled` while keeping the item status `Active`.
- **FR4.7**: Claimed items must strictly reject any subsequent claims.

---

## D. Non-Functional Requirements
- **NFR1 - Security**: Passwords must be hashed using `bcrypt` (minimum 10 salt rounds). API routes must be protected using standard JWT Bearer authentication. No credentials or secrets exposed in frontend code or git repositories.
- **NFR2 - Data Integrity & Validation**: Backend validation for all incoming fields using custom validation middleware. Mongoose schema constraints for data consistency.
- **NFR3 - Maintainability & Simplicity**: Clean modular folder architecture (Controller-Service-Route pattern) without extraneous libraries, microservices, or complex abstraction layers.
- **NFR4 - Performance & Usability**: Responsive mobile UI with loading skeletons/spinners, empty states, human-readable error banners, and image lazy loading.
- **NFR5 - Portability & Deployment**: Fully containerized or cloud-ready backend deployable on Render/Railway with MongoDB Atlas database cluster. Static files served via Express or public URL.

---

## E. User Roles & Permissions

| Feature / Action | Guest (Unauthenticated) | Student / Normal User | Campus Administrator |
|---|:---:|:---:|:---:|
| Register / Login | Yes | Yes | Yes |
| Browse Items (List / Details) | No (Protected App) | Yes | Yes |
| Report Lost / Found Item | No | Yes | Yes |
| Edit / Delete Own Item | No | Yes (Own only) | Yes (All items) |
| Submit Claim on Found Item | No | Yes | No (or as student) |
| View Own Claims | No | Yes | Yes |
| Cancel Own Pending Claim | No | Yes | No |
| View All Pending Claims | No | No | Yes |
| Approve / Reject Claims | No | No | Yes |
| Change Item Status | No | No | Yes |

---

## F. Complete User Flow

```
[Start App]
     │
     ├── Token in Storage? ──No──► [Login / Register Screen]
     │                                    │ (Submit credentials)
     │                                    ▼
     │                             (Receive JWT & User)
     │                                    │
     └──Yes───────────────────────────────┴───────────────┐
                                                          ▼
                                                  [Home Screen]
                                           (Campus summary & recent items)
                                                          │
          ┌───────────────────────┬───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼                       ▼
   [Browse Items]          [Report Item]           [My Claims]             [Profile]
          │                       │                       │                       │
          ▼                       ▼                       ▼                       ▼
   [Item Details]          [Upload Image &]       [Track Status:]          [View Role &]
          │                [Submit Details]       [Pending/Approved/       [Logout]
          ▼                       │               [Rejected/Cancelled]            │
  (Is Found & Active?)            ▼                       │                       ▼
    ├── Yes ──► [Create Claim]   (Saved in DB)            ▼                 (Clear Token)
    │                  │                          [Claim Details]
    └── No ──► (No Claim Button)                          │
                                                          ▼
                                            (Can Cancel if Pending)

[Admin User Flow]:
   [Home / Admin Menu] ──► [Admin Claims Screen] ──► [Review Claim Details]
                                                             │
                                                  ┌──────────┴──────────┐
                                                  ▼                     ▼
                                             [Approve]               [Reject]
                                                  │                     │
                                         Claim -> Approved       Claim -> Rejected
                                         Item  -> Claimed        Item  -> Active
```

---

## G. Complete Screen List (14 Mobile Screens)

### 1. Authentication Screens
1. **SplashScreen**: Checks for stored JWT token in `AsyncStorage`. If valid, routes directly to `AppStack`; otherwise, routes to `LoginScreen`.
2. **LoginScreen**: University email and password inputs with field validation, submit button, link to registration, and demo-credentials quick-fill (Student & Admin) for fast viva demonstration.
3. **RegisterScreen**: Name, email, password, and confirm password inputs with client-side validation and immediate feedback.

### 2. Main Exploration Screens
4. **HomeScreen**: Hero header with "CampusConnect", welcome greeting, quick-action buttons ("Report Lost Item", "Report Found Item"), statistical summary (Active Lost, Active Found), and horizontal carousel/list of recent reports.
5. **ItemListScreen**: Full searchable feed of campus items with segmented filter tabs (`All`, `Lost`, `Found`), pull-to-refresh, search bar, and item cards showing thumbnail, title, category, badge, location, and date.
6. **ItemDetailsScreen**: Detailed view showing high-resolution photo, badge (`Lost` / `Found`), status (`Active`, `Claimed`, `Resolved`), category, location, date reported, detailed description, and reporter information. Displays "Claim This Item" button if and only if item is `Found` and status is `Active`.

### 3. Item Management Screens
7. **CreateItemScreen**: Clean form with radio/toggle for `Item Type` (Lost / Found), Title, Category picker dropdown, detailed Description, Location text input, Date picker, and Image picker with preview.
8. **EditItemScreen**: Pre-populated form allowing the original reporter or admin to update title, category, location, description, or image.

### 4. Claim Management Screens
9. **CreateClaimScreen**: Triggered from `ItemDetailsScreen`. Displays item thumbnail and title summary, a multi-line message input prompting the user for proof of ownership (e.g., serial number, wallpaper, distinct marks), and a submit button with confirmation.
10. **MyClaimsScreen**: List of all claims filed by the logged-in student. Shows item thumbnail, title, claim submission date, and colored status pill (`Pending`, `Approved`, `Rejected`, `Cancelled`).
11. **ClaimDetailsScreen**: Full breakdown of a specific claim, showing linked item details, claimant message, timestamp, current status, and an action button to "Cancel Claim" if the claim is still `Pending`.

### 5. Admin Management Screens
12. **AdminClaimsScreen**: Exclusive to users with `isAdmin: true`. Displays a list of all `Pending` claims across campus. Each card shows item photo, claimant name, claim message snippet, and quick action buttons (`Approve` and `Reject`) with confirmation modal alerts.
13. **AdminItemManagementScreen**: Allows campus administrators to audit all reported items, filter by status, change status to `Resolved`, or delete inappropriate/duplicate listings.

### 6. User Profile Screen
14. **ProfileScreen**: Displays user name, university email, role badge (`Student` or `Campus Administrator`), summary counters (My Reports, My Claims), backend API connection indicator, and a prominent `Logout` button.

---

## H. Item Schema (Mongoose)

```javascript
// backend/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Electronics', 'Documents', 'Clothing', 'Accessories', 'Other'],
    },
    location: {
      type: String,
      required: [true, 'Please provide the location where the item was lost/found'],
      trim: true,
    },
    dateReported: {
      type: Date,
      required: [true, 'Please specify the date'],
      default: Date.now,
    },
    itemType: {
      type: String,
      required: [true, 'Please specify whether the item is Lost or Found'],
      enum: ['Lost', 'Found'],
    },
    image: {
      type: String,
      default: '', // Stores relative path or URL: e.g., '/uploads/item-123456.jpg'
    },
    status: {
      type: String,
      required: true,
      enum: ['Active', 'Claimed', 'Resolved'],
      default: 'Active',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Item', itemSchema);
```

---

## I. Claim Schema (Mongoose)

```javascript
// backend/models/Claim.js
const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Claim must be linked to an Item'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claim must be linked to a User'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a message proving ownership'],
      trim: true,
      maxlength: [500, 'Proof message cannot exceed 500 characters'],
    },
    claimDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Claim', claimSchema);
```

---

## J. User Schema (Mongoose)

```javascript
// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your university email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

---

## K. Entity Relationship Explanation

The assignment requires **TWO main entities besides User**:
1. **Primary Entity**: `Item`
2. **Related Entity**: `Claim`
3. **Authentication Entity**: `User`

### Relational Mapping
- **User to Item (1:N)**: One User can report multiple Items (`Item.reportedBy -> User._id`).
- **User to Claim (1:N)**: One User can submit multiple Claims (`Claim.userId -> User._id`).
- **Item to Claim (1:N)**: One Item can have multiple Claims submitted against it over time (`Claim.itemId -> Item._id`).

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

### Mongoose Query Populate
When fetching a claim for display or review:
```javascript
const claim = await Claim.findById(id)
  .populate('itemId', 'title category location image status itemType')
  .populate('userId', 'name email');
```
This joins the related documents cleanly, returning the full contextual item and user information without duplicating data across MongoDB collections.

---

## L. Business Logic Flow (Rules 1 - 7)

All core business rules are strictly implemented and enforced on the **Node.js/Express backend**, ensuring API security even if client requests bypass frontend checks:

```
[Student Submits Claim (POST /api/claims)]
               │
               ▼
   [1. Is User Authenticated?] ──No──► HTTP 401 Unauthorized
               │ Yes
               ▼
      [2. Does Item Exist?] ──No──► HTTP 404 Item Not Found
               │ Yes
               ▼
   [3. Rule 1: item.itemType === 'Found'?] ──No──► HTTP 400 "Only found items can be claimed."
               │ Yes
               ▼
   [4. Rule 2: item.status === 'Active'?] ──No──► HTTP 400 "Item is not active and cannot be claimed."
               │ Yes
               ▼
   [5. Rule 3: Any existing Pending claim] ──Yes──► HTTP 409 "You already have a pending claim for this item."
   [   by this user for this item?       ]
               │ No
               ▼
   [6. Create Claim with status = 'Pending'] ──► HTTP 201 Created
```

```
[Admin Updates Claim Status (PUT /api/claims/:id/status)]
               │
               ▼
     [Is User Admin?] ──No──► HTTP 403 Forbidden
               │ Yes
               ▼
    [Does Claim Exist & is Pending?] ──No──► HTTP 400 "Claim is not in a reviewable state"
               │ Yes
               ▼
         [Action Type?]
          ├── 'Approved' ──► [Is Item still Active?]
          │                        │ Yes
          │                        ├─► Claim.status = 'Approved'
          │                        ├─► Item.status  = 'Claimed' (Rule 4 & Rule 7)
          │                        └─► Save both in DB ──► HTTP 200 OK
          │
          └── 'Rejected' ──► Claim.status = 'Rejected'
                             Item.status remains 'Active' (Rule 5)
                             Save in DB ──► HTTP 200 OK
```

```
[User Cancels Claim (PUT /api/claims/:id/cancel)]
               │
               ▼
  [Is User the Claim Owner?] ──No──► HTTP 403 Forbidden
               │ Yes
               ▼
  [Is Claim Status 'Pending'?] ──No──► HTTP 400 "Only pending claims can be cancelled"
               │ Yes
               ▼
  Claim.status = 'Cancelled'
  Item.status remains 'Active' (Rule 6)
  Save in DB ──► HTTP 200 OK
```

---

## M. API Endpoint Table

| Method | Endpoint | Access / Auth | Request Body | Status Codes | Description |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | `{ name, email, password }` | 201, 400, 409 | Register new user |
| `POST` | `/api/auth/login` | Public | `{ email, password }` | 200, 400, 401 | Authenticate & get JWT |
| `GET` | `/api/auth/me` | Authenticated | None | 200, 401 | Get current user profile |
| `GET` | `/api/items` | Authenticated | Query: `?type=Lost\|Found&category=...` | 200, 401 | Get all active items |
| `GET` | `/api/items/:id` | Authenticated | None | 200, 404 | Get single item details |
| `POST` | `/api/items` | Authenticated | `multipart/form-data` (title, description, category, location, dateReported, itemType, image file) | 201, 400, 401 | Create lost/found item |
| `PUT` | `/api/items/:id` | Authenticated (Owner / Admin) | Partial/Full item fields or image | 200, 400, 403, 404 | Update item |
| `DELETE` | `/api/items/:id` | Authenticated (Owner / Admin) | None | 200, 403, 404 | Delete item |
| `POST` | `/api/claims` | Authenticated | `{ itemId, message }` | 201, 400, 401, 404, 409 | Submit claim on Found item |
| `GET` | `/api/claims` | Authenticated (User / Admin) | Query: `?status=Pending` | 200, 401 | List claims (user's or all if admin) |
| `GET` | `/api/claims/:id` | Authenticated (Owner / Admin) | None | 200, 403, 404 | Get single claim details |
| `PUT` | `/api/claims/:id/status` | Admin Only | `{ status: 'Approved' \| 'Rejected' }` | 200, 400, 403, 404 | Review & change claim status |
| `PUT` | `/api/claims/:id/cancel` | Authenticated (Owner) | None | 200, 400, 403, 404 | Cancel a pending claim |
| `DELETE` | `/api/claims/:id` | Authenticated (Owner / Admin) | None | 200, 403, 404 | Delete a claim |
| `GET` | `/api/health` | Public | None | 200 | Health check for deployment |

### Standard Response Format:
- **Success**:
  ```json
  {
    "success": true,
    "message": "Claim submitted successfully",
    "data": { ... }
  }
  ```
- **Error**:
  ```json
  {
    "success": false,
    "message": "Only found items can be claimed."
  }
  ```

---

## N. Backend Folder Structure

```
backend/
├── config/
│   └── db.js                       # Mongoose connection & error logging
├── controllers/
│   ├── authController.js           # Register, login, getMe
│   ├── itemController.js           # CRUD operations for Items
│   └── claimController.js          # CRUD & business logic for Claims
├── middleware/
│   ├── authMiddleware.js           # JWT verification & req.user attachment
│   ├── adminMiddleware.js          # Restricts route to isAdmin === true
│   ├── uploadMiddleware.js         # Multer configuration, storage & file filter
│   ├── validationMiddleware.js     # Body validation helpers
│   └── errorMiddleware.js          # Centralized error handler (404 & 500)
├── models/
│   ├── User.js                     # User schema with bcrypt hooks
│   ├── Item.js                     # Item schema
│   └── Claim.js                    # Claim schema
├── routes/
│   ├── authRoutes.js               # /api/auth routes
│   ├── itemRoutes.js               # /api/items routes
│   └── claimRoutes.js              # /api/claims routes
├── uploads/                        # Static local directory for uploaded images
├── utils/
│   └── generateToken.js            # JWT signing utility
├── .env                            # Local environment variables
├── .env.example                    # Template environment variables
├── .gitignore                      # Ignores node_modules, .env, uploads/*
├── package.json                    # Dependencies & scripts
└── server.js                       # Express app initialization & listener
```

---

## O. React Native Folder Structure

```
mobile/
├── src/
│   ├── components/
│   │   ├── ItemCard.js             # Item card component for lists
│   │   ├── ClaimCard.js            # Claim card component
│   │   ├── StatusBadge.js          # Styled badge (Active, Claimed, Pending, etc.)
│   │   ├── LoadingView.js          # Centered activity indicator
│   │   ├── EmptyState.js           # Graphic & descriptive empty message
│   │   └── CustomButton.js         # Rounded brand button with loading state
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.js     # Session check splash
│   │   │   ├── LoginScreen.js      # Login screen with demo autofill
│   │   │   └── RegisterScreen.js   # Registration screen
│   │   ├── home/
│   │   │   └── HomeScreen.js       # Campus dashboard & quick actions
│   │   ├── items/
│   │   │   ├── ItemListScreen.js   # Searchable & filterable item list
│   │   │   ├── ItemDetailsScreen.js# Complete item view & "Claim" trigger
│   │   │   ├── CreateItemScreen.js # Form to report lost/found item
│   │   │   └── EditItemScreen.js   # Form to edit existing report
│   │   ├── claims/
│   │   │   ├── CreateClaimScreen.js# Verification proof form
│   │   │   ├── MyClaimsScreen.js   # List of student's submitted claims
│   │   │   └── ClaimDetailsScreen.js# Detailed claim breakdown & cancellation
│   │   ├── admin/
│   │   │   ├── AdminClaimsScreen.js# Review list with Approve/Reject modal
│   │   │   └── AdminItemManagementScreen.js # Audit items & status resolution
│   │   └── profile/
│   │       └── ProfileScreen.js    # User info, stats, API status, & logout
│   ├── navigation/
│   │   ├── AuthNavigator.js        # Stack: Login, Register
│   │   ├── AppNavigator.js         # Bottom Tab + Stacks for Main app
│   │   └── RootNavigator.js        # Switcher between Auth and App based on token
│   ├── services/
│   │   ├── api.js                  # Axios instance with interceptors for JWT
│   │   ├── authService.js          # login, register, getMe calls
│   │   ├── itemService.js          # getItems, getItemById, createItem, updateItem, deleteItem
│   │   └── claimService.js         # getClaims, createClaim, updateStatus, cancelClaim
│   ├── context/
│   │   └── AuthContext.js          # React Context providing user, token, login, logout
│   ├── utils/
│   │   ├── validation.js           # Client-side input validation regex
│   │   ├── storage.js              # AsyncStorage wrappers for token & user
│   │   └── colors.js               # Theme palette (Primary deep blue, teal, etc.)
│   └── config.js                   # API_BASE_URL configuration (hosted/local)
├── App.js                          # Main entry point wrapped in AuthProvider
├── app.json                        # Expo/React Native configuration
└── package.json                    # Dependencies & scripts
```

---

## P. Authentication Flow

```
[Mobile App]                                    [Express Backend]                 [MongoDB]
     │                                                  │                             │
     ├─ 1. POST /api/auth/login {email, password} ────►│                             │
     │                                                  ├─ 2. Find user by email ────►│
     │                                                  │◄── User record returned ────┤
     │                                                  ├─ 3. bcrypt.compare()        │
     │                                                  │     (password vs hash)      │
     │                                                  ├─ 4. jwt.sign({id, isAdmin}) │
     │◄─ 5. Response 200 {token, user} ─────────────────┤                             │
     │                                                  │                             │
     ├─ 6. AsyncStorage.setItem('token', token)         │                             │
     ├─ 7. Set AuthContext {user, token}                │                             │
     │                                                  │                             │
  (Subsequent Protected Requests)                       │                             │
     │                                                  │                             │
     ├─ 8. Axios Interceptor attaches:                  │                             │
     │     Authorization: Bearer <token>                │                             │
     │─────────────────────────────────────────────────►│                             │
     │                                                  ├─ 9. authMiddleware checks:  │
     │                                                  │     jwt.verify(token)       │
     │                                                  ├─ 10. Fetch user object ────►│
     │                                                  │◄──── User attached to req ──┤
     │                                                  ├─ 11. Controller executes    │
     │◄─ 12. Response 200 / 201 ────────────────────────┤                             │
```

---

## Q. Image Upload Flow

```
[React Native Client]                          [Node.js / Multer Server]         [Disk / Storage]
     │                                                   │                              │
     ├─ 1. User picks image using ImagePicker            │                              │
     ├─ 2. Validates image locally (file size, uri)     │                              │
     ├─ 3. Constructs FormData:                          │                              │
     │     formData.append('image', {                    │                              │
     │        uri: photo.uri,                            │                              │
     │        name: 'item_photo.jpg',                    │                              │
     │        type: 'image/jpeg'                         │                              │
     │     })                                            │                              │
     │     formData.append('title', 'Blue Backpack')     │                              │
     │     ...                                           │                              │
     ├─ 4. POST /api/items (multipart/form-data) ───────►│                              │
     │                                                   ├─ 5. Multer intercepts        │
     │                                                   │     - Checks MIME type       │
     │                                                   │     - Checks file size <=5MB │
     │                                                   │     - Generates safe filename│
     │                                                   ├─ 6. Saves to /uploads ──────►│
     │                                                   ├─ 7. Controller creates URL:  │
     │                                                   │     imageUrl = `/uploads/...`│
     │                                                   ├─ 8. Saves Item in Mongo ────►[MongoDB]
     │◄─ 9. Returns 201 { success: true, data: item } ───┤                              │
     │                                                   │                              │
  (Displaying Image)                                     │                              │
     ├─ 10. `<Image source={{ uri: `${BASE_URL}${item.image}` }} />`                    │
     │──────────────────────────────────────────────────►│ (Express static serves file) │
```

---

## R. System Architecture

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
│  │ Business Logic: Found only, Active only, Dedupe, │  │
│  │                 Approve/Reject Status Consistency│  │
│  └────────────────────────┬─────────────────────────┘  │
│                           ▼                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Mongoose Models: User, Item, Claim               │  │
│  └────────────────────────┬─────────────────────────┘  │
└───────────────────────────┼────────────────────────────┘
                            │ Mongo Wire Protocol (TLS)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  MongoDB Atlas                         │
│            (Cloud Database Cluster)                    │
│   [Users Collection] [Items Collection] [Claims Coll]  │
└────────────────────────────────────────────────────────┘
```

---

## S. Deployment Architecture

```
   ┌────────────────────────────────┐
   │       MongoDB Atlas            │
   │  Cloud Mongo Replica Set       │
   │  (Whitelisted 0.0.0.0/0 IP)    │
   └──────────────▲─────────────────┘
                  │ Mongoose Connection URI
                  │
   ┌──────────────┴─────────────────┐
   │ Render / Railway Web Service   │
   │  - Node.js runtime             │
   │  - Environment: PORT, MONGO_URI│
   │    JWT_SECRET, BASE_URL        │
   │  - Express static files        │
   │  - Health Endpoint: /api/health│
   └──────────────▲─────────────────┘
                  │ HTTPS REST Requests
                  │
   ┌──────────────┴─────────────────┐
   │ React Native Mobile App        │
   │  - Configured with Production  │
   │    API_BASE_URL (Render URL)   │
   │  - Tested on Android / Expo Go │
   └────────────────────────────────┘
```

---

## T. 12-Phase Implementation Plan

### PHASE 1: Project Setup & Environment Configuration
- **Objective**: Establish the workspace repository structure, configure root dependencies for backend, create `.env` and `.env.example`, configure CORS, and prepare the project foundation.
- **Files to create**:
  - `backend/server.js`
  - `backend/package.json`
  - `backend/.env`
  - `backend/.env.example`
  - `backend/.gitignore`
  - `backend/config/db.js`
- **Files to modify**: None.
- **Dependencies**: `express`, `dotenv`, `cors`, `mongoose`
- **API Endpoints**: `GET /api/health`
- **Database changes**: None yet.
- **Implementation steps**:
  1. Initialize `backend/package.json`.
  2. Setup `server.js` with Express, JSON body parsing, and CORS.
  3. Create health check endpoint `GET /api/health`.
  4. Write environment variables template in `.env.example`.
- **Expected result**: Running `node server.js` boots the server on specified PORT, responding with HTTP 200 on `/api/health`.
- **Verification steps**: Execute `curl http://localhost:5000/api/health` and verify `{"success": true, "message": "CampusConnect API is running"}`.
- **Possible errors & resolutions**:
  - *Port in use (EADDRINUSE)*: Fallback to an alternate port via `process.env.PORT || 5000`.

---

### PHASE 2: Database Connection & Schema Modeling
- **Objective**: Establish reliable connection to MongoDB Atlas, implement the Mongoose schemas for `User`, `Item`, and `Claim`, and establish explicit relational references (`reportedBy`, `itemId`, `userId`).
- **Files to create**:
  - `backend/config/db.js`
  - `backend/models/User.js`
  - `backend/models/Item.js`
  - `backend/models/Claim.js`
- **Files to modify**: `backend/server.js` (integrate db connection).
- **Dependencies**: `mongoose`, `bcryptjs`
- **API Endpoints**: None.
- **Database changes**: Collections created in MongoDB Atlas: `users`, `items`, `claims`.
- **Implementation steps**:
  1. Write connection logic with Mongoose in `config/db.js` with graceful error logging.
  2. Define `User` schema with fields: `name`, `email`, `password`, `isAdmin`.
  3. Define `Item` schema with fields: `title`, `description`, `category`, `location`, `dateReported`, `itemType`, `image`, `status`, `reportedBy` (Ref User).
  4. Define `Claim` schema with fields: `itemId` (Ref Item), `userId` (Ref User), `message`, `claimDate`, `status`.
- **Expected result**: Database connects successfully upon server startup without deprecation warnings.
- **Verification steps**: Run server and check console for `"MongoDB Connected: <cluster-name>"`.
- **Possible errors & resolutions**:
  - *MongoNetworkError / IP Whitelist*: Ensure 0.0.0.0/0 is configured in MongoDB Atlas Network Access.

---

### PHASE 3: Authentication & Authorization System
- **Objective**: Implement secure user registration, password hashing with `bcrypt`, login with JWT generation, and role-based middleware (`authMiddleware`, `adminMiddleware`).
- **Files to create**:
  - `backend/controllers/authController.js`
  - `backend/routes/authRoutes.js`
  - `backend/middleware/authMiddleware.js`
  - `backend/middleware/adminMiddleware.js`
  - `backend/utils/generateToken.js`
- **Files to modify**: `backend/server.js` (mount `/api/auth`).
- **Dependencies**: `jsonwebtoken`, `bcryptjs`
- **API Endpoints**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- **Database changes**: User documents stored in `users` collection.
- **Implementation steps**:
  1. Create `generateToken.js` using `jwt.sign({ id, isAdmin }, secret, { expiresIn: '30d' })`.
  2. Write `registerUser` with email uniqueness verification and password hashing.
  3. Write `loginUser` with `bcrypt.compare` returning user info (omitting password) and JWT.
  4. Build `authMiddleware` to extract Bearer token, decode it, and attach `req.user`.
  5. Build `adminMiddleware` to verify `req.user.isAdmin === true`.
- **Expected result**: Users can register and login; protected routes reject unauthenticated requests with 401.
- **Verification steps**: Test registration, login, and `/api/auth/me` using Postman/curl.
- **Possible errors & resolutions**:
  - *Token expired / invalid*: `authMiddleware` returns structured 401 response `"Not authorized, token failed"`.

---

### PHASE 4: Item Entity Complete CRUD
- **Objective**: Implement complete CRUD endpoints for the primary entity `Item`, allowing students and admins to report, view, filter, update, and delete lost/found items.
- **Files to create**:
  - `backend/controllers/itemController.js`
  - `backend/routes/itemRoutes.js`
- **Files to modify**: `backend/server.js` (mount `/api/items`).
- **Dependencies**: None additional.
- **API Endpoints**:
  - `POST /api/items` (Create)
  - `GET /api/items` (Read all with query filtering: `type`, `category`, `search`)
  - `GET /api/items/:id` (Read one with populated `reportedBy`)
  - `PUT /api/items/:id` (Update by owner or admin)
  - `DELETE /api/items/:id` (Delete by owner or admin)
- **Database changes**: Documents inserted and updated in `items` collection.
- **Implementation steps**:
  1. Build `getItems` supporting filtering by `itemType` and `category`.
  2. Build `getItemById` returning complete details with reporter populated (`name`, `email`).
  3. Build `createItem` setting `reportedBy = req.user._id` and `status = 'Active'`.
  4. Build `updateItem` checking authorization (`item.reportedBy.equals(req.user._id) || req.user.isAdmin`).
  5. Build `deleteItem` with identical authorization check.
- **Expected result**: Complete CRUD operations operational on `Item` entity.
- **Verification steps**: Create an item as user A, read it, update as user A, verify user B cannot update it without admin privileges.
- **Possible errors & resolutions**:
  - *CastError on invalid ObjectId*: Return clean HTTP 404 instead of raw 500 error.

---

### PHASE 5: Claim Entity Complete CRUD
- **Objective**: Implement complete CRUD endpoints for the related entity `Claim`, linking claims directly to `Item` and `User`.
- **Files to create**:
  - `backend/controllers/claimController.js`
  - `backend/routes/claimRoutes.js`
- **Files to modify**: `backend/server.js` (mount `/api/claims`).
- **Dependencies**: None additional.
- **API Endpoints**:
  - `POST /api/claims` (Create claim)
  - `GET /api/claims` (Read user claims, or all pending claims if admin)
  - `GET /api/claims/:id` (Read single claim with populated `itemId` and `userId`)
  - `PUT /api/claims/:id` (Update claim details / message by owner)
  - `DELETE /api/claims/:id` (Delete claim by owner or admin)
- **Database changes**: Documents inserted in `claims` collection referencing `items` and `users`.
- **Implementation steps**:
  1. Build `createClaim` linking `req.body.itemId` and `req.user._id`.
  2. Build `getClaims` dynamically filtering by `userId` for students, or showing all for admins.
  3. Build `getClaimById` with `.populate('itemId')` and `.populate('userId')`.
  4. Build update and delete handlers verifying ownership.
- **Expected result**: Claims can be created, viewed with populated relational item data, and deleted.
- **Verification steps**: Submit a claim for an item and verify `itemId` references the exact `Item` document.
- **Possible errors & resolutions**:
  - *Orphaned claims*: Verify `itemId` actually exists before creating a claim document.

---

### PHASE 6: Core Business Logic Implementation
- **Objective**: Enforce all 7 core business rules at the backend controller level, guaranteeing system integrity and assignment compliance.
- **Files to create**: None.
- **Files to modify**:
  - `backend/controllers/claimController.js`
  - `backend/routes/claimRoutes.js`
- **Dependencies**: None additional.
- **API Endpoints**:
  - `PUT /api/claims/:id/status` (Admin approve / reject)
  - `PUT /api/claims/:id/cancel` (User cancel)
- **Database changes**: Item status transitions (`Active` -> `Claimed`), Claim status transitions (`Pending` -> `Approved`, `Rejected`, `Cancelled`).
- **Implementation steps**:
  1. **Rule 1 & 2 Check**: In `createClaim`, fetch `item`. If `item.itemType !== 'Found'`, return HTTP 400 `"Only found items can be claimed."`. If `item.status !== 'Active'`, return HTTP 400 `"Item is not active and cannot be claimed."`.
  2. **Rule 3 Check**: Query `Claim.findOne({ itemId, userId, status: 'Pending' })`. If found, return HTTP 409 `"You already have a pending claim for this item."`.
  3. **Rule 4 & 7 (Approve)**: In `updateClaimStatus`, if `status === 'Approved'`: verify claim is `Pending` and item is `Active`. Set `claim.status = 'Approved'` and `item.status = 'Claimed'`. Save both.
  4. **Rule 5 (Reject)**: If `status === 'Rejected'`: set `claim.status = 'Rejected'`. Keep `item.status = 'Active'`.
  5. **Rule 6 (Cancel)**: In `cancelClaim`: ensure claimant is `req.user._id` and claim is `Pending`. Set `claim.status = 'Cancelled'`. Item remains `Active`.
- **Expected result**: All state transitions conform to rules, and invalid operations are rejected with explicit HTTP error codes.
- **Verification steps**: Test all 7 scenarios using Postman to confirm exact status code and error messages.
- **Possible errors & resolutions**:
  - *Race conditions / inconsistent state*: Save claim and item sequentially; verify both operations succeed.

---

### PHASE 7: Image Upload Handling with Multer
- **Objective**: Implement robust image upload using Multer, validating MIME types and file sizes, storing files, and serving them as accessible static assets.
- **Files to create**:
  - `backend/middleware/uploadMiddleware.js`
  - `backend/uploads/` (directory)
- **Files to modify**:
  - `backend/server.js` (serve static `/uploads`)
  - `backend/routes/itemRoutes.js` (attach upload middleware to POST and PUT)
  - `backend/controllers/itemController.js` (attach file path to item image field)
- **Dependencies**: `multer`, `path`
- **API Endpoints**: `POST /api/items` (multipart/form-data)
- **Database changes**: `image` field in `Item` document populated with relative URI (e.g. `/uploads/image-1711234567.jpg`).
- **Implementation steps**:
  1. Configure `multer.diskStorage` to save files with unique timestamps and original extensions into `uploads/`.
  2. Implement `fileFilter` allowing only `image/jpeg`, `image/png`, and `image/webp`.
  3. Set file size limit to 5MB (5 * 1024 * 1024 bytes).
  4. Add `express.static(path.join(__dirname, 'uploads'))` in `server.js`.
  5. In `createItem`, if `req.file` exists, store `/uploads/${req.file.filename}` into `item.image`.
- **Expected result**: Images upload cleanly, non-image files are rejected with HTTP 400, and images are accessible via HTTP.
- **Verification steps**: Upload an image via multipart form data and open `http://localhost:5000/uploads/<filename>` in browser.
- **Possible errors & resolutions**:
  - *Multer file size limit exceeded*: Catch `MulterError` in error middleware and return friendly message `"File size cannot exceed 5MB"`.

---

### PHASE 8: React Native UI & Navigation Setup
- **Objective**: Create the complete mobile frontend structure, set up React Navigation (AuthStack, AppStack, Tabs), establish the visual design system, and implement reusable UI components.
- **Files to create**:
  - `mobile/App.js`
  - `mobile/src/navigation/RootNavigator.js`
  - `mobile/src/navigation/AuthNavigator.js`
  - `mobile/src/navigation/AppNavigator.js`
  - `mobile/src/context/AuthContext.js`
  - `mobile/src/utils/colors.js`
  - `mobile/src/components/ItemCard.js`
  - `mobile/src/components/ClaimCard.js`
  - `mobile/src/components/StatusBadge.js`
  - `mobile/src/components/LoadingView.js`
  - `mobile/src/components/EmptyState.js`
  - `mobile/src/components/CustomButton.js`
  - All 14 screen scaffold files under `mobile/src/screens/`
- **Files to modify**: None.
- **Dependencies**: `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`, `react-native-safe-area-context`, `react-native-screens`
- **API Endpoints**: None (UI scaffold).
- **Database changes**: None.
- **Implementation steps**:
  1. Set up color palette (Deep campus blue `#1E3A8A`, Cyan `#06B6D4`, Green `#10B981`, Red `#EF4444`, Neutral light background `#F8FAFC`).
  2. Build reusable UI components (`StatusBadge`, `ItemCard`, `ClaimCard`, `EmptyState`, `LoadingView`).
  3. Configure `AuthNavigator` for Login and Register.
  4. Configure `AppNavigator` with Bottom Tabs (`Home`, `Items`, `My Claims`, `Profile`) and nested detail screens.
  5. Configure `RootNavigator` to switch dynamically based on `AuthContext.token`.
- **Expected result**: Clean navigation between all screens with responsive mobile styling.
- **Verification steps**: Launch app and navigate through all tabs and dummy screens.
- **Possible errors & resolutions**:
  - *Missing gesture handler or safe area context*: Ensure all peer dependencies are properly wrapped at root.

---

### PHASE 9: Mobile API Integration & Context Management
- **Objective**: Connect the React Native application to the backend API via Axios, manage JWT authentication state in `AuthContext` with `AsyncStorage`, and implement data fetching across all screens.
- **Files to create**:
  - `mobile/src/config.js`
  - `mobile/src/services/api.js`
  - `mobile/src/services/authService.js`
  - `mobile/src/services/itemService.js`
  - `mobile/src/services/claimService.js`
  - `mobile/src/utils/storage.js`
- **Files to modify**:
  - `mobile/src/context/AuthContext.js`
  - `mobile/src/screens/auth/LoginScreen.js`
  - `mobile/src/screens/auth/RegisterScreen.js`
  - `mobile/src/screens/home/HomeScreen.js`
  - `mobile/src/screens/items/ItemListScreen.js`
  - `mobile/src/screens/items/ItemDetailsScreen.js`
  - `mobile/src/screens/claims/MyClaimsScreen.js`
  - `mobile/src/screens/claims/ClaimDetailsScreen.js`
- **Dependencies**: `axios`, `@react-native-async-storage/async-storage`
- **API Endpoints**: All `/api/auth`, `/api/items`, `/api/claims` endpoints.
- **Database changes**: None.
- **Implementation steps**:
  1. Configure Axios instance in `services/api.js` with request interceptor injecting `Authorization: Bearer <token>`.
  2. Implement `AuthContext` methods: `login`, `register`, `logout`, and auto-login on app launch from `AsyncStorage`.
  3. Implement API service calls in `authService.js`, `itemService.js`, and `claimService.js`.
  4. Wire `HomeScreen`, `ItemListScreen`, `ItemDetailsScreen`, and `MyClaimsScreen` with real API data, loading spinners, and refresh control.
- **Expected result**: Complete dynamic communication between mobile app and backend. No hardcoded mock data.
- **Verification steps**: Log in on mobile, see real items populated from MongoDB, tap an item to see its live details.
- **Possible errors & resolutions**:
  - *Network Error on Android*: Ensure proper network IP is configured or production URL is used rather than `localhost`.

---

### PHASE 10: Mobile Forms, Image Picking & Claim Processing
- **Objective**: Implement item reporting with image picker and multipart upload, claim submission modal/screen, and admin approval/rejection actions inside the mobile app.
- **Files to modify**:
  - `mobile/src/screens/items/CreateItemScreen.js`
  - `mobile/src/screens/items/EditItemScreen.js`
  - `mobile/src/screens/claims/CreateClaimScreen.js`
  - `mobile/src/screens/admin/AdminClaimsScreen.js`
  - `mobile/src/screens/admin/AdminItemManagementScreen.js`
- **Dependencies**: `expo-image-picker` or `react-native-image-picker`
- **API Endpoints**: `POST /api/items`, `POST /api/claims`, `PUT /api/claims/:id/status`, `PUT /api/claims/:id/cancel`
- **Database changes**: New item with image, new claim, and status transitions recorded.
- **Implementation steps**:
  1. Add image picker to `CreateItemScreen`, converting selected asset to `FormData`.
  2. Submit multipart request to backend and redirect on success.
  3. In `ItemDetailsScreen`, display "Claim This Item" button only if `itemType === 'Found'` and `status === 'Active'`.
  4. In `CreateClaimScreen`, take proof message and submit claim.
  5. In `AdminClaimsScreen`, list pending claims with "Approve" and "Reject" buttons triggering confirmation alerts and updating API state.
- **Expected result**: Users can upload items with images, file claims, and admins can approve/reject claims inside the mobile app.
- **Verification steps**: Post a found item with a photo on mobile, log in as another student, submit a claim, switch to admin, approve it, and verify item status updates to `Claimed`.
- **Possible errors & resolutions**:
  - *Network payload format*: Ensure `Content-Type: multipart/form-data` is used when image is present.

---

### PHASE 11: Validation, Error Handling & Centralized Middleware
- **Objective**: Implement comprehensive client-side and server-side validation, error middleware, and friendly alert banners.
- **Files to create**:
  - `backend/middleware/errorMiddleware.js`
  - `backend/middleware/validationMiddleware.js`
- **Files to modify**:
  - `backend/server.js` (attach centralized error handler)
  - Mobile screens (attach validation states and inline error hints)
- **Dependencies**: None additional.
- **API Endpoints**: All endpoints benefit from consistent error formatting.
- **Database changes**: None.
- **Implementation steps**:
  1. Build Express error handler mapping Mongoose `ValidationError`, `CastError` (404), duplicate key `code: 11000` (409), and 500s.
  2. Enforce standard response shape `{ success: false, message: "..." }`.
  3. On mobile, add validation before submission (e.g. non-empty title, valid email format, minimum password length).
  4. Display user-friendly snackbars or alert banners for backend rejection messages.
- **Expected result**: Graceful error handling across both client and server; no app crashes or raw stack trace leaks.
- **Verification steps**: Attempt duplicate registration or duplicate claim and verify proper friendly error message displays.
- **Possible errors & resolutions**:
  - *Unhandled promise rejections*: Wrap all async controller code with `express-async-handler` or try-catch blocks passing to `next(error)`.

---

### PHASE 12: Deployment, Final Testing & Viva Preparation
- **Objective**: Deploy Node.js backend to Render/Railway, connect to hosted MongoDB Atlas cluster, update mobile `API_BASE_URL` to the live hosted API, perform full end-to-end verification, and create documentation.
- **Files to create**:
  - `README.md` (complete project report, architecture diagrams, API tables, viva Q&A)
  - `render.yaml` or deployment configuration file
- **Files to modify**:
  - `mobile/src/config.js` (switch to production hosted API endpoint)
- **Dependencies**: None.
- **API Endpoints**: Production URL verification on Render/Railway.
- **Database changes**: Production data seeded in MongoDB Atlas.
- **Implementation steps**:
  1. Create Render web service linked to repository.
  2. Configure environment variables in Render: `NODE_ENV=production`, `PORT=10000`, `MONGO_URI=<atlas_connection>`, `JWT_SECRET=<strong_secret>`, `BASE_URL=<render_domain>`.
  3. Verify `GET https://campusconnect-api.onrender.com/api/health` returns HTTP 200.
  4. Point mobile `config.js` to production URL.
  5. Conduct complete verification checklist (Register -> Report Item -> Upload Photo -> Browse -> Claim -> Admin Review -> Approval -> Status Verification).
  6. Finalize `README.md` with complete viva preparation notes.
- **Expected result**: A live, hosted full-stack academic project ready for immediate examiner demonstration.
- **Verification steps**: Test entire mobile flow using the hosted API without running any local servers.
- **Possible errors & resolutions**:
  - *Cold-start delay on free Render tier*: Include a small health-check check on mobile splash screen with friendly loader.

---

## U. Assignment Compliance Checklist

| SE2020 Specification Requirement | Implementation Plan Coverage | Compliance Status |
|---|---|:---:|
| **Technology Stack** | React Native (JS + Hooks), Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcrypt, Multer | ✅ 100% Compliant |
| **No Firebase Backend** | Strictly uses custom Express.js REST API + MongoDB Atlas | ✅ 100% Compliant |
| **Primary Entity (Item)** | Full CRUD: Create, Read All, Read One, Update, Delete with populated reporter | ✅ 100% Compliant |
| **Related Entity (Claim)** | Full CRUD: Create, Read, Update, Delete with `itemId` and `userId` Mongoose references | ✅ 100% Compliant |
| **Relational Integrity** | `Claim.itemId` references `Item._id`; `Claim.userId` references `User._id` | ✅ 100% Compliant |
| **Image Upload** | Multer with file type & size validation, public URL generation, mobile display | ✅ 100% Compliant |
| **Rule 1: Only Found Items Claimable** | Backend validation rejects claims on `Lost` items with HTTP 400 | ✅ 100% Compliant |
| **Rule 2: Active Item Required** | Backend validation rejects claims on non-Active items with HTTP 400 | ✅ 100% Compliant |
| **Rule 3: Deduplicate Pending Claims** | Backend prevents duplicate pending claims per user/item with HTTP 409 | ✅ 100% Compliant |
| **Rule 4: Approve Claim Logic** | Admin approval transitions Claim -> `Approved` and Item -> `Claimed` | ✅ 100% Compliant |
| **Rule 5: Reject Claim Logic** | Admin rejection transitions Claim -> `Rejected`, Item remains `Active` | ✅ 100% Compliant |
| **Rule 6: Cancel Claim Logic** | User cancellation transitions Claim -> `Cancelled`, Item remains `Active` | ✅ 100% Compliant |
| **Rule 7: Claimed Item Locking** | Approved/Claimed items strictly reject new claims | ✅ 100% Compliant |
| **Mobile Authentication** | JWT Bearer authentication, protected routes, `AsyncStorage` persistence | ✅ 100% Compliant |
| **Admin in Mobile** | Admin management screens directly inside React Native; NO web admin panel | ✅ 100% Compliant |
| **14 Screens** | All 14 specified mobile screens designed and integrated | ✅ 100% Compliant |
| **Clean Architecture** | Controller-Service-Route structure, readable code, academic friendly | ✅ 100% Compliant |
| **Hosted Backend** | Deployment-ready with Render/Railway + Atlas URI + live mobile integration | ✅ 100% Compliant |

---

## V. Potential Viva Questions & Detailed Answers

### 1. Architectural & General Questions
- **Q1: Explain the high-level architecture of your application.**
  - *Answer*: CampusConnect follows a 3-tier client-server architecture:
    1. **Mobile Frontend**: React Native application utilizing Functional Components, React Hooks (`useState`, `useEffect`, `useContext`), and React Navigation.
    2. **Backend REST API**: Node.js and Express.js server organized into modular Routes, Controllers, Middleware, and Models.
    3. **Database Layer**: MongoDB Atlas cloud cluster modeled with Mongoose schemas featuring explicit relational references.
- **Q2: Why did you choose MongoDB and Mongoose for this application?**
  - *Answer*: MongoDB offers flexible, JSON-native document storage which aligns naturally with JavaScript in Node.js and React Native. Mongoose provides an Object Data Modeling (ODM) layer that introduces strict schema enforcement, data validation, lifecycle middleware (such as password hashing hooks), and relational document population (`.populate()`).

---

### 2. Authentication & Security Questions
- **Q3: How is authentication implemented, and how does the server verify user identity?**
  - *Answer*: We use JSON Web Tokens (JWT) and `bcryptjs`. During registration/login:
    1. The user's plaintext password is encrypted using `bcrypt.hash()` with 10 salt rounds.
    2. On login, `bcrypt.compare()` validates the credentials.
    3. Upon success, the server signs a JWT containing the user's `id` and `isAdmin` flag using a private server secret (`JWT_SECRET`).
    4. The mobile app stores this token in `AsyncStorage`.
    5. For protected requests, an Axios interceptor attaches the token in the HTTP header: `Authorization: Bearer <token>`.
    6. `authMiddleware` extracts and verifies the token using `jwt.verify()`, fetches the user document, and attaches it to `req.user`.
- **Q4: Why should password hashes never be returned to the client, even though they are encrypted?**
  - *Answer*: Returning password hashes exposes them to offline brute-force or dictionary attacks (e.g. using rainbow tables). We ensure the user model excludes the password field during queries (`.select('-password')`).

---

### 3. Database & Relational Modeling Questions
- **Q5: MongoDB is a NoSQL document database. How do you implement entity relationships between Item and Claim?**
  - *Answer*: We use MongoDB document references (similar to foreign keys in relational databases). In the `Claim` schema:
    ```javascript
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true }
    ```
    When querying claims, we use Mongoose's `.populate('itemId')` method. This dynamically performs a secondary query under the hood to substitute the ObjectId with the actual matching `Item` document.
- **Q6: Why is User not counted as one of the two core entities in the assignment?**
  - *Answer*: As per SE2020 specifications, User is the authentication/system entity. The two core business domain entities are `Item` (Primary Entity) and `Claim` (Related Entity), fulfilling the 1:N relationship requirement.

---

### 4. Business Logic & Data Consistency Questions
- **Q7: What happens to an item when a claim is approved? Explain the state transition.**
  - *Answer*: When an administrator approves a pending claim via `PUT /api/claims/:id/status`, the backend executes two state updates:
    1. `Claim.status` changes from `Pending` to `Approved`.
    2. The associated `Item.status` changes from `Active` to `Claimed`.
    Because the item is now marked `Claimed`, any subsequent claim requests targeting this item are blocked by Rule 2 and Rule 7.
- **Q8: Why must business logic rules be enforced on the backend rather than solely on the React Native frontend?**
  - *Answer*: Frontend validation provides immediate user feedback and enhances user experience, but it cannot be trusted for security or data integrity. Any client can bypass the mobile UI by making direct HTTP requests via Postman or curl. Enforcing rules in Express controllers ensures that invalid claims or unauthorized actions are rejected at the server level.
- **Q9: How do you prevent a user from submitting duplicate pending claims for the same item?**
  - *Answer*: Before creating a claim, `claimController.createClaim` executes:
    ```javascript
    const existingClaim = await Claim.findOne({
      itemId,
      userId: req.user._id,
      status: 'Pending'
    });
    if (existingClaim) {
      return res.status(409).json({ success: false, message: 'You already have a pending claim for this item.' });
    }
    ```

---

### 5. Image Upload & File Handling Questions
- **Q10: Explain the complete lifecycle of an image from mobile selection to database storage.**
  - *Answer*:
    1. The student selects an image using the mobile device's media library via an Image Picker.
    2. React Native wraps the file into a `FormData` object with URI, name, and MIME type.
    3. The client issues a `POST` request with `Content-Type: multipart/form-data`.
    4. On the backend, `uploadMiddleware` (configured with Multer) intercepts the stream, validates the file format (JPEG/PNG/WEBP) and file size (<= 5MB), and writes the file to the `uploads/` directory on disk.
    5. The controller saves the relative path (e.g. `/uploads/item-123.jpg`) in the `image` field of the `Item` MongoDB document.
    6. Express serves the `uploads/` directory statically so the mobile app can display it using `<Image source={{ uri: `${BASE_URL}${item.image}` }} />`.

---

### 6. Mobile Application & State Management Questions
- **Q11: How is user session maintained across app restarts in React Native?**
  - *Answer*: We use `@react-native-async-storage/async-storage` combined with React's `Context API`. On app launch, `SplashScreen` invokes an initialization routine in `AuthContext` that reads the stored JWT and user object from `AsyncStorage`. If present and valid, the user state is set and `RootNavigator` directs the user to `AppStack`; otherwise, it directs to `AuthNavigator`.
- **Q12: How do you handle authorization between Students and Administrators in the mobile app?**
  - *Answer*: The `User` object includes an `isAdmin` boolean property stored in `AuthContext`. The UI conditionally renders administrative navigation items (e.g. "Review Claims") and action buttons. Furthermore, all administrative API routes are protected by `adminMiddleware`, ensuring unauthorized requests are rejected with HTTP 403 Forbidden.

---

### 7. Deployment Questions
- **Q13: How is the backend deployed, and how does the mobile app communicate with it?**
  - *Answer*: The Node.js/Express server is hosted on a cloud PaaS (such as Render or Railway) with environment variables (`MONGO_URI`, `JWT_SECRET`, `BASE_URL`). MongoDB Atlas hosts the database cluster. The React Native app's configuration file (`config.js`) defines `API_BASE_URL` pointing to the public HTTPS domain (e.g., `https://campusconnect-api.onrender.com/api`).
