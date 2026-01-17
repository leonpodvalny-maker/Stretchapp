# Claude Code + Cursor IDE Integration Guide

## ✅ Installation Complete
Claude Code CLI is installed (version 2.1.12)

## 🔗 Connecting Claude Code to Cursor

### Method 1: Direct IDE Connection (Recommended)
1. Open Cursor IDE
2. Open the integrated terminal in Cursor (Terminal → New Terminal)
3. Navigate to your project directory
4. Run one of these commands:
   ```
   claude --ide
   ```
   or
   ```
   claude
   ```
   
   The `--ide` flag automatically connects to your IDE if exactly one valid IDE is available.
   
   This will make Claude Code detect Cursor and establish a connection.

### Method 2: MCP Server Configuration
If you want to use Claude Code as an MCP (Model Context Protocol) server:

1. Create or edit `.mcp.json` in your project root or Cursor config directory
2. Add this configuration:
   ```json
   {
     "claude-code": {
       "command": "claude",
       "args": ["--mcp-server"]
     }
   }
   ```
3. Restart Cursor

### Method 3: Extension Installation (Optional)
If available, you can install the Claude Code extension:
- Check Cursor's extension marketplace
- Or manually install from: https://github.com/BlinkZer0/Cursor-Claude-Extension

## 🧪 Testing the Connection

After running `claude --ide`, you should see:
- Claude Code detecting Cursor as the active IDE
- Confirmation message about the connection
- Ability to use Claude Code commands with full IDE context

## ⚠️ Troubleshooting

### "No available IDEs detected"
- **Windows + WSL**: Make sure both Cursor and Claude Code are in the same environment
  - If using WSL, launch Cursor from within WSL terminal
  - Or install Claude Code in Windows (not WSL)
- **PATH issues**: Ensure `claude` command is accessible from Cursor's terminal
- **Restart**: Try restarting both Cursor and Claude Code

### Connection Drops
- Close all but one Cursor window
- Avoid multiple projects open simultaneously
- Restart the connection with `claude --ide`

## 📝 Usage

Once connected, you can:
- Use Claude Code commands in Cursor's terminal
- Get context-aware assistance with your codebase
- Access Claude Code features directly from Cursor

## 🔑 Authentication

If prompted, you may need to:
- Log in to your Anthropic account
- Use your Claude Max subscription (if you have one)
- Or provide an API key if using the API version

---

**Note**: On Windows, if you're using WSL, ensure both tools are in the same environment for best compatibility.
