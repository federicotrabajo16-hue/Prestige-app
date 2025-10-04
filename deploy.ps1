# Script de Deployment para GitHub Pages
# Ejecuta este script desde PowerShell en la carpeta exportado/

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  PRESTIGE APP - GitHub Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Git está instalado
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "ERROR: Git no está instalado." -ForegroundColor Red
    Write-Host "Descarga Git desde: https://git-scm.com/download/win" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar si ya existe un repositorio
$isGitRepo = Test-Path .git
if (-not $isGitRepo) {
    Write-Host "Inicializando nuevo repositorio Git..." -ForegroundColor Green
    git init
    
    Write-Host ""
    Write-Host "Ingresa tu nombre de usuario de GitHub:" -ForegroundColor Yellow
    $username = Read-Host
    
    Write-Host "Ingresa el nombre del repositorio (ej: prestige-webapp):" -ForegroundColor Yellow
    $repoName = Read-Host
    
    Write-Host ""
    Write-Host "Configurando repositorio remoto..." -ForegroundColor Green
    git remote add origin "https://github.com/$username/$repoName.git"
    
    Write-Host ""
    Write-Host "IMPORTANTE: Asegúrate de haber creado el repositorio en GitHub:" -ForegroundColor Yellow
    Write-Host "https://github.com/new" -ForegroundColor Cyan
    Write-Host "Nombre: $repoName" -ForegroundColor White
    Write-Host "Visibilidad: PUBLIC (necesario para GitHub Pages gratuito)" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter cuando hayas creado el repositorio"
}

# Agregar archivos
Write-Host ""
Write-Host "Agregando archivos..." -ForegroundColor Green
git add .

# Solicitar mensaje de commit
Write-Host ""
Write-Host "Ingresa un mensaje para este commit:" -ForegroundColor Yellow
Write-Host "(Ej: Initial commit, Actualización de estadísticas, etc.)" -ForegroundColor Gray
$commitMessage = Read-Host
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# Hacer commit
Write-Host ""
Write-Host "Creando commit..." -ForegroundColor Green
git commit -m "$commitMessage"

# Asegurar que estamos en la rama main
Write-Host ""
Write-Host "Configurando rama principal..." -ForegroundColor Green
git branch -M main

# Push
Write-Host ""
Write-Host "Subiendo cambios a GitHub..." -ForegroundColor Green
Write-Host "(Te pedirá tus credenciales de GitHub si es la primera vez)" -ForegroundColor Gray
Write-Host ""

$pushResult = git push -u origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  ¡ÉXITO! Archivos subidos" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "SIGUIENTE PASO:" -ForegroundColor Yellow
    Write-Host "1. Ve a tu repositorio en GitHub" -ForegroundColor White
    Write-Host "2. Click en 'Settings' > 'Pages'" -ForegroundColor White
    Write-Host "3. En 'Source': selecciona 'main' y '/ (root)'" -ForegroundColor White
    Write-Host "4. Click en 'Save'" -ForegroundColor White
    Write-Host "5. Espera 1-3 minutos" -ForegroundColor White
    Write-Host ""
    Write-Host "Tu página estará disponible en:" -ForegroundColor Cyan
    Write-Host "https://TU_USUARIO.github.io/NOMBRE_REPO/" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR al subir los archivos:" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Gray
    Write-Host ""
    Write-Host "Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "1. Verifica que el repositorio existe en GitHub" -ForegroundColor White
    Write-Host "2. Verifica tus credenciales" -ForegroundColor White
    Write-Host "3. Intenta: git pull origin main --allow-unrelated-histories" -ForegroundColor White
    Write-Host "   Luego ejecuta este script de nuevo" -ForegroundColor White
}

Write-Host ""
Read-Host "Presiona Enter para salir"

