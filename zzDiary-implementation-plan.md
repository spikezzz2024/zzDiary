# zzDiary 基础开发环境搭建 — 分步实施计划

> 面向 AI 开发者的标准化操作指南。AI 可自动执行的步骤直接由 Claude Code 完成，需人工操作的步骤由用户执行。
> 本次聚焦：电脑基础必备软件环境搭建 + 项目骨架初始化。完整高阶功能后续补充。

---

## 一、软件选型确认

### 1.1 确认必装软件清单

在开始安装前，先对照下表逐一确认每项软件的选定版本和用途，确保理解为什么需要它。

**必装项（缺一不可）：**

| 序号 | 软件名称 | 选定版本 | 在项目中的作用 |
|------|----------|----------|----------------|
| 1 | Node.js | 20 LTS 或更高 | 前端运行环境，Electron 桌面壳依赖 |
| 2 | Java JDK | 25 LTS 或更高 | 后端 Spring Boot 运行环境 |
| 3 | pnpm | 9.x 或更高 | 前端依赖包管理器，替代 npm |
| 4 | Git | 最新稳定版 | 版本控制，代码提交与推送 |
| 5 | VS Code | 最新稳定版 | 代码编辑器，AI 开发者主要工作界面 |

**可选安装（按需启用）：**

| 序号 | 软件名称 | 用途 | 何时需要 |
|------|----------|------|----------|
| 6 | Ollama | 本地 AI 模型运行 | 需要完全离线使用 AI 功能时 |
| 7 | Gradle Wrapper | Java 项目构建 | 后端项目自带，无需手动安装 |

**验证方法：** 打开电脑的"应用和功能"列表（Windows 可在开始菜单搜索"应用和功能"），逐项检查上述软件是否已存在。若某软件不存在，则在后续步骤中安装。

---

### 1.2 确认操作系统兼容性

本项目基于 Windows 系统开发，需确认以下基础条件：

1. 操作系统为 Windows 10 或 Windows 11 64 位版本。
2. 当前登录用户拥有管理员权限（安装软件时需要）。
3. 系统剩余磁盘空间不少于 10 GB（用于安装开发工具和项目依赖）。
4. 系统已连接互联网（下载安装包和推送代码需要）。

**验证方法：**
- 右键点击"此电脑"选择"属性"，查看 Windows 版本是否为 10 或 11，系统类型是否为 64 位。
- 打开"设置 → 账户"，确认当前账户下方显示"管理员"字样。
- 打开"此电脑"，查看 C 盘剩余空间是否大于 10 GB。
- 打开浏览器访问任意网页，确认网络连通。

---

## 二、安装前置准备

### 2.1 创建项目专用文件夹

> **状态：已完成。** 项目根目录为 `C:\Users\17877\Desktop\zzDiary`，已初始化 Git 仓库并推送 GitHub。

1. 项目文件夹路径：`C:\Users\17877\Desktop\zzDiary`。
2. 文件夹路径中不含中文、空格或特殊符号。
3. GitHub 仓库地址：`https://github.com/spikezzz2024/zzDiary`。

**验证方法：** 打开文件资源管理器，确认 `C:\Users\17877\Desktop\zzDiary` 目录存在且包含 `.git` 隐藏文件夹。

---

### 2.2 关闭可能冲突的安全软件（临时）

1. 在安装开发工具期间，暂时关闭杀毒软件和防火墙的实时保护功能。
2. 部分安全软件会拦截 Node.js 或 Java 的网络请求，导致安装失败或运行报错。
3. 安装完成并确认所有工具正常后，重新开启安全软件。

**验证方法：** 右键点击任务栏右下角的安全软件图标，选择"暂停保护"或"退出"。确认图标变为灰色或出现暂停提示。安装全部完成后记得恢复。

---

### 2.3 清理旧版本残留（如适用）

1. 如果电脑之前安装过旧版 Node.js、Java 或其他开发工具，建议先卸载旧版本。
2. 打开"控制面板 → 卸载程序"，搜索并卸载旧版 Node.js、Java、Python 等与开发相关的旧软件。
3. 卸载完成后重启电脑，确保旧环境变量已被清除。

**验证方法：** 打开命令提示符（开始菜单搜索"cmd"回车），输入 `node --version` 和 `java --version`，如果都提示"不是内部或外部命令"，说明旧版本清理干净，可以开始全新安装。

