#!/usr/bin/env bash

echo ""
echo "You are deploying these commits to production :"
echo ""
git --no-pager log --oneline --no-decorate --abbrev-commit master..develop
echo ""
read -p "Do you confirm ? (y/n)" -n 1

if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo ""
  echo "Merge develop in main"
  git checkout main
  git merge develop --no-edit

  CONFLICTS=$(git ls-files -u | wc -l)
  if [ "$CONFLICTS" -gt 0 ] ; then
    echo "There is a merge conflict. Aborting."
    git merge --abort
    exit 1
  fi

  git push origin main
  git checkout develop
  echo "Push to Scalingo prod"
  git push scalingo-prod main
  echo ""
  echo "Production deployed"
  echo "Push to Scalingo demo"
  git push scalingo-demo main
  echo ""
  echo "Demo deployed"
fi
