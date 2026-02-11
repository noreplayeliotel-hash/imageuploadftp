// You can add helper functions here as needed
exports.isValidImageType = (mimetype) => {
  return mimetype.startsWith('image/');
};

exports.generateFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
};