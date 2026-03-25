<script setup>
import './HomeView.css'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import 'primeicons/primeicons.css'
import Menu from 'primevue/menu'

import { ref, onMounted, nextTick } from 'vue'

const contratos = ref([])
const carregando = ref(false)
const fileInput = ref(null)
const importando = ref(false)
const contratoSelecionado = ref(null)
const menuAcoes = ref(null)
const itensMenu = ref([])

const abrirMenu = async (event, contrato) => {
  contratoSelecionado.value = contrato

  itensMenu.value = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => alert('Editando: ' + contrato.razaoSocialCliente),
    },
    {
      label: contrato.ativo ? 'Desativar' : 'Ativar',
      icon: contrato.ativo ? 'pi pi-trash' : 'pi pi-check',
      command: () => {
        if (contrato.ativo) {
          if (confirm(`Deseja desativar o contrato ${contrato.id}?`)) excluirContrato(contrato.id)
        } else {
          if (confirm(`Deseja ativar o contrato ${contrato.id}?`)) ativarContrato(contrato.id)
        }
      },
    },
  ]

  await nextTick()

  menuAcoes.value.toggle(event)
}

const escolherArquivo = () => {
  fileInput.value.click()
}
const ativarContrato = async (id) => {
  try {
    const request = await fetch(`http://localhost:5033/api/Contrato/AtivarContrato/${id}`, {
      method: 'POST',
    })

    if (!request.ok) {
      throw new Error('Falha ao ativar contrato.')
    }
    await carregarDados()
  } catch (error) {
    console.error('Erro na ativação: ', error)
    alert('Ops! Não foi possível ativar.')
  }
}

const excluirContrato = async (id) => {
  try {
    const request = await fetch(`http://localhost:5033/api/Contrato/${id}`, {
      method: 'DELETE',
    })

    if (!request.ok) {
      throw new Error('Falha ao Desativar contrato.')
    }
    await carregarDados()
  } catch (error) {
    console.error('Erro na exclusão: ', error)
    alert('Ops! Não foi possível excluir.')
  }
}

const enviarPlanilha = async (event) => {
  const arquivo = event.target.files[0]
  if (!arquivo) {
    return
  }

  const formData = new FormData()
  formData.append('file', arquivo)

  try {
    importando.value = true

    const response = await fetch('http://localhost:5033/api/Importacao/upload-excel', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Falha ao processar planilha.')
    }

    const resultado = await response.json()
    alert(`Sucesso! ${resultado.mensagem}`)
    await carregarDados()
  } catch (error) {
    console.error('Erro no upload:', error)
  } finally {
    importando.value = false
    event.target.value = ''
  }
}

const carregarDados = async () => {
  try {
    carregando.value = true

    const response = await fetch('http://localhost:5033/api/Contrato')
    if (!response.ok) {
      throw new Error('Falha ao buscar dados do servidor')
    }
    const dados = await response.json()

    contratos.value = dados
  } catch (err) {
    console.error('Erro na requisição: ', err)
    alert('Erro ao carregar dados. Verifique se o backend está rodando!')
  } finally {
    carregando.value = false
  }
}

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

const formatarCnpj = (cnpj) => {
  return cnpj.replace(/\"/g, '')
}

onMounted(() => {
  carregarDados()
})
</script>

<template>
  <main>
    <header id="header">
      <div id="image">
        <img src="../../public/favicon.ico" alt="Logo SGRC" />
      </div>
    </header>

    <div class="app-body">
      <nav id="side-bar"></nav>

      <section class="content">
        <div id="import-plan">
          <Button
            label="Importar Planilha"
            icon="pi pi-upload"
            class="btn-import"
            :loading="importando"
            @click="escolherArquivo"
          />

          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept=".csv, .xlsx, .xls"
            @change="enviarPlanilha"
          />
        </div>
        <div id="dashboard">
          <div class="toolbar">
            <Button
              icon="pi pi-refresh"
              class="btn-refresh"
              outlined
              rounded
              @click="carregarDados"
            />
          </div>

          <DataTable :value="contratos" class="tabela-contratos">
            <Column field="razaoSocialCliente" header="Razão Social"></Column>

            <Column header="CNPJ">
              <template #body="slotProps">
                {{ formatarCnpj(slotProps.data.cnpjCliente) }}
              </template>
            </Column>

            <Column field="numeroDocumento" header="Documento"></Column>

            <Column header="Valor Atual">
              <template #body="slotsProps">
                {{ formatarMoeda(slotsProps.data.valorAtual) }}
              </template>
            </Column>

            <Column field="indiceAplicado" header="Indice"></Column>

            <Column header="Status">
              <template #body="slotProps">
                <span :class="slotProps.data.ativo ? 'tag-ativo' : 'tag-inativo'">
                  {{ slotProps.data.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </template>
            </Column>

            <Column header="Ações">
              <template #body="slotProps">
                <Button
                  icon="pi pi-ellipsis-v"
                  text
                  rounded
                  @click="abrirMenu($event, slotProps.data)"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </section>
    </div>
    
    <Menu ref="menuAcoes" :model="itensMenu" :popup="true" appendTo="body" />
  </main>
</template>