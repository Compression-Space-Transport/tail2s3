#!/bin/bash
source ./env.sh
#node_modules/.bin/babel-node src/index.js
node_modules/.bin/nodemon --exec babel-node src/index.js
