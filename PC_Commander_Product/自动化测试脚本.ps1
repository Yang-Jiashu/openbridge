# PC Commander - 自动化测试脚本
# 一键测试所有功能

param(
    [switch]$Verbose,
    [string]$ServerUrl = "http://localhost:8000"
)

$ErrorActionPreference = "Continue"
$testResults = @()
$passed = 0
$failed = 0

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   $Title" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Test-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [int]$Timeout = 10
    )
    
    $url = "$ServerUrl$Endpoint"
    $result = @{
        Name = $Name
        Endpoint = $Endpoint
        Method = $Method
        Status = "FAIL"
        Response = ""
        Duration = 0
    }
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $params = @{
            Uri = $url
            Method = $Method
            UseBasicParsing = $true
            TimeoutSec = $Timeout
        }
        
        if ($Body -and $Method -eq "POST") {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        $stopwatch.Stop()
        
        $result.Duration = $stopwatch.ElapsedMilliseconds
        $result.Response = $response.Content.Substring(0, [Math]::Min(100, $response.Content.Length))
        
        if ($response.StatusCode -eq 200) {
            $result.Status = "PASS"
            $script:passed++
        } else {
            $script:failed++
        }
    }
    catch {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.ElapsedMilliseconds
        $result.Response = $_.Exception.Message.Substring(0, [Math]::Min(100, $_.Exception.Message.Length))
        $script:failed++
    }
    
    $script:testResults += $result
    
    # 输出结果
    $statusColor = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    $statusIcon = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
    Write-Host "$statusIcon $Name ($Method $Endpoint) - " -NoNewline
    Write-Host $result.Status -ForegroundColor $statusColor -NoNewline
    Write-Host " (${result.Duration}ms)"
    
    if ($Verbose -and $result.Response) {
        Write-Host "   响应: $($result.Response)" -ForegroundColor Gray
    }
}

function Test-FileExistence {
    param(
        [string]$Name,
        [string]$Path
    )
    
    $exists = Test-Path $Path
    $result = @{
        Name = $Name
        Endpoint = $Path
        Method = "FILE"
        Status = if ($exists) { "PASS" } else { "FAIL" }
        Response = ""
        Duration = 0
    }
    
    $script:testResults += $result
    
    $statusColor = if ($exists) { "Green" } else { "Red" }
    $statusIcon = if ($exists) { "✅" } else { "❌" }
    Write-Host "$statusIcon $Name ($Path) - " -NoNewline
    Write-Host $(if ($exists) { "EXISTS" } else { "MISSING" }) -ForegroundColor $statusColor
    
    if ($exists) { $script:passed++ } else { $script:failed++ }
}

# ===== 开始测试 =====
Clear-Host
Write-Host "========================================" -ForegroundColor Blue
Write-Host "   PC Commander - 自动化测试" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host "服务器: $ServerUrl" -ForegroundColor Gray
Write-Host "时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# 1. 服务器连接测试
Write-TestHeader "1. 服务器连接测试"
Test-Api -Name "健康检查" -Method "GET" -Endpoint "/api/health"

# 2. API 功能测试
Write-TestHeader "2. API 功能测试"
Test-Api -Name "获取配置" -Method "GET" -Endpoint "/api/config"
Test-Api -Name "AI 聊天" -Method "POST" -Endpoint "/api/chat" -Body @{ message = "你好" }
Test-Api -Name "更新配置" -Method "POST" -Endpoint "/api/config" -Body @{ serverUrl = "http://localhost:8000" }
Test-Api -Name "执行命令" -Method "POST" -Endpoint "/api/execute" -Body @{ command = "dir" }
Test-Api -Name "获取状态" -Method "GET" -Endpoint "/api/status"

# 3. 文件结构检查
Write-TestHeader "3. 文件结构检查"
$basePath = "$PSScriptRoot"
Test-FileExistence -Name "服务器代码" -Path "$basePath\PC_Server\server.js"
Test-FileExistence -Name "手机端首页" -Path "$basePath\Mobile_App_Source\pages\index\index.vue"
Test-FileExistence -Name "手机端配置页" -Path "$basePath\Mobile_App_Source\pages\config\api.vue"
Test-FileExistence -Name "Dashboard" -Path "$basePath\PC_Web_Dashboard\dashboard.html"
Test-FileExistence -Name "i18n 工具" -Path "$basePath\Mobile_App_Source\utils\i18n.js"

# 4. 配置检查
Write-TestHeader "4. 配置检查"
$configPath = "$basePath\PC_Server\config\api-config.json"
if (Test-Path $configPath) {
    try {
        $config = Get-Content $configPath | ConvertFrom-Json
        Write-Host "✅ 配置文件格式正确" -ForegroundColor Green
        $passed++
    }
    catch {
        Write-Host "❌ 配置文件格式错误" -ForegroundColor Red
        $failed++
    }
} else {
    Write-Host "❌ 配置文件不存在" -ForegroundColor Red
    $failed++
}

# ===== 测试报告 =====
Write-TestHeader "测试报告"

$total = $passed + $failed
$passRate = if ($total -gt 0) { [math]::Round(($passed / $total) * 100, 1) } else { 0 }

Write-Host "总测试数: $total" -ForegroundColor White
Write-Host "通过: $passed" -ForegroundColor Green
Write-Host "失败: $failed" -ForegroundColor Red
Write-Host "通过率: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 50) { "Yellow" } else { "Red" })

# 失败的测试详情
if ($failed -gt 0) {
    Write-Host "`n❌ 失败的测试:" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "   • $($_.Name) ($($_.Method) $($_.Endpoint))" -ForegroundColor Red
    }
}

# 保存报告
$reportPath = "$basePath\测试报告-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$testResults | Format-Table -AutoSize | Out-File $reportPath
Write-Host "`n📄 详细报告已保存: $reportPath" -ForegroundColor Gray

Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "   测试完成!" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
