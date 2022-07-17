from flask import render_template
from pyzbar.pyzbar import decode
from PIL import Image
from flask import render_template, redirect, request, Flask

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'JPG'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=["GET", "POST"])
def index():
    return render_template("index.html")

@app.route('/upload', methods=["POST"])
def upload():
    if 'image' not in request.files:
        # ファイルが選択されていない場合
        print('ファイルが選択されていません')
        return redirect('/')

    img = request.files['image']
    # 画像として読み込み

    if img.filename == "":
        # ファイル名がついていない場合
        print("ファイル名がありません")
        return redirect('/')

    if img and allowed_file(img.filename):
        try:
            # 画像内の QR Code をデコードする
            qrArray = [qr.data.decode() for qr in decode(Image.open(img))]
            result = sorted(qrArray)

            print(result)
            return render_template("index.html", result=result)

        except Exception as e:
            print(f"{e}")

        return redirect('/')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
