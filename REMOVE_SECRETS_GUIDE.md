# 🔐 Complete Guide: Remove Secrets from Git History

## ⚠️ IMPORTANT WARNINGS

1. **This rewrites Git history** - all commit hashes will change
2. **Coordinate with team** - everyone must delete their local copy and re-clone
3. **Backup first** - make a copy of your repo before proceeding
4. **Force push required** - this will overwrite the remote branch

---

## 📋 Step-by-Step Instructions

### **STEP 1: Verify Git Filter-Repo is Installed** ✅

Already done! Installed via pip.

To verify, run:
```powershell
git-filter-repo --version
```

If you get an error, the script is in:
```
C:\Users\HP\AppData\Roaming\Python\Python313\Scripts\git-filter-repo.exe
```

---

### **STEP 2: Create a Backup**

```powershell
# Navigate to parent directory
cd E:\Projects\AutoBid

# Create a backup of your entire repository
Copy-Item -Path "AutoBid" -Destination "AutoBid_BACKUP" -Recurse

Write-Host "✅ Backup created at E:\Projects\AutoBid\AutoBid_BACKUP" -ForegroundColor Green
```

**What this does:** Creates a complete copy of your repository in case something goes wrong.

---

### **STEP 3: Verify Which Files Contain Secrets**

```powershell
cd E:\Projects\AutoBid\AutoBid

# Search entire Git history for backend/.env
git log --all --full-history -- backend/.env

# See the last commit that touched it
git log --all --oneline --full-history -- backend/.env | Select-Object -First 5
```

**What this does:** Shows you which commits contain the sensitive file.

---

### **STEP 4: Remove backend/.env from Git Tracking (Current State)**

```powershell
cd E:\Projects\AutoBid\AutoBid

# Remove from Git index but keep the file on disk
git rm --cached backend/.env

# Verify it's removed from staging
git status
```

**What this does:** Removes the file from Git's tracking without deleting it from your filesystem.

---

### **STEP 5: Commit the .gitignore Changes**

```powershell
# Stage the updated .gitignore
git add .gitignore

# Commit the change
git commit -m "chore: add .env files to .gitignore"

# Verify commit
git log --oneline -1
```

**What this does:** Ensures `.env` files are ignored going forward.

---

### **STEP 6: Rewrite History to Remove backend/.env**

⚠️ **CRITICAL STEP** - This changes all commit hashes!

```powershell
cd E:\Projects\AutoBid\AutoBid

# Method 1: Using git-filter-repo (RECOMMENDED)
# Remove backend/.env from entire history
python -m git_filter_repo --path backend/.env --invert-paths --force

# If that fails, try with full path to script:
# C:\Users\HP\AppData\Roaming\Python\Python313\Scripts\git-filter-repo.exe --path backend/.env --invert-paths --force
```

**Alternative Method 2: Using BFG Repo-Cleaner (if filter-repo fails)**

Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/

```powershell
# After downloading bfg.jar:
java -jar bfg.jar --delete-files backend/.env

# Then run garbage collection:
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**What this does:** Completely removes `backend/.env` from every commit in history.

---

### **STEP 7: Verify the Secrets Are Gone**

```powershell
# Search for any remaining references
git log --all --full-history -- backend/.env

# Should return: fatal: ambiguous argument 'backend/.env': unknown revision or path

# Search for secrets in any commit
git log --all -p | Select-String -Pattern "GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|MONGODB_URI|JWT_SECRET"

# Check current branch for any .env references
git ls-files | Select-String ".env"
```

**What this does:** Confirms the sensitive file and secrets are completely removed.

---

### **STEP 8: Re-add Remote (filter-repo removes it)**

```powershell
# Check if remote exists
git remote -v

# If no remote, add it back
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Verify
git remote -v
```

**What this does:** git-filter-repo removes remotes as a safety measure. We need to add it back.

---

### **STEP 9: Force Push to Remote**

⚠️ **THIS OVERWRITES REMOTE HISTORY**

```powershell
# Force push to your branch
git push origin movindu01 --force

