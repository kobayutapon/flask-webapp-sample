from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
import logging

# Flaskアプリケーションの初期化
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

# ロギングの設定
logging.basicConfig(level=logging.INFO)
app.logger.setLevel(logging.INFO)

# データベースと認証の設定
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'
jwt = JWTManager(app)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)

class Device(db.Model):
    id = db.Column(db.String(150), primary_key=True)
    type = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if User.query.filter_by(username=username).first():
            return jsonify({"msg": "Username already exists"}), 400
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        new_user = User(username=username, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
            login_user(user)
            access_token = create_access_token(identity=username)
            return jsonify(access_token=access_token)
        else:
            return jsonify({"msg": "Invalid credentials"}), 401
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/device_settings')
@login_required
def device_settings():
    return render_template('device_settings.html')

@app.route('/device_details')
@login_required
def device_details():
    return render_template('device_details.html')

@app.route('/add_device', methods=['GET', 'POST'])
@login_required
def add_device():
    if request.method == 'POST':
        try:
            data = request.form
            new_device = Device(
                id=data['deviceId'],
                type=data['deviceType'],
                location=data['deviceLocation'],
                name=data['deviceName'],
                user_id=current_user.id
            )
            db.session.add(new_device)
            db.session.commit()
            return redirect(url_for('device_settings'))
        except Exception as e:
            app.logger.error(f"Error adding device: {e}")
            return 'Error adding device', 500
    return render_template('add_device.html')

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        # プロファイル更新の処理をここに追加
        pass
    return render_template('profile.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/api/userinfo')
@jwt_required()
def userinfo():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user).first()
        return jsonify(username=user.username)
    except Exception as e:
        app.logger.error(f"Error retrieving user info: {e}")
        return jsonify(success=False, error="Error retrieving user info"), 500

@app.route('/api/devices', methods=['GET', 'POST'])
@jwt_required()
def devices():
    current_user = get_jwt_identity()
    app.logger.info(f"Current user: {current_user}")
    user = User.query.filter_by(username=current_user).first()
    app.logger.info(f"User: {user}")
    app.logger.info(f"Request method: {request.method}")
    app.logger.info(f"Request headers: {request.headers}")
    app.logger.info(f"Request data: {request.get_data()}")

    if request.method == 'POST':
        data = request.get_json()
        app.logger.info(f"Data received: {data}")
        if not data or not 'id' in data or not 'type' in data or not 'location' in data or not 'name' in data:
            app.logger.error("Missing required fields in the data")
            return jsonify(success=False, error="Missing required fields"), 422
        try:
            device = Device(id=data['id'], type=data['type'], location=data['location'], name=data['name'], user_id=user.id)
            db.session.add(device)
            db.session.commit()
            return jsonify(success=True)
        except Exception as e:
            app.logger.error(f"Error adding device: {e}")
            return jsonify(success=False, error="Error adding device"), 500
    elif request.method == 'GET':
        try:
            devices = Device.query.filter_by(user_id=user.id).all()
            app.logger.info(f"Devices: {devices}")
            return jsonify([{'id': d.id, 'type': d.type, 'location': d.location, 'name': d.name} for d in devices])
        except Exception as e:
            app.logger.error(f"Error retrieving devices: {e}")
            return jsonify(success=False, error="Error retrieving devices"), 500

@app.route('/api/device/<device_id>', methods=['GET', 'DELETE'])
@jwt_required()
def manage_device(device_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    device = Device.query.filter_by(id=device_id, user_id=user.id).first()
    
    if not device:
        return jsonify({"msg": "Device not found"}), 404

    if request.method == 'GET':
        # Sample data; replace with actual data retrieval
        device_data = {
            "id": device.id,
            "name": device.name,
            "latitude": 35.6895,
            "longitude": 139.6917,
            "temperature": 25.5,
            "humidity": 60,
            "wind_direction": 90,  # degrees
            "wind_speed": 5.5
        }
        return jsonify(device_data)

    elif request.method == 'DELETE':
        try:
            db.session.delete(device)
            db.session.commit()
            return jsonify({"msg": "Device deleted successfully"}), 200
        except Exception as e:
            return jsonify({"msg": "Failed to delete device", "error": str(e)}), 500

@app.route('/api/device/<device_id>/24hour_data', methods=['GET'])
@jwt_required()
def get_device_24hour_data(device_id):
    current_user = get_jwt_identity()
    device = Device.query.filter_by(id=device_id, user_id=current_user.id).first()
    if not device:
        return jsonify({"msg": "Device not found"}), 404

    # Sample data; replace with actual data retrieval
    data = [
        {"time": "2023-06-01T00:00:00Z", "temperature": 22.5, "humidity": 55, "wind_speed": 3.2},
        {"time": "2023-06-01T01:00:00Z", "temperature": 23.0, "humidity": 56, "wind_speed": 3.5},
        # Add more sample data points
    ]
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
