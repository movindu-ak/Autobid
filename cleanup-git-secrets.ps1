# 🔐 Quick Git History Cleanup Script
# Run this to remove backend/.env from Git history

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Git Secrets Removal Script" -ForegroundColor Cyan
Write-Host "  Removes backend/.env from entire Git history" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Safety check
$confirm = Read-Host "This will REWRITE Git history. Have you created a backup? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "`n❌ Backup first! Run:" -ForegroundColor Red
    Write-Host "Copy-Item -Path AutoBid -Destination AutoBid_BACKUP -Recurse`n" -ForegroundColor Yellow
    exit
}

# Navigate to repo
Set-Location "E:\Projects\AutoBid\AutoBid"
Write-Host "📁 Working directory: $PWD`n" -ForegroundColor Green

# Step 1: Remove from current tracking
Write-Host "Step 1: Removing backend/.env from Git tracking..." -ForegroundColor Yellow
git rm --cached backend/.env 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Removed from tracking`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  File may already be removed or doesn't exist`n" -ForegroundColor Yellow
}

# Step 2: Commit .gitignore changes
Write-Host "Step 2: Committing .gitignore updates..." -ForegroundColor Yellow
git add .gitignore
git commit -m "chore: add .env files to .gitignore" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ .gitignore updated`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  .gitignore may already be up to date`n" -ForegroundColor Yellow
}

# Step 3: Check if git-filter-repo is available
Write-Host "Step 3: Checking git-filter-repo availability..." -ForegroundColor Yellow
$filterRepoPath = "C:\Users\HP\AppData\Roaming\Python\Python313\Scripts\git-filter-repo.exe"

if (Test-Path $filterRepoPath) {
    Write-Host "✅ Found git-filter-repo`n" -ForegroundColor Green
    $useFilterRepo = $filterRepoPath
} else {
    Write-Host "⚠️  Trying python module..." -ForegroundColor Yellow
    python -m git_filter_repo --help 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python module available`n" -ForegroundColor Green
        $useFilterRepo = "python -m git_filter_repo"
    } else {
        Write-Host "❌ git-filter-repo not found. Install with:" -ForegroundColor Red
        Write-Host "pip install git-filter-repo`n" -ForegroundColor Yellow
        exit
    }
}

# Step 4: Rewrite history
Write-Host "Step 4: Rewriting Git history to remove backend/.env..." -ForegroundColor Yellow
Write-Host "⚠️  This may take a minute...`n" -ForegroundColor Yellow

if ($useFilterRepo -like "*python*") {
    python -m git_filter_repo --path backend/.env --invert-paths --force
} else {
    & $useFilterRepo --path backend/.env --invert-paths --force
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ History rewritten successfully!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ History rewrite failed. Check errors above.`n" -ForegroundColor Red
    exit
}

# Step 5: Verify removal
Write-Host "Step 5: Verifying backend/.env is gone..." -ForegroundColor Yellow
$checkLog = git log --all --full-history -- backend/.env 2>&1
if ($checkLog -like "*unknown revision*" -or $checkLog -like "*ambiguous argument*") {
    Write-Host "✅ backend/.env successfully removed from all commits`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  File may still exist in history. Manual check needed.`n" -ForegroundColor Yellow
    git log --all --oneline --full-history -- backend/.env
}

# Step 6: Re-add remote
Write-Host "Step 6: Re-adding remote origin..." -ForegroundColor Yellow
$remoteCheck = git remote -v 2>&1
if ($remoteCheck -notlike "*origin*") {
    Write-Host "⚠️  Remote 'origin' was removed by filter-repo." -ForegroundColor Yellow
    $remoteUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"
    git remote add origin $remoteUrl
    Write-Host "✅ Remote added: $remoteUrl`n" -ForegroundColor Green
} else {
    Write-Host "✅ Remote already configured`n" -ForegroundColor Green
}

# Step 7: Ready to push
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🎉 Cleanup Complete!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes:" -ForegroundColor White
Write-Host "   git log --oneline -10`n" -ForegroundColor Gray

Write-Host "2. Force push to remote:" -ForegroundColor White
Write-Host "   git push origin movindu01 --force-with-lease`n" -ForegroundColor Gray

Write-Host "3. 🚨 IMPORTANT: Rotate ALL secrets!" -ForegroundColor Red
Write-Host "   - Generate new Google OAuth credentials" -ForegroundColor White
Write-Host "   - Rotate MongoDB password" -ForegroundColor White
Write-Host "   - Generate new JWT secret`n" -ForegroundColor White

Write-Host "4. Notify team to re-clone repository`n" -ForegroundColor White

Write-Host "Full guide: REMOVE_SECRETS_GUIDE.md`n" -ForegroundColor Cyan

# Ask if user wants to push now
$pushNow = Read-Host "Do you want to force push now? (yes/no)"
if ($pushNow -eq "yes") {
    Write-Host "`nForce pushing to origin movindu01..." -ForegroundColor Yellow
    git push origin movindu01 --force-with-lease
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to remote!`n" -ForegroundColor Green
        Write-Host "🔐 Don't forget to rotate your secrets!" -ForegroundColor Red
    } else {
        Write-Host "❌ Push failed. Check errors above.`n" -ForegroundColor Red
    }
} else {
    Write-Host "`nSkipping push. Run manually when ready:`n" -ForegroundColor Yellow
    Write-Host "git push origin movindu01 --force-with-lease`n" -ForegroundColor Gray
}

Write-Host "Done! 🎉`n" -ForegroundColor Green
