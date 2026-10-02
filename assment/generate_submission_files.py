import os
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Font loader with fallbacks
def get_font(size, bold=False):
    font_path = "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf"
    try:
        return ImageFont.truetype(font_path, size)
    except Exception:
        return ImageFont.load_default()

# Colors
PRIMARY = (30, 58, 138)       # #1E3A8A Deep Blue
SECONDARY = (6, 182, 212)     # #06B6D4 Cyan
DARK = (15, 23, 42)           # #0F172A Slate 900
GRAY = (100, 116, 139)        # #64748B Slate 500
LIGHT_BG = (248, 250, 252)    # #F8FAFC
CARD_BG = (255, 255, 255)
BORDER = (226, 232, 240)
GREEN = (16, 185, 129)
RED = (239, 68, 68)
PURPLE = (126, 34, 206)

# ----------------------------------------------------------------------
# 1. GENERATE System_Architecture_Diagram.png
# ----------------------------------------------------------------------
def generate_system_architecture():
    W, H = 1600, 1050
    img = Image.new("RGB", (W, H), LIGHT_BG)
    draw = ImageDraw.Draw(img)

    # Header Bar
    draw.rectangle([0, 0, W, 100], fill=PRIMARY)
    draw.text((40, 25), "CAMPUSCONNECT – SYSTEM ARCHITECTURE DIAGRAM", font=get_font(28, bold=True), fill=(255, 255, 255))
    draw.text((40, 65), "SLIIT SE2020: Web and Mobile Technologies | 3-Tier Client-Server Architecture", font=get_font(16), fill=SECONDARY)

    # Tier 1: Client Tier (Mobile & Web)
    client_box = [60, 140, 500, 980]
    draw.rounded_rectangle(client_box, radius=16, fill=CARD_BG, outline=PRIMARY, width=2)
    draw.rectangle([60, 140, 500, 200], fill=PRIMARY)
    draw.text((80, 155), "TIER 1: FRONTEND CLIENT", font=get_font(20, bold=True), fill=(255, 255, 255))
    draw.text((80, 180), "Cross-Platform React Native (Expo SDK 57)", font=get_font(13), fill=SECONDARY)

    client_items = [
        ("Mobile Client (Expo)", "iOS & Android (Expo Go App)"),
        ("Web Client (Browser)", "Desktop Browser (localhost:8081)"),
        ("Navigation Architecture", "React Navigation (AuthStack, Tabs, Stacks)"),
        ("State & Auth Context", "AuthContext + AsyncStorage (JWT)"),
        ("UI & Design System", "Campus Deep Blue Theme, Badges, Modals"),
        ("Network & API Layer", "Axios with Bearer Interceptors"),
        ("Media Upload Handling", "Expo ImagePicker (Multipart FormData)"),
        ("Student & User Screens", "Home, ItemList, Details, Create, Claims"),
        ("Admin Control Screens", "AdminClaims (Approve/Reject), ItemAudit"),
    ]
    y = 220
    for title, desc in client_items:
        draw.rounded_rectangle([80, y, 480, y + 65], radius=10, fill=(241, 245, 249), outline=BORDER)
        draw.text((95, y + 12), title, font=get_font(15, bold=True), fill=DARK)
        draw.text((95, y + 36), desc, font=get_font(13), fill=GRAY)
        y += 80

    # Connector 1: Client -> Backend
    draw.line([(500, 500), (590, 500)], fill=SECONDARY, width=4)
    draw.polygon([(600, 500), (585, 492), (585, 508)], fill=SECONDARY)
    draw.text((515, 460), "HTTPS / REST", font=get_font(13, bold=True), fill=PRIMARY)
    draw.text((515, 478), "JSON + Multipart", font=get_font(11), fill=GRAY)
    draw.text((515, 510), "Bearer JWT", font=get_font(11, bold=True), fill=PURPLE)

    # Tier 2: Application Tier (Backend REST API)
    api_box = [600, 140, 1040, 980]
    draw.rounded_rectangle(api_box, radius=16, fill=CARD_BG, outline=PRIMARY, width=2)
    draw.rectangle([600, 140, 1040, 200], fill=PRIMARY)
    draw.text((620, 155), "TIER 2: BACKEND REST API", font=get_font(20, bold=True), fill=(255, 255, 255))
    draw.text((620, 180), "Node.js & Express.js Server (Port 5000)", font=get_font(13), fill=SECONDARY)

    api_items = [
        ("REST API Routing", "/api/auth, /api/items, /api/claims, /api/health"),
        ("JWT Auth Middleware", "JWT Verification, req.user attachment"),
        ("Admin Role Middleware", "RBAC: isAdmin === true check (HTTP 403)"),
        ("Multer Media Upload", "MIME type check, <=5MB, /uploads storage"),
        ("Business Logic Engine", "Found items only, Active check, Dedupe"),
        ("State Consistency Lock", "Claim Approval -> Item Claimed locking"),
        ("Central Error Handler", "CastError (404), Duplicate (409), 500"),
        ("Custom DNS Resolution", "Google (8.8.8.8) & Cloudflare DNS (1.1.1.1)"),
        ("Production Deployment", "Render.com / Railway Cloud Web Service"),
    ]
    y = 220
    for title, desc in api_items:
        draw.rounded_rectangle([620, y, 1020, y + 65], radius=10, fill=(241, 245, 249), outline=BORDER)
        draw.text((635, y + 12), title, font=get_font(15, bold=True), fill=DARK)
        draw.text((635, y + 36), desc, font=get_font(13), fill=GRAY)
        y += 80

    # Connector 2: Backend -> Database
    draw.line([(1040, 500), (1130, 500)], fill=GREEN, width=4)
    draw.polygon([(1140, 500), (1125, 492), (1125, 508)], fill=GREEN)
    draw.text((1055, 465), "Mongoose ODM", font=get_font(13, bold=True), fill=DARK)
    draw.text((1055, 483), "TLS / Wire Protocol", font=get_font(11), fill=GRAY)
    draw.text((1055, 510), "Relational .populate()", font=get_font(11, bold=True), fill=GREEN)

    # Tier 3: Data Tier (MongoDB Atlas)
    db_box = [1140, 140, 1540, 980]
    draw.rounded_rectangle(db_box, radius=16, fill=CARD_BG, outline=PRIMARY, width=2)
    draw.rectangle([1140, 140, 1540, 200], fill=PRIMARY)
    draw.text((1160, 155), "TIER 3: DATABASE CLUSTER", font=get_font(20, bold=True), fill=(255, 255, 255))
    draw.text((1160, 180), "MongoDB Atlas Cloud Replica Set", font=get_font(13), fill=SECONDARY)

    db_items = [
        ("Users Collection", "name, email (unique), password (bcrypt), isAdmin"),
        ("Items Collection", "title, category, location, itemType, status, image"),
        ("Claims Collection", "itemId (FK -> Item), userId (FK -> User), message"),
        ("Relational References", "1:N User -> Items | 1:N Item -> Claims"),
        ("Security & Access Rules", "Whitelisted 0.0.0.0/0 IP, SCRAM authentication"),
        ("Cloud Database Cluster", "Atlas M0 Shared Cluster (AWS ap-south-1)"),
    ]
    y = 220
    for title, desc in db_items:
        draw.rounded_rectangle([1160, y, 1520, y + 100], radius=10, fill=(241, 245, 249), outline=BORDER)
        draw.text((1175, y + 14), title, font=get_font(15, bold=True), fill=DARK)
        # Wrap desc
        words = desc.split()
        line1 = " ".join(words[:5])
        line2 = " ".join(words[5:])
        draw.text((1175, y + 42), line1, font=get_font(13), fill=GRAY)
        if line2:
            draw.text((1175, y + 64), line2, font=get_font(13), fill=GRAY)
        y += 125

    out_path = os.path.join(BASE_DIR, "System_Architecture_Diagram.png")
    img.save(out_path, "PNG")
    print(f"[Generated] {out_path}")