---

## 三、本体安装流程

### 3.1 安装 Node.js 20 LTS

> **当前状态：已安装 Node.js v24.15.0（满足 >= 20 LTS 要求），可跳过。**

1. 打开浏览器，访问 Node.js 官方网站（nodejs.org）。
2. 在首页找到 LTS 标签的下载按钮，版本号应显示为 20.x 或更高。
3. 点击下载 Windows 安装包（.msi 格式，64 位）。
4. 下载完成后双击运行安装程序。
5. 安装过程中全部使用默认选项，不要修改任何勾选框。
6. 安装最后一步会询问是否自动安装必要工具，取消勾选（不需要装 Chocolatey 等额外工具）。
7. 点击"Install"等待安装完成。

**验证方法：**
- 打开命令提示符输入 `node --version`，屏幕应显示版本号（如 v20.18.0）。
- 再输入 `npm --version`，屏幕应显示 npm 的版本号。
- 两个命令都输出版本号且无报错，则 Node.js 安装正确。

---

### 3.2 安装 Java JDK 25 LTS

> **当前状态：已安装 OpenJDK 25.0.2 LTS (Zulu)，满足要求，可跳过。**

1. 打开浏览器，搜索"JDK 25 download"或访问 Oracle JDK 或 Eclipse Temurin 官网。
2. 推荐选择 Eclipse Temurin（Adoptium）版本，因为它开源且安装简单。
3. 在下载页面选择 Windows x64 架构，JDK 25 版本，下载 .msi 安装包。
4. 下载完成后双击运行安装程序。
5. 安装过程中，关键一步是找到"设置 JAVA_HOME 环境变量"的选项，确保它被勾选。
6. 其余步骤使用默认选项，一路点击"下一步"直到完成。

**验证方法：**
- 重新打开一个命令提示符窗口（关闭旧的再打开新的）。
- 输入 `java --version`，屏幕应显示 Java 版本信息，包含版本号 25.x 字样。
- 再输入 `javac --version`，同样应显示版本号。
- 两个命令都正确输出版本号则安装无误。

---

### 3.3 安装 pnpm 包管理器

> **当前状态：已安装 pnpm v9.15.9（通过 `npm install -g pnpm@9`），可跳过。**

1. 确认 Node.js 已安装成功。
2. 打开命令提示符窗口。
3. 执行 `npm install -g pnpm@9` 安装 pnpm。

**验证方法：**
- 在命令提示符中输入 `pnpm --version`。
- 如果显示版本号（如 9.x.x），说明安装成功。

---

### 3.4 安装 Git 版本控制工具

> **当前状态：已安装 Git 2.54.0，可跳过。**

1. 打开浏览器，访问 Git 官方网站（git-scm.com）。
2. 点击"Download for Windows"按钮，下载 64 位安装包。
3. 安装过程中全部保持默认选项即可。
4. 唯一需要确认的是：在"选择默认编辑器"页面，建议选择"Use Visual Studio Code as Git's default editor"。

**验证方法：**
- 在命令提示符中输入 `git --version`，屏幕应显示 git version 2.xx.x。

---

### 3.5 安装 VS Code 代码编辑器

1. 打开浏览器，访问 VS Code 官方网站（code.visualstudio.com）。
2. 点击首页的"Download for Windows"按钮，下载安装包。
3. 安装过程中勾选：
   - "添加到 PATH"
   - "将 Code 操作添加到文件资源管理器右键菜单"
   - "将 Code 注册为受支持文件类型的编辑器"
4. 其余保持默认，点击"安装"等完成。

**验证方法：**
- 在开始菜单中搜索"VS Code"，点击图标应能正常启动。
- 在命令提示符中输入 `code --version`，应正常输出版本号。

---

## 四、基础参数设置

### 4.1 配置 Git 用户名与邮箱

> **状态：已完成。** 用户名 `spikezzz`，已推送代码到 GitHub。

1. 打开命令提示符窗口。
2. 设置 Git 用户名：`git config --global user.name "你的用户名"`。
3. 设置 Git 邮箱：`git config --global user.email "你的邮箱"`。

**验证方法：**
- 输入 `git config --global user.name` 应显示你的用户名。
- 输入 `git config --global user.email` 应显示你的邮箱。

---

