# Convertidor PDF a Word - Versión Web

## Ingeniero's Fraile

### Instrucciones de Instalación

1. Instalar dependencias:
```bash
pip install -r requirements.txt
```

2. Ejecutar la aplicación:
```bash
python app.py
```

3. Abrir en el navegador:
```
http://localhost:5000
```

### Características

- Interfaz web con tema oscuro
- Conversión de PDF a Word
- Drag & drop para subir archivos
- Límite de 50MB por archivo
- Descarga directa del archivo convertido

### Tecnologías

- **Backend:** Python Flask
- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Conversión:** pdf2docx

### Notas

- Los archivos se procesan temporalmente en el servidor
- Los archivos convertidos se eliminan automáticamente después de la descarga
- Se recomienda revisar el archivo generado por posibles diferencias de formato
