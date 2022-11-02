FROM python:3.8

RUN apt-get update
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs jq
RUN npm install -g npm@latest
RUN apt-get --assume-yes install nginx
RUN mkdir gradio
WORKDIR /gradio
COPY ./ui ./ui
RUN mkdir gradio
COPY ./gradio/version.txt ./gradio/version.txt
RUN npm i pnpm@6 -g
WORKDIR /gradio/ui
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN pnpm i
RUN pnpm build
RUN pnpm build:website
RUN pip install build awscli requests
WORKDIR /gradio
WORKDIR /gradio
COPY ./gradio ./gradio
COPY ./requirements.txt ./requirements.txt
COPY ./CHANGELOG.md ./CHANGELOG.md 
COPY ./pyproject.toml ./pyproject.toml
COPY ./README.md ./README.md
COPY ./test ./test
COPY ./guides ./guides
COPY ./demo ./demo
COPY ./website ./website
WORKDIR /gradio/website
RUN python check_version.py
WORKDIR /gradio/website/homepage
RUN pip install -r requirements.txt
RUN pip install gradio -U 
RUN python build-version-docs.py
WORKDIR /gradio
RUN pip uninstall -y gradio 
RUN pip install .
RUN python -m build -w
ARG AWS_ACCESS_KEY_ID
ENV AWS_ACCESS_KEY_ID $AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_SECRET_ACCESS_KEY $AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION
ENV AWS_DEFAULT_REGION $AWS_DEFAULT_REGION
ARG LATEST_COMMIT
ENV LATEST_COMMIT $LATEST_COMMIT
RUN aws s3 cp dist/gradio-*-py3-none-any.whl s3://gradio-main-build/$LATEST_COMMIT/
WORKDIR /gradio/website/homepage
RUN npm install
RUN npm run build --url=https://gradio-main-build.s3.amazonaws.com/$LATEST_COMMIT/
ARG AUTH_TOKEN
ENV AUTH_TOKEN $AUTH_TOKEN
RUN python upload_demos.py --url https://gradio-main-build.s3.amazonaws.com/$LATEST_COMMIT/
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
RUN cp -r /gradio/gradio/templates/cdn/assets/. ./assets/
RUN cp -r /gradio/website/homepage/build/. ./
RUN ASSETS_FILE=$(grep -oE index.[a-z0-9]+.js /gradio/gradio/templates/cdn/index.html) && find ./ -type f -exec sed -i -e "s/index.js/${ASSETS_FILE}/g" {} \;
RUN cp /gradio/website/homepage/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
