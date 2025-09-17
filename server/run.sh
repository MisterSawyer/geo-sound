#!/bin/bash
set -e

# Virtual environment folder
VENV=".venv"

echo "Setting up virtual environment..."
if [ ! -d "$VENV" ]; then
    python3 -m venv $VENV
fi

# Activate the virtual environment
source "$VENV/bin/activate"

echo "Installing requirements..."
pip install --upgrade pip
pip install -r requirements.txt
# install node dependencies
npm install
npm install npx
# generate tailwind template
npx tailwindcss -i ./geo_sound/static/input.css -o ./geo_sound/static/output.css

echo "Running Geo-Sound Flask app with Gunicorn..."

# Run Gunicorn binding only to localhost:3333 (Nginx will proxy)
gunicorn -w 4 -b 127.0.0.1:3333 "run:app"
