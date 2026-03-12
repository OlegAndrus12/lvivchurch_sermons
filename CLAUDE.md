# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Dependencies are managed with **Poetry**. Prefix Django commands with `poetry run` or activate the shell first with `poetry shell`.

```bash
# Activate virtual environment
poetry shell

# Install dependencies
poetry install

# Add a new dependency
poetry add <package>

# Run development server
poetry run python manage.py runserver

# Apply migrations
poetry run python manage.py migrate

# Create new migration after model changes
poetry run python manage.py makemigrations

# Run tests
poetry run python manage.py test

# Create admin superuser
poetry run python manage.py createsuperuser
```

## Project Structure

```
repo/
  manage.py                          # Django CLI entry point; adds src/ to sys.path
  db.sqlite3                         # SQLite database (stays at repo root)
  pyproject.toml                     # Poetry dependencies
  .pre-commit-config.yaml            # Pre-commit hooks (black, prettier)
  src/
    project/                         # Django project config
      settings.py                    # BASE_DIR = src/, ROOT_DIR = repo root
      urls.py
      wsgi.py / asgi.py
    sermons_index/                   # Main Django app
      models.py                      # Preacher, Sermon models
      views.py                       # SermonsListView
      admin.py                       # SermonAdmin
      urls.py
      services/
        storage.py                   # AppBoxStorage (Box.com backend)
      management/commands/
        scrape_sermons.py            # Scraper for lvivtserkva.com
      migrations/
      static/
        css/base.css                 # All styles
        js/sermons.js                # DataTables init + all filter logic
    templates/
      project/base.html              # Bootstrap 5 base template
      sermons_index/sermons_index.html  # Sermon list (Ukrainian UI)
```

## Architecture

Django 5.2 app for managing and displaying Lviv church sermon archives with Box.com cloud storage for multimedia files.

**Single Django app:** `src/sermons_index/` handles all logic — models, views, URLs, admin, and Box.com storage service.

### Data Models (`src/sermons_index/models.py`)
- **Preacher** — `first_name`, `last_name`
- **Sermon** — `preacher` (FK), `title` (max 256), `date` (unique), `reference`, `audio`, `text`, `agenda` (FileFields → Box.com), `folder_id`
  - `save()` auto-creates a Box.com folder if `folder_id` is unset

### Box.com Integration (`src/sermons_index/services/storage.py`)
- `AppBoxStorage` extends Django's `Storage` base class
- Authenticates via developer token (currently hardcoded — stored in `BOX_DEVELOPER_TOKEN`)
- Used as the storage backend for all Sermon file fields

### Admin (`src/sermons_index/admin.py`)
- `SermonAdmin` shows only basic fields (preacher, title, date, reference) during creation; file fields (audio, text, agenda) appear only on the edit view — this is intentional so Box.com folder is created first

### Frontend (`src/sermons_index/static/js/sermons.js`)
- DataTables v2 with jQuery (required for custom search extensions)
- Filters: OT/NT testament tabs, verse range search, preacher dropdown (populated from Django context), date range
- Preacher filter compares by PK via `data-filter` attribute to avoid string encoding issues
- Book name normalisation handles Ukrainian genitive forms, curly apostrophes (U+2019 → U+0027), and alternate spellings (e.g. `діі` → `дії`)

### Templates
- `src/templates/project/base.html` — Bootstrap 5 base; loads `base.css` after `{% block extra_head %}` so our styles override CDN DataTables CSS
- `src/templates/sermons_index/sermons_index.html` — Sermon list; UI is in Ukrainian

### URL Structure
- `/` → `SermonsListView` (public sermon list)
- `/admin/` → Django admin

### Development notes
- no magic numbers, hardcoded values
- make sure code is well formatted with black and readable

## Python/Django Conventions
- Follow PEP8 and use type hints
- Use class-based views (CBVs) over function-based where appropriate
- Write tests using pytest-django
- Avoid N+1 queries — use select_related/prefetch_related
- Use Django ORM, avoid raw SQL unless necessary
- Use environment variables for secrets (never hardcode)
- Follow fat models, thin views pattern
- Use Django's built-in auth system

## Frontend Conventions
### JavaScript/jQuery
- Use jQuery for DOM manipulation (project already uses it)
- Avoid inline JavaScript — keep JS in separate files under static/js/
- Use $(document).ready() for initialization
- Prefer event delegation for dynamically created elements
- Use const/let, never var

### CSS
- Follow BEM naming convention for CSS classes
- Keep styles in src/sermons_index/static/css/, never inline styles
- Mobile-first approach for responsive design
- Use CSS variables for colors and reusable values

### Django Templates
- Keep logic out of templates — handle it in views/context processors
- Use template tags and filters instead of complex template logic
- Break templates into reusable partials using {% include %}
