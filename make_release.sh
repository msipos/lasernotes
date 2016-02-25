#!/bin/bash

set -e

rm -rf release
mkdir -p release

# Frontend
pushd frontend
PATH=$PATH:node_modules/.bin gulp --env prod build
popd
rsync -avm --include='*.*' -f 'hide,! */' backend ./release
. backend/venv/bin/activate
python release/backend/manage.py collectstatic --noinput
deactivate

mv release/backend/static_root release/frontend
rm -rf release/backend

rsync -avm --include='*.txt' -f 'hide,! */' backend ./release
rsync -avm --include='*.html' -f 'hide,! */' backend ./release
rsync -avm --include='*.py' -f 'hide,! */' backend ./release

rm -rf release/backend/venv

cp backend/production_migrate.sh ./release/backend
cp backend/setup_venv.sh ./release/backend
cp backend/production_gunicorn.sh ./release/backend
