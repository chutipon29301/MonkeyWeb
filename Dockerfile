FROM node

WORKDIR /app

ADD . /app

CMD ["npm","run","build"]