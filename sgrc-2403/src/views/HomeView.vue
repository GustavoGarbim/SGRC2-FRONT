<script setup>
import './HomeView.css'

import AppHeader from '../components/layout/AppHeader.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import ModalNovoCliente from '../components/clientes/ModalNovoCliente.vue'
import ModalNovoContrato from '../components/contratos/ModalNovoContrato.vue'
import ModalEditarContrato from '../components/contratos/ModalEditarContrato.vue'

import 'primeicons/primeicons.css'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Menu from 'primevue/menu'

import { ref, onMounted, nextTick } from 'vue'

import { formatarMoeda, formatarCnpj } from '../utils/formatadores'
import { buscarTodosClientes, salvarNovoCliente } from '../services/clienteService'
import {
  buscarTodosContratos,
  salvarNovoContrato,
  atualizarContrato,
  alterarStatusContrato,
  gerarPlanilhaExcel,
  importarPlanilhaExcel,
} from '../services/contratoService'

const contratos = ref([])
const carregando = ref(false)
const fileInput = ref(null)
const importando = ref(false)
const contratoSelecionado = ref(null)
const menuAcoes = ref(null)
const itensMenu = ref([])

const modalEditarVisivel = ref(false)
const salvandoEdicao = ref(false)
const modalClienteVisivel = ref(false)
const modalContratoVisivel = ref(false)
const listaClientes = ref([])
const exportando = ref(false)
const abaAtiva = ref('clientes')

const formCliente = ref({
  razaoSocial: '',
  cnpj: '',
  emailFinanceiro: '',
  ativo: true,
})

const formContrato = ref({
  clienteId: null,
  numeroDocumento: '',
  dataInicio: new Date(),
  mesReajuste: 1,
  indiceAplicado: 'IPCA',
  valorAtual: 0,
  ativo: true,
})

const formEdicao = ref({
  id: 0,
  razaoSocialCliente: '',
  cnpjCliente: '',
  numeroDocumento: '',
  indiceAplicado: '',
  valorAtual: 0,
})

const carregarDados = async () => {
  try {
    carregando.value = true
    contratos.value = await buscarTodosContratos()
  } catch (err) {
    console.error('Erro na requisição: ', err)
    alert('Erro ao carregar dados. Verifique se o backend está rodando!')
  } finally {
    carregando.value = false
  }
}

const carregarClientes = async () => {
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
    formCliente.value = { razaoSocial: '', cnpj: '', emailFinanceiro: '', ativo: true }
    await carregarDados()
  } catch (error) {
    console.error('Erro ao criar cliente: ', error)
    alert('Erro ao criar o cliente. Verifique o console')
  }
}

const criarContrato = async () => {
  try {
    if (!formContrato.value.clienteId) return alert('Por favor, selecione um cliente primeiro.')
    await salvarNovoContrato(formContrato.value)
    alert('Contrato criado com sucesso!')
    formContrato.value = {
      clienteId: null,
      numeroDocumento: '',
      dataInicio: new Date(),
      mesReajuste: 1,
      indiceAplicado: 'IPCA',
      valorAtual: 0,
      ativo: true,
    }
    await carregarDados()
  } catch (error) {
    console.error('Erro ao criar contrato:', error)
    alert('Erro ao criar o contrato.')
  }
}

const salvarEdicao = async () => {
  salvandoEdicao.value = true
  try {
    await atualizarContrato(formEdicao.value.id, formEdicao.value)
    alert('Contrato atualizado com sucesso!')
    modalEditarVisivel.value = false
    await carregarDados()
  } catch (error) {
    console.error('Erro na edição:', error)
    alert('Erro ao salvar as alterações.')
  } finally {
    salvandoEdicao.value = false
  }
}

const alternarStatus = async (contrato) => {
  try {
    await alterarStatusContrato(contrato.id, !contrato.ativo)
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
      link.setAttribute('download', 'Relatorio_Contratos_SGRC.xlsx')
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

const abrirMenu = async (event, contrato) => {
  contratoSelecionado.value = contrato
  itensMenu.value = [
    {
      label: 'Editar Contrato',
      icon: 'pi pi-pencil',
      command: () => {
        formEdicao.value = { ...contrato }
        modalEditarVisivel.value = true
      },
    },
    {
      label: contrato.ativo ? 'Desativar' : 'Ativar',
      icon: contrato.ativo ? 'pi pi-trash' : 'pi pi-check',
      command: () => {
        const acao = contrato.ativo ? 'desativar' : 'ativar'
        if (confirm(`Deseja ${acao} o contrato ${contrato.id}?`)) {
          alternarStatus(contrato)
        }
      },
    },
  ]
  await nextTick()
  menuAcoes.value.toggle(event)
}

onMounted(() => {
  carregarDados()
  carregarClientes()
})
</script>

<template>
  <main>
    <AppHeader />

    <div class="app-body">
      <AppSidebar :abaAtiva="abaAtiva" @mudarAba="abaAtiva = $event" />

      <section class="content">
        <div id="header-actions">
          <Button
            label="Novo Cliente"
            icon="pi pi-user-plus"
            class="btn-primary"
            @click="modalClienteVisivel = true"
          />
          <Button
            label="Novo Contrato"
            icon="pi pi-file-plus"
            class="btn-primary"
            @click="modalContratoVisivel = true"
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
            <h2 class="dashboard-title">Contratos Cadastrados</h2>
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

    <ModalNovoCliente
      v-model:visible="modalClienteVisivel"
      :formCliente="formCliente"
      @salvar="criarCliente"
    />

    <ModalNovoContrato
      v-model:visible="modalContratoVisivel"
      :formContrato="formContrato"
      :listaClientes="listaClientes"
      @salvar="criarContrato"
    />

    <ModalEditarContrato
      v-model:visible="modalEditarVisivel"
      :formEdicao="formEdicao"
      :salvandoEdicao="salvandoEdicao"
      @salvar="salvarEdicao"
    />

    <Menu ref="menuAcoes" :model="itensMenu" :popup="true" appendTo="body" />
  </main>
</template>
