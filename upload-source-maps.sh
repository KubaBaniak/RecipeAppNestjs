#!/bin/sh

nginx
cd /usr/share/nginx/html

version="${CODE_VERSION}"
access_token="${ROLLBAR_ACCESS_TOKEN}"

for path in $(find . -name "*.js"); do
  filename="${path#./}"
  url=/app/dist/$filename
  source_map=@$filename.map

  echo sending source map for ${filename}

  curl --silent --show-error https://api.rollbar.com/api/1/sourcemap \
    -F access_token=$access_token \
    -F version=$version \
    -F minified_url=$url \
    -F source_map=$source_map \
    > /dev/null
done

docker system prune -f
