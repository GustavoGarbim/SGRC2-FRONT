import { API_BASE_URL } from "./api";

export const buscarTodosClientes = async () => {
  const response = await fetch(`${API_BASE_URL}/Cliente`);
  if (!response.ok) throw new Error("Falha ao buscar os clientes");
  return await response.json();
};

export const salvarNovoCliente = async (dados) => {
  const response = await fetch(`${API_BASE_URL}/Cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!response.ok) throw new Error("Falha ao criar o cliente.");
  return response;
};

export const buscarClientePorCnpj = async (cnpj) => {
  const response = await fetch(`${API_BASE_URL}/Cliente/BuscarPorCnpj`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cnpj),
  });
  if (!response.ok) throw new Error("Não foi possível encontrar o cliente.");
  return response;
};

export const ativarCliente = async (id) => {
  const response = await fetch(`${API_BASE_URL}/AtivarCliente/${id}`);
  if(!response.ok) throw new Error("Não foi possivel ativar o cliente.");
  return response;
}

export const alterarStatusCliente = async (id, ativar) => {
  const url = ativar
    ? `${API_BASE_URL}/Cliente/AtivarCliente/${id}`
    : `${API_BASE_URL}/Cliente/${id}`;
  const method = ativar ? "POST" : "DELETE";

  const response = await fetch(url, { method });
  if (!response.ok)
    throw new Error(`Falha ao ${ativar ? "ativar" : "desativar"} cliente.`);
  return response;
};

export const gerarPlanilhaExcel = async () => {
  const response = await fetch(`${API_BASE_URL}/Cliente/exportar`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("Falha ao gerar o arquivo Excel.");
  return await response.blob();
};

export const importarPlanilhaExcel = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/Importacao/upload-excel`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Falha ao processar planilha.");
  return await response.json();
};