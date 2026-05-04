# テストの詳細

このドキュメントでは、task-app で行っている品質チェックの種類、対象ファイル、CI での実行順、ローカルでの再現方法をまとめます。概要は [README.md](README.md) の「テストについて」を参照してください。

## 一覧

| 種類 | 役割 | 主なコマンド |
|------|------|----------------|
| [PHPStan（Larastan）](#phpstanlarastan) | PHP の静的型解析 | `./vendor/bin/phpstan analyse` |
| [PHPUnit](#phpunit) | Laravel の機能・ユニットテスト | `php artisan test` |
| [ESLint](#eslint) | JavaScript のリント | `npm run lint` |
| [Newman](#newman) | 起動中 API への HTTP 検証 | `newman run postman_collections.json` |

GitHub Actions では上記のうち **PHPStan → PHPUnit → ESLint → Newman** の順で実行されます（[`.github/workflows/ci.yml`](.github/workflows/ci.yml)）。

---

## PHPStan（Larastan）

Laravel 向けの静的解析拡張 **Larastan** を読み込み、`app/` ディレクトリを解析します。

| 項目 | 値 |
|------|-----|
| 設定ファイル | [`phpstan.neon`](phpstan.neon) |
| 解析パス | `app/` |
| レベル | **5** |

```bash
composer install
./vendor/bin/phpstan analyse
```

---

## PHPUnit

`php artisan test` は内部的に PHPUnit を起動します。テストスイートは `phpunit.xml` で **Unit** と **Feature** に分かれています。

### テスト環境（`phpunit.xml`）

PHPUnit 実行時は次のような環境変数が適用されます（抜粋）。

| 変数 | 値の例 | 意味 |
|------|--------|------|
| `APP_ENV` | `testing` | テスト用アプリ環境 |
| `DB_CONNECTION` | `sqlite` | SQLite を使用 |
| `DB_DATABASE` | `:memory:` | メモリ上の DB（テストごとにクリーンな状態になりやすい） |
| `CACHE_STORE` | `array` | キャッシュを配列ドライバに |
| `SESSION_DRIVER` | `array` | セッションを配列ドライバに |
| `QUEUE_CONNECTION` | `sync` | キューを同期実行 |

### Feature テスト

| ファイル | メソッド | 内容 |
|----------|----------|------|
| [`tests/Feature/TaskTest.php`](tests/Feature/TaskTest.php) | `test_can_get_tasks` | `GET /api/tasks` が **200** |
| 同上 | `test_can_create_task` | `POST /api/tasks`（`title: test`）が **201** |
| [`tests/Feature/ExampleTest.php`](tests/Feature/ExampleTest.php) | `test_the_application_returns_a_successful_response` | `GET /` が **200** |

`TaskTest` は `RefreshDatabase` トレイトを使用しており、テスト実行前後でデータベースをリフレッシュします。

### Unit テスト

| ファイル | メソッド | 内容 |
|----------|----------|------|
| [`tests/Unit/ExampleTest.php`](tests/Unit/ExampleTest.php) | `test_that_true_is_true` | サンプル（常に成功） |

### ローカルでの実行

```bash
composer install
cp .env.example .env   # 未作成の場合
php artisan key:generate --env=testing
php artisan migrate --env=testing   # 必要に応じて
php artisan test
```

通常は `phpunit.xml` の SQLite `:memory:` で Feature テストが完結します。

---

## ESLint

フロント周りの JavaScript をリントします。設定は **フラットコンフィグ**（[`eslint.config.js`](eslint.config.js)）です。

### 対象ファイル

- `resources/js/**/*.js` … ブラウザ向け（`globals.browser`）
- `vite.config.js` / `eslint.config.js` … Node 向け（`globals.node`）

### 無視パス

`vendor/`、`node_modules/`、`public/build/`、`storage/`、`bootstrap/ssr/` は解析対象外です。

### ルールの例

- `@eslint/js` の **recommended** をベースに利用
- **`eqeqeq`** … `==` / `!=` ではなく `===` / `!==` を必須（`always`）

### ローカルでの実行

```bash
npm ci   # または npm install
npm run lint
```

自動修正する場合:

```bash
npm run lint:fix
```

---

<a id="newman"></a>

## Newman（Postman コレクション）

[`postman_collections.json`](postman_collections.json) は Postman 形式のコレクションで、**実際に HTTP サーバーが応答している状態**で Newman から実行します。各リクエストに「Tests」タブ相当のスクリプトが付き、**HTTP ステータスコード**を検証します。

| リクエスト名 | メソッド・URL | 期待ステータス |
|--------------|---------------|----------------|
| Test get | `GET http://127.0.0.1:8000/api/tasks` | **200** |
| Test post | `POST` 同上、ボディ `{"title": "test task"}` | **201** |

### CI での前提

1. `database/newman.sqlite` を作成し、そのパスを `DB_DATABASE` に指定して `php artisan migrate --force`
2. 同じ DB 設定で `php artisan serve --host=127.0.0.1 --port=8000` をバックグラウンド起動
3. `curl` で `http://127.0.0.1:8000/api/tasks` が成功するまで最大約 30 秒待機
4. `newman run postman_collections.json`

### ローカルでの実行例

ターミナル A:

```bash
touch database/newman.sqlite
DB_CONNECTION=sqlite DB_DATABASE="$(pwd)/database/newman.sqlite" php artisan migrate --force
DB_CONNECTION=sqlite DB_DATABASE="$(pwd)/database/newman.sqlite" php artisan serve --host=127.0.0.1 --port=8000
```

ターミナル B（Newman はグローバルまたは `npx`）:

```bash
npm install -g newman
newman run postman_collections.json
```

ポートやホストを変えた場合は、コレクション内の URL を Postman 側で合わせるか、環境変数・CLI オプションで上書きしてください。

---

<a id="github-actions"></a>

## GitHub Actions（CI）の流れ

トリガー: **`main` ブランチへの `push`**

1. リポジトリをチェックアウト  
2. PHP **8.4** をセットアップ  
3. `composer install --no-interaction --prefer-dist`  
4. `.env.example` を `.env` にコピー  
5. `php artisan key:generate`（通常 `.env`）  
6. `php artisan key:generate --env=testing`  
7. `php artisan migrate --env=testing`  
8. **PHPStan** … `./vendor/bin/phpstan analyse`  
9. **PHPUnit** … `php artisan test`  
10. Node.js **22** をセットアップ（`npm` キャッシュ利用）  
11. `npm ci`  
12. **ESLint** … `npm run lint`  
13. グローバルに **Newman** をインストール  
14. Newman 用 SQLite の準備とマイグレート、サーバー起動、待機、`newman run postman_collections.json`  

ワークフロー定義の全文は [`.github/workflows/ci.yml`](.github/workflows/ci.yml) を参照してください。

---

## 補足

- **フロントのユニットテスト**（Vitest / Jest など）は現状の `package.json` には含まれていません。API と JS のリント・PHP のテストが中心です。
- PHPUnit と Newman はどちらもタスク API を触りますが、PHPUnit はアプリ内からのリクエスト（インメモリ DB）、Newmanは実 HTTP と別 SQLite ファイルという点が異なります。