### 4.2 配置 pnpm 镜像源（加速国内下载）

> **状态：已完成。** 已配置镜像源为 `https://registry.npmmirror.com`。

**验证方法：**
- 输入 `pnpm config get registry`，应显示 `https://registry.npmmirror.com`。

---

### 4.3 配置 Java 环境变量（补充确认）

1. 虽然 JDK 安装程序通常会自动配置环境变量，但为保险起见需要手动确认。
2. 打开"控制面板 → 系统 → 高级系统设置 → 环境变量"。
3. 在"系统变量"列表中，查找名为 `JAVA_HOME` 的变量。
4. 确认它的值指向 JDK 25 的安装路径。

**验证方法：**
- 在命令提示符中输入 `echo %JAVA_HOME%`，屏幕应显示 JDK 安装路径，且路径中包含 `jdk-25` 字样。

---

## 五、全局环境适配

### 5.1 确认所有工具在命令行中可用

> **状态：已验证。** Node.js v24.15.0、Java 25.0.2、Git 2.54.0、pnpm 9.15.9 全部可用。

1. 打开一个全新的命令提示符窗口。
2. 依次测试以下四个命令：
   - `node --version`
   - `java --version`
   - `git --version`
   - `pnpm --version`
3. 四个命令全部正常输出且无报错，说明全局环境适配成功。

---

### 5.2 配置 VS Code 中文显示（如需要）

1. 打开 VS Code。
2. 点击左侧"扩展"图标，搜索"Chinese"，找到"Chinese (Simplified) Language Pack"。
3. 点击"安装"，安装完成后重启 VS Code。

---

### 5.3 安装 VS Code 推荐扩展

以下扩展可以提升开发效率，建议全部安装：

- **Prettier**：代码格式化工具
- **ESLint**：代码质量检查工具
- **Tailwind CSS IntelliSense**：Tailwind CSS 类名自动补全和预览
- **Extension Pack for Java**：Java 代码智能提示和调试支持
- **Gradle for Java**：Gradle 项目构建支持
- **Markdown Preview Enhanced**：Markdown 文件实时预览

---

## 六、权限确认

### 6.1 确认命令行执行权限

**验证方法：**
- 以管理员身份打开 PowerShell。
- 输入 `Get-ExecutionPolicy`。
- 如果输出显示 `RemoteSigned` 或 `Unrestricted`，说明权限正常。
- 如果显示 `Restricted`，说明脚本执行被禁止，需要调整策略。

---

### 6.2 确认网络代理设置

**验证方法：**
- 在命令提示符中输入 `ping github.com`。
- 能看到回复时间说明网络连通。
- 如果显示"请求超时"或"找不到主机"，需要检查代理或防火墙设置。

---

### 6.3 确认 GitHub 仓库访问权限

> **状态：已完成。** 仓库 `spikezzz2024/zzDiary` 可正常访问，代码已推送。

**验证方法：**
- 打开浏览器，登录 GitHub 账号。
- 访问 `https://github.com/spikezzz2024/zzDiary`，确认页面能正常打开且没有 404 错误。

---

## 七、项目骨架初始化

### 7.1 创建 memory-bank 目录

> **状态：已完成。** 已创建 `memory-bank/` 目录，包含 `architecture.md`、`database-schema.md`、`api-endpoints.md`。

> **重要性：** CLAUDE.md 强制规则 Always 1 要求编码前必须读取 memory-bank 全部文档。此目录必须在任何功能代码编写前存在。

1. 在项目根目录下创建 `memory-bank/` 文件夹。
2. 创建以下三个文件：
   - `architecture.md` — 系统架构、模块依赖图、数据流
   - `database-schema.md` — 数据库表结构定义
   - `api-endpoints.md` — REST API 端点清单
3. 初始内容基于设计文档和技术栈规范填充概要。

---

### 7.2 初始化前端项目骨架

> **状态：已完成。** 前端项目已初始化在项目根目录（非子目录）。

> **关键决策：** 前端代码直接放在项目根目录（`src/`、`package.json`、`vite.config.ts` 等在根级别），**不放在 `frontend/` 子目录**。这是为了简化目录结构，避免不必要的嵌套层级。

