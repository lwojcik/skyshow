#!/usr/bin/env bash
# Step 1 of a release: bump the version from conventional commits on a branch
# and open a pull request. Step 2 (after the PR is merged) is `npm run release`.
set -euo pipefail
export HUSKY=0

[ "$(git branch --show-current)" = "main" ] || { echo "Run from main." >&2; exit 1; }
git diff --quiet HEAD || { echo "Working tree is not clean." >&2; exit 1; }
git pull --ff-only

git switch -c release/next
trap 'git switch main >/dev/null 2>&1; git branch -D release/next >/dev/null 2>&1 || true' ERR

npx release-it "$@" --ci \
  --no-npm.publish --no-github.release \
  --no-git.tag --no-git.push \
  --no-git.requireBranch --no-git.requireUpstream

if [ "$(git rev-list --count main..HEAD)" = "0" ]; then
  trap - ERR
  git switch main >/dev/null && git branch -D release/next >/dev/null
  echo "Nothing to release."
  exit 0
fi

version="$(node -p "require('./package.json').version")"
git branch -m "release/v${version}"
git push -u origin "release/v${version}"
gh pr create --base main \
  --title "chore(release): ${version}" \
  --body "Bumps the version to ${version}. After merging, run \`npm run release\` from an up-to-date \`main\` to tag, publish the GitHub release and publish to npm."
