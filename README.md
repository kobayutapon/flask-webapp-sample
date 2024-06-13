# flask-webapp-sample
Flaskを使ったIoTデバイスを管理するWebアプリのサンプルです。
Bootstrap 5.3を使ってそれっぽくしてます。
Flask-Login/Flask-JWT-Extendedを使ってそれっぽくセッション管理などを行っています。
SQLAlchemyを使ったので、将来的にちゃんとしたRDBに比較的に楽に移行することができます。

# 使い方
## 動作環境
Ubuntu 22.04/ Raspberry Pi OS 2024-03-15で確認しています。

## 環境の準備
### ソースの取得
~~~
git clone https://github.com/kobayutapon/flask-webapp-sample.git
~~~

### 必要なPythonライブラリを取得
~~~
cd flask-webapp-sample
pip3 install -r requirements.txt
~~~

### 実行
~~~
python3 app.py
~~~

実行するとhttp://(動作しているマシンのIP):5000　をブラウザで読み込ませると動作が確認できます。


# 画面遷移
## ログイン画面
![image](https://github.com/kobayutapon/flask-webapp-sample/assets/10007319/7cefd811-887c-4ef0-8012-69322dc22af1)
ユーザー名、パスワードを入力し、Loginをクリックするとダッシュボード画面に遷移します。
入力フォームをPOSTし、その応答にアクセストーケンを取得します。それを用いて他のページのアクセス権の制御を行っています。
Sign Upをクリックするとユーザー登録画面に遷移します。

## サインアップ画面
ログイン画面と同じなので割愛

## ダッシュボード画面
![image](https://github.com/kobayutapon/flask-webapp-sample/assets/10007319/5a2b5b39-9e15-4d29-92bc-87df8e46ec06)
登録されているデバイスの一覧を表示。
右上にログインユーザー名が表示されていて、ここをクリックするとパスワード変更やサインアウトなどができます。
デバイスの右側のメニューでデバイスに対して詳細見たり設定ができます。

あとはコード見ながら適宜変更してください。

# 面積
あくまでサンプルなのでご利用は自己責任でお願いします。
ライセンスはMITで公開するのでご利用はご自由に。

