#!/usr/bin/env python3
import argparse, json, os, re, subprocess, sys, textwrap
from pathlib import Path

# ========= 共通ユーティリティ =========

def sh(cmd, cwd=None, check=True):
    """Run shell, print and return stdout(str)."""
    print("+", cmd)
    cp = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if check and cp.returncode != 0:
        print(cp.stdout)
        print(cp.stderr, file=sys.stderr)
        raise subprocess.CalledProcessError(cp.returncode, cmd, cp.stdout, cp.stderr)
    return cp.stdout.strip()

def post_comment(repo, issue, body):
    safe = body.replace('"', '\\"')
    sh(f'gh issue comment {issue} -R {repo} -b "{safe}"', check=False)

def open_pr(branch, title, body):
    sh(f'git push -u origin {branch}')
    # create or reuse the latest open PR
    url = sh(f'gh pr create -t "{title}" -b "{body}" 2>/dev/null || true', check=False).strip()
    if not url:
        try:
            url = sh('gh pr list --state open --limit 1 --json url -q ".[0].url"')
        except Exception:
            url = ""
    return url

def parse_here(doc):
    """... <<EOF ... EOF を抽出。なければ空文字。"""
    m = re.search(r"<<EOF\\s*\\n(?P<body>[\\s\\S]*?)\\nEOF\\s*$", doc.strip())
    return m.group("body") if m else ""

def extract_arg(text, key):
    m = re.search(rf"{re.escape(key)}=(\\S+)", text)
    return m.group(1) if m else None

# ========= コマンドモード (/append, /replace) =========

def cmd_append(body, repo, issue):
    path = extract_arg(body, "file")
    if not path:
        post_comment(repo, issue, "❌ `file=...` が見つかりません。例: `/append file=PROJECT.md <<EOF ... EOF`")
        sys.exit(0)

    content = parse_here(body)
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("a", encoding="utf-8") as f:
        if content and not content.endswith("\n"):
            content += "\n"
        f.write(content)

    sh(f'git add "{path}"')
    sh('git commit -m "chore(bot): append text"')

def cmd_replace(body, repo, issue):
    path = extract_arg(body, "file")
    if not path or not Path(path).exists():
        post_comment(repo, issue, f"❌ 置換対象ファイルが見つかりません: `{path or '(none)'}`")
        sys.exit(0)

    find = extract_arg(body, "find") or ""
    repl = extract_arg(body, "replace") or ""
    flags = (extract_arg(body, "flags") or "")
    txt = Path(path).read_text(encoding="utf-8")

    if "g" in flags:
        txt, count = re.subn(find, repl, txt)
    else:
        txt = re.sub(find, repl, txt, count=1); count = 1

    Path(path).write_text(txt, encoding="utf-8")
    sh(f'git add "{path}"')
    sh(f'git commit -m "chore(bot): replace ({count} hit)"')

# ========= 自然言語モード (OpenAI) =========

def plan_with_openai(nl_text):
    """
    ユーザーの自然文を編集プラン(JSON)に変換。
    返すJSON例:
      [
        {"op":"create_file","path":"pages/new.html","content":"<html>...</html>"},
        {"op":"append","path":"PROJECT.md","content":"- 追記..."},
        {"op":"replace","path":"index.html","find":"旧","with":"新","flags":"g"}
      ]
    """
    sys_prompt = """あなたはリポジトリ編集用のプランナーです。
出力は**必ず** JSON 配列「だけ」。コードフェンスや説明は不要。
各要素は次のいずれか:
- {"op":"create_file","path":"相対パス","content":"そのまま保存する文字列"}
- {"op":"append","path":"相対パス","content":"末尾に追記する文字列"}
- {"op":"replace","path":"相対パス","find":"正規表現","with":"置換後","flags":"g|"}
注意:
- HTML は最小限の正しい雛形で。
- 既存を書き換える必要が無いなら create_file/append を選ぶ。
"""
    # OpenAI SDK v2
    from openai import OpenAI
    client = OpenAI()
    resp = client.responses.create(
        model="gpt-4o-mini",
        input=[
            {"role":"system","content":sys_prompt},
            {"role":"user","content":nl_text}
        ],
    )
    raw = resp.output_text.strip()

    # ```json ... ``` を除去する保険
    raw = re.sub(r"^```(?:json)?\\s*|\\s*```$", "", raw.strip(), flags=re.IGNORECASE|re.MULTILINE)
    try:
        plan = json.loads(raw)
        if isinstance(plan, list):
            return plan
    except Exception as e:
        print("! openai plan parse error:", e, file=sys.stderr)
    return []

def apply_plan(plan):
    changed = []
    for step in plan:
        op = step.get("op")
        path = step.get("path")
        if not op or not path:
            continue
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)

        if op == "create_file":
            p.write_text(step.get("content",""), encoding="utf-8")
        elif op == "append":
            content = step.get("content","")
            if content and not content.endswith("\n"):
                content += "\n"
            with p.open("a", encoding="utf-8") as f:
                f.write(content)
        elif op == "replace":
            if not p.exists():  # 無いならスキップ
                continue
            txt = p.read_text(encoding="utf-8")
            flags = step.get("flags","")
            if "g" in flags:
                txt, _ = re.subn(step.get("find",""), step.get("with",""), txt)
            else:
                txt = re.sub(step.get("find",""), step.get("with",""), txt, count=1)
            p.write_text(txt, encoding="utf-8")
        else:
            continue

        sh(f'git add "{path}"')
        changed.append(path)

    if changed:
        sh('git commit -m "chore(bot): apply NL plan"')
    return changed

# ========= main =========

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo")
    ap.add_argument("--issue")
    ap.add_argument("--comment", nargs="+")
    a = ap.parse_args()

    body = " ".join(a.comment or []).strip()
    print("# デバッグ: 受け取ったコメントのサイズ", len(body))

    # Git セットアップ＆作業ブランチ
    br = f'bot/{int(os.getpid())}'
    sh('git config user.name "codex-bot"')
    sh('git config user.email "bot@example.com"')
    sh('git fetch origin main')
    sh('git checkout -B main origin/main')
    sh(f'git checkout -b {br}')

    title = None

    if body.startswith('/append'):
        cmd_append(body, a.repo, a.issue)
        title = "chore(bot): append"
    elif body.startswith('/replace'):
        cmd_replace(body, a.repo, a.issue)
        title = "chore(bot): replace"
    else:
        # 自然言語モード
        plan = plan_with_openai(body)
        if not plan:
            post_comment(a.repo, a.issue,
                         "⚠️ 指示を理解できず、変更プランが空でした。\n"
                         "例:\n"
                         "・`pages/characters/rei.html` を新規作成してタイトルと本文を入れて\n"
                         "・`index.html` のナビに『玲』リンクを追加\n"
                         "・`PROJECT.md` に「- 〜を追加」を追記")
            sys.exit(0)
        changed = apply_plan(plan)
        if not changed:
            post_comment(a.repo, a.issue, "⚠️ プランの適用結果が空でした。ファイルパスや条件を見直してください。")
            sys.exit(0)
        title = "chore(bot): apply NL plan"

    pr_url = open_pr(br, title, f"From comment:\\n\\n```\n{body}\n```")
    if pr_url:
        post_comment(a.repo, a.issue, f"PR を作成しました → {pr_url}")
    else:
        post_comment(a.repo, a.issue, "PR 作成に失敗しました。`gh` 権限や GITHUB_TOKEN を確認してください。")

if __name__ == "__main__":
    main()