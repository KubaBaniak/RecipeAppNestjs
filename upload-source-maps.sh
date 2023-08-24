#!/bin/sh

version=$(git rev-parse --short HEAD)

access_token=${ROLLBAR_ACCESS_TOKEN}


for path in $(find dist -name "*.js"); do
  working_directory=$(pwd);
  url=file://${working_directory}/${path}

  source_map="@$path.map"

  curl --silent --show-error https://api.rollbar.com/api/1/sourcemap \
    -F access_token=$access_token \
    -F version=$version \
    -F minified_url=$url \
    -F source_map=$source_map \
    > /dev/null
done
