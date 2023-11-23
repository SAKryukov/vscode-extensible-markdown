$DirPath = "."
 get-childitem $DirPath -recurse -include *.xaml |
ForEach-Object {
 (Get-Content $_).replace("<","&lt;").replace(">","&gt;") |
 Set-Content $_
 }