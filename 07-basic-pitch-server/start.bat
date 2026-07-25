@"
@echo off
call venv\Scripts\activate
echo Iniciando servidor Basic Pitch en http://localhost:8000
echo Documentacion interactiva en http://localhost:8000/docs
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
"@ | Out-File -FilePath "start.bat" -Encoding ascii
