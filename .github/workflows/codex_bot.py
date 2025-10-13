#!/usr/bin/env python3
import argparse, os, re, subprocess, sys
from pathlib import Path

def sh(cmd, cwd=None):
    print("+", cmd)
    return subprocess.check_output(cmd, shell=True, cwd=cwd).decode()

def open_pr(branch, title, body):
    sh(f'git push -u origin {branch}')
    url = sh(f'gh pr create -t "{title}" -b "{body}" 2>/dev/null || true').strip()
    if not url:
        url = sh('gh pr list --state open --limit 1 --json url -q ".[0].url"')
    return url

def parse_here(doc):
    m = re.search(r"<<EOF\\n(?P<body>[\\s\\S]*?)\\nEOF\\s*$", doc)
    return m.group("body") if m else ""

def cmd_append(args):
    file = re.search(r'file=(\\S+)', args).group(1)
    body = parse_here(args)
    Path(file).parent.mkdir(parents=True, exist_ok=True)
    with open(file, "a", encoding="utf-8") as f:
        f.write(("" if body.endswith("\\n") else "\\n") + body + "\\n")
    sh(f'git add "{file}"')
    sh('git commit -m "chore(bot): append text"')

def cmd_replace(args):
    file = re.search(r'file=(\\S+)', args).group(1)
    find = re.search(r'find=(.+?)\\s+(replace=|$)', args).group(1)
    repm = re.search(r'replace=(.+?)(\\s+flags=|$)', args)
    repl = repm.group(1) if repm else ""
    flags = re.search(r'flags=(\\S+)', args)
    text = Path(file).read_text(encoding="utf-8")
    count = 0
    if flags and 'g' in flags.group(1):
        text, count = re.subn(find, repl, text)
    else:
        text = re.sub(find, repl, text, count=1); count = 1
    Path(file).write_text(text, encoding="utf-8")
    sh(f'git add "{file}"')
    sh(f'git commit -m "chore(bot): replace ({count} hit)"')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo"); ap.add_argument("--issue"); ap.add_argument("--comment", nargs="+")
    a = ap.parse_args()
    body = " ".join(a.comment).strip()

    br = f'bot/{int(os.getpid())}'
    sh('git config user.name "codex-bot"')
    sh('git config user.email "bot@example.com"')
    sh('git fetch origin main'); sh('git checkout -B main origin/main')
    sh(f'git checkout -b {br}')

    if body.startswith('/append'):
        cmd_append(body)
        title = "chore(bot): append"
    elif body.startswith('/replace'):
        cmd_replace(body)
        title = "chore(bot): replace"
    else:
        sh(f'gh issue comment {a.issue} -R {a.repo} -b "未対応コマンドです: `{body}`\\n対応：/append, /replace"')
        sys.exit(0)

    url = open_pr(br, title, f"Triggered by comment:\\n\\n```\n{body}\n```")
    sh(f'gh issue comment {a.issue} -R {a.repo} -b "PR を作成しました → {url}"')

if __name__ == "__main__":
    main()