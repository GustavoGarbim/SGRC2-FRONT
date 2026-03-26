<template>
  <nav id="side-bar">
    <div class="menu-lateral">
      <div
        class="menu-item"
        :class="{ 'menu-ativo': abaAtiva === 'contratos' }"
        @click="$emit('mudarAba', 'contratos')"
      >
        <i class="pi pi-file"></i>
        <span>Contratos</span>
      </div>

      <div
        class="menu-item"
        :class="{ 'menu-ativo': abaAtiva === 'clientes' }"
        @click="$emit('mudarAba', 'clientes')"
      >
        <i class="pi pi-users"></i>
        <span>Clientes</span>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineProps({ abaAtiva: String })
defineEmits(['mudarAba'])
</script>
