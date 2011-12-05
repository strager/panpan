#!/bin/bash -x

function forever_wrapped {
    # forever doesn't give proper exit codes,
    # so we sniff for errors
    tmpfile="$(mktemp)"
    forever "$@" 2> "$tmpfile"
    cat "$tmpfile" >&2

    if grep -q 'error' < "$tmpfile"; then
        ecode=1
    else
        ecode=0
    fi
    rm "$tmpfile"
    return $ecode
}

npm install || exit

forever_wrapped stop "$PWD" 2> /dev/null
forever_wrapped start "$PWD" || exit
