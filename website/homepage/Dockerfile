FROM python:latest

ARG GOOGLE_CLIENT_SECRETS
ARG GOOGLE_CLIENT_CREDENTIALS
RUN apt-get update
RUN apt-get --assume-yes install npm nginx
RUN mkdir gradio
WORKDIR /gradio
COPY ./ ./
WORKDIR /gradio/frontend
RUN npm install
RUN npm run build
WORKDIR /gradio
RUN pip install pandas matplotlib
RUN python setup.py install
WORKDIR /gradio/website/homepage
RUN pip install -r requirements.txt
RUN echo $GOOGLE_CLIENT_SECRETS > client_secrets.json
RUN echo $GOOGLE_CLIENT_CREDENTIALS > google_credentials.json
RUN npm install
RUN npm run production
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
RUN cp -r /gradio/website/homepage/dist/. ./
RUN cp /gradio/website/homepage/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
