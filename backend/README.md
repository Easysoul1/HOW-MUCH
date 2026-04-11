# HowMuch Backend - Quick Start Guide

## Prerequisites
- Python 3.12+ installed
- Virtual environment activated
- PostgreSQL database URL (Neon supported)

## Getting Started

### 1. Activate Virtual Environment
```bash
source /Users/mac/Desktop/HOWMUCH/backend/venv/bin/activate
```

### 2. Set Database URL
Add your PostgreSQL connection string in `backend/.env`:
```bash
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
```

### 3. Run Development Server
```bash
cd /Users/mac/Desktop/HOWMUCH/backend
python manage.py runserver
```

### 4. Access the Application
- **API Documentation (Swagger UI)**: http://127.0.0.1:8000/api/docs/
- **Admin Panel**: http://127.0.0.1:8000/admin/ (requires superuser)
- **API Schema**: http://127.0.0.1:8000/api/schema/

### 5. Create Admin User (First Time Only)
```bash
python manage.py seed_admin
```
Creates/updates:
- Email/username: `admin@howmuch.com`
- Password: `Admin1234!`

## Project Structure
```
backend/
├── apps/                    # All Django applications
│   ├── users/              # User management (5 user types)
│   ├── products/           # Grocery items catalog
│   ├── vendors/            # Vendor profiles
│   ├── pricing/            # Price listings
│   ├── search/             # Search engine
│   ├── orders/             # Order management
│   ├── shoppers/           # Personal shoppers
│   ├── crowdsource/        # Price surveys
│   ├── analytics/          # Price analytics
│   ├── integrations/       # Third-party APIs
│   └── social/             # Social media flyers
├── config/                 # Django settings
├── media/                  # Uploaded files
├── PostgreSQL             # External DB via DATABASE_URL
└── manage.py              # Django CLI

```

## Available API Endpoints
All endpoints are prefixed with `/api/`

- `/api/users/` - User management
- `/api/products/` - Product catalog
- `/api/vendors/` - Vendor management
- `/api/pricing/` - Price listings
- `/api/search/` - Search functionality
- `/api/orders/` - Order management
- `/api/shoppers/` - Personal shopper services
- `/api/crowdsource/` - Price survey submissions
- `/api/analytics/` - Price analytics & history
- `/api/integrations/` - Third-party integrations
- `/api/social/` - Social media content

## User Types
The system supports 5 user types (defined in `users.User.user_type`):

1. **CUSTOMER** - Regular users searching for prices
2. **VENDOR** - Sellers listing products and prices
3. **SHOPPER** - Personal shoppers providing services
4. **CROWDSOURCER** - Volunteers submitting price surveys
5. **INTEGRATOR** - Third-party API consumers (paid)

## Common Django Commands

### Database
```bash
python manage.py makemigrations  # Create new migrations
python manage.py migrate         # Apply migrations
python manage.py showmigrations  # Show migration status
```

### Shell
```bash
python manage.py shell          # Django Python shell
python manage.py dbshell        # Database shell
```

### Testing
```bash
python manage.py test           # Run tests
```

### Static Files
```bash
python manage.py collectstatic  # Collect static files
```

## Development Workflow

1. **Make model changes** in `apps/*/models.py`
2. **Create migrations**: `python manage.py makemigrations`
3. **Apply migrations**: `python manage.py migrate`
4. **Register in admin** (if needed): Edit `apps/*/admin.py`
5. **Create serializers**: Create `apps/*/serializers.py`
6. **Create views**: Edit `apps/*/views.py`
7. **Add URLs**: Edit `apps/*/urls.py`
8. **Test**: Run server and test at `/api/docs/`

## Environment Configuration
Settings are in `config/settings.py`:
- **Database**: PostgreSQL via `DATABASE_URL` (Neon-compatible)
- **Time Zone**: Africa/Lagos
- **CORS**: Enabled for localhost:3000 (Next.js frontend)
- **Authentication**: JWT tokens (djangorestframework-simplejwt)
- **API Pagination**: 20 items per page
- **Debug Mode**: ON (disable in production)

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Database Issues
```bash
# Confirm DATABASE_URL is present and valid in .env
python manage.py check

# Apply pending migrations
python manage.py migrate
```

### Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Next Steps
- Create product models with SKU codes
- Implement vendor verification system
- Build search functionality
- Set up price history tracking
- Create crowdsource survey forms
- Implement personal shopper assignment logic

---
For detailed project information, see `COPILOT.md`
