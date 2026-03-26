<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Cadastrar Novo Cliente"
    :style="{ width: '400px' }"
    modal
  >
    <div class="form-container">
      <div class="form-group">
        <label for="razaoSocial">Razão Social</label>
        <InputText
          id="razaoSocial"
          v-model="formCliente.razaoSocial"
          placeholder="Ex: Tech Corp Brasil"
        />
      </div>
      <div class="form-group">
        <label for="cnpj">CNPJ</label>
        <InputText id="cnpj" v-model="formCliente.cnpj" placeholder="Apenas números" />
      </div>
      <div class="form-group">
        <label for="email">E-mail Financeiro</label>
        <InputText
          id="email"
          type="email"
          v-model="formCliente.emailFinanceiro"
          placeholder="financeiro@empresa.com"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="$emit('update:visible', false)" />
      <Button
        label="Salvar Cliente"
        icon="pi pi-check"
        class="btn-primary"
        @click="$emit('salvar')"
      />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

defineProps({
  visible: Boolean,
  formCliente: Object,
})
defineEmits(['update:visible', 'salvar'])
</script>
