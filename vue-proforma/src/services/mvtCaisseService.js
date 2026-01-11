import axios from 'axios'

const API_URL = '/rest/mvtcaisse'

export default {
  initEntree(idProforma) {
    return axios.get(`${API_URL}/entree/init`, { params: { idProforma } })
  },

  create(payload) {
    return axios.post(API_URL, payload)
  },

  getById(id) {
    return axios.get(`${API_URL}/${id}`)
  },

  valider(id) {
    return axios.post(`${API_URL}/${id}/valider`)
  }
}
