{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  packages = with pkgs; [
  ];

  android = {
    enable = true;
    reactNative.enable = true;
  };

  languages = {
    javascript = {
      enable = true;

      package = pkgs.nodejs;

      npm = {
        enable = true;
        # el paquete npm por defecto viene con node; si quieres usar
        # un package npm separado podrías poner pkgs.nodePackages.npm
        # package = pkgs.nodejs;
        install.enable = false; # We'll control installs manually below
      };
    };
  };

  tasks = {
    "project:clean" = {
      exec = ''
        echo "🧹 Limpiando dependencias (node_modules, package-lock.json) y reinstalando..."
        rm -rf node_modules package-lock.json
        npm cache clean --force
        echo "✅ Limpieza completa"
      '';
    };
    "project:setup-dev" = {
      exec = ''
        echo "→ Instalando @angular/cli y @ionic/cli localmente (devDependencies)..."
        npm install --no-audit --no-fund --save-dev @angular/cli @ionic/cli
        echo "✅ Herramientas instaladas en node_modules/.bin"
      '';
    };
  };

  enterShell = ''
    echo "🔧 Node: $(node -v) | npm: $(npm -v)"
    export PATH="$PWD/node_modules/.bin:$PATH"
    export NODE_OPTIONS="--openssl-legacy-provider"

    if command -v ng >/dev/null; then
      echo "✅ Angular CLI detectado: $(ng version | head -n 10)"
    else
      echo "⚠️ Angular CLI no instalado. Ejecuta: devenv tasks run project:setup-dev"
    fi

    if command -v ionic >/dev/null; then
      echo "✅ Ionic CLI detectado: $(ionic --version)"
    else
      echo "⚠️ Ionic CLI no instalado. Ejecuta: devenv run project:setup-dev"
    fi

    echo "Para iniciar el servidor en background: devenv up ionic-dev"
    echo "Para detener todos los procesos: devenv down"
    echo "Para limpiar (npm): devenv tasks run project:clean"
  '';

  enterTest = ''
    echo "Test: git: $(git --version)"
  '';
}
