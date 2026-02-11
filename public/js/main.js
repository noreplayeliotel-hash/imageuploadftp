document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const resultDiv = document.getElementById('result');
  const messageDiv = document.getElementById('message');
  const previewDiv = document.getElementById('image-preview');
  const imageUrlInput = document.getElementById('imageUrl');
  const copyBtn = document.getElementById('copyBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const file = formData.get('image');
    
    if (!file || !file.type.startsWith('image/')) {
      showMessage('Please select a valid image file', 'error');
      return;
    }
    
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showResult(data);
      } else {
        showMessage(data.error || 'Upload failed', 'error');
      }
    } catch (error) {
      showMessage('An error occurred during upload', 'error');
      console.error(error);
    }
  });
  
  copyBtn.addEventListener('click', () => {
    imageUrlInput.select();
    document.execCommand('copy');
    alert('URL copied to clipboard!');
  });
  
  function showResult(data) {
    messageDiv.textContent = data.message;
    messageDiv.className = 'success';
    
    // Display image preview
    previewDiv.innerHTML = `<img src="${data.imageUrl}" alt="Uploaded image">`;
    
    // Show URL
    imageUrlInput.value = data.imageUrl;
    
    // Show result container
    resultDiv.classList.remove('hidden');
  }
  
  function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
    resultDiv.classList.remove('hidden');
    previewDiv.innerHTML = '';
    imageUrlInput.value = '';
  }
});