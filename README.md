Claude Code Harness

A terminal-based AI coding harness built with TypeScript, featuring an agent loop, multi-provider support (Anthropic and OpenAI-compatible), and a toolset for working with codebases and your local development environment.

Show Image Show Image Show Image

Repository: https://github.com/ouroboros1X/claudecode-harnes

Table of Contents
Overview
Features
How It Works
Project Structure
Requirements
Getting Started
Configuration
Usage
Providers
Tools
Task Levels
Extending the Harness
Security
Troubleshooting
Development
Roadmap
Contributing
License
Overview

Claude Code Harness is a lightweight, hackable harness for AI-assisted coding in the terminal. It connects a language model to a set of local tools (file reading, searching, shell execution, and more) through an agent loop: the model decides what to do, the harness runs the requested tool, and the result is fed back to the model until the task is complete.

It is designed to handle tasks of different sizes, from a quick question about a function to a multi-step change spanning several files.

The codebase is intentionally small and modular. Providers, the agent loop, and tools live in separate modules, so you can read, modify, and extend each piece independently.

Note: Exact capabilities depend on the implementation and configuration in the repository. This README describes the intended design and structure; check the source for authoritative behavior.

Features
Feature	Description
Terminal-first workflow	Interact with the model directly from your shell, next to your code.
Multiple providers	Separate modules for Anthropic and OpenAI-compatible APIs.
Agent loop	Dedicated loop logic in src/agent/loops.ts that coordinates model calls and tool execution.
Codebase navigation	Tools to find files, search text, and list directory contents.
File interaction	Read, inspect, and filesystem utility tools.
Shell integration	A Bash tool for running commands in your environment.
Typed codebase	TypeScript throughout, with shared types in src/types.ts.
Modular design	Providers, agent logic, and tools are cleanly separated.
How It Works

At a high level, each session follows this cycle:

Tool call
Final answer
User prompt
Agent loop
ProviderAnthropic /OpenAI-compatible
Model response
Tool registry
bash / find / grep / ls / read/ stat
Tool result
Output to terminal
Prompt: You describe a task in the terminal.
Agent loop: src/agent/loops.ts sends the conversation and available tool definitions to the selected provider.
Model response: The model either replies with a final answer or requests one or more tool calls.
Tool execution: The harness runs the requested tool from src/tools/ and captures the result.
Iteration: Tool results are appended to the conversation and sent back to the model. The loop repeats until the model produces a final answer.
Project Structure
CLAUDE_CODE/
├── bin/
│   └── mypi.js              # CLI entry point
├── src/
│   ├── agent/
│   │   └── loops.ts         # Agent loop: model <-> tool orchestration
│   ├── provider/
│   │   ├── anthropic.ts     # Anthropic API integration
│   │   ├── index.ts         # Provider exports / selection
│   │   └── openai-compat.ts # OpenAI-compatible API integration
│   ├── tools/
│   │   ├── bash.ts          # Shell command execution
│   │   ├── find.ts          # Find files or paths
│   │   ├── fsutil.ts        # Shared filesystem helpers
│   │   ├── grep.ts          # Search file contents
│   │   ├── index.ts         # Tool exports / registration
│   │   ├── ls.ts            # List directory contents
│   │   ├── read.ts          # Read file contents
│   │   └── stat.ts          # Inspect file or path metadata
│   ├── main.ts              # Application entry point
│   └── types.ts             # Shared TypeScript types
├── .env                     # Local secrets (never commit)
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
Directory guide
bin/: Executable entry point (mypi.js) for running the harness as a CLI. Its exact invocation depends on the bin configuration in package.json.
src/agent/: The agent loop that drives the conversation and tool use.
src/provider/: One module per model provider, plus an index that exposes them.
src/tools/: Individual tool implementations, kept separate from the agent and provider layers.
src/main.ts: Wires everything together and starts the application.
src/types.ts: Shared types (messages, tool definitions, provider interfaces, and similar).
Requirements
Node.js: a current LTS release is recommended
npm (bundled with Node.js)
An API key for at least one supported provider:
Anthropic, or
an OpenAI-compatible API

Optional but helpful:

tsx for running TypeScript directly without a build step
Git for cloning the repository
Getting Started
1. Clone the repository
bash
git clone https://github.com/ouroboros1X/claudecode-harnes.git
cd claudecode-harnes
2. Install dependencies
bash
npm install
3. Configure environment variables

Create a .env file in the project root:

env
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

You only need the key(s) for the provider(s) you plan to use.

⚠️ Never commit .env or publish credentials. Confirm that .env is listed in .gitignore before your first commit.

4. Run the harness

Check the scripts section of package.json for the supported command. If tsx is installed and src/main.ts is the entry point, you can run:

bash
npx tsx src/main.ts

The repository also contains bin/mypi.js. Use the command documented in package.json (for example, via the bin field or an npm script) to invoke it.

Configuration
Environment variables
Variable	Required	Purpose
ANTHROPIC_API_KEY	When using the Anthropic provider	Authenticates requests to the Anthropic API.
OPENAI_API_KEY	When using the OpenAI-compatible provider	Authenticates requests to the OpenAI-compatible API.

