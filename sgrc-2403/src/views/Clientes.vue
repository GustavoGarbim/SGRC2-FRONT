<script setup>
import './Contratos.css'

import ModalNovoCliente from '../components/clientes/ModalNovoCliente.vue'

import 'primeicons/primeicons.css'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Menu from 'primevue/menu'

import { ref, onMounted, nextTick } from 'vue'

import { formatarCnpj } from '../utils/formatadores'
import {
  alterarStatusCliente,
  buscarTodosClientes,
  salvarNovoCliente,
} from '../services/clienteService'
import { gerarPlanilhaExcel, importarPlanilhaExcel } from '../services/clienteService'

const fileInput = ref(null)
const importando = ref(false)
const menuAcoes = ref(null)
const itensMenu = ref([])
const clienteSelecionado = ref(null)

const modalEditarVisivel = ref(false)
const modalClienteVisivel = ref(false)
const listaClientes = ref([])
const exportando = ref(false)

const formCliente = ref({
  razaoSocial: '',
  cnpj: '',
  emailFinanceiro: '',
  ativo: true,
})

const formEdicao = ref({
  id: 0,
  razaoSocialCliente: '',
  cnpjCliente: '',
  emailFinanceiro: '',
})

const carregarDados = async () => {
  try {
    listaClientes.value = await buscarTodosClientes()
  } catch (error) {
    console.error('Erro ao carregar lista de clientes:', error)
  }
}

const criarCliente = async () => {
  try {
    await salvarNovoCliente(formCliente.value)
    alert('Cliente criado com sucesso!')
    formCliente.value = {
      razaoSocial: '',
      cnpj: '',
      emailFinanceiro: '',
      ativo: true,
    }
    await carregarDados()
  } catch (error) {
    console.error('Erro ao criar cliente: ', error)
    alert('Erro ao criar o cliente. Verifique o console')
  }
}

const alternarStatus = async (cliente) => {
  try {
    await alterarStatusCliente(cliente.id, !cliente.ativo)
    await carregarDados()
  } catch (error) {
    console.error('Erro ao alterar status: ', error)
    alert('Ops! Não foi possível alterar o status.')
  }
}

const exportarPlanilha = async () => {
  exportando.value = true
  try {
    var confirmar = confirm('Deseja exportar a planilha?')
    if (confirmar) {
      const blob = await gerarPlanilhaExcel()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Relatorio_Clientes_SGRC.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Erro na exportação:', error)
    alert('Erro ao exportar a planilha. Verifique se o Back-end está rodando.')
  } finally {
    exportando.value = false
  }
}

const enviarPlanilha = async (event) => {
  const arquivo = event.target.files[0]
  if (!arquivo) return

  const formData = new FormData()
  formData.append('file', arquivo)

  try {
    importando.value = true
    const resultado = await importarPlanilhaExcel(formData)
    alert(`Sucesso! ${resultado.mensagem}`)
    await carregarDados()
  } catch (error) {
    console.error('Erro no upload:', error)
  } finally {
    importando.value = false
    event.target.value = ''
  }
}

const escolherArquivo = () => {
  fileInput.value.click()
}

const abrirMenu = async (event, cliente) => {
  clienteSelecionado.value = cliente
  itensMenu.value = [
    {
      label: 'Editar Cliente',
      icon: 'pi pi-pencil',
      command: () => {
        formEdicao.value = { ...cliente }
        modalEditarVisivel.value = true
      },
    },
    {
      label: cliente.ativo ? 'Desativar' : 'Ativar',
      icon: cliente.ativo ? 'pi pi-trash' : 'pi pi-check',
      command: () => {
        const acao = cliente.ativo ? 'desativar' : 'ativar'
        if (confirm(`Deseja ${acao} o cliente ${cliente.id}?`)) {
          alternarStatus(cliente)
        }
      },
    },
  ]
  await nextTick()
  menuAcoes.value.toggle(event)
}

onMounted(() => {
  carregarDados()
})
</script>

<template>
  <main>

    <div class="app-body">

      <section class="content">
        <div id="header-actions">
          <Button
            label="Novo Cliente"
            icon="pi pi-user-plus"
            class="btn-primary"
            @click="modalClienteVisivel = true"
          />
          <Button
            label="Importar Planilha"
            icon="pi pi-upload"
            class="btn-import"
            :loading="importando"
            @click="escolherArquivo"
          />
          <Button
            label="Exportar Planilha"
            icon="pi pi-file-excel"
            class="btn-export"
            :loading="exportando"
            @click="exportarPlanilha"
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
            <h2 class="dashboard-title">Clientes Cadastrados</h2>
            <Button
              icon="pi pi-refresh"
              class="btn-refresh"
              outlined
              rounded
              @click="carregarDados"
            />
          </div>

          <DataTable :value="listaClientes" class="tabela-clientes">
            <Column field="razaoSocial" header="Razão Social"></Column>

            <Column header="CNPJ">
              <template #body="slotProps">
                {{ formatarCnpj(slotProps.data.cnpj) }}
              </template>
            </Column>

            <Column field="emailFinanceiro" header="Email financeiro"></Column>

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

    <ModalNovoCliente
      v-model:visible="modalClienteVisivel"
      :formCliente="formCliente"
      @salvar="criarCliente"
    />

    <!-- <ModalEditarCliente
        v-model:visible="modalEditarVisivel"
        :formEdicao="formEdicao"
        :salvandoEdicao="salvandoEdicao"
        @salvar="salverEdicao"
    /> -->

    <Menu ref="menuAcoes" :model="itensMenu" :popup="true" appendTo="body" />
  </main>
</template>
