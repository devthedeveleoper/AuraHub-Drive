const axios = require('axios');

// The base URL for your hosted FastAPI service
const api = axios.create({
  baseURL: 'https://api.aurahub.fun',
});

/**
 * Creates a new folder on Streamtape using a POST request
 * with the folder name passed as a URL query parameter.
 * @param {string} folderName - The name for the new folder (our UUID).
 * @returns {Promise<string>} The folder ID from Streamtape.
 */
const createFolder = async (folderName) => {
  try {
    // Making a POST request, but adding the `name` as a URL parameter.
    const response = await api.post('/v1/file_manager/create_folder', null, {
      params: {
        name: folderName,
      },
    });
    // Return the folderid from the direct response object
    return response.data.folderid;
  } catch (error) {
    const errorMsg = error.response ? error.response.data : error.message;
    console.error('Error creating Streamtape folder:', errorMsg);
    throw new Error('Failed to create user folder on Streamtape.');
  }
};

module.exports = {
  createFolder,
};