Additional variables (such as a custom base URL, model ID, or provider selection) may be supported by the provider code. Check src/provider/*.ts and package.json for the current set. They are not assumed here.

TypeScript

Compiler settings live in tsconfig.json. If you change the output directory or module system, update the scripts in package.json to match.

Usage

Start the harness from the project root (see Getting Started), then describe your task in plain language.

Example prompts

Light

Explain what src/tools/grep.ts does.

Medium

Find where tool results are appended to the conversation and add a
maximum output length for the bash tool.

Heavy

Add retry logic with exponential backoff to both provider modules,
then update the README to document it.
Tips for better results
Be specific. Name files, functions, or behaviors when you can.
State constraints. Mention language versions, style rules, or things not to touch.
Work in small steps. For large changes, break the task into milestones and review after each.
Use version control. Commit or stash before a session so you can easily review and revert changes.
Providers

Providers translate the harness's internal message and tool format into API calls for a specific model vendor.

Anthropic
Module: src/provider/anthropic.ts
Credentials: ANTHROPIC_API_KEY
OpenAI-compatible APIs
Module: src/provider/openai-compat.ts
Credentials: OPENAI_API_KEY (if required by the endpoint)
Notes: "OpenAI-compatible" generally means any service that implements the OpenAI chat completions API shape, which can include hosted and self-hosted options. Whether a custom base URL is configurable depends on the implementation.
Provider index

src/provider/index.ts exposes the available providers to the rest of the application. Supported model IDs and provider selection logic should be checked in the provider code and package.json.

Tools

Tools are the actions the model can request. Each lives in its own module under src/tools/.

Module	Intended role	Typical use
bash.ts	Shell command execution	Run tests, build commands, git operations
find.ts	Find files or paths	Locate a file by name or pattern
fsutil.ts	Filesystem utilities	Shared helpers used by other tools
grep.ts	Search file contents	Find usages of a function or string
ls.ts	List directory contents	Explore project layout
read.ts	Read file contents	Inspect source files before changing them
stat.ts	Inspect file or path metadata	Check size, type, or existence
index.ts	Tool exports / registration	Collects tools for the agent loop

Tool behavior and permissions are determined by the actual implementations. Review shell and filesystem operations carefully before using the harness on important projects.

Task Levels

The harness is intended for light, medium, and heavy coding tasks.

Level	Examples
Light	Explain code, answer focused questions, make a small change.
Medium	Debug an issue or implement a feature across related files.
Heavy	Work through a larger, multi-step coding task.

Results depend on the model you use, the quality of your prompt, the context available, and the tools implemented in the current version. Always review changes and run relevant tests before relying on generated code.

Extending the Harness
Adding a new tool
Create a new module in src/tools/, for example src/tools/write.ts.
Define the tool's name, description, input schema, and execution function, following the types in src/types.ts and the patterns used by existing tools.
Export or register it in src/tools/index.ts so the agent loop can discover it.
Test it manually with a prompt that should trigger the tool, and add automated tests if a test setup exists.
Adding a new provider
Create a new module in src/provider/, for example src/provider/my-provider.ts.
Implement the same interface as the existing providers (see src/types.ts).
Export it from src/provider/index.ts.
Document any new environment variables in this README.
Modifying the agent loop

The loop in src/agent/loops.ts controls how many iterations run, how tool results are formatted, and when the session ends. Common customizations include:

Capping the maximum number of tool-call iterations
Truncating very large tool outputs
Adding confirmation prompts before risky tool calls
Logging tool calls for auditing
Security

AI agents that can run shell commands and edit files are powerful, and risky if used carelessly.

Protect credentials. Keep API keys in .env, ensure .env is in .gitignore, and never paste keys into issues or logs.
Inspect shell commands before allowing them to run, especially anything destructive (rm, git reset --hard, curl | sh, and so on).
Review file changes before committing them. Use git diff.
Use least privilege. Run the harness as a normal user, in a limited directory, and ideally in a container or VM for untrusted projects.
Treat model output as untrusted until you've reviewed it. Models can make mistakes or be influenced by malicious content in files they read (prompt injection).
Rotate keys immediately if you suspect one has been exposed.
Troubleshooting
Problem	Things to check
Cannot find module / import errors	Run npm install; confirm tsconfig.json module settings match how you run the code.
tsx: command not found	Use npx tsx src/main.ts or install it with npm install -D tsx.
Authentication errors (401/403)	Verify the API key in .env, check for extra spaces or quotes, and confirm the key matches the selected provider.
Environment variables not loading	Make sure .env is in the project root and that the code loads it (for example, via dotenv or --env-file).
Rate limit errors (429)	Wait and retry, reduce request frequency, or check your provider plan. Retry policies are on the roadmap.
CLI command not found	Check the bin field in package.json; you may need npm link or to run node bin/mypi.js directly.
Tool seems to hang	Long-running shell commands may block the loop. Timeouts are on the roadmap; interrupt with Ctrl+C.
Development

Check package.json for available scripts. A typical workflow:

bash
# Install dependencies
npm install

# Type-check (if configured)
npx tsc --noEmit

# Run in development
npx tsx src/main.ts

If a test script is not configured, add tests before relying on automated verification.

Before opening a pull request:

Run the available type checks and tests.
Manually verify important tool behavior (especially bash, read, and any file-modifying tools).
Make sure no secrets or .env files are staged.
Roadmap

Potential future improvements:

 Document supported model IDs and provider selection
 Document all CLI commands and configuration options
 Add automated tests for providers, agent loops, and tools
 Add robust error handling, timeouts, and retry policies
 Add permission controls for shell and filesystem operations
 Add examples for common coding workflows
Contributing

Contributions, bug reports, and feature suggestions are welcome.

Open an issue describing the problem or proposed change.
Create a branch for your change:
bash
   git checkout -b feature/my-change
Make focused changes and run the available checks.
Submit a pull request with a clear summary of what changed and why.
Guidelines
Keep pull requests small and focused.
Match the existing code style and TypeScript conventions.
Update documentation when behavior changes.
Never include credentials or personal data in commits, issues, or PRs.
License

No license has been specified for this project yet. Add a LICENSE file (for example, MIT or Apache-2.0) and update this section before granting others explicit reuse permissions.

<p align="center">Built with TypeScript for terminal-based AI-assisted coding.</p>