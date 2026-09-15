from flask import Flask, render_template, request, send_file, jsonify
import os
import tempfile
import uuid
from pdf2docx import Converter

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = tempfile.gettempdir()

CONVERTED_FILES = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/download-portable')
def download_portable():
    portable_path = os.path.join(os.path.dirname(__file__), 'static', 'Ingeniero.exe')
    if os.path.exists(portable_path):
        return send_file(portable_path, as_attachment=True, download_name="Ingeniero's Fraile.exe")
    return jsonify({'error': 'Archivo portable no encontrado'}), 404

@app.route('/convert', methods=['POST'])
def convert_pdf():
    if 'pdf_file' not in request.files:
        return jsonify({'error': 'No se seleccionó archivo'}), 400
    
    file = request.files['pdf_file']
    
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó archivo'}), 400
    
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'El archivo debe ser un PDF'}), 400
    
    try:
        temp_dir = tempfile.gettempdir()
        pdf_path = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")
        file.save(pdf_path)
        
        base_name = os.path.splitext(file.filename)[0]
        output_name = f"{base_name}.docx"
        output_path = os.path.join(temp_dir, f"{uuid.uuid4()}.docx")
        
        cv = Converter(pdf_path)
        cv.convert(output_path, start=0, end=None)
        cv.close()
        
        file_id = str(uuid.uuid4())
        CONVERTED_FILES[file_id] = {
            'path': output_path,
            'name': output_name,
            'original': file.filename
        }
        
        try:
            os.remove(pdf_path)
        except:
            pass
        
        return jsonify({
            'success': True,
            'file_id': file_id,
            'filename': output_name,
            'original': file.filename
        })
        
    except Exception as e:
        return jsonify({'error': f'Error en la conversión: {str(e)}'}), 500

@app.route('/download/<file_id>')
def download_file(file_id):
    if file_id not in CONVERTED_FILES:
        return jsonify({'error': 'Archivo no encontrado o expirado'}), 404
    
    file_info = CONVERTED_FILES[file_id]
    
    try:
        response = send_file(
            file_info['path'],
            as_attachment=True,
            download_name=file_info['name'],
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        
        def cleanup(response):
            try:
                os.remove(file_info['path'])
                del CONVERTED_FILES[file_id]
            except:
                pass
        
        response.call_on_close(cleanup)
        return response
        
    except Exception as e:
        return jsonify({'error': 'Error al descargar'}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({'error': 'El archivo excede el límite de 50MB'}), 413

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
