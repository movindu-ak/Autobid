
# Stop any running processes
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# Create all necessary directories
$dirs = @(
    "E:\Projects\AutoBid\AutoBid\src\types",
    "E:\Projects\AutoBid\AutoBid\src\context",
    "E:\Projects\AutoBid\AutoBid\src\config",
    "E:\Projects\AutoBid\AutoBid\src\data",
    "E:\Projects\AutoBid\AutoBid\src\components",
    "E:\Projects\AutoBid\AutoBid\src\pages"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

Write-Host "✅ Directories created successfully!"
Write-Host "Now I'll create all the files using the file creation tool..."
