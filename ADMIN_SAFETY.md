# 🛡️ Mallu Match - Admin & Safety Protocol

## 🚀 Admin Dashboard Access
The user management and moderation system is built on Django's robust Admin interface.

**URL**: `http://localhost:8000/admin/`

### 🔑 Superuser Creation
To access the admin panel, you must create a superuser account:
```bash
./venv/bin/python backend/manage.py createsuperuser
# Enter email (e.g., admin@mallumatch.com) and password
```

### 📋 Admin Capabilities

#### 1. User Management (`Users` section)
- **View All Users**: Search by email.
- **Ban Users**: Change status to `perm_banned`.
- **Verify Premium**: Manually set `is_premium` and `premium_expiry`.

#### 2. Content Moderation (`Photos` section)
- **Review Photos**: View all uploaded user photos.
- **Delete Unsafe Content**: Select and delete inappropriate images.
- **Approval Workflow**: Toggle `is_approved` status (if enforced).

#### 3. Safety & Reports (`Reports` section)
- **View Reports**: See who reported whom and why.
- **Resolution**: Mark reports as resolved.
- **Ban Actions**: Ban reported users directly from the action menu.

#### 4. Payment Verification (`Payments` section)
- **Review Requests**: See pending payment requests.
- **Approve**: Select "Approve Payment & Activate Premium" action.
  - *Automatically calculates expiry based on plan duration.*
- **Reject**: Mark invalid payments as rejected.

---

# 📱 User Safety Features Implementation

## 🚨 Reporting System
- **Endpoint**: `POST /api/report/`
- **UI**: Users can report from the Chat Window (Safety Menu -> Report).
- **Data**: Collects Reason (Fake, Harassment, Scam) and Explanation.
- **Outcome**: Admins review reports in Dashboard.

## 🚫 Blocking System
- **Endpoint**: `POST /api/block/`
- **UI**: Users can block from the Chat Window.
- **Effect**:
  - Blocked users disappear from Discovery.
  - Blocked users disappear from Match List.
  - Chat is disabled between parties.

## 🔒 Chat Safety
- **Content Filter**: Blocks external links (`http`) and emails (`@`) in messages.
- **History Access**: Admins can view `Chat Messages` in dashboard for investigation.

## 📜 Legal & Compliance
- **Terms & Conditions**: `/terms`
- **Privacy Policy**: `/privacy`
- **Community Guidelines**: `/guidelines`
- *Linked clearly during Registration.*

---

# 🛠️ "Not Working Properly" Fixes Applied

1. **Profile Completion**: Added missing Gender, Interest, and Height fields. Validated mandatory input.
2. **Safety Gaps**: Implemented blocking and reporting (was missing).
3. **Data Integrity**: Ensured swiped/blocked users don't reappear.
4. **Admin Control**: Enabled search and filtering in Admin Panel.

---

**Status**: PRODUCTION READY (Safety & Admin Modules Active) ✅
