# .github/workflows/codex_bot.py
#!/usr/bin/env python3
import argparse, os, re, subprocess, sys
from pathlib import Path

def sh(cmd, cwd=None, check=True):
    print("+", cmd)
    return subprocess.check_output(cmd, shell=True, cwd=cwd).decode()

def open_pr(branch, title, body):
    sh(f'git push -u origin {branch}')
    url = sh('gh pr list --state open --limit 1 --json url -q ".[0].url"')
    # もし作成されていなければ作る
    if not url.strip():
        url = sh(f'gh pr create -t "{title}" -b "{body}"')
    return url.strip()

def parse_here(doc: str) -> str:
    # 末尾に余計な空白があっても OK
    m = re.search(r"<<EOF\s*\n(?P<body>[\s\S]*?)\nEOF\s*$", doc)
    return m.group("body") if m else ""

def need(cond: bool, msg: str):
    if not cond:
        raise ValueError(msg)

def cmd_append(body: str):
    m = re.search(r'file=(\S+)', body)
    need(m, "file= が見つかりません。例: /append file=PROJECT.md <<EOF ... EOF")
    file = m.group(1)
    text = parse_here(body)
    need(text != "", "本文（<<EOF ... EOF）が見つかりません。複数行は必ずヒアドキュメントで渡してください。")

    Path(file).parent.mkdir(parents=True, exist_ok=True)
    with open(file, "a", encoding="utf-8") as f:
        if not text.endswith("\n"):
            text += "\n"
        f.write(text)

    sh(f'git add "{file}"')
    sh('git commit -m "chore(bot): append text"')

def cmd_replace(body: str):
    fm = re.search(r'file=(\S+)', body)
    need(fm, "file= が見つかりません。例: /replace file=PROJECT.md find=あ replace=ア flags=g")
    file = fm.group(1)

    findm = re.search(r'find=(.+?)\s+(replace=|$)', body)
    need(findm, "find= が見つかりません。")
    find = findm.group(1)

    repm = re.search(r'replace=(.+?)(\s+flags=|$)', body)
    need(repm, "replace= が見つかりません。")
    repl = repm.group(1)

    flagm = re.search(r'flags=(\S+)', body)
    flags = flagm.group(1) if flagm else ""

    text = Path(file).read_text(encoding="utf-8")
    if 'g' in flags:
        new, count = re.subn(find, repl, text)
    else:
        new = re.sub(find, repl, text, count=1); count = 1 if text != new else 0
    Path(file).write_text(new, encoding="utf-8")

    sh(f'git add "{file}"')
    sh(f'git commit -m "chore(bot): replace ({count} hit)"')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo")
    ap.add_argument("--issue")
    ap.add_argument("--comment", nargs="+")
    a = ap.parse_args()
    body = " ".join(a.comment).strip()

    # 作業ブランチを毎回新規で切る
    br = f'bot/{os.getpid()}'
    sh('git config user.name "codex-bot"')
    sh('git config user.email "bot@example.com"')
    sh('git fetch origin main')
    sh('git checkout -B main origin/main')
    sh(f'git checkout -b {br}')

    try:
        if body.startswith('/append'):
            cmd_append(body)
            title = "chore(bot): append"
        elif body.startswith('/replace'):
            cmd_replace(body)
            title = "chore(bot): replace"
        else:
            sh(f'gh issue comment {a.issue} -R {a.repo} -b "未対応コマンドです: `{body}`\\n対応: /append, /replace"')
            sys.exit(0)

        url = open_pr(br, title, f"Triggered by comment:\\n\\n```\n{body}\n```")
        sh(f'gh issue comment {a.issue} -R {a.repo} -b "PR を作成しました → {url}"')

    except Exception as e:
        # 失敗はエラー内容をコメントに返す
        msg = f"コマンド処理に失敗: {e}"
        try:
            sh(f'gh issue comment {a.issue} -R {a.repo} -b "{msg}"')
        finally:
            print(msg)
            sys.exit(1)

if __name__ == "__main__":
    main()