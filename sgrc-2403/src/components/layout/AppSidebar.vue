<script setup>
import { RouterLink } from 'vue-router'
import "./AppSideBar.css";
</script>

<template>
  <nav id="side-bar">
    <div class="menu-lateral">
      <RouterLink to="/contratos" class="menu-item" active-class="menu-ativo">
        <i class="pi pi-file"></i>
        <span>Contratos</span>
      </RouterLink>

      <RouterLink to="/clientes" class="menu-item" active-class="menu-ativo">
        <i class="pi pi-users"></i>
        <span>Clientes</span>
      </RouterLink>
    </div>
  </nav>
</template>
