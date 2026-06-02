exports.uploadImage = async (file) => {
  return { url: `https://cdn.example.com/${file?.name || 'default'}` };
};
