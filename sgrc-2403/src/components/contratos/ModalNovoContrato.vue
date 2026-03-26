<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Cadastrar Novo Contrato"
    :style="{ width: '500px' }"
    modal
  >
    <div class="form-container">
      <div class="form-group">
        <label for="cliente">Cliente</label>
        <Dropdown
          id="cliente"
          v-model="formContrato.clienteId"
          :options="listaClientes"
          optionLabel="razaoSocial"
          optionValue="id"
          placeholder="Selecione um Cliente"
        />
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label for="documento">Nº Documento</label>
          <InputText
            id="documento"
            v-model="formContrato.numeroDocumento"
            placeholder="Ex: CT-2026-001"
          />
        </div>
        <div class="form-group">
          <label for="indice">Índice</label>
          <InputText
            id="indice"
            v-model="formContrato.indiceAplicado"
            placeholder="Ex: IGPM, IPCA"
          />
        </div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label for="mesReajuste">Mês de Reajuste (1 a 12)</label>
          <InputNumber
            id="mesReajuste"
            v-model="formContrato.mesReajuste"
            :min="1"
            :max="12"
            placeholder="Ex: 5"
          />
        </div>
        <div class="form-group">
          <label for="valor">Valor Atual (R$)</label>
          <InputNumber
            id="valor"
            v-model="formContrato.valorAtual"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" icon="pi pi-times" text @click="$emit('update:visible', false)" />
      <Button
        label="Salvar Contrato"
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
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

defineProps({
  visible: Boolean,
  formContrato: Object,
  listaClientes: Array,
})
defineEmits(['update:visible', 'salvar'])
</script>
