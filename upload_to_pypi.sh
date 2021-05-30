#!/bin/bash

git pull origin master

old_version=$(grep -Po "(?<=version=')[^']+(?=')" setup.py)
echo "Current version is $old_version. New version?"
read new_version
sed -i "s/version='$old_version'/version='$new_version'/g" setup.py
echo $new_version > gradio/version.txt
read -p "npm build? " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cd frontend
    npm run build
    cd ..
fi

aws s3 cp gradio/frontend s3://gradio/$new_version/ --recursive 
rm -r dist/*
rm -r build/*
python setup.py sdist bdist_wheel
python -m twine upload dist/*
git add -A
git commit -m "updated PyPi version"
git push origin master
