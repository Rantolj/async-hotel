import axios from 'axios'

const API_URL = '/api/proforma'

export default {
  // Proforma CRUD
  getAll(params = {}) {
    return axios.get(API_URL, { params })
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

  // Détails
  addDetail(id, detail) {
    return axios.post(`${API_URL}/${id}/details`, detail)
  },

  // Calculs
  calculateTotal(id) {
    return axios.get(`${API_URL}/${id}/calculate`)
  },

  // Actions
  valider(id) {
    return axios.post(`${API_URL}/${id}/valider`)
  },

  payer(id, paiement) {
    return axios.post(`${API_URL}/${id}/payer`, paiement)
  },

  // Références - utiliser les endpoints intégrés dans ProformaServlet
  getClients(search = '') {
    return axios.get(`${API_URL}/clients`, { params: { search } })
  },

  getProduits(search = '') {
    return axios.get(`${API_URL}/produits`, { params: { search } })
  },

  getMagasins() {
    return axios.get(`${API_URL}/magasins`)
  },

  // Export
  exportPdf(id) {
    return axios.get(`/api/export/proforma`, { 
      params: { id },
      responseType: 'blob'
    })
  }
}