# ----------------------------------------------------------------------
# 2. GENERATE Database_Schema_Diagram.png
# ----------------------------------------------------------------------
def generate_database_schema():
    W, H = 1600, 1050
    img = Image.new("RGB", (W, H), LIGHT_BG)
    draw = ImageDraw.Draw(img)

    # Header Bar
    draw.rectangle([0, 0, W, 100], fill=PRIMARY)
    draw.text((40, 25), "CAMPUSCONNECT – DATABASE SCHEMA & ENTITY RELATIONSHIP DIAGRAM", font=get_font(26, bold=True), fill=(255, 255, 255))
    draw.text((40, 65), "Primary Entity: Item | Related Entity: Claim | Auth Entity: User (Mongoose ODM)", font=get_font(16), fill=SECONDARY)

    # Box 1: USER Entity
    user_box = [80, 160, 480, 580]
    draw.rounded_rectangle(user_box, radius=12, fill=CARD_BG, outline=PRIMARY, width=2)
    draw.rectangle([80, 160, 480, 220], fill=PRIMARY)
    draw.text((100, 175), "User (Authentication Entity)", font=get_font(18, bold=True), fill=(255, 255, 255))
    draw.text((100, 198), "Collection: users", font=get_font(12), fill=SECONDARY)

    user_fields = [
        ("PK", "_id", "ObjectId", "Unique Identifier"),
        ("  ", "name", "String", "Full Name (Required)"),
        ("  ", "email", "String", "Unique University Email"),
        ("  ", "password", "String", "Bcrypt Hashed (Salt=10)"),
        ("  ", "isAdmin", "Boolean", "Role: true/false"),
        ("  ", "createdAt", "Date", "Auto Timestamp"),
        ("  ", "updatedAt", "Date", "Auto Timestamp"),
    ]
    y = 230
    for pk, name, ftype, desc in user_fields:
        color = PRIMARY if pk == "PK" else DARK
        draw.text((95, y), pk, font=get_font(12, bold=True), fill=RED if pk == "PK" else GRAY)
        draw.text((130, y), name, font=get_font(14, bold=True), fill=color)
        draw.text((250, y), ftype, font=get_font(13), fill=PURPLE)
        draw.text((330, y), desc, font=get_font(11), fill=GRAY)
        draw.line([(85, y + 22), (475, y + 22)], fill=BORDER, width=1)
        y += 30

    # Box 2: ITEM Entity (Primary)
    item_box = [600, 160, 1020, 740]
    draw.rounded_rectangle(item_box, radius=12, fill=CARD_BG, outline=PRIMARY, width=2)
    draw.rectangle([600, 160, 1020, 220], fill=PRIMARY)
    draw.text((620, 175), "Item (PRIMARY ENTITY - 1)", font=get_font(18, bold=True), fill=(255, 255, 255))
    draw.text((620, 198), "Collection: items (Complete CRUD)", font=get_font(12), fill=SECONDARY)

    item_fields = [
        ("PK", "_id", "ObjectId", "Unique Item Identifier"),
        ("  ", "title", "String", "Item Title (Max 100)"),
        ("  ", "description", "String", "Detailed Description"),
        ("  ", "category", "Enum", "Electronics/Docs/Cloth..."),
        ("  ", "location", "String", "Campus Hall / Lab"),
        ("  ", "dateReported", "Date", "Incident Date"),
        ("  ", "itemType", "Enum", "Lost | Found"),
        ("  ", "image", "String", "Upload Path (/uploads/..)"),
        ("  ", "status", "Enum", "Active | Claimed | Resolved"),
        ("FK", "reportedBy", "ObjectId", "Ref -> User._id"),
        ("  ", "createdAt", "Date", "Auto Timestamp"),
        ("  ", "updatedAt", "Date", "Auto Timestamp"),
    ]
    y = 230
    for pk, name, ftype, desc in item_fields:
        color = PRIMARY if pk in ["PK", "FK"] else DARK
        draw.text((615, y), pk, font=get_font(12, bold=True), fill=RED if pk == "PK" else (GREEN if pk == "FK" else GRAY))
        draw.text((650, y), name, font=get_font(14, bold=True), fill=color)
        draw.text((770, y), ftype, font=get_font(13), fill=PURPLE)
        draw.text((850, y), desc, font=get_font(11), fill=GRAY)
        draw.line([(605, y + 22), (1015, y + 22)], fill=BORDER, width=1)
        y += 30

    # Box 3: CLAIM Entity (Related)
    claim_box = [1140, 160, 1540, 680]
    draw.rounded_rectangle(claim_box, radius=12, fill=CARD_BG, outline=PRIMARY, width=2)
    draw.rectangle([1140, 160, 1540, 220], fill=PRIMARY)
    draw.text((1160, 175), "Claim (RELATED ENTITY - 2)", font=get_font(18, bold=True), fill=(255, 255, 255))
    draw.text((1160, 198), "Collection: claims (Complete CRUD)", font=get_font(12), fill=SECONDARY)

    claim_fields = [
        ("PK", "_id", "ObjectId", "Unique Claim Identifier"),
        ("FK", "itemId", "ObjectId", "Ref -> Item._id (MANDATORY)"),
        ("FK", "userId", "ObjectId", "Ref -> User._id (Claimant)"),
        ("  ", "message", "String", "Proof Verification Message"),
        ("  ", "claimDate", "Date", "Submission Timestamp"),
        ("  ", "status", "Enum", "Pending/Approved/Rejected.."),
        ("  ", "createdAt", "Date", "Auto Timestamp"),
        ("  ", "updatedAt", "Date", "Auto Timestamp"),
    ]
    y = 230
    for pk, name, ftype, desc in claim_fields:
        color = PRIMARY if pk in ["PK", "FK"] else DARK
        draw.text((1155, y), pk, font=get_font(12, bold=True), fill=RED if pk == "PK" else (GREEN if pk == "FK" else GRAY))
        draw.text((1190, y), name, font=get_font(14, bold=True), fill=color)
        draw.text((1280, y), ftype, font=get_font(13), fill=PURPLE)
        draw.text((1360, y), desc, font=get_font(11), fill=GRAY)
        draw.line([(1145, y + 22), (1535, y + 22)], fill=BORDER, width=1)
        y += 30

    # Draw Relationship Connectors
    # 1. User -> Item (1:N)
    draw.line([(480, 500), (600, 500)], fill=PRIMARY, width=3)
    draw.polygon([(595, 495), (605, 500), (595, 505)], fill=PRIMARY)
    draw.text((505, 475), "1 : N (reportedBy)", font=get_font(12, bold=True), fill=PRIMARY)

    # 2. Item -> Claim (1:N)
    draw.line([(1020, 260), (1140, 260)], fill=GREEN, width=3)
    draw.polygon([(1135, 255), (1145, 260), (1135, 265)], fill=GREEN)
    draw.text((1035, 235), "1 : N (itemId)", font=get_font(12, bold=True), fill=GREEN)

    # 3. User -> Claim (1:N) bottom curve
    draw.line([(280, 580), (280, 840), (1340, 840), (1340, 680)], fill=PURPLE, width=3)
    draw.polygon([(1335, 685), (1340, 675), (1345, 685)], fill=PURPLE)
    draw.text((700, 815), "1 : N User to Claim (userId)", font=get_font(14, bold=True), fill=PURPLE)

    # Bottom Business Rules Reference Box
    rule_box = [80, 880, 1540, 1020]
    draw.rounded_rectangle(rule_box, radius=12, fill=CARD_BG, outline=BORDER, width=2)
    draw.text((100, 895), "ENFORCED BUSINESS RULES ON ENTITIES:", font=get_font(15, bold=True), fill=PRIMARY)
    rules_text = (
        "• RULE 1: Only Found items can be claimed (Item.itemType === 'Found')\n"
        "• RULE 2: Item must be Active to accept claims (Item.status === 'Active')\n"
        "• RULE 3: Duplicate Pending claims by the same student for an item are prevented (HTTP 409)\n"
        "• RULE 4 & 7: Admin Approving a claim sets Claim.status -> 'Approved' and Item.status -> 'Claimed' (Locks future claims)"
    )
    draw.text((100, 925), rules_text, font=get_font(13), fill=DARK)

    out_path = os.path.join(BASE_DIR, "Database_Schema_Diagram.png")
    img.save(out_path, "PNG")
    print(f"[Generated] {out_path}")

