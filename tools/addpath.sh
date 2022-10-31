#!/bin/sh

# Note: You can download the latest version by using the command below:
# $ wget https://richlab.org/j/5p84/addpath.sh

######################################################################
#
# ADDPATH.SH: Indicator of How to Add New Paths Into the Proper Run-Script
#
# Written by t-matsuura@usp-lab.com on 2022-08-09
#
######################################################################

# To distributors:
# - This command originally requires one or more arguments, which are
#   the directories to be inserted into the PATH variable. However,
#   you can embed the paths into this shell script before distributing.
# - If you want to do so, insert a line just after this paragraph.
# - For example, uncomment the following line (the "set" command ) if
#   you want to embed the two directories "/PATH/TO/COMMAND/A" and
#   "/PATH/TO/COMMAND/B."
#   -----
#   set -- "/PATH/TO/COMMAND/A" "/PATH/TO/COMMAND/B"
#   -----


[ $# -eq 0 ] && {
  echo "Usage: ${0##*/} dirname_to_be_inserted_to_PATH_#1 [#2...]" 1>&2
  exit 1
}

paths=''
for dir in "$@"; do
  eval [ -d \""$dir"\" ] #"
  case $? in [!0]*)
    echo "$dir: No such directory" 1>&2
    exit 1
  ;; esac
  paths="${paths}:$dir"
done
paths=${paths#:}

case ${SHELL##*/} in
  tcsh)  type='C shell'
         prompt='%'
         createstartts="touch"
         line_to_be_inserted="setenv PATH \"${paths}:\$PATH\""
         startrss="$startrss \$HOME/.tcshrc"
         startrss="$startrss \$HOME/.cshrc"
         ;;
  csh)  type='C shell'
         prompt='%'
         line_to_be_inserted="setenv PATH \"${paths}:\$PATH\""
         createstartts="touch"
         startrss="$startrss \$HOME/.cshrc"
         ;;
  bash)  type='Bourne shell'
         prompt='$'
         line_to_be_inserted="export PATH=\"${paths}:\$PATH\""
         createstartts="echo '[ -f \"\$HOME/.bashrc\" ] && . \"\$HOME/.bashrc\" >'"
         startrss="$startrss \$HOME/.bash_profile"
         startrss="$startrss \$HOME/.profile"
         ;;
  zsh)   type='Bourne shell'
         prompt='$'
         line_to_be_inserted="export PATH=\"${paths}:\$PATH\""
         createstartts="echo '[ -f \"\$HOME/.zshrc\" ] && . \"\$HOME/.zshrc\" >'"
         startrss="$startrss \$HOME/.zpath"
         startrss="$startrss \$HOME/.zshenv"
         startrss="$startrss \$HOME/.zprofile"
         ;;
  *sh)   type='Bourne shell'
         prompt='$'
         createstartts="echo '[ -f \"\$HOME/.shrc\" ] && . \"\$HOME/.shrc\" >'"
         line_to_be_inserted="export PATH=\"${paths}:\$PATH\""
         startrss="$startrss \$HOME/.profile"
         ;;
esac

yourstartrs=''
for startrs in $startrss; do
  eval actualstartrs=\"$startrs\" # "
  [ -f "$actualstartrs" ] && { yourstartrs=$startrs; break; }
done
[ -z "$yourstartrs" ] && yourstartrs=${startrss##* }

cat <<-MESSAGE
	YOUR SHELL:
	  The shell you are using is "${SHELL##*/}."
	  And, it is a kind of "${type}."

	YOUR RUN-SCRIPT:
	  The run script you should edit is probably "${yourstartrs}."
	  (But it might be different if you use your shell in irregular usage.)

	HOW TO EDIT IT:
	  1) If "${yourstartrs}" doesn't exit, create it
	     with running the following command.
	     ------
	     $prompt [ -f "${yourstartrs}" ] || $createstartts "${yourstartrs}"
	     ------
	  2) Open it with your favorite text editor, like this.
	     ------
	     $prompt vi "${yourstartrs}"
	     ------
	  3) Find the line setting the environment variable "PATH"
	     in the file "${yourstartrs}."
	     - If you found more that one such line, pay attention to
	       the last one of them.
	     - If you could find no such line,  pay attention to
	       the last line of the file.
	  4) Insert the following line just after the line you are paying
	     attention to.
	     ------
	     $line_to_be_inserted
	     ------
	  5) To activate the setting, logout once and login again.
	     Or, run the following command.
	     ------
	     $prompt $line_to_be_inserted
	     ------
	
	... If you aren't confident to do this procedure yourself successfully,
	I could do it instead of you.
	MESSAGE

printf 'Do you want me to do it automatically [y/N]? '; read answer
case $answer in Y|y|[Yy][Ee][Ss])
  echo 'Okay, leave the rest to me!'

  backupsuffix=".$(date +%Y%m%d%H%M%S).backup"
  [ -f "$actualstartrs" ] || eval $createstartts "$actualstartrs"
  #n=$(grep ^ "$actualstartrs"                                           |
  #    nl -b a                                                           |
  #    sed 's/[[:blank:]]\{1,\}#.*$//'                                   |
  #    case $type in                                                     #
  #     (B*) grep -E '(^|[[:blank:]])PATH='                             ;;
  #     (C*) grep -E '(^|[[:blank:]])setenv[[:blank:]]+PATH[[:blank:]]+';;
  #    esac                                                              |
  #    awk 'BEGIN{n=0}; {n=$1}; END{print (n>0)?n:"$";}'                 )
  n='$'
  [ -f "$actualstartrs" ] || touch "$actualstartrs"
  grep ^ "$actualstartrs" |
  sed -n "1,${n}p"        >  "${actualstartrs%/*}/${actualstartrs##*/}.new"
  printf '%s\n' "$line_to_be_inserted" >> "${actualstartrs%/*}/${actualstartrs##*/}.new"
  grep ^ "$actualstartrs" |
  sed    "1,${n}d"        >> "${actualstartrs%/*}/${actualstartrs##*/}.new"
  mv "$actualstartrs" "${actualstartrs%/*}/${actualstartrs##*/}${backupsuffix}" &&
  mv "${actualstartrs%/*}/${actualstartrs##*/}.new" "$actualstartrs"

  cat <<-MESSAGE

	Finished. Now, logout once and login again to make sure of the new PATH.
	If it happens something wrong, type the following command to restore the
	previous setting.
	  -----
	  $prompt mv "${yourstartrs%/*}/${yourstartrs##*/}${backupsuffix}" "${yourstartrs}"
	  -----
	If it works correctly, you may remove the backup file, like this.
	  -----
	  $prompt rm "${yourstartrs%/*}/${yourstartrs##*/}${backupsuffix}"
	  -----
	MESSAGE
;; esac

exit 0
