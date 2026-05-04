# task-app

## アプリの概要

シンプルな**タスク管理 API** を提供する Web アプリです。バックエンドは [Laravel](https://laravel.com)、フロントのビルドには Vite と Tailwind CSS を使っています。

## 技術スタック

| 領域 | 内容 |
|------|------|
| バックエンド | PHP（Composer）、Laravel |
| フロント（アセット） | Vite、Tailwind CSS 4 |
| データベース | SQLite など（`.env` で指定） |

## できること

- **タスク**は `title`（文字列）を持ち、データベースに保存されます。
- **REST API**（`routes/api.php`）:
  - `GET /api/tasks` … タスク一覧
  - `POST /api/tasks` … タスク作成（JSON で `title` を送信）。成功時は **201** と作成されたレコードを返します。
- **トップページ** `GET /` … ウェルカム画面

## セットアップ（例）

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

フロントの開発サーバー（別ターミナル）:

```bash
npm install
npm run dev
```

API を試すときは `php artisan serve` でアプリを起動し、`http://127.0.0.1:8000/api/tasks` などにリクエストします。

## テストについて

品質チェックは次の **4 種類** です。

| 種類 | 何をするか |
|------|------------|
| **PHPStan（Larastan）** | `app/` の静的解析（レベル 5） |
| **PHPUnit** | `php artisan test` — タスク API とトップページの Feature、サンプル Unit |
| **ESLint** | `npm run lint` — `resources/js` や Vite / ESLint 設定の JS |
| **Newman** | `postman_collections.json` — 起動中サーバーへ実 HTTP で GET/POST を検証 |

**詳細**（対象ファイル、テストケース名、`phpunit.xml` の環境、ESLint の無視パスとルール、CI のステップ順、ローカル再現例）は **[TESTING.md](TESTING.md)** にまとめています。

### よく使うコマンド

```bash
./vendor/bin/phpstan analyse   # PHP 静的解析
php artisan test               # PHPUnit
npm run lint                   # ESLint（先に npm install / npm ci）
```

Newman はサーバー起動後に `newman run postman_collections.json`（手順は [TESTING.md の Newman 節](TESTING.md#newman)）。

### GitHub Actions（CI）

`main` ブランチへの **push** で [`.github/workflows/ci.yml`](.github/workflows/ci.yml) が動きます。おおまかな順序は **PHPStan → PHPUnit → `npm ci` → ESLint → Newman（専用 SQLite + `artisan serve`）** です。ステップ単位の説明は [TESTING.md の CI 節](TESTING.md#github-actions) を参照してください。

## ライセンス

MIT License
