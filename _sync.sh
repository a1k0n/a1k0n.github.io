jekyll build
cd _site
git add -A .
git commit -m 'regenerated'
git push github HEAD:master
