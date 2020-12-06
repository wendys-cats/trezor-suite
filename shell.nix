{ pkgs ? import <nixpkgs> {config.android_sdk.accept_license = true;} }:

# the last successful build of nixos-20.09 (stable) as of 2020-10-11
with import
  (builtins.fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/0b8799ecaaf0dc6b4c11583a3c96ca5b40fcfdfb.tar.gz";
    sha256 = "11m4aig6cv0zi3gbq2xn9by29cfvnsxgzf9qsvz67qr0yq29ryyz";
  })
{ };

let
  androidSdk = pkgs.androidenv.androidPkgs_9_0.androidsdk;
  SuitePython = python3.withPackages(ps: [
    ps.yamllint
  ]);
in
  stdenv.mkDerivation {
    name = "trezor-suite-dev";
    buildInputs = [
      mdbook
      nodejs
      yarn
      androidSdk  # native
      glibc  # native
      jdk11  # native
      android-studio  # native
      watchman  # native
      SuitePython
    ] ++ lib.optionals stdenv.isLinux [
      appimagekit
      nsis
      openjpeg
      osslsigncode
      p7zip
      squashfsTools
      # winePackages.minimal
    ] ++ lib.optionals stdenv.isDarwin (with darwin.apple_sdk.frameworks; [
      Cocoa
      CoreServices
    ]);
    # native: override the aapt2 that gradle uses with the nix-shipped version
    GRADLE_OPTS = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${androidSdk}/libexec/android-sdk/build-tools/28.0.3/aapt2";
    shellHook = ''
      export CURDIR="$(pwd)"
      export PATH="$PATH:$CURDIR/node_modules/.bin"
      export ELECTRON_BUILDER_CACHE="$CURDIR/.cache/electron-builder"
      export ANDROID_HOME=$HOME/Android/Sdk  # native
      export PATH=$PATH:$ANDROID_HOME/emulator  # native
      export PATH=$PATH:$ANDROID_HOME/tools  # native
      export PATH=$PATH:$ANDROID_HOME/tools/bin  # native
      export PATH=$PATH:$ANDROID_HOME/platform-tools  # native
    '';
  }
