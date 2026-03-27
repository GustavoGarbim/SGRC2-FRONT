import { createRouter, createWebHistory } from 'vue-router'
import Contratos from '../views/Contratos.vue'
import Clientes from '../views/Clientes.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/clientes'
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: Clientes
    },
    {
      path: '/contratos',
      name: 'contratos',
      component: Contratos
    }
  ],
})

export default router
