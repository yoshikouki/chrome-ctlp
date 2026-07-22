# Permission boundary

## Policy

chrome-ctlpは、権限を機能より先に増やさない。

既定機能は`activeTab`と`scripting`だけで実装する。新しいmanifest権限が必要な機能は、権限を追加して実装せず、この文書へ候補として記録する。

Chrome公式によると、`chrome.tabs`の作成、更新、移動、再読込など大半の操作に`tabs`権限は不要である。`tabs`権限が必要なのは、任意のタブの`url`、`pendingUrl`、`title`、`favIconUrl`を読む場合である。

## Current baseline

```json
"permissions": ["activeTab", "scripting"]
```

- `activeTab`: ユーザーがパレットを呼び出した現在タブへの一時アクセス。インストール警告なし
- `scripting`: パレットと現在ページ操作を必要時だけ注入
- host permission: なし
- optional permission: なし

この範囲で、タブの作成・複製・固定・ミュート・移動・切替・再読込・休止・復帰・閉じる・表示倍率変更、ウィンドウ操作、現在ページのスクロール、Chrome標準管理画面の表示、chrome-ctlp自身の再読み込みを実装している。

### Extension reload boundary

- chrome-ctlp自身の再読み込み: `chrome.runtime.reload()`を使う。追加権限なし
- 他の拡張機能の列挙・有効化・無効化: `chrome.management`を使う。`management`権限が必要

自己再読み込みは、未パック拡張機能の最新ビルドをChromeへ反映するための開発者向けコマンドである。ソースコードのビルドは行わない。

## Deferred capabilities requiring additional permissions

「警告」はChrome公式のpermission listに明記されたユーザー向け警告である。警告なしでも、manifest変更が必要なら既定機能には追加しない。

