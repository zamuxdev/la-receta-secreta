#!/usr/bin/env bash
# Revisa que la interfaz cumpla las reglas de AGENTS.md que se pueden comprobar solas.
# Lo corre el CI en cada Pull Request. Para correrlo a mano (Git Bash), desde la raíz del repo:
#   bash .github/scripts/revisar-interfaz.sh
set -u
cd "$(dirname "$0")/../.."

fallas=0

# Muestra el error. En GitHub Actions además lo marca en la línea del PR.
falla() { # archivo linea mensaje
  fallas=$((fallas + 1))
  echo "  ✗ $1:$2: $3"
  if [ -n "${GITHUB_ACTIONS:-}" ]; then echo "::error file=$1,line=$2::$3"; fi
}

# Busca un patrón y reporta cada línea que lo tenga. Ignora los comentarios de una línea.
prohibir() { # patrón mensaje archivos...
  local patron=$1 mensaje=$2; shift 2
  while IFS=: read -r archivo linea _; do
    [ -n "$archivo" ] && falla "$archivo" "$linea" "$mensaje"
  done < <(grep -nE "$patron" "$@" | grep -vE '^[^:]+:[0-9]+:\s*//')
}

echo "1. Solo js/api.js habla con el servidor (sección 5)"
prohibir '\bfetch\(' 'Usa el objeto api en lugar de fetch.' $(ls frontend/js/*.js | grep -v '/api.js$')

echo "2. Sin console.log de depuración (sección 7)"
prohibir 'console\.(log|debug)' 'Quita el console.log de depuración.' frontend/js/*.js

echo "3. No se inserta HTML desde JavaScript (sección 7, XSS)"
prohibir 'innerHTML|outerHTML|insertAdjacentHTML|document\.write' \
  'No insertes HTML: usa textContent, createElement o replaceChildren().' frontend/js/*.js

echo "4. Cada módulo está envuelto en (() => { ... })(); (sección 6)"
# publicar.js todavía no está envuelto (tarea de Yaret, ver TASKS.md). Quitarlo de aquí cuando lo esté.
pendientes="frontend/js/publicar.js"
for archivo in frontend/js/{busqueda,favoritos,calificaciones,acceso,publicar,catalogo}.js; do
  case " $pendientes " in *" $archivo "*) echo "  - $archivo: pendiente, se omite"; continue ;; esac
  primera=$(grep -nvE '^\s*(//.*)?$' "$archivo" | head -1)
  ultima=$(grep -vE '^\s*(//.*)?$' "$archivo" | tail -1)
  if [[ "${primera#*:}" != "(() => {"* || "$ultima" != "})();" ]]; then
    falla "$archivo" "${primera%%:*}" 'Envuelve todo el archivo en (() => { ... })();'
  fi
done

echo "5. Todas las imágenes tienen alt (sección 7)"
while IFS=: read -r linea _; do
  falla frontend/index.html "$linea" 'La imagen necesita el atributo alt.'
done < <(grep -nE '<img\b' frontend/index.html | grep -v 'alt=')

echo "6. El JavaScript no tiene errores de sintaxis"
if command -v node > /dev/null; then
  for archivo in frontend/js/*.js; do
    if ! salida=$(node --check "$archivo" 2>&1); then
      linea=$(echo "$salida" | grep -oE "$archivo:[0-9]+" | head -1 | cut -d: -f2)
      falla "$archivo" "${linea:-1}" "Error de sintaxis: $(echo "$salida" | grep -m1 -E 'Error')"
    fi
  done
else
  echo "  - Node.js no está instalado: se omite (en el CI sí se revisa)"
fi

echo "7. No se suben archivos generados ni PDFs (sección 3)"
while read -r archivo; do
  [ -n "$archivo" ] && falla "$archivo" 1 'Este archivo no se sube al repositorio (bin, obj, node_modules o PDF).'
done < <(git ls-files | grep -E '(^|/)(bin|obj|node_modules)/|\.pdf$')

echo
if [ "$fallas" -gt 0 ]; then
  echo "Hay $fallas problema(s). Las reglas están en AGENTS.md."
  exit 1
fi
echo "Todo bien."
