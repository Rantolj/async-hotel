import axios from 'axios'

const API_URL = '/api/mvtcaisse'

export default {
  // CRUD
  getAll(params = {}) {
    return axios.get(API_URL, { params })
  },

  getById(id) {
    return axios.get(`${API_URL}/${id}`)
  },

  create(mvtCaisse) {
    return axios.post(API_URL, mvtCaisse)
  },

  valider(id) {
    return axios.post(`${API_URL}/${id}/valider`)
  },

  // Init pour entrée (compatibilité existante)
  initEntree(idProforma) {
    return axios.get(`${API_URL}/entree/init`, { params: { idProforma } })
  },

  // Init pour caution
  initCaution(idReservation) {
    return axios.get(`${API_URL}/init/caution`, { 
      params: { idreservation: idReservation } 
    })
  },

  // Créer mouvement caution
  createCaution(mvtCaisse) {
    return axios.post(`${API_URL}/caution`, mvtCaisse)
  },

  // Récupérer cautions par réservation
  getByReservation(idReservation) {
    return axios.get(`${API_URL}/by-reservation/${idReservation}`)
  },

  // Références
  getCaisses() {
    return axios.get(`${API_URL}/caisses`)
  },

  getModesPaiement() {
    return axios.get(`${API_URL}/modes-paiement`)
  }
}

