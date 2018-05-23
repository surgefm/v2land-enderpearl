#!/bin/bash

curl -i -X POST -H 'Content-Type: multipart/form-data' -H "X-ENDERMAN-TOKEN: $ENDER_TOKEN" -F 'bundle=@dist/bundle.js' https://enderman.v2land.net/contextscript
