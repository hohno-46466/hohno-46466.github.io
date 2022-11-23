#!/bin/sh

######################################################################
#
# DESKTOPLINKER.SH: Make a Symbolic Link to the Desktop for the WSL
#
# Written by t-matsuura@usp-lab.com on 2022-08-08
#
######################################################################


# === Initialize =====================================================
set -u
umask 0022
PATH="$(command -p getconf PATH)${PATH:+:}${PATH:-}"
export PATH
export LC_ALL='C'
error_exit() {
  ${2+:} false && echo "${0##*/}: $2" 1>&2
  exit ${1:-0}
}


# === Make sure the OS works on the WSL ==============================

type reg.exe >/dev/null 2>&1
case $? in [!0]*)
  error_exit 1 'This program is only for the OSs running on WSL. Bye!'
  exit 1
  ;;
esac


# === Generate the absolute path to the desktop of this user =========

s=$(reg.exe query 'HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders' /v 'Desktop' |
    sed 's/^ * Desktop *REG_SZ *//' |
    grep '^[A-Z]:'                  |
    tr -d '\r'                      |
    tr '\\' '/'                     )
Dir_desktop="/mnt/$(echo "${s%%:*}" | tr A-Z a-z)${s#??}"

[ -d "$Dir_desktop" ] || {
  error_exit 1 "Can't find your Desktop folder on Windows. Quit..."
  exit 1
}


# === Notify =========================================================

cat <<-MESSAGE
	Your Desktop folder on Windows seems to be mounted on the following directory.
	  $Dir_desktop
	
	Thus you can link the directory from your WSL home by executing the following
	command.
	  ------
	  ln -s "$Dir_desktop" "\$HOME/Desktop"
	  ------
	
	... If you aren't confident to type the command yourself successfully,
	I could do it instead of you.
	MESSAGE

printf 'Do you want me to do it automatically (y/[N])? '; read answer
case $answer in
  Y|y|[Yy][Ee][Ss])
     if   [ -L "$HOME/Desktop" ]; then
       echo
       printf '%s' 'Oops! "$HOME/Desktop" already exists. Can I replace it (y/[N])? '
       read answer
       case $answer in
         Y|y|[Yy][Ee][Ss])
            rm -f "$HOME/Desktop" || { error_exit 1 "Can't remove the current link file"; }
            ;;
         *) 
            echo
            echo 'Okay, I respect your decision. Good-by.'
            exit 0
            ;;
        esac
     elif [ -e "$HOME/Desktop" ]; then
       error_exit 1 '"$HOME/Desktop" already exists as a file or directory. Stop.'
     fi
     echo
     echo 'Okay, leave the rest to me!'
     ln -s "$Dir_desktop" "$HOME/Desktop" || {
       error_exit 1 'Failed to execute the "ln" command. Stop.'
     }
     cat <<-MESSAGE
		
		Finished. You can move to your Windows desktop folder from now on
		by typing the following command. Bye!
		MESSAGE
     ;;
  *)
     echo
     echo 'Okay, I respect your decision. Good-by.'
     exit 0
     ;;
esac

# === Successfully finish ============================================

exit 0