| 機能候補 | 必要な追加権限 | Chromeの警告 | 判断 |
| --- | --- | --- | --- |
| 全タブをタイトル・URL・faviconで検索、URL単位の重複整理、ドメイン別整列 | `tabs` | 閲覧履歴の読み取り | 最優先の任意機能候補 |
| タブグループの作成、解除、命名、色、折りたたみ、移動 | `tabGroups` | タブグループの表示と管理 | 任意機能群にする |
| 最近閉じたタブ・ウィンドウ、他端末セッションの検索と復元 | `sessions` | 単独警告は明記なし。`tabs`併用時は全端末の閲覧履歴読み取り | `tabs`との組み合わせを先に設計する |
| ブックマークの検索、追加、更新、移動、削除 | `bookmarks` | ブックマークの読み取りと変更 | 任意機能群にする |
| リーディングリストの検索、追加、既読化、削除 | `readingList` | リーディングリストの読み取りと変更 | 任意機能群にする |
| 閲覧履歴の検索、追加、削除 | `history` | 全同期端末の閲覧履歴の読み取りと変更 | 強い権限。既定にはしない |
| 既定検索エンジンで検索 | `search` | 公式一覧に警告記載なし | 小さい任意権限として検討 |
| コマンド履歴、設定、favorites、利用頻度の永続化 | `storage` | 公式一覧に警告記載なし | 機能要件が出た時点で検討 |
| 常駐パレットや補助画面 | `sidePanel` | 公式一覧に警告記載なし | UI要件が出た場合だけ追加 |
| 右クリックメニューへのコマンド追加 | `contextMenus` | 公式一覧に警告記載なし | パレット以外の入口として別途判断 |
| ダウンロードの開始、検索、一時停止、再開、取消、ファイル表示 | `downloads`、必要に応じて`downloads.open` | ダウンロードの管理 | 強い権限。既定にはしない |
| 他の拡張機能の一覧、有効化、無効化、アンインストール | `management` | アプリ、拡張機能、テーマの管理 | 強い権限。自己再読み込みとは分離し、既定にはしない |
| 通知表示 | `notifications` | 通知の表示 | 通知が製品要件になった場合だけ追加 |
| クリップボードの読み取り | `clipboardRead` | コピー・貼り付けデータの読み取り | 強い権限。明示操作と用途を限定する |
| URL、タイトル、選択テキスト等のクリップボード書き込み | `clipboardWrite` | コピー・貼り付けデータの変更 | 任意権限として別途設計する |
| Cookieの検索、更新、削除 | `cookies`と対象host permission | host範囲に応じたサイトデータ警告 | 強い権限。既定にはしない |
| JavaScript、Cookie、カメラ、位置情報等のサイト権限変更 | `contentSettings` | Webサイト機能へのアクセス設定変更 | 強い権限。既定にはしない |
| 閲覧データ、キャッシュ、Cookie等の削除 | `browsingData` | 公式一覧に単独警告記載なし | 破壊的操作として別機能群にする |
| Chromeのプライバシー設定変更 | `privacy` | プライバシー関連設定の変更 | 強い権限。既定にはしない |
| プロキシ設定の表示・変更 | `proxy` | 全Webサイト上のデータの読み取りと変更 | 強い権限。既定にはしない |
| ネイティブアプリとの連携 | `nativeMessaging`と別途native host | 対応するネイティブアプリとの通信 | host配布・認証・更新を含む別プロジェクトとして扱う |
| タブ音声・映像のキャプチャ | `tabCapture` | 全Webサイト上のデータの読み取りと変更 | 強い権限。既定にはしない |
| 画面・ウィンドウ・タブの選択キャプチャ | `desktopCapture` | 画面内容のキャプチャ | 任意機能群にする |
| ページをMHTMLとして保存 | `pageCapture` | 全Webサイト上のデータの読み取りと変更 | 強い権限。既定にはしない |
| DevTools ProtocolによるDOM、Network、Performance等の操作 | `debugger` | デバッガbackendへのアクセス、全Webサイト上のデータの読み取りと変更 | 最強権限級。既定にはしない |
| よくアクセスするサイトの表示 | `topSites` | 頻繁にアクセスするWebサイト一覧の読み取り | 既定にはしない |
| navigation eventの監視 | `webNavigation` | 閲覧履歴の読み取り | 常時監視になるため既定にはしない |
| 任意サイトへの常時ページ操作、全タブへの自動注入 | `host_permissions`または`optional_host_permissions` | 指定host範囲に応じたサイトデータ警告 | `activeTab`で代替できない要件が出るまで追加しない |
| 定期実行 | `alarms` | 公式一覧に警告記載なし | background定期処理が必要になった場合だけ追加 |
| システムCPU・メモリ・ディスプレイ・ストレージ情報 | `system.cpu`、`system.memory`、`system.display`、`system.storage` | `system.storage`はストレージデバイスの識別と取り出し | Chrome操作の中核から分離する |

## User-controlled access outside manifest permissions

以下はmanifest権限の追加ではないが、ユーザーが拡張機能詳細画面で明示的に許可する必要がある。

- シークレットモードでの実行
- `file://`ページへのアクセス

## Adoption rule

追加権限を採用する場合は、次の順で扱う。

1. 実装する具体的なコマンドと利用者価値を定義する
2. `optional_permissions`または`optional_host_permissions`で遅延要求できるか確認する
3. Chromeが表示する警告文と要求理由をUIで事前説明する
4. 拒否時にも既存の権限不要コマンドを使える状態を維持する
5. 権限の有無をテストし、許可されていないAPIを呼ばない

## Official references

- [Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)
- [Windows API](https://developer.chrome.com/docs/extensions/reference/api/windows)
- [Scripting API](https://developer.chrome.com/docs/extensions/reference/api/scripting)
- [Permissions list](https://developer.chrome.com/docs/extensions/reference/permissions-list)
- [Declare permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Runtime API](https://developer.chrome.com/docs/extensions/reference/api/runtime#method-reload)
- [Management API](https://developer.chrome.com/docs/extensions/reference/api/management)
