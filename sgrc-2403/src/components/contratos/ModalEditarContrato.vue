<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Editar Contrato"
    :style="{ width: '400px' }"
    modal
  >
    <div class="form-container">
      <div class="form-group">
        <label>Cliente (Não editável)</label>
        <InputText :value="formEdicao.razaoSocialCliente" disabled />
      </div>
      <div class="form-group">
        <label for="editDocumento">Nº Documento</label>
        <InputText id="editDocumento" v-model="formEdicao.numeroDocumento" />
      </div>
      <div class="form-group">
        <label for="editIndice">Índice</label>
        <InputText id="editIndice" v-model="formEdicao.indiceAplicado" />
      </div>
      <div class="form-group">
        <label for="editValor">Valor Atual (R$)</label>
        <InputNumber
          id="editValor"
          v-model="formEdicao.valorAtual"
          mode="currency"
          currency="BRL"
          locale="pt-BR"
        />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="$emit('update:visible', false)" />
      <Button
        label="Salvar Alterações"
        icon="pi pi-check"
        class="btn-primary"
        @click="$emit('salvar')"
        :loading="salvandoEdicao"
      />
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

defineProps({
  visible: Boolean,
  formEdicao: Object,
  salvandoEdicao: Boolean,
})
defineEmits(['update:visible', 'salvar'])
</script>
