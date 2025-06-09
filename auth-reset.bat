@echo off
echo ===========================================
echo Authentication Reset and Fix Utility
echo ===========================================
echo.
echo This script will help you fix authentication issues
echo by performing the following actions:
echo.
echo 1. Clear browser cookies (browser-side)
echo 2. Reset authentication state (API)
echo 3. Direct login with admin credentials
echo.
echo ===========================================
echo.

set /p choice=Do you want to proceed? (Y/N): 

if /i "%choice%"=="Y" (
    echo.
    echo Attempting to fix authentication...
    echo.
    
    echo Step 1: Opening page to clear cookies...
    start "" "http://localhost:3000/api/debug/auth-fix?action=clear-cookies"
    
    timeout /t 3 > nul
    
    echo Step 2: Resetting auth state...
    start "" "http://localhost:3000/api/debug/auth-fix?action=reset-auth"
    
    timeout /t 3 > nul
    
    echo Step 3: Attempting direct login...
    start "" "http://localhost:3000/login?debug=true"
    
    echo.
    echo All steps completed! Try logging in using the Direct Login button.
    echo If issues persist, please:
    echo 1. Clear browser cookies manually
    echo 2. Restart the development server
    echo 3. Try opening the login page in a new private/incognito window
) else (
    echo Operation canceled.
)

echo.
pause
