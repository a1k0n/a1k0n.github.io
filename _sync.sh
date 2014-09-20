rm -rf img/latex
rm -rf _site
jekyll build
cd _site
git add .
git commit -m 'regenerated'
git push github HEAD:master
