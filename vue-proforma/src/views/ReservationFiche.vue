<template>
  <div class="content-wrapper">
    <!-- Header avec retour -->
    <div class="page-header">
      <router-link to="/reservation/calendar" class="back-link">
        <i class="fa fa-chevron-left"></i> Fiche de la réservation
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <div v-else>
      <!-- Informations principales -->
      <div class="info-card">
        <div class="info-grid">
          <!-- Ligne 1 -->
          <div class="info-item">
            <span class="info-label">ID</span>
            <span class="info-value">{{ reservation.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Client(e)</span>
            <a href="#" class="info-value link" @click.prevent="goToClient">{{ reservation.clientNom }}</a>
          </div>
          <div class="info-item">
            <span class="info-label">Date de Location</span>
            <span class="info-value">{{ reservation.daty }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date prévisionnelle de départ</span>
            <span class="info-value">{{ reservation.datePrevisionDepart || '-' }}</span>
          </div>

          <!-- Ligne 2 -->
          <div class="info-item">
            <span class="info-label">Remarque</span>
            <span class="info-value">{{ reservation.remarque || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Montant remise</span>
            <span class="info-value">{{ formatNumber(reservation.montantRemise) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Montant</span>
            <span class="info-value">{{ formatNumber(reservation.montant) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Montant Acompte</span>
            <span class="info-value">{{ formatNumber(reservation.paye) }}</span>
          </div>

          <!-- Ligne 3 -->
          <div class="info-item">
            <span class="info-label">Reste à payer</span>
            <span class="info-value">{{ formatNumber(reservation.resteAPayer) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Montant caution</span>
            <span class="info-value">{{ formatNumber(reservation.montantCaution) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date retour caution</span>
            <span class="info-value">{{ reservation.datyCaution || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Montant retour caution</span>
            <span class="info-value">{{ formatNumber(reservation.debitCaution) }}</span>
          </div>

          <!-- Ligne 4 -->
          <div class="info-item">
            <span class="info-label">Proforma</span>
            <a href="#" class="info-value link" @click.prevent="goToProforma">{{ reservation.idOrigine }}</a>
          </div>
          <div class="info-item">
            <span class="info-label">Lieu de location</span>
            <span class="info-value">{{ reservation.lieuLocation || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Date prévisionnelle de retour</span>
            <span class="info-value">{{ reservation.datePrevisionRetour || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Période</span>
            <span class="info-value">{{ reservation.periode || '-' }}</span>
          </div>

          <!-- Ligne 5 -->
          <div class="info-item">
            <span class="info-label">Numéro du bon de livraison</span>
            <span class="info-value">{{ reservation.numBl || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Livraison/Récupération</span>
            <span class="info-value">{{ reservation.modeLivraison || '-' }}</span>
          </div>
          <div class="info-item"></div>
          <div class="info-item"></div>
        </div>

        <!-- Boutons d'action -->
        <div class="action-buttons">
          <button class="btn btn-danger btn-sm" @click="annulerVisa" v-if="canAnnulerVisa">
            Annuler Visa
          </button>
          <div class="right-buttons">
            <button class="btn btn-primary btn-sm" @click="reglerCaution" v-if="reservation.montantCaution > 0">
              Regler caution
            </button>
            <button class="btn btn-outline btn-sm" @click="ajouterEquipe">
              Ajouter équipe responsable
            </button>
            <button class="btn btn-info btn-sm" @click="goToReception">
              Réception
            </button>
            <button class="btn btn-outline btn-sm" @click="goBack">
              <i class="fa fa-arrow-left"></i> Calendrier
            </button>
            <button class="btn btn-outline btn-sm" @click="imprimerBL">
              Imprimer BL
            </button>
          </div>
        </div>
      </div>

      <!-- Onglets -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button 
            :class="['tab-btn', { active: activeTab === 'details' }]" 
            @click="activeTab = 'details'"
          >
            Détails
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'checkins' }]" 
            @click="activeTab = 'checkins'"
          >
            Livraison/Récupération effectuée
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'checkouts' }]" 
            @click="activeTab = 'checkouts'"
          >
            Réception effectuée
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'factures' }]" 
            @click="activeTab = 'factures'"
          >
            Liste des Factures
          </button>
          <button 
            :class="['tab-btn', { active: activeTab === 'caution' }]" 
            @click="activeTab = 'caution'"
          >
            Caution
          </button>
        </div>

        <div class="tab-content">
          <!-- Onglet Détails -->
          <div v-show="activeTab === 'details'" class="tab-pane">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID<i class="fa fa-sort"></i></th>
                  <th>Référence<i class="fa fa-sort"></i></th>
                  <th>Produit<i class="fa fa-sort"></i></th>
                  <th>Image<i class="fa fa-sort"></i></th>
                  <th>Quantité<i class="fa fa-sort"></i></th>
                  <th>Prix Unitaire<i class="fa fa-sort"></i></th>
                  <th>Montant<i class="fa fa-sort"></i></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detail in details" :key="detail.id">
                  <td><a href="#" class="link">{{ detail.id }}</a></td>
                  <td>{{ detail.reference }}</td>
                  <td>{{ detail.produit }}</td>
                  <td><img v-if="detail.image" :src="detail.image" class="thumb" /></td>
                  <td>{{ detail.qte }}</td>
                  <td>{{ formatNumber(detail.prixUnitaire) }}</td>
                  <td>{{ formatNumber(detail.montant) }}</td>
                </tr>
                <tr v-if="details.length === 0">
                  <td colspan="7" class="text-center">Aucun détail</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Onglet Livraison/Récupération effectuée (Check-ins) -->
          <div v-show="activeTab === 'checkins'" class="tab-pane">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID<i class="fa fa-sort"></i></th>
                  <th>Référence<i class="fa fa-sort"></i></th>
                  <th>Produit<i class="fa fa-sort"></i></th>
                  <th>Image<i class="fa fa-sort"></i></th>
                  <th>Quantité<i class="fa fa-sort"></i></th>
                  <th>Date De Début<i class="fa fa-sort"></i></th>
                  <th>Heure<i class="fa fa-sort"></i></th>
                  <th>État<i class="fa fa-sort"></i></th>
                  <th>Responsable<i class="fa fa-sort"></i></th>
                  <th>Type<i class="fa fa-sort"></i></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="checkin in checkins" :key="checkin.id">
                  <td><a href="#" class="link">{{ checkin.id }}</a></td>
                  <td>{{ checkin.reference }}</td>
                  <td>{{ checkin.produit }}</td>
                  <td><img v-if="checkin.image" :src="checkin.image" class="thumb" /></td>
                  <td>{{ checkin.qte }}</td>
                  <td>{{ checkin.daty }}</td>
                  <td>{{ checkin.heure }}</td>
                  <td>{{ checkin.etat }}</td>
                  <td>{{ checkin.responsable }}</td>
                  <td>{{ checkin.type }}</td>
                  <td>
                    <button class="btn-icon" @click="openCheckinMenu(checkin)">
                      <i class="fa fa-ellipsis-v"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="checkins.length === 0">
                  <td colspan="11" class="text-center">Aucune livraison/récupération effectuée</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Onglet Réception effectuée (Check-outs) -->
          <div v-show="activeTab === 'checkouts'" class="tab-pane">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID<i class="fa fa-sort"></i></th>
                  <th>Référence<i class="fa fa-sort"></i></th>
                  <th>Produit<i class="fa fa-sort"></i></th>
                  <th>Image<i class="fa fa-sort"></i></th>
                  <th>Quantité<i class="fa fa-sort"></i></th>
                  <th>Date Retour<i class="fa fa-sort"></i></th>
                  <th>Heure<i class="fa fa-sort"></i></th>
                  <th>État<i class="fa fa-sort"></i></th>
                  <th>Responsable<i class="fa fa-sort"></i></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="checkout in checkouts" :key="checkout.id">
                  <td><a href="#" class="link">{{ checkout.id }}</a></td>
                  <td>{{ checkout.reference }}</td>
                  <td>{{ checkout.produit }}</td>
                  <td><img v-if="checkout.image" :src="checkout.image" class="thumb" /></td>
                  <td>{{ checkout.qte }}</td>
                  <td>{{ checkout.daty }}</td>
                  <td>{{ checkout.heure }}</td>
                  <td>{{ checkout.etat }}</td>
                  <td>{{ checkout.responsable }}</td>
                  <td>
                    <button class="btn-icon" @click="openCheckoutMenu(checkout)">
                      <i class="fa fa-ellipsis-v"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="checkouts.length === 0">
                  <td colspan="10" class="text-center">Aucune réception effectuée</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Onglet Liste des Factures -->
          <div v-show="activeTab === 'factures'" class="tab-pane">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID<i class="fa fa-sort"></i></th>
                  <th>Date<i class="fa fa-sort"></i></th>
                  <th>Montant<i class="fa fa-sort"></i></th>
                  <th>État<i class="fa fa-sort"></i></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="facture in factures" :key="facture.id">
                  <td><a href="#" class="link">{{ facture.id }}</a></td>
                  <td>{{ facture.daty }}</td>
                  <td>{{ formatNumber(facture.montant) }}</td>
                  <td>{{ facture.etat }}</td>
                  <td>
                    <button class="btn-icon" @click="openFactureMenu(facture)">
                      <i class="fa fa-ellipsis-v"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="factures.length === 0">
                  <td colspan="5" class="text-center">Aucune facture</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Onglet Caution -->
          <div v-show="activeTab === 'caution'" class="tab-pane">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID<i class="fa fa-sort"></i></th>
                  <th>Date<i class="fa fa-sort"></i></th>
                  <th>Montant<i class="fa fa-sort"></i></th>
                  <th>Type<i class="fa fa-sort"></i></th>
                  <th>État<i class="fa fa-sort"></i></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="caution in cautions" :key="caution.id">
                  <td><a href="#" class="link" @click.prevent="openCautionDetail(caution.id)">{{ caution.id }}</a></td>
                  <td>{{ caution.daty }}</td>
                  <td>{{ formatNumber(caution.montant) }}</td>
                  <td>{{ caution.type }}</td>
                  <td>{{ caution.etat }}</td>
                  <td>
                    <button class="btn-icon" @click="openCautionMenu(caution)">
                      <i class="fa fa-ellipsis-v"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="cautions.length === 0">
                  <td colspan="6" class="text-center">Aucune caution</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import reservationService from '../services/reservationService'
import cautionService from '../services/cautionService'

export default {
  name: 'ReservationFiche',
  data() {
    return {
      reservation: {},
      details: [],
      checkins: [],
      checkouts: [],
      factures: [],
      cautions: [],
      activeTab: 'details',
      loading: true,
      errorMessage: ''
    }
  },
  computed: {
    canAnnulerVisa() {
      return this.reservation.etat === 11 // État VISÉ
    }
  },
  async mounted() {
    await this.loadReservation()
  },
  methods: {
    async loadReservation() {
      this.loading = true
      this.errorMessage = ''
      const id = this.$route.params.id
      try {
        const resaResp = await reservationService.getById(id)
        this.reservation = resaResp.data

        // Charger les données secondaires en parallèle
        const [detailsResp, checkinsResp, checkoutsResp, cautionsResp] = await Promise.allSettled([
          reservationService.getDetails(id),
          reservationService.getCheckins(id),
          reservationService.getCheckouts(id),
          cautionService.getByReservation(id)
        ])

        this.details = detailsResp.status === 'fulfilled' ? (detailsResp.value.data || []) : []
        this.checkins = checkinsResp.status === 'fulfilled' ? (checkinsResp.value.data || []) : []
        this.checkouts = checkoutsResp.status === 'fulfilled' ? (checkoutsResp.value.data || []) : []
        this.cautions = cautionsResp.status === 'fulfilled' ? (cautionsResp.value.data || []) : []
      } catch (e) {
        console.error('Erreur chargement réservation:', e)
        this.errorMessage = e.response?.data?.error || e.message || 'Erreur lors du chargement'
      } finally {
        this.loading = false
      }
    },
    formatNumber(val) {
      if (val === null || val === undefined) return '0'
      return new Intl.NumberFormat('fr-FR').format(val)
    },
    goToClient() {
      if (this.reservation.idClient) {
        console.log('Go to client:', this.reservation.idClient)
      }
    },
    goToProforma() {
      if (this.reservation.idOrigine) {
        this.$router.push(`/proforma/${this.reservation.idOrigine}`)
      }
    },
    goBack() {
      this.$router.push('/reservation/calendar')
    },
    goToReception() {
      this.$router.push(`/reservation/${this.reservation.id}/checkout`)
    },
    annulerVisa() {
      if (confirm('Êtes-vous sûr de vouloir annuler le visa de cette réservation ?')) {
        console.log('Annuler visa')
      }
    },
    reglerCaution() {
      this.$router.push({
        name: 'mvtcaisse-caution-saisie',
        query: { 
          idreservation: this.reservation.id,
          type: 'regler'
        }
      })
    },
    ajouterEquipe() {
      console.log('Ajouter équipe responsable')
    },
    imprimerBL() {
      window.open(`/rest/export/bl?id=${this.reservation.id}`, '_blank')
    },
    openCheckinMenu(checkin) {
      console.log('Checkin menu:', checkin)
    },
    openCheckoutMenu(checkout) {
      console.log('Checkout menu:', checkout)
    },
    openFactureMenu(facture) {
      console.log('Facture menu:', facture)
    },
    openCautionMenu(caution) {
      console.log('Caution menu:', caution)
    },
    openCautionDetail(id) {
      this.$router.push(`/mvtcaisse/${id}`)
    }
  }
}
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
}

.back-link {
  color: #333;
  text-decoration: none;
  font-size: 18px;
  font-weight: 500;
}

.back-link:hover {
  color: #0d6efd;
}

.back-link i {
  margin-right: 8px;
}

.info-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #888;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-value.link {
  color: #0d6efd;
  cursor: pointer;
  text-decoration: none;
}

.info-value.link:hover {
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.right-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-primary {
  background: #0d6efd;
  color: #fff;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background: #0b5ed7;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
  border-color: #dc3545;
}

.btn-danger:hover {
  background: #bb2d3b;
}

.btn-info {
  background: #17a2b8;
  color: #fff;
  border-color: #17a2b8;
}

.btn-info:hover {
  background: #138496;
}

.btn-outline {
  background: #fff;
  color: #333;
  border-color: #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
}

.tabs-container {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #ddd;
  background: #fafafa;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #333;
  background: #f0f0f0;
}

.tab-btn.active {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
  background: #fff;
}

.tab-content {
  padding: 0;
}

.tab-pane {
  min-height: 200px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #fafafa;
  font-weight: 500;
  font-size: 13px;
  color: #666;
}

.data-table th i {
  margin-left: 5px;
  font-size: 10px;
  color: #ccc;
}

.data-table td {
  font-size: 14px;
  color: #333;
}

.data-table tbody tr:hover {
  background: #f9f9f9;
}

.data-table .link {
  color: #0d6efd;
  text-decoration: none;
}

.data-table .link:hover {
  text-decoration: underline;
}

.thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.btn-icon {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  color: #666;
}

.btn-icon:hover {
  color: #333;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding: 24px 0;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.alert-danger {
  background: #f8d7da;
  color: #842029;
  border: 1px solid #f5c2c7;
}

@media (max-width: 1200px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }
  
  .right-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .tabs-header {
    flex-wrap: wrap;
  }
}
</style>
