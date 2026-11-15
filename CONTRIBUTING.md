# Contribution Guide

[English](#en-us) | [简体中文](#zh-cn)

## en-us

This guide explains how our team collaborates on the CodeLingo repository. Please follow this workflow for every task so that work is traceable, changes can be reviewed, and the `main` branch remains stable.

> **Important:** We work in one shared GitHub repository. You do not need to fork the repository. Each teammate works on their own branch and opens a Pull Request (PR) to merge changes into `main`.

### 1. Issue-first development

All development work must be tracked by a GitHub Issue.

Before you start coding:

1. Find the Issue assigned to you, or self-assign an existing Issue, in the repository's **Issues** tab or GitHub Projects board.
2. Read its description, requirements, acceptance criteria, and any linked discussions.
3. Check whether the Issue depends on another task or shared component that is not ready yet.
4. Ask questions in the Issue if anything is unclear.

Keep each Issue focused on one task. Do not add unrelated features, refactor unrelated code, or change shared design decisions as part of an Issue. If you discover additional work, create the Issue by yourself or tell the team leader to help create one.

### 2. Contribution process (step by step)

Instructions are provided for both the VS Code Source Control extension (GUI) and the git terminal (CLI).

#### Step 1. Get the repository (First Time Only)

Using VS Code:

1. Open the CodeLingo repository on GitHub: https://github.com/Staruto/GRP-CodeLingo.
2. Click **Code**, copy the HTTPS URL, and open VS Code.
3. Open the Command Palette (`Ctrl+Shift+P`), select **Git: Clone**, and paste the URL.
4. Choose a local folder and open the cloned repository in VS Code.
5. Sign in to GitHub in VS Code if prompted.

Using the terminal:

```bash
git clone https://github.com/Staruto/GRP-CodeLingo
cd GRP-CodeLingo
git status
```

If you have already cloned the repository, do not clone it again. Open your existing local `codelingo` folder.

#### Step 2. Update `main` and create your own branch

Always create a new task branch from the latest `main` branch. Do not develop directly on `main`.

Using VS Code:

1. Open the **Source Control** view (`Ctrl+Shift+G`).
2. Check the current branch in the bottom-left status bar. Select `main` if you are on another branch.
3. Pull the latest changes from GitHub. You can use the Source Control `...` menu and select **Pull**, or run **Git: Pull** from the Command Palette.
4. Click the branch name in the status bar and choose **Create New Branch...**.
5. Enter a branch name following the convention below. Create the branch from `main`.

Using the terminal instead:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/12-problem-list
```

Replace `12` with the Issue number and `problem-list` with a short description of your task.

**Branch naming convention**

Use the Issue number and a short, lowercase, hyphen-separated description:

| Prefix | Use | Example |
| --- | --- | --- |
| `feature/` | New page or functionality | `feature/12-problem-list` |
| `fix/` | Bug fix | `fix/18-navbar-layout` |
| `docs/` | Documentation | `docs/21-contribution-guide` |
| `chore/` | Maintenance or configuration | `chore/25-update-dependencies` |

Each Issue should normally have one branch and one PR. A branch should have one primary owner. Do not work on another teammate's branch unless you are explicitly pairing with them.

#### Step 3. Implement the Issue

Some files affect the whole application. Coordinate before changing them, especially:

- `src/app/layout.tsx`
- `src/app/globals.css`
- Shared navigation, layout, and UI components
- `package.json` and `package-lock.json`
- Next.js, TypeScript, ESLint, or Tailwind configuration

If you get stuck or discover that the Issue's requirements conflict with the existing code, leave a comment on the Issue and ask for help. Do not silently change the agreed scope.

#### Step 4. Test and review your own changes

Before committing, check your work yourself:

1. Run the application locally and open the page or component you changed.
2. Check the expected interactions and relevant screen sizes.
3. Check that your change has not obviously broken related pages.
4. Run the available project checks:

   ```bash
   npm run lint
   npm run build
   ```

5. Inspect the files changed in VS Code's **Source Control** view. Make sure there are no unrelated changes, debug statements, accidental generated files, or secrets.

If a check fails, investigate and fix it before opening a PR. If you cannot fix it, explain the failure in your PR rather than claiming that the check passed.

#### Step 5. Commit and push your branch

Use clear commit messages following a simple Conventional Commits style:

```text
feat(problems): add problem list page
fix(layout): correct mobile navigation spacing
docs: update contribution guide
style(login): adjust form alignment
```

Common prefixes:

| Prefix | Use |
| --- | --- |
| `feat` | New functionality or page |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Styling changes that do not alter functionality |
| `refactor` | Code restructuring without intended behavior change |
| `test` | Adding or updating tests |
| `chore` | Maintenance or tooling |

Using VS Code:

1. Open **Source Control** (`Ctrl+Shift+G`).
2. Review the changed files and stage only the files that belong to your Issue. Use the `+` icon next to each file. Avoid **Stage All** if you have unrelated changes.
3. Enter a clear commit message and select **Commit**.
4. Select **Publish Branch** or **Push** to upload your branch to the shared GitHub repository.

Using the terminal:

```bash
git status
git diff
git add <files-to-include>
git commit -m "feat(problems): add problem list page"
git push -u origin feature/12-problem-list
```

For later commits on the same branch, use `git push`.

#### Step 6. Open a Pull Request

When your changes are ready, open a PR from your task branch into the repository's `main` branch.

Using GitHub:

1. Open the CodeLingo repository on GitHub.
2. Select **Pull requests** and click **New pull request** (or use the prompt shown after pushing your branch).
3. Set the **base** branch to `main` and the **compare** branch to your task branch.
4. Use a clear PR title, following the same style as commit messages. For example: `feat(problems): add problem list page`.
5. Complete the PR description template.
6. Link the related Issue in the description. Use `Closes #12` if the PR completes that Issue.
7. Add screenshots for UI changes where useful.
8. Request a review from the team leader or the designated reviewer.

Do not merge your own PR. The team leader or designated maintainer will review and merge it after approval.

#### Step 7. Review feedback and update your PR

A reviewer may ask questions or request changes. When this happens:

1. Read the comments and ask for clarification if needed.
2. Make the requested changes on the **same task branch**.
3. Run the relevant checks again.
4. Commit and push the updates to the same branch. The existing PR will update automatically.
5. Reply to the review comments and resolve conversations when they have been addressed.

Do not open a second PR for review changes to the same Issue. If the requested work is outside the original Issue's scope, discuss whether a separate Issue and PR are more appropriate.

#### Step 8. Merge and start the next task

After the PR has been approved and any required checks have passed, the team leader or designated maintainer will merge it into `main`.

After the PR is merged:

1. Delete your task branch using GitHub's **Delete branch** button, unless the reviewer asks you to keep it.
2. Switch back to `main` locally and pull the latest changes:

    Using VS Code:
    
    1. Click the branch icon in the bottom-left corner.
    2. In the window that pops up above, click main.
    3. In Changes ..., click pull.

    Using the terminal:

```bash
git switch main
git pull --ff-only origin main
```

3. Create a new branch from the updated `main` when you start your next Issue.

Because everyone works in the same repository, there is no need to fork the repository or configure an `upstream` remote. The shared repository's `origin` remote is used for pulling `main` and pushing your task branches.

### 3. Questions and blockers

If you are blocked, comment on the related GitHub Issue with:

1. What you were trying to do.
2. What happened or what is unclear.
3. What you have already tried.
4. What help or decision you need.

### 4. PR checklist

Before requesting review, make sure that:

- [ ] The PR addresses an assigned GitHub Issue.
- [ ] The PR contains only changes related to that Issue.
- [ ] The PR description explains what changed and links the Issue.
- [ ] I reviewed my own diff and local test `npm run lint` and `npm run build` passes.
- [ ] No secrets, credentials, local environment files, or private data are included.

---

## zh-cn

本指南说明我们的团队如何在 CodeLingo 仓库中协作。请在每个任务中遵循此工作流，以便工作可追溯、更改可审阅，并保持 `main` 分支稳定。

> **重要：** 我们在一个共享的 GitHub 仓库中工作。你不需要 fork 仓库。每位队友在自己的分支上工作，并打开 Pull Request（PR）将更改合并到 `main`。

### 1. 以 Issue 为先的开发

所有开发工作都必须由 GitHub Issue 跟踪。

在开始编码之前：

1. 在仓库的 **Issues** 标签页或 GitHub Projects 看板中找到分配给你的 Issue，或选择一个现有 Issue 并分配给自己。
2. 阅读其描述、需求、验收标准以及任何关联的讨论。
3. 检查该 Issue 是否依赖于另一个尚未完成的任务或共享组件。
4. 如有任何不清楚的地方，请在 Issue 中提问。

让每个 Issue 专注于一个任务。不要作为某个 Issue 的一部分添加无关功能、重构无关代码或更改共享设计决策。如果你发现了额外工作，请告诉团队负责人。你可自行创建Issue或请他创建单独的 Issue。

### 2. 贡献流程（分步说明）

提供VSCode Source Control插件(GUI)与git终端(CLI)两种模式的说明

#### 第 1 步：获取仓库 (仅第一次)

使用 VS Code：

1. 在 GitHub 上打开 CodeLingo 仓库：https://github.com/Staruto/GRP-CodeLingo。
2. 点击 **Code**，复制 HTTPS URL，然后打开 VS Code。
3. 打开命令面板（`Ctrl+Shift+P`），选择 **Git: Clone**，粘贴 URL。
4. 选择一个本地文件夹，在 VS Code 中打开克隆的仓库。
5. 如果提示，请在 VS Code 中登录 GitHub。

使用终端：
```bash
git clone https://github.com/Staruto/GRP-CodeLingo
cd GRP-CodeLingo
git status
```

如果你已经克隆了仓库，请不要再次克隆。打开你现有的本地 `codelingo` 文件夹。

#### 第 2 步：更新 `main` 并创建你自己的分支

始终从最新的 `main` 分支创建新的任务分支。不要在 `main` 上直接开发。

使用 VS Code：

1. 打开 **Source Control** 视图（`Ctrl+Shift+G`）。
2. 在左下角状态栏中检查当前分支。如果你在其他分支上，请选择 `main`。
3. 从 GitHub 拉取最新更改。你可以使用 Source Control 的 `...` 菜单并选择 **Pull**，或从命令面板运行 **Git: Pull**。
4. 点击状态栏中的分支名称，选择 **Create New Branch...**。
5. 按照下面的约定输入分支名称。从 `main` 创建分支。

改用终端：

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/12-problem-list
```

将 `12` 替换为 Issue 编号，将 `problem-list` 替换为任务的简短描述。

**分支命名约定**

使用 Issue 编号和简短、小写、以连字符分隔的描述：

| 前缀 | 用途 | 示例 |
| --- | --- | --- |
| `feature/` | 新页面或功能 | `feature/12-problem-list` |
| `fix/` | 修复缺陷 | `fix/18-navbar-layout` |
| `docs/` | 文档 | `docs/21-contribution-guide` |
| `chore/` | 维护或配置 | `chore/25-update-dependencies` |

每个 Issue 通常应有一个分支和一个 PR。一个分支应有一个主要所有者。除非你明确与某位队友配对，否则不要在他们 的分支上工作。

#### 第 3 步：实现 Issue

有些文件会影响整个应用。更改它们之前请先协调，尤其是：

- `src/app/layout.tsx`
- `src/app/globals.css`
- 共享导航、布局和 UI 组件
- `package.json` 和 `package-lock.json`
- Next.js、TypeScript、ESLint 或 Tailwind 配置

如果你遇到困难，或发现 Issue 的需求与现有代码冲突，请在 Issue 上发表评论并寻求帮助。不要悄悄更改已商定的范围。

#### 第 4 步：测试并审阅你自己的更改

在提交之前，请自行检查你的工作：

1. 在本地运行应用，打开你更改的页面或组件。
2. 检查预期交互和相关屏幕尺寸。
3. 检查你的更改没有明显破坏相关页面。
4. 运行可用的项目检查：

   ```bash
   npm run lint
   npm run build
   ```

5. 在 VS Code 的 **Source Control** 视图中检查更改的文件。确保没有无关更改、调试语句、意外生成的文件或机密信息。

如果检查失败，请在打开 PR 之前调查并修复。如果你无法修复，请在 PR 中说明失败情况，而不是声称检查已通过。

#### 第 5 步：提交并推送你的分支

使用清晰的提交信息，遵循简单的 Conventional Commits 风格：

```text
feat(problems): add problem list page
fix(layout): correct mobile navigation spacing
docs: update contribution guide
style(login): adjust form alignment
```

常见前缀：

| 前缀 | 用途 |
| --- | --- |
| `feat` | 新功能或页面 |
| `fix` | 修复缺陷 |
| `docs` | 文档 |
| `style` | 不改变功能的样式更改 |
| `refactor` | 在不改变预期行为的前提下重构代码 |
| `test` | 添加或更新测试 |
| `chore` | 维护或工具 |

使用 VS Code：

1. 打开 **Source Control**（`Ctrl+Shift+G`）。
2. 审阅更改的文件，只暂存属于你 Issue 的文件。使用每个文件旁的 `+` 图标。如果有无关更改，避免使用 **Stage All**。
3. 输入清晰的提交信息并选择 **Commit**。
4. 选择 **Publish Branch** 或 **Push** 将你的分支上传到共享 GitHub 仓库。

改用终端：

```bash
git status
git diff
git add <files-to-include>
git commit -m "feat(problems): add problem list page"
git push -u origin feature/12-problem-list
```

对于同一分支上的后续提交，使用 `git push`。

#### 第 6 步：打开 Pull Request

进入GitHub仓库，从你的任务分支向仓库的 `main` 分支打开一个 PR。

使用 GitHub：

1. 在 GitHub 上打开 CodeLingo 仓库。
2. 选择 **Pull requests** 并点击 **New pull request**（或使用推送分支后显示的提示）。
3. 将 **base** 分支设置为 `main`，将 **compare** 分支设置为你的任务分支。
4. 使用清晰的 PR 标题，遵循与提交信息相同的风格。例如：`feat(problems): add problem list page`。
5. 填写 PR 描述模板。
6. 在描述中关联相关 Issue。如果该 PR 完成该 Issue，请使用 `Closes #12`。
7. 对于 UI 更改，在有帮助时添加截图。
8. 请求团队负责人或指定审阅人审阅。

不要合并你自己的 PR。团队负责人或指定维护者将在审阅批准后合并它。

#### 第 7 步：处理审阅反馈并更新你的 PR

审阅人可能会提问或要求更改。发生这种情况时：

1. 阅读评论，如有需要请请求澄清。
2. 在**同一任务分支**上进行所请求的更改。
3. 再次运行相关检查。
4. 提交并将更新推送到同一分支。现有 PR 将自动更新。
5. 回复审阅评论，并在问题解决后标记对话为已解决。

不要为同一 Issue 的审阅更改打开第二个 PR。如果所请求的工作超出原始 Issue 的范围，请讨论是否更适合创建单独的 Issue 和 PR。

#### 第 8 步：合并并开始下一个任务

在 PR 获得批准且所有必需检查通过后，团队负责人或指定维护者将其合并到 `main`。

PR 合并后：

1. 使用 GitHub 的 **Delete branch** 按钮删除你的任务分支，除非审阅人要求你保留它。
2. 在本地切换回 `main` 并拉取最新更改：

    使用VSCode:
    1. 点击左下角的分支图标
    2. 在上方弹出的窗口中点击main
    3. 在Changes ...中点击pull

    使用终端:
    ```bash
    git switch main
    git pull --ff-only origin main
    ```

3. 当你开始下一个 Issue 时，从更新后的 `main` 创建新分支。

因为每个人都在同一个仓库中工作，所以无需 fork 仓库或配置 `upstream` 远程。共享仓库的 `origin` 远程用于拉取 `main` 和推送你的任务分支。

### 3. 问题

如果你遇到问题，请在相关 GitHub Issue 上评论，说明：

1. 你当时想做什么。
2. 发生了什么或什么不清楚。
3. 你已经尝试了什么。
4. 你需要什么帮助或决策。

### 4. PR 检查清单

在请求审阅之前，请确保：

- [ ] 该 PR 处理了一个已分配的 GitHub Issue。
- [ ] 该 PR 仅包含与该 Issue 相关的更改。
- [ ] PR 描述说明了更改内容并链接了 Issue。
- [ ] 我审阅了自己的 diff，并且本地测试 `npm run lint`和`npm run build`通过。
- [ ] 未包含机密信息、凭据、本地环境文件或私人数据。