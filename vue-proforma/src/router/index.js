import { createRouter, createWebHistory } from 'vue-router'
import ProformaList from '../views/ProformaList.vue'
import ProformaForm from '../views/ProformaForm.vue'
import ProformaDetail from '../views/ProformaDetail.vue'

const routes = [
  { path: '/', name: 'list', component: ProformaList },
  { path: '/create', name: 'create', component: ProformaForm },
  { path: '/edit/:id', name: 'edit', component: ProformaForm },
  { path: '/detail/:id', name: 'detail', component: ProformaDetail }
]

export default createRouter({
  history: createWebHistory(),
  routes
})