# Or force push with lease (safer - fails if someone else pushed)
git push origin movindu01 --force-with-lease
```

**What this does:** Replaces the remote branch with your cleaned history.

---

### **STEP 10: Verify on GitHub**

1. Go to your GitHub repository
2. Navigate to: `Settings` → `Code security and analysis` → `Secret scanning alerts`
3. Check if alerts are resolved
4. Browse the branch history - backend/.env should not exist

---

### **STEP 11: Rotate All Exposed Secrets**

🚨 **CRITICAL: Change all compromised credentials immediately!**

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Delete the old OAuth Client ID
4. Create a new OAuth 2.0 Client ID
5. Update your backend/.env with new values

**MongoDB:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Database Access → Delete old user or rotate password
3. Update connection string in backend/.env

**JWT Secret:**
1. Generate a new secure random string:
```powershell
# Generate new JWT secret (PowerShell)
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Update backend/.env with NEW values:**
```env
# NEW credentials after rotation
GOOGLE_CLIENT_ID=your_new_client_id
GOOGLE_CLIENT_SECRET=your_new_client_secret
MONGODB_URI=mongodb+srv://new_user:new_password@cluster.mongodb.net/autobid
JWT_SECRET=your_new_64_character_random_string
```

---

## 🔍 Verification Checklist

- [ ] Backup created
- [ ] .gitignore updated and committed
- [ ] Git history rewritten (filter-repo successful)
- [ ] backend/.env not found in git log
- [ ] No secrets found in git log search
- [ ] Remote re-added
- [ ] Force push successful
- [ ] GitHub push protection no longer blocking
- [ ] All secrets rotated (new credentials)
- [ ] backend/.env file exists locally but is not tracked
- [ ] Team notified to re-clone repository

---

## 👥 Team Communication Template

Send this to your team:

```
🚨 IMPORTANT: Git History Rewritten 🚨

I've removed sensitive credentials from our Git history.

ACTION REQUIRED:
1. Delete your local AutoBid repository
2. Re-clone from GitHub:
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git checkout movindu01

3. Create your backend/.env file (credentials have been rotated):
   [Share new credentials securely via password manager or secure channel]

DO NOT:
- Try to pull/merge - it will fail due to divergent history
- Use old credentials - they've been rotated

Questions? Contact me directly.
```

---

## 🆘 Troubleshooting

### Error: "Cannot rewrite branch(es) with a dirty staging area"
```powershell
git reset --hard HEAD
git clean -fd
```

### Error: "git-filter-repo: command not found"
```powershell
# Use Python module directly
python -m git_filter_repo --path backend/.env --invert-paths --force

# Or use full path
C:\Users\HP\AppData\Roaming\Python\Python313\Scripts\git-filter-repo.exe --path backend/.env --invert-paths --force
```

### Error: "fatal: refusing to merge unrelated histories" (team member)
```powershell
# Don't merge - delete and re-clone instead
cd ..
Remove-Item -Path AutoBid -Recurse -Force
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd AutoBid
git checkout movindu01
```

### GitHub still blocking push
- Secrets may be in other files too
- Check for other .env files in root or frontend
- Check for hardcoded secrets in source files
- Use GitHub's secret scanning to identify which file/line

---

## 📚 Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [git-filter-repo documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

---

## ✅ Quick Command Sequence

Here's the complete sequence for copy-paste:

```powershell
# 1. Backup
cd E:\Projects\AutoBid
Copy-Item -Path "AutoBid" -Destination "AutoBid_BACKUP" -Recurse

# 2. Remove from current tracking
cd AutoBid
git rm --cached backend/.env

# 3. Commit .gitignore changes
git add .gitignore
git commit -m "chore: add .env files to .gitignore"

# 4. Rewrite history
python -m git_filter_repo --path backend/.env --invert-paths --force

# 5. Re-add remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 6. Force push
git push origin movindu01 --force-with-lease

# 7. Verify
git log --all --full-history -- backend/.env
```

---

**Last Updated:** Feb 16, 2026  
**Status:** Ready to execute
