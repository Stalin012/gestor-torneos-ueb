# PowerShell Script para limpiar estilos duplicados

Write-Host "🧹 Limpiando estilos CSS duplicados..." -ForegroundColor Cyan
Write-Host ""

# Variables de rutas
$frontendPath = "c:\gestor\frontend\src"
$backendPath = "c:\gestor\backend\resources\js"

# Archivos duplicados a eliminar en Frontend
$frontendFiles = @(
    "$frontendPath\admin_styles.css",
    "$frontendPath\admin_overrides.css",
    "$frontendPath\component_styles.css",
    "$frontendPath\component_system.css",
    "$frontendPath\dashboard_fixes.css",
    "$frontendPath\dynamic_theme.css",
    "$frontendPath\temp_styles.css"
)

# Archivos duplicados a eliminar en Backend
$backendFiles = @(
    "$backendPath\admin_styles.css",
    "$backendPath\admin_navbar.css",
    "$backendPath\admin_overrides.css",
    "$backendPath\admin_sidebar.css",
    "$backendPath\admin_topbar.css",
    "$backendPath\temp_styles.css",
    "$backendPath\component_styles.css",
    "$backendPath\component_system.css",
    "$backendPath\dashboard_fixes.css",
    "$backendPath\dynamic_theme.css"
)

# Eliminar archivos Frontend
Write-Host "Frontend cleanup:" -ForegroundColor Yellow
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Eliminado: $(Split-Path -Leaf $file)" -ForegroundColor Green
    } else {
        Write-Host "  - No encontrado: $(Split-Path -Leaf $file)" -ForegroundColor Gray
    }
}

Write-Host ""

# Eliminar archivos Backend
Write-Host "Backend cleanup:" -ForegroundColor Yellow
foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Eliminado: $(Split-Path -Leaf $file)" -ForegroundColor Green
    } else {
        Write-Host "  - No encontrado: $(Split-Path -Leaf $file)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos CSS restantes (correctos):" -ForegroundColor Cyan
Get-ChildItem "$frontendPath\css" -Filter "*.css" | ForEach-Object {
    Write-Host "  ✓ $_" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Recuerda: Importa solo 'css/index.css' en main.jsx" -ForegroundColor Cyan
