#!/usr/bin/env bash
# Periodic ps sampler. Writes per-process snapshots to processes.csv and
# rolled-up category totals to totals.csv. Stop with SIGTERM/SIGINT — the
# trap flushes a final tick and exits cleanly.
#
# Usage: sampler.sh <output_dir> [interval_seconds]

set -u

OUT_DIR="${1:?output dir required}"
INTERVAL="${2:-2}"

mkdir -p "$OUT_DIR"
PROC_CSV="$OUT_DIR/processes.csv"
TOTALS_CSV="$OUT_DIR/totals.csv"

# Header rows
echo "ts,pid,ppid,pcpu,rss_kb,comm,cmd" > "$PROC_CSV"
echo "ts,py_count,py_rss_kb,node_count,node_rss_kb,chrome_count,chrome_rss_kb,playwright_count,playwright_rss_kb" > "$TOTALS_CSV"

stop=0
trap 'stop=1' TERM INT

# We classify by command-line substring. Note: macOS Chromium for Playwright
# tests usually shows up as "Chromium Helper" / "Chromium" / "chrome"
classify() {
    local cmd="$1"
    case "$cmd" in
        *python*|*Python.framework*) echo "python" ;;
        *node*|*pnpm*) echo "node" ;;
        *Chromium*|*chrome*|*Chrome*Helper*) echo "chrome" ;;
        *) echo "other" ;;
    esac
}

while [ "$stop" -eq 0 ]; do
    ts=$(date +%s)

    # ps with full command line. -ww disables column truncation. -A all procs.
    # We filter to interesting commands inline to keep CSVs small.
    py_count=0; py_rss=0
    node_count=0; node_rss=0
    chrome_count=0; chrome_rss=0
    pw_count=0; pw_rss=0

    # Read ps output. Format: pid ppid pcpu rss command...
    # Using -o command (not comm) keeps the full cmdline for classification.
    while IFS= read -r line; do
        # Skip header
        case "$line" in
            *PID*PPID*) continue ;;
        esac

        # Parse first 4 numeric/short fields, rest is command. Use awk for the
        # whole line because ps right-pads numeric columns with variable
        # whitespace, so `cut -d' '` would mishandle multi-space gaps.
        read -r pid ppid pcpu rss cmd <<< "$(echo "$line" | awk '{
            pid=$1; ppid=$2; pcpu=$3; rss=$4;
            $1=$2=$3=$4="";
            sub(/^ +/, "");
            printf "%s %s %s %s %s", pid, ppid, pcpu, rss, $0
        }')"

        # Skip our own sampler / awk / ps
        case "$cmd" in
            *sampler.sh*|*ps\ -A*|*awk*) continue ;;
        esac

        cat=$(classify "$cmd")

        # Tag playwright-runner node procs separately for visibility
        case "$cmd" in
            *playwright*) is_pw=1 ;;
            *) is_pw=0 ;;
        esac

        # Truncate cmd for CSV friendliness
        cmd_short=$(echo "$cmd" | cut -c1-120 | tr ',' ' ' | tr '\n' ' ')

        if [ "$cat" != "other" ]; then
            echo "$ts,$pid,$ppid,$pcpu,$rss,$cat,$cmd_short" >> "$PROC_CSV"

            case "$cat" in
                python) py_count=$((py_count+1)); py_rss=$((py_rss+rss)) ;;
                node)   node_count=$((node_count+1)); node_rss=$((node_rss+rss))
                        if [ "$is_pw" -eq 1 ]; then
                            pw_count=$((pw_count+1)); pw_rss=$((pw_rss+rss))
                        fi
                        ;;
                chrome) chrome_count=$((chrome_count+1)); chrome_rss=$((chrome_rss+rss)) ;;
            esac
        fi
    done < <(ps -A -ww -o pid=,ppid=,pcpu=,rss=,command=)

    echo "$ts,$py_count,$py_rss,$node_count,$node_rss,$chrome_count,$chrome_rss,$pw_count,$pw_rss" >> "$TOTALS_CSV"

    # Sleep in small chunks so SIGTERM is responsive
    elapsed=0
    while [ "$elapsed" -lt "$INTERVAL" ] && [ "$stop" -eq 0 ]; do
        sleep 1
        elapsed=$((elapsed+1))
    done
done

# Final flush sentinel
ts=$(date +%s)
echo "$ts,SAMPLER_STOPPED,,,,,,," >> "$TOTALS_CSV"
