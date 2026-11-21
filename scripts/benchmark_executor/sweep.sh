#!/bin/zsh
cd "$(dirname "$0")"
PY=${PYTHON:-python}
ulimit -n 30000
export SUBMIT_EVERY=4
run() { # app rep
  mkdir -p results/sweep
  for rate in 20 40 80 120; do
    if (( ($2 + rate / 20) % 2 )); then order=(thread process); else order=(process thread); fi
    for ex in $order; do
      out=results/sweep/${1%.py}_${ex}_${rate}_$2
      [[ -f $out.json ]] && continue
      $PY -W ignore viral.py $1 $ex $rate 30 $out.json > $out.out 2>&1 || echo "FAILED $out"
      sleep 2
    done
  done
}
for rep in 1 2 3; do run chat.py $rep; done
for rep in 1 2; do run app.py $rep; done
echo SWEEP_DONE
