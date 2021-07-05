#!/bin/bash

git pull origin master

old_version=$(grep -Po "(?<=version=')[^']+(?=')" setup.py)
echo "Current version is $old_version. New version?"
read new_version
sed -i "s/version='$old_version'/version='$new_version'/g" setup.py

read -p "npm build? " -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cd frontend
    npm run build
    cd ..
fi

read -p "frontend updates? " -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
    aws s3 cp gradio/frontend s3://gradio/$new_version/ --recursive 
    echo $new_version > gradio/version.txt
fi

rm -r dist/*
rm -r build/*
python setup.py sdist bdist_wheel
python -m twine upload dist/*
git add -A
git commit -m "updated PyPi version"
git push origin master
