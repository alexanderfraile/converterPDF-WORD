const uploadArea = document.getElementById('uploadArea');
const pdfInput = document.getElementById('pdfInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeBtn = document.getElementById('removeBtn');
const convertBtn = document.getElementById('convertBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultBox = document.getElementById('resultBox');
const resultText = document.getElementById('resultText');
const downloadBtn = document.getElementById('downloadBtn');
const errorBox = document.getElementById('errorBox');
const errorText = document.getElementById('errorText');

let selectedFile = null;

uploadArea.addEventListener('click', () => pdfInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        handleFile(files[0]);
    }
});

pdfInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

removeBtn.addEventListener('click', () => {
    clearSelection();
});

convertBtn.addEventListener('click', () => {
    convertFile();
});

function handleFile(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    fileInfo.style.display = 'flex';
    convertBtn.disabled = false;
    hideResult();
    hideError();
}

function clearSelection() {
    selectedFile = null;
    pdfInput.value = '';
    fileInfo.style.display = 'none';
    convertBtn.disabled = true;
    hideResult();
    hideError();
}

function showProgress() {
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    animateProgress();
}

function animateProgress() {
    let width = 0;
    const interval = setInterval(() => {
        if (width < 90) {
            width += Math.random() * 15;
            progressFill.style.width = width + '%';
        }
    }, 200);
    
    window.progressInterval = interval;
}

function hideProgress() {
    clearInterval(window.progressInterval);
    progressFill.style.width = '100%';
    setTimeout(() => {
        progressContainer.style.display = 'none';
    }, 300);
}

function showResult(filename, fileId) {
    resultText.textContent = `✓ ${filename} convertido exitosamente`;
    downloadBtn.href = `/download/${fileId}`;
    resultBox.style.display = 'block';
}

function hideResult() {
    resultBox.style.display = 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorBox.style.display = 'block';
}

function hideError() {
    errorBox.style.display = 'none';
}

async function convertFile() {
    if (!selectedFile) return;
    
    convertBtn.disabled = true;
    hideResult();
    hideError();
    showProgress();
    progressText.textContent = 'Convirtiendo a Word...';
    
    const formData = new FormData();
    formData.append('pdf_file', selectedFile);
    
    try {
        const response = await fetch('/convert', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        hideProgress();
        
        if (data.success) {
            showResult(data.filename, data.file_id);
        } else {
            showError(data.error || 'Error desconocido');
        }
        
    } catch (error) {
        hideProgress();
        showError('Error de conexión. Intenta de nuevo.');
    }
    
    convertBtn.disabled = false;
}
