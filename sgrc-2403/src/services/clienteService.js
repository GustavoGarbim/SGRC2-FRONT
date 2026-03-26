import { API_BASE_URL } from './api'

export const buscarTodosClientes = async () => {
  const response = await fetch(`${API_BASE_URL}/Cliente`)
  if (!response.ok) throw new Error('Falha ao buscar os clientes')
  return await response.json()
}

export const salvarNovoCliente = async (dados) => {
  const response = await fetch(`${API_BASE_URL}/Cliente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  if (!response.ok) throw new Error('Falha ao criar o cliente.')
  return response
}