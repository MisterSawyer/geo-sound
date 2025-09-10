#!/bin/bash
set -e

# Optional: name your virtualenv folder
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

echo "Running Flask app..."
export FLASK_APP=main.py
export FLASK_ENV=development  # Enables debug mode

gunicorn -w 4 -b 127.0.0.1:3333 main:app
#flask run --host=0.0.0.0 --port=3333
