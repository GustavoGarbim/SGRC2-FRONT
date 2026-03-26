<script setup>
import './HomeView.css'

import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import 'primeicons/primeicons.css'
import Menu from 'primevue/menu'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'

import { ref, onMounted, nextTick } from 'vue'

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

const carregarClientes = async () => {
  try {
    const response = await fetch('http://localhost:5033/api/Cliente')

    if (!response.ok) {
      throw new Error('Falha ao buscar os clientes')
    }

    const data = await response.json()
    listaClientes.value = data
  } catch (error) {
    console.error('Erro ao carregar lista de clientes:', error)
  }
}

const abrirMenu = async (event, contrato) => {
  contratoSelecionado.value = contrato

  itensMenu.value = [
    {
      label: 'Editar Contrato',
      icon: 'pi pi-pencil',
      command: () => {
        formEdicao.value = {
          id: contratoSelecionado.value.id,
          razaoSocialCliente: contratoSelecionado.value.razaoSocialCliente,
          cnpjCliente: contratoSelecionado.value.cnpjCliente,
          numeroDocumento: contratoSelecionado.value.numeroDocumento,
          indiceAplicado: contratoSelecionado.value.indiceAplicado,
          valorAtual: contratoSelecionado.value.valorAtual,
        }
        modalEditarVisivel.value = true
      },
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

const salvarEdicao = async () => {
  salvandoEdicao.value = true

  try {
    const response = await fetch(`http://localhost:5033/api/Contrato/${formEdicao.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formEdicao.value),
    })

    if (!response.ok) {
      throw new Error('Falha ao atualizar o contrato.')
    }

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

const criarCliente = async () => {
  try {
    const response = await fetch('http://localhost:5033/api/Cliente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formCliente.value),
    })

    if (!response.ok) {
      throw new Error('Falha ao criar o cliente.')
    }
    alert('Cliente criado com sucesso!')

    formCliente.value = { razaoSocial: '', cnpj: '', emailFinanceiro: '', ativo: true }
    await carregarDados()
  } catch (error) {
    console.error('Erro ao criar cliente: ', error)
    alert('Erro ao criar o cliente. Verefique o console')
  }
}

const exportarPlanilha = async () => {
  exportando.value = true

  try {
    const response = await fetch('http://localhost:5033/api/Contrato/exportar', {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Falha ao gerar o arquivo Excel.')
    }

    const blob = await response.blob()

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Relatorio_Contratos_SGRC.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro na exportação:', error)
    alert('Erro ao exportar a planilha. Verifique se o Back-end está rodando.')
  } finally {
    exportando.value = false
  }
}

const criarContrato = async () => {
  try {
    if (!formContrato.value.clienteId) {
      alert('Por favor, selecione um cliente primeiro.')
      return
    }

    const response = await fetch('http://localhost:5033/api/Contrato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/\json' },
      body: JSON.stringify(formContrato.value),
    })
    if (!response.ok) {
      throw new Error('Falha ao criar o contato.')
    }
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
  carregarClientes()
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
      <nav id="side-bar">
        <div class="menu-lateral">
          <div
            class="menu-item"
            :class="{ 'menu-ativo': abaAtiva === 'contratos' }"
            @click="abaAtiva = 'contratos'"
          >
            <i class="pi pi-file"></i>
            <span>Contratos</span>
          </div>

          <div
            class="menu-item"
            :class="{ 'menu-ativo': abaAtiva === 'clientes' }"
            @click="abaAtiva = 'clientes'"
          >
            <i class="pi pi-users"></i>
            <span>Clientes</span>
          </div>
        </div>
      </nav>

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

    <Dialog
      v-model:visible="modalClienteVisivel"
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
        <Button label="Cancelar" icon="pi pi-times" text @click="modalClienteVisivel = false" />
        <Button
          label="Salvar Cliente"
          icon="pi pi-check"
          class="btn-primary"
          @click="criarCliente"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="modalContratoVisivel"
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
        <Button label="Cancelar" icon="pi pi-times" text @click="modalContratoVisivel = false" />
        <Button
          label="Salvar Contrato"
          icon="pi pi-check"
          class="btn-primary"
          @click="criarContrato"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="modalEditarVisivel"
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
        <Button label="Cancelar" icon="pi pi-times" text @click="modalEditarVisivel = false" />
        <Button
          label="Salvar Alterações"
          icon="pi pi-check"
          class="btn-primary"
          @click="salvarEdicao"
          :loading="salvandoEdicao"
        />
      </template>
    </Dialog>

    <Menu ref="menuAcoes" :model="itensMenu" :popup="true" appendTo="body" />
  </main>
</template>
