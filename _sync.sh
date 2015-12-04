jekyll build
cd _site
aws s3 sync --size-only . s3://a1k0n.net/
