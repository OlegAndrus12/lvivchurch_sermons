# Lviv Church Sermons

Archive of sermons for [https://lvivtserkva.com/propovidi/]. Built with Django 5.2 and Box.com cloud storage.

## Features

- Searchable sermon archive with filters by testament, verse reference, preacher, and date range
- Box.com integration for audio, text, and agenda file storage
- Django admin protected by TOTP two-factor authentication

## Requirements

- Python 3.13+
- Poetry
- A [Box.com](https://box.com) app with OAuth2 credentials

## Setup

**1. Install dependencies**

```bash
poetry install
```

**2. Configure environment**

Create a `.env` file in the repo root:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Box.com OAuth2
BOX_CLIENT_ID=your-box-client-id
BOX_CLIENT_SECRET=your-box-client-secret
BOX_TOKEN_FILE=/path/to/box_tokens.json
```

**3. Apply migrations**

```bash
poetry run python manage.py migrate
```

**4. Create a superuser**

```bash
poetry run python manage.py createsuperuser
```

**5. Run the development server**

```bash
poetry run python manage.py runserver
```

Visit `http://localhost:8000` for the public sermon list and `http://localhost:8000/admin/` for the admin panel.

## Two-Factor Authentication

Admin access requires TOTP. On first login you will be prompted to set up an authenticator app (Google Authenticator, Authy, etc.). Backup tokens are available under the 2FA profile page.

## Project Structure

```
src/
  project/          # Django settings, URLs, WSGI
  sermons_index/    # Main app — models, views, admin, storage
    services/
      storage.py    # Box.com OAuth2 storage backend
    static/
      css/base.css  # All styles
      js/sermons.js # DataTables + filter logic
  templates/
    project/        # Public site base template
    sermons_index/  # Sermon list template and SVG icons
    two_factor/     # Custom 2FA page templates
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Django 5.2 |
| Database | SQLite |
| File storage | Box.com (OAuth2) |
| Static files | WhiteNoise |
| 2FA | django-two-factor-auth + django-otp |
| Frontend | DataTables v2, jQuery, vanilla CSS |
| Linting | Ruff, Black, djlint |
