export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

export const formatarCnpj = (cnpj) => {
  if (!cnpj) return ''
  return String(cnpj).replace(/\"/g, '')
}