1. 使用 Vite 生成 React + TypeScript 项目模板。
2. AI 通过 `pnpm create vite@latest` 在临时目录生成模板，再合并到项目根目录。
3. 安装额外依赖：
   - `zustand` — 状态管理
   - `react-router` — 路由
   - `recharts` — 图表
   - `lucide-react` — 图标
   - `tailwindcss` + `@tailwindcss/vite` — CSS 框架
4. 按 `Agents.md` 目录规范创建 features/、components/ui/、hooks/、lib/、types/ 子目录。

**验证方法：**
- 项目根目录存在 `package.json`、`vite.config.ts`、`tsconfig.json`。
- 存在 `src/features/`、`src/components/ui/` 等目录结构。
- 运行 `pnpm build` 确认构建成功无报错。

---

### 7.3 初始化后端项目骨架

> **状态：已完成。** 后端项目已初始化在 `zzdiary-server/` 目录。

> **关键决策：** 后端目录名为 `zzdiary-server/`（与 `tech-stack.md` 保持一致），**不是** `backend/`。

1. 使用 Spring Initializr 生成 Spring Boot 项目模板。
2. 选择以下选项：
   - 构建工具：Gradle (Kotlin DSL)
   - 语言：Java
   - Spring Boot 版本：3.5.x
   - Java 版本：25
   - 依赖：Spring Web、Spring Boot Actuator
3. 手动添加 SQLite JDBC 依赖：`implementation("org.xerial:sqlite-jdbc:3.49.1.0")`。
4. 将 `application.properties` 改为 `application.yml`，配置：
   - 随机端口：`server.port: 0`
   - 仅监听本地：`server.address: 127.0.0.1`
   - SQLite 数据源路径：`${user.home}/.zzdiary/data.db`
   - Actuator 仅暴露 health 端点
5. 按 `Agents.md` 目录规范创建 controller/、service/、repository/、model/、infrastructure/ 子目录。

**验证方法：**
- 确认 `zzdiary-server/` 目录存在。
- 确认 `build.gradle.kts` 文件存在（扩展名为 .kts）。
- 确认 `src/main/java/com/zzdiary/` 多层目录结构存在。
- 运行 `./gradlew build` 确认 BUILD SUCCESSFUL。

**已知问题：** Gradle wrapper 通过 HTTPS 下载分发版可能因网络/SSL 环境失败。解决方法：
- 手动下载 Gradle 9.0.0 分发版 ZIP
- 使用已安装的 Gradle 直接构建：`gradle build`
- 或者配置 Gradle wrapper 使用本地分发版

---

### 7.4 安装前端项目依赖

> **状态：已完成。** `pnpm install` 成功，所有依赖已安装。

**验证方法：**
- 确认根目录存在 `node_modules` 文件夹和 `pnpm-lock.yaml` 文件。
- 运行 `pnpm build` 确认无报错。

---

### 7.5 安装后端项目依赖

> **状态：已完成。** Gradle 构建显示 BUILD SUCCESSFUL。

**验证方法：**
- 运行 `./gradlew build` 显示 BUILD SUCCESSFUL。
- 确认 `~/.gradle` 目录存在缓存文件。

---

## 八、初始状态校准

### 8.1 启动前端开发服务器

1. 在项目根目录执行 `pnpm dev`。
2. 观察命令行输出，确认服务启动成功。

**验证方法：**
- 命令行输出中显示本地访问地址，通常是 `http://localhost:5173`。
- 打开浏览器访问该地址，应显示 zzDiary 欢迎页面。

---

### 8.2 启动后端服务

1. 在 `zzdiary-server/` 目录执行 `./gradlew bootRun`。
2. 观察命令行输出，等待 Spring Boot 启动。

**验证方法：**
- 命令行输出中出现 Spring Boot ASCII 横幅。
- 输出中显示"Tomcat started on port(s): xxxx"。
- 浏览器访问 `http://localhost:xxxx/actuator/health` 返回 `{"status":"UP"}`。

---

### 8.3 前端调用后端接口连通性测试

1. 确保前端开发服务器和后端服务同时运行。
2. 确认前端能通过 HTTP 请求访问到后端接口。

**验证方法：**
- 浏览器访问前端本地地址，按 F12 打开开发者工具。
- 操作前端页面，观察控制台是否有跨域或网络连接的错误信息。
- 浏览器直接访问后端 `/actuator/health` 返回 `{"status":"UP"}`。

---

### 8.4 首次代码提交与推送

