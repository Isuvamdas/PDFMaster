// Global variables
let currentFile = null;
let currentTool = null;
let processedFile = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTools();
    initializeUpload();
    initializeModal();
    initializeMobileMenu();
});

// Tool functionality
function initializeTools() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            currentTool = this.getAttribute('data-tool');
            const toolName = this.querySelector('h3').textContent;
            
            // Show upload section and hide tools section
            document.querySelector('.tools-section').style.display = 'none';
            document.getElementById('uploadSection').style.display = 'block';
            
            // Update selected tool name
            document.getElementById('selectedToolName').textContent = toolName;
            
            // Scroll to upload section
            document.getElementById('uploadSection').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Back to tools button
    document.getElementById('backToTools').addEventListener('click', function() {
        document.getElementById('uploadSection').style.display = 'none';
        document.querySelector('.tools-section').style.display = 'block';
        document.querySelector('.tools-section').scrollIntoView({ behavior: 'smooth' });
    });
}

// File upload functionality
function initializeUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileInfo = document.querySelector('.file-info');
    
    uploadBtn.addEventListener('click', triggerFileInput);
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });
}

function triggerFileInput() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    
    // Set accepted file types based on selected tool
    if (currentTool.includes('pdf-to-') || currentTool.includes('to-pdf')) {
        fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png';
    } else {
        fileInput.accept = '.pdf';
    }
    
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFileSelection(this.files[0]);
        }
    });
    fileInput.click();
}

function handleFileSelection(file) {
    // Check if file type is supported
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        alert('Please select a supported file type (PDF, Word, PowerPoint, Excel, or image).');
        return;
    }
    
    currentFile = file;
    
    // Update file info display
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    document.querySelector('.file-info').style.display = 'block';
    
    // Update upload area text
    document.querySelector('#uploadArea h3').textContent = 'File Ready for Processing';
    document.querySelector('#uploadArea p').textContent = `Selected: ${file.name}`;
    
    // Process the file after a short delay
    setTimeout(() => {
        processFile();
    }, 1000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('processingModal');
    const closeBtn = document.getElementById('modalClose');
    const downloadBtn = document.getElementById('downloadBtn');
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    downloadBtn.addEventListener('click', function() {
        downloadProcessedFile();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function processFile() {
    const toolName = document.getElementById('selectedToolName').textContent;
    openProcessingModal(toolName);
    
    const processingText = document.getElementById('processingText');
    const progressBar = document.getElementById('progressBar');
    const downloadBtn = document.getElementById('downloadBtn');
    
    const steps = [
        'Uploading file...',
        'Analyzing document structure...',
        'Processing content...',
        'Applying changes...',
        'Finalizing output...',
        'Complete!'
    ];
    
    let step = 0;
    const interval = setInterval(() => {
        if (step < steps.length) {
            processingText.textContent = steps[step];
            progressBar.style.width = `${(step / (steps.length - 1)) * 100}%`;
            step++;
        } else {
            clearInterval(interval);
            processingText.textContent = `Your file has been successfully processed with ${toolName}!`;
            downloadBtn.style.display = 'block';
            
            // Generate a realistic file name based on the tool
            const originalName = currentFile.name.split('.')[0];
            let extension = '.pdf';
            let newName = '';
            
            switch(currentTool) {
                case 'compress':
                    newName = `${originalName}_compressed${extension}`;
                    break;
                case 'merge':
                    newName = `merged_document${extension}`;
                    break;
                case 'split':
                    newName = `${originalName}_part1${extension}`;
                    break;
                case 'pdf-to-word':
                    extension = '.docx';
                    newName = `${originalName}${extension}`;
                    break;
                case 'pdf-to-ppt':
                    extension = '.pptx';
                    newName = `${originalName}${extension}`;
                    break;
                case 'pdf-to-excel':
                    extension = '.xlsx';
                    newName = `${originalName}${extension}`;
                    break;
                case 'pdf-to-jpg':
                    extension = '.jpg';
                    newName = `${originalName}_page1${extension}`;
                    break;
                default:
                    newName = `${originalName}_${currentTool}${extension}`;
            }
            
            downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download ${newName}`;
            downloadBtn.setAttribute('data-filename', newName);
            
            // Create a mock processed file for download
            processedFile = generateMockFile(newName);
        }
    }, 800);
}

function openProcessingModal(toolName) {
    const modal = document.getElementById('processingModal');
    const modalTitle = document.getElementById('modalTitle');
    const processingText = document.getElementById('processingText');
    const progressBar = document.getElementById('progressBar');
    const downloadBtn = document.getElementById('downloadBtn');
    
    modalTitle.textContent = `Processing: ${toolName}`;
    processingText.textContent = 'Initializing...';
    progressBar.style.width = '0%';
    downloadBtn.style.display = 'none';
    
    modal.style.display = 'flex';
}

function generateMockFile(filename) {
    // Create a simple text file as a mock processed file
    // In a real application, this would be the actual processed PDF
    const content = `This is a mock file representing the processed output.\n\n` +
                   `Original file: ${currentFile.name}\n` +
                   `Tool used: ${currentTool}\n` +
                   `Processing completed at: ${new Date().toLocaleString()}\n\n` +
                   `In a real application, this would be the actual processed PDF content.`;
    
    return new Blob([content], { type: 'application/octet-stream' });
}

function downloadProcessedFile() {
    if (!processedFile) {
        alert('No processed file available for download.');
        return;
    }
    
    const downloadBtn = document.getElementById('downloadBtn');
    const filename = downloadBtn.getAttribute('data-filename') || 'processed_file.pdf';
    
    // Create a download link
    const url = URL.createObjectURL(processedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    // Close modal after download
    document.getElementById('processingModal').style.display = 'none';
    
    // Reset the interface
    setTimeout(() => {
        document.getElementById('uploadSection').style.display = 'none';
        document.querySelector('.tools-section').style.display = 'block';
        document.querySelector('.file-info').style.display = 'none';
        document.querySelector('#uploadArea h3').textContent = 'Upload Your File';
        document.querySelector('#uploadArea p').textContent = 'Drag & drop your file here or click to browse';
    }, 500);
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    
    mobileMenu.addEventListener('click', function() {
        nav.classList.toggle('active');
    });
    
    // Adjust menu for window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
        }
    });
}