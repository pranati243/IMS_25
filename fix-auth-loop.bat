@echo off
echo ===== IMS HINDAVI DEPLOYMENT FIX SCRIPT =====
echo This script will help fix the authentication issues on your Vercel deployment

echo.
echo [1/5] Backing up current files...
copy "middleware.ts" "middleware.ts.backup"
copy "app\login\login-form.tsx" "app\login\login-form.tsx.backup"

echo.
echo [2/5] Implementing fixed middleware...
copy "middleware.ts.new" "middleware.ts"
echo Middleware updated!

echo.
echo [3/5] Implementing fixed login form...
copy "app\login\login-form.tsx.new" "app\login\login-form.tsx"
echo Login form updated!

echo.
echo [4/5] Adding debugging console logs to auth-provider.tsx...
powershell -Command "(Get-Content 'app\providers\auth-provider.tsx') | ForEach-Object { $_ -replace 'useEffect\(\(\) => \{', 'useEffect(() => { console.log(\"Auth provider route protection useEffect running for path:\", pathname);' } | Set-Content 'app\providers\auth-provider.tsx'"
echo Added debugging to auth-provider!

echo.
echo [5/5] Creating a simple auth test HTML page...
echo ^<!DOCTYPE html^> > auth-test.html
echo ^<html lang="en"^> >> auth-test.html
echo ^<head^> >> auth-test.html
echo   ^<meta charset="UTF-8"^> >> auth-test.html
echo   ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> auth-test.html
echo   ^<title^>Auth Test Page^</title^> >> auth-test.html
echo   ^<style^> >> auth-test.html
echo     body { font-family: Arial, sans-serif; padding: 20px; } >> auth-test.html
echo     pre { background: #f5f5f5; padding: 10px; border-radius: 5px; } >> auth-test.html
echo     .result { margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; } >> auth-test.html
echo     button { margin: 5px; padding: 8px 16px; background: #4a65ff; color: white; border: none; border-radius: 4px; cursor: pointer; } >> auth-test.html
echo     button:hover { background: #3a55ff; } >> auth-test.html
echo   ^</style^> >> auth-test.html
echo ^</head^> >> auth-test.html
echo ^<body^> >> auth-test.html
echo   ^<h1^>IMS Auth Test Tool^</h1^> >> auth-test.html
echo   ^<p^>This page tests various auth-related functions to help diagnose issues.^</p^> >> auth-test.html
echo   ^<div^> >> auth-test.html
echo     ^<button id="checkCookies"^>Check Cookies^</button^> >> auth-test.html
echo     ^<button id="testApi"^>Test API Connection^</button^> >> auth-test.html
echo     ^<button id="testAuth"^>Test Auth Status^</button^> >> auth-test.html
echo     ^<button id="clearCookies"^>Clear Cookies^</button^> >> auth-test.html
echo   ^</div^> >> auth-test.html
echo   ^<div class="result" id="result"^>Results will appear here...^</div^> >> auth-test.html
echo   ^<script^> >> auth-test.html
echo     document.getElementById('checkCookies').addEventListener('click', function() { >> auth-test.html
echo       const cookies = document.cookie.split(';').map(c => c.trim()); >> auth-test.html
echo       document.getElementById('result').innerHTML = `^<h3^>Cookies^</h3^>^<pre^>${cookies.join('\n')}^</pre^>`; >> auth-test.html
echo     }); >> auth-test.html
echo. >> auth-test.html
echo     document.getElementById('testApi').addEventListener('click', async function() { >> auth-test.html
echo       try { >> auth-test.html
echo         const response = await fetch('/api/debug/diagnostic', { >> auth-test.html
echo           credentials: 'include', >> auth-test.html
echo           headers: { 'Content-Type': 'application/json' } >> auth-test.html
echo         }); >> auth-test.html
echo         const data = await response.json(); >> auth-test.html
echo         document.getElementById('result').innerHTML = `^<h3^>API Response^</h3^>^<pre^>${JSON.stringify(data, null, 2)}^</pre^>`; >> auth-test.html
echo       } catch (err) { >> auth-test.html
echo         document.getElementById('result').innerHTML = `^<h3^>API Error^</h3^>^<pre^>${err.message}^</pre^>`; >> auth-test.html
echo       } >> auth-test.html
echo     }); >> auth-test.html
echo. >> auth-test.html
echo     document.getElementById('testAuth').addEventListener('click', async function() { >> auth-test.html
echo       try { >> auth-test.html
echo         const response = await fetch('/api/auth/me', { >> auth-test.html
echo           credentials: 'include', >> auth-test.html
echo           headers: { 'Content-Type': 'application/json' } >> auth-test.html
echo         }); >> auth-test.html
echo         const data = await response.json(); >> auth-test.html
echo         document.getElementById('result').innerHTML = `^<h3^>Auth Status^</h3^>^<pre^>${JSON.stringify(data, null, 2)}^</pre^>`; >> auth-test.html
echo       } catch (err) { >> auth-test.html
echo         document.getElementById('result').innerHTML = `^<h3^>Auth Error^</h3^>^<pre^>${err.message}^</pre^>`; >> auth-test.html
echo       } >> auth-test.html
echo     }); >> auth-test.html
echo. >> auth-test.html
echo     document.getElementById('clearCookies').addEventListener('click', function() { >> auth-test.html
echo       document.cookie.split(';').forEach(function(c) { >> auth-test.html
echo         document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;'; >> auth-test.html
echo       }); >> auth-test.html
echo       document.getElementById('result').innerHTML = `^<h3^>Cookies Cleared^</h3^>^<p^>All cookies have been cleared.^</p^>`; >> auth-test.html
echo     }); >> auth-test.html
echo   ^</script^> >> auth-test.html
echo ^</body^> >> auth-test.html
echo ^</html^> >> auth-test.html
echo Created auth test page. Place this in your public folder before deploying.

echo.
echo ===== DEPLOYMENT INSTRUCTIONS =====
echo 1. Copy auth-test.html to your "public" folder:
echo    copy auth-test.html public\auth-test.html
echo.
echo 2. Commit and push these changes to your repository.
echo.
echo 3. After deployment, you can access the auth test page at:
echo    https://ims-25-omega.vercel.app/auth-test.html
echo.
echo 4. If issues persist, make sure your environment variables are properly set in Vercel:
echo    - JWT_SECRET should be set to the same value you use locally
echo    - DATABASE_URL should point to your Railway MySQL database
echo.
echo 5. Remember to clear your browser cookies before testing again
echo.
echo Good luck with your deployment!
