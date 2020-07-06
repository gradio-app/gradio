#!/bin/bash

echo "Make sure to update the version number!!!"
rm dist/*
python setup.py sdist bdist_wheel
python -m twine upload dist/*
git add -A
git commit -m "updated PyPi version"
git push origin master
