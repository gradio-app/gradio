FROM python:3.8

RUN apt-get update
RUN apt-get --assume-yes install nginx
RUN mkdir gradio
RUN pip install numpy matplotlib
WORKDIR /gradio
COPY ./gradio ./gradio
COPY ./requirements.txt ./requirements.txt
COPY ./setup.py ./setup.py
COPY ./MANIFEST.in ./MANIFEST.in
COPY ./README.md ./README.md
RUN python setup.py install
WORKDIR /gradio
COPY ./website ./website
COPY ./demo ./demo
COPY ./guides ./guides
COPY ./gradio/components.py ./gradio/components.py
WORKDIR /gradio/website/demos
RUN pip install -r requirements.txt
RUN python map_demos.py
RUN cp nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT nginx && python run_demos.py
