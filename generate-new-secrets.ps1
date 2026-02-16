# 🔐 Generate New Secrets
# Use this to create new secure secrets after removing the old ones from Git

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  🔐 Secret Generator" -ForegroundColor Cyan
Write-Host "  Generate new secure credentials" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Generate new JWT secret
Write-Host "Generating new JWT secret (64 bytes, base64 encoded)..." -ForegroundColor Yellow
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$jwtSecret = [Convert]::ToBase64String($bytes)
Write-Host "✅ Generated!`n" -ForegroundColor Green

# Display results
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  📋 Your New Secrets" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "JWT_SECRET:" -ForegroundColor Yellow
Write-Host "$jwtSecret`n" -ForegroundColor White

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  📝 Update Your backend/.env File" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Copy this to your backend/.env file:" -ForegroundColor Yellow
Write-Host @"

# UPDATED CREDENTIALS (Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss"))

# Google OAuth - GET NEW CREDENTIALS FROM:
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_new_google_client_id
GOOGLE_CLIENT_SECRET=your_new_google_client_secret

# MongoDB - ROTATE PASSWORD AT:
# https://cloud.mongodb.com/ → Database Access
MONGODB_URI=mongodb+srv://new_user:new_password@cluster.mongodb.net/autobid?retryWrites=true&w=majority

# JWT Secret - NEWLY GENERATED
JWT_SECRET=$jwtSecret

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

"@ -ForegroundColor Gray

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  ⚠️  Manual Steps Required" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "1. Google OAuth Credentials:" -ForegroundColor Yellow
Write-Host "   a. Go to: https://console.cloud.google.com/apis/credentials" -ForegroundColor White
Write-Host "   b. Delete the old OAuth 2.0 Client ID" -ForegroundColor White
Write-Host "   c. Click 'Create Credentials' → 'OAuth 2.0 Client ID'" -ForegroundColor White
Write-Host "   d. Application type: Web application" -ForegroundColor White
Write-Host "   e. Authorized redirect URIs:" -ForegroundColor White
Write-Host "      - http://localhost:5000/api/auth/google/callback" -ForegroundColor Gray
Write-Host "      - http://localhost:3000" -ForegroundColor Gray
Write-Host "   f. Copy the new Client ID and Client Secret`n" -ForegroundColor White

Write-Host "2. MongoDB Connection:" -ForegroundColor Yellow
Write-Host "   a. Go to: https://cloud.mongodb.com/" -ForegroundColor White
Write-Host "   b. Navigate to: Database Access" -ForegroundColor White
Write-Host "   c. Either:" -ForegroundColor White
Write-Host "      - Edit existing user → Change password" -ForegroundColor Gray
Write-Host "      - OR Delete old user and create new one" -ForegroundColor Gray
Write-Host "   d. Update connection string in .env`n" -ForegroundColor White

Write-Host "3. Update backend/.env file:" -ForegroundColor Yellow
Write-Host "   a. Open: E:\Projects\AutoBid\AutoBid\backend\.env" -ForegroundColor White
Write-Host "   b. Replace with new credentials from above" -ForegroundColor White
Write-Host "   c. Save and close`n" -ForegroundColor White

Write-Host "4. Verify .env is gitignored:" -ForegroundColor Yellow
Write-Host "   git status" -ForegroundColor White
Write-Host "   (backend/.env should NOT appear)`n" -ForegroundColor Gray

Write-Host "================================================`n" -ForegroundColor Cyan

# Offer to open browser
$openBrowser = Read-Host "Open Google Cloud Console in browser? (yes/no)"
if ($openBrowser -eq "yes") {
    Start-Process "https://console.cloud.google.com/apis/credentials"
}

$openMongo = Read-Host "Open MongoDB Atlas in browser? (yes/no)"
if ($openMongo -eq "yes") {
    Start-Process "https://cloud.mongodb.com/"
}

Write-Host "`n✅ Done! Remember to update backend/.env with new credentials.`n" -ForegroundColor Green
