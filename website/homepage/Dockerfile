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
WORKDIR /gradio
RUN python -m build -w
ARG AWS_ACCESS_KEY_ID
ENV AWS_ACCESS_KEY_ID $AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_SECRET_ACCESS_KEY $AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION
ENV AWS_DEFAULT_REGION $AWS_DEFAULT_REGION
ARG GRADIO_VERSION
ENV GRADIO_VERSION $GRADIO_VERSION
ARG github.sha
ENV github.sha $github.sha
RUN aws s3 cp dist/gradio-$GRADIO_VERSION-py3-none-any.whl s3://gradio-builds/$github.sha/
RUN pnpm build:website
WORKDIR /gradio
COPY ./gradio ./gradio
COPY ./requirements.txt ./requirements.txt
COPY ./CHANGELOG.md ./CHANGELOG.md 
COPY ./pyproject.toml ./pyproject.toml
COPY ./README.md ./README.md
COPY ./test ./test
RUN pip install .
WORKDIR /gradio
COPY ./website ./website
WORKDIR /gradio/website/homepage
RUN pip install -r requirements.txt
WORKDIR /gradio
COPY ./guides ./guides
COPY ./demo ./demo
WORKDIR /gradio/website/homepage
RUN npm install
RUN npm run build
ARG AUTH_TOKEN
ENV AUTH_TOKEN $AUTH_TOKEN
RUN python upload_demos.py --gradio_wheel https://gradio-builds.s3.amazonaws.com/$github.sha/gradio-$env.GRADIO_VERSION-py3-none-any.whl
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
RUN cp -r /gradio/gradio/templates/cdn/assets/. ./assets/
RUN cp -r /gradio/website/homepage/build/. ./
RUN ASSETS_FILE=$(grep -oE index.[a-z0-9]+.js /gradio/gradio/templates/cdn/index.html) && find ./ -type f -exec sed -i -e "s/index.js/${ASSETS_FILE}/g" {} \;
RUN cp /gradio/website/homepage/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
