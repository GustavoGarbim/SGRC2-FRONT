import { API_BASE_URL } from './api'

export const buscarTodosContratos = async () => {
  const response = await fetch(`${API_BASE_URL}/Contrato`)
  if (!response.ok) throw new Error('Falha ao buscar dados do servidor')
  return await response.json()
}

export const salvarNovoContrato = async (dados) => {
  const response = await fetch(`${API_BASE_URL}/Contrato`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!response.ok) throw new Error('Falha ao criar o contrato.')
  return response
}

export const atualizarContrato = async (id, dados) => {
  const response = await fetch(`${API_BASE_URL}/Contrato/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!response.ok) throw new Error('Falha ao atualizar o contrato.')
  return response
}

export const alterarStatusContrato = async (id, ativar) => {
  const url = ativar ? `${API_BASE_URL}/Contrato/AtivarContrato/${id}` : `${API_BASE_URL}/Contrato/${id}`
  const method = ativar ? 'POST' : 'DELETE'

  const response = await fetch(url, { method })
  if (!response.ok) throw new Error(`Falha ao ${ativar ? 'ativar' : 'desativar'} contrato.`)
  return response
}

export const gerarPlanilhaExcel = async () => {
  const response = await fetch(`${API_BASE_URL}/Contrato/exportar`, { method: 'GET' })
  if (!response.ok) throw new Error('Falha ao gerar o arquivo Excel.')
  return await response.blob()
}

export const importarPlanilhaExcel = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/Importacao/upload-excel`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) throw new Error('Falha ao processar planilha.')
  return await response.json()
}