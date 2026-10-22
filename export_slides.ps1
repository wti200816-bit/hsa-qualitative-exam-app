$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse
$presentation = $ppt.Presentations.Open("E:\AI\dự thi.pptx", [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$outDir = "E:\AI\slides_original"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir }

$presentation.SaveAs("E:\AI\slides_original\slide.png", 18) # 18 = ppSaveAsPNG
$presentation.Close()
$ppt.Quit()
Write-Host "Exported original slides to PNG!"
