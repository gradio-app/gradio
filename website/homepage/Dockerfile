FROM python:3.8

RUN apt-get update
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs jq
RUN npm install -g npm@latest
RUN apt-get --assume-yes install nginx
RUN mkdir gradio
WORKDIR /gradio
RUN mkdir gradio
COPY ./gradio/version.txt ./gradio/version.txt
RUN npm i pnpm@6 -g
WORKDIR /gradio
COPY ./gradio ./gradio
COPY ./setup.py ./setup.py
COPY ./MANIFEST.in ./MANIFEST.in
COPY ./README.md ./README.md
RUN python setup.py install
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
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
RUN cp -r /gradio/website/homepage/build/. ./
RUN cp /gradio/website/homepage/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]

