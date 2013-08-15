rm -rf img/latex
rm -rf _site
jekyll build
rsync -avz _site/* fear.incarnate.net:www/a1k0n/
