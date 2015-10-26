jekyll build
cd _site
git add -A .
git commit -m 'regenerated'
git push origin HEAD:master
