/**
 * api.js - Axios service for CrackFinder
 * Calls the Flask backend POST /predict endpoint.
 */

import axios from 'axios'

// Use environment variable in production; default to localhost for development
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Send an image file to the backend for crack detection.
 * @param {File} imageFile - The image file from the user
 * @returns {Promise<{ prediction: string, confidence: number }>}
 */
export async function detectCrack(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await axios.post(`${BASE_URL}/predict`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // 30 second timeout
  })

  return response.data
}
