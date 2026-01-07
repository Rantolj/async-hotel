import axios from 'axios'

const API_URL = '/api/proforma'

export default {
  getAll() {
    return axios.get(API_URL)
  },

  getById(id) {
    return axios.get(`${API_URL}/${id}`)
  },

  create(proforma) {
    return axios.post(API_URL, proforma)
  },

  update(id, proforma) {
    return axios.put(`${API_URL}/${id}`, proforma)
  },

  delete(id) {
    return axios.delete(`${API_URL}/${id}`)
  },

  addDetail(id, detail) {
    return axios.post(`${API_URL}/${id}/details`, detail)
  },

  calculateTotal(id) {
    return axios.get(`${API_URL}/${id}/calculate`)
  }
}

