<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'

import './views/Contratos.css' 
</script>

<template>
  <main>
    <AppHeader />

    <div class="app-body">
      <AppSidebar />

      <section class="content">
        <RouterView /> 
      </section>
    </div>
  </main>
</template>