# ----------------------------------------------------------------------
# Helper to render text pages to PDF
# ----------------------------------------------------------------------
def render_pdf_document(filename, title, subtitle, sections):
    # A4 at 150 DPI: 1240 x 1754
    W, H = 1240, 1754
    pages = []
    
    current_img = Image.new("RGB", (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(current_img)

    # Draw Header on page 1
    draw.rectangle([0, 0, W, 140], fill=PRIMARY)
    draw.text((60, 35), title, font=get_font(28, bold=True), fill=(255, 255, 255))
    draw.text((60, 80), subtitle, font=get_font(16), fill=SECONDARY)
    draw.text((60, 110), "SLIIT SE2020: Web and Mobile Technologies | Year 2 Semester 2 — 2026", font=get_font(13), fill=(220, 230, 255))

    y = 180
    for sec_title, sec_content in sections:
        if y > 1550:
            pages.append(current_img)
            current_img = Image.new("RGB", (W, H), (255, 255, 255))
            draw = ImageDraw.Draw(current_img)
            # Mini top bar
            draw.rectangle([0, 0, W, 40], fill=PRIMARY)
            draw.text((60, 12), title, font=get_font(14, bold=True), fill=(255, 255, 255))
            y = 70

        if sec_title:
            draw.text((60, y), sec_title, font=get_font(18, bold=True), fill=PRIMARY)
            y += 26
            draw.line([(60, y), (1180, y)], fill=SECONDARY, width=2)
            y += 16

        for line in sec_content:
            if y > 1650:
                pages.append(current_img)
                current_img = Image.new("RGB", (W, H), (255, 255, 255))
                draw = ImageDraw.Draw(current_img)
                draw.rectangle([0, 0, W, 40], fill=PRIMARY)
                draw.text((60, 12), title, font=get_font(14, bold=True), fill=(255, 255, 255))
                y = 70

            is_bold = line.startswith("•") or line.startswith("RULE") or line.startswith("FR") or line.startswith("Step")
            draw.text((70, y), line, font=get_font(14, bold=is_bold), fill=DARK if is_bold else (50, 50, 50))
            y += 24
        y += 20

    pages.append(current_img)

    out_path = os.path.join(BASE_DIR, filename)
    pages[0].save(out_path, "PDF", resolution=150.0, save_all=True, append_images=pages[1:])
    print(f"[Generated] {out_path}")

# ----------------------------------------------------------------------
# 3. GENERATE Problem_Statement.pdf
# ----------------------------------------------------------------------
def generate_problem_statement_pdf():
    sections = [
        ("1. BACKGROUND & PROBLEM DEFINITION", [
            "In large higher education institutions like SLIIT, personal possessions such as student ID cards,",
            "smartphones, laptop power supplies, thumb drives, calculators, and wallets are lost every semester.",
            "The traditional campus approach relies on physical security notices, logbooks, or WhatsApp groups.",
            "",
            "This creates significant operational drawbacks:",
            "• Low Recovery Rates: Dispersed reports prevent owners from locating recovered belongings.",
            "• Verification Vulnerability: Finders cannot reliably verify legitimate ownership before handover.",
            "• Heavy Administrative Overhead: Campus security guards spend substantial time maintaining logs.",
            "• Lack of Transparency: Students have zero visibility into the resolution status of their lost reports."
        ]),
        ("2. PROPOSED SOLUTION: CAMPUSCONNECT", [
            "CampusConnect is a small, complete, understandable mobile Lost & Found platform designed to resolve",
            "these challenges through structured relational workflows:",
            "• Centralized Mobile Repository: Finders immediately publish found items with photos and campus locations.",
            "• Ownership Verification Engine: Students submit claims containing secret or distinguishing proof.",
            "• Administrator Control: Campus authorities evaluate proof and approve or reject claims.",
            "• Real-Time Status Tracking: Statuses update dynamically across Active, Pending, Approved, and Claimed."
        ]),
        ("3. CORE OBJECTIVES", [
            "1. Deliver a responsive cross-platform mobile frontend using React Native, Hooks, and React Navigation.",
            "2. Establish a secure Node.js & Express.js REST API with complete CRUD on primary & related entities.",
            "3. Enforce relational modeling between User, Item, and Claim in MongoDB Atlas using Mongoose references.",
            "4. Execute all 7 domain business logic rules strictly at the API controller layer.",
            "5. Implement image uploads via Multer with validation and static cloud asset serving."
        ]),
        ("4. SYSTEM SCOPE & USERS", [
            "• Target Users: SLIIT Undergraduate Students, Faculty, and Campus Security/Administration.",
            "• Boundaries: Strictly focused on lost and found management, ownership claims, and role authorization.",
            "• Excluded (Per Assignment Scope): Payment gateways, chats, web admin dashboards, or social feeds."
        ])
    ]
    render_pdf_document(
        "Problem_Statement.pdf",
        "CAMPUSCONNECT – PROBLEM STATEMENT",
        "Lost & Found Management System for University Campuses",
        sections
    )

# ----------------------------------------------------------------------
# 4. GENERATE API_Endpoint_Table.pdf
# ----------------------------------------------------------------------
def generate_api_endpoint_table_pdf():
    sections = [
        ("REST API SPECIFICATION & STATUS CODES", [
            "Base URL: https://campusconnect-api.onrender.com/api  (Local: http://localhost:5000/api)",
            "All endpoints follow standard response envelope: { success: boolean, message?: string, data?: object }",
            ""
        ]),
        ("1. SYSTEM HEALTH & AUTHENTICATION", [
            "• GET /api/health",
            "  - Access: Public | Returns: 200 OK | Description: Uptime monitoring & server status.",
            "• POST /api/auth/register",
            "  - Access: Public | Body: { name, email, password, isAdmin? } | Returns: 201 Created, 400, 409",
            "  - Description: Creates a new student/admin account; hashes password with bcrypt (10 rounds).",
            "• POST /api/auth/login",
            "  - Access: Public | Body: { email, password } | Returns: 200 OK, 400, 401",
            "  - Description: Compares password hash, signs JWT token (30d expiry), returns user info.",
            "• GET /api/auth/me",
            "  - Access: Protected (Bearer JWT) | Returns: 200 OK, 401 | Description: Current authenticated user."
        ]),
        ("2. PRIMARY ENTITY: ITEM CRUD", [
            "• GET /api/items",
            "  - Access: Protected | Query: ?type=Lost|Found&category=... | Returns: 200 OK",
            "  - Description: Retrieves all active items with reporter populated (name, email).",
            "• GET /api/items/:id",
            "  - Access: Protected | Returns: 200 OK, 404 | Description: Comprehensive item details by ID.",
            "• POST /api/items",
            "  - Access: Protected | Body: multipart/form-data (title, desc, category, location, image)",
            "  - Returns: 201 Created, 400 | Description: Creates item report, stores photo via Multer.",
            "• PUT /api/items/:id",
            "  - Access: Protected (Owner or Admin) | Returns: 200 OK, 403, 404 | Description: Updates item details.",
            "• DELETE /api/items/:id",
            "  - Access: Protected (Owner or Admin) | Returns: 200 OK, 403, 404",
            "  - Description: Removes item record and cascades deletion to associated claims."
        ]),
        ("3. RELATED ENTITY: CLAIM CRUD & BUSINESS LOGIC", [
            "• POST /api/claims",
            "  - Access: Protected (Students) | Body: { itemId, message } | Returns: 201 Created, 400, 409",
            "  - Business Rules: Rejects Lost items (Rule 1), rejects non-Active (Rule 2), prevents duplicates (Rule 3).",
            "• GET /api/claims",
            "  - Access: Protected | Query: ?status=Pending | Returns: 200 OK",
            "  - Description: Normal user sees own claims; Administrator sees all submitted campus claims.",
            "• GET /api/claims/:id",
            "  - Access: Protected (Owner or Admin) | Returns: 200 OK, 403, 404 | Description: Populated claim view.",
            "• PUT /api/claims/:id/status",
            "  - Access: Admin Only | Body: { status: 'Approved' | 'Rejected' } | Returns: 200 OK, 400, 403",
            "  - Rule 4: Approving sets Claim -> Approved AND Item -> Claimed. Locks future claims (Rule 7).",
            "  - Rule 5: Rejecting sets Claim -> Rejected, Item remains Active for other claimants.",
            "• PUT /api/claims/:id/cancel",
            "  - Access: Protected (Claimant Only) | Returns: 200 OK, 400, 403",
            "  - Rule 6: Student cancels pending claim; sets status -> Cancelled; Item remains Active.",
            "• DELETE /api/claims/:id",
            "  - Access: Protected (Owner or Admin) | Returns: 200 OK, 403, 404 | Description: Deletes claim."
        ])
    ]
    render_pdf_document(
        "API_Endpoint_Table.pdf",
        "CAMPUSCONNECT – REST API ENDPOINT SPECIFICATION",
        "Complete Route Definitions, Payloads, HTTP Status Codes & Access Controls",
        sections
    )

# ----------------------------------------------------------------------
# 5. GENERATE Team_Responsibility.pdf
# ----------------------------------------------------------------------
def generate_team_responsibility_pdf():
    sections = [
        ("PROJECT DELIVERABLES & MODULE BREAKDOWN", [
            "Student Name:    Avishka Sahan",
            "Student ID:      IT22371072",
            "Module:          SE2020 — Web and Mobile Technologies",
            "Degree:          BSc (Hons) in Software Engineering (Year 2 Semester 2 — 2026)",
            "Project Title:   CampusConnect – Lost & Found Management System",
            "GitHub Repo:     https://github.com/avishkasenanayake997-glitch/WMT.git",
            ""
        ]),
        ("1. ARCHITECTURE & BACKEND DEVELOPMENT", [
            "• Architected 3-tier system: React Native client, Express.js REST API, and MongoDB Atlas.",
            "• Developed Mongoose schemas with strict validations for User, Item, and Claim entities.",
            "• Created explicit relational foreign key references between Claim -> Item and User.",
            "• Configured Multer diskStorage with MIME format filtering (JPEG/PNG/WebP) and 5MB size limits.",
            "• Built centralized error handling middleware managing Mongoose CastError, duplicate keys, and 500s.",
            "• Configured custom DNS resolver (Google 8.8.8.8) to bypass local router DNS blocking."
        ]),
        ("2. BUSINESS LOGIC & DATA CONSISTENCY", [
            "• Implemented Rule 1: Restricting claim submissions exclusively to Found items (HTTP 400).",
            "• Implemented Rule 2: Enforcing Active item prerequisite before permitting claim creation (HTTP 400).",
            "• Implemented Rule 3: Deduplicating pending claims per student/item (HTTP 409 Conflict).",
            "• Implemented Rule 4 & 7: Atomic state updates on Admin approval (Claim -> Approved, Item -> Claimed).",
            "• Implemented Rule 5: State isolation on Admin rejection (Item remains Active for other students).",
            "• Implemented Rule 6: Claimant self-cancellation workflow (Pending -> Cancelled)."
        ]),
        ("3. MOBILE APPLICATION & USER EXPERIENCE", [
            "• Built 14 functional React Native screens utilizing React Navigation (Stack + Bottom Tabs).",
            "• Configured Expo SDK 57 for compatibility with iOS, Android, and Web browsers.",
            "• Implemented AuthContext with persistent AsyncStorage for seamless JWT session restoration.",
            "• Designed campus visual identity (Deep Blue #1E3A8A, Cyan #06B6D4) with status badges and cards.",
            "• Built in-app administrative tools for claim review and item registry audit without web panels.",
            "• Created one-tap demo credentials quick-fill on login screen for examiner viva evaluation."
        ]),
        ("4. VERIFICATION & DEPLOYMENT", [
            "• Authored comprehensive database seeder (node seeder.js) generating demo users and sample items.",
            "• Programmed automated 10-point test suite (node test-api.js) verifying all 7 domain rules.",
            "• Configured cloud deployment with render.yaml and MongoDB Atlas replica set connection."
        ])
    ]
    render_pdf_document(
        "Team_Responsibility.pdf",
        "CAMPUSCONNECT – INDIVIDUAL RESPONSIBILITY BREAKDOWN",
        "SE2020 Module Deliverables & Contribution Documentation",
        sections
    )

if __name__ == "__main__":
    print("Generating submission package files in 'assment' folder...")
    generate_system_architecture()
    generate_database_schema()
    generate_problem_statement_pdf()
    generate_api_endpoint_table_pdf()
    generate_team_responsibility_pdf()
    print("All submission files generated successfully!")
