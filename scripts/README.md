# 🚀 Easy Git Deployment Scripts

This folder contains scripts to make deploying your website changes to GitHub super simple!

## 📁 What's Included

### For Double-Clicking (Easy Method):

- **`quick-push.command`** - Just double-click to automatically push all changes
- **`deploy.command`** - Double-click for interactive deployment with custom commit message

### For Terminal Users:

- **`scripts/git-push.sh`** - Core deployment script (used by the .command files)

## 🎯 How to Use

### Method 1: Quick Deploy (Fastest)
1. Double-click `quick-push.command`
2. That's it! Your changes are automatically pushed to GitHub

### Method 2: Custom Message Deploy
1. Double-click `deploy.command`
2. Enter a custom commit message when prompted
3. Press Enter and your changes are pushed

### Method 3: Terminal (Advanced)
```bash
# Quick push with auto-generated message
./scripts/git-push.sh

# Push with custom commit message
./scripts/git-push.sh "Your custom commit message"
```

## ✨ What These Scripts Do

1. **Add all files** - `git add .`
2. **Commit changes** - `git commit -m "message"`
3. **Push to GitHub** - `git push`
4. **Handle errors** - Automatically sets upstream branch if needed

## 🔧 Features

- ✅ Automatic error handling
- ✅ Colored terminal output for easy reading
- ✅ Shows git status before deployment
- ✅ Confirms successful deployment
- ✅ Automatically handles first-time push setup
- ✅ Cross-platform compatible

## 🌐 Where Your Site Goes

After pushing, your changes will be available at:
- **GitHub Repository**: https://github.com/zacry8/hommemade
- **Vercel Deployment**: Automatic (if configured)

## 🛠 Troubleshooting

If you get permission errors:
```bash
chmod +x quick-push.command deploy.command scripts/git-push.sh
```

If git authentication fails:
- Make sure you're logged into GitHub
- Check your git credentials with `git config --list`

## 💡 Pro Tips

- Use `quick-push.command` for small updates
- Use `deploy.command` for major changes where you want a descriptive commit message
- The scripts automatically timestamp commits if you don't provide a message
- All scripts pause at the end so you can see the results