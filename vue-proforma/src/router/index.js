import { createRouter, createWebHistory } from 'vue-router'
import ProformaList from '../views/ProformaList.vue'
import ProformaForm from '../views/ProformaForm.vue'
import ProformaDetail from '../views/ProformaDetail.vue'
import MvtCaisseEntree from '../views/MvtCaisseEntree.vue'
import MvtCaisseFiche from '../views/MvtCaisseFiche.vue'
import ReservationCalendar from '../views/ReservationCalendar.vue'
import ReservationFiche from '../views/ReservationFiche.vue'
import CheckinSaisie from '../views/CheckinSaisie.vue'
import CheckoutSaisie from '../views/CheckoutSaisie.vue'
import MvtCaisseCautionSaisie from '../views/MvtCaisseCautionSaisie.vue'

const routes = [
  { path: '/', name: 'list', component: ProformaList },
  { path: '/create', name: 'create', component: ProformaForm },
  { path: '/edit/:id', name: 'edit', component: ProformaForm },
  { path: '/detail/:id', name: 'detail', component: ProformaDetail },
  { path: '/caisse/mvt/entree', name: 'mvtcaisse-entree', component: MvtCaisseEntree },
  { path: '/mvtcaisse/:id', name: 'mvtcaisse-fiche', component: MvtCaisseFiche },
  // Routes Réservation
  { path: '/reservation/calendar', name: 'reservation-calendar', component: ReservationCalendar },
  { path: '/reservation/:id', name: 'reservation-fiche', component: ReservationFiche },
  { path: '/reservation/:id/checkin', name: 'checkin-saisie', component: CheckinSaisie },
  { path: '/reservation/:id/checkout', name: 'checkout-saisie', component: CheckoutSaisie },
  { path: '/reservation/:id/caution', name: 'caution-saisie', component: MvtCaisseCautionSaisie }
]

export default createRouter({
  history: createWebHistory(),
  routes
})

