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

このリポジトリでは、**静的解析**・**PHPUnit**・**実サーバー + Newman** の3種類で品質を確認しています。

### PHPUnit（`php artisan test`）

| 種別 | 内容 |
|------|------|
| Feature | `GET /api/tasks` が 200、`POST /api/tasks` が 201、トップ `GET /` が 200 など |
| Unit | サンプルのユニットテスト |

テスト実行時は `phpunit.xml` の設定により、DB は **SQLite（メモリ）** を使う想定です。

### PHPStan（Larastan）

`app/` を **レベル 5** で解析します。

```bash
./vendor/bin/phpstan analyse
```

### Newman（Postman コレクション）

`postman_collections.json` を **Newman** で実行し、起動中の Laravel に対して API のステータスコードを確認します（例: `GET` で 200、`POST` で 201）。

CI と同様に試す場合は、DB を用意してマイグレートしたうえで `php artisan serve` を起動し、別ターミナルで次を実行します。

```bash
npm install -g newman
newman run postman_collections.json
```

（コレクション内の URL は `127.0.0.1:8000` 前提です。）

### GitHub Actions（CI）

`main` ブランチへの **push** で [`.github/workflows/ci.yml`](.github/workflows/ci.yml) が動き、おおまかに次の順です。

1. Composer で依存関係をインストール  
2. `.env` 準備と `testing` 環境向けのマイグレーション  
3. **PHPStan** 実行  
4. **PHPUnit**（`php artisan test`）  
5. 別 SQLite ファイルでマイグレート → **`php artisan serve`** → **Newman** で `postman_collections.json` を実行  

## ライセンス

MIT License
