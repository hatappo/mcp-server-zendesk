現在の MCP の実装は `stdio Transport`　です。これを `Streamable HTTP Transport` にも対応させます。

- MCP Server の SDK の `Streamable HTTP Transport` についてはこのドキュメントを参考にしてください。 https://github.com/modelcontextprotocol/typescript-sdk
- 通信相手の MCP クライアントとしては LibreChat を想定しています。MCP サーバの実装の参考にしてください。 https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/mcp_servers
- Zendesk API の認証に使うメールアドレス情報を MCP クライアントである LibreChat から `X-User-Email: "{{LIBRECHAT_USER_EMAIL}}"` のような形で受け取り、使用してください。
