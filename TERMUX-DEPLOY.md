# Deploy the full project with Termux

This package is repository-ready. Extract it into the existing `Skill` repository, verify the build, commit, and push. GitHub Actions will build `dist` and publish it automatically.

## One-time Termux setup

```sh
pkg update
pkg install git gh unzip nodejs-lts -y
termux-setup-storage
gh auth login
```

For `gh auth login`, select GitHub.com, HTTPS, and browser authentication. Never paste a GitHub password or access token into an untrusted page or chat.

## Update the existing repository

These commands assume `Skill-Termux-GitHub.zip` is in the phone's Download folder:

```sh
cd "$HOME"
gh repo clone luigioace-svg/Skill SkillRepo
mkdir -p "$HOME/skill_update"
unzip -o "$HOME/storage/downloads/Skill-Termux-GitHub.zip" -d "$HOME/skill_update"
cp -a "$HOME/skill_update/." "$HOME/SkillRepo/"
cd "$HOME/SkillRepo"
npm ci
npm run build
git add -A
git status
git commit -m "Deploy full Skill learning environment"
git push origin main
```

If `SkillRepo` was cloned earlier, use `cd "$HOME/SkillRepo" && git pull --ff-only` instead of cloning it again.

## GitHub Pages setting

In the repository, open Settings → Pages and set Source to **GitHub Actions**. The workflow under `.github/workflows/deploy-pages.yml` will publish the site after every push to `main`.
