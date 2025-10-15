{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{

  # https://devenv.sh/packages/
  packages = [

  ];

  # https://devenv.sh/languages/
  languages.javascript = {
    enable = true;
    npm.enable = true;
  };

  env.ANDROID_HOME = [ "/home/lemisora/studio_files" ];

  # https://devenv.sh/processes/
  # processes.dev.exec = "${lib.getExe pkgs.watchexec} -n -- ls -la";

  # https://devenv.sh/services/
  # services.postgres.enable = true;

  # https://devenv.sh/scripts/
  # scripts.hello.exec = ''
  # '';

  # https://devenv.sh/basics/
  enterShell = '''';

  # https://devenv.sh/tasks/
  # tasks = {
  #   "myproj:setup".exec = "mytool build";
  #   "devenv:enterShell".after = [ "myproj:setup" ];
  # };

  # https://devenv.sh/tests/
  enterTest = '''';
}
