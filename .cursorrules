# Cursor Rules for WSL Environment

## Command Execution Guidelines

### Avoid Command Hanging in WSL

- **Never use pipes (`|`) with long-running commands** - they can hang in WSL
- **Avoid complex one-liners** - break them into separate commands
- **Use `nohup` or `&` for background processes** instead of foreground blocking
- **Prefer `just` commands** for development tasks (just dev-up, just dev-down, etc.)
- **Set timeouts** on network requests (curl with --max-time or timeout wrapper)
- **Kill processes explicitly** before starting new ones to avoid port conflicts

### WSL-Specific Best Practices

- Use `pkill -f process_name` to clean up before starting services
- Prefer simple commands over complex shell constructs
- When possible, use the Justfile tasks instead of direct terminal commands
- For long operations, use background execution with logging

### Examples of What NOT to Do

```bash
# ❌ This can hang in WSL
cargo build --workspace | cat

# ❌ Complex one-liner that may block
pkill -f x && cargo build && nohup cargo run &

# ❌ Heredoc with pipes
cat >> file << 'EOF' | grep pattern
```

### Examples of What TO Do

```bash
# ✅ Simple, direct commands
cargo build --workspace
pkill -f process_name
nohup cargo run > log.txt 2>&1 &

# ✅ Use Justfile tasks
just dev-up
just dev-down
just dev-status
```

## Code Style

- Use English for all code comments
- Follow Rust conventions for Rust code
- Use conventional commits for git messages
- Use English for git commit message