> **状态：已完成。** 初始提交已推送到 `https://github.com/spikezzz2024/zzDiary`。

---

### 8.5 环境校准最终检查清单

逐条核对以下项目，全部通过则基础环境搭建完成：

| 序号 | 检查项 | 通过标准 | 状态 |
|------|--------|----------|------|
| 1 | Node.js 可用 | `node --version` 显示 >= 20.x | ✅ |
| 2 | Java 可用 | `java --version` 显示 >= 25.x | ✅ |
| 3 | pnpm 可用 | `pnpm --version` 显示 >= 9.x | ✅ |
| 4 | Git 可用 | `git --version` 显示 >= 2.x | ✅ |
| 5 | VS Code 可用 | 开始菜单可启动 | 待确认 |
| 6 | Git 用户名已配置 | `git config user.name` 显示正确名称 | ✅ |
| 7 | Git 邮箱已配置 | `git config user.email` 显示正确邮箱 | 待确认 |
| 8 | memory-bank/ 已创建 | 包含 3 个 .md 文件 | ✅ |
| 9 | 前端依赖已安装 | `pnpm build` 成功 | ✅ |
| 10 | 后端依赖已安装 | Gradle 构建 BUILD SUCCESSFUL | ✅ |
| 11 | 前端服务器可启动 | `pnpm dev` → 浏览器看到页面 | 待确认 |
| 12 | 后端服务可启动 | `/actuator/health` 返回 `{"status":"UP"}` | 待确认 |
| 13 | 代码已推送 GitHub | 仓库页面可看到提交记录 | ✅ |

---

## 九、常见问题速查

### 9.1 Node.js 安装后命令行无法识别

如果输入 `node --version` 提示"不是内部或外部命令"：
1. 检查 Node.js 是否真的安装成功（去"应用和功能"列表中查看）。
2. 如果已安装但命令无效，重启电脑让环境变量生效。
3. 如果重启后仍无效，手动将 Node.js 安装路径添加到系统 PATH 环境变量中。

---

### 9.2 Java 安装后命令行无法识别

如果输入 `java --version` 提示"不是内部或外部命令"：
1. 检查 JDK 是否安装了完整的 JDK 包而非 JRE。
2. 确认环境变量 `JAVA_HOME` 是否已创建且路径正确。
3. 确认系统 PATH 环境变量中包含 `%JAVA_HOME%\bin`。

**验证方法：** 手动打开 JDK 安装目录下的 bin 文件夹，确认里面存在 `java.exe` 和 `javac.exe`。

---

### 9.3 pnpm 安装后命令行无法识别

如果输入 `pnpm --version` 提示"不是内部或外部命令"：
1. 确认 Node.js 已正确安装（先验证 `node --version`）。
2. 执行 `npm install -g pnpm@9` 安装。

---

### 9.4 GitHub 推送时提示认证失败

如果推送代码时出现"Authentication failed"或"403"错误：
1. GitHub 从 2021 年起不再支持密码方式推送，需要使用 Personal Access Token（个人访问令牌）。
2. 在浏览器登录 GitHub，进入 Settings → Developer settings → Personal access tokens。
3. 创建一个新的 token，权限勾选 `repo` 全选，生成后复制保存。
4. 在命令行推送时，密码栏粘贴这个 token 而不是你的 GitHub 登录密码。

---

### 9.5 前端页面无法访问后端接口

如果浏览器控制台出现网络请求报错（红色 CORS 或 Network Error）：
1. 确认后端服务是否正在运行。
2. 确认前端请求的地址和端口是否与后端实际端口一致。
3. 确认后端是否配置了 CORS 允许跨域访问。

**验证方法：** 直接用浏览器访问后端的 `/actuator/health`，如果能显示 `{"status":"UP"}` 说明后端正常，问题出在前端请求配置上。

---

### 9.6 Gradle 构建 SSL 证书错误

如果 Gradle wrapper 下载分发版时报 SSL 错误：
1. 手动下载 Gradle 分发版 ZIP：访问 `https://services.gradle.org/distributions/`。
2. 解压到本地目录。
3. 直接用 `gradle build` 替代 `./gradlew build`。

---

> 本计划为 zzDiary 项目第一阶段：基础环境搭建。后续阶段（核心功能开发、打包发布）将另外补充撰写。
