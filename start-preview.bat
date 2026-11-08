@echo off
rem -- Serve the workspace root so the preview can iframe the real restaurant site --
cd /d "%~dp0.."
start "" http://localhost:8080/
py -m http.server 8080 2>nul || python -m http.server 8080
