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

## Architecture

Django 4.2 app for managing and displaying Lviv church sermon archives with Box.com cloud storage for multimedia files.

**Single Django app:** `sermons_index/` handles all logic — models, views, URLs, admin, and Box.com storage service.

### Data Models (`sermons_index/models.py`)
- **Preacher** — `first_name`, `last_name`
- **Sermon** — `preacher` (FK), `title`, `date` (unique), `reference`, `audio`, `text`, `agenda` (FileFields → Box.com), `folder_id`
  - `save()` auto-creates a Box.com folder if `folder_id` is unset

### Box.com Integration (`sermons_index/services/storage.py`)
- `AppBoxStorage` extends Django's `Storage` base class
- Authenticates via developer token (currently hardcoded — stored in `BOX_DEVELOPER_TOKEN`)
- Used as the storage backend for all Sermon file fields

### Admin (`sermons_index/admin.py`)
- `SermonAdmin` shows only basic fields (preacher, title, date, reference) during creation; file fields (audio, text, agenda) appear only on the edit view — this is intentional so Box.com folder is created first

### Templates
- `templates/project/base.html` — Bootstrap 5 base
- `templates/sermons_index/sermons_index.html` — Sermon list with DataTables + SearchPanes; UI is in Ukrainian

### URL Structure
- `/` → `SermonsListView` (public sermon list)
- `/admin/` → Django admin


### Development notes
