import axios from 'axios'

const API_URL = '/api/reservation'

export default {
  // Réservations CRUD
  getAll(params = {}) {
    return axios.get(API_URL, { params })
  },

  getById(id) {
    return axios.get(`${API_URL}/${id}`)
  },

  create(reservation) {
    return axios.post(API_URL, reservation)
  },

  update(id, reservation) {
    return axios.put(`${API_URL}/${id}`, reservation)
  },

  delete(id) {
    return axios.delete(`${API_URL}/${id}`)
  },

  valider(id) {
    return axios.post(`${API_URL}/${id}/valider`)
  },

  // Calendrier
  getCalendar(date = null) {
    const params = date ? { date } : {}
    return axios.get(`${API_URL}/calendar`, { params })
  },

  // Détails
  getDetails(id) {
    return axios.get(`${API_URL}/${id}/details`)
  },

  getDetailsSansCheckin(id) {
    return axios.get(`${API_URL}/${id}/details-sans-checkin`)
  },

  // Check-in
  getCheckins(idReservation) {
    return axios.get(`${API_URL}/${idReservation}/checkins`)
  },

  initCheckin(idReservation) {
    return axios.get(`${API_URL}/init/checkin`, { params: { idReservation } })
  },

  createCheckin(idReservation, data) {
    return axios.post(`${API_URL}/${idReservation}/checkin`, data)
  },

  // Check-out
  getCheckouts(idReservation) {
    return axios.get(`${API_URL}/${idReservation}/checkouts`)
  },

  initCheckout(idReservation) {
    return axios.get(`${API_URL}/init/checkout`, { params: { idReservation } })
  },

  createCheckout(idReservation, data) {
    return axios.post(`${API_URL}/${idReservation}/checkout`, data)
  },

  // Références
  getClients(search = '') {
    return axios.get(`${API_URL}/clients`, { params: { search } })
  },

  getChambres(search = '') {
    return axios.get(`${API_URL}/chambres`, { params: { search } })
  },

  getTypePensions() {
    return axios.get(`${API_URL}/type-pensions`)
  },

  getModesPaiement() {
    return axios.get(`${API_URL}/modes-paiement`)
  }
}

